import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";

function parseNumber(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized);
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = values[idx] || ""));
    rows.push(row);
  }
  return rows;
}

function detectDate(row: Record<string, string>): string | null {
  const raw = row["date"] || row["datum"] || row["buchungsdatum"] || row["valuta"] || "";
  if (!raw) return null;
  // Accept ISO or dd.mm.yyyy / dd/mm/yyyy
  const parts = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (parts) {
    const d = parts[1].padStart(2, "0");
    const m = parts[2].padStart(2, "0");
    const y = parts[3].length === 2 ? `20${parts[3]}` : parts[3];
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return null;
}

function detectDescription(row: Record<string, string>): string {
  return (
    row["description"] ||
    row["verwendungszweck"] ||
    row["zweck"] ||
    row["buchungstext"] ||
    row["vorgang"] ||
    row["name"] ||
    ""
  );
}

function detectAmount(row: Record<string, string>): number | null {
  const raw =
    row["amount"] ||
    row["betrag"] ||
    row["soll"] ||
    row["haben"] ||
    row["umsatz"] ||
    "";
  if (!raw) return null;
  const value = parseNumber(raw);
  if (isNaN(value)) return null;
  return value;
}

export function registerBankImportRoutes(app: any) {
  const router = Router();

  router.post("/finance/import", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const { accountId, csv, season } = req.body || {};
    if (!accountId || !csv || typeof csv !== "string") {
      return res.status(400).json({ message: "Konto-ID und CSV erforderlich" });
    }
    const account = await storage.getAccountById?.(Number(accountId));
    if (!account) return res.status(404).json({ message: "Konto nicht gefunden" });

    const rows = parseCsv(csv);
    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      const date = detectDate(row);
      const amount = detectAmount(row);
      const description = detectDescription(row);
      if (!date || amount === null || !description) {
        skipped++;
        continue;
      }
      await storage.createTransaction({
        accountId: Number(accountId),
        date,
        amount: Math.abs(amount),
        description,
        type: amount >= 0 ? "income" : "expense",
        season: season || undefined,
        createdAt: new Date().toISOString(),
      } as any);
      created++;
    }

    res.json({ created, skipped, total: rows.length });
  });

  app.use("/api", router);
}

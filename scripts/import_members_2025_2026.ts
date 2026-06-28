/**
 * One-off import: Mitgliederliste 2025-2026 (mit Random-No / Card-ID) -> data.db
 *
 * Usage (from Vereins-OS root):
 *   npx tsx scripts/import_members_2025_2026.ts "/absolute/path/to/MEMBERSLESCHT.xlsx"
 *
 * Idempotent: members are matched by card_id (Random-No). Existing entries are updated,
 * new ones inserted. Demo members without a card_id are left untouched.
 */
import * as XLSX from "xlsx";
import Database from "better-sqlite3";
import path from "node:path";
import { readFileSync } from "node:fs";

const SHEET_HINT = "membres"; // first sheet whose name contains this wins
const DEFAULT_XLSX =
  "/Users/netjogger58/Desktop/GC 2026-06-25-MEMBERSLESCHT 2025-2026-MAT-KAARTEN.xlsx";

const normalize = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function findCol(headers: string[], patterns: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = normalize(headers[i]);
    if (h && patterns.some((p) => h.includes(p))) return i;
  }
  return -1;
}

// Strip Excel placeholders used throughout the sheet for "no data"
function clean(v: string): string {
  const s = v.trim();
  if (!s) return "";
  if (/^\/+$/.test(s)) return ""; // "///"
  if (/^(na|n\/a)$/i.test(s)) return ""; // "NA"
  return s;
}

function rawCell(row: unknown[], idx: number): string {
  if (idx < 0) return "";
  return String(row[idx] ?? "").trim();
}

function cell(row: unknown[], idx: number): string {
  return clean(rawCell(row, idx));
}

function parseBirthdate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  // DD.MM.YYYY or DD/MM/YYYY (allow 2-digit year)
  const m = s.match(/^(\d{1,2})[.\/\s](\d{1,2})[.\/\s](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    let year = parseInt(y, 10);
    if (year < 100) year += year > 30 ? 1900 : 2000;
    const dd = d.padStart(2, "0");
    const mm = mo.padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }
  // Excel serial
  if (/^\d{4,6}$/.test(s)) {
    const n = parseInt(s, 10);
    if (n > 10000 && n < 60000) {
      const dt = new Date((n - 25569) * 86400 * 1000);
      if (!isNaN(dt.getTime())) return dt.toISOString().split("T")[0];
    }
  }
  return null;
}

function main() {
  const xlsxPath = process.argv[2] || DEFAULT_XLSX;
  const dbPath = path.resolve(process.cwd(), "data.db");
  console.log(`[import] Excel: ${xlsxPath}`);
  console.log(`[import] DB:    ${dbPath}`);

  const wb = XLSX.read(readFileSync(xlsxPath), { type: "buffer" });
  const sheetName =
    wb.SheetNames.find((n) => normalize(n).includes(SHEET_HINT)) || wb.SheetNames[0];
  console.log(`[import] Sheet: "${sheetName}"`);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    raw: false,
  }) as unknown[][];
  if (rows.length < 2) throw new Error("Sheet hat zu wenig Zeilen");

  const headers = (rows[0] || []).map((h) => String(h ?? ""));

  // Exact header match helper (for ambiguous duplicate-ish headers)
  const findExact = (names: string[]) => {
    const set = names.map(normalize);
    for (let i = 0; i < headers.length; i++) {
      if (set.includes(normalize(headers[i]))) return i;
    }
    return -1;
  };

  // Resolve columns by header text (robust against re-ordering)
  const COL = {
    lastName: 0, // first column header is blank in this sheet -> NOM
    firstName: findCol(headers, ["prenom"]),
    cardId: findCol(headers, ["random-no", "random no", "randomno"]),
    nationality: findCol(headers, ["langue", "nationalite"]),
    address: findCol(headers, ["adresse"]),
    postal: findCol(headers, ["code postale", "code postal", "postale"]),
    locality: findCol(headers, ["localite"]),
    internalCat: findCol(headers, ["categorie interne"]),
    flhCat: findCol(headers, ["categorie listing"]),
    birth: findCol(headers, ["naissance"]),
    matricule: findExact(["matricule"]),
    medico: findCol(headers, ["medico"]),
    joinDate: findCol(headers, ["debut membre", "date debut membre"]),
    gsm: findCol(headers, ["gsm"]),
    tel: findExact(["tel."]),
    email: findCol(headers, ["email", "mail"]),
    passNumber: findCol(headers, ["pass nummer", "pass numero"]),
    comite: findExact(["comite"]),
    officiel: findExact(["officiel"]),
    entraineur: findCol(headers, ["entraineur"]),
    arbitre: findExact(["cat_arbitre", "cat arbitre"]),
  };
  // If firstName auto-detected as column 0, fix lastName fallback
  if (COL.firstName === 0) COL.lastName = 1;

  // U-flag columns -> team categories (e.g. U13H). Only the CURRENT season set
  // (before the "FLH 2026-2027" listing header); the sheet repeats them for next season.
  const U_FLAGS = ["u17h", "u15h", "u13h", "u11m", "u9m", "u7m", "u17f", "u15f", "u13f"];
  const nextSeasonCol = findCol(headers, ["2026-2027", "2026 -2027"]);
  const uflagCols: { idx: number; label: string }[] = [];
  for (let i = 0; i < headers.length; i++) {
    if (nextSeasonCol > 0 && i >= nextSeasonCol) break; // skip 2026-2027 block
    if (U_FLAGS.includes(normalize(headers[i]))) {
      uflagCols.push({ idx: i, label: headers[i].trim().toUpperCase() });
    }
  }
  console.log("[import] Spalten:", COL, "| U-Flags:", uflagCols.map((u) => u.label));

  function deriveFunction(row: unknown[]): string {
    if (cell(row, COL.comite)) return "Comité";
    if (cell(row, COL.entraineur)) return "Entraîneur";
    if (cell(row, COL.arbitre)) return "Arbitre";
    if (cell(row, COL.officiel)) return "Officiel";
    if (uflagCols.some((u) => cell(row, u.idx)) || cell(row, COL.passNumber)) return "Spieler";
    return "Mitglied";
  }

  function deriveTeamCategory(row: unknown[]): string | null {
    const hits = [...new Set(uflagCols.filter((u) => cell(row, u.idx)).map((u) => u.label))];
    return hits.length ? hits.join(",") : null;
  }

  function buildRawData(row: unknown[]): string {
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c].replace(/\r?\n/g, " ").trim();
      if (!key) continue;
      const v = cell(row, c);
      if (v) obj[key] = v;
    }
    return JSON.stringify(obj);
  }

  function buildAddress(row: unknown[]): string | null {
    const a = cell(row, COL.address);
    const plz = cell(row, COL.postal);
    const loc = cell(row, COL.locality);
    const line2 = [plz, loc].filter(Boolean).join(" ");
    const full = [a, line2].filter(Boolean).join(", ");
    return full || null;
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 8000");

  // Ensure columns exist (in case server hasn't migrated yet)
  const cols = db.prepare(`PRAGMA table_info(members)`).all() as { name: string }[];
  const has = (c: string) => cols.some((x) => x.name === c);
  const ensure = (c: string) => {
    if (!has(c)) db.exec(`ALTER TABLE members ADD COLUMN ${c} TEXT`);
  };
  for (const c of [
    "card_id", "club_function", "nationality", "internal_category", "flh_category",
    "team_category", "pass_number", "matricule", "medico_next", "join_date", "raw_data",
  ]) ensure(c);
  db.exec(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_members_card_id ON members(card_id) WHERE card_id IS NOT NULL`
  );

  const findByCard = db.prepare(`SELECT id FROM members WHERE card_id = ?`);
  const insertStmt = db.prepare(`
    INSERT INTO members (name, email, phone, birthdate, address, license_number,
      membership_status, card_id, club_function, nationality, internal_category,
      flh_category, team_category, pass_number, matricule, medico_next, join_date, raw_data)
    VALUES (@name, @email, @phone, @birthdate, @address, @license,
      'active', @cardId, @clubFunction, @nationality, @internalCategory,
      @flhCategory, @teamCategory, @passNumber, @matricule, @medicoNext, @joinDate, @rawData)
  `);
  const updateStmt = db.prepare(`
    UPDATE members SET name=@name, email=@email, phone=@phone, birthdate=@birthdate,
      address=@address, license_number=@license, club_function=@clubFunction,
      nationality=@nationality, internal_category=@internalCategory, flh_category=@flhCategory,
      team_category=@teamCategory, pass_number=@passNumber, matricule=@matricule,
      medico_next=@medicoNext, join_date=@joinDate, raw_data=@rawData
    WHERE id=@id
  `);

  let inserted = 0,
    updated = 0,
    skipped = 0;

  const tx = db.transaction(() => {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const last = cell(row, COL.lastName);
      const first = cell(row, COL.firstName);
      const cardId = cell(row, COL.cardId);
      if (!last && !first) {
        skipped++;
        continue;
      }
      const name = [last, first].filter(Boolean).join(" ");
      const rec = {
        name,
        email: cell(row, COL.email) || null,
        phone: cell(row, COL.gsm) || cell(row, COL.tel) || null,
        birthdate: parseBirthdate(cell(row, COL.birth)),
        address: buildAddress(row),
        license: cell(row, COL.passNumber) || null,
        cardId: cardId || null,
        clubFunction: deriveFunction(row),
        nationality: cell(row, COL.nationality) || null,
        internalCategory: cell(row, COL.internalCat) || null,
        flhCategory: cell(row, COL.flhCat) || null,
        teamCategory: deriveTeamCategory(row),
        passNumber: cell(row, COL.passNumber) || null,
        matricule: cell(row, COL.matricule) || null,
        medicoNext: cell(row, COL.medico) || null,
        joinDate: parseBirthdate(cell(row, COL.joinDate)) || cell(row, COL.joinDate) || null,
        rawData: buildRawData(row),
      };

      const existing = cardId ? (findByCard.get(cardId) as { id: number } | undefined) : undefined;
      if (existing) {
        updateStmt.run({ ...rec, id: existing.id });
        updated++;
      } else {
        insertStmt.run(rec);
        inserted++;
      }
    }
  });
  tx();

  const total = db.prepare(`SELECT COUNT(*) c FROM members WHERE card_id IS NOT NULL`).get() as {
    c: number;
  };
  db.close();

  console.log(
    `[import] fertig: ${inserted} neu, ${updated} aktualisiert, ${skipped} leere Zeilen übersprungen.`
  );
  console.log(`[import] Mitglieder mit Random-No in DB: ${total.c}`);
}

main();

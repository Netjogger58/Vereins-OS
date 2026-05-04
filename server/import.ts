import type { Express, Response } from "express";
import type { Request } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { requireAuth, type AuthedRequest } from "./auth";
import { type Member } from "@shared/schema";

// Multer config for memory storage (no disk writes)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Helper: normalize strings for matching
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Column matchers
const COLUMN_PATTERNS: Record<string, string[]> = {
  firstName: ["vorname", "firstname", "givenname", "prénom", "prenom"],
  lastName: ["nachname", "lastname", "surname", "familienname", "name", "nom", "nomdefamille"],
  fullName: ["name", "vollständigername", "fullname", "complete", "spieler", "member", "mitglied"],
  birthDate: ["geburt", "birth", "birthdate", "geburtsdatum", "dateofbirth", "dob", "naissance", "datenaissance"],
  email: ["email", "e-mail", "mail", "adressemail"],
  phone: ["telefon", "phone", "tel", "mobile", "handy", "portable", "telephone"],
  address: ["adresse", "address", "straße", "street", "ort", "city", "plz", "zip"],
  team: ["team", "mannschaft", "équipe", "category", "kategorie", "abteilung"],
  license: ["lizenz", "license", "licence", "lizenznummer", "licencenumber"],
  status: ["status", "mitgliedsstatus", "membership", "aktiv", "state"],
  parentName: ["eltern", "parent", "erziehungsberechtigter", "tuteur", "parentname"],
  parentPhone: ["telefon eltern", "elterntelefon", "parentphone", "telparent"],
  parentEmail: ["email eltern", "elternemail", "parentemail", "mailparent"],
  note: ["notiz", "note", "bemerkung", "comment", "commentaire", "info"],
  joinDate: ["eintritt", "joindate", "beitritt", "eintrittsdatum", "joined"],
  role: ["rolle", "role", "funktion", "position"],
};

function detectColumns(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  const used = new Set<number>();

  for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
    for (let i = 0; i < headers.length; i++) {
      if (used.has(i)) continue;
      const h = normalize(headers[i] || "");
      if (patterns.some((p) => h.includes(normalize(p)))) {
        mapping[field] = i;
        used.add(i);
        break;
      }
    }
  }

  // Fallback: if no first/last name but full name detected
  if (!mapping.firstName && !mapping.lastName && mapping.fullName !== undefined) {
    // keep fullName for later splitting
  }

  return mapping;
}

function parseDate(val: unknown): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
  const s = String(val).trim();
  if (!s) return undefined;

  // Try DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (dmy) {
    const d = new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]));
    return isNaN(d.getTime()) ? undefined : d;
  }

  // Try YYYY-MM-DD
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const d = new Date(parseInt(ymd[1]), parseInt(ymd[2]) - 1, parseInt(ymd[3]));
    return isNaN(d.getTime()) ? undefined : d;
  }

  // Try Excel serial number
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    if (n > 30000 && n < 50000) {
      // Excel date serial
      const d = new Date((n - 25569) * 86400 * 1000);
      return isNaN(d.getTime()) ? undefined : d;
    }
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

function parseTeamName(val: unknown): string | undefined {
  if (!val) return undefined;
  const s = String(val).trim();
  if (!s || s.toLowerCase() === "null") return undefined;
  return s;
}

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const lastName = parts.pop() || "";
  return { firstName: parts.join(" "), lastName };
}

export function registerImportRoutes(app: Express) {
  // Analyze Excel structure (preview first sheet)
  app.post("/api/import/analyze", requireAuth, upload.single("file"), async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Keine Datei hochgeladen" });
      if (!req.user || !["präsident", "admin", "secretaire"].includes(req.user.role)) {
        return res.status(403).json({ message: "Keine Berechtigung" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length === 0) {
        return res.status(400).json({ message: "Keine Sheets gefunden" });
      }

      // Analyze first sheet only for preview
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false }) as string[][];

      if (json.length === 0) {
        return res.status(400).json({ message: "Leeres Sheet" });
      }

      const headers = json[0].map((h) => String(h || "").trim());
      const mapping = detectColumns(headers);
      const preview = json.slice(1, 6); // 5 data rows

      res.json({
        sheets: sheetNames,
        selectedSheet: sheetNames[0],
        headers,
        mapping,
        preview,
        totalRows: json.length - 1,
      });
    } catch (err) {
      console.error("Import analyze error:", err);
      res.status(500).json({ message: "Fehler beim Analysieren der Datei" });
    }
  });

  // Import members from selected sheet
  app.post("/api/import/members", requireAuth, upload.single("file"), async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Keine Datei hochgeladen" });
      if (!req.user || !["präsident", "admin", "secretaire"].includes(req.user.role)) {
        return res.status(403).json({ message: "Keine Berechtigung" });
      }

      const { sheetName, mapping, skipFirstRow = true } = req.body || {};

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const targetSheet = sheetName && workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0];
      const sheet = workbook.Sheets[targetSheet];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as unknown[][];

      if (json.length < 2) {
        return res.status(400).json({ message: "Zu wenig Daten" });
      }

      const headers = (json[0] || []).map((h) => String(h || "").trim());
      const colMap = mapping || detectColumns(headers);

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as string[],
        teamsCreated: 0,
      };

      // Pre-load existing teams
      const existingTeams = await storage.listTeams();
      const teamMap = new Map<string, number>();
      for (const t of existingTeams) {
        teamMap.set(normalize(t.name), t.id);
      }

      const getTeamId = async (teamName: string | undefined): Promise<number | undefined> => {
        if (!teamName) return undefined;
        const key = normalize(teamName);
        if (teamMap.has(key)) return teamMap.get(key);

        // Create new team
        try {
          const newTeam = await storage.createTeam({
            name: teamName,
            category: "other",
            trainerId: undefined,
          });
          teamMap.set(key, newTeam.id);
          results.teamsCreated++;
          return newTeam.id;
        } catch (e) {
          return undefined;
        }
      };

      const startRow = skipFirstRow ? 1 : 0;

      for (let i = startRow; i < json.length; i++) {
        const row = json[i];
        if (!row || row.every((c) => !c)) continue;

        try {
          let firstName = "";
          let lastName = "";

          if (colMap.firstName !== undefined) {
            firstName = String(row[colMap.firstName] || "").trim();
          }
          if (colMap.lastName !== undefined) {
            lastName = String(row[colMap.lastName] || "").trim();
          }

          // Fallback: split full name
          if (!firstName && !lastName && colMap.fullName !== undefined) {
            const full = String(row[colMap.fullName] || "").trim();
            if (full) {
              const split = splitFullName(full);
              firstName = split.firstName;
              lastName = split.lastName;
            }
          }

          if (!firstName && !lastName) {
            results.skipped++;
            continue;
          }

          const email = colMap.email !== undefined ? String(row[colMap.email] || "").trim() || undefined : undefined;
          const phone = colMap.phone !== undefined ? String(row[colMap.phone] || "").trim() || undefined : undefined;
          const address = colMap.address !== undefined ? String(row[colMap.address] || "").trim() || undefined : undefined;
          const license = colMap.license !== undefined ? String(row[colMap.license] || "").trim() || undefined : undefined;
          const note = colMap.note !== undefined ? String(row[colMap.note] || "").trim() || undefined : undefined;
          const rawTeam = colMap.team !== undefined ? parseTeamName(row[colMap.team]) : undefined;
          const teamId = rawTeam ? await getTeamId(rawTeam) : undefined;
          const birthDate = colMap.birthDate !== undefined ? parseDate(row[colMap.birthDate]) : undefined;
          const joinDate = colMap.joinDate !== undefined ? parseDate(row[colMap.joinDate]) : undefined;

          const parentName = colMap.parentName !== undefined ? String(row[colMap.parentName] || "").trim() || undefined : undefined;
          const parentPhone = colMap.parentPhone !== undefined ? String(row[colMap.parentPhone] || "").trim() || undefined : undefined;
          const parentEmail = colMap.parentEmail !== undefined ? String(row[colMap.parentEmail] || "").trim() || undefined : undefined;

          // Default status from Excel or "active"
          let status: "active" | "inactive" | "pending" = "active";
          if (colMap.status !== undefined) {
            const s = String(row[colMap.status] || "").toLowerCase();
            if (s.includes("inaktiv") || s.includes("inactive")) status = "inactive";
            else if (s.includes("wartend") || s.includes("pending")) status = "pending";
          }

          // Check for duplicate by email or name+phone
          let duplicate = false;
          const allMembers = await storage.listMembers();
          if (email) {
            const existing = allMembers.find(m => m.email?.toLowerCase() === email.toLowerCase());
            if (existing) duplicate = true;
          }
          if (!duplicate && phone) {
            const fullName = `${firstName} ${lastName}`.trim();
            const match = allMembers.find(
              (m: Member) =>
                m.name?.toLowerCase() === fullName.toLowerCase() &&
                m.phone === phone
            );
            if (match) duplicate = true;
          }

          if (duplicate) {
            results.skipped++;
            continue;
          }

          const fullName = `${firstName} ${lastName}`.trim();
          await storage.createMember({
            name: fullName,
            email: email,
            phone: phone,
            address: address,
            birthdate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
            licenseNumber: license,
            teamId: teamId,
            membershipStatus: status,
            photoUrl: undefined,
            faceDescriptor: undefined,
            userId: undefined,
          });

          results.imported++;
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          results.errors.push(`Zeile ${i + 1}: ${errMsg}`);
          if (results.errors.length > 20) break; // Limit errors
        }
      }

      res.json(results);
    } catch (err) {
      console.error("Import error:", err);
      res.status(500).json({ message: "Fehler beim Importieren" });
    }
  });
}

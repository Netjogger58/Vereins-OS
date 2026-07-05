/**
 * One-off import der 3 Zusatz-Arbeitsmappen aus der MEMBERSLESCHT-Excel -> data.db
 *
 *   1) "Donateurs-Benevoles-Sponsors"  -> NEUE aktive Mitglieder (member_type donateur,
 *      Bénévole als Funktion), mit Doublon-Check (Name / Matricule).
 *   2) "Annulés"                        -> EHEMALIGE Mitglieder (membership_status = 'ehemalig'),
 *      mit Annulé-Jahr, Doublon-Check gegen bestehende Mitglieder.
 *   3) "Médico 2026"                    -> UPDATE bestehender Mitglieder: medico_next
 *      (Match über Matricule / Pass / Name). Legt KEINE neuen Mitglieder an.
 *
 * Idempotent: mehrfaches Ausführen fügt keine Duplikate hinzu (Name/Matricule-Abgleich)
 * und aktualisiert medico_next nur.
 *
 * Usage (aus Vereins-OS root):
 *   npx tsx scripts/import_extra_sheets.ts ["/pfad/zur/MEMBERSLESCHT.xlsx"]
 */
import * as XLSX from "xlsx";
import Database from "better-sqlite3";
import path from "node:path";
import { readFileSync } from "node:fs";

const DEFAULT_XLSX =
  "/Users/netjogger58/CascadeProjects/GC 2026-07-01-MEMBERSLESCHT 2026-2027 (base de départ nouvelle Saison).xlsx";

// ─── Helpers ─────────────────────────────────────────────
const norm = (s: unknown) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const normName = (last: string, first: string) => `${norm(last)}|${norm(first)}`;
const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "");

function clean(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (/^\/+$/.test(s)) return "";
  if (/^(na|n\/a)$/i.test(s)) return "";
  return s;
}
function cell(row: unknown[], idx: number): string {
  if (idx < 0) return "";
  return clean(row[idx]);
}
function titleCase(s: string): string {
  return s.toLowerCase().replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}
function parseBirthdate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  const m = s.match(/^(\d{1,2})[.\/\s](\d{1,2})[.\/\s](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    let year = parseInt(y, 10);
    if (year < 100) year += year > 30 ? 1900 : 2000;
    return `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4,6}$/.test(s)) {
    const n = parseInt(s, 10);
    if (n > 10000 && n < 60000) {
      const dt = new Date((n - 25569) * 86400 * 1000);
      if (!isNaN(dt.getTime())) return dt.toISOString().split("T")[0];
    }
  }
  return null;
}
function sheet(wb: XLSX.WorkBook, name: string): unknown[][] {
  const sh = wb.Sheets[name];
  if (!sh) throw new Error(`Sheet fehlt: "${name}"`);
  return XLSX.utils.sheet_to_json(sh, { header: 1, raw: false }) as unknown[][];
}
function buildRawData(headers: string[], row: unknown[]): string {
  const obj: Record<string, string> = {};
  for (let c = 0; c < headers.length; c++) {
    const key = String(headers[c] ?? "").replace(/\r?\n/g, " ").trim();
    if (!key) continue;
    const v = cell(row, c);
    if (v) obj[key] = v;
  }
  return JSON.stringify(obj);
}

// ─── Main ────────────────────────────────────────────────
function main() {
  const xlsxPath = process.argv[2] || DEFAULT_XLSX;
  const dbPath = path.resolve(process.cwd(), "data.db");
  console.log(`[extra] Excel: ${xlsxPath}`);
  console.log(`[extra] DB:    ${dbPath}`);

  const wb = XLSX.read(readFileSync(xlsxPath), { type: "buffer" });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 8000");

  // Bestehende Mitglieder laden (für Doublon-Check + Médico-Match)
  type Ex = { id: number; name: string; first_name: string; last_name: string; matricule: string; pass_number: string; license_number: string };
  const existing = db.prepare(
    "SELECT id, name, COALESCE(first_name,'') first_name, COALESCE(last_name,'') last_name, COALESCE(matricule,'') matricule, COALESCE(pass_number,'') pass_number, COALESCE(license_number,'') license_number FROM members"
  ).all() as Ex[];

  const byName = new Map<string, Ex>();
  const byMatricule = new Map<string, Ex>();
  const byPass = new Map<string, Ex>();
  for (const e of existing) {
    byName.set(normName(e.last_name || e.name, e.first_name), e);
    const mt = digits(e.matricule);
    if (mt.length >= 8) byMatricule.set(mt, e);
    const ps = norm(e.pass_number || e.license_number);
    if (ps) byPass.set(ps, e);
  }
  const findExisting = (last: string, first: string, matricule: string, pass: string): Ex | undefined => {
    const mt = digits(matricule);
    if (mt.length >= 8 && byMatricule.has(mt)) return byMatricule.get(mt);
    const ps = norm(pass);
    if (ps && byPass.has(ps)) return byPass.get(ps);
    return byName.get(normName(last, first));
  };

  const insertStmt = db.prepare(`
    INSERT INTO members (name, first_name, last_name, email, phone, birthdate, address,
      license_number, membership_status, club_function, nationality, internal_category,
      flh_category, pass_number, matricule, medico_next, join_date, raw_data,
      cat_code, member_type, family_code)
    VALUES (@name, @firstName, @lastName, @email, @phone, @birthdate, @address,
      @license, @status, @clubFunction, @nationality, @internalCategory,
      @flhCategory, @passNumber, @matricule, @medicoNext, @joinDate, @rawData,
      @catCode, @memberType, @familyCode)
  `);
  const insertFn = db.prepare(
    "INSERT INTO member_functions (member_id, function, note) VALUES (?, ?, ?)"
  );

  const registerNew = (e: Ex) => {
    existing.push(e);
    byName.set(normName(e.last_name, e.first_name), e);
    const mt = digits(e.matricule);
    if (mt.length >= 8) byMatricule.set(mt, e);
  };

  const buildAddress = (a: string, plz: string, loc: string) => {
    const line2 = [plz, loc].filter(Boolean).join(" ");
    return [a, line2].filter(Boolean).join(", ") || null;
  };

  // ── 1) Donateurs-Benevoles-Sponsors ──────────────────────
  let donInserted = 0, donSkipped = 0, benevole = 0;
  {
    const rows = sheet(wb, "Donateurs-Benevoles-Sponsors");
    const headers = (rows[0] || []).map((h) => String(h ?? ""));
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const last = cell(row, 0);
      const first = cell(row, 1);
      if (!last && !first) continue;
      const matricule = cell(row, 32);
      const pass = cell(row, 19);
      if (findExisting(last, first, matricule, pass)) { donSkipped++; continue; }

      const internHBM = cell(row, 9).toLowerCase();
      const isBenevole = internHBM.includes("benevole") || internHBM.includes("bénévole");
      const memberType = isBenevole ? null : "donateur";
      const clubFunction = isBenevole ? "Bénévole" : "Donateur";
      const rec = {
        name: `${first} ${titleCase(last)}`.trim(),
        firstName: first || null,
        lastName: last || null,
        email: cell(row, 37) || null,
        phone: cell(row, 36) || cell(row, 34) || null,
        birthdate: parseBirthdate(cell(row, 31)),
        address: buildAddress(cell(row, 3), cell(row, 4), cell(row, 5)),
        license: pass || null,
        status: "active",
        clubFunction,
        nationality: cell(row, 2) || null,
        internalCategory: cell(row, 9) || null,
        flhCategory: cell(row, 11) || null,
        passNumber: pass || null,
        matricule: matricule || null,
        medicoNext: cell(row, 30) || null,
        joinDate: parseBirthdate(cell(row, 29)) || cell(row, 29) || null,
        rawData: buildRawData(headers, row),
        catCode: null as number | null,
        memberType,
        familyCode: cell(row, 6) || "D",
      };
      const info = insertStmt.run(rec);
      const id = Number(info.lastInsertRowid);
      if (isBenevole) { insertFn.run(id, "benevole", "aus Blatt Donateurs-Benevoles-Sponsors"); benevole++; }
      registerNew({ id, name: rec.name, first_name: first, last_name: last, matricule, pass_number: pass, license_number: pass });
      donInserted++;
    }
  }

  // ── 2) Annulés -> ehemalige Mitglieder ────────────────────
  let annInserted = 0, annSkipped = 0;
  {
    const rows = sheet(wb, "Annulés ");
    const headers = (rows[0] || []).map((h) => String(h ?? ""));
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const last = cell(row, 1);
      const first = cell(row, 2);
      if (!last && !first) continue;
      const matricule = cell(row, 17);
      const pass = cell(row, 12);
      if (findExisting(last, first, matricule, pass)) { annSkipped++; continue; }

      const annuleYear = cell(row, 0);
      const rec = {
        name: `${first} ${titleCase(last)}`.trim(),
        firstName: first || null,
        lastName: last || null,
        email: cell(row, 21) || null,
        phone: cell(row, 20) || cell(row, 18) || null,
        birthdate: parseBirthdate(cell(row, 16)),
        address: buildAddress(cell(row, 4), cell(row, 5), cell(row, 6)),
        license: pass || null,
        status: "ehemalig",
        clubFunction: annuleYear ? `Ehemalig (${annuleYear})` : "Ehemalig",
        nationality: cell(row, 3) || null,
        internalCategory: cell(row, 9) || null,
        flhCategory: cell(row, 11) || null,
        passNumber: pass || null,
        matricule: matricule || null,
        medicoNext: cell(row, 15) || null,
        joinDate: parseBirthdate(cell(row, 14)) || cell(row, 14) || null,
        rawData: buildRawData(headers, row),
        catCode: null as number | null,
        memberType: null as string | null,
        familyCode: cell(row, 7) || null,
      };
      const info = insertStmt.run(rec);
      registerNew({ id: Number(info.lastInsertRowid), name: rec.name, first_name: first, last_name: last, matricule, pass_number: pass, license_number: pass });
      annInserted++;
    }
  }

  // ── 3) Médico 2026 -> Update medico_next bestehender Mitglieder ─
  let medUpdated = 0, medNoMatch = 0;
  {
    const rows = sheet(wb, "Médico 2026");
    const updMedico = db.prepare("UPDATE members SET medico_next = ? WHERE id = ?");
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const last = cell(row, 1);
      const first = cell(row, 2);
      if (!last && !first) continue;
      const medico = cell(row, 7);
      if (!medico) continue;
      const matricule = cell(row, 9);
      const pass = cell(row, 5);
      const hit = findExisting(last, first, matricule, pass);
      if (!hit) { medNoMatch++; continue; }
      updMedico.run(medico, hit.id);
      medUpdated++;
    }
  }

  db.close();

  console.log("\n[extra] ─── Ergebnis ───");
  console.log(`  Donateurs/Bénévoles: ${donInserted} neu (davon ${benevole} Bénévole), ${donSkipped} Doublon übersprungen`);
  console.log(`  Annulés (ehemalig):  ${annInserted} neu, ${annSkipped} Doublon übersprungen`);
  console.log(`  Médico:              ${medUpdated} aktualisiert, ${medNoMatch} ohne Match`);
}

main();

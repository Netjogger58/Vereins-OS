/*
 * Fix + Import gegen data.db:
 *   1) Médico-2026-Blatt  -> markiert Mitglieder als medico_list=1, importiert
 *      medico_comment (Kol. 6) und aktualisiert medico_next (Kol. 7).
 *   2) Annulés-Blatt      -> setzt gematchte, noch 'active' Mitglieder auf 'ehemalig'
 *      (außer sie stehen auf der aktuellen Médico-Liste -> Widerspruch, Médico gewinnt).
 *
 * Idempotent. DRY-RUN Default; Änderungen nur mit --apply.
 *   node scripts/fix_medico_annules.cjs "<pfad.xlsx>"           # nur Bericht
 *   node scripts/fix_medico_annules.cjs "<pfad.xlsx>" --apply   # schreibt in data.db
 */
const XLSX = require("xlsx");
const Database = require("better-sqlite3");

const FILE = process.argv[2];
const APPLY = process.argv.includes("--apply");
if (!FILE) { console.error("Pfad zur .xlsx fehlt"); process.exit(1); }

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const digits = (s) => String(s ?? "").replace(/\D/g, "");
const clean = (v) => { const s = String(v ?? "").trim(); return /^\/+$/.test(s) ? "" : s; };

const wb = XLSX.read(require("fs").readFileSync(FILE), { type: "buffer" });
const rowsOf = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false });

const db = new Database("data.db");
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 8000");

// ── Spalten sicherstellen ──
// Spalten anlegen ist harmlos & für die App nötig -> immer (auch im DRY-RUN).
const cols = db.prepare("PRAGMA table_info(members)").all().map((c) => c.name);
if (!cols.includes("medico_list")) { console.log("+ Spalte medico_list"); db.exec("ALTER TABLE members ADD COLUMN medico_list INTEGER"); }
if (!cols.includes("medico_comment")) { console.log("+ Spalte medico_comment"); db.exec("ALTER TABLE members ADD COLUMN medico_comment TEXT"); }

// ── Match-Index ──
const members = db.prepare("SELECT id, name, COALESCE(first_name,'') fn, COALESCE(last_name,'') ln, COALESCE(matricule,'') mt, COALESCE(pass_number,'') pn, COALESCE(license_number,'') lic, COALESCE(membership_status,'') st FROM members").all();
const byMt = new Map(), byName = new Map(), byPass = new Map();
for (const m of members) {
  const mt = digits(m.mt); if (mt.length >= 8) byMt.set(mt, m);
  byName.set(`${norm(m.ln || m.name)}|${norm(m.fn)}`, m);
  const ps = norm(m.pn || m.lic); if (ps) byPass.set(ps, m);
}
const find = (last, first, mt, pass) => {
  const d = digits(mt); if (d.length >= 8 && byMt.has(d)) return byMt.get(d);
  const ps = norm(pass); if (ps && byPass.has(ps)) return byPass.get(ps);
  return byName.get(`${norm(last)}|${norm(first)}`);
};

const setMedico = db.prepare("UPDATE members SET medico_list = 1, medico_comment = ?, medico_next = COALESCE(?, medico_next) WHERE id = ?");
const clearMedico = db.prepare("UPDATE members SET medico_list = 0");
const setEhemalig = db.prepare("UPDATE members SET membership_status = 'ehemalig' WHERE id = ?");

// ── 1) Médico 2026 ──
const med = rowsOf("Médico 2026");
const onMedico = new Set();
let medMatched = 0, medNoMatch = 0, withComment = 0;
if (APPLY) clearMedico.run();
for (let i = 1; i < med.length; i++) {
  const r = med[i] || [];
  const last = clean(r[1]), first = clean(r[2]);
  if (!last && !first) continue;
  const hit = find(last, first, r[9], r[5]);
  if (!hit) { medNoMatch++; continue; }
  medMatched++;
  onMedico.add(hit.id);
  const comment = clean(r[6]) || null;
  const nextMed = clean(r[7]) || null;
  if (comment) withComment++;
  if (APPLY) setMedico.run(comment, nextMed, hit.id);
}

// ── 2) Annulés -> ehemalig (außer auf Médico-Liste) ──
const ann = rowsOf("Annulés ");
let annFixed = 0, annSkipMedico = 0, annAlready = 0;
for (let i = 1; i < ann.length; i++) {
  const r = ann[i] || [];
  const last = clean(r[1]), first = clean(r[2]);
  if (!last && !first) continue;
  const hit = find(last, first, r[17], r[12]);
  if (!hit) continue;
  if (onMedico.has(hit.id)) { annSkipMedico++; continue; }
  if (hit.st === "active") { annFixed++; if (APPLY) setEhemalig.run(hit.id); }
  else annAlready++;
}

db.close();

console.log(`\n─── ${APPLY ? "ANGEWENDET" : "DRY-RUN (nichts geändert)"} ───`);
console.log(`Médico 2026:  ${medMatched} markiert (medico_list=1), ${withComment} mit Kommentar, ${medNoMatch} ohne Match`);
console.log(`Annulés:      ${annFixed} auf 'ehemalig' gesetzt, ${annAlready} schon ehemalig, ${annSkipMedico} übersprungen (stehen auf Médico-Liste)`);
if (!APPLY) console.log(`\n>> Zum Anwenden: node scripts/fix_medico_annules.cjs "<pfad>" --apply`);

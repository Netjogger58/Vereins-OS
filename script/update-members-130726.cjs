/*
 * Aktualisierung der Mitglieder anhand der Sekretärsliste
 * "M75_membres_2026_2027_Codes_alt_neu_130726.xlsx" (Stand 13.07.2026).
 *
 * - Neue CAT-Codes (Spalten K und N) übernehmen.
 * - Abgemeldete Mitglieder (nicht in der Liste) auf "ehemalig" setzen.
 * - Nichts löschen, Random-No unverändert.
 *
 * Verwendung:
 *   node script/update-members-130726.cjs "<pfad.xlsx>"           # DRY-RUN
 *   node script/update-members-130726.cjs "<pfad.xlsx>" --apply   # wendet Änderungen an
 */
const XLSX = require("xlsx");
const Database = require("better-sqlite3");
const fs = require("fs");

const FILE = process.argv[2];
const APPLY = process.argv.includes("--apply");
if (!FILE) { console.error("Pfad zur .xlsx fehlt"); process.exit(1); }

// ─── Spalten (0-basiert) in der neuen Liste ───
const C = { lastName: 0, firstName: 1, cardId: 2, catCode: 10, catInterne: 11, catFlh: 13 };

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const T = (r, i) => String(r[i] ?? "").trim();

const CAT_TO_TEAM = {
  11: 1, 12: 1, 20: 1, 14: 3, 15: 4, 17: 7, 18: 8, 16: 6, 36: 6, 19: 9,
  31: 2, 32: 2, 33: 2, 40: 2, 34: 3, 35: 4, 37: 7, 38: 8,
};
const resolveTeam = (cc) => CAT_TO_TEAM[cc] || null;
const titleCase = (s) => String(s || "").toLowerCase().replace(/(^|[\s\-''])([a-zà-ÿ])/g, (m, p, c) => p + c.toUpperCase());
const isContactCat = (t) => /contact|famille/i.test(String(t || ""));

// ─── Excel laden ───
const wb = XLSX.readFile(FILE, { cellDates: false });
const sheetName = "Membres 2026_2027";
const ws = wb.Sheets[sheetName];
if (!ws) { console.error("Sheet '" + sheetName + "' nicht gefunden"); process.exit(1); }
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
const data = rows.slice(1).filter((r) => T(r, C.lastName) || T(r, C.firstName));

const excel = data.map((r) => {
  const catCodeRaw = T(r, C.catCode) || T(r, C.catFlh);
  const catCode = Number(catCodeRaw) || 0;
  return {
    rnd: T(r, C.cardId),
    nom: T(r, C.lastName), prenom: T(r, C.firstName),
    catInterne: T(r, C.catInterne), catFlh: T(r, C.catFlh),
    catCode,
  };
});

// ─── DB laden ───
const db = new Database("data.db", APPLY ? {} : { readonly: true });
const members = db.prepare(
  "SELECT id, card_id, name, first_name fn, last_name ln, membership_status ms, cat_code cc, flh_category flh, internal_category inte, team_id tid FROM members"
).all();

function nameKey(ln, fn, full) {
  let a = norm(ln), b = norm(fn);
  if (!a && !b && full) { const p = String(full).trim().split(/\s+/); b = norm(p[0]); a = norm(p.slice(1).join("")); }
  return a + "|" + b;
}
const byName = new Map();
for (const m of members) {
  const k = nameKey(m.ln, m.fn, m.name);
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(m);
}

const matched = [], unmatchedExcel = [], ambiguous = [];
const matchedDbIds = new Set();
for (const e of excel) {
  const k = nameKey(e.nom, e.prenom, `${e.prenom} ${e.nom}`);
  const cand = byName.get(k);
  if (!cand || cand.length === 0) { unmatchedExcel.push(e); continue; }
  if (cand.length > 1) ambiguous.push({ e, count: cand.length });
  const m = cand[0];
  matched.push({ e, m });
  matchedDbIds.add(m.id);
}

const dbActive = members.filter((m) => m.ms === "active");
const gone = dbActive.filter((m) => !matchedDbIds.has(m.id));

const catChanges = [];
for (const { e, m } of matched) {
  const oldCC = m.cc || 0, newCC = e.catCode || 0;
  const oldFlh = m.flh || "", newFlh = e.catFlh || "";
  if (oldCC !== newCC || oldFlh !== newFlh) {
    catChanges.push({ name: m.name, rnd: e.rnd, oldCC, newCC, oldFlh, newFlh });
  }
}

console.log(`\n================ ${APPLY ? "APPLY" : "DRY-RUN"} — Update 130726 ================`);
console.log(`Datei:  ${FILE}`);
console.log(`Excel-Zeilen mit Name:        ${excel.length}`);
console.log(`\n--- Abgleich mit DB (via Name) ---`);
console.log(`Gematcht auf DB-Member:       ${matched.length}`);
console.log(`Excel-Name OHNE DB-Treffer:   ${unmatchedExcel.length}`);
unmatchedExcel.slice(0, 15).forEach((e) => console.log(`   ? ${e.prenom} ${e.nom}`));
if (unmatchedExcel.length > 15) console.log(`   ... insgesamt ${unmatchedExcel.length}`);
if (ambiguous.length) console.log(`Mehrdeutige Namen: ${ambiguous.length} ${ambiguous.slice(0,8).map(a=>a.e.prenom+" "+a.e.nom).join(", ")}`);
console.log(`\n--- Abmeldungen ---`);
console.log(`DB aktiv aktuell:             ${dbActive.length}`);
console.log(`NICHT mehr in Liste -> ehemalig: ${gone.length}`);
gone.slice(0, 30).forEach((m) => console.log(`   - ${m.name}  [${m.card_id || "ohne No"}]`));
if (gone.length > 30) console.log(`   ... insgesamt ${gone.length}`);
console.log(`\n--- Neue Personen (in Excel, nicht in DB) ---`);
console.log(`Anzahl:                       ${unmatchedExcel.length}`);
console.log(`\n--- Kategorie-Änderungen ---`);
console.log(`Anzahl:                       ${catChanges.length}`);
catChanges.slice(0, 40).forEach((c) => console.log(`   ${c.name}: catCode ${c.oldCC}->${c.newCC} | "${c.oldFlh}" -> "${c.newFlh}"`));
if (catChanges.length > 40) console.log(`   ... insgesamt ${catChanges.length}`);

const newActive = dbActive.length - gone.length;
console.log(`\n>>> Ergebnis nach Update: aktive Mitglieder = ${newActive}`);

if (!APPLY) {
  console.log(`\n>>> DRY-RUN: es wurde NICHTS geändert. Zum Anwenden: --apply`);
  db.close();
  process.exit(0);
}

// ─── APPLY ───
const backup = `data.backup-before-update-130726-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}.db`;
fs.copyFileSync("data.db", backup);
console.log(`\nBackup erstellt: ${backup}`);

const updCat = db.prepare("UPDATE members SET cat_code=@cc, flh_category=@flh, internal_category=@inte, team_id=@tid, membership_status='active' WHERE id=@id");
const setEhemalig = db.prepare("UPDATE members SET membership_status='ehemalig' WHERE id=@id");
const insNew = db.prepare(
  "INSERT INTO members (name, first_name, last_name, membership_status, cat_code, flh_category, internal_category, team_id, member_type, card_id) " +
  "VALUES (@name, @fn, @ln, 'active', @cc, @flh, @inte, @tid, @mt, @rnd)"
);

const tx = db.transaction(() => {
  let nCat = 0, nEhem = 0, nNew = 0;
  for (const { e, m } of matched) {
    const catText = e.catFlh || e.catInterne;
    updCat.run({ id: m.id, cc: e.catCode || 0, flh: e.catFlh || null, inte: e.catInterne || null, tid: resolveTeam(e.catCode) });
    nCat++;
  }
  for (const m of gone) { setEhemalig.run({ id: m.id }); nEhem++; }
  for (const e of unmatchedExcel) {
    const catText = e.catFlh || e.catInterne;
    insNew.run({
      name: `${e.prenom} ${titleCase(e.nom)}`.trim(),
      fn: e.prenom || null, ln: e.nom || null,
      cc: e.catCode || 0, flh: e.catFlh || null, inte: e.catInterne || null,
      tid: resolveTeam(e.catCode),
      mt: isContactCat(catText) ? "contact" : "spieler",
      rnd: e.rnd || null,
    });
    nNew++;
  }
  return { nCat, nEhem, nNew };
});
const res = tx();
console.log(`\n>>> APPLY fertig: ${res.nCat} aktualisiert, ${res.nEhem} auf 'ehemalig' gesetzt, ${res.nNew} neu angelegt.`);
const finalActive = db.prepare("SELECT COUNT(*) c FROM members WHERE membership_status='active'").get().c;
console.log(`>>> Aktive Mitglieder jetzt in DB: ${finalActive}`);
db.close();

/*
 * Gezielte Aktualisierung der Mitglieder anhand der neuen Sekretärsliste
 * "M75 Membres 120726.xlsx" (Stand 12.07.2026).
 *
 * Zweck (laut User):
 *   - Es haben sich v.a. die CAT-Codes / Kategorien geändert (Sekretär hat neu vergeben).
 *   - Einige Mitglieder wurden bei der FLH abgemeldet -> jetzt < 590 offizielle Mitglieder.
 *   - KEINE neuen Random-Nummern erzeugen (kommt später).
 *   - Bestehende Random-No (card_id) NICHT ändern.
 *   - Nichts löschen: Abgemeldete werden auf membership_status = 'ehemalig' (Archiv) gesetzt.
 *
 * Abgleich-Schlüssel: Random-No (Spalte 2 der Excel) == members.card_id.
 *
 * Nutzung:
 *   node script/update-members-120726.cjs "<pfad.xlsx>"           # DRY-RUN (nur Bericht, ändert NICHTS)
 *   node script/update-members-120726.cjs "<pfad.xlsx>" --apply   # wendet Änderungen an (Backup vorher)
 *
 * Default = DRY-RUN.
 */
const XLSX = require("xlsx");
const Database = require("better-sqlite3");
const fs = require("fs");

const FILE = process.argv[2];
const APPLY = process.argv.includes("--apply");
if (!FILE) { console.error("Pfad zur .xlsx fehlt"); process.exit(1); }

// ─── Spalten (0-basiert) in der neuen Liste ───
const C = { lastName: 0, firstName: 1, cardId: 2, catCodeJ: 9, catInterne: 10, catFlh: 12 };

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const T = (r, i) => String(r[i] ?? "").trim();

// ─── Kategorie-Text -> catCode (identisch zum Erstimport, docs/kategorien-neuordnung.md §2) ───
function textToCatCode(t) {
  const n = norm(t);
  if (!n) return 0;
  const map = [
    ["seniorshommes", 11], ["u21hommes", 12], ["u17hommes", 13], ["u15hommes", 14],
    ["u13hommes", 15], ["u11hommes", 16], ["u9hommes", 17], ["u7mixte", 18],
    ["u4mixte", 19], ["u4", 19], ["veteranshommes", 20],
    ["seniorsdames", 31], ["u21dames", 32], ["u17dames", 33], ["u15dames", 34],
    ["u13dames", 35], ["u11dames", 36], ["u9dames", 37], ["u7dames", 38],
    ["veteransdames", 40], ["dames", 31],
  ];
  for (const [k, v] of map) if (n === k || n.startsWith(k)) return v;
  return 0;
}
const CAT_TO_TEAM = {
  // Hären: Seniors/U21/Vétérans spillen 1. Equipe (Team 1)
  11: 1, 12: 1, 20: 1, 14: 3, 15: 4, 17: 7, 18: 8, 16: 6, 36: 6, 19: 9,
  // Dames: Seniors/U21/U17/Vétérans -> Frauen (Team 2). Vétérans (40) sinn och Championnat-Spiller!
  31: 2, 32: 2, 33: 2, 40: 2, 34: 3, 35: 4, 37: 7, 38: 8,
};
const resolveTeam = (cc) => CAT_TO_TEAM[cc] || null;
const titleCase = (s) => String(s || "").toLowerCase().replace(/(^|[\s\-'])([a-zà-ÿ])/g, (m, p, c) => p + c.toUpperCase());
const isContactCat = (t) => /contact|famille/i.test(String(t || ""));

// ─── Excel laden (Sheet automatisch: der mit den meisten Zeilen) ───
const wb = XLSX.readFile(FILE, { cellDates: false });
let sheetName = wb.SheetNames[0], best = -1;
for (const sn of wb.SheetNames) {
  const n = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: "" }).length;
  if (n > best) { best = n; sheetName = sn; }
}
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "", raw: false });
const data = rows.slice(1).filter((r) => T(r, C.lastName) || T(r, C.firstName));

const excel = data.map((r) => {
  const catText = T(r, C.catFlh) || T(r, C.catInterne);
  return {
    rnd: T(r, C.cardId),
    nom: T(r, C.lastName), prenom: T(r, C.firstName),
    catInterne: T(r, C.catInterne), catFlh: T(r, C.catFlh),
    catCode: textToCatCode(catText),
  };
});
const withRnd = excel.filter((e) => e.rnd);

// ─── DB laden ───
const db = new Database("data.db", APPLY ? {} : { readonly: true });
const members = db.prepare(
  "SELECT id, card_id, name, first_name fn, last_name ln, membership_status ms, cat_code cc, flh_category flh, internal_category inte, team_id tid FROM members"
).all();

// Namensschluessel: Nachname|Vorname (normalisiert). Fallback: aus 'name' ableiten.
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

// ─── Analyse: Abgleich ueber NAME (Random-No ist in dieser Liste leer) ───
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

// Kategorie-Änderungen unter den gematchten Mitgliedern
const catChanges = [];
for (const { e, m } of matched) {
  const oldCC = m.cc || 0, newCC = e.catCode || 0;
  const oldFlh = m.flh || "", newFlh = e.catFlh || "";
  if (oldCC !== newCC || oldFlh !== newFlh) {
    catChanges.push({ name: m.name, rnd: e.rnd, oldCC, newCC, oldFlh, newFlh });
  }
}

// ─── Bericht ───
console.log(`\n================ ${APPLY ? "APPLY" : "DRY-RUN"} — Update 120726 ================`);
console.log(`Datei:  ${FILE}`);
console.log(`Sheet:  "${sheetName}"`);
console.log(`\n--- Excel (neue Liste) ---`);
console.log(`Zeilen mit Name:        ${excel.length}`);
console.log(`  davon mit Random-No:  ${withRnd.length}  (Spalte leer -> Abgleich ueber NAME)`);
console.log(`\n--- Abgleich mit DB (via Name: Nachname|Vorname) ---`);
console.log(`Gematcht auf DB-Member:       ${matched.length}`);
console.log(`Excel-Name OHNE DB-Treffer:   ${unmatchedExcel.length}  (evtl. neue Personen / Schreibvariante)`);
unmatchedExcel.slice(0, 15).forEach((e) => console.log(`   ? ${e.prenom} ${e.nom}`));
if (unmatchedExcel.length > 15) console.log(`   ... insgesamt ${unmatchedExcel.length}`);
if (ambiguous.length) console.log(`Mehrdeutige Namen (>=2 DB-Treffer): ${ambiguous.length}  ${ambiguous.slice(0,8).map(a=>a.e.prenom+" "+a.e.nom).join(", ")}`);
console.log(`\n--- Abmeldungen (FLH) ---`);
console.log(`DB aktiv aktuell:             ${dbActive.length}`);
console.log(`NICHT mehr in Liste -> ehemalig: ${gone.length}`);
gone.slice(0, 30).forEach((m) => console.log(`   - ${m.name}  [${m.card_id || "ohne No"}]`));
if (gone.length > 30) console.log(`   ... insgesamt ${gone.length}`);
console.log(`\n--- Neue Personen (in Excel, nicht in DB) -> werden als AKTIV angelegt (ohne Random-No) ---`);
console.log(`Anzahl neu anzulegen:         ${unmatchedExcel.length}`);
unmatchedExcel.forEach((e) => console.log(`   + ${e.prenom} ${e.nom}  | catCode=${e.catCode} | "${e.catFlh || e.catInterne}"`));
console.log(`\n--- Kategorie-/CAT-Aenderungen (gematchte Mitglieder) ---`);
console.log(`Anzahl mit geaenderter Kategorie: ${catChanges.length}`);
catChanges.slice(0, 40).forEach((c) =>
  console.log(`   ${c.name}: catCode ${c.oldCC}->${c.newCC} | "${c.oldFlh}" -> "${c.newFlh}"`));
if (catChanges.length > 40) console.log(`   ... insgesamt ${catChanges.length}`);

const newActive = dbActive.length - gone.length;
console.log(`\n>>> Ergebnis nach Update: aktive Mitglieder = ${newActive} (vorher ${dbActive.length}), ehemalig +${gone.length}`);

if (!APPLY) {
  console.log(`\n>>> DRY-RUN: es wurde NICHTS geaendert. Zum Anwenden: --apply`);
  db.close();
  process.exit(0);
}

// ─── APPLY ───
const backup = `data.backup-before-update-120726-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}.db`;
fs.copyFileSync("data.db", backup);
console.log(`\nBackup erstellt: ${backup}`);

const updCat = db.prepare("UPDATE members SET cat_code=@cc, flh_category=@flh, internal_category=@inte, team_id=@tid WHERE id=@id");
const setEhemalig = db.prepare("UPDATE members SET membership_status='ehemalig' WHERE id=@id");
const insNew = db.prepare(
  "INSERT INTO members (name, first_name, last_name, membership_status, cat_code, flh_category, internal_category, team_id, member_type, card_id) " +
  "VALUES (@name, @fn, @ln, 'active', @cc, @flh, @inte, @tid, @mt, NULL)"
);

const tx = db.transaction(() => {
  let nCat = 0, nEhem = 0, nNew = 0;
  for (const { e, m } of matched) {
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
    });
    nNew++;
  }
  return { nCat, nEhem, nNew };
});
const res = tx();
console.log(`\n>>> APPLY fertig: ${res.nCat} aktualisiert (Kategorie/Team), ${res.nEhem} auf 'ehemalig' gesetzt, ${res.nNew} neu angelegt (aktiv, ohne Random-No).`);
console.log(`>>> Random-No unveraendert. Neue Personen: Feld card_id bleibt LEER (kommt spaeter).`);
const finalActive = db.prepare("SELECT COUNT(*) c FROM members WHERE membership_status='active'").get().c;
console.log(`>>> Aktive Mitglieder jetzt in DB: ${finalActive}`);
db.close();

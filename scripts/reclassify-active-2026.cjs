// Einmalige Reklassifizierung: "Membres 2026-2027"-Blatt = Wahrheit für aktive Mitglieder.
// - In der Liste enthalten  -> membership_status = 'active'
// - Aktiv, aber NICHT in der Liste (außer Donateur/Sponsor/Ehrenmitglied) -> 'ehemalig' (Archiv)
// Aufruf:  node scripts/reclassify-active-2026.cjs           (Dry-Run, nur Bericht)
//          node scripts/reclassify-active-2026.cjs --apply   (schreibt in die DB)
const path = require("path");
const XLSX = require("xlsx");
const Database = require("better-sqlite3");

const APPLY = process.argv.includes("--apply");
const XLSX_PATH = "/Users/netjogger58/CascadeProjects/GC 2026-07-01-MEMBERSLESCHT 2026-2027 (base de départ nouvelle Saison).xlsx";
const DB_PATH = path.resolve(__dirname, "..", "data.db");
const SHEET = " Membres 2026 -2027";
const NAME_COL = "       ";                 // Nom (leere Spaltenüberschrift)
const FIRST_COL = "Prénom ou les prénoms";
const RAND_COL = "Random-No";

// Wahrheit ist ausschließlich die "Membres 2026-2027"-Liste: NICHT enthalten => Archiv.
// (Donateure/Sponsoren bleiben über member_type/eigene Buttons sichtbar, zählen aber
//  nicht zu den aktiven Mitgliedern.)
const KEEP_TYPES = new Set();
const ACTIVE_SET = new Set(["", "active", "aktiv"]);
const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");

const wb = XLSX.readFile(XLSX_PATH);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[SHEET], { defval: "" });
const named = rows.filter((r) => String(r[NAME_COL]).trim() || String(r[FIRST_COL]).trim());

const sheetCards = new Set();
const sheetNames = new Set();
for (const r of named) {
  const card = String(r[RAND_COL] || "").trim().toUpperCase();
  if (card) sheetCards.add(card);
  const nom = String(r[NAME_COL]).trim();
  const pre = String(r[FIRST_COL]).trim();
  if (nom || pre) {
    sheetNames.add(norm(`${nom} ${pre}`)); // Nom Prénom
    sheetNames.add(norm(`${pre} ${nom}`)); // Prénom Nom (DB-Reihenfolge)
  }
}

// Verifikation: Beispiele
console.log("Sample Blatt-Karten:", [...sheetCards].slice(0, 5));
console.log("Sample Blatt-Namen: ", [...sheetNames].slice(0, 6));

const db = new Database(DB_PATH);
const members = db.prepare("SELECT id, name, card_id, member_type, membership_status FROM members").all();
console.log("Sample DB-Karten:   ", members.slice(0, 5).map((m) => m.card_id));
console.log("Sample DB-Namen:    ", members.slice(0, 6).map((m) => m.name));

const inSheet = (m) => {
  const card = String(m.card_id || "").trim().toUpperCase();
  if (card && sheetCards.has(card)) return true;
  return sheetNames.has(norm(m.name));
};

const toActive = [];   // war nicht aktiv, ist aber in der Liste
const toArchive = [];  // war aktiv, ist aber nicht in der Liste (und kein Donateur/Sponsor/Ehren)
for (const m of members) {
  const st = norm(m.membership_status);
  const present = inSheet(m);
  if (present && !ACTIVE_SET.has(st)) toActive.push(m);
  if (!present && ACTIVE_SET.has(st) && !KEEP_TYPES.has(norm(m.member_type))) toArchive.push(m);
}

const activeBefore = members.filter((m) => ACTIVE_SET.has(norm(m.membership_status))).length;
const activeAfter = activeBefore + toActive.length - toArchive.length;

console.log(`Blatt-Mitglieder (mit Namen): ${named.length}`);
console.log(`DB-Mitglieder gesamt:         ${members.length}`);
console.log(`Aktiv VORHER:                 ${activeBefore}`);
console.log(`→ auf 'active' setzen:        ${toActive.length}`);
console.log(`→ auf 'ehemalig' (Archiv):    ${toArchive.length}`);
console.log(`Aktiv NACHHER:                ${activeAfter}`);

console.log(`\n-- auf 'active' (${toActive.length}) --`);
for (const m of toActive) console.log(`  ${m.name}  [${m.membership_status || "leer"}]`);
console.log(`\n-- auf 'ehemalig' (${toArchive.length}) --`);
for (const m of toArchive.slice(0, 40)) console.log(`  ${m.name}  (${m.member_type || "?"})`);
if (toArchive.length > 40) console.log(`  … +${toArchive.length - 40} weitere`);

if (APPLY) {
  const upd = db.prepare("UPDATE members SET membership_status = ? WHERE id = ?");
  const tx = db.transaction(() => {
    for (const m of toActive) upd.run("active", m.id);
    for (const m of toArchive) upd.run("ehemalig", m.id);
  });
  tx();
  console.log(`\n✅ Angewendet. Aktiv jetzt: ${db.prepare("SELECT COUNT(*) c FROM members WHERE LOWER(COALESCE(membership_status,'')) IN ('','active','aktiv')").get().c}`);
} else {
  console.log(`\n(DRY-RUN — nichts geändert. Mit --apply ausführen zum Schreiben.)`);
}
db.close();

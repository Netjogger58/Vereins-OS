/*
 * Reklassifizierung: member_type='spieler' korrigieren anhand der Excel-Rubrik
 * "Catégorie interne Mersch75 2026-2027" (DB: members.internal_category).
 * Nicht jeder mit Lizenz ist Spieler — Officiels / Comité / Arbitre / Kontakte
 * wurden beim Import faelschlich auf 'spieler' gesetzt.
 *
 *   node script/reclassify-spieler.cjs           # DRY-RUN (zeigt nur)
 *   node script/reclassify-spieler.cjs --apply   # anwenden (mit Backup)
 */
const Database = require("better-sqlite3");
const fs = require("fs");

const APPLY = process.argv.includes("--apply");
const db = new Database("data.db", APPLY ? {} : { readonly: true });

// Interne Kategorie -> gewünschter member_type + (optional) sicherzustellende Funktion.
// type=null  => kein Spieler (Funktionär); Rolle steckt in member_functions.
function classify(ic) {
  const s = (ic || "").toLowerCase().trim();
  if (s === "comité" || s === "comite") return { type: null, fn: "comite", label: "Comité" };
  if (s.includes("officiel")) return { type: null, fn: "officiel", label: "Officiel" };
  if (s.includes("arbitre")) return { type: null, fn: "arbitre", label: "Arbitre" };
  if (s.includes("contact famille")) return { type: "contact", fn: "contact_famille", label: "Kontakt (Familie)" };
  return null; // Spieler / bleibt unverändert
}

// Ausnahmen: bleiben Spieler (z.B. Vétéran der auch pfeift).
const EXCLUDE_IDS = new Set([2091]); // Georges Frieden (Veteran arbitre)

const rows = db.prepare(
  "SELECT id, name, internal_category ic, cat_code cc, team_id tid FROM members WHERE membership_status='active' AND member_type='spieler'"
).all();

const changes = [];
for (const r of rows) {
  if (EXCLUDE_IDS.has(r.id)) continue;
  const c = classify(r.ic);
  if (!c) continue;
  const fns = db.prepare("SELECT function FROM member_functions WHERE member_id=?").all(r.id).map((x) => x.function);
  changes.push({ id: r.id, name: r.name, kategorie: r.ic, neu_typ: c.type ?? "(kein Spieler)", funktion: c.fn, hat_funktion: fns.includes(c.fn) ? "ja" : "NEIN -> wird ergänzt" });
}

console.log(`\n== ${APPLY ? "APPLY" : "DRY-RUN"} Reklassifizierung ==`);
console.log(`Aktive 'spieler' gesamt: ${rows.length} | zu korrigieren: ${changes.length}\n`);
console.table(changes);

if (!APPLY) {
  console.log("\n>>> DRY-RUN: nichts geändert. Zum Anwenden: --apply");
  db.close();
  process.exit(0);
}

const backup = `data.backup-reclassify-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}.db`;
fs.copyFileSync("data.db", backup);
console.log(`\nBackup: ${backup}`);

// Nur member_type korrigieren — Funktionen bleiben unangetastet
// (verhindert z.B. das versehentliche Wieder-Hinzufügen von Armand Kremers Comité).
const tx = db.transaction(() => {
  for (const ch of changes) {
    const c = classify(ch.kategorie);
    db.prepare("UPDATE members SET member_type=? WHERE id=?").run(c.type, ch.id);
  }
});
tx();
console.log(`\n>>> FERTIG: ${changes.length} Mitglieder reklassifiziert.`);
db.close();

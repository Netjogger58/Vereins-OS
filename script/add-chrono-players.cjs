// Fügt aktiven SPIELERN mit ZS-Lizenz eine officiel/Chrono-Qualifikation hinzu.
// Sie bleiben Spieler (member_type wird NICHT geändert).
// Nutzung: node script/add-chrono-players.cjs          (Dry-Run)
//          node script/add-chrono-players.cjs --apply   (Änderungen anwenden)
const Database = require("better-sqlite3");
const APPLY = process.argv.includes("--apply");
const db = new Database("data.db");

const rows = db.prepare(
  "SELECT id, name, member_type mt, internal_category ic, raw_data FROM members WHERE membership_status='active'"
).all();

const targets = [];
for (const r of rows) {
  let zs;
  try { zs = JSON.parse(r.raw_data || "{}")["Licences ZS (secrétaires / chronométreurs)"]; } catch (e) {}
  const zsVal = String(zs || "").trim();
  if (zsVal === "" || zsVal.toLowerCase() === "xxx") continue;
  if (r.mt !== "spieler") continue;
  targets.push({ id: r.id, name: r.name, zs: zsVal });
}

const existsStmt = db.prepare(
  "SELECT COUNT(*) c FROM member_functions WHERE member_id=? AND function='officiel' AND qualification='Chrono'"
);
const insertStmt = db.prepare(
  "INSERT INTO member_functions (member_id, function, code, qualification, note, team_id) VALUES (?, 'officiel', 2, 'Chrono', ?, NULL)"
);

let added = 0, skipped = 0;
const apply = db.transaction(() => {
  for (const t of targets) {
    if (existsStmt.get(t.id).c > 0) {
      console.log(`SKIP  (schon vorhanden): ${t.name}`);
      skipped++;
      continue;
    }
    console.log(`${APPLY ? "ADD " : "WÜRDE ADD"}: ${t.name}  (ZS ${t.zs})`);
    if (APPLY) insertStmt.run(t.id, `ZS-Lizenz ${t.zs} (chronométreur/secrétaire)`);
    added++;
  }
});
apply();

console.log(`\n${APPLY ? "Angewendet" : "Dry-Run"} — hinzugefügt: ${added}, übersprungen: ${skipped}`);
if (!APPLY) console.log("Zum Anwenden:  node script/add-chrono-players.cjs --apply");
db.close();

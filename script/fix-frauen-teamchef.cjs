/*
 * Fraen (Team 2) — Trainer/Teamchef korrigéieren (Saison 2026-2027, laut trainerstaff.html):
 *   - Anne Holm-Bisenius ist NICHT Trainerin von Dames 1 (sie ist Spielerin/Vétéran + Jugendtrainerin U7/Filles).
 *   - Katarzyna Pietrasik = Teamcheffin/Lead Dames 1.
 *
 * Nutzung:
 *   node script/fix-frauen-teamchef.cjs           # DRY-RUN
 *   node script/fix-frauen-teamchef.cjs --apply   # anwenden (Backup vorher)
 */
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const APPLY = process.argv.includes("--apply");
const TEAM_ID = 2;                 // Frauen
const ANNE_USER_ID = 11;           // aktueller (falscher) Trainer-User
const KAT_MEMBER_ID = 2311;        // Katarzyna Pietrasik (Member)
const KAT_EMAIL = "katarzyna.pietrasik@mersch75.lu";
const KAT_TEMP_PW = "Mersch75!Teamchef";

const db = new Database("data.db", APPLY ? {} : { readonly: true });

const team = db.prepare("SELECT id,name,trainer_id FROM teams WHERE id=?").get(TEAM_ID);
const anneUser = db.prepare("SELECT id,name,role,team_id FROM users WHERE id=?").get(ANNE_USER_ID);
const katMember = db.prepare("SELECT id,name,team_id,cat_code,member_type FROM members WHERE id=?").get(KAT_MEMBER_ID);
const existingKatUser = db.prepare("SELECT id,name,role FROM users WHERE email=?").get(KAT_EMAIL);
const katFns = db.prepare("SELECT id,function,team_id FROM member_functions WHERE member_id=?").all(KAT_MEMBER_ID);

console.log(`\n== ${APPLY ? "APPLY" : "DRY-RUN"} Fraen Trainer/Teamchef ==`);
console.log("Team:            ", team);
console.log("Anne (User 11):  ", anneUser);
console.log("Katarzyna (Mem): ", katMember);
console.log("Katarzyna (User):", existingKatUser || "— existiert noch nicht");
console.log("Katarzyna funcs: ", katFns);

console.log("\nGeplante Änderungen:");
console.log("  1) Neuer Trainer-User 'Katarzyna Pietrasik' (role=trainer, team_id=2) — falls noch nicht vorhanden");
console.log("  2) teams.trainer_id[2] -> Katarzyna");
console.log("  3) users[11] Anne: bleibt role=trainer (Jugend U7/Filles), team_id -> NULL (nicht mehr Dames-1-Lead)");
console.log("  4) members[2311] Katarzyna: member_type -> NULL (keine Spielerin) + member_functions 'teamchef' (team 2), doppelte 'officiel' bereinigen");

if (!APPLY) {
  console.log("\n>>> DRY-RUN: nichts geändert. Zum Anwenden: --apply");
  console.log(`>>> Katarzyna würde Login bekommen: ${KAT_EMAIL} / ${KAT_TEMP_PW} (bitte ändern)`);
  db.close();
  process.exit(0);
}

const backup = `data.backup-frauen-teamchef-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}.db`;
fs.copyFileSync("data.db", backup);
console.log(`\nBackup: ${backup}`);

const tx = db.transaction(() => {
  // 1) Katarzyna User
  let katUserId = existingKatUser?.id;
  if (!katUserId) {
    const hash = bcrypt.hashSync(KAT_TEMP_PW, 10);
    const info = db.prepare(
      "INSERT INTO users (email, password_hash, name, role, team_id, active) VALUES (?,?,?,?,?,1)"
    ).run(KAT_EMAIL, hash, "Katarzyna Pietrasik", "trainer", TEAM_ID);
    katUserId = info.lastInsertRowid;
    console.log(`  -> Katarzyna User angelegt (id=${katUserId})`);
  } else {
    db.prepare("UPDATE users SET role='trainer', team_id=? WHERE id=?").run(TEAM_ID, katUserId);
  }

  // 2) Team-Lead setzen
  db.prepare("UPDATE teams SET trainer_id=? WHERE id=?").run(katUserId, TEAM_ID);

  // 3) Anne: nicht mehr Dames-1-Lead (bleibt Trainerin für Jugend)
  db.prepare("UPDATE users SET team_id=NULL WHERE id=?").run(ANNE_USER_ID);

  // 4) Katarzyna Member: keine Spielerin, Teamchef-Funktion
  db.prepare("UPDATE members SET member_type=NULL WHERE id=?").run(KAT_MEMBER_ID);
  // doppelte 'officiel' bereinigen (nur eine behalten)
  const officiels = db.prepare("SELECT id FROM member_functions WHERE member_id=? AND function='officiel' ORDER BY id").all(KAT_MEMBER_ID);
  for (const row of officiels.slice(1)) db.prepare("DELETE FROM member_functions WHERE id=?").run(row.id);
  const hasTeamchef = db.prepare("SELECT 1 FROM member_functions WHERE member_id=? AND function='teamchef'").get(KAT_MEMBER_ID);
  if (!hasTeamchef) {
    db.prepare("INSERT INTO member_functions (member_id, function, team_id, created_at) VALUES (?,?,?,?)")
      .run(KAT_MEMBER_ID, "teamchef", TEAM_ID, new Date().toISOString());
  }

  return katUserId;
});
const katUserId = tx();

console.log("\n>>> FERTIG.");
console.log(`   Teamchef/Lead Frauen = Katarzyna Pietrasik (User-ID ${katUserId})`);
console.log(`   Login: ${KAT_EMAIL} / ${KAT_TEMP_PW}  (bitte ändern)`);
console.log("   Anne Holm-Bisenius = Spielerin (Vétéran) bei Frauen + Jugendtrainerin, nicht mehr Dames-1-Lead.");
db.close();

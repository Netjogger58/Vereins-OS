/*
 * Trainerwechsel Seniors 1 (Team 1):
 *   - Laurent Metzler ist NICHT mehr Trainer, sondern wieder Spieler.
 *   - Sascha Marzadori ist neuer Trainer (kein Spieler).
 *
 * Nutzung:
 *   node script/swap-trainer-seniors.cjs           # DRY-RUN (zeigt nur, ändert nichts)
 *   node script/swap-trainer-seniors.cjs --apply   # wendet an (Backup vorher)
 */
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const APPLY = process.argv.includes("--apply");
const TEAM_ID = 1;
const LAURENT_USER_ID = 12;
const LAURENT_MEMBER_ID = 2268;
const SASCHA_MEMBER_ID = 2895;
const SASCHA_EMAIL = "sascha.marzadori@mersch75.lu";
const SASCHA_TEMP_PW = "Mersch75!Trainer";

const db = new Database("data.db", APPLY ? {} : { readonly: true });

const team = db.prepare("SELECT id,name,trainer_id FROM teams WHERE id=?").get(TEAM_ID);
const laurentUser = db.prepare("SELECT id,name,role,team_id FROM users WHERE id=?").get(LAURENT_USER_ID);
const laurentMember = db.prepare("SELECT id,name,team_id,cat_code,member_type FROM members WHERE id=?").get(LAURENT_MEMBER_ID);
const saschaMember = db.prepare("SELECT id,name,team_id,cat_code,member_type FROM members WHERE id=?").get(SASCHA_MEMBER_ID);
const existingSaschaUser = db.prepare("SELECT id,name,role FROM users WHERE email=?").get(SASCHA_EMAIL);

console.log(`\n== ${APPLY ? "APPLY" : "DRY-RUN"} Trainerwechsel Seniors 1 ==`);
console.log("Team:          ", team);
console.log("Laurent (User):", laurentUser);
console.log("Laurent (Mem): ", laurentMember);
console.log("Sascha (Mem):  ", saschaMember);
console.log("Sascha (User): ", existingSaschaUser || "— existiert noch nicht");

console.log("\nGeplante Änderungen:");
console.log("  1) Neuer Trainer-User 'Sascha Marzadori' (role=trainer, team_id=1) — falls noch nicht vorhanden");
console.log("  2) teams.trainer_id[1] -> Sascha (neue User-ID)");
console.log("  3) users[12] Laurent: role 'trainer' -> 'spieler'");
console.log("  4) members[2895] Sascha: member_type '"+ (saschaMember?.member_type) +"' -> NULL; + member_functions 'officiel'");
console.log("  5) members[2268] Laurent: team_id -> 1, cat_code -> 11 (Seniors - Hommes)");

if (!APPLY) {
  console.log("\n>>> DRY-RUN: nichts geändert. Zum Anwenden: --apply");
  console.log(`>>> Sascha würde Login bekommen: ${SASCHA_EMAIL} / Passwort: ${SASCHA_TEMP_PW} (bitte ändern)`);
  db.close();
  process.exit(0);
}

const backup = `data.backup-trainer-swap-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}.db`;
fs.copyFileSync("data.db", backup);
console.log(`\nBackup: ${backup}`);

const tx = db.transaction(() => {
  // 1) Sascha User anlegen (falls nötig)
  let saschaUserId = existingSaschaUser?.id;
  if (!saschaUserId) {
    const hash = bcrypt.hashSync(SASCHA_TEMP_PW, 10);
    const info = db.prepare(
      "INSERT INTO users (email, password_hash, name, role, team_id, active) VALUES (?,?,?,?,?,1)"
    ).run(SASCHA_EMAIL, hash, "Sascha Marzadori", "trainer", TEAM_ID);
    saschaUserId = info.lastInsertRowid;
    console.log(`  -> Sascha User angelegt (id=${saschaUserId})`);
  } else {
    db.prepare("UPDATE users SET role='trainer', team_id=? WHERE id=?").run(TEAM_ID, saschaUserId);
  }

  // 2) Team-Trainer setzen
  db.prepare("UPDATE teams SET trainer_id=? WHERE id=?").run(saschaUserId, TEAM_ID);

  // 3) Laurent User: kein Trainer mehr -> Spieler
  db.prepare("UPDATE users SET role='spieler' WHERE id=?").run(LAURENT_USER_ID);

  // 4) Sascha Member: kein Spieler; als Offiziell markieren
  db.prepare("UPDATE members SET member_type=NULL WHERE id=?").run(SASCHA_MEMBER_ID);
  const hasFn = db.prepare("SELECT 1 FROM member_functions WHERE member_id=? AND function='officiel'").get(SASCHA_MEMBER_ID);
  if (!hasFn) {
    db.prepare("INSERT INTO member_functions (member_id, function, team_id, created_at) VALUES (?,?,?,?)")
      .run(SASCHA_MEMBER_ID, "officiel", TEAM_ID, new Date().toISOString());
  }

  // 5) Laurent Member: wieder Spieler im Seniors-Kader
  db.prepare("UPDATE members SET team_id=?, cat_code=11, flh_category='Seniors - Hommes' WHERE id=?")
    .run(TEAM_ID, LAURENT_MEMBER_ID);

  return saschaUserId;
});
const saschaUserId = tx();

console.log("\n>>> FERTIG.");
console.log(`   Trainer Seniors 1 = Sascha Marzadori (User-ID ${saschaUserId})`);
console.log(`   Login: ${SASCHA_EMAIL} / ${SASCHA_TEMP_PW}  (bitte nach erstem Login ändern)`);
console.log("   Laurent Metzler = Spieler (Seniors 1), kein Trainer mehr.");
db.close();

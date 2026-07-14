const Database = require("better-sqlite3");

const memberId = Number(process.argv[2]);
const fn = (process.argv[3] || "").trim().toLowerCase();
const VALID = ["joueur", "arbitre", "officiel", "comite", "coach", "coach_backup", "teamchef", "teambegleeder", "supervisor", "benevole", "benevole_licence", "contact_famille", "mere_accueil"];

if (!memberId || !VALID.includes(fn)) {
  console.error("Usage: node script/add-member-function.cjs <memberId> <function>");
  console.error("Functions:", VALID.join(", "));
  process.exit(1);
}

const db = new Database("data.db");
const existing = db.prepare("SELECT 1 FROM member_functions WHERE member_id = ? AND function = ?").get(memberId, fn);
if (existing) {
  console.log("Bereits vorhanden:", memberId, fn);
  process.exit(0);
}

db.prepare("INSERT INTO member_functions (member_id, function, note) VALUES (?, ?, ?)").run(memberId, fn, "manuel");
console.log("Hinzugefügt:", memberId, fn);

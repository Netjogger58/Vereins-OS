const Database = require("better-sqlite3");

const memberId = Number(process.argv[2]);
const teamId = Number(process.argv[3]);

if (!memberId || !teamId) {
  console.error("Usage: node script/assign-member-team.cjs <memberId> <teamId>");
  process.exit(1);
}

const db = new Database("data.db");
const member = db.prepare("SELECT id, name FROM members WHERE id = ?").get(memberId);
const team = db.prepare("SELECT id, name FROM teams WHERE id = ?").get(teamId);

if (!member) {
  console.error("Member not found:", memberId);
  process.exit(1);
}
if (!team) {
  console.error("Team not found:", teamId);
  process.exit(1);
}

db.prepare("UPDATE members SET team_id = ? WHERE id = ?").run(teamId, memberId);
console.log(`Assigned ${member.name} (ID ${memberId}) to team ${team.name} (ID ${teamId}).`);

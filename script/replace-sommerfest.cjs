// Ersetzt die "Sommerfest"-Ankündigung durch "Save the Date" (20.09.2026).
const Database = require("better-sqlite3");
const db = new Database("data.db");

const row = db.prepare("SELECT id,title FROM announcements WHERE title LIKE '%Sommerfest%'").get();
if (!row) {
  console.log("Keine Sommerfest-Ankündigung gefunden.");
  process.exit(0);
}

const title = "Save the Date";
const content =
  "20.09.2026 — Spannung !! ??\n\n" +
  "Halt Iech den Datum fräi. Méi Infoen ganz geschwënn!";

db.prepare("UPDATE announcements SET title = ?, content = ?, pinned = 1 WHERE id = ?").run(title, content, row.id);
console.log(`Ersetzt: id ${row.id} ("${row.title}") -> "${title}" (angeheftet).`);
console.table(db.prepare("SELECT id,title,target_role,pinned FROM announcements ORDER BY id DESC").all());
db.close();

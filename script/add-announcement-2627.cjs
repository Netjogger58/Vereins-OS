// Legt die Ankündigung "Willkommen zur Saison 2026/27" mit Link zur Homepage an.
const Database = require("better-sqlite3");
const db = new Database("data.db");

const title = "Willkommen zur Saison 2026/27";
const content =
  "Neue Trainingszeiten sind da!\n\n" +
  "Alle Trainingszeiten der Saison 2026/2027 findet Ihr auf unserer Homepage:\n" +
  "https://mersch75.lu/training.html";

// Autor: Präsident (id 1)
const authorId = 1;

const exists = db.prepare("SELECT id FROM announcements WHERE title = ?").get(title);
if (exists) {
  console.log(`Bereits vorhanden (id ${exists.id}) — nichts eingefügt.`);
} else {
  const info = db
    .prepare(
      "INSERT INTO announcements (title, content, author_id, target_role, target_team_id, pinned, created_at) VALUES (?, ?, ?, 'all', NULL, 1, ?)"
    )
    .run(title, content, authorId, new Date().toISOString());
  console.log(`Angelegt — id ${info.lastInsertRowid} (angeheftet, Zielgruppe: alle).`);
}

console.table(db.prepare("SELECT id,title,target_role,pinned,created_at FROM announcements ORDER BY id DESC LIMIT 3").all());
db.close();

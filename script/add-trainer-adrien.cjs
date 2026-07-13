// Legt für Adrien Deischter (Member 2009) ein Trainer-Benutzerkonto an
// und verknüpft den Member. Idempotent: existiert die E-Mail bereits, wird nichts angelegt.
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const DB_PATH = 'data.db';
const EMAIL = 'adrien.deischter@mersch75.lu';
const NAME = 'Adrien Deischter';
const TEAM_ID = 1; // Seniors 1
const MEMBER_ID = 2009;
const PASSWORD = 'demo123';

const db = new Database(DB_PATH);

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(EMAIL);
if (existing) {
  console.log('Konto existiert bereits (id ' + existing.id + ') – nichts geändert.');
  process.exit(0);
}

const backup = 'data.backup-add-adrien-' + new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.db';
fs.copyFileSync(DB_PATH, backup);
console.log('Backup:', backup);

const hash = bcrypt.hashSync(PASSWORD, 10);
const info = db.prepare(
  'INSERT INTO users (email, password_hash, name, role, team_id, country_code, active, created_at) VALUES (?,?,?,?,?,?,?,?)'
).run(EMAIL, hash, NAME, 'trainer', TEAM_ID, '+352', 1, new Date().toISOString());

const userId = info.lastInsertRowid;
db.prepare('UPDATE members SET user_id = ? WHERE id = ?').run(userId, MEMBER_ID);

console.log('Trainer-Konto angelegt: id ' + userId + ' | ' + EMAIL + ' | Passwort: ' + PASSWORD);
console.log('Member ' + MEMBER_ID + ' verknüpft.');

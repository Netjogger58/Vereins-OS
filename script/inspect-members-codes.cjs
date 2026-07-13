const Database = require('better-sqlite3');
const db = new Database('data.db', { readonly: true });

const cols = db.prepare('PRAGMA table_info(members)').all().map(c => c.name);
console.log('member columns:', cols.join(', '));

const n = db.prepare('SELECT COUNT(*) AS c FROM members').get().c;
const wc = db.prepare("SELECT COUNT(*) AS c FROM members WHERE card_id IS NOT NULL AND card_id <> ''").get().c;
console.log('members total:', n, '| mit card_id:', wc);

const sample = db.prepare('SELECT id, name, first_name, card_id, cat_code, family_code, membership_status FROM members LIMIT 8').all();
console.log(JSON.stringify(sample, null, 1));

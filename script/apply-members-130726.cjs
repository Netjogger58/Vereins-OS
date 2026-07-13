// Aktualisiert Members aus der neuen Liste (M75 Membres 130726.xlsx):
//   family_code (Courrier-Code), internal_category, flh_category
// Standard: Dry-Run (zeigt nur Änderungen). Mit --apply werden Änderungen geschrieben
// (vorher wird automatisch ein DB-Backup erstellt).
const XLSX = require('xlsx');
const Database = require('better-sqlite3');
const fs = require('fs');

const APPLY = process.argv.includes('--apply');
const XLSX_PATH = '/Users/netjogger58/CascadeProjects/mersch75test.github.io/assets/M75 Membres 130726.xlsx';
const DB_PATH = 'data.db';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const sortKey = (s) => norm(s).split(' ').sort().join(' ');

const db = new Database(DB_PATH);
const members = db.prepare(
  'SELECT id, name, first_name, last_name, family_code, internal_category, flh_category FROM members'
).all();

const byKey = new Map();
for (const m of members) {
  const k1 = sortKey(`${m.first_name || ''} ${m.last_name || ''}`);
  const k2 = sortKey(m.name);
  if (k1.trim() && !byKey.has(k1)) byKey.set(k1, m);
  if (!byKey.has(k2)) byKey.set(k2, m);
}

const wb = XLSX.readFile(XLSX_PATH);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
const COL = { nom: 0, prenom: 1, courrier: 7, catInterne: 10, catFlh: 12 };

const changes = [];
let unmatched = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const nom = String(r[COL.nom] || '').trim();
  const prenom = String(r[COL.prenom] || '').trim();
  if (!nom && !prenom) continue;

  const m = byKey.get(sortKey(`${prenom} ${nom}`));
  if (!m) { unmatched++; continue; }

  const neu = {
    family_code: String(r[COL.courrier] || '').trim(),
    internal_category: String(r[COL.catInterne] || '').trim(),
    flh_category: String(r[COL.catFlh] || '').trim(),
  };

  const diff = {};
  for (const f of ['family_code', 'internal_category', 'flh_category']) {
    const alt = String(m[f] || '').trim();
    if (neu[f] && neu[f] !== alt) diff[f] = { alt, neu: neu[f] };
  }
  if (Object.keys(diff).length) changes.push({ id: m.id, name: `${prenom} ${nom}`, diff });
}

console.log(`\n=== ${APPLY ? 'APPLY' : 'DRY-RUN'} ===`);
console.log(`Änderungen: ${changes.length} | nicht in DB: ${unmatched}\n`);
for (const c of changes) {
  const parts = Object.entries(c.diff).map(([f, v]) => `${f}: "${v.alt}" -> "${v.neu}"`);
  console.log(`  ${c.name}\n     ${parts.join('\n     ')}`);
}

if (APPLY && changes.length) {
  const backup = `data.backup-before-130726-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}.db`;
  fs.copyFileSync(DB_PATH, backup);
  console.log(`\nBackup erstellt: ${backup}`);
  const upd = db.prepare('UPDATE members SET family_code=?, internal_category=?, flh_category=? WHERE id=?');
  const tx = db.transaction((list) => {
    for (const c of list) {
      const m = members.find((x) => x.id === c.id);
      upd.run(
        c.diff.family_code ? c.diff.family_code.neu : (m.family_code || null),
        c.diff.internal_category ? c.diff.internal_category.neu : (m.internal_category || null),
        c.diff.flh_category ? c.diff.flh_category.neu : (m.flh_category || null),
        c.id
      );
    }
  });
  tx(changes);
  console.log(`${changes.length} Members aktualisiert.`);
} else if (!APPLY) {
  console.log('\n(Dry-Run – nichts geschrieben. Mit --apply anwenden.)');
}

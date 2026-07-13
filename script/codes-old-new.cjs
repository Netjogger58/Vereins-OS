// Erstellt eine Vergleichsliste "alter Code (DB) ↔ neuer Code (neue Membersliste)"
// und speichert sie als Excel-Datei auf dem Desktop.
const XLSX = require('xlsx');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const XLSX_PATH = '/Users/netjogger58/CascadeProjects/mersch75test.github.io/assets/M75 Membres 130726.xlsx';
const OUT_PATH = path.join(os.homedir(), 'Desktop', 'M75_Codes_alt_neu_130726.xlsx');

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function nameKey(a, b) {
  return norm(`${a} ${b}`).split(' ').sort().join(' ');
}

// Neues CAT-Code-Schema (siehe docs/kategorien-neuordnung.md §2 / CAT_CODE_LABELS)
const CAT_CODE_LABELS = {
  11: 'Seniors H', 12: 'U21 H', 13: 'U17 H', 14: 'U15 H', 15: 'U13 H',
  16: 'U11 H', 17: 'U9 H', 18: 'U7 H', 19: 'U4 H', 20: 'Vétérans H', 21: 'Arbitre H',
  31: 'Seniors FE', 32: 'U21FE', 33: 'U17FE', 34: 'U15F', 35: 'U13F',
  36: 'U11F', 37: 'U9F', 38: 'U7F', 39: 'U4F', 40: 'Vétérans FE', 41: 'Arbitre FE',
};

// Vollständige Neu-Staffelung ALLER Codes (docs/kategorien-neuordnung.md §3-§8).
// Löst den neuen Code + Label anhand des Kategorie-Textes (zuverlässiger als die alte Zahl).
function resolveNewCode(text, catCodeDb) {
  const t = String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (!t || t === '#n/a' || /a completer|à compléter|complet/.test(t)) return { code: '', label: 'zu vervollständigen' };
  // Funktionen (§3)
  if (/officiel/.test(t)) return /\bd\b|dame|f\b|fe\b/.test(t) ? { code: 4, label: 'Officiel F' } : { code: 2, label: 'Officiel H' };
  if (/comite|comité/.test(t)) return { code: 1, label: 'Comité' };
  if (/arbitre/.test(t)) return /dame|f\b|fe/.test(t) ? { code: 41, label: 'Arbitre FE' } : { code: 21, label: 'Arbitre H' };
  // Mitgliedsart (§7)
  if (/honoraire/.test(t)) return { code: 62, label: 'Membre honoraire' };
  if (/sponsor/.test(t)) return { code: 63, label: 'Sponsor' };
  if (/donateur/.test(t)) return /licenc/.test(t) ? { code: 61, label: 'Donateur licencié' } : { code: 60, label: 'Donateur' };
  // Kontakt / Info (§8)
  if (/mere|mère|pere|père|accueil/.test(t)) return { code: 71, label: "Mère/Père d'accueil" };
  if (/contact|famille/.test(t)) return { code: 70, label: 'Contact famille' };
  // Transfer / Prêt (§6)
  if (/pret|prêt/.test(t)) {
    if (/gratui/.test(t)) return { code: 93, label: 'Prêt gratuit' };
    if (/entree|entrée|entr/.test(t)) return { code: 91, label: 'Prêt entrée' };
    return { code: 90, label: 'Prêt sortie' };
  }
  if (/transfert/.test(t)) return /entrant|entree|entrée/.test(t) ? { code: 92, label: 'Transfert entrant' } : { code: 94, label: 'Transfert sortant' };
  // Status (§4)
  if (/arret|arrêt/.test(t)) return /jeune|garder/.test(t) ? { code: 85, label: 'Abbruch jung (Lizenz behalten)' } : { code: 82, label: 'Arrêt temporaire' };
  // Spielkategorie -> aus DB cat_code (bereits korrekt gestaffelt)
  if (catCodeDb && CAT_CODE_LABELS[catCodeDb]) return { code: catCodeDb, label: CAT_CODE_LABELS[catCodeDb] };
  return { code: '', label: '' };
}

// 1) DB einlesen
const db = new Database('data.db', { readonly: true });
const members = db.prepare(
  'SELECT id, name, first_name, last_name, card_id, family_code, cat_code, internal_category, membership_status FROM members'
).all();

const byKey = new Map();
for (const m of members) {
  const key = nameKey(m.first_name || m.name, m.last_name || '');
  const key2 = norm(m.name).split(' ').sort().join(' ');
  if (!byKey.has(key)) byKey.set(key, m);
  if (!byKey.has(key2)) byKey.set(key2, m);
}

// 2) Excel einlesen
const wb = XLSX.readFile(XLSX_PATH);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

const COL = { nom: 0, prenom: 1, courrier: 7, catCodeOld: 9, catInterne: 10, catFlh: 12 };

const out = [];
let matched = 0, unmatched = 0, noNewCode = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const nom = String(r[COL.nom] || '').trim();
  const prenom = String(r[COL.prenom] || '').trim();
  if (!nom && !prenom) continue;

  const key = nameKey(prenom, nom);
  const m = byKey.get(key) || byKey.get(norm(`${prenom} ${nom}`).split(' ').sort().join(' '));

  const neuCourrier = String(r[COL.courrier] || '').trim();
  const katText = String(r[COL.catInterne] || r[COL.catFlh] || '').trim();
  const altCatCode = String(r[COL.catCodeOld] || '').trim(); // alter Code aus der Liste (z.B. 212, 18, 1, 150)
  const nc = resolveNewCode(katText, m ? m.cat_code : null);  // vollständige Neu-Staffelung

  if (m) matched++; else unmatched++;
  if (!nc.code) noNewCode++;

  out.push({
    'Nom': nom,
    'Prénom': prenom,
    'Card-ID (DB)': m ? (m.card_id || '') : '',
    'Alter Courrier-Code': m ? (m.family_code || '') : '',
    'Neuer Courrier-Code (Liste)': neuCourrier,
    'Courrier geändert': m ? ((m.family_code || '') !== neuCourrier ? 'JA' : '') : 'NICHT IN DB',
    'Alter Code (Liste)': altCatCode,
    'Neuer Code (Staffelung)': nc.code,
    'Neu — Bedeutung': nc.label,
    'Kategorie-Text (Liste)': katText,
    'Status (DB)': m ? (m.membership_status || '') : '',
  });
}

// 3) Excel schreiben
const ws = XLSX.utils.json_to_sheet(out);
ws['!cols'] = [
  { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 18 }, { wch: 22 },
  { wch: 15 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 12 },
];
const outWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outWb, ws, 'Codes alt-neu');
XLSX.writeFile(outWb, OUT_PATH);

console.log(`Zeilen: ${out.length} | in DB gefunden: ${matched} | nicht gefunden: ${unmatched}`);
console.log(`Ohne neuen Code (zu vervollständigen): ${noNewCode}`);
console.log('Gespeichert:', OUT_PATH);

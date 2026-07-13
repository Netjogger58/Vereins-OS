// Schreibt die komplette Code-Zuordnung (alle 70 Codes aus Blatt "TABLES")
// in das Blatt "Tables new" der bestehenden Datei M75_Codes_alt_neu_130726.xlsx.
// Andere Blätter bleiben erhalten.
const XLSX = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');

const SRC = '/Users/netjogger58/CascadeProjects/GC 2026-07-01-MEMBERSLESCHT 2026-2027 (base de départ nouvelle Saison).xlsx';
const TARGET = path.join(os.homedir(), 'Desktop', 'M75_Codes_alt_neu_130726.xlsx');
const SHEET = 'Tables new';

function mapCode(code, desc) {
  const d = String(desc || '').toLowerCase();
  const M = {
    '0':  { neu: '',   bereich: 'offen',              z: 'noch zu bestimmen (CAT à compléter)' },
    '1':  { neu: '2',  bereich: 'Funktion',           z: 'Officiel H' },
    '2':  { neu: '11', bereich: 'Spielkategorie',     z: 'Seniors H' },
    '3':  { neu: '12', bereich: 'Spielkategorie',     z: 'U21 H' },
    '4':  { neu: '13', bereich: 'Spielkategorie',     z: 'U17 H' },
    '5':  { neu: '14', bereich: 'Spielkategorie',     z: 'U15 H' },
    '6':  { neu: '15', bereich: 'Spielkategorie',     z: 'U13 H' },
    '7':  { neu: '16', bereich: 'Spielkategorie',     z: 'U11 H' },
    '8':  { neu: '17', bereich: 'Spielkategorie',     z: 'U9 H' },
    '9':  { neu: '20', bereich: 'Spielkategorie',     z: 'Vétérans H' },
    '10': { neu: '21', bereich: 'Funktion/Kategorie', z: 'Arbitre H (21) / F (41)' },
    '11': { neu: '4',  bereich: 'Funktion',           z: 'Officiel F' },
    '12': { neu: '31', bereich: 'Spielkategorie',     z: 'Seniors / Dames' },
    '14': { neu: '33', bereich: 'Spielkategorie',     z: 'U17 F' },
    '15': { neu: '35', bereich: 'Spielkategorie',     z: 'U13 F' },
    '16': { neu: '34', bereich: 'Spielkategorie',     z: 'U15 F' },
    '17': { neu: '36', bereich: 'Spielkategorie',     z: 'U11 F' },
    '18': { neu: '37', bereich: 'Spielkategorie',     z: 'U9 F' },
    '20': { neu: '19', bereich: 'Spielkategorie',     z: 'U4 (Mixte) → U4 H 19 / U4 F 39' },
    '21': { neu: '18', bereich: 'Spielkategorie',     z: 'U7 (Mixte)' },
    '50': { neu: '50', bereich: 'Bénévole',           z: 'Bénévole (allgemein)' },
    '102':{ neu: '11+21', bereich: 'Kombi → getrennt', z: 'Seniors H (11) + Arbitre (21)' },
    '109':{ neu: '20+21', bereich: 'Kombi → getrennt', z: 'Vétérans H (20) + Arbitre (21)' },
    '112':{ neu: '87', bereich: 'Status',             z: 'intern gesperrt (global, geschlechtsunabhängig)' },
    '150':{ neu: '1',  bereich: 'Funktion',           z: 'Comité (H=1 / F=3)' },
    '188':{ neu: '81', bereich: 'Status + Lizenz',    z: 'inaktiv, Lizenz-Status "behalten"' },
    '200':{ neu: '60', bereich: 'Mitgliedsart',       z: 'Donateur' },
    '201':{ neu: '61', bereich: 'Mitgliedsart',       z: 'Donateur licencié' },
    '202':{ neu: '62', bereich: 'Mitgliedsart',       z: 'Membre honoraire' },
    '210':{ neu: '70', bereich: 'Kontakt / Info',     z: 'Contact famille (M)' },
    '211':{ neu: '70', bereich: 'Kontakt / Info',     z: 'Contact famille (F)' },
    '212':{ neu: '70', bereich: 'Kontakt / Info',     z: 'Contact famille' },
    '213':{ neu: '71', bereich: 'Kontakt / Info',     z: "Mère / Père d'accueil" },
    '214':{ neu: '51', bereich: 'Bénévole',           z: 'Bénévole Famille' },
    '215':{ neu: '52', bereich: 'Bénévole',           z: 'Bénévole avec Licence' },
    '220':{ neu: '82', bereich: 'Status',             z: 'Arrêt temporaire' },
    '221':{ neu: '82', bereich: 'Status + Lizenz',    z: 'Arrêt temporaire (licencié) — Lizenz behalten' },
    '240':{ neu: '86', bereich: 'Status',             z: 'Ancien membre (ehemalig)' },
    '250':{ neu: '84', bereich: 'Status',             z: 'Abandon / Abbruch' },
    '251':{ neu: '84', bereich: 'Status + Lizenz',    z: 'Abandon (licencié) — Lizenz behalten' },
    '252':{ neu: '85', bereich: 'Status + Lizenz',    z: 'Arrêt jeune, Lizenz "behalten"' },
    '253':{ neu: '85', bereich: 'Status + Kontakt',   z: 'Arrêt jeune + Contact famille löschen' },
    '254':{ neu: '81', bereich: 'Status',             z: 'inactif' },
    '255':{ neu: '82', bereich: 'Status',             z: 'Arrêt' },
    '256':{ neu: '84', bereich: 'Status + Lizenz',    z: 'Arrêt — Lizenz-Status "gelöscht"' },
    '300':{ neu: '90', bereich: 'Transfer / Prêt',    z: 'Prêt, sortie Mersch75 (raus)' },
    '301':{ neu: '91', bereich: 'Transfer / Prêt',    z: 'Prêt, entrée Mersch75 (rein)' },
    '302':{ neu: '92', bereich: 'Transfer / Prêt',    z: 'Transfert entrant direct (in Diskussion)' },
    '303':{ neu: '93', bereich: 'Transfer / Prêt',    z: 'Prêt gratuit (pas équipe club origine)' },
    '304':{ neu: '94', bereich: 'Transfer / Prêt',    z: 'Transfert vers autre club (raus)' },
    '976':{ neu: '83', bereich: 'Status',             z: 'pausiert (Verletzung) — stoppt Wettkampf' },
    '977':{ neu: '83', bereich: 'Status',             z: 'blessé, wartet auf Genesung' },
    '978':{ neu: '—',  bereich: 'Zahlung + Funktion', z: 'impayé → Zahlung "offen"; ggf. Officiel / Coach backup' },
    '979':{ neu: '—',  bereich: 'Zahlung + Lizenz',   z: 'impayé jeune → Zahlung "offen" + Lizenz "behalten"' },
    '980':{ neu: '63', bereich: 'Mitgliedsart + Lizenz', z: 'Sponsor + Lizenz "behalten"' },
    '981':{ neu: '—',  bereich: 'Zahlung + Lizenz',   z: 'impayé, Lizenz gelöscht, in Liste behalten' },
    '982':{ neu: '—',  bereich: 'Zahlung + Lizenz',   z: 'impayé → Zahlung "offen" + Lizenz "behalten" (potentiel tft)' },
    '983':{ neu: '—',  bereich: 'Status + Kommentar', z: 'Abbruch 2017-18 → Freitext-Kommentar' },
    '984':{ neu: '86', bereich: 'Status + Kommentar', z: 'ancien, potentiel officiel → Kommentar' },
    '985':{ neu: '—',  bereich: 'Status + Kontakt',   z: 'Arrêt personne de contact (arrêt jeunes)' },
    '988':{ neu: '81', bereich: 'Status + Lizenz',    z: 'inactif, payé, Lizenz "behalten"' },
    '991':{ neu: '—',  bereich: 'Lizenz + Liste',     z: 'Lizenz "gelöscht" + aus Memberslist entfernen' },
    '992':{ neu: '—',  bereich: 'Zahlung + Lizenz',   z: 'impayé → Zahlung "offen" + Lizenz "behalten" (remotiver)' },
    '993':{ neu: '—',  bereich: 'Lizenz',             z: 'Lizenz-Status "gelöscht"' },
    '994':{ neu: '—',  bereich: 'Liste',              z: 'aus Memberslist entfernen' },
    '996':{ neu: '—',  bereich: 'Status + Zahlung',   z: 'jeune inactif, impayé → Zahlung "offen" + Kommentar' },
    '997':{ neu: '—',  bereich: 'Status + Zahlung',   z: 'adulte inactif, impayé → Zahlung "offen" + Kommentar' },
    '999':{ neu: '—',  bereich: 'Kommentar',          z: 'Divers → Freitext-Kommentar' },
  };
  if (code === '19') {
    if (/veteran|vétéran/.test(d)) return { neu: '40', bereich: 'Spielkategorie', z: 'Vétérans F' };
    return { neu: '38', bereich: 'Spielkategorie', z: 'U7 F' };
  }
  return M[code] || { neu: '?', bereich: '', z: '(nicht zugeordnet — bitte prüfen)' };
}

// 1) Quell-Codeliste lesen
const src = XLSX.readFile(SRC);
const rows = XLSX.utils.sheet_to_json(src.Sheets['TABLES'], { header: 1, defval: '', raw: false });
const aoa = [['Alter Code', 'Original-Beschreibung (FR)', 'Neuer Code', 'Zuordnung (Bereich)', 'Erklärung / Neu']];
let n = 0;
for (let i = 0; i < rows.length; i++) {
  const code = String(rows[i][0] || '').trim();
  const desc = String(rows[i][1] || '').trim();
  if (!code || !/^[0-9]+[A-Za-z]?$/.test(code)) continue;
  const mp = mapCode(code, desc);
  aoa.push([code, desc, mp.neu, mp.bereich, mp.z]);
  n++;
}

// 2) Zielarbeitsmappe öffnen (bestehende Blätter behalten)
if (!fs.existsSync(TARGET)) { console.error('Zieldatei fehlt:', TARGET); process.exit(1); }
const wb = XLSX.readFile(TARGET);

const ws = XLSX.utils.aoa_to_sheet(aoa);
ws['!cols'] = [{ wch: 10 }, { wch: 42 }, { wch: 11 }, { wch: 22 }, { wch: 52 }];
ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: aoa.length - 1, c: 4 } }) };

// Blatt "Tables new" setzen/ersetzen
if (!wb.SheetNames.includes(SHEET)) wb.SheetNames.push(SHEET);
wb.Sheets[SHEET] = ws;

XLSX.writeFile(wb, TARGET);
console.log(`"${SHEET}" mit ${n} Codes geschrieben. Blätter jetzt: ${wb.SheetNames.join(', ')}`);

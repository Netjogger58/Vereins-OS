// Vollständige Zuordnungstabelle: JEDE alte Nummer -> neuer Code + Erklärung.
// Quelle: docs/kategorien-neuordnung.md (§2–§10). Blatt "Tabelle1".
const XLSX = require('xlsx');
const path = require('path');
const os = require('os');

const OUT_PATH = path.join(os.homedir(), 'Desktop', 'M75_Codes_Zuordnung_komplett.xlsx');

// [alter Code, neuer Code, Bereich, Erklärung / Zuordnung]
const rows = [
  // ── Funktionen (im alten System niedrige Zahlen) ──
  [1,   2,  'Funktion',            'Officiel H'],
  [11,  4,  'Funktion',            'Officiel F'],
  [150, 1,  'Funktion',            'Comité (H=1 / F=3)'],
  [109, 21, 'Funktion + Kategorie','Vétéran + Arbitre H → 20 (Vétérans H) + 21 (Arbitre)'],
  [102, '', 'Kombi (aufgelöst)',   'alter Kombi-Code Spieler+Officiel → Spielkategorie + Funktion 2/4'],
  [1019,'', 'Kombi (aufgelöst)',   'alter Kombi-Code → Spielkategorie + passende Funktion'],
  [151, '', 'Kombi (aufgelöst)',   'alter Kombi-Code → Spielkategorie + Funktion(en)'],
  [152, '', 'Kombi (aufgelöst)',   'alter Kombi-Code → Spielkategorie + Funktion(en)'],

  // ── Spielkategorie Hommes (§2) ──
  [2, 11, 'Spielkategorie Hommes', 'Seniors H'],
  [3, 12, 'Spielkategorie Hommes', 'U21 H'],
  [4, 13, 'Spielkategorie Hommes', 'U17 H'],
  [5, 14, 'Spielkategorie Hommes', 'U15 H'],
  [6, 15, 'Spielkategorie Hommes', 'U13 H'],
  [7, 16, 'Spielkategorie Hommes', 'U11 H'],
  [8, 17, 'Spielkategorie Hommes', 'U9 H'],
  [9, 20, 'Spielkategorie Hommes', 'Vétérans H'],
  [21, 18,'Spielkategorie Mixte',  'U7 (Mixte)'],

  // ── Spielkategorie Dames (§2) ──
  [12, 31, 'Spielkategorie Dames', 'Seniors / Dames'],
  [13, 32, 'Spielkategorie Dames', 'U21 F'],
  [14, 33, 'Spielkategorie Dames', 'U17 F'],
  [16, 34, 'Spielkategorie Dames', 'U15 F'],
  [15, 35, 'Spielkategorie Dames', 'U13 F'],
  [17, 36, 'Spielkategorie Dames', 'U11 F'],
  [18, 37, 'Spielkategorie Dames', 'U9 F'],
  [19, 40, 'Spielkategorie Dames', 'Vétérans F'],

  // ── Mitgliedsart (§7) ──
  [200, 60, 'Mitgliedsart', 'Donateur'],
  [201, 61, 'Mitgliedsart', 'Donateur licencié'],
  [202, 62, 'Mitgliedsart', 'Membre honoraire (Ehrenmitglied)'],
  [980, 63, 'Mitgliedsart', 'Sponsor (veut garder licence) — zusätzl. Lizenz-Status "behalten"'],

  // ── Kontakt / Info (§8) ──
  [210, 70, 'Kontakt / Info', 'Contact famille (M)'],
  [211, 70, 'Kontakt / Info', 'Contact famille'],
  [212, 70, 'Kontakt / Info', 'Contact famille (F / allg.)'],
  [213, 71, 'Kontakt / Info', "Mère / Père d'accueil (Gastmutter)"],

  // ── Mitglieds-Status (§4) ──
  [112, 87, 'Status', 'intern gesperrt (global, geschlechtsunabhängig)'],
  [188, 81, 'Status', 'inaktiv (garder licence) — Lizenz-Status "behalten"'],
  [220, 82, 'Status', 'Arrêt temporaire'],
  [221, 82, 'Status', 'Arrêt temporaire'],
  [240, 86, 'Status', 'Ancien membre (ehemalig)'],
  [250, 84, 'Status', 'Abandon / Abbruch'],
  [252, 85, 'Status', 'Arrêt jeune (garder licence) — Abbruch jung, Lizenz behalten'],
  [253, 85, 'Status', 'Abbruch jung (garder licence)'],
  [255, 81, 'Status', 'inaktiv'],
  [256, 84, 'Status', 'Abbruch (supprimer licence) — Lizenz-Status "gelöscht"'],
  [976, 83, 'Status', 'pausiert (Verletzung)'],
  [977, 83, 'Status', 'pausiert (Verletzung)'],

  // ── Transfer / Prêt (§6) ──
  [300, 90, 'Transfer / Prêt', 'Prêt, sortie Mersch75 (raus)'],
  [301, 91, 'Transfer / Prêt', 'Prêt, entrée Mersch75 (rein)'],
  [302, 92, 'Transfer / Prêt', 'Transfert entrant direct (rein)'],
  [303, 93, 'Transfer / Prêt', 'Prêt gratuit (pas équipe club origine)'],
  [304, 94, 'Transfer / Prêt', 'Transfert vers autre club (raus)'],

  // ── Lizenz-Status → eigenes Feld, KEIN Kategorie-Code (§5) ──
  [979, '', 'Lizenz-Status / Zahlung', 'impayé + garder licence → Lizenz "behalten" + Zahlungsstatus "offen"'],
  [982, '', 'Lizenz-Status / Zahlung', 'impayé + garder licence → Lizenz "behalten" + Zahlungsstatus "offen"'],
  [988, '', 'Lizenz-Status / Zahlung', 'impayé + garder licence → Lizenz "behalten" + Zahlungsstatus "offen"'],
  [992, '', 'Lizenz-Status / Zahlung', 'impayé + garder licence → Lizenz "behalten" + Zahlungsstatus "offen"'],
  [991, '', 'Lizenz-Status',          'supprimer licence → Lizenz-Status "gelöscht"'],
  [993, '', 'Lizenz-Status',          'supprimer licence → Lizenz-Status "gelöscht"'],

  // ── Zahlungsstatus → Finanzmodul, KEIN Kategorie-Code (§9) ──
  [978, '', 'Zahlungsstatus', 'impayé → Zahlungsstatus "offen" (Finanzmodul)'],
  [981, '', 'Zahlungsstatus', 'impayé → Zahlungsstatus "offen" (Finanzmodul)'],
  [996, '', 'Zahlungsstatus / Notiz', 'impayé + "analyse 08-2017 si potentiel" → Zahlung offen + Kommentar'],
  [997, '', 'Zahlungsstatus / Notiz', 'impayé + "analyse 08-2017 si potentiel" → Zahlung offen + Kommentar'],

  // ── Freitext / Notiz → Kommentarfeld, KEIN Code (§10) ──
  [999, '', 'Kommentar', 'Divers voir commentaires → Freitext-Kommentar'],
  [983, '', 'Kommentar', 'svt mail 10-2017 → Freitext-Kommentar'],
];

const header = ['Alter Code', 'Neuer Code', 'Zuordnung (Bereich)', 'Erklärung'];
const aoa = [header, ...rows.map(r => [r[0], r[1] === '' ? '—' : r[1], r[2], r[3]])];

const ws = XLSX.utils.aoa_to_sheet(aoa);
ws['!cols'] = [{ wch: 11 }, { wch: 11 }, { wch: 24 }, { wch: 70 }];
ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: header.length - 1 } }) };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Tabelle1');
XLSX.writeFile(wb, OUT_PATH);

console.log(`Vollständige Zuordnung: ${rows.length} alte Codes -> gespeichert:`, OUT_PATH);

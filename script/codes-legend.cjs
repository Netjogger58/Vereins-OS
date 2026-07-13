// Erstellt eine separate Excel-Datei mit der Erklärung ALLER neuen Codes
// (Neu-Staffelung, docs/kategorien-neuordnung.md) im Blatt "Tabelle1".
const XLSX = require('xlsx');
const path = require('path');
const os = require('os');

const OUT_PATH = path.join(os.homedir(), 'Desktop', 'M75_Code_Legende.xlsx');

// [Neuer Code, Bereich/Block, Bedeutung, alter Code (Liste), Hinweis]
const rows = [
  // Spielkategorie Hommes (§2)
  [11, 'Spielkategorie Hommes', 'Seniors H', '2', ''],
  [12, 'Spielkategorie Hommes', 'U21 H', '3', ''],
  [13, 'Spielkategorie Hommes', 'U17 H', '4', ''],
  [14, 'Spielkategorie Hommes', 'U15 H', '5', ''],
  [15, 'Spielkategorie Hommes', 'U13 H', '6', ''],
  [16, 'Spielkategorie Hommes', 'U11 H', '7', ''],
  [17, 'Spielkategorie Hommes', 'U9 H', '8', ''],
  [18, 'Spielkategorie Hommes', 'U7 (Mixte)', '21', 'U7 wird gemischt geführt'],
  [19, 'Spielkategorie Hommes', 'U4 H (KidsSports)', '', ''],
  [20, 'Spielkategorie Hommes', 'Vétérans H', '9', ''],
  [21, 'Spielkategorie Hommes', 'Arbitre H', '', 'Schiedsrichter Hommes'],
  // Spielkategorie Dames (§2)
  [31, 'Spielkategorie Dames', 'Seniors / Dames', '12', ''],
  [32, 'Spielkategorie Dames', 'U21 F', '13', ''],
  [33, 'Spielkategorie Dames', 'U17 F', '14', ''],
  [34, 'Spielkategorie Dames', 'U15 F', '16', ''],
  [35, 'Spielkategorie Dames', 'U13 F', '15', ''],
  [36, 'Spielkategorie Dames', 'U11 F', '17', ''],
  [37, 'Spielkategorie Dames', 'U9 F', '18', ''],
  [38, 'Spielkategorie Dames', 'U7 F', '', ''],
  [39, 'Spielkategorie Dames', 'U4 F', '', ''],
  [40, 'Spielkategorie Dames', 'Vétérans F', '19', ''],
  [41, 'Spielkategorie Dames', 'Arbitre F', '', 'Schiedsrichterin'],
  // Funktionen (§3)
  [1, 'Funktion', 'Comité (H)', '150', 'Vorstandsmitglied'],
  [3, 'Funktion', 'Comité (F)', '', ''],
  [2, 'Funktion', 'Officiel H', '1', ''],
  [4, 'Funktion', 'Officiel F', '11', ''],
  [21, 'Funktion', 'Arbitre H', '109', 'auch als Kategorie 21'],
  [41, 'Funktion', 'Arbitre F', '', ''],
  // Bénévole / Trainer (§3b, 50er)
  [50, 'Bénévole / Trainer', 'Bénévole (allgemein)', '', ''],
  [51, 'Bénévole / Trainer', 'Bénévole Famille (Getränke, Grill…)', '', ''],
  [52, 'Bénévole / Trainer', 'Bénévole avec Licence (z.B. Chrono)', '', ''],
  [53, 'Bénévole / Trainer', 'Entraîneur / Coach', '', 'Trainerschein in Qualifikation'],
  [54, 'Bénévole / Trainer', 'Coach backup', '', ''],
  [55, 'Bénévole / Trainer', 'Teamchef(fin)', '', ''],
  [56, 'Bénévole / Trainer', 'Teambegleeder', '', ''],
  [57, 'Bénévole / Trainer', 'Supervisor (ohne eigenes Team)', '', ''],
  // Mitgliedsart (§3b, 60er)
  [60, 'Mitgliedsart', 'Donateur', '200', ''],
  [61, 'Mitgliedsart', 'Donateur licencié', '201', ''],
  [62, 'Mitgliedsart', 'Membre honoraire (Ehrenmitglied)', '202', ''],
  [63, 'Mitgliedsart', 'Sponsor', '980', 'will Lizenz behalten'],
  // Kontakt / Info (§3b, 70er)
  [70, 'Kontakt / Info', 'Contact famille', '210 / 211 / 212', 'kein Mitglied, nur Info'],
  [71, 'Kontakt / Info', "Mère / Père d'accueil", '213', ''],
  // Mitglieds-Status (§3b, 80er)
  [80, 'Status', 'aktiv', '', ''],
  [81, 'Status', 'inaktiv', '255 / 188', ''],
  [82, 'Status', 'Arrêt temporaire', '220 / 221', ''],
  [83, 'Status', 'pausiert (Verletzung)', '976 / 977', ''],
  [84, 'Status', 'Abandon / Abbruch', '250 / 252 / 256', ''],
  [85, 'Status', 'Abbruch jung (Lizenz behalten)', '252 / 253', ''],
  [86, 'Status', 'Ancien membre (ehemalig)', '240', ''],
  [87, 'Status', 'intern gesperrt (global)', '112', 'geschlechtsunabhängig'],
  // Transfer / Prêt (§3b, 90er)
  [90, 'Transfer / Prêt', 'Prêt sortie (raus)', '300', ''],
  [91, 'Transfer / Prêt', 'Prêt entrée (rein)', '301', ''],
  [92, 'Transfer / Prêt', 'Transfert entrant direct (rein)', '302', ''],
  [93, 'Transfer / Prêt', 'Prêt gratuit', '303', ''],
  [94, 'Transfer / Prêt', 'Transfert vers autre club (raus)', '304', ''],
];

const header = ['Neuer Code', 'Bereich / Block', 'Bedeutung', 'Alter Code (Liste)', 'Hinweis'];
const aoa = [header, ...rows];

const ws = XLSX.utils.aoa_to_sheet(aoa);
ws['!cols'] = [{ wch: 11 }, { wch: 22 }, { wch: 38 }, { wch: 18 }, { wch: 32 }];
ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: header.length - 1 } }) };

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Tabelle1');
XLSX.writeFile(wb, OUT_PATH);

console.log(`Legende mit ${rows.length} Codes gespeichert:`, OUT_PATH);

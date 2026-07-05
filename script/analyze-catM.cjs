// Analyse: distinkte Werte in Excel-Spalten L / M / N (Kategorien / FLH-Listing)
const XLSX = require('xlsx');
const path = require('path');

const FILE = process.env.XLSX_FILE || '/Users/netjogger58/CascadeProjects/GC 2026-07-01-MEMBERSLESCHT 2026-2027 (base de départ nouvelle Saison).xlsx';

const wb = XLSX.readFile(FILE);
const sheetName = wb.SheetNames.find(n => /membres/i.test(n)) || wb.SheetNames[0];
console.log('Sheet:', sheetName);
const ws = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(ws, { header: 'A', defval: '', raw: false });

// Header-Zeile finden (erste Zeile)
const header = rows[0];
console.log('\n=== Header L/M/N/O..W ===');
['H','I','L','M','N','O','P','Q','R','S','T','U','V','W'].forEach(c => {
  console.log(`  ${c}: ${JSON.stringify(header[c])}`);
});

function tally(col) {
  const m = new Map();
  for (let i = 1; i < rows.length; i++) {
    const v = String(rows[i][col] ?? '').trim();
    m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].sort((a,b) => b[1]-a[1]);
}

['L','M','N'].forEach(col => {
  console.log(`\n=== Distinkt Spalt ${col} (${JSON.stringify(header[col])}) ===`);
  for (const [v,c] of tally(col)) console.log(`  ${c.toString().padStart(4)}  ${JSON.stringify(v)}`);
});

#!/usr/bin/env node
/**
 * Splittet im Membres-Blatt die Spalte 'Langue / Nationalité' in
 * 'Langue' und 'Nationalité' und mappt Sprachcodes.
 * Verwendet xlsx, damit Formeln + gecachte Werte erhalten bleiben.
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const FILE = path.resolve(__dirname, "../docs/Adrien M75_membres_2026_2027_Codes_alt_neu_130726.xlsx");

const DISPLAY_LANG_MAP = {
  F: "FR", E: "EN", G: "EN", GB: "EN", I: "IT", P: "PT", S: "ES",
  D: "DE", A: "DE", H: "HU", N: "NL", L: "LU", LB: "LU", B: "BE",
};

function splitLangNat(v) {
  const s = v == null ? "" : String(v).trim();
  if (!s) return { lang: "", nat: "" };
  const parts = s.split(" / ", 2);
  const lang = (parts[0] || "").trim();
  const nat = (parts[1] || "").trim();
  return { lang: DISPLAY_LANG_MAP[lang.toUpperCase()] || lang, nat };
}

function shiftFormula(formula, deltaCols = 1) {
  // Ersetze relative Zellbezüge (ohne $) um deltaCols Spalten nach rechts.
  return formula.replace(/(?<![A-Z$])([A-Z]{1,3})([0-9]+)/g, (match, col, row) => {
    const idx = XLSX.utils.decode_col(col);
    return XLSX.utils.encode_col(idx + deltaCols) + row;
  });
}

function main() {
  if (!fs.existsSync(FILE)) {
    console.error("Datei nicht gefunden:", FILE);
    process.exit(1);
  }

  const backup = `${FILE}.backup-lang-split`;
  fs.copyFileSync(FILE, backup);
  console.log("Backup:", backup);

  // cellFormula: true damit Formeln erhalten bleiben, w: true für gecachte Werte
  const wb = XLSX.readFile(FILE, { cellFormula: true, cellNF: true, cellStyles: true });
  const ws = wb.Sheets["Membres 2026_2027"];
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const newRange = { s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c + 1 } };

  // Neues Worksheet-Objekt aufbauen
  const newWs = {};
  newWs["!ref"] = XLSX.utils.encode_range(newRange);
  // Merkmale kopieren, falls vorhanden
  ["!cols", "!rows", "!merges", "!protect", "!autofilter"].forEach((k) => {
    if (ws[k]) newWs[k] = JSON.parse(JSON.stringify(ws[k]));
  });
  // Spaltenbreiten um eine Spalte erweitern
  if (newWs["!cols"]) newWs["!cols"].splice(4, 0, { wch: 12 });

  // Zellen kopieren/verschieben
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;

      let newC = c;
      if (c >= 4) newC = c + 1; // Spalte E einfügen, alles ab E verschiebt sich nach rechts

      const newAddr = XLSX.utils.encode_cell({ r, c: newC });
      const newCell = { ...cell };

      if (typeof cell.f === "string") {
        newCell.f = shiftFormula(cell.f, 1);
      }

      // Header Zeile
      if (r === 0) {
        if (c === 3) {
          newCell.v = "Langue";
          // Nationalité Header in neue Spalte E
          const natAddr = XLSX.utils.encode_cell({ r, c: 4 });
          newWs[natAddr] = { v: "Nationalité", t: "s" };
        }
      } else {
        // Datenzeilen: Spalte D splitten, neue Spalte E füllen
        if (c === 3) {
          const { lang, nat } = splitLangNat(cell.v);
          newCell.v = lang;
          newCell.t = "s";
          delete newCell.f;
          // Nationalität in die neue Spalte E schreiben
          const natAddr = XLSX.utils.encode_cell({ r, c: 4 });
          newWs[natAddr] = { v: nat, t: "s" };
        }
      }

      newWs[newAddr] = newCell;
    }
  }

  wb.Sheets["Membres 2026_2027"] = newWs;
  // Sicherstellen, dass Excel beim Öffnen neu berechnet
  if (!wb.Workbook) wb.Workbook = {};
  if (!wb.Workbook.CalcPr) wb.Workbook.CalcPr = {};
  wb.Workbook.CalcPr.calcMode = "auto";
  wb.Workbook.CalcPr.calcCount = 1;
  wb.Workbook.CalcPr.fullCalcOnLoad = true;

  XLSX.writeFile(wb, FILE);
  console.log("Aktualisiert:", FILE);
}

main();

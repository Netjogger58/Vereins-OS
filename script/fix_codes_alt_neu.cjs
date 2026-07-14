const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const FILE = path.resolve(__dirname, "../docs/Adrien M75_membres_2026_2027_Codes_alt_neu_130726.xlsx");

const norm = (s) => String(s ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

function readSheet(name) {
  const wb = XLSX.readFile(FILE, { cellDates: false });
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Sheet '${name}' not found`);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
  return { wb, ws, rows };
}

function main() {
  if (!fs.existsSync(FILE)) { console.error("Datei nicht gefunden:", FILE); process.exit(1); }
  const backup = `${FILE}.backup-codes-alt-neu`;
  fs.copyFileSync(FILE, backup);
  console.log("Backup:", backup);

  const { wb } = readSheet("Codes alt-neu");
  const codeRows = readSheet("Codes alt-neu").rows;
  const membRows = readSheet("Membres 2026_2027").rows;
  const codeHeaders = codeRows[0];
  const membHeaders = membRows[0];

  const idx = (headers, needle) => headers.findIndex((h) => norm(String(h)) === norm(needle));

  const colM = {
    lastName: 0, firstName: 1, alCat: 10, neiCat: 11, catInterne: 12, catFlh: 15,
  };
  const colC = {
    lastName: 0, firstName: 1, oldCode: 6, catCode: 7, catInterne: 8, catFlh: 9,
  };

  // Index Membres rows by (lastName, firstName) -> list
  const membIndex = new Map();
  for (let i = 1; i < membRows.length; i++) {
    const r = membRows[i];
    const ln = norm(r[colM.lastName]);
    const fn = norm(r[colM.firstName]);
    if (!ln && !fn) continue;
    const key = `${ln}|${fn}`;
    if (!membIndex.has(key)) membIndex.set(key, []);
    membIndex.get(key).push({ r, i });
  }

  function findMatch(cRow) {
    const ln = norm(cRow[colC.lastName]);
    const fn = norm(cRow[colC.firstName]);
    const key = `${ln}|${fn}`;
    const candidates = membIndex.get(key) || [];
    if (!candidates.length) return null;

    const oldCode = String(cRow[colC.oldCode] || "").trim();
    // Prefer row with matching old category code (AL Cat or Al Cat)
    if (oldCode) {
      const byCode = candidates.find(({ r }) => String(r[colM.alCat]).trim() === oldCode);
      if (byCode) return byCode.r;
    }
    // Prefer row with non-empty new code; otherwise first
    const nonEmpty = candidates.find(({ r }) => String(r[colM.neiCat]).trim() !== "" && String(r[colM.neiCat]).trim() !== "0");
    if (nonEmpty) return nonEmpty.r;
    return candidates[0].r;
  }

  let changed = 0;
  for (let i = 1; i < codeRows.length; i++) {
    const cRow = codeRows[i];
    if (!cRow[colC.lastName]) continue;
    const mRow = findMatch(cRow);
    if (!mRow) continue;

    const newCode = String(mRow[colM.neiCat]).trim();
    const newInterne = String(mRow[colM.catInterne]).trim();
    const newFlh = String(mRow[colM.catFlh]).trim();

    let upd = false;
    if (!cRow[colC.catCode] && newCode) { cRow[colC.catCode] = newCode; upd = true; }
    if (!cRow[colC.catInterne] && newInterne) { cRow[colC.catInterne] = newInterne; upd = true; }
    if (newFlh) {
      const oldFlh = String(cRow[colC.catFlh] || "");
      if (!oldFlh || /Dames/i.test(oldFlh) || oldFlh === "CAT à compléter") {
        cRow[colC.catFlh] = newFlh; upd = true;
      }
    }
    if (upd) changed++;
  }

  // Letzter Durchgang: Restliche "Dames"-Texte auf "FE" korrigieren
  let damesFixed = 0;
  for (let i = 1; i < codeRows.length; i++) {
    const cRow = codeRows[i];
    const flh = String(cRow[colC.catFlh] || "");
    if (/Dames/i.test(flh)) {
      cRow[colC.catFlh] = flh.replace(/Dames/gi, "FE").replace(/\s+/g, " ").trim();
      damesFixed++;
      changed++;
    }
  }

  const newWs = XLSX.utils.aoa_to_sheet(codeRows);
  wb.Sheets["Codes alt-neu"] = newWs;
  XLSX.writeFile(wb, FILE);
  console.log("Aktualisiert:", FILE, "-", changed, "Zeilen geändert (davon", damesFixed, "Dames → FE)");
}

main();

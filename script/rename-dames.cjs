// Benennt weibliche Kategorie-Texte um: "Dames"/"D" -> FE/F/Femmes.
// Männliche "Hommes"-Texte bleiben unverändert.
// Betrifft die Spalten flh_category und internal_category.
// Nutzung: node script/rename-dames.cjs          (Dry-Run)
//          node script/rename-dames.cjs --apply   (anwenden)
const Database = require("better-sqlite3");
const APPLY = process.argv.includes("--apply");
const db = new Database("data.db");

// exakte Wert-Zuordnung (alt -> neu)
const MAP = {
  "DAMES": "Seniors FE",
  "Dames": "Seniors FE",
  "Dames bloqué interne": "Seniors FE bloqué interne",
  "U 11 Dames": "U11F",
  "U11 Dames": "U11F",
  "U 13 Dames": "U13F",
  "U 15 Dames": "U15F",
  "U15 Dames": "U15F",
  "U 17 Dames": "U17FE",
  "U 18 Dames": "U18FE",
  "U 9 Dames": "U9F",
  "U7 Dames": "U7F",
  "Vétérans - Dames": "Vétérans FE",
  "Officiel D": "Officiel FE",
};

const COLUMNS = ["flh_category", "internal_category"];

let total = 0;
const run = db.transaction(() => {
  for (const col of COLUMNS) {
    for (const [oldVal, newVal] of Object.entries(MAP)) {
      const cnt = db.prepare(`SELECT COUNT(*) c FROM members WHERE ${col} = ?`).get(oldVal).c;
      if (cnt === 0) continue;
      console.log(`${col}: "${oldVal}" -> "${newVal}"  (${cnt})`);
      total += cnt;
      if (APPLY) db.prepare(`UPDATE members SET ${col} = ? WHERE ${col} = ?`).run(newVal, oldVal);
    }
  }
});
run();

console.log(`\n${APPLY ? "Angewendet" : "Dry-Run"} — betroffene Zeilen: ${total}`);

// Kontrolle: verbleibende "Dame"-Vorkommen
if (APPLY) {
  for (const col of COLUMNS) {
    const rest = db.prepare(`SELECT ${col} v, COUNT(*) n FROM members WHERE ${col} LIKE '%Dame%' GROUP BY ${col}`).all();
    console.log(`Rest in ${col}:`, rest.length ? rest : "keine");
  }
}
if (!APPLY) console.log("Zum Anwenden:  node script/rename-dames.cjs --apply");
db.close();

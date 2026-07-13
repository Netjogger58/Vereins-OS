#!/usr/bin/env node
/**
 * Import echte Finanzdaten (Bilan + Compte de résultat) an d'App.
 * - Läscht Demo-Konten (Hauptkonto, Eventkasse, Jugendförderung) + Demo-Transaktiounen
 * - Leet 7 echt Konten mat Salden aus dem Bilan 2025-26 un
 * - Importéiert Ist-Zuelen 2024-25 + 2025-26 als Sammelbuchunge pro Kategorie
 * - Importéiert Budget/Prévisioun 2026-27 an d'budgets-Tabell
 *
 * Usage: node script/import-finances.cjs [--apply]   (ouni --apply = Dry-Run)
 */
const Database = require("better-sqlite3");
const path = require("path");

const APPLY = process.argv.includes("--apply");
const db = new Database(path.join(__dirname, "..", "data.db"));

// ─── Konten (Bilan per 30.06.2026 = Saison 2025-26) ──────
const ACCOUNTS = [
  { name: "Compte BCEE", balance: 46220.88 },
  { name: "Compte BCEE N°2", balance: 12862.12 },
  { name: "Compte CCRA", balance: 5449.12 },
  { name: "Compte Epargne CCRA", balance: 86070.31 },
  { name: "Compte Stripe", balance: 0 },
  { name: "Compte Sumup", balance: 0 },
  { name: "Caisse", balance: 4329.24 },
];

// ─── Ist 2024-25 (Compte de résultat, Total 102.935,82) ──
const CHARGES_2425 = [
  ["Activité Saison Opening", 615.39],
  ["Activité Saison Closing", 811.11],
  ["Activité Kleeschen", 502.00],
  ["Activité Kidsdays", 952.57],
  ["Entraîneurs", 23907.45],
  ["Frais de Logement", 99.51],
  ["Frais arbitrage", 4619.68],
  ["Frais de la Fédération", 5980.58],
  ["Frais Stage", 270.00],
  ["Transferts Entrants", 672.28],
  ["Frais Assurances", 948.21],
  ["Matériel divers", 5330.79],
  ["Matériel de bureau, timbres", 251.45],
  ["Matériel sportive", 1178.32],
  ["Matériel uniformes match", 4803.03],
  ["Frais bancaires", 686.33],
  ["Frais de représentation / Cadeaux / Dons", 654.91],
];
const PRODUITS_2425 = [
  ["Activité Marché Noel", 3697.90],
  ["Activité Quizowend", 4810.80],
  ["Activité Mämmories", 2914.22],
  ["Activité Nuit des Sports", 900.00],
  ["Activité Kichelcher", 409.00],
  ["Fanshop", 859.26],
  ["Activité Jeunes - compte épargne", 1179.19],
  ["Buvette", 6952.64],
  ["Entrées match", 1721.34],
  ["Transfert Sortants", 6500.00],
  ["Cotisations membres actifs", 11780.20],
  ["Dons", 134.88],
  ["Subsides", 33204.01],
  ["Sponsoring", 25030.00],
  ["Sponsoring matériel/services", 562.59],
  ["Intérêts bancaires", 1258.34],
  ["Divers Produits", 1021.45],
];
const BENEFICE_2425 = 50652.21;
const TOTAL_2425 = 102935.82;

// ─── Ist 2025-26 (Compte de résultat, Total 118.979,50) ──
const CHARGES_2526 = [
  ["Activité Saison Closing", 654.34],
  ["Activité Kleeschen", 357.50],
  ["Activité Matchs Dames - Tréier", 454.00],
  ["Fanshop", 940.71],
  ["Entraîneurs", 71245.72],
  ["Employée Sponsoring", 5823.57],
  ["Cotisations Sociales", 7586.85],
  ["Frais de déplacements", 734.66],
  ["Frais arbitrage", 4159.30],
  ["Frais de la Fédération", 7766.07],
  ["Frais Tournois", 235.50],
  ["Transferts Entrants", 1500.00],
  ["Frais Assurances", 948.21],
  ["Frais Formation", 250.00],
  ["Frais Informatiques / IT", 294.24],
  ["Ammortissement", 1561.39],
  ["Matériel divers", 1033.26],
  ["Matériel de bureau, timbres", 106.34],
  ["Matériel sportive", 1967.49],
  ["Matériel uniformes match", 1542.25],
  ["Matériel Médical", 31.20],
  ["Frais bancaires", 525.63],
  ["Frais de représentation / Cadeaux / Dons", 571.23],
  ["Divers Charges", 1550.10],
];
const PRODUITS_2526 = [
  ["Activité Marché Noel", 3900.43],
  ["Activité Nuit des Sports", 900.00],
  ["Activité Grillen", 98.05],
  ["Activité Kichelcher", 525.00],
  ["Activité Kidsdays", 10385.59],
  ["Activité Buvette Final4", 900.00],
  ["Activité Fundamentals", 2000.00],
  ["Activité Tournoi 50 Joer Mersch", 324.93],
  ["Activité 50 Joer Mersch75", 806.00],
  ["Activité Jeunes - compte épargne", 1465.84],
  ["Buvette", 6191.56],
  ["Entrées match", 1724.50],
  ["Transfert Sortants", 2000.00],
  ["Reprise de proivision d'exploitation", 5000.00],
  ["Cotisations membres actifs", 12400.00],
  ["Dons", 1544.24],
  ["Subsides", 39635.91],
  ["Sponsoring", 28602.18],
  ["Intérêts bancaires", 575.27],
];
const BENEFICE_2526 = 7139.94;
const TOTAL_2526 = 118979.50;

// ─── Budget/Prévisioun 2026-27 (Total 140.566,60) ────────
const BUDGET_CHARGES_2627 = [
  ["Activité Saison Opening", 750.00],
  ["Activité Saison Closing", 750.00],
  ["Activité Kleeschen", 500.00],
  ["Activité Divers", 1000.00],
  ["Entraîneurs", 98100.00],
  ["Cotisations Sociales", 9377.00],
  ["Frais arbitrage", 4650.00],
  ["Frais de la Fédération", 7500.00],
  ["Frais Tournois", 300.00],
  ["Transferts Entrants", 2000.00],
  ["Frais Assurances", 948.21],
  ["Frais Formation", 200.00],
  ["Frais Informatiques / IT", 330.00],
  ["Ammortissement", 1561.39],
  ["Matériel divers", 1200.00],
  ["Matériel de bureau, timbres", 150.00],
  ["Matériel sportive", 2000.00],
  ["Matériel uniformes match", 8000.00],
  ["Matériel Médical", 100.00],
  ["Frais bancaires", 550.00],
  ["Frais de représentation / Cadeaux / Dons", 600.00],
];
const BUDGET_PRODUITS_2627 = [
  ["Activité Marché Noel", 3000.00],
  ["Activité Quizowend", 2000.00],
  ["Activité Kichelcher", 300.00],
  ["Activité Divers", 5000.00],
  ["Buvette", 6200.00],
  ["Entrées match", 1600.00],
  ["Transfert Sortants", 500.00],
  ["Cotisations membres actifs", 23000.00],
  ["Dons", 4000.00],
  ["Subsides", 36000.00],
  ["Sponsoring", 39000.00],
  ["Intérêts bancaires", 500.00],
];
const PERTE_2627 = 19466.60;
const BUDGET_TOTAL_2627 = 140566.60;

// ─── Summen-Verifikatioun ─────────────────────────────────
const r2 = (n) => Math.round(n * 100) / 100;
const sum = (rows) => r2(rows.reduce((s, [, a]) => s + a, 0));

function verify(label, actual, expected) {
  const ok = Math.abs(actual - expected) < 0.005;
  console.log(`  ${ok ? "OK " : "FEHLER"} ${label}: ${actual.toFixed(2)} (erwart: ${expected.toFixed(2)})`);
  if (!ok) process.exitCode = 1;
  return ok;
}

console.log("=== Summen-Check ===");
let allOk = true;
allOk &= verify("Charges 2024-25 + Bénéfice", r2(sum(CHARGES_2425) + BENEFICE_2425), TOTAL_2425);
allOk &= verify("Produits 2024-25", sum(PRODUITS_2425), TOTAL_2425);
allOk &= verify("Charges 2025-26 + Bénéfice", r2(sum(CHARGES_2526) + BENEFICE_2526), TOTAL_2526);
allOk &= verify("Produits 2025-26", sum(PRODUITS_2526), TOTAL_2526);
allOk &= verify("Budget Charges 2026-27", sum(BUDGET_CHARGES_2627), BUDGET_TOTAL_2627);
allOk &= verify("Budget Produits 2026-27 + Perte", r2(sum(BUDGET_PRODUITS_2627) + PERTE_2627), BUDGET_TOTAL_2627);
if (!allOk) { console.error("Summen-Check feelgeschloen — Ofbroch."); process.exit(1); }

if (!APPLY) {
  console.log("\n=== DRY-RUN (näischt geschriwwen) ===");
  console.log(`Konten:            ${ACCOUNTS.length} nei (Demo-Konten ginn geläscht)`);
  console.log(`Buchungen 2024-25: ${CHARGES_2425.length} Charges + ${PRODUITS_2425.length} Produits`);
  console.log(`Buchungen 2025-26: ${CHARGES_2526.length} Charges + ${PRODUITS_2526.length} Produits`);
  console.log(`Budget 2026-27:    ${BUDGET_CHARGES_2627.length} Charges + ${BUDGET_PRODUITS_2627.length} Produits`);
  console.log("\nMat --apply ausféieren fir ze schreiwen.");
  process.exit(0);
}

// ─── Import ───────────────────────────────────────────────
console.log("\n=== Import ===");
const now = new Date().toISOString();

// Migratioun (idempotent, gläich wéi server/storage.ts)
try { db.exec(`ALTER TABLE transactions ADD COLUMN category TEXT`); } catch { /* existéiert */ }
try { db.exec(`ALTER TABLE transactions ADD COLUMN season TEXT`); } catch { /* existéiert */ }
db.exec(`CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL
)`);

db.transaction(() => {
  // 1) Demo-Daten läschen
  const demo = db.prepare(`SELECT id, name FROM accounts WHERE name IN ('Hauptkonto','Eventkasse','Jugendförderung')`).all();
  for (const a of demo) {
    db.prepare(`DELETE FROM transactions WHERE account_id = ?`).run(a.id);
    db.prepare(`DELETE FROM accounts WHERE id = ?`).run(a.id);
    console.log(`  Demo-Konto geläscht: ${a.name}`);
  }

  // 2) Echt Konten uleeën (falls nach net do)
  const insAcc = db.prepare(`INSERT INTO accounts (name, balance) VALUES (?, ?)`);
  const findAcc = db.prepare(`SELECT id FROM accounts WHERE name = ?`);
  const accIds = {};
  for (const a of ACCOUNTS) {
    const existing = findAcc.get(a.name);
    if (existing) {
      db.prepare(`UPDATE accounts SET balance = ? WHERE id = ?`).run(a.balance, existing.id);
      accIds[a.name] = existing.id;
      console.log(`  Konto aktualiséiert: ${a.name} = ${a.balance.toFixed(2)}`);
    } else {
      const r = insAcc.run(a.name, a.balance);
      accIds[a.name] = r.lastInsertRowid;
      console.log(`  Konto ugeluecht: ${a.name} = ${a.balance.toFixed(2)}`);
    }
  }
  const mainId = accIds["Compte BCEE"];

  // 3) Al Sammelbuchunge vun engem fréieren Import läschen (idempotent)
  db.prepare(`DELETE FROM transactions WHERE season IN ('2024-25','2025-26')`).run();

  // 4) Ist-Transaktiounen (Sammelbuchunge, direkt insert — ouni Balance-Verännerung)
  const insTx = db.prepare(`
    INSERT INTO transactions (account_id, amount, description, date, type, visibility, category, season, created_at)
    VALUES (?, ?, ?, ?, ?, 'intern', ?, ?, ?)
  `);
  const seasons = [
    { season: "2024-25", date: "2025-06-30", charges: CHARGES_2425, produits: PRODUITS_2425 },
    { season: "2025-26", date: "2026-06-30", charges: CHARGES_2526, produits: PRODUITS_2526 },
  ];
  let nTx = 0;
  for (const s of seasons) {
    for (const [cat, amount] of s.charges) {
      insTx.run(mainId, amount, `${cat} (Saison ${s.season})`, s.date, "expense", cat, s.season, now);
      nTx++;
    }
    for (const [cat, amount] of s.produits) {
      insTx.run(mainId, amount, `${cat} (Saison ${s.season})`, s.date, "income", cat, s.season, now);
      nTx++;
    }
  }
  console.log(`  ${nTx} Sammelbuchungen importéiert`);

  // 5) Salden op Bilan-Wäerter zerécksetzen (Buchunge solle Salden NET veränneren)
  for (const a of ACCOUNTS) {
    db.prepare(`UPDATE accounts SET balance = ? WHERE id = ?`).run(a.balance, accIds[a.name]);
  }

  // 6) Budget 2026-27
  db.prepare(`DELETE FROM budgets WHERE season = '2026-27'`).run();
  const insBud = db.prepare(`INSERT INTO budgets (season, category, type, amount) VALUES ('2026-27', ?, ?, ?)`);
  let nBud = 0;
  for (const [cat, amount] of BUDGET_CHARGES_2627) { insBud.run(cat, "expense", amount); nBud++; }
  for (const [cat, amount] of BUDGET_PRODUITS_2627) { insBud.run(cat, "income", amount); nBud++; }
  console.log(`  ${nBud} Budget-Posten 2026-27 importéiert`);
})();

// ─── No-Import Verifikatioun ──────────────────────────────
console.log("\n=== Verifikatioun (DB) ===");
const chk = (q) => db.prepare(q).get();
const c1 = chk(`SELECT ROUND(SUM(amount),2) s FROM transactions WHERE season='2024-25' AND type='expense'`);
const p1 = chk(`SELECT ROUND(SUM(amount),2) s FROM transactions WHERE season='2024-25' AND type='income'`);
const c2 = chk(`SELECT ROUND(SUM(amount),2) s FROM transactions WHERE season='2025-26' AND type='expense'`);
const p2 = chk(`SELECT ROUND(SUM(amount),2) s FROM transactions WHERE season='2025-26' AND type='income'`);
const bc = chk(`SELECT ROUND(SUM(amount),2) s FROM budgets WHERE season='2026-27' AND type='expense'`);
const bp = chk(`SELECT ROUND(SUM(amount),2) s FROM budgets WHERE season='2026-27' AND type='income'`);
const bal = chk(`SELECT ROUND(SUM(balance),2) s FROM accounts`);
verify("DB Charges 2024-25 + Bénéfice", r2(c1.s + BENEFICE_2425), TOTAL_2425);
verify("DB Produits 2024-25", p1.s, TOTAL_2425);
verify("DB Charges 2025-26 + Bénéfice", r2(c2.s + BENEFICE_2526), TOTAL_2526);
verify("DB Produits 2025-26", p2.s, TOTAL_2526);
verify("DB Budget Charges 2026-27", bc.s, BUDGET_TOTAL_2627);
verify("DB Budget Produits 2026-27 + Perte", r2(bp.s + PERTE_2627), BUDGET_TOTAL_2627);
console.log(`  Konten-Total: ${bal.s.toFixed(2)} (Bilan-Aktiva Konten: 154.931,67)`);
console.log("\nFäerdeg.");
db.close();

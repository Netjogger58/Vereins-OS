/**
 * Fill missing members.cat_code (Spielkategorie-Code der neuen Codierung)
 * anhand der zuverlässigen Text-Kategorie aus raw_data:
 *   "Catégorie interne Mersch75 2026-2027"
 *
 * Die alten numerischen Excel-Codes ("Cat") sind mehrdeutig (z.B. 12 = Dames
 * ALT vs. U21 H NEU, 19 = U7 Dames vs. Vétérans Dames), daher wird bewusst der
 * Text-Wert als Quelle genutzt. Nur eindeutige Spielkategorien werden gesetzt;
 * Nicht-Spielkategorien (Contact famille, Officiel, comité, Mixte, …) bleiben NULL.
 *
 * Aufruf:
 *   npx tsx scripts/fill_cat_codes.ts          # Dry-Run (zeigt nur an)
 *   npx tsx scripts/fill_cat_codes.ts --apply  # schreibt in die DB
 */
import Database from "better-sqlite3";
import path from "node:path";

// Normalisiert Kategorie-Text: Kleinbuchstaben, Whitespace zusammenfassen,
// Akzente entfernen, damit "Vétérans - Hommes" / "veterans hommes" gleich sind.
const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Text-Kategorie (normalisiert) -> neuer catCode (siehe CAT_CODE_LABELS)
const TEXT_TO_CAT: Record<string, number> = {
  // Hommes 11-21
  "seniors - hommes": 11,
  "u 21 hommes": 12,
  "u 17 hommes": 13,
  "u 15 hommes": 14,
  "u 13 hommes": 15,
  "u 11 hommes": 16,
  "u 9 hommes": 17,
  "u 7 hommes": 18,
  "u7 hommes": 18,
  "u 4 hommes": 19,
  "vetterans - hommes": 20,
  "veterans - hommes": 20,
  "veteran arbitre": 21,
  // Dames 31-41
  "dames": 31,
  "seniors - dames": 31,
  "u 21 dames": 32,
  "u 17 dames": 33,
  "u 15 dames": 34,
  "u15 dames": 34,
  "u 13 dames": 35,
  "u 11 dames": 36,
  "u 9 dames": 37,
  "u 7 dames": 38,
  "u7 dames": 38,
  "vetterans - dames": 40,
  "veterans - dames": 40,
};

// Nicht-Spielkategorien / obsolete Alterskategorien: bewusst NICHT setzen (bleiben NULL)
const SKIP = new Set([
  "u7 mixte", "u 7 mixte", "u4 mixte", "u 4 mixte",
  // obsolete Alterskategorien (existieren in der neuen Codierung nicht mehr)
  "u 18 dames", "u18 dames", "u 19 hommes", "u19 hommes",
]);

// Kandidaten-Schlüssel für die Kategorie in raw_data (Haupt-Import vs. Annulés)
const CAT_TEXT_KEYS = [
  "Catégorie interne Mersch75 2026-2027",
  "Catégorie Listing FLH",
  "Catégorie Listing \nFLH 2026-2027",
];

function main() {
  const apply = process.argv.includes("--apply");
  const dbPath = path.resolve(process.cwd(), "data.db");
  const db = new Database(dbPath);

  const rows = db
    .prepare("SELECT id, name, cat_code AS catCode, raw_data AS rawData FROM members WHERE cat_code IS NULL")
    .all() as { id: number; name: string; catCode: number | null; rawData: string | null }[];

  const update = db.prepare("UPDATE members SET cat_code = ? WHERE id = ?");
  const catText = (raw: Record<string, any>): string => {
    for (const k of CAT_TEXT_KEYS) {
      const v = norm(raw[k]);
      if (v && v !== "#n/a" && v !== "n/a" && v !== "cat a completer") return v;
    }
    return "";
  };

  let matched = 0;
  let skipped = 0;
  let noText = 0;
  const unmapped = new Map<string, number>();

  const applyAll = db.transaction((entries: { id: number; code: number }[]) => {
    for (const e of entries) update.run(e.code, e.id);
  });
  const toWrite: { id: number; code: number }[] = [];

  for (const m of rows) {
    let raw: Record<string, any> = {};
    try { raw = m.rawData ? JSON.parse(m.rawData) : {}; } catch { raw = {}; }
    const text = catText(raw);
    if (!text) { noText++; continue; }
    if (SKIP.has(text)) { skipped++; continue; }
    const code = TEXT_TO_CAT[text];
    if (code == null) {
      unmapped.set(text, (unmapped.get(text) || 0) + 1);
      continue;
    }
    toWrite.push({ id: m.id, code });
    matched++;
  }

  console.log(`\n[fill_cat_codes] ${apply ? "APPLY" : "DRY-RUN"} — ${rows.length} Mitglieder ohne cat_code`);
  console.log(`  ${matched} eindeutig zugeordnet (Spielkategorie)`);
  console.log(`  ${skipped} Mixte (bewusst übersprungen)`);
  console.log(`  ${noText} ohne Kategorie-Text`);
  console.log(`  ${[...unmapped.values()].reduce((a, b) => a + b, 0)} nicht zugeordnet (keine Spielkategorie):`);
  [...unmapped.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`      ${v.toString().padStart(4)}  ${k}`));

  if (apply) {
    applyAll(toWrite);
    console.log(`\n  ✅ ${toWrite.length} cat_code-Werte gesetzt.`);
  } else {
    console.log(`\n  (Dry-Run — mit --apply schreiben)`);
  }
  db.close();
}

main();

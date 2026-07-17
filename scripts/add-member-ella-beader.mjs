// Fügt die neue Spielerin Ella Beader (U9 Filles) in die lokale data.db ein.
// Idempotent: prüft anhand der Matricule, ob sie schon existiert, und überspringt dann.
// Deckt automatisch ab: Mitgliederliste, Sekretariat (beide lesen aus `members`)
// und Team-Kader U9 (über team_id).
//
// Aufruf:  node scripts/add-member-ella-beader.mjs
import Database from "better-sqlite3";
import { randomInt } from "node:crypto";

const DB_PATH = process.env.SQLITE_PATH || "data.db";
const db = new Database(DB_PATH);

// ── Random-No / card_id (Alphabet aus join.html, ohne verwechselbare Zeichen) ──
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCardId(len = 8) {
  for (let attempt = 0; attempt < 50; attempt++) {
    let s = "";
    for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
    const exists = db.prepare("SELECT 1 FROM members WHERE card_id = ?").get(s);
    if (!exists) return s;
  }
  throw new Error("Konnte keine eindeutige card_id erzeugen");
}

const MATRICULE = "2019.06.14.02279";

// Schon vorhanden? -> abbrechen (idempotent)
const existing = db
  .prepare("SELECT id, name FROM members WHERE matricule = ?")
  .get(MATRICULE);
if (existing) {
  console.log(`ℹ️  Ella Beader existiert bereits (id=${existing.id}) – nichts zu tun.`);
  process.exit(0);
}

// U9-Team dynamisch finden (nicht hardcoden)
const u9 =
  db.prepare("SELECT id FROM teams WHERE name = 'U9' OR category = 'U9' LIMIT 1").get() ||
  db.prepare("SELECT id FROM teams WHERE name LIKE 'U9%' OR category LIKE 'U9%' LIMIT 1").get();
if (!u9) {
  console.error("❌ Kein U9-Team gefunden. Bitte Team-Namen prüfen.");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const cardId = makeCardId();

// Original-Formulardaten verlustfrei sichern
const rawData = JSON.stringify({
  cns: "02279",
  matriculeComplet: MATRICULE,
  gsm1: "+352691286621",
  gsm2: "+352691258502",
  tuteurs: "Renata Lokin-Beader / Veljko Beader",
  mineur: true,
  parentIsole: false,
  cotisation2026_2027: "Youth Tarif (≤ 25 ans) – €210",
  baseCategorieFLH: "Filles - Femmes",
  categorieFLH: "U9",
  u7: false,
  ancienClub: null,
  med: false,
  licence: true,
  rue: "69, Rue de Colmar-Berg",
  codePostal: "L-7525",
  localite: "Mersch",
  conditionsAcceptees: true,
  transmissionFLH: true,
  exactitudeConfirmee: true,
  source: "join.html Anmeldung 2026-07",
});

const stmt = db.prepare(`
  INSERT INTO members (
    name, first_name, last_name, email, phone, phone_owner, birthdate, address,
    team_id, membership_status, card_id, club_function, nationality,
    internal_category, flh_category, team_category, matricule,
    join_date, raw_data, cat_code, licence_status, member_type
  ) VALUES (
    @name, @first_name, @last_name, @email, @phone, @phone_owner, @birthdate, @address,
    @team_id, @membership_status, @card_id, @club_function, @nationality,
    @internal_category, @flh_category, @team_category, @matricule,
    @join_date, @raw_data, @cat_code, @licence_status, @member_type
  )
`);

const info = stmt.run({
  name: "Ella Beader",
  first_name: "Ella",
  last_name: "Beader",
  email: "r.lokin-beader@eif.org",
  phone: "+352691286621",
  phone_owner: "elternteil", // Minderjährig -> Tuteur-Nummer
  birthdate: "2019-06-14",
  address: "69, Rue de Colmar-Berg, L-7525 Mersch",
  team_id: u9.id,
  membership_status: "active",
  card_id: cardId,
  club_function: "Joueuse",
  nationality: "Luxembourg",
  internal_category: "U9F",
  flh_category: "U9",
  team_category: "U9F",
  matricule: MATRICULE,
  join_date: today,
  raw_data: rawData,
  cat_code: 37, // Dames U9 (siehe docs/kategorien-neuordnung.md §2)
  licence_status: "aktiv", // Liz: Oui
  member_type: "spieler",
});

console.log(`✅ Ella Beader angelegt: member id=${info.lastInsertRowid}, card_id=${cardId}, team U9 (id=${u9.id})`);
console.log("   Sichtbar in: Mitglieder, Sekretariat und Team-Kader U9.");

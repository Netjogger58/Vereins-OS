/*
 * Migration/Import: Excel "Membres 2026-2027" -> App-DB (neues Modell)
 * Mapping alt->neu gemäß docs/kategorien-neuordnung.md §3b + TABLES-Legende.
 *
 * Nutzung:
 *   node script/import-members-2026.cjs "<pfad.xlsx>"            # DRY-RUN (nur Bericht)
 *   node script/import-members-2026.cjs "<pfad.xlsx>" --apply    # löscht Demo-Members + importiert
 *
 * DRY-RUN ändert NICHTS an data.db.
 */
const XLSX = require("xlsx");
const Database = require("better-sqlite3");

const FILE = process.argv[2];
const APPLY = process.argv.includes("--apply");
const SHEET = " Membres 2026 -2027";

if (!FILE) { console.error("Pfad zur .xlsx fehlt"); process.exit(1); }

// ─── Spaltenindizes (0-basiert) ───
const C = {
  lastName: 0, firstName: 1, cardId: 2, nationality: 3, address: 4, zip: 5, city: 6,
  courrierCode: 7, courrierNo: 8, catCode: 9, catInterne: 10, catCode2: 11, catFlh: 12,
  etudiant: 13,
  surSt: 14, surU15H: 15, surU13H: 16, surU11M: 17, surU9M: 18, surU7M: 19,
  surU17F: 20, surU15F: 21, surU13F: 22,
  passNr: 23, licOff: 24, licZS: 25, licSR: 26, licCL: 27,
  comment: 28, transfert: 29, dateLic: 30, dateMembre: 31, medico: 32, naissance: 33,
  matricule: 34, lieuNaiss: 35, tel: 36, telBureau: 37, gsm: 38, email: 39,
  communicateur: 40, commJeunes: 41, catArbitre: 42, comite: 43, officiel: 44,
  flh: 45, entraineur: 46,
};
// Surclassement-Spalten -> catCode
const SUR_COLS = {
  [C.surU15H]: 14, [C.surU13H]: 15, [C.surU11M]: 16, [C.surU9M]: 17, [C.surU7M]: 18,
  [C.surU17F]: 33, [C.surU15F]: 34, [C.surU13F]: 35,
};

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

// Telefon bereinigen: reine Zahl mit Excel-Tausendertrennern (621,665,197) -> 621 665 197
function cleanPhone(s) {
  s = String(s || "").trim();
  if (!s) return null;
  if (/^[\d,]+$/.test(s)) return s.replace(/,/g, " ");
  return s;
}

// ─── Random-No Generierung (Alphabet aus join.html, ohne verwechselbare Zeichen) ───
const CARD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const usedCards = new Set();
function genCardId() {
  for (let tries = 0; tries < 10000; tries++) {
    let s = "";
    for (let i = 0; i < 7; i++) s += CARD_ALPHABET[Math.floor(Math.random() * CARD_ALPHABET.length)];
    if (!usedCards.has(s)) { usedCards.add(s); return s; }
  }
  throw new Error("Konnte keine eindeutige Random-No erzeugen");
}

// ─── catCode aus Kategorie-Text (K interne, sonst M FLH) ───
function textToCatCode(t) {
  const n = norm(t);
  if (!n) return 0;
  const map = [
    ["seniorshommes", 11], ["u21hommes", 12], ["u17hommes", 13], ["u15hommes", 14],
    ["u13hommes", 15], ["u11hommes", 16], ["u9hommes", 17], ["u7mixte", 18],
    ["u4mixte", 19], ["u4", 19], ["veteranshommes", 20],
    ["seniorsdames", 31], ["u21dames", 32], ["u17dames", 33], ["u15dames", 34],
    ["u13dames", 35], ["u11dames", 36], ["u9dames", 37], ["u7dames", 38],
    ["veteransdames", 40], ["dames", 31],
  ];
  for (const [k, v] of map) if (n === k || n.startsWith(k)) return v;
  return 0; // Nicht-Spieler / unklar
}

// ─── J-Code (alt) -> {status, licence, transfer, memberType, contactType, note} ───
function mapOldCatCode(code, text) {
  const c = String(code || "").trim();
  const out = {};
  const S = { // alt -> membership_status
    "252": "abbruch_jeune", "253": "abbruch_jeune", "255": "inaktiv", "188": "inaktiv",
    "254": "inaktiv", "220": "arret_temporaire", "221": "arret_temporaire",
    "250": "abbruch", "251": "abbruch", "256": "abbruch", "240": "ehemalig",
    "976": "pausiert_verletzung", "977": "pausiert_verletzung", "112": "gesperrt",
  };
  const LIC_KEEP = ["252","253","979","982","988","992","980","188"];
  const LIC_DEL = ["256","991","993"];
  const TRANSFER = { "300":"pret_sortie","301":"pret_entree","302":"transfer_rein","303":"pret_gratis","304":"transfer_raus" };
  const TYPE = { "200":"donateur","201":"donateur_licence","202":"honoraire","980":"sponsor" };
  const CONTACT = { "210":"contact_famille","211":"contact_famille","212":"contact_famille","213":"mere_accueil" };

  if (S[c]) out.status = S[c];
  if (LIC_KEEP.includes(c)) out.licence = "behalten";
  if (LIC_DEL.includes(c)) out.licence = "geloescht";
  if (TRANSFER[c]) out.transfer = TRANSFER[c];
  if (TYPE[c]) out.memberType = TYPE[c];
  if (CONTACT[c]) out.contactType = CONTACT[c];
  return out;
}

function genderFromCat(catCode, text) {
  if (catCode >= 31 && catCode <= 41) return "F";
  if (catCode >= 11 && catCode <= 21) return "H";
  const n = norm(text);
  if (n.includes("dames") || /(^| )d($| )/.test(String(text||""))) return "F";
  return "H";
}

// ─── main ───
const wb = XLSX.readFile(FILE, { cellDates: false });
const ws = wb.Sheets[SHEET];
if (!ws) { console.error(`Sheet "${SHEET}" nicht gefunden. Vorhanden: ${wb.SheetNames.join(", ")}`); process.exit(1); }
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
const header = rows[0].map((h) => String(h || "").trim());
const data = rows.slice(1).filter((r) => String(r[C.lastName] || "").trim() || String(r[C.firstName] || "").trim());

// Bericht-Sammler
const rep = { catCode: {}, status: {}, memberType: {}, contactType: {}, licence: {}, transfer: {}, functions: {}, noCat: [], noCard: 0, total: data.length };
const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };

const records = [];
for (const r of data) {
  const firstName = String(r[C.firstName] || "").trim();
  const lastName = String(r[C.lastName] || "").trim();
  const nameLast = lastName ? lastName.charAt(0) + lastName.slice(1).toLowerCase() : "";
  const name = `${firstName} ${nameLast}`.trim();

  const catText = String(r[C.catInterne] || "").trim() || String(r[C.catFlh] || "").trim();
  const catCode = textToCatCode(catText);
  const mapped = mapOldCatCode(r[C.catCode], catText);
  const gender = genderFromCat(catCode, catText);

  // Funktionen sammeln
  const fns = [];
  const addFn = (fn, code, qualification, note) => { fns.push({ fn, code, qualification: qualification || null, note: note || null }); inc(rep.functions, fn); };
  if (String(r[C.comite] || "").trim()) addFn("comite", gender === "F" ? 3 : 1, null, String(r[C.comite]).trim());
  if (norm(r[C.officiel]) === "x") addFn("officiel", gender === "F" ? 4 : 2, null, null);
  if (String(r[C.flh] || "").trim()) addFn("flh", null, null, String(r[C.flh]).trim());
  if (String(r[C.catArbitre] || "").trim() || String(r[C.licSR] || "").trim()) addFn("arbitre", gender === "F" ? 41 : 21, String(r[C.catArbitre] || "").trim() || null, null);
  if (String(r[C.entraineur] || "").trim()) addFn("coach", 53, String(r[C.entraineur]).trim(), null);
  if (norm(r[C.commJeunes]) === "x") addFn("commission_jeunes", null, null, null);
  // aus J-Code abgeleitete Funktionen
  const jc = String(r[C.catCode] || "").trim();
  if (jc === "150") addFn("comite", gender === "F" ? 3 : 1, null, "code 150");
  if (jc === "50") addFn("benevole", 50, null, null);
  if (jc === "1") addFn("officiel", 2, null, "code 1 (Officiel H)");
  if (jc === "11") addFn("officiel", 4, null, "code 11 (Officiel D)");
  if (jc === "102" || jc === "109") addFn("arbitre", gender === "F" ? 41 : 21, null, `code ${jc}`);

  // Surclassement / weitere Spielberechtigungen (Spalten O-W)
  // Bewusst DEAKTIVIERT beim Erstimport: die j/ju/jd/c-Logik ist zu fehleranfällig und
  // Surclassement wird pro Saison neu vergeben (FLH-Kategorien werden gerade neu definiert).
  // Die Rohwerte bleiben vollständig in raw_data erhalten.
  const cats = [];

  // raw_data = komplette Originalzeile (nichts geht verloren)
  const raw = {};
  header.forEach((h, i) => { const v = String(r[i] ?? "").trim(); if (v) raw[h || `col${i}`] = v; });

  let cardId = String(r[C.cardId] || "").trim();
  if (!cardId) { rep.noCard++; cardId = genCardId(); }
  else usedCards.add(cardId);
  if (catCode === 0 && !mapped.contactType && !mapped.memberType && !mapped.status && !mapped.transfer && !mapped.licence && fns.length === 0)
    rep.noCat.push(`${name} [J=${jc} | ${catText}]`);

  inc(rep.catCode, catCode);
  if (mapped.status) inc(rep.status, mapped.status);
  if (mapped.memberType) inc(rep.memberType, mapped.memberType);
  if (mapped.contactType) inc(rep.contactType, mapped.contactType);
  if (mapped.licence) inc(rep.licence, mapped.licence);
  if (mapped.transfer) inc(rep.transfer, mapped.transfer);

  records.push({
    name, cardId,
    firstName: firstName || null,        // Vorname wörtlich (Spalte B)
    lastName: lastName || null,          // offizieller Nachname wörtlich (Spalte A)
    birthName: null,                     // optional, später manuell
    email: String(r[C.email] || "").trim() || null,
    phone: cleanPhone(String(r[C.gsm] || "").trim() || String(r[C.tel] || "").trim()),
    address: [String(r[C.address]||"").trim(), String(r[C.zip]||"").trim(), String(r[C.city]||"").trim()].filter(Boolean).join(", ") || null,
    nationality: String(r[C.nationality] || "").trim() || null,
    birthdate: String(r[C.naissance] || "").trim().replace(/^\/+.*$/, "") || null,
    licenseNumber: String(r[C.passNr] || "").trim() || null,
    matricule: String(r[C.matricule] || "").trim() || null,
    medicoNext: String(r[C.medico] || "").trim().replace(/^\/+.*$/, "") || null,
    joinDate: String(r[C.dateMembre] || "").trim().replace(/^\/+.*$/, "") || null,
    internalCategory: String(r[C.catInterne] || "").trim() || null,
    flhCategory: String(r[C.catFlh] || "").trim() || null,
    catCode,
    membershipStatus: mapped.status || "active",
    licenceStatus: mapped.licence || null,
    transferStatus: mapped.transfer || null,
    memberType: mapped.memberType || (mapped.contactType ? "contact" : "spieler"),
    contactInfoType: mapped.contactType || null,
    familyCode: String(r[C.courrierCode] || "").trim() || null,
    rawData: JSON.stringify(raw),
    functions: fns,
    categories: cats,
  });
}

// ─── Bericht ───
function printCounts(title, obj) {
  console.log(`\n${title}`);
  Object.entries(obj).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`   ${k} : ${n}`));
}
console.log(`\n================ DRY-RUN BERICHT (Excel -> neues Modell) ================`);
console.log(`Datei:  ${FILE}`);
console.log(`Sheet:  "${SHEET}"`);
console.log(`Zeilen: ${rep.total} Mitglieder`);
console.log(`Ohne Random-No (card_id): ${rep.noCard}`);
printCounts("catCode (0 = Nicht-Spieler/unklar):", rep.catCode);
printCounts("membership_status (nur abweichende):", rep.status);
printCounts("member_type:", rep.memberType);
printCounts("contact_info_type:", rep.contactType);
printCounts("licence_status:", rep.licence);
printCounts("transfer_status:", rep.transfer);
printCounts("Funktionen (Anzahl Personen):", rep.functions);
console.log(`\nPersonen mit catCode=0 UND ohne Typ/Funktion (Prüfen! erste 25):`);
rep.noCat.slice(0, 25).forEach((s) => console.log(`   - ${s}`));
console.log(`   ... insgesamt ${rep.noCat.length}`);

if (process.argv.includes("--sample")) {
  const pick = (pred) => records.find(pred);
  const samples = [
    pick((r) => r.functions.some((f) => f.fn === "coach")),
    pick((r) => r.contactInfoType === "contact_famille"),
    pick((r) => r.categories.length > 0) || pick((r) => r.catCode > 0),
  ].filter(Boolean);
  console.log(`\n================ BEISPIEL-DATENSÄTZE (${samples.length}) ================`);
  for (const s of samples) {
    const { rawData, ...clean } = s;
    console.log(`\n──────── ${s.name} ────────`);
    console.log("GEMAPPTE FELDER:");
    console.log(JSON.stringify(clean, null, 2));
    console.log("raw_data (Originalzeile, inkl. H/I & alle Codes):");
    console.log(JSON.stringify(JSON.parse(rawData), null, 2));
  }
}

if (!APPLY) {
  console.log(`\n>>> DRY-RUN: es wurde NICHTS in die DB geschrieben.`);
  console.log(`>>> Zum Anwenden erneut mit --apply starten (löscht Demo-Members + importiert).`);
  process.exit(0);
}

// ─── APPLY ───
const db = new Database("data.db");
const tx = db.transaction(() => {
  db.prepare("DELETE FROM member_functions").run();
  db.prepare("DELETE FROM member_categories").run();
  db.prepare("DELETE FROM members").run();

  const insMember = db.prepare(`INSERT INTO members
    (name, first_name, last_name, birth_name, email, phone, address, birthdate, nationality, license_number, matricule, medico_next, join_date,
     internal_category, flh_category, cat_code, membership_status, licence_status, transfer_status, member_type,
     contact_info_type, family_code, card_id, raw_data)
    VALUES (@name,@firstName,@lastName,@birthName,@email,@phone,@address,@birthdate,@nationality,@licenseNumber,@matricule,@medicoNext,@joinDate,
     @internalCategory,@flhCategory,@catCode,@membershipStatus,@licenceStatus,@transferStatus,@memberType,
     @contactInfoType,@familyCode,@cardId,@rawData)`);
  const insFn = db.prepare(`INSERT INTO member_functions (member_id, function, code, qualification, team_id, note) VALUES (?,?,?,?,?,?)`);
  const insCat = db.prepare(`INSERT INTO member_categories (member_id, cat_code, kind, note) VALUES (?,?,?,?)`);

  let n = 0;
  for (const rec of records) {
    const { functions, categories, ...dbFields } = rec;
    const info = insMember.run(dbFields);
    const mid = info.lastInsertRowid;
    for (const f of rec.functions) insFn.run(mid, f.fn, f.code, f.qualification, null, f.note);
    for (const c of rec.categories) insCat.run(mid, c.catCode, c.kind, c.note);
    n++;
  }
  return n;
});
const count = tx();
console.log(`\n>>> APPLY fertig: ${count} Mitglieder importiert (Demo-Daten gelöscht).`);
db.close();

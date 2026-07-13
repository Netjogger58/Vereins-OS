// Findet aktive SPIELER (member_type='spieler') mit einer ZS-Lizenz
// ("Licences ZS (secrétaires / chronométreurs)") — potenzielle Chrono/Officiel-de-table.
const Database = require("better-sqlite3");
const db = new Database("data.db", { readonly: true });

const rows = db.prepare(
  "SELECT id, name, member_type mt, internal_category ic, raw_data FROM members WHERE membership_status='active'"
).all();

const players = [];
for (const r of rows) {
  let zs, off;
  try {
    const o = JSON.parse(r.raw_data || "{}");
    zs = o["Licences ZS (secrétaires / chronométreurs)"];
    off = o["Licences Off (officiels)"];
  } catch (e) { /* ignore */ }
  const zsVal = String(zs || "").trim();
  const hasZS = zsVal !== "" && zsVal.toLowerCase() !== "xxx";
  if (!hasZS) continue;
  if (r.mt !== "spieler") continue; // nur die, die noch als Spieler gelten

  const fns = db.prepare("SELECT function, qualification FROM member_functions WHERE member_id=?").all(r.id);
  const hasChrono = fns.some((f) => /chrono/i.test(String(f.qualification || "")));
  const isFemale = /Dames|Dame| F$|-\s*Dames/i.test(r.ic || "");
  players.push({
    id: r.id,
    name: r.name,
    kategorie: r.ic,
    geschlecht: isFemale ? "F" : "M",
    ZS: zsVal,
    Off: String(off || "").trim(),
    funktionen: fns.map((f) => f.function + (f.qualification ? "/" + f.qualification : "")).join(",") || "(keine)",
    chrono_gesetzt: hasChrono ? "ja" : "NEIN",
  });
}

players.sort((a, b) => a.geschlecht.localeCompare(b.geschlecht) || a.name.localeCompare(b.name));
console.log("Aktive Spieler mit ZS-Lizenz (potenziell Chrono):", players.length);
console.table(players);
console.log("Davon weiblich:", players.filter((p) => p.geschlecht === "F").length);
console.log("Ohne gesetzte Chrono-Qualifikation:", players.filter((p) => p.chrono_gesetzt === "NEIN").length);
db.close();

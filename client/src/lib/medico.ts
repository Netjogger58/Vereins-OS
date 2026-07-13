// Médico-Status (Kader-Anzeige) — gleiche Ableitung wie im Sekretariat.
// Basis: medicoNext (Jahr "Prochain Médico") + optional medicoResult / medicoComment.

export type MedicoState = "valid" | "due" | "overdue" | "inapte" | "none";

export interface MedicoFields {
  medicoNext?: string | null;
  medicoComment?: string | null;
  medicoResult?: string | null;
}

const CUR_YEAR = new Date().getFullYear();

// Extrahiert das Jahr (JJJJ) aus dem Médico-Feld, sonst null (z.B. bei "Apte", "Cert. Med. ok").
export function medicoYearOf(m: MedicoFields): string | null {
  const mm = String(m.medicoNext || "").match(/(19|20)\d{2}/);
  return mm ? mm[0] : null;
}

// Abgeleiteter Status:
//   valid   = schon gewesen / gültig bis Jahr (> aktuelles Jahr)
//   due     = dieses Jahr fällig (Jahr == aktuelles Jahr)  -> muss noch hin
//   overdue = überfällig (Jahr < aktuelles Jahr)           -> in Vergangenheit nicht gemacht
//   inapte  = nicht durchgekommen
//   none    = kein Médico-Eintrag
export function medicoState(m: MedicoFields): MedicoState {
  const res = String(m.medicoResult || "").trim();
  if (res === "apte") return "valid";
  if (res === "inapte") return "inapte";
  if (res === "apte_temporaire") return "due";
  if (res === "absent") return "overdue";

  const cm = String(m.medicoComment || "").toLowerCase();
  if (cm.includes("inapte")) return "inapte";
  const dm = cm.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})/);
  if (dm && (cm.includes("apte") || cm.includes("jusqu"))) {
    let yr = parseInt(dm[3], 10);
    if (yr < 100) yr += 2000;
    const exp = new Date(yr, parseInt(dm[2], 10) - 1, parseInt(dm[1], 10)).getTime();
    return exp < Date.now() ? "overdue" : "valid";
  }

  const s = String(m.medicoNext || "").trim().toLowerCase();
  if (s.includes("inapte")) return "inapte";
  const y = medicoYearOf(m);
  if (y) {
    const yr = parseInt(y, 10);
    if (yr < CUR_YEAR) return "overdue";
    if (yr === CUR_YEAR) return "due";
    return "valid";
  }
  if (s.includes("apte") || s.includes("cert") || s.includes("ok")) return "valid";
  return "none";
}

// "Muss (noch) zum Médico" = dieses Jahr fällig oder überfällig.
export function medicoMustGo(m: MedicoFields): boolean {
  const st = medicoState(m);
  return st === "due" || st === "overdue";
}

// Kurzes Anzeige-Label (Luxemburgisch) für die Kader-Karte.
export function medicoLabel(m: MedicoFields): string {
  const st = medicoState(m);
  const y = medicoYearOf(m);
  switch (st) {
    case "overdue": return `Médico iwwerfälleg${y ? ` (${y})` : ""}`;
    case "due": return `Médico dëst Joer fälleg (${y || CUR_YEAR})`;
    case "inapte": return "Médico: inapte";
    case "valid": return y ? `Médico ok bis ${y}` : "Médico ok";
    default: return "Kee Médico-Datum";
  }
}

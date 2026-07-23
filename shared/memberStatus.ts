// Gemeinsame Definition „aktueller Vereinsmember" (Client + Server).
// Ex-Mitglieder und Kontakte bleiben in der DB (Archiv „Ancien Membres"),
// zählen aber NICHT zur aktuellen Mitgliederzahl.

export interface MemberStatusFields {
  membershipStatus?: string | null;
  membership_status?: string | null;
}

// Pré-Archiv: Member ist noch im Verein, aber nicht mehr aktiv (z.B. "inaktiv").
// Fällt aus der aktiven Mitgliederliste, behält aber Card-ID und Vereinszugehörigkeit.
// Am Saisonende → Archiv (ehemalig).
const PRE_ARCHIVE_STATUS = new Set(["inaktiv", "arret_temporaire", "pausiert_verletzung"]);

// Archiv: Member ist nicht mehr im Verein („Ancien Membres").
// Keine Card-ID, keine Vereinszugehörigkeit, zählt nicht zur Mitgliederzahl.
const ARCHIVE_STATUS = new Set(["ehemalig", "abbruch", "abbruch_jeune", "abbruch_jung", "geloescht"]);

// Alle Status, die NICHT aktiv sind (Pré-Archiv + Archiv zusammen).
const NON_ACTIVE_STATUS = new Set([...PRE_ARCHIVE_STATUS, ...ARCHIVE_STATUS]);

/**
 * Aktueller (aktiver) Vereinsmember?
 *
 * Basis ist die aktuelle Vereinsliste (membership_status = "active").
 * Ausgeschlossen sind Pré-Archiv (inaktiv, arret_temporaire, …) und Archiv (ehemalig, …).
 */
export function isActiveClubMember(m: MemberStatusFields): boolean {
  const status = (m.membershipStatus || m.membership_status || "").toLowerCase();
  return !NON_ACTIVE_STATUS.has(status);
}

/**
 * Pré-Archiv? (noch im Verein, aber nicht aktiv — z.B. "inaktiv").
 * Am Saisonende wird dieser Status → "ehemalig" (Archiv).
 */
export function isPreArchiveMember(m: MemberStatusFields): boolean {
  const status = (m.membershipStatus || m.membership_status || "").toLowerCase();
  return PRE_ARCHIVE_STATUS.has(status);
}

/**
 * Archiv? (nicht mehr im Verein — "ehemalig", "abbruch", …).
 * Hat KEINE Berechtigung für eine Card-ID.
 */
export function isArchivedMember(m: MemberStatusFields): boolean {
  const status = (m.membershipStatus || m.membership_status || "").toLowerCase();
  return ARCHIVE_STATUS.has(status);
}

/**
 * Hat Anspruch auf eine Card-ID?
 * Nur aktive und Pré-Archiv-Member. Archivierte (ehemalig) haben kein Recht auf Card-ID.
 */
export function hasCardIdRight(m: MemberStatusFields): boolean {
  return !isArchivedMember(m);
}

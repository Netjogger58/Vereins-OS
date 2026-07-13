// Gemeinsame Definition „aktueller Vereinsmember" (Client + Server).
// Ex-Mitglieder und Kontakte bleiben in der DB (Archiv „Ancien Membres"),
// zählen aber NICHT zur aktuellen Mitgliederzahl.

export interface MemberStatusFields {
  membershipStatus?: string | null;
  membership_status?: string | null;
}

// Mitgliedschaftsstatus, die ein Ex-Mitglied kennzeichnen (Archiv „Ancien Membres").
// In der aktuellen Datenbasis kommt davon nur "ehemalig" vor (414 Ex-Mitglieder);
// die übrigen sind vorsorglich enthalten, falls der Import sie später vergibt.
const ARCHIVE_STATUS = new Set(["ehemalig", "abbruch", "abbruch_jeune", "inaktiv"]);

/**
 * Aktueller (aktiver) Vereinsmember?
 *
 * Basis ist die aktuelle Vereinsliste (membership_status = "active" = 590 Personen,
 * inkl. Donateure/Ehrenmitglieder/Sponsoren und Familien-Kontakte, die zur Liste gehören).
 * Ausgeschlossen (= Archiv / „Ancien Membres", zählen NICHT mit) sind nur die
 * Ex-Mitglieder (membership_status: ehemalig, abbruch, abbruch_jeune, inaktiv).
 */
export function isActiveClubMember(m: MemberStatusFields): boolean {
  const status = (m.membershipStatus || m.membership_status || "").toLowerCase();
  return !ARCHIVE_STATUS.has(status);
}

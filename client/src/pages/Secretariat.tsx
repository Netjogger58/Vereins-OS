import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { CAT_CODE_LABELS } from "@shared/schema";
import { isActiveClubMember } from "@shared/memberStatus";
import { Users, Download, Search, Activity, UserX, Shield, ChevronRight, ChevronLeft, ArrowUpDown, ArrowUp, ArrowDown, HeartPulse, Archive, HandCoins, Award, Table, Mail, Copy, FileText, Printer, X } from "lucide-react";
import { openConvocation, type ConvLang } from "@/lib/convocation";

// ─── Labels (neue Codierung) ───────────────────────────
const FUNCTION_LABELS: Record<string, string> = {
  joueur: "Spieler", comite: "Comité", officiel: "Officiel", arbitre: "Arbitre",
  coach: "Trainer", coach_backup: "Co-Trainer", teamchef: "Teamchef",
  teambegleeder: "Teambegleeder", supervisor: "Supervisor", benevole: "Bénévole",
  benevole_licence: "Bénévole (Lizenz)", commission_jeunes: "Jugendkommission",
  flh: "FLH", contact_famille: "Kontakt (Familie)", mere_accueil: "Mère d'accueil",
};
const TYPE_LABELS: Record<string, string> = {
  spieler: "Spieler", donateur: "Donateur", donateur_lizenz: "Donateur (Lizenz)",
  donateur_licence: "Donateur (Lizenz)", ehrenmitglied: "Ehrenmitglied",
  honoraire: "Ehrenmitglied", sponsor: "Sponsor", contact: "Kontakt",
  loisir: "Kidssport & Loisir",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Aktiv", aktiv: "Aktiv", inaktiv: "Inaktiv", arret_temporaire: "Temporär pausiert",
  pausiert_verletzung: "Pausiert (Verletzung)", abbruch: "Abbruch", abbruch_jung: "Abbruch (Jugend)",
  abbruch_jeune: "Abbruch (Jugend)", ehemalig: "Ehemalig", intern_gesperrt: "Intern gesperrt", gesperrt: "Gesperrt",
};
const LICENCE_LABELS: Record<string, string> = {
  aktiv: "Aktiv", keine: "Keine", behalten: "Behalten", geloescht: "Gelöscht",
};

// ─── Alt (Excel "code interne HBM" / TABLES) ↔ Neu (System) ─────────────
// Gegenüberstellung der alten Excel-Codes aus dem TABLES-Blatt mit der neuen
// Systemcodierung (CAT_CODE_LABELS / FUNCTION_CODES / Typ / Status).
type CodeMapEntry = { old: string; oldLabel: string; neu: string; neuLabel: string };
const CODE_MAP_CATEGORIES: CodeMapEntry[] = [
  { old: "2", oldLabel: "Seniors - Hommes", neu: "11", neuLabel: "Seniors H" },
  { old: "3", oldLabel: "U21 Hommes", neu: "12", neuLabel: "U21 H" },
  { old: "4", oldLabel: "U17 Hommes", neu: "13", neuLabel: "U17 H" },
  { old: "5", oldLabel: "U15 Hommes", neu: "14", neuLabel: "U15 H" },
  { old: "6", oldLabel: "U13 Hommes", neu: "15", neuLabel: "U13 H" },
  { old: "7", oldLabel: "U11 Hommes", neu: "16", neuLabel: "U11 H" },
  { old: "8", oldLabel: "U9 Hommes", neu: "17", neuLabel: "U9 H" },
  { old: "—", oldLabel: "U7 Hommes", neu: "18", neuLabel: "U7 H" },
  { old: "—", oldLabel: "U4 Hommes", neu: "19", neuLabel: "U4 H" },
  { old: "9", oldLabel: "Vétérans - Hommes", neu: "20", neuLabel: "Vétérans H" },
  { old: "10 / 102 / 109", oldLabel: "Arbitre (H)", neu: "21", neuLabel: "Arbitre H" },
  { old: "12", oldLabel: "Femmes (Seniors)", neu: "31", neuLabel: "Seniors FE" },
  { old: "—", oldLabel: "U21 Femmes", neu: "32", neuLabel: "U21FE" },
  { old: "14", oldLabel: "U17 Femmes", neu: "33", neuLabel: "U17FE" },
  { old: "16", oldLabel: "U15 Femmes", neu: "34", neuLabel: "U15F" },
  { old: "15", oldLabel: "U13 Femmes", neu: "35", neuLabel: "U13F" },
  { old: "17", oldLabel: "U11 Femmes", neu: "36", neuLabel: "U11F" },
  { old: "18", oldLabel: "U9 Femmes", neu: "37", neuLabel: "U9F" },
  { old: "19", oldLabel: "U7 Femmes", neu: "38", neuLabel: "U7F" },
  { old: "19", oldLabel: "Vétérans - Femmes", neu: "40", neuLabel: "Vétérans FE" },
  { old: "112", oldLabel: "Femmes arbitre / bloqué", neu: "41", neuLabel: "Arbitre FE" },
  { old: "20 / 21", oldLabel: "U4 / U7 Mixte", neu: "—", neuLabel: "keine Zuordnung (mixte)" },
];
const CODE_MAP_FUNCTIONS: CodeMapEntry[] = [
  { old: "150", oldLabel: "comité", neu: "1 / 3", neuLabel: "Comité" },
  { old: "1", oldLabel: "Officiel H", neu: "2", neuLabel: "Officiel" },
  { old: "11", oldLabel: "Officiel FE", neu: "4", neuLabel: "Officiel" },
  { old: "10 / 102 / 109", oldLabel: "Arbitre", neu: "21 / 41", neuLabel: "Arbitre" },
  { old: "50", oldLabel: "Bénévole", neu: "50 / 51", neuLabel: "Bénévole" },
  { old: "214", oldLabel: "Bénévole Famille", neu: "51", neuLabel: "Bénévole" },
  { old: "215", oldLabel: "Bénévole avec Licence", neu: "52", neuLabel: "Bénévole (Lizenz)" },
  { old: "—", oldLabel: "Entraîneur / Coach", neu: "53", neuLabel: "Trainer" },
  { old: "978", oldLabel: "Coach backup", neu: "54", neuLabel: "Co-Trainer" },
  { old: "210 / 211 / 212", oldLabel: "Contact famille", neu: "contact_famille", neuLabel: "Kontakt (Familie)" },
  { old: "213", oldLabel: "Mère d'accueil", neu: "mere_accueil", neuLabel: "Mère d'accueil" },
];
const CODE_MAP_TYPE_STATUS: CodeMapEntry[] = [
  { old: "200", oldLabel: "Donateurs", neu: "donateur", neuLabel: "Donateur" },
  { old: "201", oldLabel: "Donateurs licencié", neu: "donateur_lizenz", neuLabel: "Donateur (Lizenz)" },
  { old: "980", oldLabel: "Sponsor", neu: "sponsor", neuLabel: "Sponsor" },
  { old: "202", oldLabel: "Membre honoraire", neu: "honoraire", neuLabel: "Ehrenmitglied" },
  { old: "188", oldLabel: "Non actif licencié", neu: "inaktiv", neuLabel: "Inaktiv" },
  { old: "254 / 988", oldLabel: "inactif", neu: "inaktiv", neuLabel: "Inaktiv" },
  { old: "220 / 221", oldLabel: "Arrêt temporaire", neu: "arret_temporaire", neuLabel: "Temporär pausiert" },
  { old: "977", oldLabel: "Blessé (pause)", neu: "pausiert_verletzung", neuLabel: "Pausiert (Verletzung)" },
  { old: "250 / 251", oldLabel: "Abandon", neu: "abbruch", neuLabel: "Abbruch" },
  { old: "252", oldLabel: "Arrêt jeune (garder licence)", neu: "abbruch_jung", neuLabel: "Abbruch (Jugend)" },
  { old: "240 / 984", oldLabel: "Ancien membre", neu: "ehemalig", neuLabel: "Ehemalig" },
  { old: "255 / 256 / 991-994", oldLabel: "Arrêt / supprimer", neu: "geloescht", neuLabel: "Gelöscht" },
  { old: "300 / 304", oldLabel: "Prêt / transfert sortant", neu: "transfer", neuLabel: "Transfer (raus)" },
  { old: "301 / 302", oldLabel: "Prêt / transfert entrant", neu: "transfer", neuLabel: "Transfer (rein)" },
];

interface RosterMember {
  id: number;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  cardId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  birthdate?: string | null;
  nationality?: string | null;
  licenseNumber?: string | null;
  matricule?: string | null;
  medicoNext?: string | null;
  medicoList?: number | null;
  medicoComment?: string | null;
  medicoResult?: string | null;
  medicoResultDate?: string | null;
  joinDate?: string | null;
  catCode?: number | null;
  internalCategory?: string | null;
  flhCategory?: string | null;
  membershipStatus?: string | null;
  licenceStatus?: string | null;
  transferStatus?: string | null;
  memberType?: string | null;
  contactInfoType?: string | null;
  familyCode?: string | null;
  functions: string[];
  functionDetails?: { function: string; qualification?: string | null; note?: string | null }[];
  trainingPresent: number;
  trainingTotal: number;
  trainingRate: number | null;
  trainingLast: string | null;
  matchCount: number;
  active: boolean;
  raw: Record<string, any>;
}

const cleanLabel = (k: string) => k.replace(/\s+/g, " ").trim();

// Nachname komplett in Großschrift.
const formatLastName = (s: string) => s.toUpperCase();
// Vorname: nur erster Buchstabe je Wort groß, Rest klein.
const formatFirstName = (s: string) =>
  s.toLowerCase().replace(/(^|[\s\-'’])([a-zà-ÿ])/g, (_m, sep, ch) => sep + ch.toUpperCase());
// Vorname + kompletter Nachname in Großschrift (PT/ES-Doppelnamen, verheiratete Frauen).
const formatMemberName = (m: any): string =>
  m?.lastName
    ? `${m.firstName ? formatFirstName(m.firstName) + " " : ""}${formatLastName(m.lastName)}`
    : (m?.name ?? "");

function categoryLabel(m: RosterMember): string {
  return m.internalCategory || (m.catCode && CAT_CODE_LABELS[m.catCode]) || m.flhCategory || "—";
}

function normalizeHeader(k: string): string {
  return cleanLabel(k).toLowerCase();
}
const RAW_KEY_ALIASES: Record<string, string> = { nom: "col0" };
function getRawValue(m: RosterMember, ...names: string[]): any {
  const raw = m.raw || {};
  for (const n of names) {
    const target = normalizeHeader(n);
    if (raw[n] !== undefined && raw[n] !== null && raw[n] !== "") return raw[n];
    for (const k of Object.keys(raw)) {
      if (normalizeHeader(k) === target) return raw[k];
    }
    const alias = RAW_KEY_ALIASES[target];
    if (alias != null && raw[alias] !== undefined && raw[alias] !== null && raw[alias] !== "") return raw[alias];
    // Langue / Nationalité aufsplitten
    if (target === "langue" || target === "nationalite") {
      const combined: string = m.nationality || getRawValue(m, "Langue / Nationalité") || "";
      const parts: string[] = String(combined).split(" / ");
      return target === "langue"
        ? mapLangCode((parts[0] || "").trim())
        : (parts[1] || "").trim();
    }
  }
  return undefined;
}
function oldCodeValue(m: RosterMember): string {
  const v = getRawValue(m, "Cat", "Alter Code (Liste)", "AL Cat", "Al Cat");
  return v != null && v !== "" ? String(v) : "—";
}
function formatDateRaw(v: any): string {
  if (v == null || v === "") return "—";
  const s = String(v).trim();
  if (!s) return "—";
  // Bereits im gewünschten Format belassen
  if (/^\d{2}\.\d{2}\.\d{2,4}$/.test(s)) return s;
  // dd/mm/yy oder dd/mm/yyyy
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m1) {
    const [_, d, mo, y] = m1;
    const yr = y.length === 2 ? `20${y.padStart(2, "0")}` : y;
    return `${d.padStart(2, "0")}.${mo.padStart(2, "0")}.${yr.slice(-2)}`;
  }
  // ISO yyyy-mm-dd
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m2) {
    const [_, y, mo, d] = m2;
    return `${d}.${mo}.${y.slice(-2)}`;
  }
  // Excel/JS Date-String fallback
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }
  return s;
}
const DATE_COLUMN_PATTERNS = ["date début licence", "date début membre", "prochain médico", "naissance"];
function isDateColumn(name: string): boolean {
  const n = cleanLabel(name).toLowerCase();
  return DATE_COLUMN_PATTERNS.some((p) => n.includes(p));
}

const DISPLAY_LANG_MAP: Record<string, string> = {
  F: "FR", E: "EN", G: "EN", GB: "EN", I: "IT", P: "PT", S: "ES",
  D: "DE", A: "DE", H: "HU", N: "NL", L: "LU", LB: "LU", B: "BE",
};
function mapLangCode(code: string): string {
  return DISPLAY_LANG_MAP[code.toUpperCase()] || code;
}
function langNat(m: RosterMember): { lang: string; nat: string } {
  const raw = m.nationality || getRawValue(m, "Langue / Nationalité") || "";
  const parts = String(raw).split(" / ");
  return { lang: mapLangCode((parts[0] || "").trim()), nat: (parts[1] || "").trim() };
}

function csvEscape(v: any): string {
  const s = v == null ? "" : String(v);
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Aktueller Vereinsmember? Gemeinsame Definition (Client + Server):
// Kontakte, Ex-Mitglieder und gelöschte Lizenzen zählen NICHT (Archiv „Ancien Membres").
function isActiveMember(m: RosterMember): boolean {
  return isActiveClubMember(m);
}

// Extrahiert das Jahr (JJJJ) aus dem Médico-Feld, sonst null (z.B. bei "Apte").
function medicoYearOf(m: RosterMember): string | null {
  const mm = String(m.medicoNext || "").match(/(19|20)\d{2}/);
  return mm ? mm[0] : null;
}
// Farbliche Hervorhebung der Médico-Zelle: 2026 rot, 2027 gelb.
function medicoCellClass(year: string | null): string {
  if (year === "2026") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-medium";
  if (year === "2027") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 font-medium";
  return "";
}

// ─── Médico-Status (abgeleitet aus medicoNext + aktuellem Jahr) ─────────
const MEDICO_CUR_YEAR = new Date().getFullYear();
type MedicoState = "valid" | "due" | "overdue" | "inapte" | "pseudo";
function medicoState(m: RosterMember): MedicoState {
  // Explizit gesetztes Resultat (Sekretariat) hat höchsten Vorrang.
  const res = medicoResultOf(m);
  if (res === "apte") return "valid";              // durch → spielberechtigt
  if (res === "inapte") return "inapte";           // nicht spielberechtigt
  if (res === "apte_temporaire") return "due";     // muss erneut hin
  if (res === "absent") return "overdue";          // nicht gegangen → muss (noch) hin
  // Sonst: Sekretariats-Kommentar (inapte / apte temporaire jusqu'au … / Docteur).
  const cm = String(m.medicoComment || "").toLowerCase();
  if (cm.includes("inapte")) return "inapte";
  const dm = cm.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})/);
  if (dm && (cm.includes("apte") || cm.includes("jusqu"))) {
    let yr = parseInt(dm[3], 10); if (yr < 100) yr += 2000;
    const exp = new Date(yr, parseInt(dm[2], 10) - 1, parseInt(dm[1], 10)).getTime();
    return exp < Date.now() ? "overdue" : "valid"; // temporär apte: abgelaufen → muss gehen
  }
  if (cm.includes("docteur") && (cm.includes("necessaire") || cm.includes("nécessaire"))) return "due";
  // sonst: Jahr aus "Prochain Médico".
  const s = String(m.medicoNext || "").trim().toLowerCase();
  if (s.includes("inapte")) return "inapte";
  const y = medicoYearOf(m);
  if (y) {
    const yr = parseInt(y, 10);
    if (yr < MEDICO_CUR_YEAR) return "overdue";  // war schon fällig → muss (noch) gehen
    if (yr === MEDICO_CUR_YEAR) return "due";     // dieses Jahr fällig
    return "valid";                               // schon gewesen / spielberechtigt bis Jahr
  }
  if (s.includes("apte") || s.includes("cert") || s.includes("ok")) return "valid";
  return "pseudo"; // pseudo-aktiv: kein Médico-Eintrag, geht sowieso nicht
}
// Médico-relevant = steht auf dem "Médico 2026"-Blatt (Sekretariat-Liste, medico_list=1).
function isMedicoRelevant(m: RosterMember): boolean {
  return m.medicoList === 1;
}
// "Muss gehen" = dieses Jahr fällig oder überfällig (für RDV/Mail-Liste)
function medicoMustGo(m: RosterMember): boolean {
  const st = medicoState(m);
  return st === "due" || st === "overdue";
}
const MEDICO_STATES: { key: MedicoState; label: string; short: string; badge: string; chip: string }[] = [
  { key: "valid", label: "Gültig — schon gewesen / spielberechtigt bis Jahr", short: "Gültig", badge: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", chip: "border-green-400 text-green-700" },
  { key: "due", label: "Dieses Jahr fällig — Termin nötig", short: "Dieses Jahr", badge: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300", chip: "border-red-400 text-red-700" },
  { key: "overdue", label: "Überfällig — muss (noch) gehen", short: "Überfällig", badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", chip: "border-orange-400 text-orange-700" },
  { key: "inapte", label: "Inapte — nicht durchgekommen", short: "Inapte", badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", chip: "border-purple-400 text-purple-700" },
  { key: "pseudo", label: "Pseudo-aktiv — kein Médico", short: "Pseudo", badge: "bg-muted text-muted-foreground", chip: "" },
];
const MEDICO_STATE_MAP: Record<MedicoState, typeof MEDICO_STATES[number]> =
  Object.fromEntries(MEDICO_STATES.map((s) => [s.key, s])) as Record<MedicoState, typeof MEDICO_STATES[number]>;

// ─── Médico-Resultat (vom Sekretariat gesetzt: Ausgang der Untersuchung) ──
type MedicoResult = "apte" | "apte_temporaire" | "inapte" | "absent";
const MEDICO_RESULTS: { key: MedicoResult; label: string; short: string; badge: string; chip: string }[] = [
  { key: "apte", label: "Apte — durchgekommen, spielberechtigt", short: "Apte", badge: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", chip: "border-green-400 text-green-700" },
  { key: "apte_temporaire", label: "Apte temporaire — muss erneut zum Médico", short: "Temporaire", badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", chip: "border-orange-400 text-orange-700" },
  { key: "inapte", label: "Inapte — nicht spielberechtigt", short: "Inapte", badge: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300", chip: "border-red-400 text-red-700" },
  { key: "absent", label: "Net gaangen / absent — neu convocieren", short: "Absent", badge: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300", chip: "border-slate-400 text-slate-600" },
];
const MEDICO_RESULT_MAP: Record<MedicoResult, typeof MEDICO_RESULTS[number]> =
  Object.fromEntries(MEDICO_RESULTS.map((r) => [r.key, r])) as Record<MedicoResult, typeof MEDICO_RESULTS[number]>;
function medicoResultOf(m: RosterMember): MedicoResult | null {
  const r = String(m.medicoResult || "").trim();
  return (["apte", "apte_temporaire", "inapte", "absent"] as string[]).includes(r) ? (r as MedicoResult) : null;
}

// ─── Sprache für die Médico-Einladung (aus "Langue / Nationalité") ──────
type MailLang = "LB" | "FR" | "DE" | "EN" | "PT" | "IT";
const MAIL_LANGS: MailLang[] = ["LB", "FR", "DE", "EN", "PT", "IT"];
// Codes aus der Excel-Spalte "Langue / Nationalité" (1. Token) → Zielsprache.
// Anpassbar: Luxemburger (Nationalität) bekommen LB statt FR.
const LANG_CODE_MAP: Record<string, MailLang> = {
  f: "FR", fr: "FR",
  a: "DE", d: "DE", de: "DE", all: "DE", h: "DE", nl: "DE", // Deutsch / Holländer → DE
  e: "EN", en: "EN", g: "EN", gb: "EN", irl: "EN", dk: "EN", // Englisch / Irland (GB) / DK
  p: "PT", pt: "PT",
  i: "IT", "i-h": "IT", it: "IT",
  lb: "LB", l: "LB",
};
function medicoLang(m: RosterMember): MailLang {
  const raw = (m.nationality || "").toLowerCase().trim();
  const [langPart = "", natPart = ""] = raw.split("/").map((s) => s.trim());
  if (natPart.includes("luxembourg") || langPart === "lb" || langPart === "l") return "LB";
  const code = langPart.replace(/[^a-z-]/g, "");
  return LANG_CODE_MAP[code] || "FR"; // Default: Französisch (Vereinsstandard)
}
// Einladungstexte je Sprache (Terminanfrage / RDV)
const MEDICO_MAIL_TEMPLATES: Record<MailLang, { subject: string; body: string }> = {
  LB: {
    subject: "Médico — Rendez-vous (HB Mersch)",
    body: "Salut,\n\nfir déi nei Saison muss de Médico (medezinesch Untersuchung) gemaach ginn. Mir mellen dir de Rendez-vous, respektiv mell dech w.e.g. beim Sekretariat fir en Termin ze fixéieren.\n\nMerci a beschte Gréiss,\nSekretariat HB Mersch",
  },
  FR: {
    subject: "Médico — Rendez-vous (HB Mersch)",
    body: "Bonjour,\n\nPour la nouvelle saison, la visite médicale (médico) doit être effectuée. Le secrétariat vous communiquera le rendez-vous ; merci de prendre contact pour fixer une date.\n\nCordialement,\nSecrétariat HB Mersch",
  },
  DE: {
    subject: "Médico — Termin (HB Mersch)",
    body: "Guten Tag,\n\nfür die neue Saison ist die medizinische Untersuchung (Médico) erforderlich. Das Sekretariat teilt Ihnen den Termin mit bzw. bitte um Kontaktaufnahme zur Terminvereinbarung.\n\nMit freundlichen Grüßen,\nSekretariat HB Mersch",
  },
  EN: {
    subject: "Médico — Appointment (HB Mersch)",
    body: "Hello,\n\nFor the new season the medical check-up (médico) is required. The secretariat will inform you of the appointment; please get in touch to arrange a date.\n\nBest regards,\nHB Mersch Secretariat",
  },
  PT: {
    subject: "Médico — Marcação (HB Mersch)",
    body: "Olá,\n\nPara a nova época é necessário o exame médico (médico). A secretaria informará a marcação; por favor entre em contacto para marcar uma data.\n\nCom os melhores cumprimentos,\nSecretaria HB Mersch",
  },
  IT: {
    subject: "Médico — Appuntamento (HB Mersch)",
    body: "Buongiorno,\n\nPer la nuova stagione è necessaria la visita medica (médico). La segreteria comunicherà l'appuntamento; si prega di contattare per fissare una data.\n\nCordiali saluti,\nSegreteria HB Mersch",
  },
};

// Mitgliedstyp in Anzeige-Gruppen normalisieren.
const GROUP_LABELS: Record<string, string> = {
  spieler: "Spieler", ehrenmitglied: "Ehrenmitglieder", sponsor: "Sponsoren",
  contact: "Kontakte", donateur: "Donateure", sonstige: "Sonstige",
};
function memberGroup(m: RosterMember): string {
  const t = (m.memberType || "").toLowerCase();
  if (t === "honoraire" || t === "ehrenmitglied") return "ehrenmitglied";
  if (t === "donateur" || t === "donateur_licence" || t === "donateur_lizenz") return "donateur";
  if (t === "sponsor") return "sponsor";
  if (t === "contact") return "contact";
  if (t === "spieler") return "spieler";
  return t || "sonstige";
}

function getSortValue(m: RosterMember, key: string): string | number {
  switch (key) {
    case "name": return (m.lastName || m.name || "").toLowerCase();
    case "firstName": return (m.firstName || "").toLowerCase();
    case "gender": return (m.gender || "").toLowerCase();
    case "langue": return (langNat(m).lang || "").toLowerCase();
    case "nationalite": return (langNat(m).nat || "").toLowerCase();
    case "cardId": return (m.cardId || "").toLowerCase();
    case "oldCode": return oldCodeValue(m).toLowerCase();
    case "catCode": return m.catCode ?? -1;
    case "newMeaning": return (m.internalCategory || "").toLowerCase();
    case "catText": return (m.flhCategory || "").toLowerCase();
    case "category": return categoryLabel(m).toLowerCase();
    case "type": return (TYPE_LABELS[m.memberType || ""] || m.memberType || "").toLowerCase();
    case "functions": return m.functions.length;
    case "status": return (STATUS_LABELS[m.membershipStatus || ""] || m.membershipStatus || "").toLowerCase();
    case "tr": return m.trainingRate ?? -1;
    case "ma": return m.matchCount;
    case "license": return (m.licenseNumber || "").toLowerCase();
    case "matricule": return (m.matricule || "").toLowerCase();
    case "family": return (m.familyCode || "").toLowerCase();
    case "oldCourrier": return String(getRawValue(m, "code courrier", "Alter Courrier-Code") || "").toLowerCase();
    case "phone": return (m.phone || "").toLowerCase();
    case "email": return (m.email || "").toLowerCase();
    case "medico": return (m.medicoNext || "").toLowerCase();
    default:
      if (key.startsWith("raw:")) { const v = getRawValue(m, key.slice(4)); return v == null ? "" : String(v).toLowerCase(); }
      return "";
  }
}

export default function Secretariat() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [funcFilter, setFuncFilter] = useState(false);
  const [medicoOnly, setMedicoOnly] = useState(false);
  const [medicoYear, setMedicoYear] = useState<string>(""); // "" = alle Jahre
  const [medicoStateFilter, setMedicoStateFilter] = useState<MedicoState | "" | "mustgo">(""); // "" = alle Status
  const [medicoResultFilter, setMedicoResultFilter] = useState<MedicoResult | "" | "none">(""); // "" = alle, "none" = ohne Resultat
  const [convMember, setConvMember] = useState<RosterMember | null>(null); // Convocation-Modal
  const [convRdv, setConvRdv] = useState<string>(""); // datetime-local Wert
  const [convSending, setConvSending] = useState(false);
  const [convMsg, setConvMsg] = useState<string>("");
  const [codesOpen, setCodesOpen] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(true);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canView = user && ["präsident", "admin", "secretaire", "kassenwart"].includes(user.role);

  const { data: roster = [], isLoading, error } = useQuery<RosterMember[]>({
    queryKey: ["/api/secretary/roster"],
    queryFn: async () => (await apiRequest("GET", "/api/secretary/roster")).json(),
    enabled: !!canView,
  });

  // Médico-Resultat setzen (apte / temporaire / inapte / absent / "" = löschen).
  const resultMutation = useMutation({
    mutationFn: async (vars: { memberId: number; result: MedicoResult | "" }) =>
      (await apiRequest("POST", "/api/secretary/medico/result", vars)).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/secretary/roster"] }),
  });
  const setResult = (memberId: number, result: MedicoResult | "") => resultMutation.mutate({ memberId, result });

  // Vertikales Mausrad → horizontales Scrollen (für Mäuse ohne Seitwärts-Rad).
  // Am linken/rechten Rand wird das Scrollen an die Seite zurückgegeben.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;      // keine horizontale Überlänge
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // echtes Seitwärts-Scrollen
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return; // Rand → Seite scrollt
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isLoading, error, showAllColumns]);

  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  const toggleSort = (key: string) =>
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  // Schnellfilter: nur aktive Mitglieder einer Gruppe, alphabetisch sortiert.
  const applyQuick = (group: string) => {
    setStatusFilter("active"); setTypeFilter(group); setFuncFilter(false); setSort({ key: "name", dir: "asc" });
  };
  const applyFunc = () => {
    setStatusFilter("active"); setTypeFilter("all"); setFuncFilter(true); setSort({ key: "name", dir: "asc" });
  };
  const resetFilters = () => {
    setStatusFilter("active"); setTypeFilter("all"); setFuncFilter(false); setMedicoOnly(false); setMedicoYear(""); setMedicoStateFilter(""); setMedicoResultFilter(""); setSearch(""); setSort(null);
  };
  const quickActive = (group: string) => statusFilter === "active" && typeFilter === group && !funcFilter;
  const funcActive = () => statusFilter === "active" && funcFilter && typeFilter === "all";

  // Extra-Listen (Buttonleiste)
  const viewMedico = () => { setStatusFilter("active"); setTypeFilter("all"); setFuncFilter(false); setMedicoOnly(true); setSort({ key: "medico", dir: "asc" }); };
  const viewAnciens = () => { setStatusFilter("passive"); setTypeFilter("all"); setFuncFilter(false); setMedicoOnly(false); setSort({ key: "name", dir: "asc" }); };
  const viewDonBenevole = () => { setStatusFilter("all"); setTypeFilter("don_benevole"); setFuncFilter(false); setMedicoOnly(false); setSort({ key: "name", dir: "asc" }); };
  const viewSponsors = () => { setStatusFilter("all"); setTypeFilter("sponsor"); setFuncFilter(false); setMedicoOnly(false); setSort({ key: "name", dir: "asc" }); };

  // Excel-Rohspalten in Original-Reihenfolge (GC 2026-07-21)
  const EXCEL_COLUMN_ORDER = [
    "Nom", "Prénom ou les prénoms", "Sexe", "Card-Id", "Langue", "Nationalité", "Adresse", "Code postale", "Localité",
    "code courrier", "courrier ???", "Cat", "Nei Cat", "Catégorie interne Mersch75 2026-2027",
    "Cat", "Nei Cat", "Catégorie Listing FLH 2026-2027", "Etudiant", "U17H", "U15H", "U13H", "U11M", "U9M", "U7M",
    "U17F", "U15F", "U13F", "Pass Nummer (Licences Joueurs / Joueuses)", "Licences Off (officiels)",
    "Licences ZS (secrétaires / chronométreurs)", "Licences SR (arbitre)", "Licences CL (Carte de Légitimation)",
    "Commentaires & changements (Secrétaire)", "Transfert à faire en fin de saison", "Date début licence (JJ/MM/AA)",
    "date début membre (JJ/MM/AA)", "Prochain Médico", "Naissance (JJ/MM/AA)", "Matricule",
    "Lieu et pays de naissance seulement membre comité", "Tél.", "Tél.-Bureau", "GSM", "Email", "Communicateur",
    "Membres commission des jeunes", "Cat_Arbitre", "Comité", "Officiel", "FLH", "Entraîneur Diplôme",
    "cat cot 19-20", "cat cot 20-21", "envoi1 cot 19-20", "envoi2 cot 19-20", "carte membre 19-20", "pmt cot 19-20",
    "rappel impayes 2019-20", "comment Cot 19-20", "pmt cot 20-21", "rappel impayes 2020-21", "comment Cot 20-21",
    "pmt cot 21-22", "rappel impayes 2021-22", "comment Cot 21-22", "Go 2 Sports", "subs. etat 2018",
    "Subside Etat 2018", "Subside Etat 2019", "Subside Etat 2020", "Commentaires 2021/22",
  ];
  const rawColumns = useMemo(() => {
    const order = new Map(EXCEL_COLUMN_ORDER.map((k, i) => [cleanLabel(k), i]));
    const all = new Set<string>();
    for (const r of roster) {
      for (const k of Object.keys(r.raw || {})) all.add(k);
    }
    const sorted = Array.from(all).sort((a, b) => {
      const ia = order.get(cleanLabel(a)) ?? Number.MAX_SAFE_INTEGER;
      const ib = order.get(cleanLabel(b)) ?? Number.MAX_SAFE_INTEGER;
      if (ia !== ib) return ia - ib;
      return a.localeCompare(b);
    });
    const mapped: string[] = [];
    for (const k of sorted) {
      if (k === "col0") { mapped.push("Nom"); continue; }
      if (cleanLabel(k).toLowerCase() === "langue / nationalité") { mapped.push("Langue", "Nationalité"); continue; }
      mapped.push(k);
    }
    return mapped;
  }, [roster]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roster.filter((m) => {
      const hasPresence = m.trainingTotal > 0 || m.matchCount > 0;
      if (statusFilter === "active" && !isActiveMember(m)) return false;
      if (statusFilter === "passive" && isActiveMember(m)) return false;
      if (statusFilter === "with_presence" && !hasPresence) return false;
      if (statusFilter === "no_presence" && hasPresence) return false;
      if (statusFilter === "ehemalig" && (m.membershipStatus || "").toLowerCase() !== "ehemalig") return false;
      // Médico-Ansicht: aktive Spieler / Mitglieder mit Médico-Eintrag, kategorisiert nach Status.
      if (medicoOnly && !isMedicoRelevant(m)) return false;
      if (medicoOnly && medicoYear && medicoYearOf(m) !== medicoYear) return false;
      if (medicoOnly && medicoStateFilter === "mustgo" && !medicoMustGo(m)) return false;
      if (medicoOnly && medicoStateFilter && medicoStateFilter !== "mustgo" && medicoState(m) !== medicoStateFilter) return false;
      if (medicoOnly && medicoResultFilter === "none" && medicoResultOf(m) !== null) return false;
      if (medicoOnly && medicoResultFilter && medicoResultFilter !== "none" && medicoResultOf(m) !== medicoResultFilter) return false;
      if (typeFilter === "don_benevole") {
        if (!(memberGroup(m) === "donateur" || m.functions.includes("benevole"))) return false;
      } else if (typeFilter !== "all" && memberGroup(m) !== typeFilter) return false;
      if (funcFilter && m.functions.length === 0) return false;
      if (!q) return true;
      if (m.name?.toLowerCase().includes(q)) return true;
      if (m.email?.toLowerCase().includes(q)) return true;
      if (m.phone?.toLowerCase().includes(q)) return true;
      if (m.familyCode?.toLowerCase().includes(q)) return true;
      // Funktionen + Qualifikationen + Notizen (z.B. "Chrono", "Officiel", "Arbitre") durchsuchbar
      const fnDetails = m.functionDetails?.length
        ? m.functionDetails
        : m.functions.map((f) => ({ function: f, qualification: null, note: null }));
      const fnHay = fnDetails
        .map((fd) => `${FUNCTION_LABELS[fd.function] || fd.function} ${fd.qualification || ""} ${fd.note || ""}`)
        .join(" ")
        .toLowerCase();
      if (fnHay.includes(q)) return true;
      for (const v of Object.values(m.raw || {})) {
        if (String(v).toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [roster, search, statusFilter, typeFilter, funcFilter, medicoOnly, medicoYear, medicoStateFilter, medicoResultFilter]);

  const stats = useMemo(() => {
    const active = roster.filter((m) => isActiveMember(m)).length;
    const archived = roster.filter((m) => !isActiveMember(m)).length; // ehemalig + abbruch + inaktiv = "net méi do"
    const withFn = roster.filter((m) => isActiveMember(m) && m.functions.length > 0).length;
    return { active, archived, withFn };
  }, [roster]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = getSortValue(a, sort.key);
      const vb = getSortValue(b, sort.key);
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), "de", { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort]);

  const typeGroups = useMemo(() => {
    const set = new Set<string>();
    roster.forEach((m) => set.add(memberGroup(m)));
    return Array.from(set).sort();
  }, [roster]);

  // Aufschlüsselung der aktiven Mitglieder nach Gruppe.
  const breakdown = useMemo(() => {
    const act = roster.filter(isActiveMember);
    return {
      spieler: act.filter((m) => memberGroup(m) === "spieler").length,
      ehrenmitglied: act.filter((m) => memberGroup(m) === "ehrenmitglied").length,
      sponsor: act.filter((m) => memberGroup(m) === "sponsor").length,
      contact: act.filter((m) => memberGroup(m) === "contact").length,
      donateur: act.filter((m) => memberGroup(m) === "donateur").length,
      withFn: act.filter((m) => m.functions.length > 0).length,
    };
  }, [roster]);

  // Zähler für die Extra-Listen-Buttons
  const viewCounts = useMemo(() => ({
    medico: roster.filter((m) => isMedicoRelevant(m)).length,
    anciens: roster.filter((m) => !isActiveMember(m)).length,
    donBenevole: roster.filter((m) => memberGroup(m) === "donateur" || m.functions.includes("benevole")).length,
    sponsors: roster.filter((m) => memberGroup(m) === "sponsor").length,
  }), [roster]);

  // Médico-Jahre (Médico-relevante Mitglieder) mit Anzahl, aufsteigend sortiert.
  const medicoYears = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of roster) {
      if (!isMedicoRelevant(m)) continue;
      const y = medicoYearOf(m);
      if (y) counts.set(y, (counts.get(y) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [roster]);

  // Médico-Status-Zähler (Médico-relevante Mitglieder) + "muss gehen"-Summe.
  const medicoStateCounts = useMemo(() => {
    const counts: Record<MedicoState, number> = { valid: 0, due: 0, overdue: 0, inapte: 0, pseudo: 0 };
    let mustgo = 0;
    for (const m of roster) {
      if (!isMedicoRelevant(m)) continue;
      const st = medicoState(m);
      counts[st]++;
      if (st === "due" || st === "overdue") mustgo++;
    }
    return { ...counts, mustgo };
  }, [roster]);

  const medicoResultCounts = useMemo(() => {
    const counts: Record<MedicoResult, number> = { apte: 0, apte_temporaire: 0, inapte: 0, absent: 0 };
    let none = 0;
    for (const m of roster) {
      if (!isMedicoRelevant(m)) continue;
      const r = medicoResultOf(m);
      if (r) counts[r]++; else none++;
    }
    return { ...counts, none };
  }, [roster]);

  // E-Mail-Liste (mailto BCC) für die aktuell gefilterten Médico-Mitglieder mit E-Mail.
  const medicoMailList = useMemo(
    () => sorted.filter((m) => m.email && m.email.includes("@")),
    [sorted],
  );
  // Nach Einladungssprache gruppieren (jede Sprache = eigene Mail mit passendem Text).
  const medicoMailByLang = useMemo(() => {
    const map: Record<MailLang, RosterMember[]> = { LB: [], FR: [], DE: [], EN: [], PT: [], IT: [] };
    for (const m of medicoMailList) map[medicoLang(m)].push(m);
    return map;
  }, [medicoMailList]);
  const openMedicoMail = (lang: MailLang) => {
    const list = medicoMailByLang[lang];
    const emails = Array.from(new Set(list.map((m) => m.email!.trim())));
    if (emails.length === 0) return;
    const { subject, body } = MEDICO_MAIL_TEMPLATES[lang];
    const href = `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };
  const copyMedicoEmails = async () => {
    const emails = Array.from(new Set(medicoMailList.map((m) => m.email!.trim())));
    if (emails.length === 0) return;
    try { await navigator.clipboard.writeText(emails.join("; ")); } catch { /* ignore */ }
  };
  const exportMedicoCSV = () => {
    const header = ["Name", "Kategorie", "Médico-Jahr", "Status", "Kommentar (Secrétaire)", "Sprache", "E-Mail", "GSM"];
    const lines = [header.map(csvEscape).join(";")];
    for (const m of sorted) {
      lines.push([
        formatMemberName(m), categoryLabel(m), medicoYearOf(m) || m.medicoNext || "",
        MEDICO_STATE_MAP[medicoState(m)].short, m.medicoComment || "", medicoLang(m), m.email || "", m.phone || "",
      ].map(csvEscape).join(";"));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medico_liste.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const primary = [
      "Name", "Nachname", "Vorname", "Kategorie", "Typ", "Funktionen", "Status", "Aktiv",
      "Lizenz-Status", "Transfer", "TR %", "TR anwesend", "TR total", "MA Einsätze",
      "Lizenz-Nr", "Matricule", "Familiencode", "GSM", "Email", "Adresse", "Nationalität",
      "Geburtsdatum", "Nächster Médico", "Beitritt",
    ];
    const header = [...primary, ...rawColumns.map(cleanLabel)];
    const lines = [header.map(csvEscape).join(";")];
    for (const m of sorted) {
      const row = [
        formatMemberName(m), m.lastName || "", m.firstName || "", categoryLabel(m),
        TYPE_LABELS[m.memberType || ""] || m.memberType || "",
        m.functions.map((f) => FUNCTION_LABELS[f] || f).join(", "),
        STATUS_LABELS[m.membershipStatus || ""] || m.membershipStatus || "",
        isActiveMember(m) ? "Ja" : "Nein",
        LICENCE_LABELS[m.licenceStatus || ""] || m.licenceStatus || "",
        m.transferStatus || "",
        m.trainingRate == null ? "" : m.trainingRate,
        m.trainingPresent, m.trainingTotal, m.matchCount,
        m.licenseNumber || "", m.matricule || "", m.familyCode || "",
        m.phone || "", m.email || "", m.address || "", m.nationality || "",
        m.birthdate || "", m.medicoNext || "", m.joinDate || "",
        ...rawColumns.map((k) => {
          const rawV = getRawValue(m, k);
          const v = isDateColumn(k) ? formatDateRaw(rawV) : rawV;
          return v === "—" ? "" : (v ?? "");
        }),
      ];
      lines.push(row.map(csvEscape).join(";"));
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mitgliederliste_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (!canView) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Shield className="mx-auto mb-2 size-8" />
        <p>Diese Liste ist nur für Präsident, Admin, Sekretär und Trésorier zugänglich.</p>
      </div>
    );
  }

  const HeadCell = ({ k, children, className = "" }: { k: string; children: React.ReactNode; className?: string }) => {
    const on = sort?.key === k;
    return (
      <th className={`px-3 py-2 font-semibold text-xs uppercase tracking-wide whitespace-nowrap ${on ? "text-primary" : "text-muted-foreground"} ${className}`}>
        <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
          <span>{children}</span>
          {on ? (sort!.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-30" />}
        </button>
      </th>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-6 text-primary" /> Sekretariat — Mitgliederliste
          </h1>
          <p className="text-sm text-muted-foreground">
            Komplette Liste mit allen Excel-Daten, neuer Codierung und Trainings-/Match-Präsenz.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" disabled={!filtered.length}>
          <Download className="size-4 mr-1.5" /> CSV Export
        </Button>
      </div>

      {/* Extra-Listen (Fälle) */}
      <div className="flex flex-wrap gap-2">
        <Button variant={medicoOnly ? "default" : "outline"} size="sm" onClick={viewMedico}>
          <HeartPulse className="size-4 mr-1.5" /> Médico
          <Badge variant="secondary" className="ml-1.5">{viewCounts.medico}</Badge>
        </Button>
        <Button variant={statusFilter === "passive" ? "default" : "outline"} size="sm" onClick={viewAnciens}>
          <Archive className="size-4 mr-1.5" /> Archiv (net méi do)
          <Badge variant="secondary" className="ml-1.5">{viewCounts.anciens}</Badge>
        </Button>
        <Button variant={typeFilter === "don_benevole" ? "default" : "outline"} size="sm" onClick={viewDonBenevole}>
          <HandCoins className="size-4 mr-1.5" /> Donateurs-Bénévoles
          <Badge variant="secondary" className="ml-1.5">{viewCounts.donBenevole}</Badge>
        </Button>
        <Button variant={typeFilter === "sponsor" ? "default" : "outline"} size="sm" onClick={viewSponsors}>
          <Award className="size-4 mr-1.5" /> Sponsors
          <Badge variant="secondary" className="ml-1.5">{viewCounts.sponsors}</Badge>
        </Button>
        <Button variant={codesOpen ? "default" : "outline"} size="sm" onClick={() => setCodesOpen((v) => !v)}>
          <Table className="size-4 mr-1.5" /> Coden
        </Button>
      </div>

      {/* Médico-Panel (nur in der Médico-Ansicht): Status-Filter, Jahr-Filter, Mail-Liste */}
      {medicoOnly && (
        <Card className="border-red-200">
          <CardContent className="p-3 space-y-3">
            {/* Status-Kategorien */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setMedicoStateFilter("")}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition ${medicoStateFilter === "" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => setMedicoStateFilter(medicoStateFilter === "mustgo" ? "" : "mustgo")}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${medicoStateFilter === "mustgo" ? "bg-red-600 text-white border-red-600" : "border-red-400 text-red-700 hover:bg-red-50"}`}
              >
                Muss gehen <span className="opacity-80">({medicoStateCounts.mustgo})</span>
              </button>
              {MEDICO_STATES.map((st) => {
                const active = medicoStateFilter === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    title={st.label}
                    onClick={() => setMedicoStateFilter(active ? "" : st.key)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition ${active ? "bg-primary text-primary-foreground border-primary" : `hover:bg-muted ${st.chip}`}`}
                  >
                    {st.short} <span className="opacity-70">({medicoStateCounts[st.key]})</span>
                  </button>
                );
              })}
            </div>

            {/* Resultat der Untersuchung (vom Sekretariat gesetzt) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">Resultat:</span>
              <button
                type="button"
                onClick={() => setMedicoResultFilter("")}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition ${medicoResultFilter === "" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
              >
                Alle
              </button>
              <button
                type="button"
                title="Noch kein Resultat erfasst"
                onClick={() => setMedicoResultFilter(medicoResultFilter === "none" ? "" : "none")}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition ${medicoResultFilter === "none" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
              >
                Offen <span className="opacity-70">({medicoResultCounts.none})</span>
              </button>
              {MEDICO_RESULTS.map((r) => {
                const active = medicoResultFilter === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    title={r.label}
                    onClick={() => setMedicoResultFilter(active ? "" : r.key)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition ${active ? "bg-primary text-primary-foreground border-primary" : `hover:bg-muted ${r.chip}`}`}
                  >
                    {r.short} <span className="opacity-70">({medicoResultCounts[r.key]})</span>
                  </button>
                );
              })}
            </div>

            {/* Jahr-Auswahl */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">Jahr:</span>
              <button
                type="button"
                onClick={() => setMedicoYear("")}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition ${medicoYear === "" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
              >
                Alle
              </button>
              {medicoYears.map(([year, count]) => {
                const active = medicoYear === year;
                const accent = year === "2026"
                  ? "border-red-400 text-red-700"
                  : year === "2027" ? "border-yellow-400 text-yellow-700" : "";
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setMedicoYear(active ? "" : year)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition ${active ? "bg-primary text-primary-foreground border-primary" : `hover:bg-muted ${accent}`}`}
                  >
                    {year} <span className="opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Mail-Liste / Export für die aktuelle Auswahl — je Sprache eine eigene Mail */}
            <div className="space-y-2 pt-1 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">
                  E-Mail (RDV) je Sprache — {medicoMailList.length} von {filtered.length} mit E-Mail:
                </span>
                {MAIL_LANGS.map((lang) => {
                  const n = medicoMailByLang[lang].length;
                  if (n === 0) return null;
                  return (
                    <Button key={lang} variant="default" size="sm" className="gap-1.5" onClick={() => openMedicoMail(lang)}>
                      <Mail className="size-4" /> {lang} <span className="opacity-80">({n})</span>
                    </Button>
                  );
                })}
                {medicoMailList.length === 0 && (
                  <span className="text-xs text-muted-foreground">— keine E-Mail-Adressen in der Auswahl</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={copyMedicoEmails} disabled={medicoMailList.length === 0}>
                  <Copy className="size-4" /> Adressen kopieren
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={exportMedicoCSV} disabled={filtered.length === 0}>
                  <Download className="size-4" /> Médico-CSV
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  Tipp: „Muss gehen" wählen → dann je Sprache versenden. Luxemburger erhalten LB.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {codesOpen && <CodesPanel />}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Users className="size-5 text-green-600" />} label="Aktive Memberen (gesamt)" value={stats.active} />
        <StatCard icon={<Shield className="size-5 text-blue-600" />} label="Dovun mit Funktion" value={stats.withFn} />
        <StatCard icon={<Archive className="size-5 text-muted-foreground" />} label="Im Archiv (net méi do)" value={stats.archived} />
      </div>

      {/* Aufschlüsselung der aktiven Mitglieder — klickbar, filtert + sortiert alphabetisch */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Aktive davon:</span>
          <StatChip label="Spieler" count={breakdown.spieler} active={quickActive("spieler")} onClick={() => applyQuick("spieler")} />
          <StatChip label="Ehrenmitglieder" count={breakdown.ehrenmitglied} active={quickActive("ehrenmitglied")} onClick={() => applyQuick("ehrenmitglied")} />
          <StatChip label="Sponsoren" count={breakdown.sponsor} active={quickActive("sponsor")} onClick={() => applyQuick("sponsor")} />
          <StatChip label="Kontakte" count={breakdown.contact} active={quickActive("contact")} onClick={() => applyQuick("contact")} />
          {breakdown.donateur > 0 && (
            <StatChip label="Donateure" count={breakdown.donateur} active={quickActive("donateur")} onClick={() => applyQuick("donateur")} />
          )}
          <StatChip label="mit Funktion" count={breakdown.withFn} active={funcActive()} onClick={applyFunc} />
          <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={resetFilters}>Zurücksetzen</Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Suche (Name, Email, Funktion/Qualifikation z.B. Chrono, Code, Excel-Daten…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Nur aktive Mitglieder</SelectItem>
              <SelectItem value="passive">Archiv (net méi do — ehemalig/abbruch/inaktiv)</SelectItem>
              <SelectItem value="ehemalig">Nur Ehemalig (Anciens)</SelectItem>
              <SelectItem value="with_presence">Mit Präsenz (TR/MA)</SelectItem>
              <SelectItem value="no_presence">Ohne Präsenz</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              {typeGroups.map((t) => (
                <SelectItem key={t} value={t}>{GROUP_LABELS[t] || t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch id="allcols" checked={showAllColumns} onCheckedChange={setShowAllColumns} />
            <Label htmlFor="allcols" className="text-sm cursor-pointer whitespace-nowrap">Alle Excel-Spalten</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {filtered.length} von {stats.active} Mitgliedern
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground hidden sm:inline mr-1">Tabelle scrollen</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => scrollBy(-500)} title="Nach links">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => scrollBy(500)} title="Nach rechts">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Lädt…</div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">Fehler beim Laden der Liste.</div>
          ) : (
            <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden [scrollbar-width:thin]">
              <table className="w-max min-w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <HeadCell k="name" className="sticky left-0 bg-muted/50 z-10 min-w-[180px]">Nom</HeadCell>
                    <HeadCell k="firstName">Prénom</HeadCell>
                    <HeadCell k="gender">Sexe</HeadCell>
                    <HeadCell k="cardId">Card-ID</HeadCell>
                    <HeadCell k="langue">Langue</HeadCell>
                    <HeadCell k="nationalite">Nationalité</HeadCell>
                    <HeadCell k="address">Adresse</HeadCell>
                    <HeadCell k="oldCourrier">Alt. Courrier</HeadCell>
                    <HeadCell k="courrierNew">Neu. Courrier</HeadCell>
                    <HeadCell k="oldCode">AL Cat</HeadCell>
                    <HeadCell k="catCode">Nei CAT</HeadCell>
                    <HeadCell k="newMeaning">Catégorie interne Mersch75 2026-2027</HeadCell>
                    <HeadCell k="oldCode">Al Cat</HeadCell>
                    <HeadCell k="catCode">Nei Cat</HeadCell>
                    <HeadCell k="catText">Catégorie Listing FLH 2026-2027</HeadCell>
                    <HeadCell k="status">Status (DB)</HeadCell>
                    <HeadCell k="type">Typ</HeadCell>
                    <HeadCell k="functions">Funktionen</HeadCell>
                    <HeadCell k="tr" className="text-center">TR</HeadCell>
                    <HeadCell k="ma" className="text-center">MA</HeadCell>
                    <HeadCell k="phone">GSM</HeadCell>
                    <HeadCell k="email">Email</HeadCell>
                    <HeadCell k="license">Lizenz-Nr</HeadCell>
                    <HeadCell k="matricule">Matricule</HeadCell>
                    <HeadCell k="medico">Médico</HeadCell>
                    {showAllColumns && rawColumns.map((k) => (
                      <HeadCell key={k} k={`raw:${k}`}>{cleanLabel(k) || "—"}</HeadCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-muted/30">
                      <td className="sticky left-0 bg-background z-10 px-3 py-2 border-r">
                        <Link href={`/members/${m.id}`} className="flex items-center gap-1 hover:text-primary">
                          <span className="font-bold">
                            {m.lastName ? formatLastName(m.lastName) : m.name}
                          </span>
                          <ChevronRight className="size-3 opacity-40 shrink-0" />
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatFirstName(m.firstName || "")}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">{m.gender || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{m.cardId || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{langNat(m).lang || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{langNat(m).nat || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap max-w-[220px] truncate" title={m.address || ""}>{m.address || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{getRawValue(m, "code courrier", "Alter Courrier-Code") || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{getRawValue(m, "courrier ???") || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{oldCodeValue(m)}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{m.catCode ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{m.internalCategory || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{oldCodeValue(m)}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{m.catCode ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{m.flhCategory || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={isActiveMember(m) ? "" : "text-muted-foreground"}>
                            {STATUS_LABELS[m.membershipStatus || ""] || m.membershipStatus || "—"}
                          </span>
                          {!isActiveMember(m) && <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-600">nur Liste</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{TYPE_LABELS[m.memberType || ""] || m.memberType || "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const details = m.functionDetails?.length
                              ? m.functionDetails
                              : m.functions.map((f) => ({ function: f, qualification: null, note: null }));
                            if (details.length === 0) return <span className="text-muted-foreground">—</span>;
                            return details.map((fd) => (
                              <Badge key={fd.function} variant="secondary" className="text-[10px]" title={fd.note || undefined}>
                                {FUNCTION_LABELS[fd.function] || fd.function}{fd.qualification ? ` · ${fd.qualification}` : ""}
                              </Badge>
                            ));
                          })()}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {m.trainingTotal > 0 ? (
                          <span title={`${m.trainingPresent}/${m.trainingTotal}`}>
                            <span className={m.trainingRate! >= 60 ? "text-green-600 font-medium" : "text-amber-600"}>
                              {m.trainingRate}%
                            </span>
                            <span className="text-muted-foreground text-xs"> ({m.trainingPresent}/{m.trainingTotal})</span>
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {m.matchCount > 0 ? m.matchCount : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{m.phone || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate" title={m.email || ""}>{m.email || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{m.licenseNumber || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{m.matricule || "—"}</td>
                      <td className={`px-3 py-2 whitespace-nowrap ${medicoCellClass(medicoYearOf(m))}`}>
                        <div className="flex items-center gap-1.5">
                          <span>{m.medicoNext || "—"}</span>
                          {medicoOnly && (
                            <>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] ${MEDICO_STATE_MAP[medicoState(m)].badge}`} title={MEDICO_STATE_MAP[medicoState(m)].label}>
                                {MEDICO_STATE_MAP[medicoState(m)].short}
                              </span>
                              <span className="rounded border px-1 py-0.5 text-[10px] text-muted-foreground" title={`Einladungssprache: ${medicoLang(m)}${m.nationality ? ` (${m.nationality})` : ""}`}>
                                {medicoLang(m)}
                              </span>
                              {m.medicoComment && (
                                <span className="text-[10px] text-muted-foreground italic max-w-[220px] truncate" title={m.medicoComment}>
                                  {m.medicoComment}
                                </span>
                              )}
                              {(() => {
                                const cur = medicoResultOf(m);
                                return (
                                  <select
                                    value={cur ?? ""}
                                    disabled={resultMutation.isPending}
                                    onChange={(e) => setResult(m.id, (e.target.value as MedicoResult | ""))}
                                    title="Médico-Resultat setzen"
                                    className={`ml-auto rounded border px-1 py-0.5 text-[10px] ${cur ? MEDICO_RESULT_MAP[cur].badge : "text-muted-foreground"}`}
                                  >
                                    <option value="">Resultat…</option>
                                    {MEDICO_RESULTS.map((r) => (
                                      <option key={r.key} value={r.key}>{r.short}</option>
                                    ))}
                                  </select>
                                );
                              })()}
                              <button
                                type="button"
                                onClick={() => { setConvMember(m); setConvRdv(""); setConvMsg(""); }}
                                title="Convocation (Bréif/PDF) erstellen"
                                className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] hover:bg-muted"
                              >
                                <FileText className="size-3" /> Convocation
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      {showAllColumns && rawColumns.map((k) => {
                        const rawV = getRawValue(m, k);
                        const v = isDateColumn(k) ? formatDateRaw(rawV) : rawV;
                        return (
                          <td key={k} className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground max-w-[200px] truncate" title={String(v ?? "")}>
                            {v != null && v !== "" ? String(v) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Hinweis: <strong>MA</strong> (Match-Einsätze) wird angezeigt, sobald Spiele &amp; Aufstellungen erfasst und Mitglieder mit
        Benutzerkonten verknüpft sind. <strong>TR</strong> = Trainingspräsenz aus der Anwesenheitsliste.
      </p>

      {/* ─── Convocation-Modal (Bréif/PDF pro Spiller) ─── */}
      {convMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConvMember(null)}>
          <div className="w-full max-w-md rounded-lg bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Convocation Médico</h3>
              <button type="button" onClick={() => setConvMember(null)} className="rounded p-1 hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Spiller: </span>
                <strong>{formatMemberName(convMember)}</strong>
                <span className="ml-2 rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground" title={convMember.nationality || ""}>
                  Sprooch: {medicoLang(convMember)}
                </span>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Rendez-vous (Datum &amp; Zäit)</Label>
                <Input type="datetime-local" value={convRdv} onChange={(e) => setConvRdv(e.target.value)} />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Datum uewe („Mersch, den …") gëtt automatesch op haut gesat. Loosst d'RDV-Feld eidel fir e Blanko-Bréif.
                </p>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">E-Mail: </span>
                {convMember.email && convMember.email.includes("@")
                  ? <span>{convMember.email}</span>
                  : <span className="text-destructive">keng gülteg Adress — Mail-Versand net méiglech</span>}
              </div>
              {convMsg && <div className="rounded bg-muted px-2 py-1 text-xs">{convMsg}</div>}
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setConvMember(null)}>Zoumaachen</Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    openConvocation({
                      name: convMember.name,
                      lang: medicoLang(convMember) as ConvLang,
                      rdv: convRdv ? new Date(convRdv) : null,
                    });
                  }}
                >
                  <Printer className="size-4" /> Drécken / PDF
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={convSending || !convMember.email || !convMember.email.includes("@")}
                  onClick={async () => {
                    if (!convMember) return;
                    setConvSending(true); setConvMsg("");
                    try {
                      const res = await apiRequest("POST", "/api/secretary/medico/convocation", {
                        memberId: convMember.id,
                        rdv: convRdv || null,
                        lang: medicoLang(convMember),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) setConvMsg(`✅ Mail geschéckt un ${data.email}`);
                      else setConvMsg(`⚠️ ${data.message || "Versand feelgeschloen"}`);
                    } catch (e: any) {
                      setConvMsg(`⚠️ Feeler: ${e?.message || "onbekannt"}`);
                    } finally {
                      setConvSending(false);
                    }
                  }}
                >
                  <Mail className="size-4" /> {convSending ? "Schécken…" : "Mail schécken"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeTable({ title, entries }: { title: string; entries: [string, string][] }) {
  return (
    <div className="min-w-[240px] flex-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{title}</div>
      <div className="rounded-md border divide-y">
        {entries.map(([code, label]) => (
          <div key={code} className="grid grid-cols-[7rem_1fr] gap-2 px-2 py-1 text-sm items-baseline">
            <span className="font-mono text-xs text-primary break-words leading-tight">{code}</span>
            <span className="break-words leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodesPanel() {
  const cat = Object.entries(CAT_CODE_LABELS).map(([k, v]) => [k, v] as [string, string]);
  const fn = Object.entries(FUNCTION_LABELS).map(([k, v]) => [k, v] as [string, string]);
  const types = Object.entries(TYPE_LABELS).map(([k, v]) => [k, v] as [string, string]);
  const status = Object.entries(STATUS_LABELS).map(([k, v]) => [k, v] as [string, string]);
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="text-sm font-medium">Codierung — aktuell im System verwendete Codes</div>
        <p className="text-xs text-muted-foreground">
          Übersicht der Codes, die diese Mitgliederliste intern verwendet: Spielkategorien, Funktionen,
          Mitgliedstyp und Status. Links steht jeweils der Code, rechts die Bedeutung.
        </p>
        <div className="flex flex-wrap gap-4">
          <CodeTable title="Spielkategorien" entries={cat} />
          <CodeTable title="Funktionen" entries={fn} />
          <CodeTable title="Mitgliedstyp" entries={types} />
          <CodeTable title="Status" entries={status} />
        </div>

        <div className="pt-2 border-t">
          <div className="text-sm font-medium">Alt ↔ Neu — Excel-Codes (TABLES) gegenübergestellt</div>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Gegenüberstellung der alten „code interne HBM" aus dem Excel-Blatt <span className="font-mono">TABLES</span>{" "}
            mit der neuen Systemcodierung. Mehrere alte Codes können auf denselben neuen Code abgebildet werden.
          </p>
          <div className="flex flex-wrap gap-4">
            <CodeCompareTable title="Spielkategorien" entries={CODE_MAP_CATEGORIES} />
            <CodeCompareTable title="Funktionen" entries={CODE_MAP_FUNCTIONS} />
            <CodeCompareTable title="Typ & Status" entries={CODE_MAP_TYPE_STATUS} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CodeCompareTable({ title, entries }: { title: string; entries: CodeMapEntry[] }) {
  return (
    <div className="min-w-[280px] flex-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{title}</div>
      <div className="rounded-md border divide-y">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/50">
          <span>Alt (Excel)</span>
          <span className="text-center">→</span>
          <span>Neu (System)</span>
        </div>
        {entries.map((e, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 px-2 py-1 text-xs items-baseline">
            <span className="leading-tight break-words">
              <span className="font-mono text-muted-foreground">{e.old}</span>
              <span className="text-muted-foreground"> · {e.oldLabel}</span>
            </span>
            <span className="text-center text-muted-foreground">→</span>
            <span className="leading-tight break-words">
              <span className="font-mono text-primary">{e.neu}</span>
              <span> · {e.neuLabel}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}
    >
      <span>{label}</span>
      <span className="font-bold">{count}</span>
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

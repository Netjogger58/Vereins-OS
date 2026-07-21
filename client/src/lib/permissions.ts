import type { Role } from "@shared/schema";

// ═══════════════════════════════════════════════════════════
// Zentrale Rollen-Matrix — eng eenzeg Quell fir Sidebar + Route-Guard
// Confirméiert 16.07.2026:
//  - Trainer & Teambegleeder: Accès op all Teams
//  - Elteren ↔ Kand(er) via family_code
//  - Elteren-Chat: pro Team + global (kee Spiller-Team-Chat)
// ═══════════════════════════════════════════════════════════

const ALL: Role[] = ["präsident", "admin", "kassenwart", "secretaire", "trainer", "spieler", "elternteil"];
const VORSTAND: Role[] = ["präsident", "admin"];
const VORSTAND_FINANZ: Role[] = ["präsident", "admin", "kassenwart"];
const VORSTAND_SEKRETARIAT: Role[] = ["präsident", "admin", "secretaire"];
const VORSTAND_ERWEITERT: Role[] = ["präsident", "admin", "secretaire", "kassenwart"];
const SPORT_LEITER: Role[] = ["präsident", "admin", "trainer", "secretaire"];
const SPORT_LEITER_PLUS_SPIELER: Role[] = ["präsident", "admin", "trainer", "secretaire", "spieler"];
const TRAINER_ONLY: Role[] = ["präsident", "admin", "trainer"];
const SPIELER_ERWEITERT: Role[] = ["präsident", "admin", "trainer", "spieler"];

// Route → erlaabt Rollen
// Keen Eintrag = all Rollen dierfen
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // ─── Übersicht ───
  "/": ALL,
  "/announcements": ALL,
  "/my-events": ALL,
  "/parent": ["elternteil", "präsident", "admin"],
  "/calendar": ALL,
  "/calendar-feed": ALL,
  "/chat": ["präsident", "admin", "secretaire", "trainer", "spieler", "elternteil"],

  // ─── Sport ───
  "/teams": ALL,
  "/checkin": ["präsident", "admin", "secretaire", "trainer"],
  "/training-schedules": SPORT_LEITER,
  "/training-exercises": ["präsident", "admin", "trainer", "secretaire"],
  "/trainer-codes": VORSTAND,
  "/live-match": SPORT_LEITER_PLUS_SPIELER,
  "/attendance": TRAINER_ONLY,
  "/trial-registrations": ["präsident", "admin", "secretaire", "trainer"],
  "/matches": SPORT_LEITER_PLUS_SPIELER,
  "/carpools": ALL,
  "/player-statistics": SPORT_LEITER_PLUS_SPIELER,
  "/nominations": SPIELER_ERWEITERT,
  "/facility-bookings": SPORT_LEITER,
  "/opponents": SPORT_LEITER,
  "/waitlist": ["präsident", "admin", "trainer"],

  // ─── Verein ───
  "/members": ["präsident", "admin", "secretaire", "kassenwart", "trainer"],
  "/shop": ALL,
  "/secretariat": VORSTAND_ERWEITERT,
  "/duties": ["präsident", "admin", "trainer", "secretaire"],
  "/registrations": ["präsident", "admin", "secretaire", "trainer"],
  "/welcome-mappe": ALL,
  "/sponsors": VORSTAND_SEKRETARIAT,
  "/gallery": ALL,
  "/polls": ALL,

  // ─── Verwaltung ───
  "/inventory": ["präsident", "admin", "secretaire", "kassenwart", "trainer"],
  "/finance": VORSTAND_FINANZ,
  "/fees": ["präsident", "admin", "kassenwart", "elternteil"],
  "/documents": VORSTAND_ERWEITERT,
  "/statistics": VORSTAND_ERWEITERT,
  "/invoices": VORSTAND_ERWEITERT,
  "/donations": VORSTAND_ERWEITERT,
  "/bulk-operations": VORSTAND_SEKRETARIAT,
  "/mass-email": VORSTAND_SEKRETARIAT,
  "/finance/import": VORSTAND_FINANZ,
  "/meetings": ["präsident", "admin", "secretaire", "kassenwart", "trainer"],
  "/email-settings": VORSTAND,
  "/budget": VORSTAND_FINANZ,
  "/newsletter": VORSTAND_SEKRETARIAT,
  "/gdpr": ALL,
  "/website": VORSTAND_SEKRETARIAT,
  "/archive": VORSTAND_SEKRETARIAT,

  // ─── Spezial ───
  "/profile": ALL,
  "/registration": ALL,
  "/import": VORSTAND_SEKRETARIAT,
  "/facilities": SPORT_LEITER,
};

// Hëllef: huet de User Accès op eng Route?
export function canAccess(route: string, role: Role): boolean {
  const allowed = ROUTE_PERMISSIONS[route];
  if (!allowed) return true; // keen Eintrag = all dierfen
  return allowed.includes(role);
}

// Hëllef: Rollen fir eng Route (fir Sidebar-Filterung)
export function rolesForRoute(route: string): Role[] | undefined {
  return ROUTE_PERMISSIONS[route];
}

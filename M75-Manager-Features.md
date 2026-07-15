# M75 Manager - Funktionsübersicht

## Stand: Juli 2026

---

## Änderungen 13.–14. Juli 2026 — Finanzen, Budget & Mitgliederzahlen ✅

> Umgesetzt am 13.–14. Juli 2026. **Status: funktioniert** — Typecheck grün, Summen gegen die Vereinsberichte (Charges/Produits, Bilan) geprüft, DB-Zahlen bestätigt (**555 aktiv**).

### Finanzen: echte Vereinsdaten importiert (`Finance.tsx`, `import-finances.cjs`)
- **Demo-Konten/Buchungen entfernt**, **7 reale Bankkonten** mit Salden Stand 2025-26 angelegt.
- **Einnahmen/Ausgaben** der Saisons **2024-25** und **2025-26** als zusammengefasste Buchungen importiert.
- Neue Felder auf `transactions`: **`category`** und **`season`**; neue Tabelle **`budgets`** (Saison-Budget je Kategorie/Typ).
- **`FINANCE_CATEGORIES`** (Einnahme/Ausgabe) als gemeinsame Kategorien-Liste.
- **UI:** Kategorie-Auswahl im Buchungs-Dialog, **Saison-Filter** für Buchungen.

### Budget & Prognosen 2026-27 (`Budget.tsx`, `/api/season-budgets`)
- **Budget-Seite** zeigt geplante **Charges/Produits** je Kategorie aus der `budgets`-Tabelle inkl. Total und **geplantem Resultat**.
- Storage-Methoden + API-Routen `GET/POST/DELETE /api/season-budgets`.

### Finanz-Zugriff eingeschränkt (nur Präsident / Trésorier / Admin)
- Seiten **`/finance`, `/budget`, `/fees`** nur für Rollen `präsident`, `admin`, `kassenwart` — sonst `NotFound` (`App.tsx`).
- API abgesichert: `/api/accounts`, `/api/transactions`, `/api/budget`, `/api/season-budgets`, `/api/fee-rules`, `/api/member-fees`, `/api/members/:id/fees`.

### Mitgliederliste 2026-27 aktualisiert (`update-members-130726.cjs`)
- Import aus **`M75_membres_2026_2027_Codes_alt_neu_130726.xlsx`** (Sekretärsliste, Stand 13.07.).
- **Neue CAT-Codes** (Spalten K/N) übernommen; nicht mehr gelistete Mitglieder → **`ehemalig`** (Archiv).
- Ergebnis: **555 aktiv**, **457 im Archiv** („Ancien Membres"). Backup vor Anwendung.

### „1012" verschwindet überall — nur aktive Mitglieder zählen
- **Grundregel:** Ex-Mitglieder (Archiv) zählen **nie** zur Mitgliederzahl.
- `shared/memberStatus.ts` → `isActiveClubMember` prüft jetzt `membershipStatus` **und** `membership_status` (robust).
- **Sekretariat-Mitgliederliste** (`Secretariat.tsx`): Basiszahl ist `stats.active` → **„555 von 555"** statt „555 von 1012".
- **PDF-Export** (`/api/export/members/pdf`) filtert auf aktive Mitglieder.
- Dashboard, Mitglieder-Seite und Statistiken zählen bereits über `isActiveClubMember` → **555**.

---

## Änderungen Juli 2026 — Sekretariat & Médico ✅

> Umgesetzt am 5.–6. Juli 2026. **Status: funktioniert** — Typecheck grün, E-Mail + Antwort-Seiten per Screenshot verifiziert, DB-Zahlen bestätigt.

### Sekretariat: Mitgliederverwaltung (`client/src/pages/Secretariat.tsx`)
- **Roster-Gesamtansicht** aller Mitglieder mit Excel-Rohdaten, neuer Codierung, Trainings-/Match-Präsenz und Funktionen.
- **Filter:** Status (aktiv / Archiv / mit-ohne Präsenz), Typ (Spieler/Donateur/Sponsor/Kontakt), „mit Funktion", Suche über alle Felder.
- **Aktive Mitglieder = „Membres 2026-2027"-Liste** — genau **590 aktiv**, alles andere (**414**) im **Archiv**. Kein irreführendes „Gesamt 1004" mehr.
- **Stats-Karten:** „Aktive Memberen (gesamt)", „Dovun mit Funktion", „Im Archiv (net méi do)".
- **Archiv-Ansicht** (Button „Archiv (net méi do)") zeigt alle nicht-aktiven (ehemalig + frühere Abbrüche + inaktiv).
- **CSV-Export**, Spalten-Umschaltung (Excel-Rohspalten), Sortierung, Codes-Panel (alt↔neu).

### Médico-Modul (Convocation + Ergebnisse)
- **Convocation-Brief/PDF** pro Spieler, mehrsprachig **LB/FR/DE/EN/PT/IT** (`client/src/lib/convocation.ts`, `shared/convocationText.ts`) — Sprache automatisch aus „Langue/Nationalité".
- **E-Mail-Einladung mit zwei Buttons:** grün „Rendez-vous confirméieren" und rot „Ech kann dësen Termin net" (Absage → neuer Termin nötig).
- **Öffentliche Antwort-Seite** (ohne Login) für Bestätigung *und* Absage, mehrsprachig; Sekretariat wird bei beiden Fällen per E-Mail benachrichtigt.
- **Server** `server/medicoConvocation.ts`: Tabelle `medico_convocations` (Token, `status`, `confirmed_at`, `declined_at`), E-Mail-HTML-Builder, Antwort-Seiten-Builder.
- **Routen:** `GET /medico/confirm/:token?a=confirm|decline`, `GET /api/secretary/medico/convocations` (Statusliste), `POST /api/secretary/medico/result`.
- **Médico-Status** abgeleitet (Gültig / dieses Jahr fällig / überfällig / inapte / pseudo) + **Resultat-Feld** pro Mitglied: `apte`, `apte_temporaire`, `inapte`, `absent`. Das gesetzte Resultat hat **Vorrang** bei der Status-Ableitung (z. B. `apte` → gültig).
- **UI:** Resultat-Filter (mit Zählern) + Inline-Setter (Dropdown) je Zeile; „Muss gehen"-Filter berücksichtigt die Resultate.

### Import & Daten
- `scripts/import_extra_sheets.ts` — Donateurs/Bénévoles/Sponsors, Annulés/Ehemalige, Médico 2026.
- `scripts/reclassify-active-2026.cjs` — setzt aktive Mitglieder anhand der „Membres 2026-2027"-Liste (Wahrheit), Rest → Archiv (Donateure/Sponsoren bleiben über `member_type` sichtbar). Dry-Run + `--apply`.
- `scripts/fix_medico_annules.cjs`, `scripts/fill_cat_codes.ts`.

### Schema (`shared/schema.ts`)
- `members.medicoResult`, `members.medicoResultDate`.
- `medico_convocations.status`, `medico_convocations.declined_at` (idempotente ALTER-Migrationen).

---

## Änderungen Juni 2026 (Zusammenfassung)

- **Login erweitert:** Random-No-/Karten-Login (Login per Karten-ID) und Admin-Login (Punkt im Logo, `ADMIN_PASSWORD`).
- **Mitglieder-Import 2025/26:** Excel-Import inkl. Karten-IDs; neue Felder `cardId`, `clubFunction`, `licenseNumber`, `rawData`.
- **Website-Hub:** Verwaltung von mersch75.lu im Manager (Seitenliste, Live-Vorschau, GitHub-Editor).
- **Check-In:** QR-Scan der Mitgliederkarten mit Status (gültig/duplikat/gesperrt/abgelaufen).
- **Willkommensmappe:** Mehrsprachige Wëllkomm-Mapp (LU/DE/FR/EN/PT) für neue Mitglieder als eigene Seite (Vorschau, Öffnen, Drucken/PDF, GitHub-Editor).

> Details siehe Abschnitte 1, 7, 14, 15 und 16.

---

## Status-Legende

- ✅ **Verfügbar** — voll ausgebautes Modul, im Einsatz nutzbar.
- 🟡 **Basis** — Modul vorhanden und nutzbar, aber bewusst einfach (einfaches Anlegen/Liste/Löschen); Ausbau folgt.
- 🔄 **In Arbeit** — teilweise umgesetzt.
- 📋 **Geplant** — noch nicht als Oberfläche vorhanden (teils Datenmodell bereits vorbereitet).

---

## Module auf einen Blick

Alle folgenden Module sind in der App aufrufbar (Menü/Route). Die Detailabschnitte weiter unten beschreiben den **Zielumfang**; die Symbole hier zeigen den **aktuellen Ausbaugrad**.

**Mitglieder & Teams**
- ✅ Dashboard — Übersicht & Schnellzugriffe
- ✅ Mitglieder (+ Mitglieder-Detail)
- ✅ Mitglieder-Import (Excel 2025/26) · *neu*
- ✅ Teams
- ✅ Profil (eigene Daten, Passwort)

**Spielbetrieb & Statistik**
- ✅ Spiele (Matches) inkl. FLH-Import
- ✅ Statistiken
- ✅ Spielerstatistiken / Top-Scorer
- ✅ Aufstellungen / Nominierungen

**Trainings & Anwesenheit**
- ✅ Trainingspläne
- ✅ Anwesenheit
  - ✅ Manuelle Erfassung mit Status (anwesend, entschuldigt, unentschuldigt, krank)
  - ✅ Prouftraining / Probe-Training markieren
  - ✅ Existente Mitglieder schnell als Prouftraining hinzufügen
  - ✅ Vereinfachter Eingabe-Fluss für neue/spontane Spieler (Name, Geburtsdatum, Handy, KV-Karte letzte 5 Ziffern) · *neu*
- ✅ Check-In / Karten-Scan (QR) · *neu*

**Organisation**
- ✅ Kalender & Events
- ✅ Sitzungen (Meetings)
- ✅ Dokumente
- ✅ Anmeldungen (intern) + öffentliches Anmeldeformular
- 🟡 Dienste (Duties)
- 🟡 Hallen / Facilities
- 🟡 Warteliste
- 🟡 DSGVO-Tools

**Finanzen**
- ✅ Finanzen (Konten/Buchungen)
- ✅ Beiträge (Fees)
- ✅ Budget ( saisonale Charges/Produits + Ist-Vergleich in Finanzen)

**Kommunikation**
- ✅ Ankündigungen
- ✅ Chat
- ✅ E-Mail-Einstellungen
- 🟡 Newsletter

**Außendarstellung**
- ✅ Website-Hub (mersch75.lu verwalten) · *neu*
- ✅ Willkommensmappe (mehrsprachige Wëllkomm-Mapp) · *neu*
- 🟡 Galerie
- 🟡 Sponsoren
- ✅ Shop (externer Fan-Shop-Link + interne Produkt-/Bestandsliste)

> Mehrsprachigkeit (DE/FR/LU/EN/PT) ist über `i18n` bereits aktiv und wird modulweise ergänzt (🔄).

---

## 1. Authentifizierung & Login

### 1.1 Passwort-Login
- Email + Passwort Anmeldung
- Rollenbasierte Berechtigungen
- Demo-Zugänge verfügbar

### 1.2 Random-No / Karten-Login (Neu — Juni 2026)
Login ohne Passwort über die **Random-No** (Karten-ID, z. B. `LNS6S2DM`) aus der Mitgliederliste.

- `POST /api/auth/identify-card` — zeigt nur **Name + Vereinsfunktion** zur Bestätigung (kein Login).
- `POST /api/auth/card-login` — meldet an: findet/legt den verknüpften User an und startet die Session.
- **Funktion → App-Rolle** (Test-Mapping):
  - `Comité` → präsident · `Officiel` → secrétaire · `Entraîneur` → trainer · `Arbitre`/`Spieler`/`Mitglied` → spieler · `Admin` → admin
- **Sicherheitshinweis:** Erhöhte Rollen (Comité/Officiel/Trainer) sollten in Produktion eine 2. Stufe (Passwort/Code) erfordern.

### 1.3 Admin-Login (Neu — Juni 2026)
- Versteckter Einstieg über den **Punkt im Logo**.
- Passwort-geschützt über Umgebungsvariable `ADMIN_PASSWORD` (Default `mersch75`).
- `POST /api/auth/admin-login` → legt bei Bedarf `admin@mersch75.lu` an und startet die Session.

### 1.4 Magic Link (Passwordless Login)
**Neu implementiert!**

#### Per Email
- User gibt Email ein
- Magic Link wird per Email gesendet
- 24h gültig, einmalig verwendbar
- Klick auf Link = automatisch eingeloggt

#### Per SMS (mit Länderkennung)
- Ländercode wählbar: 🇱🇺 +352, 🇩🇪 +49, 🇫🇷 +33, 🇧🇪 +32
- Telefonnummer eingeben
- Magic Link per SMS (Gateway Integration vorbereitet)
- Gleiche Sicherheitsfeatures wie Email

**API Endpunkte:**
- `POST /api/auth/magic-link` - Magic Link erstellen
- `GET /api/auth/verify-magic-link?token=xxx` - Link validieren & einloggen

---

## 2. Spiel- & Ligastatistiken

### 2.1 Matches (Spiele)
- CRUD für Spiele
- Felder: Datum, Teams, Score, Status, Wettbewerb, Saison
- Automatische Tabellenberechnung bei Spielende

### 2.2 Match Goals (Tore)
- Torschützen pro Spiel erfassen
- Felder: Spieler, Tore, Vorlagen, 7-Meter, Feldtore
- Automatische Statistik-Aggregation

### 2.3 Match Penalties (Strafen)
- 2-Minuten-Strafen erfassen
- Spieler-Disziplin-Tracking

### 2.4 Standings (Ligatabellen)
- Automatische Berechnung aus Spielen
- Punkte: 2 für Sieg, 1 für Unentschieden, 0 für Niederlage
- Tordifferenz, Siege, Niederlagen
- Filter nach Wettbewerb & Saison

---

## 3. FLH Import (handball4all.de)

### 3.1 Einzelimport
- URL von handball4all.de SBO-Seite eingeben
- Automatisches Scraping der Spieldaten
- Importiert: Teams, Score, Spielerstatistiken

**Beispiel URL:**
```
https://spo.handball4all.de/misc/sboPublicReports.php?sGID=3424376
```

### 3.2 Batch Import
- Mehrere URLs gleichzeitig importieren
- Status-Tracking (erfolgreich/fehlgeschlagen)
- Fortschrittsanzeige

### 3.3 Automatische Spielerzuordnung
- FLH-Spielernamen werden mit Mersch75-Mitgliedern verknüpft
- Fuzzy-Matching für ähnliche Namen

---

## 4. Spielerstatistiken

### 4.1 Individuelle Statistiken
- Tore (gesamt, Feldtore, 7-Meter)
- Vorlagen
- Strafen (2-Minuten)
- Spiele gespielt
- Filter nach Saison & Wettbewerb

### 4.2 Top Scorer
- Rangliste der besten Torschützen
- Filter nach Wettbewerb
- Limit einstellbar (Top 10, 20, etc.)

### 4.3 Frontend-Ansicht
- Übersichtliche Darstellung in Karten
- Tabs für verschiedene Statistik-Typen
- Download-Optionen

---

## 5. SBO Links Batch Import

### 5.1 86 FLH-Links automatisch importieren
- Datei: "Links zu SBO .txt"
- Automatisches Auslesen aller Spielbericht-URLs
- Importiert alle 86 SBO-Berichte

### 5.2 Fortschritts-Tracking
- Live-Status während Import
- Erfolgreich / Fehlgeschlagen / Übersprungen
- Fehlerprotokoll

---

## 6. Benutzer & Rollen

### 6.1 Rollen-System
- **Präsident** - Vollzugriff
- **Admin** - Systemverwaltung
- **Trainer** - Team-Management, Spiele
- **Secrétaire** - Dokumente, Anmeldungen
- **Kassenwart** - Finanzen
- **Spieler** - Eigene Daten, Statistiken

### 6.2 User-Profile
- Name, Email, Telefonnummer
- Profilbild
- Land (für Telefon: +352 default)
- Aktiv/Inaktiv Status

---

## 7. Teams & Mitglieder

### 7.1 Teams verwalten
- CRUD für Teams (Seniors, Damen, etc.)
- Team-Details, Logos

### 7.2 Mitglieder
- Mitgliederverwaltung pro Team
- Kontaktdaten
- Rollen innerhalb des Teams

### 7.3 Mitglieder-Import 2025/26 (Neu — Juni 2026)
Einmal-Import der offiziellen Mitgliederliste (Excel) inkl. Karten-IDs in `data.db`.

- Skript: `scripts/import_members_2025_2026.ts`
- Aufruf: `npx tsx scripts/import_members_2025_2026.ts "/Pfad/zur/MEMBERSLESCHT.xlsx"`
- **Idempotent:** Abgleich über `card_id` (Random-No) — vorhandene Einträge werden aktualisiert, neue angelegt; Demo-Mitglieder ohne `card_id` bleiben unangetastet.
- Robust: erkennt Spalten automatisch, bereinigt Platzhalter (`///`, `NA`), parst Geburtsdaten (DD.MM.YYYY & Excel-Serial).

### 7.4 Erweiterte Mitglieder-Felder (Neu — Juni 2026)
- `licenseNumber` — FLH-Lizenznummer
- `cardId` — Random-No / Karten-ID (z. B. `LNS6S2DM`)
- `clubFunction` — Vereinsfunktion (Mitglied, Spieler, Comité, Officiel, Entraîneur …)
- `rawData` — JSON aller Originalspalten der Excel (Audit/Nachvollziehbarkeit)

---

## 8. Kalender & Events

### 8.1 Events
- Spiele, Training, Events
- Wiederkehrende Termine
- Google Calendar Integration (vorbereitet)

### 8.2 ICS Export
- Kalender-Export für externe Apps
- Abonnement-Links

---

## 9. Finanzen (Kassenwart)

### 9.1 Beitragsmanagement
- Mitgliedsbeiträge erfassen
- Zahlungsstatus tracking
- Mahnungen

### 9.2 Ausgaben
- Vereinsausgaben dokumentieren
- Kategorien
- Beleg-Upload

### 9.3 Berichte
- Einnahmen/Ausgaben Übersicht
- PDF-Export

---

## 10. Dokumente (Secrétaire)

### 10.1 Dokumentenmanagement
- Upload von PDFs, Bildern
- Kategorisierung
- Versionierung

### 10.2 Formulare
- Anmeldeformulare
- Freigabeerklärungen
- Online-Ausfüllen

---

## 11. Kommunikation

### 11.1 WhatsApp Integration
- WhatsApp-Gruppen-Links
- Team-Kommunikation

### 11.2 Email
- Email-Versand an Teams/Mitglieder
- Templates
- Verteilerlisten

---

## 12. Poster Generator (Integration geplant)

### 12.1 Features
- Spielplakat-Generator
- Social Media Posts
- PDF-Export
- Anpassbare Templates

---

## 13. Live Center (Integration geplant)

### 13.1 Live-Ergebnisse
- Anzeige aktueller Spiele
- Handball4all.de Integration
- Automatische Updates

### 13.2 Website-Archiv Saison 25/26 (erledigt — Juni 2026)
- Saison **2025/2026** des Website-Live-Centers als eigene Archiv-Seite gesichert: **live-center-25-26.html** (alle Spiele/Tabs voll funktionsfähig erhalten).
- Verlinkt von **statistics-25-26.html** (Button "Spillplang 25/26 (Archiv)").
- **live-center.html** auf reine Struktur zurückgesetzt (Daten-Arrays geleert) → bereit für **Saison 2026/2027**; der Live-FLH-Sync füllt den neuen Kalender automatisch.

---

## 14. Website-Verwaltung (Hub) (Neu — Juni 2026)

Verwaltung der öffentlichen Website **mersch75.lu** direkt aus dem Manager (`client/src/pages/Website.tsx`).

- **Seitenliste** aller Website-Seiten (Startseite, News, Live-Center, Intern, Galerie …).
- **Live-Vorschau** der ausgewählten Seite per iframe (mit Neu-laden-Button).
- **„Diese Seite bearbeiten"** → öffnet den **GitHub-Editor** (`/edit/main/<datei>`); nach Commit veröffentlicht GitHub Pages automatisch.
- Schnellzugriffe: Website öffnen, GitHub-Repo, Poster-Generator.
- Repo: `Netjogger58/mersch75test.github.io` · Branch `main`.

> Hinweis: Die Website (`mersch75.lu`) und die Manager-App (`Vereins-OS`) sind **zwei getrennte GitHub-Repos** und werden jeweils einzeln gepflegt/deployt.

---

## 15. Check-In / Mitgliederkarten (Neu — Juni 2026)

Einlass-/Anwesenheits-Check per **QR-Code-Scan** der Mitgliederkarten (`client/src/pages/CheckIn.tsx`, Lib `jsQR`).

- **Kamera-Scan** oder manuelle Eingabe der Kartennummer.
- Status-Rückmeldung: **Gültig · Bereits da (Duplikat) · Unbekannt · Gesperrt · Abgelaufen · Ungültig**.
- Karten-Daten: `cardNumber`, `qrCodeData`, `validFrom`/`validUntil`, `active`, verknüpfter User.
- Auswahl pro **Event** möglich; Export der Check-in-Liste.

---

## 16. Willkommensmappe (Neu — Juni 2026)

Mehrsprachige **Wëllkomm-Mapp** für neue Mitglieder, direkt im Manager (`client/src/pages/WelcomeMappe.tsx`, Route `/welcome-mappe`, Menü unter *Verein*).

- **Live-Vorschau** des Dossiers per iframe (mit Neu-laden-Button).
- **Sprachen:** Lëtzebuergesch · Deutsch · Français · English · Português (Umschaltung direkt im Dokument).
- **Inhaltsübersicht** der 9 Kapitel (Präsidentenbrief, erste Schritte, Kontakte, Werte S.T.A.A.R.K., Rolle im Team, Digital & Online, Mitgliedschaft, Engagement, Highlights/FAQ).
- Aktionen: **Mappe öffnen · Drucken/PDF** (Browser-Druck → Als PDF speichern) **· Bearbeiten** (GitHub-Editor) **· GitHub-Repo**.
- Quelle: `wellkomm-mapp.html` im Repo `Netjogger58/mersch75test.github.io` (live unter `mersch75.lu/wellkomm-mapp.html`); ebenfalls im Website-Hub gelistet.

> Hinweis: Die Mappe wird aus dem getrennten Website-Repo eingebettet – Inhaltsänderungen erfolgen dort und sind nach dem GitHub-Pages-Deploy automatisch in der App sichtbar.

---

## 17. Spielwochen-Recap / News-Texte (geplant — ab Saison 2026/2027)

Wöchentliche **Text-Zusammenfassung der Spielwoche** für alle Mannschaften von Mersch75 — ein paar Sätze, die alle Spiele unserer Teams dokumentieren (Resultate, Höhepunkte, nächste Gegner).

- **Ort (Website):** als Beitrag auf der **News-Seite** (news.html, Repo mersch75test.github.io).
- **App-Unterstützung:** Der Manager soll diese Recaps **erfassen/verwalten** (Eingabemaske je Spielwoche) und optional **automatisch vorbefüllen** (aus FLH-Resultaten + nächsten Spielen); Redaktion/Freigabe durch das Komitee.
- **Mehrsprachig** (LB/DE/FR/EN/PT) analog zur restlichen Website.
- **Gilt ab Saison 2026/2027** und läuft dann **jede Spielwoche**.
- Mögliche KI-Stütze: Entwurfstext aus Ergebnis-Daten generieren (Ollama/Odysseus-Konzept), Mensch finalisiert.

---

## Technische Details

### Backend
- **Framework:** Node.js + Express
- **Sprache:** TypeScript
- **ORM:** Drizzle ORM
- **Datenbank:** SQLite (`data.db`, better-sqlite3)
- **Auth:** Session-based (Cookie + Bearer-Token) · Passwort · Random-No/Karten-Login · Admin-Login · Magic Links
- **Import/Scan:** xlsx (Mitglieder-Import) · jsQR (Karten-Scan)

### Frontend
- **Framework:** React
- **Sprache:** TypeScript
- **Styling:** TailwindCSS
- **State:** React Query
- **UI Components:** shadcn/ui

### API Endpunkte (Auswahl)

```
# Auth
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/identify-card     # Random-No: Name+Funktion anzeigen
POST   /api/auth/card-login        # Random-No: einloggen
POST   /api/auth/admin-login       # Admin (Punkt im Logo)
PATCH  /api/auth/password
PATCH  /api/auth/profile
POST   /api/auth/magic-link
GET    /api/auth/verify-magic-link

# Matches
GET    /api/matches
POST   /api/matches
PUT    /api/matches/:id
DELETE /api/matches/:id
POST   /api/matches/import-flh
POST   /api/matches/batch-import-flh

# Statistics
GET    /api/player-statistics?playerId=1&season=2025/26
GET    /api/top-scorers?competition=League&limit=20

# Standings
GET    /api/standings?competition=League&season=2025/26
```

---

## Geplant & in Arbeit

### 🔄 In Arbeit
- **Mehrsprachigkeit (DE/FR/LU/EN/PT)** — `i18n` aktiv, wird modulweise vervollständigt.
- **Ausbau der 🟡-Basis-Module** (Budget, Galerie, Sponsoren, Shop, Dienste, Hallen, Warteliste, Newsletter, DSGVO-Tools).

### 📋 Geplant — Integrationen
- **Poster-Generator** (Spielplakate/Social-Media) — Anbindung an das Website-Tool.
- **Live-Center** (Live-Ergebnisse via handball4all.de).
- **SMS-Gateway (Mixvoip)** für Magic-Link per SMS — wartet auf Zugangsdaten.
- **Mobile App / PWA**.
- **Spielwochen-Recap (News)** — wöchentliche Text-Zusammenfassung aller Mannschafts-Spiele auf news.html; App erfasst/verwaltet die Texte (ab Saison 2026/2027). Siehe §17.

### � Geplant — Datenmodell vorbereitet, Oberfläche folgt
Folgende Bereiche sind in der Datenbank bereits angelegt, haben aber noch **keine eigene Oberfläche**:
- **Archiv** (Saisons, Teams, Spiele, Events, Exporte)
- **Schiedsrichter-Einsätze** (Referees / Assignments)
- **Material & Inventar** (Inventory / Loans)
- **Verletzungen & Reha**
- **Abstimmungen / Umfragen** (Polls)
- **Gegner-Scouting & Spielberichte** (Opponents / Match-Reports)
- **Fahrgemeinschaften** (Carpools)
- **Fan-Content & Live-Ticker**
- **Externe Kalender-Synchronisation** (SEPA-Mandate sind in Finanzen/Beiträgen bereits angelegt)

### ✅ Bereits erledigt (Auswahl)
Magic-Link-Login · Random-No-/Admin-Login · FLH-Import · Spieler-/Ligastatistiken · Mitglieder-Import 2025/26 · Website-Hub · Check-In/Karten-Scan · Willkommensmappe · **Saison-Archiv 25/26** (Website-Live-Center archiviert, neue Saison vorbereitet).

---

## Zugänge & Login-Wege

Es gibt **drei** Wege, sich anzumelden (siehe Abschnitt 1):

**1. Admin-Login (Punkt im Logo)**
- Passwort über Umgebungsvariable `ADMIN_PASSWORD` (Default `mersch75`).
- Legt bei Bedarf `admin@mersch75.lu` an und meldet als Rolle *admin* an.

**2. Random-No / Karten-Login**
- Login per Karten-ID (Random-No) aus der Mitgliederliste — kein Passwort nötig.

**3. Passwort-Login (E-Mail + Passwort) — Demo-Zugänge:**
- Präsident: praesident@mersch75.lu / demo123
- Trainer: trainer@mersch75.lu / demo123
- Spieler: spieler@mersch75.lu / demo123
- Admin (Passwort-Konto): admin@mersch75.lu / demo1234

> Hinweis: Das Admin-**Passwort-Konto** (`demo1234`) ist getrennt vom **Admin-Login über `ADMIN_PASSWORD`** (Punkt im Logo). Demo-Passwörter vor dem Produktivbetrieb ändern.

---

*Dokumentation erstellt: Mai 2026 · Aktualisiert: Juni 2026 (Random-No-/Admin-Login, Website-Hub, Mitglieder-Import 2025/26, Check-In, Willkommensmappe)*

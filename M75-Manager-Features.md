# M75 Manager - Funktionsübersicht

## Stand: Juni 2026

---

## Änderungen Juni 2026 (Zusammenfassung)

- **Login erweitert:** Random-No-/Karten-Login (Login per Karten-ID) und Admin-Login (Punkt im Logo, `ADMIN_PASSWORD`).
- **Mitglieder-Import 2025/26:** Excel-Import inkl. Karten-IDs; neue Felder `cardId`, `clubFunction`, `licenseNumber`, `rawData`.
- **Website-Hub:** Verwaltung von mersch75.lu im Manager (Seitenliste, Live-Vorschau, GitHub-Editor).
- **Check-In:** QR-Scan der Mitgliederkarten mit Status (gültig/duplikat/gesperrt/abgelaufen).

> Details siehe Abschnitte 1, 7, 14 und 15.

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

## Zukünftige Features (Roadmap)

1. ✅ Magic Link Authentication
2. ✅ FLH Import
3. ✅ Spielerstatistiken
4. 🔄 SMS Gateway (Mixvoip) - wartet auf Zugangsdaten
5. 🔄 Poster Generator Integration
6. 🔄 Live Center Integration
7. 🔄 Mobile App (PWA)
8. 🔄 Mehrsprachigkeit (DE/FR/LU)

---

## Support & Kontakt

**Admin Login:** admin@mersch75.lu / demo1234

**Demo-Zugänge:**
- Präsident: praesident@mersch75.lu / demo123
- Trainer: trainer@mersch75.lu / demo123
- Spieler: spieler@mersch75.lu / demo123

---

*Dokumentation erstellt: Mai 2026 · Aktualisiert: Juni 2026 (Random-No-/Admin-Login, Website-Hub, Mitglieder-Import 2025/26, Check-In)*

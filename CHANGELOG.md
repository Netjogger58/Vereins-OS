# Changelog — M75-Manager (Vereins-OS)

Neueste Änderungen zuerst.

## 2026-07-15 (später)

- **Vereins-OS-App – Inventar-Modul.**
  - Neue Seite `/inventory` mit Inventarliste, Suche und Verwaltung.
  - Gegenstände anlegen/bearbeiten/löschen mit Name, Kategorie, Lagerort, Zustand, Menge und QR-Code.
  - Ausleihen an Benutzer mit Mengenangabe und Rückgabedatum.
  - Automatische Berechnung der verfügbaren Menge anhand offener Ausleihen.
  - API-Endpunkte unter `/api/inventory` und Ausleihen unter `/api/inventory/loans`.

- **Vereins-OS-App – Mitgliederselbstbedienung "Meine Termine".**
  - Neue Seite `/my-events` und mobiler Tab "Termine".
  - Jedes Mitglied sieht seine eigenen anstehenden Mannschafts-Termine und kann Verfügbarkeit setzen.
  - Nominierungen für Spiele können direkt mit "Ja"/"Nein" + Begründung beantwortet werden.
  - Neuer API-Endpunkt `GET /api/members/me` liefert das zum Benutzer gehörige Mitgliedsprofil.

- **Vereins-OS-App – Mobile-Ansicht / PWA gestartet.**
  - Service Worker `sw.js` wird jetzt im Frontend registriert.
  - Installations-Banner für Android/Chrome und Hinweis für iOS „Zum Home-Bildschirm".
  - App ist damit ohne App Store als installierbare Web-App nutzbar.

- **Vereins-OS-App – Secrets härten.**
  - `ADMIN_PASSWORD` muss in Produktion gesetzt sein, lokal weiterhin Fallback auf `mersch75`.
  - Demo-Seed-Passwörter jetzt via `SEED_USER_PASSWORD` konfigurierbar (Default lokal: `demo123`).
  - In Produktion wird der Demo-Seed übersprungen, wenn `SEED_USER_PASSWORD` fehlt.
  - `.env` ist bereits in `.gitignore`, `.env.example` aktualisiert.

- **Vereins-OS-App (intern live) – DB-Anschluss abstrahiert.**
  - `server/storage.ts` initialisiert jetzt SQLite **oder** PostgreSQL je nach `DATABASE_URL`.
  - SQLite bleibt Default (`data.db`), PostgreSQL kann via Umgebungsvariable aktiviert werden.
  - `init()` und `runMigrations()` laufen jetzt zentral innerhalb von `initDatabase()`.
  - `.env.example` hinzugefügt.

- **Vereins-OS-App – Erste Tests mit Vitest.**
  - Test-Runner `vitest` und `supertest` als Dev-Dependencies.
  - Unit-Tests für `server/archiveImport.ts`: Parser für Teamnamen, Bilanz, Endrang, Spiele und Torschützen.
  - Beim Parser wurden zwei kleine Bugs gefixt: `parseSummary` erfasst jetzt den gesamten `sum-bar`, `parseMatchRows` trennt Heim-/Auswärts-Tore korrekt.

## 2026-07-15

- **Vereins-OS-App (intern live) – Nominatiounen, Aufsteiger-Teams & Prouftraining.**
  - **Nominatiounen / Teams / Anwesenheet:** Memberer ginn iwwerall no deem selwechte System sortéiert: Médico-Problemer no ënnen, Alter (Jugend alt→jung, Senioren jung→alt), alphabetesch als Fallback.
  - **Aufsteiger-Teams (extraTeamIds):** Jugend-Spiller kënnen elo zu méi héije Kategorien agesat ginn (z.B. U7→U9, U9→U11, U11→U13, U13→U15). Checkboxen an den Team-Détail-Lëschten an am Member-Detail.
  - **Nominatioun-Boost:** Memberer, déi fir e kommende Match schonn nominéiert sinn, ruckelen an Teams/Anwesenheet automatesch no uewen.
  - **Prouftraining (isTrial):** An der Anwesenheet kann een manuell Spiller dobäisetzen an als Prouftraining markéieren. Trial-Trainings zielen als present, kënne awer duerch e Haken spéider op normal gesat ginn.
  - **Nei Backend-Endpunkten:** `GET /api/nominations/team/:teamId`, `POST /api/attendance/bulk`. Nei Datenbankspalten: `members.extra_team_ids` a `attendance.is_trial`.

- **Vereins-OS-App (intern live) – Vereinfachten Prouftraining-Input.**
  - D'Dropdown-Lëscht an der Anwesenheet gouf duerch een eenheetlecht Formular ersat: Virnum, Numm, Gebuertsdatum, Handynummer (optional), lescht 5 Zifferen vun der KV-Kaart (optional).
  - Bekannt Memberer ginn per Matching fonnt a kënnen direkt als Prouftraining agesat ginn (och fir all Aufsteiger-Kombinatiounen: U7↔U9, U13↔U15, Jugend↔Senioren, Fraen↔Männer).
  - Onbekannt Memberer: den Trainer kann se entweder als **neie Member mat Status `pending`** uleeën oder nëmmen als **temporären Training-Gast** fir deen Dag erfassen.
  - Bei der Nei-Member-Erfassung gëtt d'Handynummer obligatoresch erfrot (vum Spiller oder engem Elternteil), mat engem Flag ob d'Nummer zum Spiller oder zum Elter gehéiert.
  - Zil: Trainer sinn net méi ofhängeg vun der KI, fir nei oder spontan Spiller an en Training anzesetzen.

- **Vereins-OS-App (intern live) – Warteliste ausgebaut.**
  - Nei Felder an `waitlist_entries`: Gebuertsdatum, Telefon, E-Mail, gewënschten Team, Positioun, Notiz.
  - Status-Workflow: `wartend` → `zum Probetraining agelueden` → `aufgenommen` / `ofgelehnt`.
  - "Als Member iwwerhuelen" leet en `pending`-Member mat Team/Telefon un.

- **Vereins-OS-App (intern live) – DSGVO-Tools.**
  - Consent-Übersiicht mat den Zoustëmmungen: Datenveraarbechtung, Fotoen/Videoen, Newsletter.
  - Admin/Sekretariat kann Zoustëmmungen pro Member erfassen an änneren.
  - Datenauszug pro Member (JSON) fir Admin a Selbstbedienung.
  - Löschantrags-Workflow: Member stellt Antrag, Sekretariat kann bestätegen oder oflehnen mat Begrënnung.
  - Nei Tabelle `gdpr_deletion_requests`.

- **Vereins-OS-App (intern live) – Saison-Archiv Import aus der Website.**
  - Nei Admin-Route `POST /api/admin/archive/import-website` parst d'Statistik-HTML-Fichieren (`Statistics Men/Women/U15/U13/U11.html`).
  - Archivéiert Saison, Team-Bilanz, Spiller, Matcher an Torschëtzen an den `archive_*`-Tabellen.
  - Daten sinn elo fest an der App-Datenbank an onofhängeg vun der FLH.

- **Code-Qualitéit – Modulariséierung gestart.**
  - `server/routes/gdpr.routes.ts`, `server/routes/archive.routes.ts`, `server/routes/waitlist.routes.ts` ausgeleet.
  - `server/services/gdpr.service.ts` a `server/services/waitlist.service.ts` ausgeleet.
  - `server/routes.ts` an `server/storage.ts` bleiwen d'Haapt-Facade a delegéieren un d' nei Module.

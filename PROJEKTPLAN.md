# VEREINS-OS — PROJEKTPLAN
> **Zuletzt aktualisiert:** 14. Juli 2026  
> **Status:** In aktiver Entwicklung — Pilot: Handball Mersch 75  
> **Vision:** Eine lebendige, weitgehend automatisierte Vereinsplattform — minimal manuelle Arbeit, maximal open source & kostenlos

---

## LETZTE ÄNDERUNGEN (13.–14. Juli 2026) ✅

- **Finanzen — echte Vereinsdaten**: Demo entfernt, **7 reale Konten** (Salden 2025-26), Buchungen 2024-25 & 2025-26 importiert. Neue Felder `transactions.category/season`, Tabelle `budgets`, `FINANCE_CATEGORIES`; Kategorie-Auswahl + Saison-Filter in `Finance.tsx`.
- **Budget & Prognosen 2026-27** (`Budget.tsx`): Charges/Produits je Kategorie + geplantes Resultat; API `/api/season-budgets` (GET/POST/DELETE).
- **Finanz-Zugriff** nur **Präsident/Trésorier/Admin**: Seiten `/finance`, `/budget`, `/fees` + zugehörige APIs rollenbeschränkt.
- **Mitgliederliste 2026-27** aus `M75_membres_2026_2027_Codes_alt_neu_130726.xlsx` aktualisiert (neue CAT-Codes; Abmeldungen → Archiv): **555 aktiv**, **457 Archiv**.
- **„1012" entfernt**: Ex-Mitglieder zählen nie mit. `isActiveClubMember` robust (camel+snake_case), Sekretariat zeigt „555 von 555", PDF-Export filtert aktiv.
- Details siehe `M75-Manager-Features.md` → „Änderungen 13.–14. Juli 2026".

---

## FRÜHERE ÄNDERUNGEN (5.–6. Juli 2026) ✅

- **Sekretariat-Mitgliederverwaltung** (`Secretariat.tsx`): Roster mit Filtern/Stats/CSV. Aktive Mitglieder = „Membres 2026-2027"-Liste → **590 aktiv**, Rest **414 im Archiv** (kein „Gesamt 1004" mehr).
- **Médico-Convocation**: mehrsprachiger Brief/PDF + E-Mail mit **Bestätigen/Absagen**, öffentliche Antwort-Seite, Sekretariats-Benachrichtigung (`medicoConvocation.ts`, Routen `/medico/confirm/:token`, `/api/secretary/medico/*`).
- **Médico-Resultat** pro Mitglied (`apte`/`apte_temporaire`/`inapte`/`absent`) mit Vorrang bei der Status-Ableitung; Resultat-Filter + Inline-Setter.
- **Schema**: `members.medico_result(+date)`, `medico_convocations.status/declined_at` (idempotente Migrationen).
- **Skripte**: `import_extra_sheets.ts`, `reclassify-active-2026.cjs` (Liste = Wahrheit für aktiv/Archiv).
- Details siehe `M75-Manager-Features.md` → „Änderungen Juli 2026".

---

## 1. PROJEKTÜBERSICHT

| | |
|---|---|
| **Name** | Vereins-OS |
| **Repository** | github.com/Netjogger58/Vereins-OS (privat) |
| **Lizenz** | Privat (kommerzieller Verkauf geplant) |
| **Ziel** | Vollautomatisiertes Vereinsmanagement für Sportvereine |
| **Pilot** | Handball Mersch 75 (mersch75.lu) |
| **Hosting** | Hetzner Cloud |
| **Philosophie** | Open Source first · Kostenlos wo möglich · Automatisierung vor Manualarbeit |

---

## 2. TECHNOLOGIE-STACK (AKTUELL IMPLEMENTIERT)

| Schicht | Technologie |
|---|---|
| **Backend** | Node.js + Express + TypeScript |
| **Frontend** | React + TypeScript + TailwindCSS + shadcn/ui |
| **Datenbank** | SQLite (`data.db`) via Drizzle ORM |
| **Auth** | Session-based + Magic Links (Email & SMS) |
| **State Management** | React Query |
| **Deployment** | Docker + docker-compose |
| **Server** | Hetzner Cloud |

---

## 3. IMPLEMENTIERTE FEATURES (STAND JUNI 2026)

### ✅ 3.1 Authentifizierung & Benutzerverwaltung
- Email + Passwort Login, Magic Link (passwordless) per Email & SMS
- Rollenbasiert: Präsident, Admin, Trainer, Secrétaire, Kassenwart, Spieler

### ✅ 3.2 Spiel- & Ligastatistiken
- Spiele, Torschützen, Strafen, automatische Ligatabellen

### ✅ 3.3 FLH Import (handball4all.de)
- Einzel- & Batch-Import (86 SBO-Berichte), Fuzzy-Matching

### ✅ 3.4 Spielerstatistiken
- Individuelle Stats, Top-Scorer, Filter nach Saison & Wettbewerb

### ✅ 3.5 Teams & Mitglieder
### ✅ 3.6 Kalender & Events (ICS-Export)
### ✅ 3.7 Finanzen (Beiträge, Ausgaben, PDF-Berichte)
### ✅ 3.8 Dokumente (Upload, Kategorien, Formulare)
### ✅ 3.9 Kommunikation (Email-Templates, WhatsApp)

---

## 4. IN ENTWICKLUNG / VORBEREITET

| Feature | Status |
|---|---|
| SMS Gateway (Mixvoip) | 🔄 wartet auf Zugangsdaten |
| Poster Generator | 🔄 Code-Grundstruktur vorhanden |
| Live Center (handball4all) | 🔄 Code-Grundstruktur vorhanden |
| Mobile App (PWA) | 🔄 geplant |
| Mehrsprachigkeit (DE/FR/LU) | 🔄 geplant |

---

## 5. GEPLANTE NEUE MODULE

---

### 🌐 5.1 Website-Integration (mersch75.lu ↔ Vereins-OS)

**Ziel:** Die öffentliche Website zeigt automatisch aktuelle Daten aus der App — kein manuelles Pflegen mehr.

| Was | Wie |
|---|---|
| Ligatabelle auf Website | REST-API → JavaScript Widget auf mersch75.lu |
| Nächste Spiele | API-Endpoint → automatisch auf Homepage |
| Torschützenliste | Live-Daten via JSON-Feed |
| News / Spielberichte | Auto-Post aus App → Website |
| Spielerprofile | Optionale öffentliche Profile |
| Hallenkarte Marker | Hallen-Daten aus DB → Karte automatisch aktuell |
| Spenden-Widget | Öffentliche Kampagnenseite + Spendenformular → `/api/donations` |
| Sponsoren-Liste | Öffentliche Partner-Übersicht aus Vereins-OS |
| Fan-Umfragen | Öffentliche Umfragen (nur Ergebnisse oder Teilnahme ohne Login) |
| iCal-Abonnement | Mitglied-Login generiert Token → Button "Termine abonnieren" auf Website |
| Hallen-/Raumreservierung | Öffentliche Ansicht belegter Plätze (optional) |

**Technologie:**
- Vereins-OS Backend stellt öffentliche REST-API bereit
- Website (GitHub Pages / Jekyll) ruft Daten per `fetch()` ab
- CORS korrekt konfiguriert für mersch75.lu

---

### 🗄️ 5.2 Saison-Archiv & Statistik-Export

**Ziel:** Jede abgeschlossene Saison wird archiviert und bleibt dauerhaft abrufbar — mit allen Dokumenten, Links und Medien.

**Funktionen:**
- **Saison abschließen**: Ein-Klick → alle Daten dieser Saison werden eingefroren
- **Archiv-Ordner**: Saison 2023/24, 2024/25, ... — jede separat abrufbar
- **Export-Formate:**
  - 📄 **PDF** — Saisonbericht (Tabelle, Torschützen, Highlights, Fotos)
  - 📊 **Excel (.xlsx)** — Rohdaten für eigene Auswertung (Spiele, Statistiken, Mitglieder)
  - 📦 **ZIP** — komplettes Archiv einer Saison (alle Dateien, PDFs, Bilder)
  - 🔗 **Permalink** — öffentlicher Link zu Saison-Statistik auf der Website

#### 📋 SBO-Schiedsrichterberichte (SBO PDFs)
- Alle Spielberichte (SBO = Spielbericht Online, handball4all.de) **automatisch verlinkt** pro Spiel
- Direktlinks zu den Original-PDFs auf handball4all.de gespeichert
- Im Archiv: jedes Spiel hat seinen SBO-PDF-Link dauerhaft hinterlegt
- Bulk-Download: alle SBO-PDFs einer Saison als ZIP
- Automatischer Import nach jedem Spieltag (Playwright-Automation)

#### 🎥 Video-Links (Spielvideos, Livestreams)
- Pro Spiel: Video-Link hinterlegen (YouTube, Vimeo, FLH-Live, apart TV, ...)
- **FLH-Livestream** (flh-live.lu / apart TV) automatisch verlinken wenn vorhanden
- Privater Upload: Trainingsvideos, Taktikanalysen (via Nextcloud)
- Reel/Highlight-Links für Social Media (Instagram, Facebook)
- Archiv pro Saison: alle Video-Links gesammelt auf einer Seite

#### 📁 Archiv-Struktur pro Saison
```
Saison 2024/25/
├── Statistiken/
│   ├── Ligatabelle.pdf
│   ├── Torschützen.xlsx
│   └── Spielübersicht.xlsx
├── Spielberichte/
│   ├── 2024-09-14_Mersch75_vs_RedBoys.pdf   ← SBO PDF
│   ├── 2024-09-14_Mersch75_vs_RedBoys.url   ← Video-Link
│   └── ... (alle Spiele der Saison)
├── Präsentationen/
│   └── Jahresbericht_2024-25.pptx
├── Dokumente/
│   └── (Verträge, Protokolle dieser Saison)
└── Archiv_Saison_2024-25_KOMPLETT.zip
```

**Automatisierung:**
- Am Saisonende → automatischer Archiv-Job
- SBO-Links werden laufend nach jedem Spieltag ergänzt
- Email an Präsident & Secrétaire mit Archiv-Link
- Archiv erscheint automatisch auf der Website (öffentlich sichtbar)

---

### 📊 5.3 PowerPoint / PPTX-Generator

**Ziel:** Präsentationen auf Knopfdruck — für Jahresversammlungen, Sponsoren, Trainingsplanung.

**Vorlagen (automatisch befüllt):**
| Vorlage | Inhalt |
|---|---|
| **Jahresbericht** | Saisonstatistiken, Finanzen, Highlights, Ausblick |
| **Spielanalyse** | Tore, Strafen, Gegner-Vergleich, Karte |
| **Sponsorenpräsentation** | Vereinszahlen, Medienpräsenz, Angebote |
| **Trainingsplan** | Wochenprogramm, Ziele, Aufstellungen |
| **Mitgliederversammlung** | Tagesordnung, Berichte, Abstimmungen |

**Technologie:** `pptxgenjs` (kostenlos, open source) — kein Microsoft Office nötig  
**Export:** .pptx (kompatibel mit PowerPoint, LibreOffice, Google Slides)

---

### 📋 5.4 Statuten & Reglemente

**Ziel:** Alle wichtigen Vereins- und Verbandsdokumente zentral abrufbar + KI-gestützte Suche.

#### Vereinsstatuten (Handball Mersch 75)
- PDF hinterlegen, versioniert, für alle Mitglieder lesbar

#### FLH-Reglemente (Fédération Luxembourgeoise de Handball)
> **Quelle:** [flh.lu/f-l-h/statuts-et-reglements](https://www.flh.lu/f-l-h/statuts-et-reglements)

| # | Dokument | PDF |
|---|---|---|
| 1 | Statuts FLH | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/1STATUTS_FLH.pdf) |
| 2 | Code du Handball | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/2CODE_DU_HANDBALL.pdf) |
| 3 | Règlement Championnat Seniors | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/3REGLEMENT_CHAMPIONNAT_SENIORS.pdf) |
| 4 | Règlement Coupe | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/4REGLEMENT_DE_COUPE.pdf) |
| 5 | Affiliations – Transferts – Prêts | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/5AFFILIATIONS_TRANSFERTS_PRETS.pdf) |
| 6 | Instances Judiciaires | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/6INSTANCES_JUDICIAIRES.pdf) |
| 7 | Règlement Récompenses | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/7REGLEMENT_RECOMPENSES.pdf) |
| 8 | Règlement Admission Nouveaux Clubs | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/8REGLEMENT_ADMISSION_NOUVEAUX_CLUBS.pdf) |
| 9 | Demandes en Grâce | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/9DEMANDES_EN_GRACE.pdf) |
| 10 | Règlement Publicités | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/10REGLEMENT_PUBLICITE.pdf) |
| 11 | Règlement Dopage | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/11REGLEMENT_DOPAGE.pdf) |
| 13 | CLAS (Arbitrage) | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/13CLAS.pdf) |

#### KI-Assistent (RAG über PDFs)
- Fragen in Deutsch/Französisch/Luxemburgisch
- Antwort mit Quellenangabe (Seite, Artikel)

---

### 🛡️ 5.5 Versicherungs- & Sportrechts-Modul

#### 🏥 CSMS — Caisse de Secours Médico-Sportive
> [sports.public.lu/csms](https://sports.public.lu/fr/programs/assurances/csms.html)

Staatliche Sportkrankenversicherung — Pflicht für alle lizenzierten Spieler.

| Leistung | Deckung |
|---|---|
| Arzt & Medikamente | Découvert nach CNS |
| Nicht erstattungsfähige Medikamente | 60% |
| Krankenhaus | CNS-Anteil + bis 40€/Tag |
| Physiotherapie | 20% (Rest nach CNS) |
| Krankenwagen | 20% |
| Brillen/Kontaktlinsen | bis 35€, max. 2 Paar/36 Monate |
| Verdienstausfall (Selbständige) | auf Basis Mindestlohn |

**Schadensfall:** Arzt → alle Belege → CNS-Einreichung → CSMS zahlt Restzahlung automatisch.

#### 🏛️ ALIS — Sportintegrität
> [alis.lu](https://www.alis.lu) | info@alis.lu | (+352) 247 83453 | 2 rue Thomas Edison, L-1445 Strassen

Anti-Doping · Safeguarding · Spielmanipulation. Schulungen für Trainer Pflicht bei Minderjährigen.

#### 🏃 INAPS — Institut National des Sports
> [inaps.public.lu](https://inaps.public.lu/fr.html) | Ministerin: Martine Hansen

Pflichtuntersuchungen, Fördergelder, Trainerlizenzen.

#### 🔵 AXA — Vereinsversicherung
> Police ausstehend — wird nach Erhalt ergänzt.

#### 📋 Schadensfall-Workflow
```
Unfall → App-Formular → "Was jetzt tun?" Anleitung
→ CSMS-Weg oder AXA-Weg → Email an Secrétaire
→ Archiv + Status-Tracking → KI beantwortet Folgefragen
```

---

### 🤝 5.6 Ehrenamt & Bénévolat-Modul
> [benevolat.lu](https://benevolat.lu) | 9, Avenue Guillaume L-1651 Lux | (+352) 26 12 10

- Bénévole-Rolle im System, Aufgaben & Stunden erfassen
- Offene Stellen auf benevolat.lu veröffentlichen
- Jubiläen automatisch anzeigen (5/10/20 Jahre)
- Prix du Mérite Nominierung direkt aus App
- **Congé bénévole**: Luxemburger Recht — bezahlter Urlaub für Ehrenamtliche

---

### 💬 5.7 Kommunikations-Zentrale (Chat, Mail, Benachrichtigungen)

**Ziel:** Alle Kanäle an einem Ort — automatisiert und kostenlos.

#### Matrix / Element (Open Source, selbst-gehostet)
- **Matrix Server (Synapse)** auf Hetzner → eigene Instanz, kostenlos
- **Element** als Client (Web + Mobile App)
- Vereins-Räume: #allgemein, #trainer, #seniors-männer, #finanzen, ...
- **Bot** postet automatisch: Spielergebnisse, Termine, Benachrichtigungen
- Integration in Vereins-OS → Nachrichten direkt aus der App senden

#### Email (SMTP — kostenlos)
- **Postfix** auf Hetzner oder **Mailcow** (Docker, open source)
- Automatische Emails: Termine, Beitragsmahnungen, Spielberichte
- Newsletter an alle Mitglieder per Knopfdruck
- Templates in der App (DE/FR/LU)

#### Hermes — Überwachung & Orchestrierung
- **Hermes** als zentraler Messaging-Router / Monitoring-Layer
- Überwacht alle Dienste (Matrix, Email, App, Server)
- Alarmierung wenn etwas ausfällt (Email + Matrix-Nachricht)
- Optionen: selbst entwickelter Hermes-Daemon OR Nutzung von **n8n** (open source Workflow-Automation)

#### WhatsApp / Signal (Brücken)
- Matrix Bridges → **mautrix-whatsapp** oder **mautrix-signal**
- Nachrichten aus Matrix-Räumen erscheinen in WhatsApp-Gruppen (und umgekehrt)
- Keine extra App nötig für Spieler die WhatsApp bevorzugen

---

### 🤖 5.8 KI & Automatisierung

**Ziel:** Maximale Automatisierung — minimale manuelle Arbeit.

#### Ollama (lokale KI — kostenlos, kein Cloud-Abo)
- Läuft auf dem Hetzner-Server
- Modelle: `llama3`, `mistral`, `phi3` (je nach Speicher)
- Aufgaben:
  - Regelwerk-Assistent (RAG über FLH-PDFs)
  - Spielbericht automatisch formulieren aus Statistik
  - Mitglieder-Email auf Knopfdruck generieren
  - Fragen zu Versicherungen, Statuten beantworten

#### n8n — Workflow-Automation (open source, kostenlos selbst-gehostet)
- Visueller Editor für Automatisierungen (wie Zapier, aber kostenlos)
- Beispiel-Workflows:
  - FLH Spielergebnis → automatisch in DB importieren → Matrix-Nachricht
  - Neues Mitglied → Willkommensmail → Beitragsrechnung
  - Saisonende → Archiv erstellen → PDF-Bericht → Email an Vorstand
  - Geburtstag Ehrenamtlicher → automatische Gratulations-Mail

#### Odysseus — Browser-Automation
- Web-Scraping & Browser-Automation (Playwright / Puppeteer)
- Automatisches Abholen von FLH-Spielberichten (handball4all.de)
- Monitoring ob neue FLH-Reglemente veröffentlicht wurden
- Screenshots von Ligatabellen für Social Media

#### Pi.ai / externe KI-Assistenten
- Integration externer KI-Dienste als Fallback wenn Ollama nicht ausreicht
- API-Keys verwaltet in Vereins-OS (verschlüsselt)

---

### 🗃️ 5.9 Vollständige Datenbank-Architektur

**Ziel:** Eine einzige Datenbank, die alles kennt — Spieler, Spiele, Finanzen, Dokumente, Kommunikation.

#### 📧 Email-Adressen — Pflichtfeld für alle Lizenzierten

**Jede Person mit einer Vereins- oder FLH-Lizenz bekommt zwingend eine Email-Adresse in der Datenbank.**

| Personengruppe | Email-Pflicht | Wofür genutzt |
|---|---|---|
| **Spieler (Senioren M/F)** | ✅ Pflicht | Spielpläne, Ergebnisse, Terminänderungen, INAPS-Erinnerungen |
| **Spieler (Jugend)** | ✅ Pflicht (Eltern-Email) | Elterninformation, Trainingszeiten, Safeguarding |
| **Trainer & Betreuer** | ✅ Pflicht | Taktik-Docs, Schulungen, ALIS-Updates |
| **Vorstand** (Präsident, Secrétaire, Kassenwart) | ✅ Pflicht | Protokolle, Finanzen, offizielle Korrespondenz |
| **Schiedsrichter** | ✅ Pflicht | Spielzuteilung, SBO-Links, Erinnerungen |
| **Bénévoles / Ehrenamtliche** | ✅ Pflicht | Einsatzplanung, Jubiläen, Dankesnachrichten |
| **Externe Kontakte** (Sponsoren, Gegnerclubs) | 🟡 Optional | Newsletter, Einladungen |

**Felder pro Person (Mitglieder-Datenbank):**
```
PERSON
├── id, vorname, nachname, geburtsdatum
├── email_privat          ← Haupt-Kontaktadresse (Pflicht)
├── email_alternativ      ← Zweit-Email (optional, z.B. Arbeit)
├── email_eltern          ← Für Minderjährige (Pflicht wenn < 18)
├── telefon_mobil
├── telefon_fix
├── adresse (Straße, PLZ, Ort)
├── nationalitaet, sprache_bevorzugt (DE/FR/LU/EN)
├── rolle[]               ← [Spieler, Trainer, Vorstand, Bénévole, ...]
├── lizenz_flh_nummer     ← FLH-Lizenznummer
├── lizenz_gueltig_bis    ← Ablaufdatum Lizenz
├── csms_versichert       ← boolean
├── inaps_untersuchung    ← Datum letzte Pflichtuntersuchung
├── beitrags_status       ← bezahlt / ausstehend / gemahnt
├── eintrittsdatum
├── austrittsdatum        ← null wenn aktiv
├── notfallkontakt_name
├── notfallkontakt_telefon
└── bemerkungen
```

**Email-Gruppen (automatisch aus Rollen generiert):**
```
alle-lizenzierten@mersch75.lu    → alle mit aktiver FLH-Lizenz
spieler-senioren@mersch75.lu     → alle Senioren M+F
spieler-seniors-m@mersch75.lu    → nur Herren
spieler-seniors-f@mersch75.lu    → nur Damen
jugend@mersch75.lu               → alle Jugendmannschaften
trainer@mersch75.lu              → alle Trainer
vorstand@mersch75.lu             → Präsident + Secrétaire + Kassenwart
benevoles@mersch75.lu            → alle Ehrenamtlichen
alle@mersch75.lu                 → gesamter Verein
```
→ Diese Gruppen werden **automatisch** aus der Datenbank generiert — kein manuelles Pflegen!

#### Datenbankschema (geplant, Erweiterung von SQLite → PostgreSQL für Produktion)

```
PERSONEN
├── Mitglieder (vollständiges Profil inkl. Email, Lizenz, INAPS, CSMS)
├── Kontakte (Externe: Schiedsrichter, Gegnervereine, Sponsoren)
└── Benutzer (Login-Daten, Rollen, Session)

SPORT
├── Teams & Staffeln
├── Saisons (Archiv-fähig)
├── Spiele (Heim/Auswärts, Datum, Gegner, Ergebnis)
├── Spielstatistiken (Tore, Strafen, Assists)
└── Spielerlizenzen (FLH-Nummer, Ablauf, INAPS-Untersuchung, CSMS-Status)

FINANZEN
├── Mitgliedsbeiträge (Fälligkeit, Status, Mahnungen)
├── Einnahmen & Ausgaben (Kategorien)
├── Budgets pro Saison
├── Versicherungsdaten (Police, Laufzeit, Deckung)
└── Subventionen (INAPS, Gemeinde, Sponsors)

KOMMUNIKATION
├── Email-Logs
├── Matrix-Nachrichten (Referenzen)
├── Benachrichtigungen (gesendete Push/SMS/Email)
└── Newsletter-Archiv

DOKUMENTE & ARCHIV
├── Hochgeladene Dateien (Statuten, Police, Formulare)
├── Saison-Archive (eingefroren, versioniert)
├── Generierte PDFs & PPTX (Berichte, Präsentationen)
└── FLH-Dokumente (Cache der 12 Reglements-PDFs)

EHRENAMT
├── Bénévole-Profile
├── Aufgaben & Einsatzstunden
└── Auszeichnungen & Jubiläen

SCHADENFÄLLE
├── Unfallberichte
├── CSMS/AXA-Status
└── Dokumente & Korrespondenz
```

---

### 📱 5.10 Mobile App (PWA → Native)

**Phase 1:** Progressive Web App (PWA) — funktioniert auf jedem Smartphone, kein App Store nötig  
**Phase 2:** React Native App (iOS + Android) — identischer Code, nativer Look  

**Mobile-Funktionen:**
- Spielplan & Ergebnisse (Offline-fähig)
- Push-Benachrichtigungen (Spielstart, Ergebnis, Terminänderungen)
- QR-Code Check-in bei Training
- Verletzungsmeldung direkt nach Spiel
- Chat via Matrix (Element Mobile)

---

### 📡 5.11 Automatisierung & Monitoring

**Ziel:** Der Verein läuft weitgehend von selbst.

#### Automatische Jobs (täglich/wöchentlich):
| Job | Frequenz | Was passiert |
|---|---|---|
| FLH-Spielberichte importieren | Nach jedem Spieltag | Ergebnisse automatisch in DB |
| Ligatabelle aktualisieren | Täglich | Website zeigt aktuelle Tabelle |
| Geburtstags-Grüße | Täglich | Matrix/Email an Mitglied & Team |
| Beitrags-Mahnung | Monatlich | Email bei offenen Beiträgen |
| Backup | Täglich | DB + Dateien auf Hetzner Volumes |
| INAPS-Erinnerung | 30 Tage vorher | Email wenn Pflichtuntersuchung fällig |
| Wöchentlicher Bericht | Montag | Trainer-Zusammenfassung per Matrix |
| Saison-Archiv | Saisonende | Automatisch einfrieren & exportieren |

#### Monitoring (Hermes-Layer):
- Server-Health (CPU, RAM, Disk) → Alarm bei Problem
- App erreichbar? → automatischer Restart wenn nicht
- Backup erfolgreich? → Bestätigung täglich
- Werkzeug: **Uptime Kuma** (open source, Docker, kostenlos)

---

### 🔗 5.12 Integrationen & Schnittstellen

| Dienst | Zweck | Kosten |
|---|---|---|
| **Matrix/Synapse** | Chat-Server selbst-gehostet | Kostenlos |
| **Element** | Chat-Client (Web + Mobile) | Kostenlos |
| **n8n** | Workflow-Automation | Kostenlos (self-hosted) |
| **Ollama** | Lokale KI / LLM | Kostenlos |
| **Nextcloud** | Datei-Ablage, Kalender-Sync | Kostenlos (self-hosted) |
| **Uptime Kuma** | Monitoring Dashboard | Kostenlos |
| **Mailcow** | Email-Server | Kostenlos (self-hosted) |
| **Playwright** | Browser-Automation (Odysseus) | Kostenlos |
| **Mautrix-Bridges** | WhatsApp/Signal ↔ Matrix | Kostenlos |
| **handball4all.de** | FLH Spielberichte Import | Kostenlos (API) |
| **benevolat.lu** | Ehrenamts-Plattform | Kostenlos |
| **GitHub Actions** | CI/CD automatisches Deployment | Kostenlos |

---

## 6. NOCH AUSSTEHEND

| Feature | Priorität |
|---|---|
| Excel-Import (~445 Mitglieder) | 🔴 Hoch |
| Website-API (mersch75.lu ↔ App) | 🔴 Hoch |
| Saison-Archiv + Export | 🟡 Mittel |
| PPTX-Generator | 🟡 Mittel |
| Matrix Server + Bot | 🟡 Mittel |
| Ollama KI-Integration | 🟡 Mittel |
| n8n Workflow-Automation | 🟡 Mittel |
| PWA (Mobile App) | 🟡 Mittel |
| Nextcloud-Anbindung | 🟢 Niedrig |
| PostgreSQL Migration | 🟢 Niedrig |
| Matrix Bridges (WhatsApp) | 🟢 Niedrig |
| Native Mobile App | 🟢 Niedrig |

---

## 7. ROADMAP

### ✅ Phase 1 & 2 — Grundgerüst + Handball-Kern (abgeschlossen)

### 🔄 Phase 3 — Datenmigration
- [ ] Excel-Import (445 Mitglieder), Datenbereinigung
- [ ] Spielerlizenzen & FLH-Nummern vervollständigen

### 🔄 Phase 4 — Website-Integration
- [ ] Öffentliche REST-API (Tabelle, Spielplan, Stats)
- [ ] mersch75.lu Widgets (Tabelle, nächste Spiele)
- [ ] Hallenkarte-Daten aus DB automatisch aktuell

### 🔄 Phase 5 — Archiv & Export
- [ ] Saison-Archiv (einfrieren, abrufen)
- [ ] PDF-Saisonbericht Generator
- [ ] PPTX-Präsentations-Generator (pptxgenjs)
- [ ] Excel-Export aller Statistiken

### 🔄 Phase 6 — Kommunikation & Automation
- [ ] Matrix Server (Synapse) auf Hetzner deployen
- [ ] Matrix Bot (Spielergebnisse, Termine, Nachrichten)
- [ ] n8n installieren & erste Workflows
- [ ] Automatische Beitrags-Mahnungen
- [ ] FLH-Spielberichte automatisch importieren (Playwright)

### 🔄 Phase 7 — KI & Assistenten
- [ ] Ollama auf Hetzner (llama3 / mistral)
- [ ] RAG über FLH-PDFs & Vereinsstatuten
- [ ] Spielbericht-Generator (KI formuliert aus Statistik)
- [ ] Versicherungs- & Regelwerk-Assistent

### 🔄 Phase 8 — Statuten, Versicherungen & Sportrecht
- [x] FLH-Reglemente & Direktlinks (12 PDFs) ✅
- [ ] Vereinsstatuten hochladen (PDF ausstehend)
- [ ] CSMS-Schadensfall-Workflow
- [ ] AXA-Police hinterlegen
- [ ] ALIS Safeguarding-Checklisten
- [ ] INAPS Pflichtuntersuchungs-Tracker

### 🔄 Phase 9 — Ehrenamt
- [ ] Bénévole-Rolle & Aufgaben-Verwaltung
- [ ] Integration benevolat.lu
- [ ] Jubiläen, Prix du Mérite

### 🔄 Phase 10 — Mobile & Monitoring
- [ ] PWA (Progressive Web App) fertigstellen
- [ ] Push-Benachrichtigungen
- [ ] Uptime Kuma Monitoring
- [ ] Automatische Backups (täglich)
- [ ] CI/CD (GitHub Actions → Hetzner)

### 🔄 Phase 11 — Brücken & Erweiterungen
- [ ] WhatsApp ↔ Matrix Bridge (mautrix)
- [ ] Nextcloud (Dateien, Kalender-Sync)
- [ ] PostgreSQL Migration (wenn Skalierung nötig)
- [ ] Native Mobile App (React Native)

### 🏁 Phase 12 — Go-Live & Verkauf
- [ ] Security-Audit, Datenschutz (RGPD)
- [ ] Dokumentation für andere Vereine
- [ ] Lizenzmodell (SaaS für andere Clubs)
- [ ] Domain vereins-os.lu / vereins-os.de

---

## 8. ZIEL-ZUSTAND (WENN FERTIG)

```
Montag früh, 07:00 Uhr — automatisch passiert:
  ✅ FLH-Spielberichte vom Wochenende importiert
  ✅ Ligatabelle auf Website aktualisiert
  ✅ Wochenbericht an Trainer per Matrix gesendet
  ✅ Geburtstagsgüße an Spieler verschickt
  ✅ Backup der Datenbank abgeschlossen
  ✅ INAPS-Erinnerungen für ablaufende Untersuchungen gesendet

Einzige manuelle Aufgabe: Ins Spiel fahren und Tore werfen! 🏐
```

---

## 9. OFFENE INFORMATIONEN (BITTE ERGÄNZEN)

| Was fehlt | Wer liefert es |
|---|---|
| AXA: Police (PDF), Policen-Nr., Deckung, Kosten | Kassenwart / Präsident |
| Vereinsstatuten Mersch75 (PDF) | Secrétaire |
| Hetzner: Server-IP, SSH-Zugang | Netjogger58 |
| Mixvoip: SMS-Gateway Zugangsdaten | Netjogger58 |

---

## 10. EXTERNE LINKS & KONTAKTE

| Organisation | Link | Funktion |
|---|---|---|
| CSMS | [sports.public.lu/csms](https://sports.public.lu/fr/programs/assurances/csms.html) | Sportkrankenversicherung |
| ALIS | [alis.lu](https://www.alis.lu) — info@alis.lu — (+352) 247 83453 | Anti-Doping, Safeguarding |
| INAPS | [inaps.public.lu](https://inaps.public.lu/fr.html) | Sportinstitut |
| FLH Statuts | [flh.lu/f-l-h/statuts-et-reglements](https://www.flh.lu/f-l-h/statuts-et-reglements) | 12 Reglements-PDFs |
| Agence du Bénévolat | [benevolat.lu](https://benevolat.lu) — (+352) 26 12 10 | Ehrenamt Luxembourg |
| AXA | ausstehend | Vereinsversicherung |
| n8n | [n8n.io](https://n8n.io) | Workflow-Automation (open source) |
| Ollama | [ollama.com](https://ollama.com) | Lokale KI (kostenlos) |
| Matrix/Element | [matrix.org](https://matrix.org) | Chat (open source) |
| Nextcloud | [nextcloud.com](https://nextcloud.com) | Dateien & Kalender |
| Uptime Kuma | [uptime.kuma.pet](https://uptime.kuma.pet) | Monitoring |

---

## 11. SICHERHEIT
- OAuth2/JWT + Session-Auth, HTTPS, Rate-Limiting, Audit-Logs, Rollenbasierter Zugriff
- Tägliche verschlüsselte Backups
- Alle Passwörter gehasht (bcrypt)
- RGPD-konform (Datenschutz Luxemburg / EU)

## 12. TEAM

| Rolle | Person |
|---|---|
| Hauptentwickler | Netjogger58 |
| Co-Entwickler / Backup | Sohn (remote) |
| KI-Assistenz | GitHub Copilot |

## 13. OFFENE RECHTSFRAGEN
- [ ] Rechtsanwalt: Verkaufsrechte, KI-Code-Lizenz
- [ ] Contributor Agreement mit Sohn
- [ ] Domain registrieren (vereins-os.lu / vereins-os.de)
- [ ] RGPD-Beauftragter benennen

## 14. DEMO-ZUGÄNGE (nur intern)

| Rolle | Email | Passwort |
|---|---|---|
| Admin | admin@mersch75.lu | demo1234 |
| Präsident | praesident@mersch75.lu | demo123 |
| Trainer | trainer@mersch75.lu | demo123 |
| Spieler | spieler@mersch75.lu | demo123 |

---

*Dieser Plan wird bei jeder Weiterentwicklung automatisch aktualisiert.*  
*Prioritäten werden nach Verfügbarkeit & Bedarf angepasst — alle Punkte sind umsetzbar.*

---

## Nachtrag (01.07.2026): Join → Google-Sheet-Automatisierung (mersch75.lu)

Als Zwischenlösung vor der vollen Vereins-OS-Mitgliederverwaltung werden neue Anmeldungen aus `join.html` (Website-Repo `mersch75test.github.io`) **automatisch in eine Google-Sheet-Mitgliederliste** geschrieben — über ein Google-Apps-Script-Web-App.

- **Random-No** (Spalte C) wird zufällig erzeugt (Alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`) mit serverseitigem Kollisionscheck.
- **Zwei-Spur:** Sekretär-Excel bleibt bestehen; Automatisierung → separater Google-Sheet-Master (zuerst Test-Master „Adrien", dann Sekretär-Master).
- **Test-Modus:** Nachname mit `TEST` → Mails nur an `m75.deisad@gmail.com`, Sheet nur in Adrien-Test-Master.
- **Migrationspfad:** Diese Sheet-Lösung ist der Vorläufer der geplanten Vereins-OS-Mitglieder-API; sobald Vereins-OS die Mitgliederverwaltung übernimmt, kann `join.html` direkt gegen die App-API posten.
- **Vollständiger Plan + Apps-Script-Code:** `docs/join-to-sheet-automation-f4cdcc.md` (Kopie; Original unter `mersch75test.github.io/.windsurf/plans/` bzw. `~/.windsurf/plans/`).

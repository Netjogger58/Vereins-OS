# VEREINS-OS — PROJEKTPLAN
> **Zuletzt aktualisiert:** 22. Juni 2026  
> **Status:** In aktiver Entwicklung — Pilot: Handball Mersch 75

---

## 1. PROJEKTÜBERSICHT

| | |
|---|---|
| **Name** | Vereins-OS |
| **Repository** | github.com/Netjogger58/Vereins-OS (privat) |
| **Lizenz** | Privat (kommerzieller Verkauf geplant) |
| **Ziel** | Vereinsmanagement-System für Sportvereine |
| **Pilot** | Handball Mersch 75 (mersch75.lu) |
| **Hosting** | Hetzner Cloud |

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

> ⚠️ **Planänderung:** Ursprünglich war Python/FastAPI als Backend geplant.  
> Umgesetzt wurde Node.js/Express/TypeScript — funktional identisch, bessere Integration mit dem React-Frontend.

---

## 3. IMPLEMENTIERTE FEATURES (STAND JUNI 2026)

### ✅ 3.1 Authentifizierung & Benutzerverwaltung
- Email + Passwort Login
- **Magic Link Login** (passwordless)
  - Per Email (24h gültig, einmalig)
  - Per SMS mit Länderkennung (+352, +49, +33, +32)
- Rollenbasiertes Berechtigungssystem:
  - Präsident (Vollzugriff)
  - Admin (Systemverwaltung)
  - Trainer (Teams, Spiele)
  - Secrétaire (Dokumente, Anmeldungen)
  - Kassenwart (Finanzen)
  - Spieler (eigene Daten)

### ✅ 3.2 Spiel- & Ligastatistiken
- Spiele (CRUD): Datum, Teams, Score, Status, Wettbewerb, Saison
- Torschützen erfassen: Tore, Vorlagen, 7-Meter, Feldtore
- Strafen: 2-Minuten-Strafen, Disziplin-Tracking
- **Automatische Ligatabellen**: Punkte, Tordifferenz, Siege/Niederlagen

### ✅ 3.3 FLH Import (handball4all.de)
- Einzelimport per URL
- **Batch-Import**: 86 SBO-Spielberichte automatisch
- Automatisches Scraping der Spieldaten
- Fuzzy-Matching: FLH-Spielernamen ↔ Mersch75-Mitglieder

### ✅ 3.4 Spielerstatistiken
- Individuelle Statistiken (Tore, Vorlagen, Strafen, Spiele)
- Top-Scorer Rangliste
- Filter nach Saison & Wettbewerb

### ✅ 3.5 Teams & Mitglieder
- Teams verwalten (Seniors, Damen, etc.)
- Mitgliederverwaltung pro Team
- Kontaktdaten, Rollen im Team

### ✅ 3.6 Kalender & Events
- Spiele, Training, Events
- Wiederkehrende Termine
- ICS-Export für externe Kalender-Apps

### ✅ 3.7 Finanzen (Kassenwart)
- Mitgliedsbeiträge + Zahlungsstatus
- Ausgaben dokumentieren (Kategorien, Beleg-Upload)
- Einnahmen/Ausgaben Berichte + PDF-Export

### ✅ 3.8 Dokumente (Secrétaire)
- Dokument-Upload (PDFs, Bilder)
- Kategorisierung + Versionierung
- Online-Formulare (Anmeldungen, Freigaben)

### ✅ 3.9 Kommunikation
- Email-Versand an Teams/Mitglieder (Templates, Verteilerlisten)
- WhatsApp-Gruppen-Links

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

### 📋 5.1 Statuten & Reglemente

**Ziel:** Alle wichtigen Vereins- und Verbandsdokumente zentral abrufbar + KI-gestützte Suche darin.

#### Vereinsstatuten (Handball Mersch 75)
- Statuten als PDF hinterlegen (Upload durch Admin)
- Versionierung (alte Versionen bleiben erhalten)
- Zugriff: Alle Mitglieder (lesend), Admin (bearbeiten)

#### FLH-Reglemente (Fédération Luxembourgeoise de Handball)
- FLH-Statuten hinterlegen
- Wettbewerbsreglement / Spielordnung
- Disziplinarordnung
- Schiedsrichterregeln
- Direktlink zur offiziellen FLH-Webseite (flh.lu)
- Automatische Benachrichtigung wenn neue Version verfügbar (optional)

#### KI-Assistent für Regelwerk & Statuten
- Mitglieder/Trainer können Fragen stellen:  
  *„Wie viele Spieler müssen auf dem Spielbericht stehen?"*  
  *„Was passiert bei einer roten Karte?"*  
  *„Was steht in § 12 der Vereinsstatuten?"*
- KI durchsucht die hochgeladenen PDF-Dokumente und antwortet mit Quellenangabe (Seitenzahl, Artikel)
- Sprachen: Deutsch, Französisch, Luxemburgisch
- Technologie: RAG (Retrieval-Augmented Generation) über lokale PDFs

---

### 🛡️ 5.2 Versicherungsmodul

**Ziel:** Alle Versicherungsinformationen zentral verwalten — was ist versichert, was kostet es, was tun im Schadensfall.

#### Aktuelle Versicherungen (Handball Mersch 75)

| Versicherer | Bereich | Status |
|---|---|---|
| **AXA** | _(Details ausstehend — bitte ergänzen)_ | ✅ aktiv |
| **CSMS** | _(Details ausstehend — bitte ergänzen)_ | ✅ aktiv |

> ⚠️ **TODO:** Bitte die genauen Versicherungspolicen / Deckungsumfang nachreichen damit diese Tabelle vervollständigt werden kann.

#### Geplante Inhalte pro Versicherung
- Versicherer, Policen-Nummer
- Ansprechpartner + Notfallkontakt
- **Was ist gedeckt** (Unfälle beim Training, Spiel, Auswärtsfahrten, Material...)
- **Was ist NICHT gedeckt** (Ausschlüsse)
- Jahresprämie / Kosten
- Ablaufdatum / Erneuerungsdatum
- PDF der Police (Upload)
- Schadensmeldungs-Formular (direkt in der App ausfüllbar)

#### Schadensfall-Workflow
```
Unfall passiert
    → Formular in der App ausfüllen (Datum, Ort, Betroffene, Beschreibung)
    → App zeigt: "Was jetzt tun?" — schrittweise Anleitung
    → Automatische Email an Secrétaire + Versicherungskontakt
    → Schadensfall wird gespeichert (Archiv)
    → Status-Tracking (gemeldet → in Bearbeitung → abgeschlossen)
```

#### KI-Assistent für Versicherungsfragen
- Mitglieder können fragen:  
  *„Bin ich bei einem Auswärtsspiel in Deutschland versichert?"*  
  *„Was mache ich wenn ein Spieler sich verletzt?"*  
  *„Ist unser Material in der Halle versichert?"*
- KI antwortet basierend auf hinterlegten Policen-Dokumenten
- Bei unklaren Fällen: Direkt-Link zum Versicherungsberater

---

## 6. NOCH AUSSTEHEND (ORIGINALPLAN)

| Feature | Priorität |
|---|---|
| Excel-Import (~445 Mitglieder aus GC 2026-Datei) | Hoch |
| Matrix/Element Chat-Integration | Mittel |
| KI-Agenten (n8n/Prefect Workflow) | Mittel |
| JoinUs-Parser (Anmeldungen → Datenbank) | Mittel |
| Nextcloud-Anbindung (Dateien/Dokumente) | Niedrig |
| Statistiken aus bestehendem WP-System migrieren | Mittel |
| Live-Center aus VS Code integrieren | Mittel |
| PDF-Formulare aus bestehendem System | Niedrig |

---

## 7. API-ENDPUNKTE (ÜBERSICHT)

```
# Auth
POST   /api/auth/magic-link
GET    /api/auth/verify-magic-link?token=xxx

# Spiele
GET    /api/matches
POST   /api/matches
PUT    /api/matches/:id
DELETE /api/matches/:id
POST   /api/matches/import-flh
POST   /api/matches/batch-import-flh

# Statistiken
GET    /api/player-statistics?playerId=1&season=2025/26
GET    /api/top-scorers?competition=League&limit=20

# Tabellen
GET    /api/standings?competition=League&season=2025/26

# (geplant) Dokumente & Statuten
POST   /api/documents/upload
GET    /api/documents
POST   /api/documents/ask          ← KI-Frage an Dokument

# (geplant) Versicherungen
GET    /api/insurance
POST   /api/insurance/claim        ← Schadensfall melden
GET    /api/insurance/claim/:id
```

---

## 8. SICHERHEIT

- OAuth2/JWT + Session-Auth
- HTTPS (Let's Encrypt)
- Input-Sanitization (SQL-Injection, XSS)
- Rate-Limiting
- Audit-Logs
- Rollenbasierter Zugriff

---

## 9. TEAM

| Rolle | Person |
|---|---|
| Hauptentwickler | Netjogger58 |
| Co-Entwickler / Backup | Sohn (remote) |
| KI-Assistenz | GitHub Copilot |

> ⚠️ Offene Punkte: Contributor Agreement mit Sohn, Rechtsklärung KI-Code (Windsurf/Copilot AGB)

---

## 10. MARKT & VERKAUFSPOTENZIAL

- **Zielmarkt:** DACH + Luxemburg (Sportvereine)
- **Unterschied zu OpenSports:** Open Source, KI-Agenten, Matrix, Self-Hosted
- **Modell:** Einmaliger Kauf + Wartung **oder** SaaS-Subskription
- **Branding international:** `club-os` oder `association-os`
- **Domain-Optionen:** vereins-os.de, club-os.com

---

## 11. ROADMAP

### ✅ Phase 1 — Grundgerüst (abgeschlossen)
- GitHub Repository, Docker-Setup, FastAPI → Node.js Backend
- Basis-Auth, Mitglieder-API, Frontend-Grundgerüst

### ✅ Phase 2 — Handball-Kern (abgeschlossen)
- FLH Import, Spielerstatistiken, Ligatabellen
- Magic Link Login, Rollen-System

### 🔄 Phase 3 — Datenmigration (ausstehend)
- [ ] Excel-Import Skript (445 Mitglieder)
- [ ] Datenbereinigung
- [ ] Mersch75-Produktivdaten einlesen

### 🔄 Phase 4 — Integrationen (ausstehend)
- [ ] Matrix-Bot
- [ ] KI-Agenten (n8n/Prefect)
- [ ] Nextcloud-Anbindung
- [ ] JoinUs-Parser

### 🔄 Phase 5 — Assets & Statistiken (ausstehend)
- [ ] Live-Center integrieren
- [ ] Poster Generator fertigstellen
- [ ] PDF-Formulare
- [ ] Medien-Verwaltung (Fotos/Videos)

### 🔄 Phase 6 — Statuten, Reglemente & Versicherungen (ausstehend)
- [ ] Vereinsstatuten hochladen & verwalten
- [ ] FLH-Reglemente hinterlegen
- [ ] KI-Assistent für Regelwerk-Fragen (RAG)
- [ ] Versicherungsmodul (AXA, CSMS) einrichten
- [ ] Schadensfall-Workflow implementieren
- [ ] KI-Assistent für Versicherungsfragen

### 🔄 Phase 7 — Deployment & Testing (ausstehend)
- [ ] Hetzner-Server produktiv einrichten
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Security-Audit
- [ ] Beta-Test mit Mersch75
- [ ] Mehrsprachigkeit (DE/FR/LU)

---

## 12. OFFENE INFORMATIONEN (BITTE ERGÄNZEN)

| Was fehlt | Wer kann es liefern |
|---|---|
| AXA: Policen-Nummer, Deckungsumfang, Kosten, Kontakt | Kassenwart / Präsident |
| CSMS: Was genau ist versichert? Kosten? Kontakt? | Kassenwart / Präsident |
| Weitere Versicherungen vorhanden? | Kassenwart |
| Vereinsstatuten (PDF) | Secrétaire |
| FLH-Reglemente (PDF oder Link) | Trainer / Präsident |

---

## 13. OFFENE RECHTSFRAGEN
- [ ] Rechtsanwalt: Verkaufsrechte, KI-generierter Code
- [ ] Windsurf/Copilot Business AGB prüfen
- [ ] Contributor Agreement mit Sohn finalisieren
- [ ] Domain registrieren (vereins-os.de?)

---

## 14. DEMO-ZUGÄNGE (nur intern)

| Rolle | Email | Passwort |
|---|---|---|
| Admin | admin@mersch75.lu | demo1234 |
| Präsident | praesident@mersch75.lu | demo123 |
| Trainer | trainer@mersch75.lu | demo123 |
| Spieler | spieler@mersch75.lu | demo123 |

---

*Dieser Plan wird bei jeder Weiterentwicklung aktualisiert.*

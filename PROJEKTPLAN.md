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

---

## 3. IMPLEMENTIERTE FEATURES (STAND JUNI 2026)

### ✅ 3.1 Authentifizierung & Benutzerverwaltung
- Email + Passwort Login
- **Magic Link Login** (passwordless) per Email & SMS
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

### 📋 5.1 Statuten & Reglemente

**Ziel:** Alle wichtigen Vereins- und Verbandsdokumente zentral abrufbar + KI-gestützte Suche darin.

#### Vereinsstatuten (Handball Mersch 75)
- Statuten als PDF hinterlegen (Upload durch Admin)
- Versionierung (alte Versionen bleiben erhalten)
- Zugriff: Alle Mitglieder (lesend), Admin (bearbeiten)

#### FLH-Reglemente (Fédération Luxembourgeoise de Handball)
> **Quelle:** [flh.lu/f-l-h/statuts-et-reglements](https://www.flh.lu/f-l-h/statuts-et-reglements)

Alle offiziellen FLH-Dokumente als direkte PDF-Links — können in der App hinterlegt und per KI durchsucht werden:

| # | Dokument | Direktlink PDF |
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
| 13 | Commission Luxembourgeoise d'Arbitrage pour le Sport (CLAS) | [Download](https://www.flh.lu/fileadmin/flh/documents/Statuts_et_Reglements/13CLAS.pdf) |

**In der App geplant:**
- Alle 12 PDFs automatisch importieren & indexieren
- Automatische Benachrichtigung bei neuer Version (optional)

#### KI-Assistent für Regelwerk & Statuten
- Fragen wie: *„Was passiert bei einer roten Karte?"* oder *„Was steht in § 12?"*
- KI durchsucht PDFs und antwortet mit Quellenangabe (Seite, Artikel)
- Sprachen: Deutsch, Französisch, Luxemburgisch
- Technologie: RAG (Retrieval-Augmented Generation)

---

### 🛡️ 5.2 Versicherungs- & Sportrechts-Modul

**Ziel:** Alle Versicherungen, Behörden und Pflichten zentral verwalten — was ist gedeckt, was kostet es, was tun im Schadensfall.

---

#### 🏥 CSMS — Caisse de Secours Médico-Sportive
> **Quelle:** [sports.public.lu/csms](https://sports.public.lu/fr/programs/assurances/csms.html)

Die CSMS ist die staatliche Sportkrankenversicherung Luxemburgs — **Pflicht für alle lizenzierten Sportler**.

**Was deckt die CSMS ab (bei Sportunfällen):**

| Leistung | Deckung |
|---|---|
| Arztkosten & Medikamente | Découvert nach CNS (Restzahlung) |
| Nicht erstattungsfähige Medikamente | 60% des Rechnungsbetrags |
| Zahnprothesen | Doppelter CNS-Tarif |
| Krankenwagen | 20% (Rest nach Krankenkasse) |
| Krankenhausaufenthalt | CNS-Eigenbeteiligung + bis 40€/Tag (1. Klasse) |
| Physiotherapie | 20% (Rest nach Krankenkasse) |
| Brillen / Kontaktlinsen | bis 35€, max. 2 Paar / 36 Monate |
| Kniebandagen, Bandagen | Pauschalbeträge je nach Typ |
| Orthopädische Prothesen | Beteiligung auf Basis CNS-Tarife |
| Verdienstausfall (Selbständige) | Entschädigung auf Basis Mindestlohn |

**⚠️ Wichtig — Was die CSMS NICHT zahlt:**
- Wenn der verletzte Spieler **nicht krankenversichert** (CNS) ist → keine CSMS-Leistung
- Aktivitäten die **nicht offiziell lizenziert/genehmigt** sind
- Unfälle bei LASEP/LASEL-Aktivitäten → dort greift Unfallversicherung (AAA)

**Im Schadensfall:**
1. Arzt aufsuchen, Unfall als Sportunfall melden
2. Alle Belege sammeln (Arzt, Apotheke, Physiotherapie)
3. Einreichung über die Krankenkasse (CNS) → CSMS übernimmt Restzahlung automatisch
4. Policen-Nummer des Vereins bereithalten

---

#### 🏛️ ALIS — Agence Luxembourgeoise pour l'Intégrité dans le Sport
> **Quelle:** [alis.lu](https://www.alis.lu)

ALIS ist die luxemburgische Behörde für **Sportintegrität** — kein Versicherer, aber für Vereine wichtig.

**Zuständig für:**
- **Anti-Doping** — Kontrollen, Regeln, Meldepflichten
- **Safeguarding** — Schutz vor Missbrauch, Belästigung (besonders bei Jugendlichen!)
- **Spielmanipulation** — Meldestelle für verdächtige Anfragen

**Was Handball Mersch 75 beachten muss:**
- Trainer & Betreuer die mit Minderjährigen arbeiten → **Safeguarding-Pflichten**
- Kein Spieler darf bei Dopingkontrolle unvorbereitet sein
- Verdächtige Kontaktaufnahmen (Wetten, Spielmanipulation) → **sofort an ALIS melden**
- Regelmäßige Schulungen empfohlen

**In der App geplant:**
- ALIS-Kontakt & Meldestelle direkt verlinkt
- Checkliste Safeguarding für Trainer
- KI beantwortet Fragen: *„Was muss ich tun wenn ein Spieler auf Doping getestet wird?"*

---

#### 🏃 INAPS — Institut National des Sports
> **Quelle:** [inaps.public.lu](https://inaps.public.lu/fr.html)  
> Ministerium: Ministère des Sports | Ministerin: Martine Hansen  
> Kontakt Presse: presse@inaps.etat.lu

INAPS ist das staatliche Sportinstitut — zuständig für Sportförderung, medizinische Sportüberwachung und Ausbildung.

**Relevant für Handball Mersch 75:**
- **Medizinische Sportüberwachung** (contrôle médico-sportif) — Pflichtuntersuchungen für Lizenzspieler
- Subventionen & Fördergelder für Vereine
- Sportliche Ausbildung (Trainerlizenzen, Schiedsrichter)
- Kontrollstelle für medizinisch nicht rückerstattungsfähige Medikamente (Freigabe für CSMS)

**In der App geplant:**
- Übersicht welche Spieler ihre Pflichtuntersuchung erledigt haben
- Reminder wenn Untersuchung abläuft
- Links zu Förderanträgen

---

#### 🔵 AXA — Vereinsversicherung
> **Status:** Police noch ausstehend — wird nach Erhalt ergänzt

**Geplante Inhalte (nach Erhalt der Police):**
- Policen-Nummer, Laufzeit, Jahresprämie
- Deckungsumfang (Haftpflicht, Material, Veranstaltungen, ...)
- Ansprechpartner & Notfallnummer
- PDF der Police hinterlegen
- Was bei Schaden zu tun ist

---

#### 📋 Schadensfall-Workflow (in der App)
```
Unfall/Schaden passiert
    → App: Formular ausfüllen (Datum, Ort, Betroffene, Beschreibung)
    → App zeigt: "Was jetzt tun?" — Schritt-für-Schritt-Anleitung
    → Je nach Art: CSMS-Weg ODER AXA-Weg
    → Automatische Email an Secrétaire + Versicherungskontakt
    → Schadensfall gespeichert (Archiv + Status-Tracking)
    → KI beantwortet Folgefragen
```

#### 🤖 KI-Assistent für Versicherungs- & Rechtsfragen
Beispielfragen die die KI beantworten kann:
- *„Ein Spieler hat sich beim Training verletzt — was tun?"*
- *„Bin ich bei einem Freundschaftsspiel in Belgien versichert?"*
- *„Was muss ich als Trainer bei Minderjährigen beachten (Safeguarding)?"*
- *„Wann muss ein Spieler zur Pflichtuntersuchung bei INAPS?"*
- *„Wie melde ich einen Dopingverdacht?"*

---

### 🤝 5.3 Ehrenamt & Bénévolat-Modul

> **Quelle:** [benevolat.lu](https://benevolat.lu)  
> **Agence du Bénévolat Luxembourg** (a.s.b.l.)  
> 9, Avenue Guillaume — L-1651 Luxembourg  
> Tél.: (+352) 26 12 10  
> Seit 2002 tätig — offizielle nationale Anlaufstelle für Ehrenamt in Luxemburg

**Ziel:** Ehrenamtliche Helfer verwalten, wertschätzen und neue Freiwillige finden — der Verein lebt vom Ehrenamt!

#### Was die Agence du Bénévolat bietet:

| Service | Nutzen für Mersch75 |
|---|---|
| **Annuaire des Missions** | Offene Ehrenamtsstellen veröffentlichen (Kassenwart, Materialwart, etc.) |
| **Annuaire des Associations** | Vereinsprofil auf nationalem Portal pflegen |
| **Formations pour bénévoles** | Schulungen für Vereinsverantwortliche (Vereinsführung, Buchhaltung) |
| **Label de Qualité** | Qualitätszertifikat für vorbildliche Vereinsführung |
| **Prix du Mérite** | Ehrenamtliche offiziell auszeichnen lassen |
| **Espace ressources** | Muster-Verträge, Leitfäden, rechtliche Infos |
| **FAQ / Rechtliches** | Congé bénévole (bezahlter Urlaub für Ehrenamtliche), Haftung |

#### Rechtlicher Rahmen (Luxemburg):
- **Congé bénévole**: Arbeitnehmer haben in Luxemburg Anspruch auf bezahlten Sonderurlaub für Ehrenamtsaufgaben
- **Haftpflicht**: Ehrenamtliche sind über den Verein (AXA-Police) mitversichert — wichtig bei Veranstaltungen
- **Datenschutz (RGPD)**: Ehrenamtliche-Daten unterliegen denselben Datenschutzregeln wie Mitglieder

#### In der App geplant:

**Ehrenamtlichen-Verwaltung:**
- Eigene Kategorie neben „Spieler" und „Trainer": **Bénévole**
- Aufgaben/Rollen hinterlegen (Kassenwart, Materialwart, Hallenwart, Schiri-Betreuer, ...)
- Einsatz-Stunden erfassen (freiwillig, für interne Wertschätzung)
- Geburtstage & Jubiläen automatisch anzeigen (5 Jahre, 10 Jahre Ehrenamt)

**Neue Ehrenamtliche finden:**
- Direktlink zu [benevolat.lu/annuaire-missions](https://benevolat.lu/annuaire-missions/) um offene Stellen zu veröffentlichen
- Formular in der App → veröffentlicht Mission auf benevolat.lu (API, falls verfügbar)

**Wertschätzung & Anerkennung:**
- Jährliche Zusammenfassung: *„Danke an unsere X Ehrenamtlichen mit insgesamt Y Stunden"*
- Nominierung für **Prix du Mérite** direkt aus der App initiieren
- Bewerbung für **Label de Qualité** (Checkliste in der App)

**KI-Fragen zum Ehrenamt:**
- *„Wie viele Urlaubstage hat ein Ehrenamtlicher in Luxemburg?"*
- *„Was passiert wenn ein Helfer beim Aufbau verletzt wird?"*
- *„Wie veröffentliche ich eine Ehrenamtsstelle auf benevolat.lu?"*

---

## 6. NOCH AUSSTEHEND

| Feature | Priorität |
|---|---|
| Excel-Import (~445 Mitglieder) | Hoch |
| Matrix/Element Chat-Integration | Mittel |
| KI-Agenten (n8n/Prefect Workflow) | Mittel |
| JoinUs-Parser | Mittel |
| Nextcloud-Anbindung | Niedrig |
| Live-Center aus VS Code integrieren | Mittel |

---

## 7. ROADMAP

### ✅ Phase 1 & 2 — Grundgerüst + Handball-Kern (abgeschlossen)
### 🔄 Phase 3 — Datenmigration
- [ ] Excel-Import (445 Mitglieder), Datenbereinigung

### 🔄 Phase 4 — Integrationen
- [ ] Matrix-Bot, KI-Agenten, Nextcloud, JoinUs-Parser

### 🔄 Phase 5 — Assets & Statistiken
- [ ] Live-Center, Poster Generator, Medien-Verwaltung

### 🔄 Phase 6 — Statuten, Versicherungen & Sportrecht
- [x] FLH-Reglemente & Direktlinks dokumentiert (12 PDFs)
- [ ] Vereinsstatuten Mersch75 hochladen (PDF ausstehend)
- [ ] KI-Assistent (RAG über PDFs)
- [ ] CSMS-Modul mit Schadensfall-Workflow
- [ ] AXA-Police hinterlegen (nach Erhalt)
- [ ] ALIS Safeguarding-Checklisten
- [ ] INAPS Pflichtuntersuchungs-Tracker

### 🔄 Phase 7 — Ehrenamt & Bénévolat
- [ ] Ehrenamtlichen-Verwaltung (Rolle, Aufgaben, Stunden)
- [ ] Integration benevolat.lu — Missions veröffentlichen
- [ ] Wertschätzungs-Modul (Jubiläen, Prix du Mérite)
- [ ] Label de Qualité — Checkliste

### 🔄 Phase 8 — Deployment & Testing
- [ ] Hetzner produktiv, CI/CD, Security-Audit, Beta Mersch75

---

## 8. OFFENE INFORMATIONEN (BITTE ERGÄNZEN)

| Was fehlt | Wer liefert es |
|---|---|
| AXA: Police (PDF), Policen-Nr., Deckung, Kosten, Kontakt | Kassenwart / Präsident |
| Vereinsstatuten Mersch75 (PDF) | Secrétaire |

---

## 9. EXTERNE LINKS & KONTAKTE

| Organisation | Link | Funktion |
|---|---|---|
| CSMS | [sports.public.lu/csms](https://sports.public.lu/fr/programs/assurances/csms.html) | Sportkrankenversicherung |
| ALIS | [alis.lu](https://www.alis.lu) | Anti-Doping, Safeguarding |
| INAPS | [inaps.public.lu](https://inaps.public.lu/fr.html) | Sportinstitut, med. Überwachung |
| FLH Statuts | [flh.lu/f-l-h/statuts-et-reglements](https://www.flh.lu/f-l-h/statuts-et-reglements) | Handballverband — alle Reglements |
| Agence du Bénévolat | [benevolat.lu](https://benevolat.lu) | Ehrenamt Luxembourg, Missions, Ressourcen |
| AXA | ausstehend | Vereinsversicherung |

---

## 10. SICHERHEIT
- OAuth2/JWT + Session-Auth, HTTPS, Rate-Limiting, Audit-Logs, Rollenbasierter Zugriff

## 11. TEAM

| Rolle | Person |
|---|---|
| Hauptentwickler | Netjogger58 |
| Co-Entwickler / Backup | Sohn (remote) |
| KI-Assistenz | GitHub Copilot |

## 12. OFFENE RECHTSFRAGEN
- [ ] Rechtsanwalt: Verkaufsrechte, KI-Code
- [ ] Contributor Agreement mit Sohn
- [ ] Domain registrieren (vereins-os.de?)

## 13. DEMO-ZUGÄNGE (nur intern)

| Rolle | Email | Passwort |
|---|---|---|
| Admin | admin@mersch75.lu | demo1234 |
| Präsident | praesident@mersch75.lu | demo123 |
| Trainer | trainer@mersch75.lu | demo123 |
| Spieler | spieler@mersch75.lu | demo123 |

---

*Dieser Plan wird bei jeder Weiterentwicklung aktualisiert.*

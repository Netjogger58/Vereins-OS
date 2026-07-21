# SpielerPlus Premium — Trainer-Team vs. Spieler & Machbarkeit in unserer App

Quellen: Google Play / App Store Beschreibungen, MatchMakers/Derbeo Test 2026, SpielerPlus Support.

## Grundmodell
SpielerPlus arbeitet pro **Mannschaft / Team**, nicht pro Einzelspieler. Die Premium-Features werden über eine Team- oder Vereins-Lizenz freigeschaltet:

- **Team-Lizenz:** ca. €3,99 pro Spieler/Saison
- **Vereins-Lizenz:** ab ca. €199/Saison für mehrere Teams
- **Free:** Werbung + limitierte Statistiken

### Was bekommt das **Trainer-Team** in Premium?
| Feature | Beschreibung | Status in unserer App |
|---|---|---|
| Vollständige Statistiken | Anwesenheits-Quoten, Tore, Vorlagen, Team-Performance | **Schon vorhanden** – `Statistics.tsx`, `matchGoals`, `attendance` |
| Aufstellungs-Editor | Drag & Drop, mehrere Vorlagen | **Schon vorhanden** – `LineupEditor.tsx`, API `/api/matches/:id/lineup` |
| Mannschafts-Kasse | Beiträge, Strafen, rudimentäres Mahnwesen | **Schon vorhanden** – `accounts`, `transactions`, `invoices`, `memberFees` |
| Spielplan-Import | .ics, .csv, .xlsx | **Noch nicht** – machbar, aber separater Import-Parser nötig |
| Push-Nachrichten | Erinnerungen & kurzfristige Änderungen | **Noch nicht** – Push-Service (FCM/APNs) nötig, aufwändiger |
| Gruppen in Terminen | z. B. Rot / Blau / Gruppe A | **Teilweise** – `eventGroups` Tabelle & API existieren |
| Eltern-Accounts | Stellvertreter-Login | **Teilweise** – Rolle `elternteil` existiert, UI kann ausgebaut werden |
| Aufgaben / Dienstplan | Wer wäscht Trikots, Material-Dienst | **Noch nicht** – machbar, eigene Tabelle nötig |

### Was bekommt der **Spieler** in Premium?
| Feature | Beschreibung | Status in unserer App |
|---|---|---|
| Werbefreie Nutzung | Keine Werbeeinblendungen | **Egal** – unsere App hat keine Werbung |
| Volle Statistiken | Eigene Tore, Anwesenheit, Performance | **Möglich** – Daten liegen vor, Spieler-Dashboard fehlt noch |
| An-/Abmeldung mit Erinnerung | Training/Spiel Zusage/Absage | **Schon vorhanden** – `MyEvents.tsx`, `availability` API |
| Team-Chat / Umfragen | Doodle-Ersatz, Chat | **Noch nicht** – `chatMessages` Tabelle existiert, UI fehlt |
| Fahrgemeinschaften | Fahrten anbieten/suchen | **Noch nicht** – neue Tabelle + UI nötig |
| Datei-Cloud | Team-Dokumente | **Schon vorhanden** – `documents` Tabelle & Upload |

## Fazit / Empfehlung
**Sofort nutzbar / ausbaufähig:**
1. Trainer-Statistiken & Anwesenheit
2. Aufstellungs-Editor (ggf. Handball-Positionen statt Fußball)
3. Mannschafts-Kasse / Beiträge

**Kurzfristig machbar (1–2 Tage):**
- Trainer-Übersicht für Event-Uneroff
- Handball-spezifische Aufstellung
- Eltern-Login / Stellvertreter

**Aufwändiger (separate Planung):**
- Push-Notifications
- Spielplan-Import
- Fahrgemeinschaften
- Aufgaben-/Dienstplan

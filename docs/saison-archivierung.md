# Saison-Archivierung & Saisonwechsel (Plan)

> **Ziel:** Am Ende einer Saison (z.B. nach der Hauptversammlung) müssen die aktuellen Daten
> **archiviert** und eine **neue, leere Saison** erzeugt werden können. Ältere Jahrgänge
> sollen ebenfalls archivierbar/abrufbar sein. Dabei müssen die **Archiv-Tabellen an das
> neue Mitglieder-/Funktions-Modell angepasst** werden (siehe `docs/kategorien-neuordnung.md`).
>
> Stand: 02.07.2026.

---

## 1. Was schon existiert

Die App hat bereits eine Archiv-Infrastruktur:

- **Tabellen:** `archive_seasons`, `archive_teams`, `archive_members`, `archive_matches`,
  `archive_events`, `archive_exports`.
- **API-Routen** (`server/routes.ts`): `GET /api/archive/seasons`, `/teams/:seasonId`,
  `/members/:seasonId`, `/matches/:seasonId`, `GET /api/archive/export/:seasonId` (JSON),
  `POST /api/archive/import`.
- **Storage** (`server/storage.ts`): CRUD für die Archiv-Tabellen.
- `archive_seasons.active` markiert die aktive Saison (nur eine).

**Lücke:** Es gibt (a) noch keinen **Rollover** („aktuelle Saison → Archiv + neue Saison
anlegen") und (b) die Archiv-Tabellen kennen die **neuen Felder** noch nicht.

---

## 2. Problem: Archiv muss zum neuen Modell passen

Das aktuelle `archive_members` speichert nur wenige Felder (Name, Position, Tore …). Das
neue Modell (siehe Kategorien-Neuordnung) hat aber deutlich mehr:

- `catCode` (Hauptkategorie) + **Mehrfach-Kategorien** (Surclassement)
- **Mehrfach-Funktionen** (`member_functions`: Spieler, Arbitre, Comité, Coach, Teamchef,
  Teambegleeder, Supervisor …) inkl. **Trainerschein** (`qualification`)
- `membership_status`, `licence_status`, `transfer_status`, `member_type`

Wenn wir nur die alten Spalten archivieren, geht all das verloren.

### Empfehlung: JSON-Snapshot + wenige Index-Spalten

Statt jede neue Spalte einzeln zu spiegeln (bricht bei jeder Modelländerung), pro
archiviertem Mitglied einen **vollständigen JSON-Snapshot** speichern — plus einige wenige
**indexierte Spalten** für schnelle Abfragen. Vorteil: **zukunftssicher** — alte Archive
bleiben lesbar, egal wie sich das Live-Modell weiterentwickelt.

**Vorschlag Erweiterung `archive_members`:**

| Neues Feld | Zweck |
|---|---|
| `cat_code` | Hauptkategorie-Code (Index/Filter) |
| `functions` | JSON-Array der Funktionen inkl. `code`/`qualification` |
| `categories` | JSON-Array zusätzlicher Spielberechtigungen (Surclassement) |
| `membership_status` | Status zum Archivzeitpunkt |
| `licence_status` | Lizenzstatus zum Archivzeitpunkt |
| `member_type` | Mitgliedsart |
| `snapshot_json` | **kompletter** Mitglieds-Datensatz als JSON (future-proof) |

`archive_teams` hat `trainer_qualifications` bereits — das deckt den Trainerschein auf
Team-Ebene ab. Auf Mitglieds-Ebene steckt er im `functions`-JSON.

---

## 3. Rollover-Prozess (Saisonwechsel)

Ein **einmaliger, transaktionaler** Vorgang, ausgelöst durch den Sekretär/Admin
(z.B. Button „Saison abschließen"). Ablauf:

1. **Vorbedingung prüfen:** aktive Saison vorhanden, keine offenen Pflicht-Aufgaben
   (optional: offene Beiträge, fehlende Ergebnisse melden — nur Warnung).
2. **Backup** der `data.db` (analog zum bestehenden Backup-Vorgang).
3. **Snapshot schreiben:** aktuelle `members` (+ `member_functions`, `member_categories`),
   `teams`, `matches`, `standings`, `events`, Beiträge → in die `archive_*`-Tabellen der
   abzuschließenden Saison (inkl. `snapshot_json`).
4. **Export** der Saison als JSON/PDF ablegen (`archive_exports`) — für Hauptversammlung.
5. **Alte Saison deaktivieren:** `archive_seasons.active = false`; abgeschlossene Saison
   als archiviert markieren.
6. **Neue Saison anlegen:** neuer `archive_seasons`-Eintrag (`active = true`), z.B. „2026/27".
7. **Live-Daten für neue Saison vorbereiten:**
   - **Mitglieder bleiben** (Verein besteht weiter), aber:
     - Alterskategorien **neu berechnen** anhand FLH (Jahrgang rutscht eine Kategorie hoch).
     - `member_categories` (Surclassement) **zurücksetzen** (muss neu vergeben werden).
     - Saison-abhängige Werte (Statistiken, Nominierungen, Ergebnisse) **leeren**.
   - `matches`, `standings`, `nominations`, `attendance` etc. für die neue Saison **leeren**
     (sind schon in Archiv gesichert).
   - Beiträge (`member_fees`) für die neue Saison neu generieren.

> **Wichtig:** Mitglieder-Stammdaten werden **nicht** gelöscht — nur die **saisonabhängigen**
> Daten werden archiviert und zurückgesetzt. Die `card_id` (Random-No) bleibt bestehen.

---

## 4. Ältere Jahrgänge archivieren/importieren

- Frühere Saisons (vor App-Zeit) können per **`POST /api/archive/import`** als JSON
  eingespielt werden — dazu ein einheitliches **Import-Schema** definieren, das das
  `snapshot_json`-Format nutzt.
- So lassen sich alte Excel-/Papier-Saisons nachträglich als Archiv-Saison ablegen.

---

## 5. Anzeige / Nutzung

- Archiv-Ansicht pro Saison (read-only): Kader, Trainer(+Schein), Tabelle, Ergebnisse,
  Statistik.
- Vergleich über Saisons (z.B. Entwicklung eines Spielers, Trainer-Historie).
- Export für die Hauptversammlung (PDF/CSV) aus `archive_exports`.

---

## 6. Umsetzungsschritte (Reihenfolge)

1. **Schema:** `archive_members` um die Felder aus §2 erweitern (v.a. `snapshot_json`,
   `functions`, `categories`, `cat_code`, Status-Felder).
2. **Storage:** Rollover-Funktion `archiveCurrentSeason(newSeasonName)` in `storage.ts`
   (transaktional: Snapshot + Reset + neue Saison).
3. **API:** `POST /api/archive/rollover` (Admin/Sekretär, mit Bestätigung + Backup).
4. **UI:** Button „Saison abschließen & neue Saison starten" mit Sicherheitsabfrage.
5. **FLH-Kategorien:** beim Rollover neu berechnen (nach angekündigter FLH-Anpassung).
6. **Import-Tool** für ältere Jahrgänge (JSON).

---

## 7. Offene Punkte / Entscheidungen

- Sollen **Nicht-Mitglieder** (Contact famille, Mère d'accueil) mitarchiviert werden? (Ja,
  für Vollständigkeit — als Snapshot, nicht als aktive Mitglieder.)
- Wie lange werden **Export-Dateien** aufbewahrt (`archive_exports.expires_at`)?
- Automatischer Trigger (nach Datum) vs. **manueller** Abschluss durch den Sekretär —
  Empfehlung: **manuell**, da an die Hauptversammlung gekoppelt.

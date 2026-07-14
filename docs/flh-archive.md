# FLH Statistik-Archiv

> D'Dokument beschreift, wéi d'FLH-Donnéeën (Spillplang, Resultater, Tabellen, SBO-PDFen) an der M75-Manager Infrastruktur archivéiert a benotzt kënne ginn.

## Hannergrond

D'FLH (Fédération Luxembourgeoise de Handball) stellt d'offiziell Donnéeën iwwer `handball4all.de` (API: `spo.handball4all.de/service/if_g_json.php`) zur Verfügung. Déi Donnéeën kënnen awer zu all Moment geännert oder ewechgeholl ginn. Zanter Juli 2026 ginn d'Donnéeën dofir an der **mersch75.lu** Websäit lokal archivéiert.

## Säit

D'Archiv gëtt an deem Repository ënnerhalen:

- `https://github.com/Netjogger58/mersch75test.github.io`
- Dokumentatioun do: `docs/flh-archive.md`
- Node-Tools: `tools/flh-archive.mjs` an `tools/sbo-archive.mjs`

## Archiv-Donnéeën

- `data/flh-archive-2627.json` (Saison 2026/2027)
- `data/flh-archive-2526.json` (Saison 2025/2026)
- `sbo-archiv/2627/<sGID>.pdf`
- `sbo-archiv/2526/<sGID>.pdf`
- `data/sbo-index-2627.json` an `data/sbo-index-2526.json`

## Integratioun an den M75-Manager

### 1. Matcher archivéieren

D'FLH-Archiv kann iwwer en Import-Skript (zukünfteg) an d'`archive_matches` an `archive_standings` Tabelle vun der M75-Manager SQLite `data.db` iwwerfouert ginn:

- `data/flh-archive-*.json` enthält `games` (Mat `team`, `datum`, `heim`, `gast`, `score`, `bem`, `sbo`, `nr`) a `standingsByLabel` (Tabellen pro Kategorie).
- `sGID` an `sbo` erméiglechen d'Verknëppung mat `sbo-archiv/` (lokal PDF).

### 2. Schema-Virschlag

Erweiderung vun `archive_matches`:

| Feld | Typ | Beschreiwung |
|------|-----|--------------|
| `flh_sgid` | TEXT | SBO/Spill-ID |
| `flh_season` | TEXT | z.B. `2627` |
| `flh_sbo_file` | TEXT | `sbo-archiv/2627/<sGID>.pdf` |
| `flh_data_json` | TEXT | komplette FLH-Spill-JSON (Snapshot) |

`archive_standings` kann änlech als Snapshot (`flh_standings_json`) gespäichert ginn.

### 3. API/Route

Falls den M75-Manager d'FLH-Archiv direkt abrëff:

```
GET /api/flh/season/:season
GET /api/flh/games/:season
GET /api/flh/standings/:season
GET /api/flh/sbo/:season/:sgid
```

Aktuell (2026-07-14) gëtt d'FLH-Archiv awer nëmmen an der **Website** benotzt. D'App-Integratioun ass fir d'Zukunft geplant.

## Aktualiséierungszyklus

1. `node tools/flh-archive.mjs --season <saison>` an der Websäit-Repo ausféieren.
2. `node tools/sbo-archive.mjs ...` fir nei SBO-PDFen.
3. Ännerungen an der Websäit-Repo committen a pushen.
4. (Optional) Archiv-Matches an den M75-Manager importéieren.

## Offen Punkten

- M75-Manager Import-Route fir `flh-archive-*.json`.
- Automatiséierten Update-Job (GitHub Action / Cron).
- Rechtlech Kloerstellung (SBO-PDFen mat Spillernimm).

## Verwandt Dokumenter

- `docs/saison-archivierung.md` — Saison-Archivierung an der M75-Manager App.
- `M75-Manager-Statusbericht.md` — Gesamtzoustand vun der App.

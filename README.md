# M75-Manager (Vereins-OS)

Node/Express + Vite + SQLite App fir d'Verwaltung vum Mersch75 Handball Club.

## Wichteg Dokumenter

- [`CHANGELOG.md`](CHANGELOG.md) — chronologesch Lëscht vun de leschten Ännerungen.
- [`M75-Manager-Statusbericht.md`](M75-Manager-Statusbericht.md) — aktuellen Zoustand.
- [`M75-Manager-Features.md`](M75-Manager-Features.md) —Features.
- [`docs/saison-archivierung.md`](docs/saison-archivierung.md) — Saison-Archivierung.
- [`docs/image-optimization.md`](docs/image-optimization.md) — **Image-Optimierung**: Status vun `mersch75.lu` a Pläng fir de M75-Manager.
- [`docs/flh-archive.md`](docs/flh-archive.md) — **FLH Statistik-Archiv**: Spillplang, Resultater, Tabellen a SBO-PDFen ginn lokal an der Schwëster-Repo `mersch75test.github.io` archivéiert; Integratioun an den M75-Manager ist geplant.
- [`PROJEKTPLAN.md`](PROJEKTPLAN.md) — Gesamtprojet.
- [`README-HETZNER.md`](README-HETZNER.md) — **Deploy um Hetzner VPS** (Schritt-fir-Schritt).

## Start

```bash
npm install
npm run dev   # Express API + Vite dev server → http://localhost:3000
```

## Produktion (Hetzner)

```bash
# Um Server:
cd /root/mersch75v2
git pull            # oder ZIP eroplueden
npm install
npm run build
pm2 restart m75-manager   # App nei starten
```

Migratioune (nei DB-Kolonnen, Card-ID Padding, Fee Rules Seed) lafen automatesch beim Start.

## App vs. Websäit

| | M75-Manager (Vereins-OS) | mersch75.lu (Websäit) |
|---|---|---|
| **Repo** | `Vereins-OS` | `mersch75test.github.io` |
| **Deploy** | Hetzner VPS (PM2) | GitHub Pages (automatesch) |
| **URL** | `https://manager.mersch75.lu` | `https://mersch75.lu` |
| **Zweck** | Intern Verwaltung (Member, Finanzen, Trainings, Spiller) | Public Websäit (News, Live-Center, Sponsor, Willkomm-Mapp) |
| **Login** | Passwort / Random-No / PIN / Admin / Magic Link | Public (kee Login) |
| **DB** | SQLite (`data.db`) | keng (statisch HTML/JS) |

Den M75-Manager kann d'Websäit iwwert den **Website-Hub** (`/website`) verwalten (Live-Vorschau, GitHub-Editor).

## Lescht Ännerungen (Juli 2026)

- **Sekretärs-Member-Form** — comprehensive Form mat Auto-Fill (Gebuertsdag→Kategori, Geschlecht, Team-Match, Pass→Status), Dual-Button (Famill/Späicheren).
- **Fee-Analyse & Generéierung** — automatiséiert Beitragsberechnung mat Famill-Spuer.
- **Registratioun → Member** — Online-Anmeldunge kënne mat ee Klick an Member konvertéiert ginn.
- **Card-ID 8 Zeechen** — all Random-Nummeren standardiséiert op 8 Zeechen.
- **Member PIN-Login** — Login ouni Passwort/Kaart via SMS/Email-OTP + PIN.

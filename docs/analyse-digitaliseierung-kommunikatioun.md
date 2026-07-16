# Analys: Mersch75 Digitaliséierung & Kommunikatioun (PDF) vs. Vereins-OS App

> **Erstellt:** 16. Juli 2026  
> **Quell-PDF:** `docs/Mersch75 Digitaliséierung & Kommunikatioun.pdf` (8 Seiten, Bild-basiert)  
> **Ziel:** Prüfung ob die PDF-Strategie zur App-Struktur und Hetzner-Integration passt, und wie leicht umsetzbar.

---

## 1. Inhalt des PDFs

Die PDF ist eine 8-seitige Präsentation (16:9 Slides) über die Digitalisierungs- und Kommunikationsstrategie von Mersch75:

| Seite | Thema |
|---|---|
| 1 | Titel: "Mersch75 Digitaliséierung & Kommunikatioun" — Überblick der Vision |
| 2 | Architektur-Diagramm: Zusammenhang Website (mersch75.lu), Vereins-OS App, Kommunikationskanäle |
| 3-4 | Digitalisierungs-Komponenten: Website, App, Automatisierung, KI |
| 5-6 | Kommunikationsstruktur: Matrix/Element, Email, WhatsApp-Bridge, Newsletter |
| 7 | Roadmap/Timeline |
| 8 | Zusammenfassung/Ziel-Zustand |

---

## 2. Vergleich mit der App-Struktur

### 2.1 Was bereits passt ✅

| PDF-Konzept | App-Status | Bewertung |
|---|---|---|
| **Zentrale Datenbank** | SQLite via Drizzle ORM, 555 aktive Mitglieder | ✅ Perfekt |
| **Rollenbasierter Zugriff** | Präsident, Admin, Trainer, Secrétaire, Kassenwart, Spieler | ✅ Implementiert |
| **Website-App Integration** | PROJEKTPLAN §5.1: REST-API → JS Widget auf mersch75.lu | ✅ Geplant, Struktur vorhanden |
| **Finanzen & Budget** | Echte Vereinsdaten, 7 Konten, Budget 2026-27 | ✅ Implementiert |
| **Médico-Modul** | Convocation + Resultate, mehrsprachig (6 Sprachen) | ✅ Implementiert |
| **Mitglieder-Import** | Excel-Import, Karten-IDs, FLH-Nummern | ✅ Implementiert |
| **Docker + Hetzner** | docker-compose.yml mit m75-manager + nginx, CX23 Server | ✅ Bereits eingerichtet |

### 2.2 Was teilweise passt 🟡

| PDF-Konzept | App-Status | Bedarf |
|---|---|---|
| **Kommunikations-Zentrale** (Matrix/Element) | PROJEKTPLAN §5.7 geplant | Matrix Server noch nicht deployt |
| **n8n Workflow-Automatisierung** | §5.8 geplant | Noch nicht installiert |
| **Ollama KI** | §5.8 geplant | Noch nicht auf dem Server |
| **PWA / Mobile App** | §5.10 geplant | React Code vorhanden, PWA-Manifest fehlt |
| **Website-API** | §5.1 geplant | Öffentliche REST-API noch nicht exponiert |
| **Saison-Archiv** | §5.2 geplant | Struktur im PROJEKTPLAN, noch nicht codiert |

### 2.3 Was noch fehlt 🔴

| PDF-Konzept | Bedarf |
|---|---|
| **Matrix/Synapse auf Hetzner** | Weiterer Docker-Container |
| **Mailcow (eigener Mail-Server)** | Ressourcen-intensiv, Alternative: externer SMTP |
| **Mautrix-Bridges (WhatsApp)** | Abhängig von Matrix |
| **Uptime Kuma Monitoring** | Einfacher Docker-Container |
| **Nextcloud** | Datei-Ablage, Kalender-Sync |
| **Playwright/Odysseus** | Browser-Automatisierung für FLH-Import |

---

## 3. Integration bei Hetzner — Machbarkeit

### 3.1 Server-Eckdaten

| | |
|---|---|
| **Server** | Hetzner Cloud CX23 |
| **IP** | 178.105.40.239 |
| **Ressourcen** | 2 vCPU · 4 GB RAM · 40 GB Disk |
| **Kosten** | 3,99 €/Monat |
| **Aktuell** | Nginx + Node.js App (pm2) |
| **frei** | ~31% Disk belegt, ~2 GB RAM frei |

### 3.2 Was leicht umzusetzen ist (niedriges Ressourcen-Bedürfnis)

#### Uptime Kuma — ~50 MB RAM
```yaml
uptime-kuma:
  image: louislam/uptime-kuma:1
  restart: unless-stopped
  ports: ["3001:3001"]
  volumes: ["./kuma:/app/data"]
```

#### n8n — ~200-400 MB RAM
```yaml
n8n:
  image: n8nio/n8n:latest
  restart: unless-stopped
  ports: ["5678:5678"]
  volumes: ["./n8n:/home/node/.n8n"]
```

#### Öffentliche REST-API — keine zusätzlichen Ressourcen
- Express-Routen in der bestehenden App
- CORS für mersch75.lu konfigurieren

#### PWA-Manifest — nur Frontend-Code
- `manifest.json` + Service Worker
- Keine Server-Ressourcen

### 3.3 Was schwieriger ist (hohes Ressourcen-Bedürfnis)

| Komponente | RAM-Bedarf | Problem auf CX23 (4 GB) | Alternative |
|---|---|---|---|
| **Matrix/Synapse** | 500-800 MB | Eng mit bestehender App | Matrix.org hosted, oder Server-Upgrade |
| **Ollama** | 1-2 GB | Zu viel für CX23 | Externe API (OpenAI), oder größerer Server |
| **Mailcow** | 1-2 GB+ | Empfohlen 6 GB+ | Externer SMTP (Hetzner Webmail, gratis SMTP) |
| **Nextcloud** | ~500 MB | Eng | Google Drive / Hetzner Storage Box |

---

## 4. Empfehlung: Phasierter Umsetzungsplan

### Phase 1 — Sofort (keine zusätzlichen Ressourcen)
- [ ] Öffentliche REST-API exponieren (Tabelle, Spielplan, Stats)
- [ ] PWA-Manifest + Service Worker für Mobile
- [ ] Uptime Kuma als Docker-Container
- [ ] n8n für Basis-Workflows (FLH-Import, Email-Mahnungen)
- [ ] SMTP über externen Service (kein eigener Mail-Server)

### Phase 2 — Kurzfristig (minimale Ressourcen)
- [ ] Website-Integration: mersch75.lu `fetch()` → API-Endpoints
- [ ] Automatisierungs-Jobs: n8n Workflows (Geburtstag, Mahnungen, Saison-Archiv)
- [ ] Saison-Archiv-Modul in der App
- [ ] PPTX-Generator (pptxgenjs)

### Phase 3 — Mittelfristig (Server-Upgrade notwendig)
- [ ] **Server Upgrade**: CX23 → CX32 (4 vCPU, 8 GB RAM, 80 GB) für ~7,99 €/Monat
- [ ] Matrix/Synapse selbst hosten
- [ ] Ollama mit kleinem Modell (phi3) für RAG über Statuten
- [ ] Mautrix-Bridges für WhatsApp

### Phase 4 — Langfristig
- [ ] Nextcloud für Dokumenten-Ablage
- [ ] Playwright/Odysseus Browser-Automatisierung
- [ ] PostgreSQL Migration (wenn Skalierung nötig)
- [ ] Native Mobile App (React Native)

---

## 5. Konklusion

Die PDF-Präsentation **passt gut** zur bestehenden App-Struktur und dem `PROJEKTPLAN.md`. Die Vision im PDF ist identisch mit den geplanten Modulen 5.1–5.12 im Projektplan.

**Integration bei Hetzner**: Die meisten Komponenten sind **leicht umzusetzen**, da sie nur zusätzliche Docker-Container benötigen. Die einzige Limitation ist der **4 GB RAM** des CX23 — für Matrix + Ollama + Mailcow wäre ein **Upgrade auf 8 GB** (CX32, +4 €/Monat) notwendig.

Mit der phasierten Approach (Phase 1–2 ohne Upgrade, Phase 3 mit Upgrade) bleibt das Kosten-Nutzen-Verhältnis optimal:

| Phase | Zusätzliche Kosten | Was wird möglich |
|---|---|---|
| Phase 1 | 0 € | API, PWA, Monitoring, n8n |
| Phase 2 | 0 € | Website-Integration, Automatisierung, Archiv |
| Phase 3 | +4 €/Monat | Matrix, KI, WhatsApp-Bridge |
| Phase 4 | +2-5 €/Monat | Nextcloud, volle Automatisierung |

**Gesamtkosten bei vollem Ausbau:** ~10–13 €/Monat (statt 3,99 €) — immer noch deutlich günstiger als kommerzielle Vereinssoftware.

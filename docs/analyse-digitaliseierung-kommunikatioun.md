# Analys: Mersch75 Digitaliséierung & Kommunikatioun (PDF) vs. Vereins-OS App

> **Erstellt:** 16. Juli 2026  
> **Aktualiséiert:** 16. Juli 2026 (nei PDF-Versioun mat Text)  
> **Quell-PDF:** `docs/Mersch75 Digitaliséierung & Kommunikatioun.pdf` (8 Seiten)  
> **Ziel:** Prüfung ob die PDF-Strategie zur App-Struktur und Hetzner-Integration passt, und wie leicht umsetzbar.

---

## 1. Inhalt des PDFs (aktualiséiert)

Die PDF ist eine 8-seitige Präsentation über die Professionalisierung der Kommunikation von Mersch75:

| Seite | Thema | Inhalt |
|---|---|---|
| 1 | **Titel** | "Mersch75 Digitaliséierung — Professionaliséierung vun eiser Kommunikatioun" — E-Mail-Struktur, WhatsApp-Reegelen & M75-Manager App (Hetzner), Juli 2026 |
| 2 | **Eis Ziler** | 4 Ziler: ① Distanzéierung (Trennung vun Amateur-Elementer an Aussewierkung), ② Professionalitéit (seriös Äntwerten), ③ Zentraliséierung (@mersch75.lu als Standard), ④ App-Viraussetzung (Mail-System als Fundament fir M75-Manager App) |
| 3 | **Partner & Zukunft** | Mixvoip sponsert e professionellt Mail-System; M75-Manager App gëtt op Hetzner gehost. Mail-System ass d'Fundament fir d'Zukunft |
| 4 | **E-Mail Architektur** | Vollwäerteg Postfächer (IMAP/SMTP) statt Weiderleitungen. 3 Prinzipien: ① Synchronisatioun (gesinn ob Mail gelies/beäntwert), ② Transparenz (Gesend-Ordner fir Team), ③ Cheffunktioun (1 Chef pro Adress äntwert) |
| 5 | **Helperteams (I)** | `info@` (Virginio C. [CHEF], Peter M., Marc E., Adrien D.), `medico@` (Virginio C. [CHEF], Adrien D.), `tresorerie@` (Ben B. [CHEF], Jeff S.), `jugend@` (Max B. [CHEF], Louis v.d.W., Anne B.-H.), `seniors@` (Sascha M. [CHEF], Katarzyna P., Charly E., Samantha D.) |
| 6 | **Helperteams (II)** | `sponsoring@` (Max B. [CHEF], Jeff S., Ben B.), `events@` (Jean-Luc G. [CHEF]), `webmaster@` (Adrien D. [CHEF], Jeff S.), `sbo@` (Ben M. [CHEF], Xavier M.), `socialmedia@` (Jeff S. [CHEF], Adrien D.) |
| 7 | **WhatsApp Richtlinnen** | 4 Reegelen: ① Extern (verbued mat Sponsoren/FLH/Gemeng via WhatsApp), ② Intern (logistesch, zäitkritesch Matdeelungen), ③ Dokumentatioun (Entscheedungen per E-Mail confirméieren), ④ Broadcast (Gruppen op "Nëmmen Admins kënne schécken") |
| 8 | **Next Steps** | ① Cheffunktioune definitiv zouweisen, ② Fräi Plaze besetzen (events@, tresorerie@, etc.), ③ Zoustëmmung fir WhatsApp-Reegelen validéieren, ④ Technesch Implementatioun (Mixvoip & Hetzner) |

---

## 2. E-Mail-Adressen (vollstänneg Lëscht)

| Adress | Chef | Team-Memberen | Am Projet? |
|---|---|---|---|
| `info@mersch75.lu` | Virginio C. | Peter M., Marc E., Adrien D. | ✅ Bereets am Code |
| `medico@mersch75.lu` | Virginio C. | Adrien D. | 🟡 Teilweis (jugend@ am Code) |
| `tresorerie@mersch75.lu` | Ben B. | Jeff S. | 🟡 kassenwart@ am Code |
| `jugend@mersch75.lu` | Max B. | Louis v.d.W., Anne B.-H. | ✅ Bereets am Code |
| `seniors@mersch75.lu` | Sascha M. | Katarzyna P., Charly E., Samantha D. | 🔴 Feelt |
| `sponsoring@mersch75.lu` | Max B. | Jeff S., Ben B. | 🔴 Feelt |
| `events@mersch75.lu` | Jean-Luc G. | (+1 gesicht) | 🔴 Feelt |
| `webmaster@mersch75.lu` | Adrien D. | Jeff S. | 🔴 Feelt |
| `sbo@mersch75.lu` | Ben M. | Xavier M. | 🔴 Feelt |
| `socialmedia@mersch75.lu` | Jeff S. | Adrien D. | 🔴 Feelt |

---

## 3. Vergleich mit der App-Struktur

### 3.1 Was bereits passt ✅

| PDF-Konzept | App-Status | Bewertung |
|---|---|---|
| **Zentrale Datenbank** | SQLite via Drizzle ORM, 555 aktive Mitglieder | ✅ Perfekt |
| **Rollenbasierter Zugriff** | Präsident, Admin, Trainer, Secrétaire, Kassenwart, Spieler | ✅ Implementiert |
| **@mersch75.lu als Standard** | Alle E-Mails nutzen mersch75.lu Domain | ✅ Bereits so |
| **Finanzen & Budget** | Echte Vereinsdaten, 7 Konten, Budget 2026-27 | ✅ Implementiert |
| **Médico-Modul** | Convocation + Resultate, mehrsprachig | ✅ Implementiert |
| **Docker + Hetzner** | docker-compose.yml mit m75-manager + nginx, CX23 Server | ✅ Bereits eingerichtet |
| **Mixvoip Partner** | PROJEKTPLAN: SMS Gateway (Mixvoip) — wartet auf Zugangsdaten | ✅ Geplant |

### 3.2 Was teilweise passt 🟡

| PDF-Konzept | App-Status | Bedarf |
|---|---|---|
| **Vollwäerteg Postfächer (IMAP/SMTP)** | App nutzt SMTP für E-Mail-Versand | 🟡 IMAP-Empfang noch nicht integriert |
| **Cheffunktioun pro Adress** | Rollenbasiertes System vorhanden | 🟡 Mapping Chef → E-Mail-Adress fehlt |
| **E-Mail-Gruppen automatisch** | PROJEKTPLAN §5.9: geplante Gruppen | 🟡 Noch nicht automatisch generiert |
| **Website-App Integration** | PROJEKTPLAN §5.1: REST-API geplant | 🟡 Noch nicht exponiert |
| **PWA / Mobile App** | §5.10 geplant | 🟡 PWA-Manifest fehlt |

### 3.3 Was noch fehlt 🔴

| PDF-Konzept | Bedarf |
|---|---|
| **10 E-Mail-Adressen als IMAP-Postfächer** | Mixvoip-Setup + App-Integration |
| **WhatsApp-Reegelen** | Organisatorisch, nicht technisch (Broadcast-Gruppen) |
| **Öffentliche REST-API** | Express-Routen in der App |
| **n8n Workflow-Automatisierung** | Docker-Container auf Hetzner |
| **Uptime Kuma Monitoring** | Docker-Container auf Hetzner |

---

## 4. Integration bei Hetzner — Machbarkeit

### 4.1 Server-Eckdaten

| | |
|---|---|
| **Server** | Hetzner Cloud CX23 |
| **IP** | 178.105.40.239 |
| **Ressourcen** | 2 vCPU · 4 GB RAM · 40 GB Disk |
| **Kosten** | 3,99 €/Monat |
| **Aktuell** | Nginx + Node.js App (pm2, errored) |
| **frei** | ~31% Disk belegt, ~2 GB RAM frei |

### 4.2 Was leicht umzusetzen ist (niedriges Ressourcen-Bedürfnis)

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

#### E-Mail-Adressen in App einpflegen — keine Server-Ressourcen
- 10 Adressen als Konstante/Datenbank-Tabelle
- Mapping zu Helperteam-Chefs

### 4.3 Was schwieriger ist (hohes Ressourcen-Bedürfnis)

| Komponente | RAM-Bedarf | Problem auf CX23 (4 GB) | Alternative |
|---|---|---|---|
| **Matrix/Synapse** | 500-800 MB | Eng mit bestehender App | Server-Upgrade |
| **Ollama** | 1-2 GB | Zu viel für CX23 | Externe API oder größerer Server |
| **Mailcow** | 1-2 GB+ | Empfohlen 6 GB+ | Mixvoip (wie im PDF vorgesehen!) |

> **Wichteg:** D'PDF seet schon datt Mixvoip d'Mail-System sponsert — deemno brauch mir **kee eegene Mail-Server** op Hetzner! Dat spuet RAM a Käschten.

---

## 5. Empfehlung: Phasierter Umsetzungsplan

### Phase 1 — Sofort (keine zusätzlichen Ressourcen)
- [ ] Alle 10 E-Mail-Adressen in Vereins-OS einpflegen (Tabelle/Konstante)
- [ ] `socialmedia@mersch75.lu` auf Website (Footer) hinzufügen
- [ ] Öffentliche REST-API exponieren (Tabelle, Spielplan, Stats)
- [ ] PWA-Manifest + Service Worker für Mobile
- [ ] Uptime Kuma als Docker-Container
- [ ] n8n für Basis-Workflows

### Phase 2 — Kurzfristig (Mixvoip + minimale Ressourcen)
- [ ] Mixvoip IMAP-Postfächer einrichten (10 Adressen)
- [ ] App an Mixvoip SMTP anbinden (statt eigenem Mail-Server)
- [ ] Website-Integration: mersch75.lu `fetch()` → API-Endpoints
- [ ] Automatisierungs-Jobs: n8n Workflows (Geburtstag, Mahnungen)
- [ ] Saison-Archiv-Modul in der App

### Phase 3 — Mittelfristig (Server-Upgrade)
- [ ] **Server Upgrade**: CX23 → CX32 (4 vCPU, 8 GB RAM) für ~7,99 €/Monat
- [ ] Matrix/Synapse selbst hosten
- [ ] Ollama mit kleinem Modell (phi3) für RAG
- [ ] WhatsApp-Bridge (mautrix)

### Phase 4 — Langfristig
- [ ] Nextcloud für Dokumenten-Ablage
- [ ] Playwright Browser-Automatisierung
- [ ] PostgreSQL Migration
- [ ] Native Mobile App (React Native)

---

## 6. Konklusion

D'nei PDF ass **méi konkreit** wéi d'éischt Versioun — et geet virun allem ëm **E-Mail-Professionaliséierung** mat Mixvoip an d'**M75-Manager App** op Hetzner. D'Ziler (Distanzéierung, Professionalitéit, Zentraliséierung, App-Viraussetzung) passen perfekt zum Projet.

**Schlüsselelementer:**
- **Mixvoip** sponsert d'Mail-System → kee eegene Mail-Server noutwendeg (spuet RAM!)
- **10 E-Mail-Adressen** mat Cheffunktiounen → mussen an App & Website integréiert ginn
- **WhatsApp-Reegelen** sinn organisatoresch, net technesch
- **Hetzner** bleift d'Plattform fir d'App → phaséiert Ausbau wéi am PROJEKTPLAN

**Käschten-Iwwersiicht:**

| Phase | Zusätzliche Kosten | Was wird möglich |
|---|---|---|
| Phase 1 | 0 € | E-Mail-Adressen, API, PWA, Monitoring, n8n |
| Phase 2 | 0 € (Mixvoip gesponsert) | IMAP-Postfächer, Website-Integration, Automatisierung |
| Phase 3 | +4 €/Monat | Matrix, KI, WhatsApp-Bridge |
| Phase 4 | +2-5 €/Monat | Nextcloud, volle Automatisierung |

**Gesamtkosten bei vollem Ausbau:** ~10–13 €/Monat — immer noch deutlich günstiger als kommerzielle Vereinssoftware.

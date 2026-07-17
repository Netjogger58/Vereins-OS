# M75-Manager Hetzner Deployment — 17. Juli 2026

## Server-Daten

- **Server-IP:** `178.105.40.239`
- **Hostname:** `mersch75-vps`
- **OS:** Ubuntu 24.04.4 LTS
- **SSH-Alias:** `m75-hetzner` (in `~/.ssh/config`)
- **App-Verzeichnis:** `/root/m75-manager`
- **Alte Installation (Backup):** `/root/mersch75v2-old`
- **DB-Backup lokal:** `~/Desktop/backup-hetzner-20260717.db`
- **App-URL (vorläufig):** `http://178.105.40.239`
- **App-URL (geplant):** `https://manager.mersch75.lu`

---

## Was am 17.07.2026 erledigt wurde

### 1. SSH-Zugang eingerichtet
- Ed25519 SSH-Key generiert: `~/.ssh/m75-hetzner` (ohne Passphrase)
- SSH-Config-Eintrag für `m75-hetzner` angelegt
- Public Key auf dem Server in `~/.ssh/authorized_keys` hinterlegt
- Passwortloser Login funktioniert: `ssh m75-hetzner`

### 2. Server abgesichert
- **Firewall (UFW):** Nur Port 22 (SSH), 80 (HTTP), 443 (HTTPS) offen
- **SSH-Password-Login deaktiviert:** Nur noch Key-basierte Anmeldung möglich
- Befehl: `sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config`

### 3. App auf Server deployt
- Alte Installation nach `/root/mersch75v2-old` verschoben
- Neue Installation in `/root/m75-manager` per `rsync` aufgespielt
- `npm install` + `npm run build` auf dem Server ausgeführt
- **PM2** als Process Manager: App startet automatisch nach Reboot
- **Nginx** als Reverse Proxy: `http://178.105.40.239 → localhost:3000`
- Alte Nginx-Configs (`m75manager`, `mersch75`) entfernt, nur `m75` aktiv

### 4. Datenbank migriert
- Lokale DB (1015 Mitglieder, 9 Teams) auf Server übertragen
- **Wichtig:** Vor dem Kopieren müssen WAL/SHM-Dateien auf dem Server gelöscht werden, sonst greift SQLite auf alte WAL-Daten zu
- Korrekter Workflow:
  ```bash
  ssh m75-hetzner "pm2 stop m75-manager && rm -f /root/m75-manager/data.db /root/m75-manager/data.db-wal /root/m75-manager/data.db-shm"
  scp /Users/netjogger58/CascadeProjects/Vereins-OS/data.db m75-hetzner:/root/m75-manager/data.db
  ssh m75-hetzner "pm2 start m75-manager"
  ```

### 5. Code-Fixes
- **`server/storage.ts`:** Migration für fehlende Spalten ergänzt (`medico_list`, `medico_comment`, `medico_result`, `medico_result_date`, `extra_team_ids`)
- **`server/security.ts`:** `enforceHttps` Middleware mit `DISABLE_HTTPS_REDIRECT=true` Umgehung (bis HTTPS eingerichtet ist)
- **API-Token System:** `api_tokens` Tabelle, `requireApiToken` Middleware, Admin-Endpoints, öffentliche API-Endpoints

### 6. Trainer-Passwörter zurückgesetzt
- Alle Trainer-Passwörter auf `mersch75` gesetzt (da alte Passwörter nicht bekannt waren)
- Script: `/tmp/reset.js` → als `.cjs` auf Server ausführen (CommonJS, da `package.json` `"type": "module"`)
- **Trainer müssen ihr Passwort beim ersten Login ändern!**

### 7. `.env` auf dem Server
- `NODE_ENV=production`
- `PORT=3000`
- `HOST=127.0.0.1`
- `ADMIN_PASSWORD=mersch75`
- `SESSION_SECRET=<random hex>`
- `WEBSITE_ORIGIN=https://manager.mersch75.lu,http://178.105.40.239`
- `DISABLE_HTTPS_REDIRECT=true` (bis HTTPS aktiv ist)

---

## Noch zu erledigen

### A. DNS bei Restena.lu einrichten
1. Einloggen auf **https://my.restena.lu** (oder das entsprechende DNS-Portal von Restena)
2. Neuen **A-Record** anlegen:
   - **Typ:** A
   - **Name/Host:** `manager`
   - **Wert/IP:** `178.105.40.239`
   - **TTL:** 3600 (Standard)
3. Speichern und 5–30 Minuten warten
4. Prüfen (auf dem Mac):
   ```bash
   dig manager.mersch75.lu +short
   ```
   Sollte `178.105.40.239` zurückgeben.

### B. HTTPS mit Certbot einrichten (nach DNS)
1. Certbot installieren:
   ```bash
   ssh m75-hetzner "apt-get install -y certbot python3-certbot-nginx"
   ```
2. SSL-Zertifikat erstellen:
   ```bash
   ssh m75-hetzner "certbot --nginx -d manager.mersch75.lu"
   ```
   - E-Mail-Adresse angeben
   - AGBs zustimmen
   - Weiterleitung von HTTP auf HTTPS bestätigen
3. `DISABLE_HTTPS_REDIRECT` aus `.env` entfernen:
   ```bash
   ssh m75-hetzner "sed -i '/DISABLE_HTTPS_REDIRECT/d' /root/m75-manager/.env && pm2 restart m75-manager"
   ```
4. Testen: `https://manager.mersch75.lu`

### C. Trainer-Passwörter ändern lassen
- Alle Trainer haben vorübergehend das Passwort `mersch75`
- **Jeder Trainer muss sein Passwort beim ersten Login ändern:**
  1. Einloggen mit E-Mail + `mersch75`
  2. Auf **Profil**-Seite gehen
  3. Neues Passwort setzen
- Falls ein Trainer sein Passwort vergessen hat, kann es zurückgesetzt werden:
  ```bash
  echo 'const b=require("bcryptjs");const d=require("better-sqlite3")("data.db");d.prepare("UPDATE users SET password_hash=? WHERE email=?").run(b.hashSync("NEUES_PASSWORT",10),"email@mersch75.lu");console.log("ok")' > /tmp/reset.js
  scp /tmp/reset.js m75-hetzner:/root/m75-manager/reset.cjs
  ssh m75-hetzner "cd /root/m75-manager && node reset.cjs && rm reset.cjs"
  ```

### D. API-Token erstellen und testen
1. Als Präsident einloggen
2. Token erstellen (Admin-Endpoint):
   ```bash
   curl -X POST http://178.105.40.239/api/admin/tokens \
     -H "Content-Type: application/json" \
     -b "connect.sid=<SESSION_COOKIE>" \
     -d '{"name":"Website-Integration","scopes":["read:events","read:teams"]}'
   ```
3. Token testen:
   ```bash
   curl -H "Authorization: Token <TOKEN>" http://178.105.40.239/api/public/events
   ```

### E. hcloud CLI (optional, niedrige Priorität)
- Hetzner Cloud CLI für Server-Management
- Installation: `npm install -g hcloud-cli` oder Binary von GitHub
- API-Token im Hetzner Cloud Console erstellen

---

## Update-Workflow (für künftige Code-Änderungen)

```bash
# Auf dem Mac:
cd /Users/netjogger58/CascadeProjects/Vereins-OS
npm run build
rsync -avz --exclude node_modules --exclude .git --exclude '*.db*' dist/ m75-hetzner:/root/m75-manager/dist/
ssh m75-hetzner "pm2 restart m75-manager"
```

## DB-Update-Workflow (Datenbank auf Server aktualisieren)

```bash
# Auf dem Mac:
sqlite3 /Users/netjogger58/CascadeProjects/Vereins-OS/data.db "PRAGMA wal_checkpoint(TRUNCATE);"
ssh m75-hetzner "pm2 stop m75-manager && rm -f /root/m75-manager/data.db /root/m75-manager/data.db-wal /root/m75-manager/data.db-shm"
scp /Users/netjogger58/CascadeProjects/Vereins-OS/data.db m75-hetzner:/root/m75-manager/data.db
ssh m75-hetzner "pm2 start m75-manager"
```

## Log-Prüfung (Fehler analysieren)

```bash
ssh m75-hetzner "pm2 logs m75-manager --lines 30 --nostream"
```

## PM2-Befehle

```bash
ssh m75-hetzner "pm2 status"          # Status anzeigen
ssh m75-hetzner "pm2 restart m75-manager"  # Neustart
ssh m75-hetzner "pm2 stop m75-manager"    # Stoppen
ssh m75-hetzner "pm2 start m75-manager"   # Starten
ssh m75-hetzner "pm2 logs m75-manager --nostream"  # Logs anzeigen
ssh m75-hetzner "pm2 flush m75-manager"   # Logs löschen
```

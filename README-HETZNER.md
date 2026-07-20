# M75 Manager — Deployment auf Hetzner VPS

> **Automatisch:** Jeder `push` auf `main` wird via GitHub Actions direkt auf Hetzner deployed. Manuelle Schritte sind nur für das initiale Setup nötig.

## 1. Hetzner Server bestellen

1. Gehe zu [hetzner.com/cloud](https://www.hetzner.com/cloud)
2. Neues Projekt erstellen → **"Add Server"**
3. Empfohlene Konfiguration:
   - **Location:** Nuremberg oder Helsinki
   - **Image:** Ubuntu 24.04
   - **Type:** CX21 (2 vCPU, 4 GB RAM) — ca. 4,15 €/Monat
4. SSH-Key hinzufügen
5. Server erstellen → du erhältst eine **IP-Adresse** (z.B. `95.216.xxx.xxx`)

---

## 2. Verbindung zum Server herstellen

```bash
ssh root@95.216.xxx.xxx
```

---

## 3. Node.js installieren

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node -v   # sollte v22.x zeigen
```

---

## 4. Projekt auf dem Server anlegen

```bash
mkdir -p /root/m75-manager
cd /root/m75-manager
git clone https://github.com/Netjogger58/Vereins-OS.git .
npm install
npm run build
```

---

## 5. App dauerhaft laufen lassen (PM2)

```bash
npm install -g pm2
pm2 start dist/index.cjs --name "m75-manager"
pm2 startup    # automatisch beim Server-Neustart starten
pm2 save
pm2 status     # Status prüfen
```

---

## 6. GitHub Actions Secrets setzen

Im GitHub-Repository unter **Settings → Secrets and variables → Actions** diese 3 Secrets anlegen:

| Secret | Wert |
|--------|------|
| `HETZNER_HOST` | IP-Adresse des Servers (`95.216.xxx.xxx`) |
| `HETZNER_SSH_KEY` | Inhalt des privaten SSH-Keys |
| `ADMIN_PASSWORD` | Passwort für die Auto-Admin-Accounts (optional, Default: `Mersch75!`) |

Ab jetzt wird jeder Push auf `main` automatisch deployed.

---

## 7. Firewall öffnen

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3000  # App (temporär zum Testen)
ufw enable
```

---

## 9. Eigene Domain einrichten (optional)

### DNS-Eintrag bei deinem Domain-Anbieter:
```
Typ: A
Name: manager   (oder @)
Wert: 95.216.xxx.xxx
TTL: 3600
```

Ergebnis: `manager.mersch75.lu` zeigt auf deinen Server

---

## 10. HTTPS mit Nginx + Let's Encrypt (empfohlen)

```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

Nginx-Konfiguration erstellen:
```bash
nano /etc/nginx/sites-available/m75manager
```

Inhalt einfügen:
```nginx
server {
    listen 80;
    server_name manager.mersch75.lu;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/m75manager /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# HTTPS-Zertifikat (kostenlos):
certbot --nginx -d manager.mersch75.lu
```

Die App ist jetzt erreichbar unter: **`https://manager.mersch75.lu`** ✅

---

## 10. Datenbank sichern

Die Datenbank liegt unter `/root/m75-manager/data.db`.

Regelmässiges Backup von deinem Mac:
```bash
scp root@95.216.xxx.xxx:/root/m75-manager/data.db ~/Desktop/backup-$(date +%Y%m%d).db
```

Oder auf dem Server ein tägliches Backup einrichten:
```bash
crontab -e
# Folgende Zeile hinzufügen (täglich um 2 Uhr):
0 2 * * * cp /root/m75-manager/data.db /root/backups/data-$(date +\%Y\%m\%d).db
```

---

## 11. Troubleshooting

### Deploy schlägt fehl
Im GitHub-Repository unter **Actions → Deploy to Hetzner** das fehlgeschlagene Workflow-Log öffnen. Dort wird automatisch ein `dist`-Backup erstellt und `pm2 logs` angezeigt.

### Login geht nicht
- Admin-Accounts werden bei jedem Server-Start auf `ADMIN_PASSWORD` zurückgesetzt.
- Falls `ADMIN_PASSWORD` nicht gesetzt ist, ist das Default-Passwort: `Mersch75!`.
- User: `deisje@hotmail.com` oder `m75.deisad@gmail.com`.

### App läuft nicht nach Neustart
```bash
ssh root@95.216.xxx.xxx
pm2 status
pm2 restart m75-manager
```

---

## Zusammenfassung

| Schritt | Was passiert |
|---------|-------------|
| 1–2 | Server mieten & verbinden |
| 3–5 | Node.js + PM2 einrichten |
| 6 | GitHub Actions Secrets setzen |
| 7 | Firewall schützt den Server |
| 8–9 | Eigene Domain + HTTPS |
| 10 | Datenbank regelmässig sichern |
| 11 | Troubleshooting |

**Support:** Bei Fragen einfach den IT-Verantwortlichen oder Cascade fragen 🙂

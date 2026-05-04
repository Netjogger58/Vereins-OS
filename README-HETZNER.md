# M75 Manager — Deployment auf Hetzner VPS

## 1. Hetzner Server bestellen

1. Gehe zu [hetzner.com/cloud](https://www.hetzner.com/cloud)
2. Neues Projekt erstellen → **"Add Server"**
3. Empfohlene Konfiguration:
   - **Location:** Nuremberg oder Helsinki
   - **Image:** Ubuntu 24.04
   - **Type:** CX21 (2 vCPU, 4 GB RAM) — ca. 4,15 €/Monat
4. SSH-Key hinzufügen (oder Passwort wählen)
5. Server erstellen → du erhältst eine **IP-Adresse** (z.B. `95.216.xxx.xxx`)

---

## 2. Verbindung zum Server herstellen

```bash
ssh root@95.216.xxx.xxx
```

---

## 3. Node.js installieren

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # sollte v20.x zeigen
```

---

## 4. Projekt hochladen

### Option A — ZIP per SCP (von deinem Mac)
```bash
# Auf deinem Mac ausführen:
scp ~/Desktop/mersch75-manager.zip root@95.216.xxx.xxx:/root/
```

### Option B — Per SFTP-Client
- FileZilla oder Cyberduck verwenden
- ZIP nach `/root/` hochladen

### Dann auf dem Server entpacken:
```bash
apt-get install -y unzip
cd /root
unzip mersch75-manager.zip
cd mersch75v2
```

---

## 5. Abhängigkeiten installieren & bauen

```bash
npm install
npm run build
```

---

## 6. App starten (Test)

```bash
npm start
```

Die App läuft jetzt auf Port 3000. Test im Browser: `http://95.216.xxx.xxx:3000`

---

## 7. App dauerhaft laufen lassen (PM2)

```bash
npm install -g pm2
pm2 start npm --name "m75-manager" -- start
pm2 startup    # automatisch beim Server-Neustart starten
pm2 save
pm2 status     # Status prüfen
```

---

## 8. Firewall öffnen

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

## 11. Datenbank sichern

Die Datenbank liegt unter `/root/mersch75v2/data.db`.

Regelmässiges Backup von deinem Mac:
```bash
scp root@95.216.xxx.xxx:/root/mersch75v2/data.db ~/Desktop/backup-$(date +%Y%m%d).db
```

Oder auf dem Server ein tägliches Backup einrichten:
```bash
crontab -e
# Folgende Zeile hinzufügen (täglich um 2 Uhr):
0 2 * * * cp /root/mersch75v2/data.db /root/backups/data-$(date +\%Y\%m\%d).db
```

---

## Zusammenfassung

| Schritt | Was passiert |
|---------|-------------|
| 1–2 | Server mieten & verbinden |
| 3–6 | Node.js + App installieren |
| 7 | App läuft dauerhaft (auch nach Neustart) |
| 8 | Firewall schützt den Server |
| 9–10 | Eigene Domain + HTTPS |
| 11 | Datenbank regelmässig sichern |

**Support:** Bei Fragen einfach den IT-Verantwortlichen oder Cascade fragen 🙂

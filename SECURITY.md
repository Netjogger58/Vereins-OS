# M75 Manager - Sicherheit & Deployment

## 🔒 Sicherheitsfeatures

### Aktive Schutzmaßnahmen
- **Rate Limiting**: 100 Requests pro 15 Minuten pro IP (automatische Blockierung bei Überschreitung)
- **Bedrohungserkennung**: Automatische Erkennung von SQL-Injection, XSS, Path Traversal
- **Security Headers**: X-Frame-Options, CSP, HSTS, X-Content-Type-Options
- **Audit-Logging**: Alle Sicherheitsrelevanten Events werden protokolliert
- **Bot-Erkennung**: Erkennung von SQLMap, Nikto, Nmap und anderen Angriffstools

### Überwachte Events
- `THREAT_DETECTED`: Angriffsversuche erkannt
- `AUTH_FAILURE`: Fehlgeschlagene Login-Versuche
- `RATE_LIMIT_EXCEEDED`: Zu viele Requests
- `RATE_LIMIT_BLOCKED`: Geblockte IPs
- `SENSITIVE_ACCESS`: Zugriff auf sensitive Bereiche

### Audit-Log API (nur für Admin/Präsident)
```
GET /api/audit-logs?severity=HIGH&limit=50
GET /api/audit-logs/critical
POST /api/audit-logs/:id/mark-sent
```

## 🐳 Docker Deployment

### Schnellstart
```bash
# Docker Compose starten
docker-compose up -d

# Mit SSL (optional)
docker-compose --profile with-ssl up -d
```

### Umgebungsvariablen
| Variable | Beschreibung | Standard |
|----------|-------------|----------|
| `NODE_ENV` | production/development | production |
| `PORT` | Server-Port | 5000 |
| `AUDIT_LOG_ENABLED` | Audit-Logging aktiv | true |
| `RATE_LIMIT_ENABLED` | Rate Limiting aktiv | true |

### Email-Benachrichtigungen (Vorbereitet)
Folgende Variablen sind vorbereitet, aber noch nicht aktiv:
```bash
EMAIL_ALERTS_ENABLED=false
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=alert@mersch75.lu
EMAIL_SMTP_PASS=secret
EMAIL_ALERT_RECIPIENT=admin@mersch75.lu
```

## 🛡️ Hacker-Abwehr

### Automatische Reaktionen
1. **Angriffserkennung**: IP wird protokolliert, Admin kann blockieren
2. **Rate Limiting**: IP wird 1 Stunde blockiert
3. **SQL-Injection**: Request wird abgelehnt, IP geloggt
4. **Brute Force**: Nach 100 Versuchen 1h Block

### Manuelle Maßnahmen
```sql
-- Angriffs-IPs anzeigen
SELECT ip_address, COUNT(*) as attempts 
FROM audit_logs 
WHERE severity = 'HIGH' 
GROUP BY ip_address 
ORDER BY attempts DESC;
```

## 📋 Systemanforderungen
- **RAM**: Min. 512MB (1GB empfohlen)
- **Storage**: 1GB für DB + Uploads
- **CPU**: 1 Core ausreichend
- **OS**: Linux (Ubuntu 20.04+), macOS, Windows mit WSL2

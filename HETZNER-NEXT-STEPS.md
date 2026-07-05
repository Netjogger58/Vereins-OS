# M75-Manager auf Hetzner — Nächste Schritte

> Notiz für die nächste Sitzung (Stand: 30.06.2026). Damit auch ein neuer Chat sofort den Kontext hat.

## Server-Eckdaten
- **Name:** `mersch75-vps`
- **IP:** `178.105.40.239`
- **Typ:** Hetzner Cloud CX23 · 2 vCPU · 4 GB RAM · 40 GB · Nürnberg
- **Kosten:** 3,99 €/Monat
- **Login:** Benutzer `root`, per Passwort (SSH). Status: läuft (grün).
- **Hetzner-Projekt:** das mit dem Server (NICHT "konsoleH"); Konto-Inhaber: Adrien Deischter.

## Aktueller Stand auf dem Server (bereits eingerichtet)
- Node.js v22, Nginx aktiv.
- App liegt in `/root/mersch75v2` (+ `/root/mersch75-manager.zip`).
- Datenbank: `/root/mersch75v2/data.db` (ENTHÄLT ECHTE VEREINSDATEN!).
- Genug Speicher frei (~31 % belegt).
- **Problem:** pm2-Prozess `m75-manager` steht auf **`errored`** (33 Neustarts) → App startet nicht.

## Login-Problem (Blocker)
- root+Passwort funktioniert prinzipiell, aber wiederholtes "Reset root password" hat mehrere
  temporäre Passwörter erzeugt → durcheinander.
- **Regel fürs nächste Mal:** Passwort **GENAU EINMAL** zurücksetzen und **sofort** einloggen,
  NICHT erneut resetten. Idealerweise mit Jeff (hat den Server eingerichtet, kennt evtl. das PW).
- Mein lokaler SSH-Public-Key (zum Hinterlegen, dann nie wieder Passwort):
  `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBzULkeEr0ta4RkeNcoeqihYhiU2KSP6WKscXFaifVs5 github-automation`
- Tastatur-Hinweis: Hetzner-Browser-Konsole nutzt US-Layout → Tippfehler bei Sonderzeichen/y-z.
  Deshalb SSH + Copy-Paste bevorzugen.

## Vereinbarter Plan (vom User bestätigt)
1. **Login herstellen** + SSH-Key hinterlegen.
2. **`data.db` sichern** (Backup auf den Mac), z.B.:
   `scp root@178.105.40.239:/root/mersch75v2/data.db ~/Desktop/backup-$(date +%Y%m%d).db`
3. **Alten, kaputten Manager löschen** und **frisch von GitHub** neu aufsetzen
   (sauberer Stand statt am Absturz herumdoktern), gesicherte `data.db` wieder einspielen.
4. **Starten & prüfen** (`pm2 status`), dann Erreichbarkeit über Nginx/Domain.

## Offen / später
- Domain `mersch75.lu`: Hetzner meldet "Fehlerhafte Zonen-Delegierung" (Nameserver zeigen woanders).
  Für eine Subdomain wie `manager.mersch75.lu` muss der DNS-Eintrag dort gesetzt werden,
  wo die Domain wirklich verwaltet wird.
</CodeContent>
<parameter name="EmptyFile">false

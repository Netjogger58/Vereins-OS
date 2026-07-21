# Vereins-OS – Features & Méiglechkeeten

**Vereins-OS** ass eng All-in-One Vereinsmanagement-App fir Handball-Clibb (optiméiert fir Mersch 75), inspiréiert vum **SpielerPlus Premium** Look & Feel.

---

## Rollen & Berechtigungen

D'App ënnerstëtzt Rollen mat graduéierte Rechter:

- **Präsident / Admin** – alles
- **Kassenwart** – Finanzen, Memberdaten, Rechnungen
- **Secrétaire** – Sekretariat, Memberen, Dokumenter
- **Trainer** – Equippen, Training, Aufstellung, Anwesenheet
- **Spiller** – eegen Eventer, Chat, Nominatiounen, Statistiken
- **Elterenteil** – Kanner iwwerblécken, Zou/Absage setzen, Chat

---

## Memberen & Sekretariat

- Memberendatabank mat **FLH-Import** a Kategorien (U4 bis Seniors, H/D)
- **Familljen-Codes** (`Fxx`) fir Gruppéierung vu Kanner an Elteren
- Member-Fotoen, QR/Chipkaarten, Lizenznummern, Adressen
- Sekretariat-Übersicht mat Sich, Filter, CSV-Export
- Medico-Status, Passnummer, Nationalitéit, Schoulstatut
- Massenoperatiounen an Member-Import/Export
- Audit-Logs fir wichteg Ännerungen

---

## Equippen, Training & Anwesenheet

- **Equippen-Übersicht** als Kaart-Gitter
- Spiller-Zouweisung, Zousätzlech Teamen (`extraTeamIds`)
- **Anwesenheet** per Gruppenfoto + Gesichtserkennung oder manuell (List/Tile)
- **Trainer-Events** (`/trainer-events`) mat Zou/Absage-Toggles pro Spiller
- **Event-Gruppen** fir intern Gruppen an Training/Eventer
- **Trainingpläng & Übungen**
- Probetraining/Umeldungen (**Trial Registrations**)

---

## Spillbetrib & Matchwiesen

- **Matches** (Termin, Resultat, Live-Status, Zäit, Halle)
- **Live-Match** mat Egoalen, Sträifen, Chronik
- **Aufstellung** mat Handball-Formatiounen (drag & drop)
  - Formatounen: `1-6`, `1-3-3`, `1-2-4`
  - Positiounen: TW, LA, RA, RL, RR, KM, RM, LM, HM, ST
- **Spillerstatistiken** (`/player-statistics`)
  - Torschützen-Rangliste als Kaarten
  - Filter no Saison, Wettbewerb, Sich
  - CSV-Export
- **Géigner-Verwaltung**
- **Spielplan-Import** (`/schedule-import`) virbereet
  - Import vun `.ics` oder `.csv` an Matcher
  - Preview virun dem Import
- **Tabelle / Standen** per Wettbewerb/Saison

---

## Kommunikation

- **Team-Chat** (`/chat`) mat Echtzeit-Polling
- **Elteren-Chat** fir U11 & jünger
- **Umfragen** (`/polls`) mat Resultats-Balken
- **Announcements** / Mitteilungen
- **Massen-E-Mail**
- **Newsletter**
- **Push-Benachrichtigungen** (VAPID, Service-Worker)
  - Automatesch Abonnement no Login
  - Backend-API fir manuell/Team-notifications

---

## Elteren-Accounts

- **Elteren-Dashboard** (`/parent`)
  - Alle verlinkt Kanner an hiren Terminen uwisen
  - Zou/Absage fir Kanner ofginn
  - Verfügbarkeet pro Event klacken

---

## Terminen & Ressourcen

- **Kalender** mat allen Eventer
- **iCal-Feed** (`/calendar-feed`) fir extern Kalenner
- **Hallen-/Anlagbuchung** (`/facility-bookings`)
- **Duties / Diensten** fir Helfer an Organisatioun
- **Fahrgemeinschaften** (`/carpools`) mat Sëtzplaz-Balken
- **Auto-Assignement** vun Familljen-Codes

---

## Dokumenter & Cloud

- **Dokumenterverwaltung** (`/documents`)
  - Upload vu Verträg, Rechnungen, Urkunden, Protokoller, Sonstiges
  - Sichtbarkeet: Privat / Team / Vorstand / Öffentlech
  - Zuweisung un Memberen
  - Kategorie-Filter

---

## Finanzen & Verwaltung

- **Bank-Import** fir Buchungen
- **Rechnungen**
- **Spenden**
- **Gebühren** (Memberfeeën, Bezuelungen)
- **Budget**
- **Finanz-Übersicht**
- **Inventar**

---

## Weiderer Moduler

- **Shop / Sponsoren**
- **Galerie**
- **Wartelëscht**
- **Archiv**
- **Website-Inhalter**
- **DSGVO-Tools**
- **E-Mail-Einstellungen**
- **Trainer-Codes / PIN-Login**
- **Check-In**
- **Welcome-Mappe**

---

## Premium-Features (SpielerPlus-Styl)

Dës Features goufen an de leschte Sessiounen an de Premium-Styl vu SpielerPlus integréiert:

1. **Trainer-Events mat Zou/Absage**
2. **Handball-Aufstellung-Editor**
3. **Spillerstatistiken als Kaarten**
4. **Team-Chat**
5. **Umfragen**
6. **Duties / Helfer**
7. **Fahrgemeinschaften**
8. **Dokumenten-Cloud**
9. **Event-Gruppen**
10. **Elteren-Dashboard**
11. **Spielplan-Import** (virbereet)
12. **Push-Noriichten**

---

## Technesch Informatioun

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + Drizzle ORM + SQLite
- **Auth:** Sessions + Rollenbaséiert Berechtigungen
- **PWA:** Service-Worker, Offline-Caching (API net gecached)
- **Deploy:** GitHub + Hetzner + PM2

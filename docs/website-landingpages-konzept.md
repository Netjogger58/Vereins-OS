# Konzept: Konvertierende Landingpages für mersch75.lu

## Ziel

Die öffentliche Website soll nicht nur informieren, sondern gezielt Interessenten in Mitgliedschaften, Sponsoring, Spenden und Newsletter-Abonnenten verwandeln. Jede Seite hat **eine klare Zielgruppe und eine einzige Haupt-Handlung (Call-to-Action)**.

---

## 1. Probéieren-Training (Neue Spieler/Eltern)

### Zielgruppe
- Kinder/Jugendliche, die Handball ausprobieren wollen
- Eltern, die einen Verein suchen

### Headline
> „Probéier een Training bei Mersch 75 – gratis & ohne Verpflichtung“

### Inhalt
- 3 Vorteile: fair Play, erfahrene Trainer, gemëschte Teams
- Terminvorschlag: „Nächsten Dienstag, 18:00 Uhr, Hall Mersch“
- Social Proof: Zitat eines aktiven Mitglieds
- Sicherheit: „Keine Kosten, keine Verpflichtung“

### Formularfelder
- Kind: Vorname, Alter
- Erziehungsberechtigter: Name, E-Mail, Telefon
- Gewünschte Altersklasse / Team
- Checkbox: Einwilligung zur Kontaktaufnahme

### Call-to-Action
- Button: **„Platz für Probéieren sichern“**

### Follow-Up
- Automatische Bestätigungs-E-Mail mit Datum, Halle, Ansprechpartner
- Erinnerung 24h vor dem Training
- Intern: Benachrichtigung an den zuständigen Trainer / Sekretär

### Vereins-OS-Integration
- `POST /api/public/donations` ❌ → besser: neuer Endpoint `POST /api/public/trial-registrations`
- oder vorerst: Google-Sheet-Integration (bereits vorhanden)
- langfristig: direkt als neues Mitglied / Warteliste in Vereins-OS

---

## 2. Sponsor werden (Unternehmen & Privatpersonen)

### Zielgruppe
- Lokale Unternehmen
- Ehemalige Spieler/Eltern

### Headline
> „Werden Sie Partner von Mersch 75 – sichtbar für die ganze Region“

### Inhalt
- Sponsoring-Pakete (Bronze/Silber/Gold) mit Vorteilen
- Sichtbarkeit: Banner, Website, Social Media, Matchday
- Steuerliche Vorteile / Gemeinnützigkeit erwähnen

### Formularfelder
- Firma oder Name
- E-Mail / Telefon
- Gewünschtes Paket
- Nachricht (optional)

### Call-to-Action
- Button: **„Sponsor-Paket anfragen“**
- Zweit-CTA: PDF-Broschüre herunterladen

### Follow-Up
- Automatische PDF-Broschüre per E-Mail
- Intern: Benachrichtigung an Präsidenten / Sponsoring-Verantwortlichen
- Angebot innerhalb von 48h

### Vereins-OS-Integration
- `GET /api/public/sponsors` für öffentliche Sponsor-Liste
- Sponsor-Daten laufen zuerst ins Sekretariat, später in Vereins-OS

---

## 3. Spenden-Kampagne (Fans & Unterstützer)

### Zielgruppe
- Fans, Eltern, ehemalige Mitglieder
- Menschen, die den Verein unterstützen wollen

### Headline
> „Unterstütze Mersch 75 – jeder Beitrag hilft“

### Inhalt
- Konkretes Ziel: z. B. „Neue Trikots für die E-Jugend“
- Fortschrittsbalken: bereits gespendet / Zielbetrag
- Transparenz: „Wofür wird das Geld verwendet?“

### Formularfelder
- Name
- E-Mail
- Spendenbetrag
- Zahlungsmethode (Überweisung, PayPal, Stripe)

### Call-to-Action
- Button: **„Jetzt spenden“**

### Follow-Up
- Automatische Dankes-E-Mail
- Spendennachweis / Quittung (Steuer)
- Intern: Übergabe an Kassenwart

### Vereins-OS-Integration
- `POST /api/public/donations` – Spende direkt in Vereins-OS erfassen
- `GET /api/public/donations` – Spendensumme für Fortschrittsbalken abfragen

---

## 4. Newsletter / Fan-Club abonnieren

### Zielgruppe
- Fans, Eltern, ehemalige Spieler
- Leute, die über Spiele und Events informiert bleiben wollen

### Headline
> „Kein Spiel verpassen – Newsletter für Mersch 75 Fans“

### Inhalt
- Was man bekommt: Spielberichte, Termine, Sponsoren-News
- Versprechen: max. 1x pro Woche, jederzeit abbestellbar

### Formularfeld
- E-Mail-Adresse
- Optional: Interessen (Spiele, Jugend, Sponsoring)

### Call-to-Action
- Button: **„Jetzt abonnieren“**

### Follow-Up
- Double-Opt-In bestätigen
- Willkommens-E-Mail mit nächsten Terminen

### Vereins-OS-Integration
- E-Mail-Liste kann in Massen-E-Mail-Modul importiert werden
- iCal-Feed verlinken: `GET /api/calendar/token`

---

## Technische Umsetzung (Jekyll / GitHub Pages)

Da die Website auf **Jekyll/GitHub Pages** läuft, können Landingpages als einfache HTML/Markdown-Seiten mit Inline-JavaScript erstellt werden. Die Formulare werden per `fetch()` an die Vereins-OS-API oder an ein Google-Script gesendet.

### Beispiel: HTML-Snippet für Probéieren-Formular

```html
<form id="trialForm">
  <input name="childName" placeholder="Name des Kindes" required />
  <input type="number" name="age" placeholder="Alter" required />
  <input name="parentName" placeholder="Name Erziehungsberechtigter" required />
  <input type="email" name="email" placeholder="E-Mail" required />
  <input name="phone" placeholder="Telefon" />
  <button type="submit">Platz sichern</button>
</form>

<script>
  document.getElementById('trialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('https://api.mersch75.lu/api/public/trial-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) alert('Danke! Wir melden uns.');
  });
</script>
```

### Tracking

- **UTM-Parameter** in Links aus Social Media / Print verwenden
- Beispiel: `?utm_source=instagram&utm_medium=post&utm_campaign=probetraining2026`
- Einfaches Zählen der Absendungen reicht vorerst

---

## Nächste Schritte

1. **Priorität 1:** Probéieren-Landingpage (höchster Impact für Neumitglieder)
2. **Priorität 2:** Sponsor-Seite (schnelle Einnahmen möglich)
3. **Priorität 3:** Spenden-Kampagne (saisonale Aktionen)
4. **Priorität 4:** Newsletter-Seite (Langzeit-Kontakt zu Fans)

> **Hinweis:** Für Double-Opt-In, automatische E-Mails und Zahlungen braucht es entweder einen externen Dienst (z. B. Brevo, Mailchimp, Stripe) oder eine Erweiterung in Vereins-OS. Die öffentliche API ist bereits vorbereitet.

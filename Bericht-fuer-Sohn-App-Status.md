# Vereins-OS (M75-Manager) – Statusbericht für den Vorstand

**Stand:** 15. Juli 2026  
**Ziel:** Eine übersichtliche Darstellung, was die App heute kann, was die einzelnen Bereiche bedeuten und was als Nächstes ansteht.

---

## 1. Was ist die App überhaupt?

Die App ist der interne Vereins-Manager für **Mersch75**. Alle Daten laufen in einer zentralen Datenbank, die nur für berechtigte Mitglieder erreichbar ist. Man meldet sich mit E-Mail/Passwort, per Karte (QR/Random-No) oder über den versteckten Admin-Login an. Rechte sind rollenbasiert: Präsident, Admin, Sekretär/in, Trainer/in, Spieler/in, Kassenwart usw.

> **Kurz:** Eine Art "Vereins-Office" – Mitglieder, Termine, Finanzen, Spielbetrieb, Kommunikation und Website aus einer Hand.

---

## 2. Das Dashboard – Erklärung der Startseite

Nach dem Login sieht man das Dashboard. Es ist bewusst schlicht gehalten (Widget-Style).

### Begrüßung
- Oben steht je nach Tageszeit **"Gudde Moien"**, **"Gudden Dag"** oder **"Gudden Owend"** mit dem Vornamen des eingeloggten Users.

### Die vier Statistik-Kacheln
| Kachel | Was sie bedeutet | Datenquelle |
|---|---|---|
| **Mitglieder** (blau) | Anzahl der aktiven Vereinsmitglieder | Mitgliederverwaltung |
| **Teams** (gelb) | Anzahl der angelegten Mannschaften | Teamverwaltung |
| **Diese Woche** (grün) | Termine in den nächsten 7 Tagen | Kalender/Events |
| **News** (violett) | Anzahl der Ankündigungen | Ankündigungen |

> Stand heute (Beispiel): **555 aktive Mitglieder**, die reale Saisonliste 2026/27 ist importiert.

### Ankündigungen (linke Spalte)
- Hier erscheinen wichtige interne Nachrichten.
- „Angeheftete“ News werden oben angezeigt.
- Klick auf „Alle anzeigen" führt zur News-Seite.

### Nächste Termine (rechte Spalte)
- Zeigt die nächsten 5 anstehenden Termine (Training, Spiel, Meeting, Event).
- Farbiger Punkt zeigt die Art an: blau = Training, grün = Spiel, violett = Meeting, gelb = Event.
- Ort, Uhrzeit und zugeordnetes Team werden angezeigt.

---

## 3. Module – Was funktioniert bereits?

Die folgende Übersicht nutzt eine einfache Ampel:

- ✅ **Fertig / im Einsatz** – funktioniert und wird genutzt
- 🟡 **Basis vorhanden** – funktioniert, ist aber noch ausbaufähig
- 🔄 **In Arbeit / Geplant** – kommt als Nächstes

---

### Mitglieder & Teams

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Mitgliederliste** | ✅ | Alle Mitglieder anzeigen, suchen, filtern, Details öffnen, bearbeiten, aktiv/inaktiv setzen. |
| **Mitglied-Detail** | ✅ | Persönliche Daten, Vereinsfunktion, Team, Medico-Status, Familienverknüpfung, Beiträge, Anwesenheit. |
| **Teams** | ✅ | Mannschaften anlegen, Trainer zuordnen, Kategorien wählen. |
| **Mitglieder-Import** | ✅ | Excel-Liste der aktiven Mitglieder (Sekretärsliste) importieren. Karten-IDs, Funktionen, Nationalität etc. werden übernommen. |
| **Profil** | ✅ | Eigenes Passwort und eigene Daten ändern. |

> **Besonderheit:** Die App unterscheidet strikt zwischen **aktiven Mitgliedern** und dem **Archiv** (ehemalige Mitglieder). Im Dashboard zählen nur Aktive.

---

### Mitgliederselbstbedienung

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Meine Termine** | ✅ *(neu)* | Spieler/innen sehen ihre anstehenden Mannschafts-Termine und können ihre Verfügbarkeit setzen. |
| **Nominierungs-Antworten** | ✅ *(neu)* | Für ein Spiel nominierte Spieler können direkt „Ja“ oder „Nein“ sagen – inkl. Begründung bei Absage. |
| **Profil & Datenpflege** | 🟡 | Eigenes Profil bearbeiten ist vorbereitet, wird aber noch ausgebaut. |

> Die Selbstbedienung erreichen Mitglieder über den neuen mobilen Tab **„Termine“** oder die Seite **„Meine Termine“**.

---

### Spielbetrieb & Statistik

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Spiele (Matches)** | ✅ | Spiele erfassen, bearbeiten, Resultate eintragen, aus der FLH importieren. |
| **Live-Spielanalyse** | ✅ *(neu)* | Ereignisse live erfassen (Tore, Assists, Karten, 7m etc.) mit Zeitlinie und Statistik. |
| **Statistiken** | ✅ | Ligastatistiken, Tabellen, Team-Bilanzen ansehen. |
| **Spielerstatistiken** | ✅ | Top-Scorer, persönliche Tore pro Spieler/in. |
| **Aufstellungen / Nominierungen** | ✅ | Für ein Spiel/Training Spieler nominieren, Zusage/Absage erfassen. |
| **Gegner-Scouting** | ✅ *(neu)* | Gegner-Datebank mit Kontakt, Halle, Stärken/Schwächen; Spielhistorie mit Bilanz. |

---

### Trainings & Anwesenheit

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Trainingspläne** | ✅ | Wann trainiert welches Team? |
| **Übungsdatenbank** | ✅ *(neu)* | Übungen mit Kategorie, Tags, Altersgruppe, Dauer und Medien verwalten und teilen. |
| **Anwesenheit** | ✅ | Trainer erfasst, wer da war (anwesend, entschuldigt, unentschuldigt, krank). |
| **Prouftraining / Probe-Training** | ✅ | Neue/spontane Spieler schnell erfassen – entweder als bekanntes Mitglied markieren oder als temporärer Gast. |
| **Check-In / Karten-Scan** | ✅ | QR-Code auf der Mitgliederkarte scannen. Zeigt sofort: gültig, bereits gescannt, unbekannt, gesperrt, abgelaufen. |

---

### Organisation

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Kalender & Events** | ✅ | Termine anlegen, bearbeiten, Teams zuordnen. |
| **Kalender-Feed (iCal)** | ✅ *(neu)* | Persönlichen Termin-Feed für Google/Apple/Outlook abonnieren. |
| **Sitzungen (Meetings)** | ✅ | Interne Sitzungen erfassen. |
| **Dokumente** | ✅ | PDFs/Bilder hochladen, kategorisieren, herunterladen. |
| **Anmeldungen (öffentlich + intern)** | ✅ | Externes Anmeldeformular für neue Mitglieder; interne Registrierungen genehmigen/ablehnen. |
| **Trainer-Codes** | ✅ | Trainer erhalten einen Code, mit dem sie sich anmelden oder ein Team zuordnen können. |
| **Dienste (Duties)** | 🟡 | Einfache Verwaltung von Diensten (z. B. Aufbau, Kasse). |
| **Hallen / Facilities** | 🟡 | Einfache Verwaltung von Hallen/Plätzen. |
| **Raumreservierung** | ✅ *(neu)* | Hallen/Plätze buchen mit Datum, Zeit und Überschneidungsprüfung. |
| **Inventar / Material** | ✅ *(neu)* | Gegenstände mit Menge, Lagerort, Zustand und QR-Code verwalten; Ausleihen an Mitglieder mit Rückgabeverfolgung. |
| **Umfragen** | ✅ *(neu)* | Abstimmungen mit einfacher oder Mehrfach-Antwort, Live-Ergebnissen und Schließen-Funktion. |
| **Warteliste** | ✅ | Interessenten erfassen, zum Probetraining einladen, als Mitglied übernehmen oder ablehnen. |
| **DSGVO-Tools** | ✅ | Consent-Übersicht, Datenauszug pro Mitglied, Löschanträge mit Freigabe-Workflow. |
| **Fahrgemeinschaften** | ✅ *(neu)* | Mitfahrgelegenheiten zu Terminen anbieten, Plätze verwalten und ein-/austeigen. |
| **Mobile Ansicht / PWA** | ✅ *(neu)* | App ist als installierbare Web-App nutzbar (Service Worker, Manifest, Install-Hinweis). |

---

### Finanzen

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Finanzen (Konten/Buchungen)** | ✅ | Bankkonten anlegen, Einnahmen/Ausgaben buchen, nach Saison/Kategorie filtern. |
| **Beiträge (Fees)** | ✅ | Mitgliedsbeiträge erfassen, Zahlungen verbuchen, Mahnungen versenden. |
| **Budget** | ✅ | Saisonales Budget planen (Charges/Produits) und mit den realen Buchungen vergleichen. |
| **Rechnungen & offene Posten** | ✅ *(neu)* | Rechnungen erstellen, Zahlungen erfassen, Mahnungen versenden, offene Beträge sehen. |
| **Spendenmanagement** | ✅ *(neu)* | Spenden erfassen, Kampagnen zuordnen, Quittungsstatus verwalten. |
| **Bankimport (CSV)** | ✅ *(neu)* | Bankumsätze importieren und automatisch als Einnahmen/Ausgaben buchen. |
| **SEPA** | 🟡 / 📋 | Datenmodell vorhanden, vollständige Oberfläche folgt. |

> Zugriff auf Finanzen ist auf **Präsident, Admin und Kassenwart** beschränkt.

---

### Kommunikation

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Ankündigungen** | ✅ | Interne News schreiben, anheften, bearbeiten. |
| **Chat** | ✅ | Team-interner Chat pro Mannschaft. |
| **E-Mail-Einstellungen** | ✅ | SMTP-Zugang hinterlegen, Test-E-Mail versenden. |
| **Newsletter** | 🟡 | Basis vorhanden, wird noch ausgebaut. |

---

### Außendarstellung / Website

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Website-Hub** | ✅ | Die öffentliche Website `mersch75.lu` direkt aus der App verwalten: Seiten auflisten, Live-Vorschau, im GitHub-Editor öffnen. |
| **Öffentliche Website-API** | ✅ *(neu)* | CORS-fähige Endpunkte für Events, Spiele, Sponsoren, Hallen, Umfragen und Spenden — direkt für die Website nutzbar. |
| **Willkommensmappe** | ✅ | Mehrsprachige Wëllkomm-Mapp für neue Mitglieder (LU/DE/FR/EN/PT), inkl. Druck/PDF. |
| **Saison-Archiv 25/26** | ✅ *(neu)* | Die Website-Statistik-Seiten der Saison 2025/26 wurden importiert und sind nun in der App archiviert. |
| **Galerie** | 🟡 | Basis vorhanden. |
| **Sponsoren** | 🟡 | Basis vorhanden. |
| **Shop** | 🟡 | Externer Fan-Shop-Link + interne Produkt-/Bestandsliste. |

---

### Verwaltung & Office

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Massendatenänderungen** | ✅ *(neu)* | Filter auf Mitglieder anwenden und ein Feld für viele Datensätze gleichzeitig ändern. |
| **Serien-E-Mail** | ✅ *(neu)* | Personalisierte E-Mails an gefilterte Mitglieder versenden (Platzhalter + optionaler PDF-Anhang). |
| **Bankimport (CSV)** | ✅ *(neu)* | Bank-CSV einfügen und automatisch Buchungen (Einnahmen/Ausgaben) erzeugen. |

---

### Sekretariat & Medico

| Modul | Status | Was kann man damit machen? |
|---|---|---|
| **Sekretariat – Mitgliederverwaltung** | ✅ | Große Mitgliedertabelle mit Excel-Rohdaten, Codes, Funktionen, Status-Filtern, CSV-Export. |
| **Médico-Convocation** | ✅ | Einladung zum Medico-Termin per E-Mail (mehrsprachig), öffentliche Bestätigungs-/Absageseite. |
| **Médico-Resultate** | ✅ | Status setzen: apte, apte temporaire, inapte, absent. |

---

## 4. Technisch – kurz erklärt

| Bereich | Technologie |
|---|---|
| Programmiersprache | TypeScript (JavaScript mit Typen) |
| Frontend | React + TailwindCSS |
| Backend | Node.js + Express |
| Datenbank | SQLite (lokal), optional PostgreSQL (Cloud) |
| ORM | Drizzle |
| Tests | Vitest (Unit-Tests) – erste Tests laufen bereits |
| Sicherheit | Rollenbasierter Zugriff, Login-Lockout, Sessions |

> **Wichtig:** Die App läuft derzeit lokal. Für den Produktivbetrieb müsste man PostgreSQL und richtige Secrets (`ADMIN_PASSWORD`, `SESSION_SECRET` etc.) einrichten.

---

## 5. Was wurde kürzlich fertig? (Juli 2026)

- ✅ **Statusberichte** für Budget, Shop, Prouftraining korrigiert
- ✅ **Warteliste** mit echtem Schema und Workflow
- ✅ **Familienverknüpfung** im Mitglied-Detail sichtbar
- ✅ **DSGVO-Tools**: Consent, Datenauszug, Löschantrag
- ✅ **Saison-Archiv** aus der Website importiert
- ✅ **Code-Modularisierung** gestartet (Waitlist, DSGVO, Archiv, Inventory ausgelagert)
- ✅ **Erste Tests** eingeführt
- ✅ **Datenbank-Anschluss abstrahiert** (SQLite oder PostgreSQL)
- ✅ **Secrets gehärtet** (Admin-Passwort und Seed-Passwörter kommen aus der Umgebung)
- ✅ **Mobile Ansicht / PWA** installierbar (Service Worker, Manifest, Install-Hinweis)
- ✅ **Mitgliederselbstbedienung „Meine Termine“** inkl. Verfügbarkeit und Nominierungs-Antworten
- ✅ **Inventar-Modul** mit Gegenstandsverwaltung und Ausleihen
- ✅ **Raumreservierung** mit Buchungen und Überschneidungsprüfung
- ✅ **Umfragen** mit einfacher/Mehrfach-Antwort und Live-Ergebnissen
- ✅ **Gegner-Scouting** mit Historie und Bilanz
- ✅ **Fahrgemeinschaften** für Termine mit Mitfahrer-Verwaltung
- ✅ **Massendatenänderungen** in der Mitgliederverwaltung
- ✅ **Serien-E-Mail** mit Platzhaltern und optionalem PDF-Anhang
- ✅ **Bankimport (CSV)** für automatische Buchungen
- ✅ **Rechnungen & offene Posten** mit Zahlungen und Mahnungen
- ✅ **Spendenmanagement** mit Kampagnen und Quittungen
- ✅ **iCal-Kalender-Feed** für externe Kalender
- ✅ **Öffentliche Website-API** mit CORS für mersch75.lu
- ✅ **Live-Spielanalyse** mit Ereignis-Erfassung
- ✅ **Übungsdatenbank** mit Kategorien, Tags und Medien

---

## 6. Was muss noch gemacht werden?

### 🔄 In Arbeit / Ausbau geplant
1. **Mehrsprachigkeit vervollständigen**  
   Deutsch, Lëtzebuergesch, Französisch, Englisch, Portugiesisch sind vorgesehen, aber noch nicht in jedem Modul übersetzt.

2. **Basis-Module ausbauen**
   - Dienste, Hallen, Galerie, Sponsoren, Shop, Newsletter, Warteliste, DSGVO-Tools haben die Grundfunktion, aber können noch komfortabler werden.

3. **Test-Abdeckung erhöhen**
   - Erste Unit-Tests laufen. Jetzt brauchen wir Tests für Mitglieder, Finanzen, Auth etc., damit Änderungen sicherer werden.

4. **Automatisierte End-to-End-Tests**
   - Mit Playwright die wichtigsten Oberflächen klicken, als würde ein echter Benutzer die App bedienen.

### 📋 Geplante neue Features
5. **Poster-Generator**  
   Automatisch Spielplakate für Social Media erstellen.

6. **Live-Center / Live-Ergebnisse**  
   Anbindung an `handball4all.de`, damit Spielstände automatisch hereinkommen.

7. **SMS-Login**  
   Magic-Link per SMS versenden (Zugangsdaten für Mixvoip fehlen noch).

8. **Mobile App / PWA**  
   ✅ Einführung erledigt. Nächster Schritt: weitere Abläufe für Trainer direkt vom Handy ermöglichen.

9. **Spielwochen-Recap**  
   Jede Woche automatisch einen kurzen Text mit allen Mannschafts-Resultaten für die News-Seite generieren.

10. **Geplante weitere Module**
    - Schiedsrichter-Einsätze
    - Verletzungen & Reha
    - Fan-Content / Live-Ticker
    - Externe Integrationen (Banking, handball4all, SMS)

### 🏗️ Technisch
11. **Vollständig auf PostgreSQL umstellen** (optional, wenn Cloud-Deploy kommt)
12. **Produktiv-Deployment vorbereiten** (Server, Domain, HTTPS, Backups)
13. **Demo-Daten in Produktion entfernen / Passwort-Richtlinie einführen**

---

## 7. Fazit

Die App ist **funktionsfähig und wird intern bereits genutzt**. Kernbereiche wie Mitglieder, Teams, Anwesenheit, Spiele, Finanzen, Kalender, Kommunikation und Website-Hub stehen. Kürzlich kamen wichtige Module wie Warteliste, DSGVO-Tools, Saison-Archiv, Inventar, Mitgliederselbstbedienung, Umfragen, Raumreservierungen, Gegner-Scouting, Fahrgemeinschaften, Massendatenänderungen, Serien-E-Mail, Bankimport, Rechnungen, Spenden, iCal-Kalender-Feed, öffentliche Website-API, Live-Spielanalyse und Übungsdatenbank hinzu. Die App ist jetzt auch als **mobile Web-App (PWA)** installierbar.

Der Fokus für die nächsten Wochen sollte sein:
- Test-Abdeckung erhöhen
- Mehrsprachigkeit und Komfort in den Basis-Modulen verbessern
- Entscheidung zu externen Integrationen treffen (Banking, handball4all, SMS)
- Produktiv-Umgebung vorbereiten

> **Wichtigster offener Punkt für den Vorstand:** Entscheiden, ob/wann die App auf einen Server umzieht und wer die Zugangsdaten/Secrets verwaltet.

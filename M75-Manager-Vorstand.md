# Vereins-OS / M75-Manager — Vorlage für den Vorstand

> **Vorlage an:** Komitee / Vorstand MERSCH75 · **Datum:** 29. Juni 2026 · **Verfasser:** Cascade (KI-Assistenz), auf Basis Code-Analyse
> **Betreff:** Stand, Nutzen, Kosten, Risiken und Entscheidungsbedarf zum vereinseigenen Verwaltungssystem „Vereins-OS / M75-Manager"

---

## 1. Worum geht es? (in einem Satz)

Der MERSCH75 entwickelt ein **eigenes, selbst-gehostetes Verwaltungssystem**, das Mitglieder, Finanzen, Sport, Kommunikation und Vereinsorganisation an **einer Stelle** bündelt — unabhängig von teuren Fremdanbietern und im **vollen Eigentum des Vereins**.

---

## 2. Warum für den Verein wichtig (Nutzen)

- **Digitale Souveränität:** Alle Vereinsdaten liegen beim Verein, nicht bei kommerziellen Drittanbietern. RGPD-konform.
- **Schluss mit Excel-Wildwuchs:** eine einzige, verlässliche Datenquelle statt verteilter Listen.
- **Zeitersparnis:** Beiträge, Anwesenheit, Spielpläne, Mitgliederpflege weitgehend automatisiert.
- **Kostenkontrolle:** Open-Source-Bausteine, geringe laufende Serverkosten statt Lizenzgebühren pro Mitglied.
- **Zukunftssicher & übergabefähig:** dokumentiert und modular — auch ein anderes Komiteemitglied kann es übernehmen.

---

## 3. Wo stehen wir? (ehrlicher Reifegrad)

Das System ist **kein Prototyp mehr, sondern bereits eine große, nutzbare Anwendung** (Größenordnung eines kleinen kommerziellen Produkts).

| Bereich | Stand |
|---|---|
| **Sportbetrieb** (Spiele, Teams, Training, Statistik, Verbands-Import) | ✅ läuft |
| **Mitgliederverwaltung** (inkl. Excel-Import, Mitgliederkarten/QR-Check-in) | ✅ läuft |
| **Finanzen Basis** (Beiträge, offene Posten, Zahlungsaufforderungen) | ✅ läuft |
| **Dokumente, Kalender, E-Mail, Anwesenheit** | ✅ läuft |
| Chat, Profile, Anmeldungen, Website-Anbindung | 🟦 funktioniert, Ausbau nötig |
| Sponsoren, Galerie, Newsletter, Shop, Dienste, Hallen | 🟡 angelegt, noch ohne Fachlogik |
| Schiedsrichter, Verletzungen/Reha, Fahrgemeinschaften, Saison-Archiv, SEPA | 🧩 Datengerüst da, Bedienoberfläche fehlt |
| KI, Monitoring, automatischer Backup, Messenger (Matrix) | 📋 geplant |

> **Kernbotschaft:** Das teure Fundament (Datenmodell, Sportkern, Finanzen) **steht**. Viele Erweiterungen sind „halbfertig zum kleinen Preis", weil die Datenstruktur schon existiert.

---

## 4. Was kostet das? (Größenordnung, jährlich)

| Posten | Schätzung/Jahr | Anmerkung |
|---|---|---|
| Server-Hosting (Hetzner/Hostinger) | ~ **60–250 €** | je nach Leistung; ein VPS reicht zum Start |
| Domain (mersch75.lu) | ~ **20–40 €** | bereits vorhanden |
| Software-Lizenzen | **0 €** | Open Source / Eigenentwicklung |
| Backup-Speicher (lokales QNAP) | einmalig Hardware | falls Offsite-Backup gewünscht |
| Entwicklung/Pflege | **ehrenamtlich** | Hauptaufwand ist Zeit, nicht Geld |

> **Im Vergleich:** Kommerzielle Vereins-Software kostet oft mehrere hundert bis über tausend Euro/Jahr und hält die Daten beim Anbieter.

---

## 5. Risiken & wie wir sie beherrschen

| Risiko | Bedeutung | Gegenmaßnahme |
|---|---|---|
| **Abhängigkeit von einer Person** | Wissen nur bei einem Entwickler | Doku vorhanden; Ziel: 2. eingearbeitete Person im Komitee |
| **Demo-Passwörter / Sicherheit** | vor Echtbetrieb kritisch | vor Produktivstart zwingend bereinigen |
| **Kein automatisches Backup (noch)** | Datenverlust bei Ausfall | Backup-Konzept (nächtliche Kopie) priorisieren |
| **Noch keine automatischen Tests** | Fehler bei Änderungen | schrittweise Tests für kritische Abläufe |
| **Reife-Gefälle der Module** | manche Seiten noch leer | als „in Entwicklung" kennzeichnen, schrittweise ausbauen |

---

## 6. Empfehlung an den Vorstand (Entscheidungsbedarf)

1. **Grundsatzbeschluss:** Verein setzt mittelfristig auf das eigene Vereins-OS als zentrales System.
2. **Budget freigeben** für Server-Hosting (kleiner jährlicher Betrag, s. §4).
3. **Pilotbetrieb** mit einem abgegrenzten Bereich starten (Vorschlag: **Mitglieder + Beiträge**), bevor alles umgestellt wird.
4. **Verantwortlichkeit:** eine zweite Person zur Einarbeitung benennen (Ausfallsicherheit).
5. **Vor Echtstart:** Sicherheit bereinigen (Demo-Passwörter) und Backup einrichten.

---

## 7. Fahrplan (nächste 6–12 Monate, Vorschlag)

- **Quartal 1:** Sicherheit + Backup, Pilot „Mitglieder & Beiträge" im Echtbetrieb.
- **Quartal 2:** Website automatisch mit Live-Daten (Tabelle/Spiele) verbinden; Sponsoren- und Galerie-Modul ausbauen; **Spielwochen-Recap auf der News-Seite** (kurzer Wochentext über alle Mannschafts-Spiele, ab Saison 2026/2027).
- **Quartal 3:** Monitoring (Verfügbarkeit) + erste KI-Hilfe (Regel-/Formular-Assistent, inkl. automatischer Entwurf für den Spielwochen-Recap).
- **Quartal 4:** Automatisierungen (Neumitglied → Willkommen → Rechnung), Saison-Archiv.

> **Bereits umgesetzt (Juni 2026):** Sponsoren-/Partner-Seite live; Saison **25/26** des Website-Spielplans als Archiv gesichert (`live-center-25-26.html`) und der Live-Spielplan für **2026/2027** zurückgesetzt.

---

## 8. Fazit

Der Verein besitzt bereits ein **wertvolles, funktionierendes Fundament** mit echtem Alltagsnutzen. Mit überschaubaren laufenden Kosten und ehrenamtlichem Einsatz lässt es sich Schritt für Schritt zu einem **vollständigen Vereins-Betriebssystem** ausbauen — bei voller Datenhoheit und Unabhängigkeit.

**Bitte um Beschluss:** Budgetfreigabe Hosting + Start des Pilotbetriebs „Mitglieder & Beiträge".

---

*Detail-Unterlagen auf Wunsch: `M75-Manager-Technik.md` (technisch), `M75-Manager-Kindgerecht.md` (einfach erklärt), `M75-Manager-Statusbericht.md` (vollständige Analyse).*

# Vergleich: M75-Manager vs. easyVerein

**Stand:** 15. Juli 2026  
**Ziel:** Ehrliche Gegenüberstellung der eigenen App mit dem kommerziellen Anbieter easyVerein. Daraus lassen sich Prioritäten für die weitere Entwicklung ableiten.

---

## Kurzfassung

**easyVerein ist eine „allgemeine" Vereinsverwaltung** mit sehr ausgereifter Mitgliederverwaltung, Buchhaltung, Bank-Import, DATEV-Export, Mitgliederbereich und vielen Integrationsen.  
**M75-Manager ist dagegen eine „Sportvereins-App"** mit Schwerpunkt Handball: Spiele, Statistiken, Aufstellungen, Anwesenheit, Médico, Karten-Check-In, Website-Anbindung. Dort ist easyVerein deutlich schwächer oder gar nicht vorhanden.

> **Fazit:** Für den Kern „allgemeine Vereinsverwaltung" fehlen bei M75 vor allem Bank-Import, Rechnungsstellung/DATEV-Export, ein Mitgliederselbstbedienungsportal, Umfragen, Inventar/Reservierungen und externe Integrationen. Für den Sport-Kern (Spielbetrieb, Statistik, Training) ist M75 hingegen stärker.

---

## 1. Bereiche, in denen M75 dem easyVerein noch hinterherhinkt

### 1.1 Bank-Import & professionelle Buchhaltung
| easyVerein | M75-Manager |
|---|---|
| Umsätze per **HBCI/FinTS/XS2A** aus dem Online-Banking importieren | ❌ Nur manuelle Buchungen oder Excel-Import |
| Rechnungen für Mitgliedsbeiträge automatisch erzeugen | ❌ Mahnungen nur als E-Mail, keine PDF-Rechnung |
| Spendenbescheinigungen / Zuwendungsnachweise | ❌ Nicht vorhanden |
| Belege digital Buchungen zuordnen | 🟡 Dokumente sind da, aber keine direkte Beleg-Verknüpfung pro Buchung |
| DATEV-Export für den Steuerberater | ❌ CSV-Export ja, DATEV-Format nein |
| Überschussrechnung / EÜR | 🟡 Budget + Ist-Vergleich, aber keine formale EÜR |

**Handlungsbedarf:** Hoch, wenn die Finanzen nicht nur intern verwaltet, sondern an einen Steuerberater übergeben werden sollen.

---

### 1.2 Mitgliederselbstbedienungsportal ("Mitgliederbereich")
| easyVerein | M75-Manager |
|---|---|
| Eigenes Login für **jedes Mitglied** | 🟡 Login ist möglich, aber eingeschränkte Selbstbedienung |
| Forum / Diskussionsbereich pro Team/Verein | ❌ Kein Forum |
| Mitglied kann sich **selbst zu Terminen an-/abmelden** | 🟡 Nominierungen/Zusage nur intern, kein offener Selbstbedienungs-Button |
| Leihanfragen für Inventar | ❌ Noch kein Inventar-Modul |
| Eigenes Profil verwalten | ✅ Profil-Seite vorhanden |

**Handlungsbedarf:** Mittel bis hoch – spart viel Arbeit für Trainer/Sekretariat.

---

### 1.3 Mobile App
| easyVerein | M75-Manager |
|---|---|
| Native Apps für **iOS und Android** | ❌ Nur Webbrowser |
| Push-Benachrichtigungen | ❌ Keine |
| Trainer bearbeitet Anwesenheit am Handy | 🟡 Website funktioniert am Handy, aber keine PWA/App-Optimierung |

**Handlungsbedarf:** Mittel – für Trainer vor Ort sehr wichtig.

---

### 1.4 Umfragen / Abstimmungen
| easyVerein | M75-Manager |
|---|---|
| Umfragen mit Sichtbarkeits- und Auswertungsoptionen | ❌ Datenmodell nicht vorhanden, keine UI |

**Handlungsbedarf:** Niedrig bis mittel.

---

### 1.5 Inventar- und Artikelverwaltung mit Ausleihe
| easyVerein | M75-Manager |
|---|---|
| Inventar erfassen, Ausleihe verwalten, Verfügbarkeit prüfen | ❌ Keine Inventar-Verwaltung |
| Ort als Aufbewahrungsort hinterlegen | ❌ Facilities nur als Basisliste |

**Handlungsbedarf:** Niedrig bis mittel (je nach Material-Menge des Vereins).

---

### 1.6 Orte und Reservierungen
| easyVerein | M75-Manager |
|---|---|
| Räume/Hallen mit **Belegungskalender** | ❌ Facilities nur als Basisliste |
| Reservierungen und Verfügbarkeiten | ❌ Noch nicht umgesetzt |

**Handlungsbedarf:** Mittel – verhindert Doppelbelegungen von Hallen.

---

### 1.7 Aufgabenverwaltung
| easyVerein | M75-Manager |
|---|---|
| Aufgaben mit Verantwortlichen und Fälligkeit | ❌ Duties nur sehr einfach |
| Erinnerungen an überfällige Aufgaben | ❌ Nicht vorhanden |

**Handlungsbedarf:** Niedrig bis mittel.

---

### 1.8 Sitzungen und Protokolle (erweitert)
| easyVerein | M75-Manager |
|---|---|
| Virtueller Konferenzraum mit Audio/Video/Bildschirmfreigabe | ❌ Nur Protokoll-/Terminerfassung |

**Handlungsbedarf:** Niedrig (Zoom/Teams reicht meist).

---

### 1.9 Externe Integrationen
| easyVerein | M75-Manager |
|---|---|
| CleverReach, Dropbox, WordPress, Passcreator, Twingle, Süderelbe Inkasso, Identity Provider | ❌ Nur GitHub-Website-Integration und FLH-Import |
| Öffentliche REST-API für Drittsysteme | 🟡 Interne API vorhanden, aber nicht dokumentiert/freigegeben |

**Handlungsbedarf:** Mittel – vor allem für Newsletter (CleverReach) und Website (WordPress), falls gewünscht.

---

### 1.10 Datenimport/Export
| easyVerein | M75-Manager |
|---|---|
| Umfassender Import-Assistent für Softwarewechsel | 🟡 Excel/CSV-Import vorhanden |
| DATEV-Export | ❌ Nicht vorhanden |
| DOSB-Export (für Sportverbände) | ❌ Nicht vorhanden |

**Handlungsbedarf:** Hoch nur, wenn Steuerberater/DOSB-Anbindung benötigt wird.

---

## 2. Bereiche, in denen M75 gleichwertig oder besser ist

| Bereich | M75-Manager | easyVerein |
|---|---|---|
| **Handball-spezifischer Spielbetrieb** | ✅ FLH-Import, Spiele, Resultate, Aufstellungen | 🟡 Kein Sport-spezifischer Spielbetrieb |
| **Spielerstatistiken / Top-Scorer** | ✅ Vorhanden | ❌ Sport-spezifische Statistiken nicht vorhanden |
| **Training & Anwesenheit** | ✅ Mit Status, Prouftraining, QR-Check-In | 🟡 Einfache Termin-Anmeldung |
| **Médico-Convocation** | ✅ Mehrsprachige Einladung, öffentliche Antwortseite, Status | ❌ Kein Médico-Modul |
| **Website-Hub** | ✅ `mersch75.lu` direkt aus der App verwalten | ❌ Keine Website-Verwaltung |
| **Saison-Archiv aus Website** | ✅ Archivierung 2025/26 | ❌ Nicht vorhanden |
| **Willkommensmappe** | ✅ Mehrsprachig mit PDF-Druck | ❌ Nicht standardmäßig |
| **Karten-Login / Random-No** | ✅ Login ohne Passwort per Karten-ID | ❌ Nicht bekannt |
| **Trainer-Codes & Rollen-Management** | ✅ Rollenbasiert | ✅ Rollenbasiert |

---

## 3. Praktische Empfehlung

### Option A: M75-Manager weiter ausbauen (empfohlen für den Sport-Kern)
Wenn der Fokus auf **Handball, Spielbetrieb, Statistik, Training und Website** liegt, ist der M75-Manager der richtige Weg. Als Nächstes sollten aber folgende Lücken geschlossen werden:

1. **Bank-Import + DATEV-Export** einbauen oder zumindest einen sauberen CSV-Export für den Steuerberater ermöglichen.
2. **Mitgliederselbstbedienung** ausbauen: Termin-Zusage/Absage, Profilpflege, Dokumente einsehen.
3. **Rechnungen / Mahnungen als PDF** generieren.
4. **PWA / mobile Ansicht** verbessern, damit Trainer das Handy nutzen können.
5. **Umfragen und Inventar** ergänzen, wenn der Bedarf besteht.

### Option B: easyVerein als Hauptsystem + M75-Manager als Sport-Ergänzung
Wenn vor allem **Buchhaltung, Steuerberater-Export, Mitgliederselbstbedienung und Mobile App** wichtig sind, könnte man easyVerein für die Verwaltung nutzen und den M75-Manager nur für Spielbetrieb, Statistik und Website-Anbindung behalten. Das bedeutet aber **doppelte Pflege** von Mitgliederdaten oder einen Datenaustausch.

---

## 4. Fazit für den Vorstand

**easyVerein ist weiter bei der „ klassischen Vereinsverwaltung" – besonders Buchhaltung, Mobile App und Mitgliederselbstbedienung.**

**M75-Manager ist weiter beim „Sportverein" – Spiele, Statistik, Training, Anwesenheit, Website-Integration, Médico.**

**Die größten Lücken in M75-Manager:**
- Bank-Import / DATEV-Export / Rechnungen
- Mobile App / PWA
- Mitgliederselbstbedienungsportal
- Inventar / Reservierungen / Umfragen
- Externe Integrationen (Newsletter, WordPress etc.)

**Empfohlene nächste Schritte:**
1. Entscheiden, ob M75 die Hauptsoftware bleiben soll.
2. Falls ja: Finanz-Export (CSV für Steuerberater) und PDF-Rechnungen als nächste Priorität setzen.
3. PWA/Mobile-Ansicht für Trainer verbessern.
4. Mitgliederselbstbedienung Schritt für Schritt freischalten.

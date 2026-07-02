# Kategorien- & Code-Neuordnung (M75-Manager App)

> **Zweck:** Die heutige „CAT"-Codeliste des Sekretärs vermischt viele verschiedene
> Informationen in *einer* Zahl (z.B. `978 = impayé + remotiver + officiel/coach backup`).
> Dieses Dokument schlägt vor, diese Informationen in der **App** auf **getrennte, saubere
> Felder** aufzuteilen. **Wichtig:** Das öffentliche Formular `join.html` bleibt vorerst
> unverändert — diese Neuordnung betrifft nur die M75-Manager-Datenbank.
>
> Stand: 02.07.2026. Manche Labels stammen aus einer gescannten Excel-Tabelle und sind
> ggf. noch vom Sekretär zu bestätigen (im Text markiert mit ❓).

---

## 1. Grundprinzip: eine Person = 1 Zeile + mehrere Dimensionen

Statt einer einzigen „Cat"-Zahl beschreibt sich jede Person über **mehrere unabhängige
Felder**. Vorteil: keine explodierende Codeliste, mehrere Funktionen problemlos möglich,
sauber filter- und auswertbar. (Nicht „2 Zeilen pro Person", sondern **1 Zeile + Flags** —
so bleibt Adresse/Matricule nur einmal gepflegt.)

Die sechs Dimensionen:

1. **Spielkategorie** (genau eine — „wo spielt die Person")
2. **Funktion(en)** (mehrere möglich)
3. **Mitglieds-Status** (genau einer)
4. **Lizenz-Status** (eigenes Feld)
5. **Transfer / Prêt** (eigenes Feld)
6. **Mitgliedsart / Sondertyp** (eigenes Feld)

Dazu: **Kontakt/Info-Flag** (Nicht-Mitglieder), **Zahlungsstatus** (→ Finanzmodul) und
ein **Freitext-Kommentar**.

---

## 2. Dimension 1 — Spielkategorie

Genau **ein** Wert; rein „in welcher Kategorie darf/spielt die Person". Wenn kein Spieler:
`0` (bzw. leer).

**Neues Schema (Vorgabe User, 02.07.2026):** Hommes **11–21**, Dames **31–41**. Die alten
Codes (2–21) werden ersetzt. Bereiche 22–30 und 42–49 bleiben als Reserve.

| Code | Hommes | Code | Dames |
|---|---|---|---|
| 11 | Seniors | 31 | Seniors / Dames |
| 12 | U21 | 32 | U21 |
| 13 | U17 | 33 | U17 |
| 14 | U15 | 34 | U15 |
| 15 | U13 | 35 | U13 |
| 16 | U11 | 36 | U11 |
| 17 | U9 | 37 | U9 |
| 18 | U7 | 38 | U7 |
| 19 | U4 | 39 | U4 |
| 20 | Vétérans | 40 | Vétérans |
| 21 | Arbitre H | 41 | Arbitre F |
| 0 | kein Spieler / zu klären | | |

✅ **Konflikt 1 — gelöst (User bestätigt 02.07.2026):** `40` = **Vétérans Dames**. „Intern
gesperrt" ist ein **Status** (global, geschlechtsunabhängig) und liegt im 80er-Block als
Code **`87`** (siehe §3b) — nicht mehr im Kategorie-Bereich.

✅ **Konflikt 2 — gelöst (User bestätigt 02.07.2026):** Frauen beginnen bei **31** (Liste
31–41 ist maßgeblich).

**Quelle der Alterskategorien:** maßgeblich ist die FLH-Seite
<https://www.flh.lu/f-l-h/categories-dage> (wird demnächst angepasst). Die Jahrgänge NICHT
fest in der App verdrahten, sondern anhand der FLH-Vorgabe pflegen. Im alten Excel stehen
die Jahrgänge/Spielberechtigung informativ in **Spalte E**.

### Mehrfach-Spielberechtigung (Surclassement)

**Wichtig:** Ein Spieler hat **nicht nur eine** Kategorie. Er spielt normal in seiner
Alterskategorie, darf aber **höher spielen** (Surclassement — z.B. am selben Wochenende
Samstags U13 **und** Sonntags U15) und in **seltenen Fällen eine Kategorie tiefer**.

- `members.catCode` = **Hauptkategorie** (altersbasiert, genau eine).
- Tabelle **`member_categories`** = **zusätzliche** Spielberechtigungen, je mit `kind`:
  `surclassement` (höher) oder `sous_classement` (tiefer).
- „Alle Kategorien, in denen der Spieler spielen darf" = `catCode` + Einträge in
  `member_categories`.
- In welcher Kategorie er ein **konkretes Spiel** bestreitet, ergibt sich weiterhin aus
  `nominations` / `lineups` (pro Match).

---

## 3. Dimension 2 — Funktion(en) *(mehrfach möglich)*

Mehrere Funktionen pro Person möglich. Neue Codes (Vorgabe User):

| Funktion | Code H | Code F |
|---|---|---|
| `Comité` | 1 | 3 |
| `Officiel` | 2 | 4 |
| `Arbitre` | 21 | 41 |
| `Joueur/Joueuse` | = Spielkategorie 11–20 | = Spielkategorie 31–40 |
| `Coach` / `Entraîneur` | 53 (Coach) · 54 (Coach backup) | 53 / 54 |
| `Bénévole` u.a. | 50er-Block (siehe §3b) | 50er-Block (siehe §3b) |

**Damit entfallen die alten Kombi-Codes vollständig:** Wer mehrere Funktionen hat, bekommt
die Spielkategorie **plus** die Funktions-Flags — keine zusammengesetzten Zahlen
(`102/109/1019`, `151/152`) mehr. Beispiele:

- **Spieler + Arbitre** → Spielkategorie + `arbitre`
- **Spieler + Comité** → Spielkategorie + `comite`
- **Spieler/Trainer** → Spielkategorie + `coach` (Spieler, der auch trainiert)

> Hinweis: `Arbitre` (21/41) liegt im Kategorie-Zahlenbereich, `Comité`/`Officiel` (1–4)
> darunter — so vorgegeben; funktioniert, ist nur numerisch etwas gemischt.

---

## 3b. Konkrete Code-Neuordnung ab 50 (Vorgabe User)

Für „die anderen" Codes ab 50 — sauber in Zehnerblöcke gruppiert, das alte Durcheinander
aufgelöst:

**50–59 · Bénévole / Helfer / Trainer**
- `50` Bénévole (allgemein)
- `51` Bénévole Famille (Getränke, Grill …)
- `52` Bénévole avec Licence (z.B. Chrono)
- `53` Entraîneur / Coach
- `54` Coach backup

**60–69 · Mitgliedsart / Sondertyp**
- `60` Donateur
- `61` Donateur licencié
- `62` Membre honoraire (Ehrenmitglied)
- `63` Sponsor

**70–79 · Kontakt / Info (Nicht-Mitglied, rein informativ)**
- `70` Contact famille
- `71` Mère / Père d'accueil

**80–89 · Mitglieds-Status**
- `80` aktiv
- `81` inaktiv
- `82` Arrêt temporaire
- `83` pausiert (Verletzung)
- `84` Abandon / Abbruch
- `85` Abbruch jeune (Lizenz behalten)
- `86` Ancien membre (ehemalig)
- `87` **intern gesperrt (global)** ← löst Konflikt mit Code 40

**90–99 · Transfer / Prêt**
- `90` Prêt sortie (raus)
- `91` Prêt entrée (rein)
- `92` Transfert entrant direct (rein)
- `93` Prêt gratuit
- `94` Transfert vers autre club (raus)

**Kein Code — eigenes Feld:**
- **Lizenz-Status** {aktiv, keine, behalten, gelöscht}
- **Zahlungsstatus** {offen, bezahlt} → Finanzmodul (`member_fees`/`fee_payments`)
- **Freitext-Kommentar** ersetzt die alten Sammelcodes (999, 983, 996, 997 …)

> Die folgenden Abschnitte §4–§10 erklären die Dimensionen inhaltlich (mit den **alten**
> Codes zur Herkunft). Maßgeblich für die **neuen Nummern** ist dieser Abschnitt §3b.

---

## 4. Dimension 3 — Mitglieds-Status *(genau einer)*

| Status | Bedeutung | alter Code |
|---|---|---|
| `aktiv` | reguläres aktives Mitglied | (Standard) |
| `intern gesperrt` | Spieler intern gesperrt — **global (Geschlecht egal)** | alt **112** → neu **87** |
| `inaktiv` | nicht aktiv | 255, 188 |
| `Arrêt temporaire` | vorübergehend pausiert | 220, 221 |
| `pausiert (Verletzung)` | Wettkampfpause wegen Verletzung | 976, 977 |
| `Abbruch` | Vereinsaustritt / Abandon | 250, 252, 256 |
| `Abbruch (jung)` | Jugendlicher, Lizenz behalten | 253 |
| `ehemalig` | Ancien membre | 240 |

> **112 (Vorgabe des Users):** „wenn Spieler intern gesperrt werden" — **globaler** Status,
> das Geschlecht ist hier egal. Also **nicht** „Dames bloqué interne", sondern ein
> allgemeiner Status `intern gesperrt` für beide Geschlechter.

Die App hat dafür bereits das Feld `members.membership_status` (aktuell bei allen 701
Mitgliedern schlicht `active`).

---

## 5. Dimension 4 — Lizenz-Status *(eigenes Feld)*

Steckt heute in Dutzenden Codes versteckt → als eigenes Feld sauberer:

| Lizenz | alter Code (Beispiele) |
|---|---|
| `aktiv` | (mit Lizenz) |
| `keine` | (ohne) |
| `behalten` | 253, 979, 982, 988, 992, 980, 188 („garder licence") |
| `gelöscht` | 256, 991, 993 („supprimer licence") |

---

## 6. Dimension 5 — Transfer / Prêt *(eigenes Feld)*

| Wert | alter Code |
|---|---|
| `Prêt raus` | 300 (Prêt, sortie Mersch75) |
| `Prêt rein` | 301 (Prêt, entrée Mersch75) |
| `Transfer rein` | 302 (Transfert entrant direct) |
| `Prêt gratis` | 303 (Prêt gratuit, pas équipe club origine) |
| `Transfer raus` | 304 (Transfert vers autre club) |

---

## 7. Dimension 6 — Mitgliedsart / Sondertyp *(eigenes Feld)*

| Wert | alter Code |
|---|---|
| `Spieler-Mitglied` | (Standard) |
| `Donateur` | 200 |
| `Donateur (Lizenz)` | 201 |
| `Ehrenmitglied` | 202 (Membre honoraire) |
| `Sponsor` | 980 (sponsor, veut garder licence) |

---

## 8. Kontakt / Info — Nicht-Mitglieder *(eigenes Flag)*

Rein **informativ**, keine direkten Mitglieder, werden aber in der Gesamtliste mitgeführt:

| Flag | Bedeutung | alter Code |
|---|---|---|
| `Contact famille` | Kontakt Familie (M/F/allg.) | 210, 211, 212 |
| `Mère d'accueil` | Gastmutter | 213 |

---

## 9. Zahlungsstatus → gehört ins Finanz-Modul, NICHT in die Kategorie

Alle `impayé`-Varianten (978, 979, 981, 982, 988, 992, 996, 997) sind **Zahlungs-Infos**.
Diese gehören in `member_fees` / `fee_payments` als **Zahlungsstatus** (`offen` / `bezahlt`)
+ Kommentar, nicht in die Kategorie.

---

## 10. Freitext-Kommentar — ersetzt die „Sammelcodes"

Codes wie `999 Divers voir commentaires`, `983 svt mail 10-2017`, `996/997 analyse 08-2017 si
potentiel` sind eigentlich **Notizen**. → in ein **Kommentarfeld** (`members.raw_data` /
`player_flags.note`) statt eigener Codes.

---

## 11. Random-No & Datenblatt (Systemverhalten)

- Bei **jeder** Person/Mitglied in der Liste wird eine **Random-No** (`card_id`) erzeugt.
- Bei einer **Suche** wird ein **einzelnes Datenblatt** mit allen Daten der Person angezeigt.
- Alphabet der Random-No (aus `join.html`): `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (ohne
  verwechselbare Zeichen), mit Kollisionsprüfung.
- Für den Import der 701 bestehenden Mitglieder: einmaliger Batch-Lauf, der jedem fehlenden
  `card_id` eine eindeutige Random-No vergibt.

---

## 12. Verletzungsstatistik (Vorschlag)

Für Spieler soll eine **Verletzungsstatistik** dokumentiert werden. Basis existiert schon:
`player_flags` führt bereits Einträge wie `injured` / `absent` (mit `note`, `created_at`).

**Vorschlag — eigene Tabelle `injuries`** (sauberer als nur ein Flag):

| Feld | Zweck |
|---|---|
| `id` | PK |
| `member_id` | betroffene Person |
| `type` | Art (Knöchel, Knie, Muskel …) |
| `body_part` | Körperregion |
| `start_date` / `end_date` | Ausfallzeitraum |
| `status` | `akut` / `Reha` / `verheilt` |
| `match_id` | optional: Verletzung im Spiel X |
| `note` | Freitext |

Damit sind Auswertungen möglich: Ausfalltage pro Saison, häufigste Verletzungsarten,
Verletzungen pro Team/Kategorie usw. Der Mitglieds-Status `pausiert (Verletzung)`
(siehe §4) kann automatisch aus einer offenen `injuries`-Zeile abgeleitet werden.

---

## 13. Herkunft aus dem alten Excel (zur Orientierung)

- **Spalte E:** Jahrgänge der Spieler + Spielberechtigung (informativ) → in der App **nicht**
  fest verdrahten, sondern aus FLH pflegen (siehe §2).
- **Spalte G:** Überschriften im Excel-Dokument.
- **Spalte H:** Beschreibungen zu diesen Überschriften.

---

## 14. Umsetzung in der App-DB (Ausblick)

- `members`: Spielkategorie (`flh_category`/`internal_category`), `membership_status`
  (bereits vorhanden), plus neue Felder `licence_status`, `transfer_status`, `member_type`.
- Neue Tabelle **`member_functions`** (`member_id`, `function`) für Mehrfach-Funktionen —
  ersetzt alle Kombi-Codes.
- Neue Tabelle **`injuries`** (siehe §12).
- Referenztabelle **`category_codes`** (Text ↔ alter Code) nur für die **einmalige
  Migration** der 701 Mitglieder; danach nicht mehr nötig.

---

## 15. Nächste Schritte

1. ❓-Punkte mit dem Sekretär klären (v.a. Dames U13/U15, Label 112, weitere Labels).
2. FLH-Alterskategorien nach der angekündigten Anpassung übernehmen.
3. Schema in `shared/schema.ts` erweitern (`member_functions`, `injuries`, Status-Felder).
4. Migrations-Script: alte Codes → neue Felder (Mapping-Tabellen oben), Random-No vergeben.

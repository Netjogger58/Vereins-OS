# Changelog — M75-Manager (Vereins-OS)

Neueste Änderungen zuerst.

## 2026-07-15

- **Vereins-OS-App (intern live) – Nominatiounen, Aufsteiger-Teams & Prouftraining.**
  - **Nominatiounen / Teams / Anwesenheet:** Memberer ginn iwwerall no deem selwechte System sortéiert: Médico-Problemer no ënnen, Alter (Jugend alt→jung, Senioren jung→alt), alphabetesch als Fallback.
  - **Aufsteiger-Teams (extraTeamIds):** Jugend-Spiller kënnen elo zu méi héije Kategorien agesat ginn (z.B. U7→U9, U9→U11, U11→U13, U13→U15). Checkboxen an den Team-Détail-Lëschten an am Member-Detail.
  - **Nominatioun-Boost:** Memberer, déi fir e kommende Match schonn nominéiert sinn, ruckelen an Teams/Anwesenheet automatesch no uewen.
  - **Prouftraining (isTrial):** An der Anwesenheet kann een manuell Spiller dobäisetzen an als Prouftraining markéieren. Trial-Trainings zielen als present, kënne awer duerch e Haken spéider op normal gesat ginn.
  - **Nei Backend-Endpunkten:** `GET /api/nominations/team/:teamId`, `POST /api/attendance/bulk`. Nei Datenbankspalten: `members.extra_team_ids` a `attendance.is_trial`.

- **Vereins-OS-App (geplant) – Vereinfachten Prouftraining-Input.**
  - An der Anwesenheet soll d'Dropdown-Lëscht duerch een eenheetlecht Formular ersat ginn: Virnum, Numm, Gebuertsdatum, Handynummer (optional), lescht 5 Zifferen vun der KV-Kaart (optional).
  - Bekannt Memberer ginn per Matching fonnt a kënne direkt als Prouftraining agesat ginn (och fir all Aufsteiger-Kombinatiounen: U7↔U9, U13↔U15, Jugend↔Senioren, Fraen↔Männer).
  - Onbekannt Memberer: den Trainer kann se entweder als **neie Member mat Status `pending`** uleeën oder nëmmen als **temporären Training-Gast** fir deen Dag erfassen.
  - Bei der Nei-Member-Erfassung gëtt d'Handynummer obligatoresch erfrot (vum Spiller oder engem Elternteil), mat engem Flag ob d'Nummer zum Spiller oder zum Elter gehéiert. Falls d'Telefonsnummer net bekannt ass, gëtt dat vermerkt (`phone: "unbekannt"`, `phoneOwner: "unbekannt"`).
  - Zil: Trainer sinn net méi ofhängeg vun der KI, fir nei oder spontan Spiller an en Training anzesetzen.

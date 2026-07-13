# Roadmap — Onboarding (Join Us) & Team-/Kader-Verwaltung

Stand: 13.07.2026 — Notizen fir spéider, näischt dovun ass nach ëmgesat (ausser wou markéiert).

## 1. Nei Memberen automatesch iwwerhuelen (Join Us)
Aktuell: `mersch75test.github.io/join.html` schéckt iwwer **Web3Forms** nëmmen eng **E-Mail**.
Keng Verbindung mat der App-DB. `POST /api/members` besteet, awer mat Login a ouni „pending".

### Stufe
- **Stuf 1 (lokal, semi-auto):** Am Secretariat „Umeldung importéieren": E-Mail/JSON eran kopéieren -> Member als `pending` uleeën.
- **Stuf 2 (voll auto, empfohlen):** Neien ëffentlechen `POST /api/join` (ouni Login, mat Honeypot + Rate-Limit, béid schonn do) ODER Web3Forms-Webhook -> Member als `pending` -> Review-Queue am Secretariat -> Sekretär „Freischalten" -> `active` + Cat-Code, `card_id` spéider.
- **Viraussetzung Stuf 2:** App muss vum Internet erreechbar sinn (aktuell nëmmen `localhost:3000`; Hetzner nach net fäerdeg, kuck §3).

### Feld-Mapping join.html -> members
Nom/Prenom -> last_name/first_name · DateNaissance -> birthdate · Categorie -> flh_category (+cat_code) ·
Role -> member_type/member_functions · CNS -> matricule · Email/GSM1 -> email/phone ·
Strasse/Postcode/Ortschaft -> address · Nationalite -> nationality · AncienClub -> transfer_status.
Consent-Checkboxen (Dateschutz/FLH) matspäicheren als Beweis.

## 2. Team-/Kader-Verwaltung (Trainer)
Problem (User): Team-Lëschten weisen z.B. **79 „Seniors"**, well ofgemellte (`ehemalig`) NET erausgefiltert ginn
(DB: team_id=1 = 65 aktiv + 14 ehemalig = 79). Ausserdeem gëtt et keng Méiglechkeet fir:
- richteg **zortéieren / sichen** an de Lëschten,
- Spiller **manuell** derbäi/eraus fir eng Saison,
- Trainer soll **virun der Saison** e **Saison-Kader** aus de relevante Nimm auswielen
  (net déi déi nëmme mam Numm dostinn, laang net méi kommen, oder ofgemellt sinn).

### To-dos
- [x] Team-Roster-Usiicht: nëmme `isActiveClubMember` uweisen (ehemalig raus). (kuck Fix 13.07.)
- [ ] Sortéierung + Sich an de Kader-Lëschten.
- [ ] Saison-Kader: Trainer wielt pro Saison déi relevant Spiller (nei Tabell z.B. `season_roster` mat season, teamId, memberId, active).
- [ ] Spiller manuell an en Team derbäisetzen/eraushuelen (net nëmmen iwwer cat_code -> team-Mapping).
- [ ] „Trainer"-Auswiel nëmmen aus relevante/aktive Spiller.

## 3. Hetzner Deployment / Login
- App leeft nach net richteg um Hetzner: **Login-Problem** (Teams/Auth) nach ze léisen.
- 2FA lokal iwwer `DISABLE_2FA=1` ausgeschalt (`.env`) — fir Prod anescht léisen.
- Nodeems Login stäit: Stuf 2 vum Onboarding méiglech.

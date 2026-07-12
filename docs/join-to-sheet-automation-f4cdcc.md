# Automatesch Iwwernahm vun Join-Us-Umeldungen an d'Memberslëscht

Automatiséiert d'Umeldung vun `join.html` esou datt all neit Member direkt an d'Memberslëscht-Tabell op Google Drive geschriwwe gëtt, mat de bestoende FLH-/Cotisatioun-Regelen an enger zoufälleg generéierter `Random-No` an der Spalt C.

## Ausgangslag (wat elo existéiert) — korrigéiert

- `join.html` (Repo `Netjogger58/mersch75test.github.io`) ass eng statesch GitHub-Pages-Säit.
- Beim Ofschécke ginn iwwer **Web3Forms** (`api.web3forms.com`) **zwou E-Mailen** verschéckt:
  - **E-Mail 1** — Franséisch, un den **Haaptschlëssel** (`MAIN_KEY`), **inkl. Lizenz-Link** fir d'FLH.
  - **E-Mail 2** — Däitsch, interne Kopie un de **sekundäre Schlëssel** (Max, `Max.hbm75@gmail.com`); de Betreff kritt de Prefix `MINDERJAEHRIG -` wann de Member **mannerjäreg** ass (`Mineur = OUI`, aktuell Alter < 18).
- D'**FLH-Lizenz** gëtt weiderhin **manuell vum Secretaire** iwwer e Formular ausgefëllt.
- **Dëse ganze Mail-/FLH-Flux bleift onverännert bestoen** bis eng nei Regelung fond ass. D'Sheet-Ubannung kënnt **zousätzlech** derbäi (net als Ersatz).
- D'Form generéiert schonn eng zoufälleg ID: `generateCardInternalId()` → 8 Zeechen aus dem Alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (kee `I`, `O`, `0`, `1` — verwiesselungssécher), gespäichert am verstoppte Feld `CardInternalId`.
- FLH-Kategorie-Regelen (`flhCategoryRules`, male/female no Gebuertsjoer) an d'Cotisatioun-Logik (`suggestTarif`, `cotisationAge`) sinn scho client-säiteg implementéiert.

> Notiz zum Alter: De Code benotzt `Mineur = OUI` bei **Alter < 18**. Du hues "ënner 16" gesot — dat 16-Joer-Krittär kënnt an der **Cotisatioun** vir (`jeune joueur >16 / <16`), net am Mail-Trigger. Wann de Max-Mail eréischt bei **< 16** soll goen, muss dat separat ugepasst ginn (fir de Moment loosse mer et wéi et ass).

## Zieldokument & Spaltestruktur (bestätegt)

Basis: `GC 2026-06-25-MEMBERSLESCHT 2025-2026.xlsx` (Header-Zeil ausgelies). Wichteg Spalten:

- **A** — Numm (Nom)
- **B** — Virnumm (Prénom)
- **C** — `Random-No`  ← hei kënnt d'zoufälleg generéiert Nummer eran
- **D** — Langue / Nationalité (Format `F / franco-luxembourgeoise`)
- **E** — Adresse (Strooss)
- **F** — Code postale
- **G** — Localité
- **H** — code courrier (intern, ofgeleet)
- **J/K** — Cat / Catégorie interne Mersch75
- **M** — Catégorie Listing FLH 2025-2026
- **N–W** — Kategorie-Flagen 2025-2026 (N=Etudiant, O=U17H, P=U15H, Q=U13H, R=U11M, S=U9M, T=U7M, U=U17F, V=U15F, W=U13F) — markéiert mat `c`
- **Y** + **Z–AI** — Catégorie/Flagen 2026-2027
- **AJ–AN** — Licences (Pass-Nr, Off, ZS, SR, CL)
- **AQ** — Date début licence · **AR** — date début membre · **AS** — Prochain Médico
- **AT** — Naissance (JJ/MM/AA) · **AU** — Matricule (CNS)
- **AW/AX/AY** — Tél / Bureau / GSM · **AZ** — Email

## Gewielte Léisung: Google Apps Script Web App

Well d'Zil e Google-Drive-Dokument ass an d'Säit statesch op GitHub Pages leeft, ass e **Google Apps Script Web App** (`doPost`) dat um Sheet hänkt déi propperst Léisung — kee Server, kee Service-Account-Setup néideg.

> **Entscheedung (vum User) — Zwee-Spuer-Setup mat ZWEE Master:**
> - De **Secretär féiert seng eege Excel-Lëscht (`.xlsx`) weider** — bleift onverännert, net Deel vun der Automatisatioun.
> - Mir bereeden **zwee Google-Sheet-Master** vir:
>   1. **Secrétaire-Master** — op Basis vun der voller Memberslëscht (`GC 2026-06-25-MEMBERSLESCHT 2025-2026.xlsx`), virbereet fir de Secrétaire (produktiv Zil-Struktur).
>   2. **Test-Master (Adrien)** — schafft **just mat der Datei `GC 2026-06-25-MEMBERSLESCHT 2025-2026 Adrien.xlsx`**. Hei gëtt **fir d'éischt getest**, éier eppes an de Secrétaire-Master geet.
> - Béid Master hunn déiselwecht Spaltestruktur; de Kollisioun-Check fir d'`Random-No` leeft géint d'C-Wäerter am jeeweilege Master.

### Schrëtt

1. **Sheet identifizéieren** — d'Master-Datei op Drive als Google Sheet festleeën, Sheet-Numm (Tab) an d'`Spreadsheet ID` festhalen.
2. **Apps Script uleeën** — am Sheet: *Extensions → Apps Script*. E `doPost(e)` schreiwen deen:
   - e Shared-Secret-Token préift (géint Spam/Mëssbrauch),
   - déi nächst fräi Zeil sicht,
   - d'Felder no ënnestehendem Mapping an déi richteg Spalten setzt,
   - d'`Random-No` (C) an d'FLH-Kategorie-Flag (`c`) an déi richteg Spalt schreift,
   - JSON zréckginn (`{ok:true, row, randomNo}`).
3. **Web App deployen** — *Deploy → Web app*, *Execute as: Me*, *Access: Anyone*. Deployment-URL kopéieren.
4. **`join.html` upassen** (minimal-invasiv, parallel zu Web3Forms):
   - Konstant `MERSCH75_SHEET_ENDPOINT` (Deployment-URL) + `MERSCH75_SHEET_TOKEN` bäisetzen.
   - Sécherstellen datt `ensureCardInternalId()` VIRUM Ofschécke opgeruff gëtt, sodat d'`Random-No` existéiert.
   - Nom erfollegräiche Web3Forms-Call zousätzlech e `fetch(MERSCH75_SHEET_ENDPOINT, {method:'POST', body: JSON})` mat de gemappte Felder ausféieren (`no-cors` oder JSON, je no Setup).
   - D'E-Mail-Flux bleift onverännert als Backup/Notifikatioun.
5. **Random-No-Regel iwwerhuelen** — genau dee bestoende Generator benotzen (8 Zeechen, Alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
6. **Kollisioun-Check (verbindlech)** — am Apps Script all bestoend Wäerter aus der Spalt C alauschteren; wann déi generéiert `Random-No` scho existéiert, gëtt se nei generéiert bis se eenzegaarteg ass. Esou bleift C ëmmer eendeiteg.
7. **Nei Memberen am Sheet markéieren** — all automatesch derbäigesat Zeil gëtt **am Google Sheet** sichtbar markéiert, sou datt d'Sekretariat se direkt gesäit a validéiere kann:
   - Zeil-Hannergrond faarweg setzen (z.B. hellgréng) via Apps Script, **an**
   - an der Kommentar-Spalt **AO** en Text wéi `NEI – iwwer join.html – <Datum/Zäit>` androen.
   - (D'**Mail** weist souwisou scho un datt et en neie Member ass — dofir **keng Ännerung um Mail-Flux** néideg.)

## Feld → Spalt Mapping (Form → Sheet)

- **A** ← `Nom`
- **B** ← `Prenom`
- **C** ← `CardInternalId` (Random-No)
- **D** ← Sprooch + `Nationalite` (z.B. `F / <Nationalité>`)
- **E** ← `Strasse`
- **F** ← `Postcode`
- **G** ← `Ortschaft`
- **J** ← `catCode` ("Cat" / interne Kategorie): Spiller = FLH-Kategorie-Code (H: Seniors=2, U21=3, U17=4, U15=5, U13=6, U11=7, U9=8, Vétérans=9, U7=21 · D: Dames=12, U17=14, U15=16, U13=15, U11=17, U9=18, Vétérans=19, U7=21) · Officiel H=`1`/D=`11` · Arbitre=`10` (Spiller+Arbitre = `10`+Spiller-Code, z.B. `102`/`109`) · reng Bénévole=`50` · Contact Famille (Famill)=`214`/`215`
- **M** ← `Categorie` (FLH-Kategorie aus `flhCategoryRules`) — **ëmmer** geschriwwen
- **O–W** ← `c` an der passender Spalt (kuck Flag-Tabell hei ënnen) — **automatesch**, kee Secrétaire néideg
- **AR** ← Datum vun der Umeldung (date début membre)
- **AQ** ← nëmme setzen wann `Licence = Oui`
- **AT** ← `DateNaissance`
- **AU** ← `CNS` / `getCnsComplete()`
- **AY** ← `GSM1` (an `GSM2` op Reserve)
- **AZ** ← `Email`
- **AJ/AK/AL/AM** ← ofhängeg vu `Role` (Joueur/Officiel/Arbitre/ZS)

### Kategorie-Flag-Tabell 2025-2026 (`c` gëtt automatesch gesat)

- **Männlech** (`FlhCategoryBasis` ≠ "Filles - Femmes"): U17→**O**, U15→**P**, U13→**Q**, U11→**R**, U9→**S**, U7→**T**
- **Weiblech** (`FlhCategoryBasis` = "Filles - Femmes"): U17→**U**, U15→**V**, U13→**W**
- **Ouni eege Flag-Spalt** (nëmmen M-Text): Seniors, Veterans, U21 (m+w), a weiblech U11/U9/U7. → Dat ass eng Grenz vun der aktueller Tabellestruktur, keng Secrétaire-Aufgab.
- (2026-2027-Flagen an Z–AI kënnen no der selwechter Logik parallel gesat ginn — optional; Y kritt den Text.)

## Regelen déi 1:1 aus der Programmatioun iwwerholl ginn

- **FLH-Kategorie** no Gebuertsjoer + Geschlecht (`flhCategoryRules`).
- **Mannerjäreg / Tuteuren** (`Mineur`, `ParentIsole`, `Tuteur1/2`) fir d'Kontaktdaten.
- **CNS-Format** (`getCnsComplete`: `JJ.MM.JJJJ` ëmgedréint + 5 Ziffere).
- **Cotisatioun-Logik** (`suggestTarif`) fir d'Kategorie-/Beitragsspalten.
- **Famill-Memberskaart** (`FamilleFlag`, `FamilyMember*`): all Familljemember kritt eng eege Zeil mat enger eegener `Random-No`.

## Edge-Cases & Detailer

- **Duplikater**: Check op (Numm + Virnumm + Gebuertsdatum) fir keng Duebel-Zeilen; soss neie Member.
- **Famill**: N Zeilen op eemol schreiwen, all mat eegener `Random-No` (C).
- **Random-No Eenzegaartegkeet**: Kollisioun-Check géint bestoend C-Wäerter am Sheet.
- **Sécherheet**: Token/Shared-Secret am `doPost`; d'Endpoint-URL ass ëffentlech, dofir keng sensibel Logik am Client.
- **Feeler-Handling**: Wann de Sheet-Call feelt, bleift d'E-Mail (Web3Forms) als Backup — d'Umeldung geet net verluer.

## Test

1. Testumeldung iwwer `join.html` (Eenzelmember) → préiwen datt eng Zeil derbäikënnt, C gefëllt ass, FLH-Flag richteg gesat.
2. Test mat Mannerjäregen (Tuteuren) an mat Famill-Memberskaart (méi Zeilen).
3. Kontroll datt d'E-Mail weider ukënnt (Backup onberéiert).
4. Kollisioun-Test fir d'`Random-No`.

## Entscheedungen (festgehalen)

- **Alter-Trigger** bleift wéi haut (`Mineur` = Alter < 18) — keng Ännerung.
- **Zwee-Spuer + zwee Master:** Secretär seng Excel bleift; Automatisatioun → **Secrétaire-Master** (produktiv) an **Test-Master (Adrien)** (Test fir d'éischt).
- **Direkt an de Master schreiwen** mat kloerer Markéierung (faarweg Zeil + AO-Notiz) am Sheet — **kee separaten Staging-Tab**.
- **Kee Mail-Ännerung fir richteg Umeldungen** — d'Mail signaliséiert scho en neie Member.
- **Test-Modus:** Numm mat `TEST` → alles op `m75.deisad@gmail.com`, näischt un Secrétaire/Max, Sheet just an den Adrien-Test-Master (kuck uewen).
- **Repo:** ale Desktop-Klon läschen (no Bestätegung), CascadeProjects-Klon ass de Referenz.

## Test-Modus (fir dech als Tester)

- **Trigger:** Am Numm-Feld (`Nom`) steet **`TEST`** (z.B. `MUSTER TEST`). Erkennung case-insensitiv.
- Wann `TEST` erkannt gëtt:
  - **Näischt** geet un de **Secrétaire** (Haaptschlëssel) oder un de **Max** (Sekundärschlëssel).
  - Alles geet **eleng op deng Adress `m75.deisad@gmail.com`**.
  - **Net-Mineur:** 1 Mail op deng Adress.
  - **Mineur:** **2 Mailen** op deng Adress (Haapt- + "Max"-Kopie), well de Max keen Test-Numm soll kréien.
  - D'Sheet-Schreiwen geet **just an den Test-Master (Adrien)**, ni an de Secrétaire-Master; d'Zeil gëtt als `TEST` markéiert.
- **Technesch Notiz (wichteg):** Bei Web3Forms bestëmmt den `access_key` d'Ziel-Boîte — d'"to"-Adress kann ee net eelef änneren. Fir d'Test-Mailen op `m75.deisad@gmail.com` ze kréien, brauche mer en **eegene Web3Forms-Schlëssel deen op `m75.deisad@gmail.com` registréiert ass**. Am Test-Modus gëtt just dëse Schlëssel benotzt (1× oder 2× je no Mineur), an d'Haapt-/Max-Schlëssele ginn iwwersprongen.

## Repo-Opraumen (Duebel-Klon)

Zwee lokal Klone vum Site-Repo fonnt — dat féiert zu Onstëmmegkeeten:
- ✅ **Behalen:** `@/Users/netjogger58/CascadeProjects/mersch75test.github.io` — propper, um leschte Stand (Commit `73aa217`, 30.06).
- ❌ **Läschen:** `@/Users/netjogger58/Desktop/CascadeProjects/mersch75test.github.io` — al (Commit `3b55c4f`, 28.06).
- **Bild-Rettung (bestätegt vum User):**
  - `Media/Logo Lieder Mersch75.png` existéiert **NET** am behalene Repo → gëtt an `@/Users/netjogger58/CascadeProjects/mersch75test.github.io/Media/` kopéiert.
  - `Media/M75_Memberskaart mat Draach recto 16112025.png` → **net retten**, gëtt mam Repo geläscht.
- Duerno de ganzen Desktop-Klon läschen.
- **Läschen ass destruktiv → gëtt eréischt no dénger expliziter Bestätegung gemaach.**

## Web3Forms-Schlëssel fir `m75.deisad@gmail.com` uleeën (Uleedung, aktuell UI)

1. Op **https://web3forms.com** op de Knäppche **"Create your Form"** klicken (oder direkt op **https://app.web3forms.com**).
2. Am App d'Adress **`m75.deisad@gmail.com`** androen (gratis, kee Cred.-Kaart).
3. Web3Forms schéckt eng **Verifikatiouns-Mail** un `m75.deisad@gmail.com` → Mail opmaachen a **confirméieren / verifizéieren**.
4. No der Verifikatioun gëtt en **Access Key** (UUID-Format) erstallt → **kopéieren**.
5. Dee Key **mir ginn** → ech setzen en an `join.html` als `MERSCH75_WEB3FORMS_TEST_KEY` fir de Test-Modus.

**✅ Erstallt (Test-Key, gebonnen un `m75.deisad@gmail.com`):**

```
MERSCH75_WEB3FORMS_TEST_KEY = '9f36724d-0d6c-4ac4-b325-11ce6f7d0a5b'
```

> Dëse Key gëtt **just am Test-Modus** benotzt (Numm mat `TEST`). Fir Mineur-Tester gëtt en **2×** opgeruff (Haapt- + "Max"-Kopie), soss **1×**.

## Google-Setup & Roll-Verdeelung (bestätegt)

- **Drive-Dossier (Test):** `https://drive.google.com/drive/folders/17NwU4IV9ccOiskg8A_Mfnqub-BVwH68t` (Konto `m75.deisad@gmail.com`).
- **✅ Adrien-Test-Master (Google Sheet erstallt):**
  - URL: `https://docs.google.com/spreadsheets/d/1SnJgdW0MEv9mgQIdDi5nOO-ws6nmGhqX5eBrvQgmj2o/edit`
  - `Spreadsheet-ID = 1SnJgdW0MEv9mgQIdDi5nOO-ws6nmGhqX5eBrvQgmj2o`
  - `gid = 134466781` (Ziel-Tab).
- **User mécht (Google-Säit — well ech kann mech net a **deng** Google-Konto aloggen):**
  1. `GC 2026-06-25-MEMBERSLESCHT 2025-2026 Adrien.xlsx` an deen Drive-Dossier eroplueden.
  2. **An e Google Sheet konvertéieren** (Rietsklick → *Open with → Google Sheets* → *File → Save as Google Sheets*). Apps Script brauch e natíve Google Sheet, **kee `.xlsx`**.
  3. Am Sheet: *Extensions → Apps Script* opmaachen, de vun **mir geliwwerten Code** erapechen, **deployen** (*Deploy → Web app*, Access: *Anyone*).
  4. D'**Deployment-URL** (an d'`Spreadsheet-ID` / Tab-Numm) **mir ginn**.
- **Ech maachen (Code-Säit):**
  1. Apps-Script-Code (`doPost`, Mapping, Random-No + Kollisioun-Check, TEST-Markéierung) schreiwen a bereetstellen.
  2. `join.html` upassen: `MERSCH75_SHEET_ENDPOINT` + `MERSCH75_WEB3FORMS_TEST_KEY` + Test-Modus-Logik (Numm `TEST` → Test-Key, Sheet → Adrien-Master).
  3. Bild kopéieren, ale Desktop-Klon läschen, Doc-Anbindung an d'Repos.

## Doc-Anbindung an d'GitHub-Repos (fir dass näischt verluer geet)

Aktive Klone (nom Opraumen):
- `@/Users/netjogger58/CascadeProjects/mersch75test.github.io`
- `@/Users/netjogger58/CascadeProjects/Vereins-OS`

Dëse Plang gëtt bei der Ëmsetzung an d'bestoend `.md`-Docs matgeholl / aktualiséiert:
- **mersch75test.github.io** → Notiz/Sektioun an `AGENTS.md` + `Webseiten-Statusbericht.md`.
- **Vereins-OS** → Sektioun an `PROJEKTPLAN.md` (an evtl. `M75-Manager-Technik.md`).

(Optional: eng Kopie vun dësem Plang als eegen `.md` an all Repo leeën, fir Nofollowbarkeet.)

## Nächst Schrëtt (nom OK)

1. **Test-Master (Adrien)** uleeën: `...Adrien.xlsx` als Google Sheet importéieren (Struktur + C-Wäerter fir Kollisioun-Check).
2. Apps Script `doPost` schreiwen (Mapping, Random-No + Kollisioun-Check, Markéierung).
3. Web App deployen, Endpoint + Token an `join.html` androen (parallel zum Mail-Flux).
4. **Test-Phase** géint den Adrien-Master (Eenzel, mannerjäreg, Famill, Kollisioun).
5. No erfollegräichem Test: **Secrétaire-Master** op Basis vun der voller Lëscht virbereeden an ëmschalten.
6. Plang an d'`.md`-Docs vun de béide Repos androen/updaten (kuck uewen).

## Appendix A — Apps Script Code (fäerdeg fir z'apzepechen)

**Wéi asetzen (robust — standalone Projet):**
1. Op **https://script.google.com/home** → **New project**.
2. Alles ersetzen mat dësem Code → späicheren.
3. **Deploy → New deployment → Web app** → *Execute as: Me*, *Who has access: Anyone* → **URL kopéieren a mir ginn**.
4. Beim éischten Deploy no der Autorisatioun gefrot → akzeptéieren (de Projet dierf op d'Sheet zougräifen).

> Dëse Code mécht d'Sheet iwwer `openById(SHEET_ID)` op — funktionéiert souwuel standalone wéi och gebonnen (*Extensions → Apps Script*). Wann *Extensions → Apps Script* de Feeler "unable to open the file" gëtt, benotz de standalone Wee hei uewen.
>
> **Virbedéngung:** D'Zil-Datei muss e **natíve Google Sheet** sinn (kee `.xlsx`). Wann nieft dem Titel e Badge `.XLSX` steet: *File → Save as Google Sheets* an dann déi nei ID benotzen.

> `SHARED_TOKEN` muss identesch an `join.html` stoen (ech setzen dee selwechte Wäert do).

```javascript
const SHEET_ID = '1SnJgdW0MEv9mgQIdDi5nOO-ws6nmGhqX5eBrvQgmj2o';
const SHEET_GID = 134466781;
const SHARED_TOKEN = 'm75-join-9f36-secure-2026';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LAST_COL = 52; // AZ

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== SHARED_TOKEN) return json({ ok: false, error: 'unauthorized' });

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getSheetByGid(ss, SHEET_GID) || ss.getSheets()[0];
    const isTest = body.isTest === true;
    const members = (body.members && body.members.length) ? body.members : [body];

    const results = [];
    members.forEach(function (m) {
      const randomNo = ensureUniqueRandomNo(sheet, m.randomNo);
      const row = buildRow(m, randomNo, isTest);
      sheet.appendRow(row);
      const r = sheet.getLastRow();
      markRow(sheet, r, isTest, m);
      results.push({ row: r, randomNo: randomNo });
    });
    return json({ ok: true, results: results });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function buildRow(m, randomNo, isTest) {
  const arr = new Array(LAST_COL).fill('');
  const set = function (col, val) { arr[col - 1] = (val == null ? '' : val); };

  set(1, m.nom || '');                                   // A Nom
  set(2, m.prenom || '');                                // B Prénom
  set(3, randomNo);                                      // C Random-No
  set(4, langLetter(m.lang) + (m.nationalite ? ' / ' + m.nationalite : '')); // D
  set(5, m.strasse || '');                               // E Adresse
  set(6, m.postcode || '');                              // F Code postale
  set(7, m.ortschaft || '');                             // G Localité
  set(10, m.catCode || '');                              // J Cat-Code (Spiller/Officiel/Arbitre/Bénévole)
  set(13, m.categorie || '');                            // M FLH 2025-2026 (Text)

  const fc = flagColumn(m.categorie, m.basis);           // O–W Flag
  if (fc) set(fc, 'c');

  if (m.licence === 'Oui') set(43, today());             // AQ date début licence
  set(44, today());                                      // AR date début membre
  set(46, m.dob || '');                                  // AT Naissance
  set(47, m.cnsComplete || m.cns || '');                 // AU Matricule
  set(51, m.gsm1 || '');                                 // AY GSM
  set(52, m.email || '');                                // AZ Email

  // AJ–AM no Roll(en) — m.roles ass en Array (Multi-Roll), fallback op m.role
  var roles = (m.roles && m.roles.length) ? m.roles : [m.role];
  if (roles.indexOf('Officiel(le)') !== -1) set(37, 'x');   // AK Off
  if (roles.indexOf('Arbitre') !== -1) set(39, 'x');        // AM SR (och bei Spiller+Arbitre)

  return arr;
}

function flagColumn(category, basis) {
  const female = basis === 'Filles - Femmes';
  const mapM = { U17: 15, U15: 16, U13: 17, U11: 18, U9: 19, U7: 20 };
  const mapF = { U17: 21, U15: 22, U13: 23 };
  return female ? mapF[category] : mapM[category];
}

function langLetter(lang) {
  return ({ lu: 'L', fr: 'F', de: 'A', en: 'E', pt: 'P' })[lang] || (lang || '').toUpperCase().slice(0, 1);
}

function ensureUniqueRandomNo(sheet, proposed) {
  const existing = getColumnValues(sheet, 3); // C
  let val = (proposed && String(proposed).trim()) || genRandomNo();
  while (existing.indexOf(val) !== -1) { val = genRandomNo(); }
  return val;
}

function genRandomNo() {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

function markRow(sheet, row, isTest, m) {
  const range = sheet.getRange(row, 1, 1, LAST_COL);
  range.setBackground(isTest ? '#fde2e1' : '#e2f4e1'); // TEST=rout, NEI=gréng
  const note = (isTest ? 'TEST' : 'NEI') + ' – join.html – ' + today() + (m && m.mineur === 'OUI' ? ' – MINEUR' : '');
  sheet.getRange(row, 41).setValue(note); // AO Commentaires
}

function getSheetByGid(ss, gid) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) if (sheets[i].getSheetId() === gid) return sheets[i];
  return null;
}

function getColumnValues(sheet, col) {
  const last = sheet.getLastRow();
  if (last < 1) return [];
  return sheet.getRange(1, col, last, 1).getValues().map(function (r) { return String(r[0]).trim(); });
}

function today() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

## Appendix B — JSON-Payload deen `join.html` schéckt

> **CORS-Notiz:** Vu GitHub Pages gëtt de `fetch` mat `Content-Type: text/plain` geschéckt (JSON-String am Body), fir de Browser-Preflight (OPTIONS) ze vermeiden — Apps Script `doPost` liest `e.postData.contents` egal wéi.


```json
{
  "token": "m75-join-9f36-secure-2026",
  "isTest": true,
  "members": [
    {
      "nom": "MUSTER", "prenom": "Max", "randomNo": "ABCD2345",
      "lang": "lu", "nationalite": "luxembourgeoise",
      "strasse": "1, rue Test", "postcode": "L-7561", "ortschaft": "Mersch",
      "categorie": "U13", "basis": "Garçons - Hommes",
      "dob": "01.01.2013", "cns": "12345", "cnsComplete": "2013.01.01.12345",
      "gsm1": "691000000", "gsm2": "", "email": "m75.deisad@gmail.com",
      "role": "Joueur / Joueuse", "roles": ["Joueur / Joueuse", "Arbitre"],
      "catCode": "106", "licence": "Oui", "mineur": "OUI"
    }
  ]
}
```

> `role` = Haaptfunktioun (fir Uweisung); `roles` = all gewielte Funktiounen (Multi-Roll); `catCode` = fäerdege Code fir d'Spalt J.

## Roll-, CAT-Code- & Cotisatioun-Logik (Erklärung)

D'Umeldung (`join.html`) erlaabt **méi wéi eng Funktioun pro Persoun** (z.B. Spiller deen och Arbitter ass). D'Haaptfunktioun gëtt am Dropdown gewielt, zousätzlech Funktiounen iwwer Checkboxen ("Och Arbitter" asw.).

### CAT-Code (Spalt J, "Cat")
- **Spiller** → FLH-Kategorie-Code:
  - **Hären:** Seniors=`2`, U21=`3`, U17=`4`, U15=`5`, U13=`6`, U11=`7`, U9=`8`, Vétérans=`9`, U7=`21`
  - **Damen:** Dames=`12`, U17=`14`, U15=`16`, U13=`15`, U11=`17`, U9=`18`, Vétérans=`19`, U7=`21`
- **Officiel** → H=`1` / D=`11`
- **Arbitter** → `10`
- **Spiller + Arbitter** → Arbitter-Code `10` **virun** de Spiller-Code (ouni Trennzeechen):
  - **Hären:** Seniors-H=`102`, U13-H=`106`, Vétéran-H=`109`
  - **Damen:** U17-D=`1014`, U13-D=`1015`, Vétérans-Dames=`1019`
- **Reng Bénévole / Comité** → `50`
- **Contact Famille** (Familljesektioun) → ouni Lizenz=`214` / mat Lizenz=`215`
- `0` = Kategorie nach ze komplettéieren (Secrétaire)

**Wichteg Regel:** En Arbitter kann een **réischt ab U13** sinn — d'"Och Arbitter"-Optioun ass fir U11/U9/U7 gespaart.

### Cotisatioun (automatesche Virschlag) — Tariffer Saison 2026-2027
- **Family Tarif** (2+) → **€384** (prioritär)
- **Officiels** (Officiel / Arbitter, ëmmer mat Lizenz) oder **Bénévole mat Lizenz** → **€50** — **och wann d'Persoun gläichzäiteg Spiller ass**
- **Kidssport & Loisirs** → **€10 par unité ou Family Tarif** (automatesch fir Kategorie **U4**)
- Soss no Alter: **> 25 Joer = Adulte Tarif €300** · **≤ 25 Joer = Youth Tarif €210**

> **Alterskategorien (`flhCategoryRules`):** fir Saison 2026-2027 sinn d'Gebuertsjoren ëm +1 verréckelt vs. 2025-2026, an **U4** (Gebuertsjoer 2022+) ass als jéngste Kategorie dobäigesat (= Kidssport). Ginn ugepasst soubaal d'FLH déi offiziell Daten fir 2026-2027 verëffentlecht.

> De Cotisatioun-Virschlag ass **just eng Uweisung** (kann ugepasst ginn) an de Betrag ka **op enger AG geännert ginn**, mat Wierkung fir déi kommend Saison. Den Titel + Hiweis sinn an alle 5 Sproochen iwwersat (`tarif` / `tarifHint` an `MERSCH75_UI_TEXTS`, gesat vun `updateLang`).

### Sheet-Marker (Off / SR)
- `roles` (Array) gëtt am Apps Script benotzt: enthält et `Officiel(le)` → Spalt **AK** = `x`; enthält et `Arbitre` → Spalt **AM** = `x` (och bei engem Spiller-Arbitter).

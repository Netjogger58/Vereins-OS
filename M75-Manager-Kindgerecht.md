# Das Vereins-OS — einfach erklärt (für alle, auch für Kinder)

> Diese Erklärung benutzt Bilder und Vergleiche, damit **jeder** versteht, was das große Computer-System des MERSCH75 ist, was es kann — und **wie es eigentlich funktioniert**.
>
> **Vier Farben zeigen dir den Baufortschritt:**
> 🟢 **fertig** = funktioniert heute schon · 🟡 **halb fertig** = man kann es schon benutzen, es fehlt noch etwas · 🧩 **Schublade ohne Knopf** = der Platz dafür ist da, die Bedienung fehlt noch · 🔵 **geplant** = die Idee steht, gebaut wird später.

---

## 0. Wie funktioniert so ein Computer-System überhaupt?

Bevor wir durch die Zimmer gehen, erklären wir das **Grundprinzip** — ganz einfach.

**Stell dir eine riesige Bibliothek mit einem sehr fleißigen Bibliothekar vor:**

- 📚 **Das Archiv (die Datenbank):** ganz hinten stehen Tausende beschriftete Schubladen. In jeder liegt eine Sorte Zettel: eine für Mitglieder, eine für Spiele, eine für das Geld. Nichts geht verloren, alles hat seinen festen Platz.
- 🧑‍� **Der Bibliothekar (der Server / das „Backend"):** Er ist der Einzige, der ins Archiv darf. Du rufst ihm zu, was du brauchst — er sucht den Zettel, schreibt etwas auf oder rechnet etwas aus und bringt dir das Ergebnis.
- 🖥️ **Der Tresen mit Knöpfen (dein Bildschirm / das „Frontend"):** Das ist die schöne Oberfläche auf Handy oder Computer. Hier drückst du Knöpfe und siehst Listen. Du musst nie selbst ins Archiv — du sagst es einfach dem Bibliothekar.

**So läuft jede einzelne Aktion ab (immer dasselbe Muster):**

1. Du **drückst einen Knopf** auf dem Bildschirm (z. B. „Anwesenheit speichern").
2. Dein Gerät schickt eine **kleine Nachricht** durchs Internet zum Bibliothekar: „Bitte das und das tun."
3. Der Bibliothekar **prüft deine Zugangskarte** (darfst du das überhaupt?), **erledigt die Aufgabe** und **legt den Zettel ins richtige Archiv-Fach**.
4. Er schickt dir **die Antwort zurück**, und dein Bildschirm zeigt sie an — oft in weniger als einer Sekunde.

> **Merksatz für Kinder:** Du klickst → die Nachricht reist durchs Internet → der Bibliothekar sucht/speichert im Archiv → die Antwort kommt zurück auf deinen Bildschirm. **Immer dieses Hin und Zurück.**

## 1. Das digitale Hauptquartier und das Grundstück � *(Haus gebaut)* / � *(Grundstück noch zu mieten)*

Stell dir vor, der Verein baut ein riesiges, unsichtbares **Hauptquartier im Internet**. Damit es stehen kann, mietet man ein **Grundstück im Internet** bei Firmen wie **Hetzner** oder **Hostinger** 🔵. Das „Grundstück" ist in Wahrheit ein **fremder Computer in einem großen Rechenzentrum**, der Tag und Nacht läuft. Darauf bauen wir unser System wie ein **Lego-Haus** 🟢 zusammen.

**So funktioniert's:** Damit das Haus auf jedem Grundstück gleich aufgebaut werden kann, stecken wir es in genormte **Umzugskartons** (das nennen Fachleute „Container" / *Docker*). Egal ob bei Hetzner oder woanders — man stellt die Kartons hin, öffnet sie, und das ganze Haus steht sofort wieder genauso da. Dadurch ist der Verein **nicht von einer einzigen Firma abhängig**.

Das Wichtigste: Der **Bauplan ist so ordentlich aufgeschrieben**, dass jederzeit ein anderes Vereinsmitglied, das sich ein bisschen mit Computern auskennt, den Schlüssel nehmen und das Haus weiterpflegen kann. Niemand muss Angst haben, dass alles zusammenbricht, wenn der erste Baumeister mal im Urlaub ist.

---

## 2. Die elektronischen Helfer

Rund um das Haus sollen kleine **Roboter-Helfer** arbeiten, die niemals müde werden:

- **Hermes – der Hausmeister** 🔵 *(geplant)*: Er läuft pausenlos ums Haus und schaut, ob alle Lichter brennen und die Türen funktionieren. *So funktioniert's:* Er „klopft" alle paar Minuten an jede Tür. Antwortet eine nicht, **schickt er sofort eine Warn-Nachricht** ans Komitee (z. B. aufs Handy).
- **Odysseus – der Briefträger** 🔵 *(geplant)*: Er rennt zu anderen Computern (zum **Handballverband**) und schreibt die neuesten Ergebnisse ab. *So funktioniert's:* Er ruft die Webseite des Verbands auf, **liest die Tabelle wie ein Mensch** und trägt die Zahlen automatisch in unser Archiv ein. *(Heute macht das schon ein einfacher Helfer im Haus — aber noch nicht der flinke, selbstständige Odysseus.)* 🟢
- **n8n – die Sortiermaschine** 🔵 *(geplant)*: Eine Maschine, die Aufgaben wie an einem **Fließband** aneinanderhängt. *So funktioniert's:* Kommt ein neues Mitglied, läuft das Band los: Mappe drucken → E-Mail schreiben → Rechnung vorbereiten — alles von allein, ohne dass jemand klickt.
- **Uptime Kuma – der Nachtwächter** 🔵 *(geplant)*: Prüft Tag und Nacht, ob alles läuft, und **schlägt sofort Alarm**, wenn etwas ausfällt.
- **Ollama – das Computergehirn** 🔵 *(geplant)*: Ein schlaues Gehirn **im eigenen Haus** (nicht im Internet), das die dicken Regel-Bücher gelesen hat und Fragen sofort beantwortet.

> Diese Helfer sind eine **tolle Idee für die Zukunft**. Heute funktioniert das Haus auch ohne sie schon sehr gut.

---

## 3. Das Schaufenster und die Zimmer

Das Hauptquartier hat ein **Schaufenster zur Straße**: die **öffentliche Webseite** (mersch75.lu) 🟢. *Heute* schreibt man Neuigkeiten noch von Hand ins Schaufenster. *Später* 🔵 soll sich das Schaufenster ganz von alleine aktualisieren.

**So soll das funktionieren:** Das Schaufenster fragt den Bibliothekar regelmäßig „Gibt es etwas Neues?". Schreibt drinnen jemand ein neues Ergebnis an die Tafel, holt das Schaufenster es sich und zeigt es draußen an — **niemand muss es zweimal eintippen**.

- **Das Finanz-Büro** 🟢: ein großer digitaler Tresor. *So funktioniert's:* Der Computer hat für jedes Mitglied einen Zettel „Beitrag bezahlt: ja/nein". Er zählt automatisch zusammen, **wer noch offen ist**, und kann auf Knopfdruck Erinnerungen erstellen.
- **Das Event-Zimmer** 🟢: Hier werden Feiern und Versammlungen geplant. *So funktioniert's:* Man legt ein Event an, alle bekommen eine Einladung und klicken **„komme" oder „komme nicht"** — der Computer führt die Liste automatisch.
- **Der Bestell-Schalter** 🟡 *(halb fertig)*: Spieler können Trikots oder Bälle wünschen; der volle Ablauf (bis zur Lieferung) wird noch ausgebaut.
- **Die Getränke- und Ticket-Kasse** 🔵 *(nur Idee)*: Soll später mitzählen, wie viele Tickets verkauft und wie viele Flaschen getrunken wurden. *Dieses Zimmer ist noch gar nicht gebaut.*

---

## 4. Die Zugangskarten (Rollen) 🟢

Weil das Haus so groß ist, darf nicht jeder in jedes Zimmer. Jedes Mitglied bekommt eine eigene **digitale Zugangskarte** (Fachleute sagen *Rollen* dazu):

- Der **Kassenwart** darf ins Finanz-Büro.
- Der **Trainer** darf zu den Trainingsplänen und zur Anwesenheitsliste.
- Der **Vorstand** darf fast überall hin und das Haus verwalten.
- Ein **normales Mitglied** darf nur in sein eigenes Zimmer (Profil, Rechnungen, Chat).

**So funktioniert's:** Wenn du etwas anklickst, schaut der Bibliothekar zuerst auf deine Karte: „Darf diese Person das?" Steht auf der Karte „nein", bleibt die Tür zu — so sieht niemand Dinge, die ihn nichts angehen. Das schützt die **Daten der anderen**.

---

## 5. Das Partner- und Sponsoren-Büro 🟡 *(erst angefangen)*

Firmen geben dem Verein Geld oder Ausrüstung; als Dankeschön kommt ihr Name aufs Trikot.

- **Der Vertragsschrank** 🔵: Der Computer soll sich für jede Firma genau merken, was abgemacht wurde, und prüfen, ob das Geld schon da ist. *So soll es funktionieren:* Für jeden Sponsor wird notiert, **was er gibt** (Geld, Trikots …) und **was er bekommt** (Logo, Freikarten …). Der Computer hakt dann ab, ob beide Seiten ihr Versprechen gehalten haben. *Heute ist das Zimmer erst leer eingerichtet, die Möbel kommen noch.*

---

## 6. Die Helfer-Zentrale (Bénévoles) 🟡/🔵

Ein Verein lebt von freiwilligen Helfern (auf Französisch *Bénévoles*).

- **Der Einsatzplan** 🟡: Helfer werden in Teams eingeteilt (Würstchenstand, Anzeigetafel, Auf- und Abbau …). *So funktioniert's:* Für jedes Spiel legt man fest, **welcher Posten besetzt sein muss**, und ordnet die Helfer zu.
- **Die Helfer-Uhr** 🔵 *(geplant)*: Soll später für jeden mitzählen, **wie viele Stunden** er im Jahr geholfen hat. *So soll es funktionieren:* Bei jedem Einsatz läuft eine digitale Stoppuhr; am Jahresende sieht man, wer am meisten geholfen hat, und kann sich richtig bedanken.

---

## 7. Die erweiterte Schatzkammer und das Akten-Archiv 🔵 *(noch Idee)*

Neben den normalen Beiträgen fließt beim Verein noch viel mehr Geld hinein und hinaus.

- **Die Trainer-Kasse**: Soll ausrechnen, wie viel ein bezahlter Trainer am Monatsende bekommt, und die Auszahlung anstoßen.
- **Die Spenden-Eimer**: Der Computer stellt **getrennte Eimer** auf — einen für Geld vom **Staat**, einen von der **Gemeinde**, einen für **Spender**, einen für **Mitglieder**. *So funktioniert's:* Jeder Euro wird gleich in den richtigen Eimer einsortiert, damit man immer weiß, **woher das Geld kommt**.
- **Der Antrags-Ordner**: Wenn der Verein den Staat um Geld bitten will, muss man lange Briefe schreiben. Der Computer **speichert alle fertigen Briefe** und hat ein Telefonbuch mit Links (z. B. Guichet.lu), wo man die neuesten Formulare holt.

> Diese Schatzkammer ist eine **gute Idee für später** — heute gibt es nur das normale Finanz-Büro (Kapitel 3).

---

## 8. Die Vereins-Polizei und der Arzt 🧩 *(Grundgerüst da)* / 🔵 *(Automatik geplant)*

- **Der Arzt-Stempel**: Vor dem ersten Spiel muss ein Arzt sagen, dass der Spieler gesund ist. *So soll es funktionieren:* Der Computer merkt sich das Ablauf-Datum und **warnt rechtzeitig** Spieler und Trainer. Ist der Stempel abgelaufen, **sperrt er den Spieler automatisch** fürs nächste Spiel.
- **Das Foto-Buch**: Nicht jedes Kind möchte, dass Fotos von ihm im Internet stehen. *So funktioniert's:* Der Computer führt eine Liste „darf fotografiert werden: ja/nein" und soll später **vor dem Veröffentlichen warnen** oder Fotos automatisch aussortieren. Das Grundgerüst ist da, die Automatik kommt noch.

---

## 9. Der Hallenplan und der Vereins-Bus 🟡/🧩

- **Der Raum-Verteiler** 🟡: ein großer Kalender für die Hallen. *So funktioniert's:* Will jemand eine Hallenzeit buchen, schaut der Computer nach, ob sie frei ist, und **verhindert Doppelbuchungen**. Bei einer kurzfristigen Sperrung sollen alle betroffenen Teams automatisch informiert werden. *(Grundzimmer steht, Feinschliff folgt.)*
- **Die Auto-Planung (Fahrgemeinschaften)** 🧩: Für Auswärtsspiele tragen Eltern ein, **wie viele freie Plätze** sie im Auto haben; der Computer verteilt die Kinder gerecht. *Heute hat der Computer schon die „Schubladen" dafür, aber noch keine Knöpfe — die Bedien-Oberfläche fehlt.*

---

## 10. Das geheime Funknetz und die Lagerhalle 🔵 *(alles geplant)*

- **Matrix – das Funknetz**: ein **eigenes** Kommunikationsnetz, das nur dem Verein gehört. *So funktioniert's:* Die Nachrichten werden **verschlüsselt** (wie in einer Geheimsprache), sodass niemand von außen mitlesen kann.
- **Element – das Funkgerät**: die App auf dem Handy, mit der man in dieses Funknetz schreibt.
- **Mautrix – der Übersetzer**: eine **Brücke**, die Nachrichten zwischen dem Funknetz und **WhatsApp/Signal** hin- und herübersetzt. *(Wichtig: **Matrix** = das Funknetz, **Mautrix** = die Brücke dorthin — zwei verschiedene Dinge!)*
- **Nextcloud – die Lagerhalle**: eine riesige Festplatte für Fotos und große Dokumente, **bei der die Daten dem Verein gehören** (nicht einer fremden Firma).

> Heute hat das Haus schon einen **einfachen internen Chat** 🟡; das große Funknetz ist die Zukunfts-Idee.

---

## 11. Der feuersichere Safe (Datensicherung) 🔵 *(noch geplant)*

Das Hauptquartier im Internet könnte durch einen Fehler kaputtgehen. Darum soll der Computer **jede Nacht eine Kopie** von allen wichtigen Papieren machen.

**So soll das funktionieren:** Mitten in der Nacht, wenn keiner arbeitet, packt der Computer alle Zettel in ein **abgeschlossenes Paket** (verschlüsselt) und schickt es übers Internet in einen **Tresor beim Verein zu Hause** — z. B. einen **alten iMac mit großer Festplatte** oder ein QNAP-Gerät. Geht im Rechenzentrum etwas kaputt, nimmt man die Kopie aus dem Tresor und **baut alles in kurzer Zeit wieder auf**. *Dieser Safe wird noch eingebaut.*

---

## 12. Wie groß ist das Projekt? 🟢

Das System ist riesig — wie Programme großer Firmen:

- **Über 16.700 Code-Zeilen**: Das sind die Anweisungen, die dem Computer ganz genau sagen, was er tun soll. (Ein dickes Buch hat ungefähr so viele Zeilen.)
- **80 Schubladen** (Datenbank-Tabellen): so viele verschiedene Sorten von Zetteln gibt es im Archiv.
- **233 Bedienfelder** (Schalter): so viele verschiedene Aktionen kann man auslösen.

> Zum Vergleich: Das ist die Größenordnung eines **kleinen Programms, das man sonst teuer kaufen würde** — hier gehört es dem Verein selbst.

---

## 13. Wie ist das Haus aufgebaut? 🟢

Erinnerst du dich an die Bibliothek aus Kapitel 0? Das Haus hat genau **drei Stockwerke**, die zusammenarbeiten:

- **Das Archiv (Datenbank)**: der Tresor, in dem jedes Mitglied, jedes Spiel und jeder Euro ein eigenes Fach hat.
- **Der Motor (Backend)**: der fleißige Bibliothekar im Hintergrund, der Daten sucht, vorbereitet und verschickt.
- **Das Kontrollzentrum (Frontend)**: die schönen Bildschirme und Knöpfe, die du siehst und bedienst.

**So funktioniert's:** Die drei reden immer in derselben Reihenfolge miteinander — **Kontrollzentrum fragt → Motor sucht im Archiv → Antwort zurück**. Genau das Hin und Zurück aus Kapitel 0.

---

## 14. Wie sieht es aus? 🟢

- **Design**: modern wie Apps auf einem Apple-Gerät — runde Kanten, weiche Hintergründe.
- **Farben**: Hell- und Dunkel-Modus; das **Vereinsgelb** hebt wichtige Knöpfe hervor.
- **Ziel**: so aufgeräumt, dass jeder sofort weiß, wo er klicken muss.

---

## 15. Welche Zimmer sind schon fertig?

- 🟢 **Fertige Zimmer**: Login, Spiele, Beiträge-Kasse, Trainingspläne, Check-in, Statistiken, Anwesenheit, Kalender, Dokumente.
- 🟡 **Halbe Baustellen**: Chat, Profile, Anmeldungen, Website-Hub, Shop, Sponsoren, Galerie.
- 🧩 **Schubladen ohne Knöpfe**: Schiedsrichter, Verletzungen, Fahrgemeinschaften, Saison-Archiv — die Schublade ist da, der Knopf zum Bedienen fehlt noch.
- 🔵 **Nur als Idee geplant**: Getränke-/Ticket-Kasse, Gehälter, Subventionen, KI, Funknetz, nächtlicher Safe.

---

## 16. Künstliche Intelligenz und Automatik 🔵 *(geplant)*

- **Das Computergehirn (Ollama)**: ein schlaues Gehirn, das **im eigenen Haus** läuft (die Fragen wandern nicht zu einer fremden Firma im Internet). *So funktioniert's:* Es hat die dicken Handball-Regeln gelesen; stellt jemand eine Frage, sucht es die passende Stelle und antwortet **mit Quellenangabe** („das steht in Regel X"). Es kann sogar aus den eingegebenen Toren und Strafen **einen Spielbericht schreiben**.
- **Das Fließband (n8n)**: Kettenreaktionen **ohne Klicks**. *So funktioniert's:* Ein Auslöser (z. B. „neues Mitglied") startet eine feste Reihenfolge — Mappe drucken → E-Mail schicken → Rechnung vorbereiten — und alles passiert von allein im Hintergrund.

---

## 17. Was wird als Nächstes gebaut?

1. Die **leeren Räume** füllen (zuerst Sponsoren, Galerie, Saison-Archiv).
2. Dem **Hausmeister Hermes** beibringen, das Haus zu überwachen.
3. Das **KI-Gehirn** einbauen und ein Menü, um es zu steuern und zu aktualisieren.
4. Die **Test-Passwörter** entfernen, bevor echte Menschen das System nutzen.
5. Den **feuersicheren Safe** (nächtliche Kopie) einbauen.

---

*Diese kindgerechte Erklärung gehört zur technischen Doku `M75-Manager-Technik.md`. Die Farben 🟢/🟡/🔵 zeigen ehrlich, was schon fertig ist und was noch gebaut wird (Stand 29.06.2026).*

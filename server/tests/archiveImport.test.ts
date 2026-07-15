import { describe, it, expect } from "vitest";
import {
  stripTags,
  extractTeamName,
  parseSummary,
  parseFinalRank,
  parseDateGerman,
  parseMatchRows,
  parseTopScorers,
} from "../archiveImport";

const sampleHtml = `
<h2 class="sec-head" style="--tc:#002f65;">Herren 1</h2>
<div class="sum-bar">
  <div class="sum-item"><span class="sum-val">20</span><span class="sum-lbl">Spiele</span></div>
  <div class="sum-item s-win"><span class="sum-val">8</span><span class="sum-lbl">Siege</span></div>
  <div class="sum-item s-draw"><span class="sum-val">3</span><span class="sum-lbl">Unentsch.</span></div>
  <div class="sum-item s-loss"><span class="sum-val">9</span><span class="sum-lbl">Niederlagen</span></div>
  <div class="sum-item"><span class="sum-val">601:664</span><span class="sum-lbl">Tore</span></div>
  <div class="sum-item"><span class="sum-val">-63</span><span class="sum-lbl">Tordiff.</span></div>
  <div class="sum-item s-pkt"><span class="sum-val">19</span><span class="sum-lbl">Punkte</span></div>
</div>
<table class="flht">
  <tbody>
    <tr class="mersch"><td><span class="pos-medal pos-3">3</span>Mersch75</td><td>10</td></tr>
  </tbody>
</table>
<h3 class="sub-head">1. Tour - Spiele H-PRO</h3>
<table class="m75t">
  <thead><tr><th>Datum</th><th>H/A</th><th>Gegner</th><th>Resultat</th><th>Ergebnis</th><th>SBO</th></tr></thead>
  <tbody>
    <tr><td class="td-date">12.10.25 18:15</td><td>🏠</td><td class="td-name">HC Redange</td><td class="td-score win">35:24</td><td><span class="badge b-win">Sieg</span></td><td>-</td></tr>
    <tr><td class="td-date">17.10.25 20:15</td><td>✈️</td><td class="td-name">HB Leideleng</td><td class="td-score loss">30:34</td><td><span class="badge b-loss">Niederlage</span></td><td>-</td></tr>
  </tbody>
</table>
<h3 class="sub-head">🏆 Torschützenliste</h3>
<table class="m75t">
  <thead><tr><th>Spieler/in</th><th class="num">Tore</th></tr></thead>
  <tbody>
    <tr><td class="td-name">Charles Epps</td><td class="num td-goals">159</td></tr>
    <tr><td class="td-name">Alex Diedenhofen</td><td class="num td-goals">76</td></tr>
  </tbody>
</table>
`;

describe("archiveImport parser", () => {
  it("stripTags entfernt HTML-Tags", () => {
    expect(stripTags("<span>foo</span> bar")).toBe("foo bar");
  });

  it("extractTeamName ließt den Mannschaftsnamen aus", () => {
    expect(extractTeamName(sampleHtml)).toBe("Herren 1");
  });

  it("parseSummary extrahiert Bilanz", () => {
    const s = parseSummary(sampleHtml)!;
    expect(s.matchesPlayed).toBe(20);
    expect(s.matchesWon).toBe(8);
    expect(s.matchesDrawn).toBe(3);
    expect(s.matchesLost).toBe(9);
    expect(s.goalsFor).toBe(601);
    expect(s.goalsAgainst).toBe(664);
    expect(s.goalDifference).toBe(-63);
    expect(s.points).toBe(19);
  });

  it("parseFinalRank findet letzte Mersch-Position", () => {
    expect(parseFinalRank(sampleHtml)).toBe(3);
  });

  it("parseDateGerman wandelt Datumsformat um", () => {
    expect(parseDateGerman("12.10.25 18:15")).toBe("2025-10-12");
    expect(parseDateGerman("05.02.26")).toBe("2026-02-05");
    expect(parseDateGerman("invalid")).toBeNull();
  });

  it("parseMatchRows extrahiert Heim- und Auswärts-Spiele", () => {
    const matches = parseMatchRows(sampleHtml, "Herren 1");
    expect(matches).toHaveLength(2);
    const home = matches.find(m => m.opponent === "HC Redange")!;
    expect(home.venue).toBe("home");
    expect(home.homeGoals).toBe(35);
    expect(home.awayGoals).toBe(24);
    expect(home.result).toBe("win");

    const away = matches.find(m => m.opponent === "HB Leideleng")!;
    expect(away.venue).toBe("away");
    expect(away.homeGoals).toBe(30);
    expect(away.awayGoals).toBe(34);
    expect(away.result).toBe("win");
  });

  it("parseTopScorers extrahiert Torschützen", () => {
    const scorers = parseTopScorers(sampleHtml);
    expect(scorers).toHaveLength(2);
    expect(scorers[0].name).toBe("Charles Epps");
    expect(scorers[0].goals).toBe(159);
    expect(scorers[1].name).toBe("Alex Diedenhofen");
    expect(scorers[1].goals).toBe(76);
  });
});

import fs from "fs";
import path from "path";
import { db } from "./storage";
import { archiveSeasons, archiveTeams, archiveMatches, archiveMembers } from "../shared/schema";
import { eq, desc } from "drizzle-orm";

const WEBSITE_DIR = path.resolve(process.cwd(), "..", "mersch75test.github.io");

const STAT_FILES: { file: string; category: string; defaultName: string }[] = [
  { file: "Statistics Men.html", category: "Herren", defaultName: "Herren 1" },
  { file: "Statistics women.html", category: "Frauen", defaultName: "Frauen 1" },
  { file: "Statistics U15.html", category: "U15", defaultName: "U15" },
  { file: "Statistics U13.html", category: "U13", defaultName: "U13" },
  { file: "Statistics U11.html", category: "U11", defaultName: "U11 Elite" },
];

export function stripTags(str: string): string {
  return str.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractTeamName(html: string): string {
  const m = html.match(/<h2[^>]*class="sec-head"[^>]*>([^<]+)<\/h2>/);
  return m ? stripTags(m[1]) : "";
}

export function parseSummary(html: string) {
  const sum = html.match(/<div class="sum-bar">([\s\S]*?)<\/div>\s*(?=<div class="card-body">|<\/section>|<table|<h3)/);
  if (!sum) return null;
  const labels = Array.from(sum[1].matchAll(/<span class="sum-lbl">([^<]+)<\/span>/g), x => stripTags(x[1]));
  const values = Array.from(sum[1].matchAll(/<span class="sum-val">([^<]+)<\/span>/g), x => stripTags(x[1]));
  const out: Record<string, string> = {};
  labels.forEach((l, i) => { if (values[i]) out[l] = values[i]; });
  const map: Record<string, string> = { "Spiele": "matchesPlayed", "Siege": "matchesWon", "Unentsch.": "matchesDrawn", "Niederlagen": "matchesLost", "Tore": "goals", "Tordiff.": "diff", "Punkte": "points" };
  const res: any = {};
  for (const [k, v] of Object.entries(out)) {
    const key = map[k.trim()];
    if (!key) continue;
    if (key === "goals") {
      const [a, b] = v.split(":").map(x => parseInt(x, 10));
      res.goalsFor = a || 0; res.goalsAgainst = b || 0;
    } else if (key === "diff") {
      res.goalDifference = parseInt(v, 10) || 0;
    } else {
      res[key] = parseInt(v, 10) || 0;
    }
  }
  return res;
}

export function parseFinalRank(html: string): number | null {
  const merschRows = Array.from(html.matchAll(/<tr class="mersch">([\s\S]*?)<\/tr>/g));
  const last = merschRows[merschRows.length - 1];
  if (!last) return null;
  const medal = last[1].match(/pos-medal[^>]*>(\d+)/);
  return medal ? parseInt(medal[1], 10) : null;
}

export function parseDateGerman(dateStr: string): string | null {
  // e.g. "12.10.25 18:15"
  const m = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})(?:\s+\d{1,2}:\d{2})?/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  let year = parseInt(m[3], 10);
  year += year < 50 ? 2000 : 1900;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseMatchRows(html: string, teamName: string): any[] {
  const matches: any[] = [];
  // Split by h3 section headings so we can tag phase/competition
  const parts = html.split(/<h3 class="sub-head">([^<]*)<\/h3>/);
  let currentPhase = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) currentPhase = stripTags(parts[i]);
    const block = parts[i];
    if (!block.includes("<table")) continue;
    const isSpiele = currentPhase.toLowerCase().includes("spiele") || currentPhase.toLowerCase().includes("pokal");
    if (!isSpiele) continue;
    const cup = currentPhase.toLowerCase().includes("pokal") ? "Coupe" : currentPhase;
    const tbodyMatch = block.match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (!tbodyMatch) continue;
    const rows = Array.from(tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g));
    for (const row of rows) {
      const cells = Array.from(row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g), x => x[1].trim());
      if (cells.length < 5) continue;
      const dateStr = stripTags(cells[0]);
      const venue = stripTags(cells[1]);
      const opponent = stripTags(cells[2]);
      const scoreStr = stripTags(cells[3]);
      const date = parseDateGerman(dateStr);
      if (!date || !scoreStr.includes(":")) continue;
      const [s1, s2] = scoreStr.split(":").map(x => parseInt(x, 10));
      if (Number.isNaN(s1) || Number.isNaN(s2)) continue;
      const isHome = venue === "🏠";
      const homeGoals = s1;
      const awayGoals = s2;
      const merschGoals = isHome ? s1 : s2;
      const oppGoals = isHome ? s2 : s1;
      const result = merschGoals > oppGoals ? "win" : merschGoals < oppGoals ? "loss" : "draw";
      matches.push({
        date,
        opponent,
        venue: isHome ? "home" : "away",
        homeGoals,
        awayGoals,
        result,
        notes: cup,
      });
    }
  }
  return matches;
}

export function parseTopScorers(html: string): { name: string; goals: number }[] {
  const scorers: { name: string; goals: number }[] = [];
  const tables = Array.from(html.matchAll(/<table class="m75t">([\s\S]*?)<\/table>/g));
  for (const table of tables) {
    if (!table[1].includes("Torschützenliste") && !table[1].includes("Spieler/in")) continue;
    const tbody = table[1].match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (!tbody) continue;
    const rows = Array.from(tbody[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g));
    for (const row of rows) {
      const cells = Array.from(row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g), x => x[1].trim());
      if (cells.length < 2) continue;
      const name = stripTags(cells[0]);
      const goals = parseInt(stripTags(cells[1]), 10);
      if (name && !Number.isNaN(goals)) scorers.push({ name, goals });
    }
  }
  return scorers;
}

export interface ArchiveImportResult {
  seasonId: number;
  teams: { name: string; id: number; matches: number; scorers: number }[];
}

export async function importArchiveSeasonFromWebsite(input: { seasonName: string; startDate: string; endDate: string }): Promise<ArchiveImportResult> {
  const existing = db.select().from(archiveSeasons).where(eq(archiveSeasons.name, input.seasonName)).get();
  let season: any;
  if (existing) {
    season = existing;
  } else {
    season = db.insert(archiveSeasons).values({
      name: input.seasonName,
      startDate: input.startDate,
      endDate: input.endDate,
      description: `Importiert aus Website-Statistikseiten am ${new Date().toISOString().slice(0, 10)}`,
      active: false,
    }).returning().get();
  }
  const seasonId = season.id;
  const result: ArchiveImportResult = { seasonId, teams: [] };

  for (const { file, category, defaultName } of STAT_FILES) {
    const p = path.join(WEBSITE_DIR, file);
    if (!fs.existsSync(p)) continue;
    const html = fs.readFileSync(p, "utf-8");
    const teamName = extractTeamName(html) || defaultName;
    const summary = parseSummary(html) || {};
    const finalRank = parseFinalRank(html);

    const team = db.insert(archiveTeams).values({
      seasonId,
      name: teamName,
      category,
      finalRank: finalRank ?? null,
      matchesPlayed: summary.matchesPlayed ?? 0,
      matchesWon: summary.matchesWon ?? 0,
      matchesDrawn: summary.matchesDrawn ?? 0,
      matchesLost: summary.matchesLost ?? 0,
      goalsFor: summary.goalsFor ?? 0,
      goalsAgainst: summary.goalsAgainst ?? 0,
      points: summary.points ?? 0,
    }).returning().get();

    const matches = parseMatchRows(html, teamName);
    let insertedMatches = 0;
    for (const m of matches) {
      db.insert(archiveMatches).values({ ...m, seasonId, teamId: team.id }).run();
      insertedMatches++;
    }

    const scorers = parseTopScorers(html);
    let insertedScorers = 0;
    for (const s of scorers) {
      db.insert(archiveMembers).values({
        seasonId,
        teamId: team.id,
        name: s.name,
        goals: s.goals,
        matchesPlayed: 0,
      }).run();
      insertedScorers++;
    }

    result.teams.push({ name: teamName, id: team.id, matches: insertedMatches, scorers: insertedScorers });
  }

  return result;
}

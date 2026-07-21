import { Router, type Response, type Request } from "express";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertMatchSchema, insertMatchGoalSchema, insertStandingSchema } from "@shared/schema";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function registerMatchRoutes(app: any) {
  const router = Router();

  // ─── Matches (Spiele & Ergebnisse) ───────────────────────
  router.get("/", requireAuth(), async (req: Request, res: Response) => {
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    const season = req.query.season as string | undefined;
    const status = req.query.status as string | undefined;
    const competition = req.query.competition as string | undefined;
    res.json(await storage.listMatches({ teamId, season, status, competition }));
  });

  router.get("/:id", requireAuth(), async (req: Request, res: Response) => {
    const match = await storage.getMatch(parseInt(qs(req.params.id)!));
    if (!match) return res.status(404).json({ message: "Spiel nicht gefunden" });
    // Get goals for this match
    const goals = await storage.listMatchGoals(match.id);
    res.json({ ...match, goals });
  });

  router.post("/", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertMatchSchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMatch(parsed.data));
  });

  router.patch("/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const updated = await storage.updateMatch(parseInt(qs(req.params.id)!), req.body);
    if (!updated) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(updated);
  });

  router.delete("/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteMatch(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Match Goals (Torschützen) ────────────────────────────
  router.get("/:id/goals", requireAuth(), async (req: Request, res: Response) => {
    const goals = await storage.listMatchGoals(parseInt(qs(req.params.id)!));
    res.json(goals);
  });

  router.post("/:id/goals", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertMatchGoalSchema.safeParse({
      ...req.body,
      matchId: parseInt(qs(req.params.id)!),
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMatchGoal(parsed.data));
  });

  app.delete("/api/match-goals/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteMatchGoal(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Standings (Tabellen) ─────────────────────────────────
  app.get("/api/standings", requireAuth(), async (req: Request, res: Response) => {
    const competition = req.query.competition as string;
    const season = req.query.season as string;
    if (!competition || !season) {
      return res.status(400).json({ message: "competition und season erforderlich" });
    }
    res.json(await storage.listStandings(competition, season));
  });

  app.post("/api/standings/calculate", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { competition, season } = req.body;
    if (!competition || !season) {
      return res.status(400).json({ message: "competition und season erforderlich" });
    }
    await storage.calculateStandings(competition, season);
    const standings = await storage.listStandings(competition, season);
    res.json({ success: true, standings });
  });


  // ─── Spielplan Import (Premium: .ics / .csv) ────────────
  function parseSchedule(content: string, type: string, teamId: number, season: string, competition: string, teamName: string) {
    const rows: any[] = [];
    if (type === "ics") {
      const events = content.split("BEGIN:VEVENT").slice(1);
      for (const raw of events) {
        const lines = raw.split(/\r?\n/);
        let summary = "";
        let dt = "";
        let location = "";
        let description = "";
        for (const line of lines) {
          if (line.startsWith("SUMMARY")) summary = line.split(":").slice(1).join(":").replace(/\\,/g, ",").replace(/\\n/g, " ").trim();
          if (line.startsWith("DTSTART")) dt = (line.split(":").pop() || "").trim();
          if (line.startsWith("LOCATION")) location = line.split(":").slice(1).join(":").replace(/\\,/g, ",").replace(/\\n/g, " ").trim();
          if (line.startsWith("DESCRIPTION")) description = line.split(":").slice(1).join(":").replace(/\\n/g, " ").trim();
        }
        if (!dt) continue;
        const date = `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`;
        const time = dt.length > 8 ? `${dt.slice(9, 11)}:${dt.slice(11, 13)}` : null;
        let home = "";
        let away = "";
        for (const sep of [" - ", " – ", " vs ", " vs. ", " -", "–"]) {
          if (summary.includes(sep)) { [home, away] = summary.split(sep); break; }
        }
        if (!home || !away) continue;
        const comp = competition || description.split(/\\n|\n/)[0].trim() || "Liga";
        const isHome = home.toLowerCase().includes(teamName.toLowerCase());
        rows.push({ teamId, season, competition: comp, matchType: "league", matchDate: date, matchTime: time, homeTeam: home.trim(), awayTeam: away.trim(), venue: location || null, isHome, status: "scheduled" });
      }
    } else if (type === "csv") {
      const lines = content.replace(/\r\n/g, "\n").split("\n").filter(l => l.trim());
      if (lines.length < 2) return rows;
      const delimiter = lines[0].includes(";") ? ";" : ",";
      const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
      const homeIdx = headers.findIndex(h => ["heim", "home", "heimmannschaft", "heimteam"].includes(h));
      const awayIdx = headers.findIndex(h => ["gast", "away", "auswärts", "auswaerts", "gegner"].includes(h));
      const dateIdx = headers.findIndex(h => ["datum", "date", "spieldatum", "tag"].includes(h));
      const timeIdx = headers.findIndex(h => ["zeit", "time", "uhrzeit", "anpfiff"].includes(h));
      const venueIdx = headers.findIndex(h => ["halle", "ort", "spielort", "location", "venue", "spielstätte"].includes(h));
      const compIdx = headers.findIndex(h => ["liga", "wettbewerb", "competition", "runde"].includes(h));
      if (homeIdx === -1 || awayIdx === -1 || dateIdx === -1) return rows;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim());
        const home = cols[homeIdx];
        const away = cols[awayIdx];
        const rawDate = cols[dateIdx];
        let date = rawDate;
        const dotMatch = rawDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        if (dotMatch) date = `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
        else {
          const slashMatch = rawDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (slashMatch) date = `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
          else if (/^\d{8}$/.test(rawDate)) date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
        }
        const time = timeIdx >= 0 ? cols[timeIdx].slice(0, 5) : null;
        const venue = venueIdx >= 0 ? cols[venueIdx] || null : null;
        const comp = (compIdx >= 0 ? cols[compIdx] : null) || competition || "Liga";
        const isHome = home.toLowerCase().includes(teamName.toLowerCase());
        rows.push({ teamId, season, competition: comp, matchType: "league", matchDate: date, matchTime: time, homeTeam: home, awayTeam: away, venue, isHome, status: "scheduled" });
      }
    }
    return rows;
  }

  app.post("/api/matches/import/preview", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { teamId, season, competition, type, content } = req.body;
    if (!teamId || !season || !type || !content) return res.status(400).json({ message: "teamId, season, type, content erforderlich" });
    const team = await storage.getTeam(Number(teamId));
    if (!team) return res.status(404).json({ message: "Team nicht gefunden" });
    const rows = parseSchedule(content, type, Number(teamId), season, competition || "", team.name);
    res.json({ rows });
  });

  app.post("/api/matches/import", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { teamId, season, competition, type, content } = req.body;
    if (!teamId || !season || !type || !content) return res.status(400).json({ message: "teamId, season, type, content erforderlich" });
    const team = await storage.getTeam(Number(teamId));
    if (!team) return res.status(404).json({ message: "Team nicht gefunden" });
    const rows = parseSchedule(content, type, Number(teamId), season, competition || "", team.name);
    let created = 0;
    for (const row of rows) {
      await storage.createMatch({ ...row, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), notes: "" } as any);
      created++;
    }
    res.json({ created, rows });
  });

  app.use("/api/matches", router);
}

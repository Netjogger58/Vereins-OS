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


  app.use("/api/matches", router);
}

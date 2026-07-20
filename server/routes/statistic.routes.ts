import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { randomBytes } from "node:crypto";
import { insertTrainingScheduleSchema } from "@shared/schema";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}


const CARD_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateCardId(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += CARD_ID_ALPHABET[bytes[i] % CARD_ID_ALPHABET.length];
  return out;
}
async function generateUniqueTrainerCode(): Promise<string> {
  for (let tries = 0; tries < 8; tries++) {
    const id = generateCardId();
    const existing = await storage.getTrainerCodeByCode(id);
    if (!existing) return id;
  }
  return generateCardId();
}
async function resolveTrainerTeamIds(code: { allTeams: boolean; teamIds: string | null }): Promise<number[]> {
  if (code.allTeams) return (await storage.listTeams()).map((t) => t.id);
  try {
    const parsed = JSON.parse(code.teamIds || "[]");
    return Array.isArray(parsed) ? parsed.map((n: any) => Number(n)).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

export function registerStatisticRoutes(app: any) {
  const router = Router();

  // ─── Statistics ────────────────────────────────────────
  router.get("/statistics/members", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    res.json(await storage.getMemberStatistics());
  });

  router.get("/statistics/finance", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    res.json(await storage.getFinancialStatistics(year));
  });

  router.get("/statistics/fees", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    res.json(await storage.getFeeStatistics(year));
  });

  router.get("/statistics/attendance", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    const month = req.query.month as string | undefined;
    res.json(await storage.getAttendanceStatistics(teamId, month));
  });

  // ─── Training Schedules ────────────────────────────────
  router.get("/training-schedules", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    res.json(await storage.listTrainingSchedules(teamId));
  });

  router.get("/training-schedules/:id", requireAuth(), async (req: Request, res: Response) => {
    const schedule = await storage.getTrainingSchedule(parseInt(qs(req.params.id)!));
    if (!schedule) return res.status(404).json({ message: "Trainingsplan nicht gefunden" });
    res.json(schedule);
  });

  router.post("/training-schedules", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertTrainingScheduleSchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createTrainingSchedule(parsed.data));
  });

  router.patch("/training-schedules/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const updated = await storage.updateTrainingSchedule(parseInt(qs(req.params.id)!), req.body);
    if (!updated) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(updated);
  });

  router.delete("/training-schedules/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteTrainingSchedule(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // Generate events from schedules
  router.post("/training-schedules/generate", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate und endDate erforderlich" });
    }
    const requestedTeamId: number | undefined = req.body.teamId ? Number(req.body.teamId) : undefined;

    // Trainer dürfen nur die Teams generieren, die ihr Trainer-Code abdeckt.
    if (authed.user!.role === "trainer") {
      const code = await storage.getTrainerCodeByUser(authed.user!.id);
      // Fallback auf altes Einzel-Team, falls (noch) kein Trainer-Code vorhanden ist
      const allowed = code
        ? await resolveTrainerTeamIds(code)
        : (authed.user!.teamId ? [authed.user!.teamId] : []);
      if (allowed.length === 0) {
        return res.status(400).json({ message: "Keine Teams zugeordnet" });
      }
      // Bestimmtes Team gewünscht → muss erlaubt sein
      if (requestedTeamId) {
        if (!allowed.includes(requestedTeamId)) {
          return res.status(403).json({ message: "Dieses Team ist deinem Code nicht zugeordnet" });
        }
        const count = await storage.generateEventsFromSchedules(startDate, endDate, requestedTeamId);
        return res.json({ success: true, generatedCount: count });
      }
      // Kein Team gewählt → für alle erlaubten Teams generieren
      let total = 0;
      for (const tId of allowed) {
        total += await storage.generateEventsFromSchedules(startDate, endDate, tId);
      }
      return res.json({ success: true, generatedCount: total });
    }

    // Admin/Präsident/Sekretär: optional ein Team, sonst alle
    const count = await storage.generateEventsFromSchedules(startDate, endDate, requestedTeamId);
    res.json({ success: true, generatedCount: count });
  });

  // ─── Player Statistics (Spielerstatistiken) ────────────────
  router.get("/player-statistics", requireAuth(), async (req: Request, res: Response) => {
    const playerId = req.query.playerId ? parseInt(req.query.playerId as string) : undefined;
    const season = req.query.season as string | undefined;
    
    if (!playerId) {
      return res.status(400).json({ message: "playerId erforderlich" });
    }
    
    const stats = await storage.getPlayerStatistics(playerId, season);
    res.json(stats);
  });

  router.get("/top-scorers", requireAuth(), async (req: Request, res: Response) => {
    const competition = req.query.competition as string | undefined;
    const season = req.query.season as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const topScorers = await storage.getTopScorers(competition, season, limit);
    res.json(topScorers);
  });

  // ─── FLH Import (handball4all.de Import) ──────────────────
  router.post("/matches/import-flh", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { url, teamId, season, htmlContent } = req.body;
    if (!url || !teamId || !season) {
      return res.status(400).json({ message: "url, teamId und season erforderlich" });
    }
    
    // Import from FLH
    const { importMatchFromFLH } = await import("../flhImport.js");
    const result = await importMatchFromFLH(url, parseInt(teamId), season, htmlContent);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  });

  router.post("/matches/batch-import-flh", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { urls, teamId, season } = req.body;
    if (!urls || !Array.isArray(urls) || !teamId || !season) {
      return res.status(400).json({ message: "urls (Array), teamId und season erforderlich" });
    }
    
    const { batchImportFLH } = await import("../flhImport.js");
    const results = await batchImportFLH(urls, parseInt(teamId), season);
    
    res.json(results);
  });

  // ─── SBO-Archiv (eege Kopie vun de Handball4All-Berichter) ─
  router.post("/matches/:id/archive-sbo", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { archiveMatchSbo } = await import("../sboArchive.js");
    const result = await archiveMatchSbo(parseInt(String(req.params.id)), { force: !!req.body?.force });
    res.status(result.success ? 200 : 400).json(result);
  });

  router.post("/matches/archive-sbo-all", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { teamId, season, competition, force } = req.body || {};
    const filter: { teamId?: number; season?: string; competition?: string } = {};
    if (teamId) filter.teamId = parseInt(teamId);
    if (season) filter.season = season;
    if (competition) filter.competition = competition;
    const { batchArchiveSbo } = await import("../sboArchive.js");
    const results = await batchArchiveSbo(filter, { force: !!force });
    res.json(results);
  });


  app.use("/api/statistics", router);
}

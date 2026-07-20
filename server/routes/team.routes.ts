import { Router, type Response, type Request } from "express";
import { randomBytes } from "node:crypto";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertTeamSchema, insertTrainerCodeSchema } from "@shared/schema";

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

export function registerTeamRoutes(app: any) {
  const router = Router();

  // ─── Teams ─────────────────────────────────────────────
  router.get("/", requireAuth(), async (_req: Request, res: Response) => {
    res.json(await storage.listTeams());
  });
  router.post("/", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    const parsed = insertTeamSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createTeam(parsed.data));
  });
  router.patch("/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    const team = await storage.updateTeam(Number(req.params.id), req.body);
    res.json(team);
  });
  router.delete("/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    await storage.deleteTeam(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Trainer-Codes ────────────────────────────────────
  // Verwaltung: 8-stellige Zugangscodes für Trainer, gültig für alle oder ausgewählte Teams.
  app.get("/api/trainer-codes", requireAuth(["präsident", "admin", "secretaire"]), async (_req: Request, res: Response) => {
    res.json(await storage.listTrainerCodes());
  });

  // Eigener Code + abgedeckte Teams des eingeloggten Nutzers (für Trainingsgenerierung)
  app.get("/api/trainer-codes/me", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const code = await storage.getTrainerCodeByUser(authed.user!.id);
    if (!code) return res.json(null);
    res.json({ ...code, teamIdsResolved: await resolveTrainerTeamIds(code) });
  });

  app.post("/api/trainer-codes", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ message: "Name erforderlich" });
    const allTeams = !!req.body?.allTeams;
    const teamIds = Array.isArray(req.body?.teamIds)
      ? req.body.teamIds.map((n: any) => Number(n)).filter((n: number) => !Number.isNaN(n))
      : [];
    const code = await generateUniqueTrainerCode();
    const created = await storage.createTrainerCode({
      code,
      name,
      userId: req.body?.userId ? Number(req.body.userId) : null,
      allTeams,
      teamIds: JSON.stringify(teamIds),
      active: true,
    });
    res.json(created);
  });

  app.patch("/api/trainer-codes/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    const data: Record<string, any> = {};
    if (req.body?.name !== undefined) data.name = String(req.body.name).trim();
    if (req.body?.userId !== undefined) data.userId = req.body.userId ? Number(req.body.userId) : null;
    if (req.body?.allTeams !== undefined) data.allTeams = !!req.body.allTeams;
    if (req.body?.active !== undefined) data.active = !!req.body.active;
    if (req.body?.teamIds !== undefined) {
      const teamIds = Array.isArray(req.body.teamIds)
        ? req.body.teamIds.map((n: any) => Number(n)).filter((n: number) => !Number.isNaN(n))
        : [];
      data.teamIds = JSON.stringify(teamIds);
    }
    const updated = await storage.updateTrainerCode(Number(req.params.id), data);
    if (!updated) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(updated);
  });

  app.delete("/api/trainer-codes/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    await storage.deleteTrainerCode(Number(req.params.id));
    res.json({ ok: true });
  });

  // Trainer gibt seinen Code bei einem Team ein, wo er helfen möchte → Team wird hinzugefügt.
  app.post("/api/trainer-codes/redeem", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const codeStr = String(req.body?.code || "").trim().toUpperCase();
    const teamId = Number(req.body?.teamId);
    if (!codeStr || !teamId) return res.status(400).json({ message: "Code und teamId erforderlich" });
    const code = await storage.getTrainerCodeByCode(codeStr);
    if (!code || !code.active) return res.status(404).json({ message: "Code ungültig" });
    if (code.allTeams) return res.json({ ...code, message: "Code gilt bereits für alle Teams" });
    const team = await storage.getTeam(teamId);
    if (!team) return res.status(404).json({ message: "Team nicht gefunden" });
    const current = await resolveTrainerTeamIds(code);
    if (!current.includes(teamId)) current.push(teamId);
    const updated = await storage.updateTrainerCode(code.id, { teamIds: JSON.stringify(current) });
    res.json(updated);
  });


  app.use("/api/teams", router);
}

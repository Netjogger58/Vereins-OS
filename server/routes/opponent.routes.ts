import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertOpponentSchema, insertOpponentHistorySchema } from "@shared/schema";

export function registerOpponentRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(), async (_req, res: Response) => {
    const opponents = await storage.listOpponents();
    const enriched = await Promise.all(
      opponents.map(async (o) => ({
        ...o,
        history: await storage.getOpponentHistory(o.id!),
        stats: await storage.getOpponentStats(o.id!),
      }))
    );
    res.json(enriched);
  });

  router.get("/matches", requireAuth(), async (_req, res: Response) => {
    const matches = await storage.listMatches();
    res.json(matches);
  });

  router.get("/:id", requireAuth(), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    const opponent = await storage.getOpponent(id);
    if (!opponent) return res.status(404).json({ message: "Nicht gefunden" });
    const history = await storage.getOpponentHistory(id);
    const stats = await storage.getOpponentStats(id);
    res.json({ ...opponent, history, stats });
  });

  router.post("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const parsed = insertOpponentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const opponent = await storage.createOpponent(parsed.data);
      res.status(201).json(opponent);
    } catch (e: any) {
      if (e.message?.includes("UNIQUE")) return res.status(409).json({ message: "Gegner existiert bereits" });
      res.status(500).json({ message: e.message });
    }
  });

  router.put("/:id", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    const parsed = insertOpponentSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const opponent = await storage.updateOpponent(id, parsed.data);
    if (!opponent) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(opponent);
  });

  router.post("/:id/history", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const opponentId = Number(req.params.id);
    if (isNaN(opponentId)) return res.status(400).json({ message: "Ungültige ID" });
    const parsed = insertOpponentHistorySchema.safeParse({ ...req.body, opponentId });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const history = await storage.addOpponentHistory(parsed.data);
      res.status(201).json(history);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  router.delete("/:id", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    await storage.deleteOpponent?.(id);
    res.json({ success: true });
  });

  app.use("/api/opponents", router);
}

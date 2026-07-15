import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertMatchEventSchema } from "@shared/schema";

export function registerMatchEventRoutes(app: any) {
  const router = Router({ mergeParams: true });

  router.get("/", requireAuth(["präsident", "admin", "trainer", "secretaire", "spieler"]), async (req: Request, res: Response) => {
    const matchId = Number(req.params.matchId);
    const events = await storage.listMatchEvents(matchId);
    const enriched = await Promise.all(events.map(async (ev) => {
      const player = ev.playerId ? await storage.getMember(ev.playerId) : null;
      return { ...ev, player };
    }));
    res.json(enriched);
  });

  router.post("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const matchId = Number(req.params.matchId);
    const parsed = insertMatchEventSchema.safeParse({ ...req.body, matchId });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const ev = await storage.createMatchEvent(parsed.data);
    res.status(201).json(ev);
  });

  router.delete("/:eventId", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    await storage.deleteMatchEvent(Number(req.params.eventId));
    res.json({ success: true });
  });

  app.use("/api/matches/:matchId/events", router);
}

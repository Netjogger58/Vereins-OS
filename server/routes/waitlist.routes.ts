import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";

const WAITLIST_ROLES = ["präsident", "admin", "trainer", "secretaire"] as any[];

export function registerWaitlistRoutes(app: Express) {
  app.get("/api/waitlist", requireAuth(), async (req, res) => {
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;
    const items = await storage.listWaitlistEntries(teamId);
    res.json(items);
  });

  app.post("/api/waitlist", requireAuth(), async (req, res) => {
    const item = await storage.createWaitlistEntry(req.body);
    res.status(201).json(item);
  });

  app.patch("/api/waitlist/:id", requireAuth(WAITLIST_ROLES), async (req, res) => {
    const item = await storage.updateWaitlistEntry(Number(req.params.id), req.body);
    res.json(item);
  });

  app.post("/api/waitlist/:id/convert", requireAuth(WAITLIST_ROLES), async (req, res) => {
    const member = await storage.convertWaitlistEntryToMember(Number(req.params.id));
    if (!member) return res.status(404).json({ message: "Wartelisten-Eintrag nicht gefunden" });
    res.status(201).json(member);
  });

  app.delete("/api/waitlist/:id", requireAuth(WAITLIST_ROLES), async (req, res) => {
    await storage.deleteWaitlistEntry(Number(req.params.id));
    res.status(204).end();
  });
}

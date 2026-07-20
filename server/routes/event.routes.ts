import { Router, type Response, type Request } from "express";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertEventSchema, insertAvailabilitySchema } from "@shared/schema";
export function registerEventRoutes(app: any) {
  const router = Router();

  // ─── Events ───────────────────────────────────────────
  router.get("/", requireAuth(), async (_req: Request, res: Response) => {
    res.json(await storage.listEvents());
  });
  router.get("/:id", requireAuth(), async (req: Request, res: Response) => {
    const e = await storage.getEvent(Number(req.params.id));
    if (!e) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(e);
  });
  router.post("/", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const parsed = insertEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createEvent({ ...parsed.data, createdById: authed.user!.id }));
  });
  router.patch("/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const e = await storage.updateEvent(Number(req.params.id), req.body);
    res.json(e);
  });
  // Löschen: Admin/Präsident dürfen alles, sonst nur der Ersteller des Termins.
  router.delete("/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const ev = await storage.getEvent(Number(req.params.id));
    if (!ev) return res.status(404).json({ message: "Nicht gefunden" });
    const isAdmin = ["präsident", "admin"].includes(authed.user!.role);
    const isCreator = ev.createdById != null && ev.createdById === authed.user!.id;
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "Keine Berechtigung: nur Admin/Präsident oder der Ersteller darf löschen." });
    }
    await storage.deleteEvent(ev.id);
    res.json({ ok: true });
  });

  // ─── Event Groups (Spieler-Gruppen in Terminen) ──────
  router.get("/:eventId/groups", requireAuth(), async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const groups = sqlite.prepare("SELECT * FROM event_groups WHERE event_id = ? ORDER BY id").all(eventId) as any[];
    const members = sqlite.prepare(`
      SELECT egm.group_id, egm.member_id, m.name, m.first_name, m.last_name, m.photo_url
      FROM event_group_members egm
      JOIN members m ON m.id = egm.member_id
      WHERE egm.group_id IN (SELECT id FROM event_groups WHERE event_id = ?)
    `).all(eventId) as any[];
    res.json({ groups, members });
  });
  router.post("/:eventId/groups", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name erforderlich" });
    const info = sqlite.prepare("INSERT INTO event_groups (event_id, name, color, created_at) VALUES (?,?,?,?)").run(eventId, name, color || "blue", new Date().toISOString());
    res.json({ id: info.lastInsertRowid, eventId, name, color: color || "blue" });
  });
  app.delete("/api/event-groups/:groupId", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const groupId = Number(req.params.groupId);
    sqlite.prepare("DELETE FROM event_group_members WHERE group_id = ?").run(groupId);
    sqlite.prepare("DELETE FROM event_groups WHERE id = ?").run(groupId);
    res.json({ ok: true });
  });
  app.post("/api/event-groups/:groupId/members", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const groupId = Number(req.params.groupId);
    const memberId = Number(req.body.memberId);
    if (!memberId) return res.status(400).json({ message: "memberId erforderlich" });
    // Remove from any other group of the same event first
    const evId = (sqlite.prepare("SELECT event_id FROM event_groups WHERE id = ?").get(groupId) as any)?.event_id;
    if (evId) {
      const otherGroupIds = (sqlite.prepare("SELECT id FROM event_groups WHERE event_id = ? AND id != ?").all(evId, groupId) as any[]).map(g => g.id);
      if (otherGroupIds.length) {
        const placeholders = otherGroupIds.map(() => "?").join(",");
        sqlite.prepare(`DELETE FROM event_group_members WHERE member_id = ? AND group_id IN (${placeholders})`).run(memberId, ...otherGroupIds);
      }
    }
    // Insert if not already in this group
    const existing = sqlite.prepare("SELECT id FROM event_group_members WHERE group_id = ? AND member_id = ?").get(groupId, memberId);
    if (!existing) {
      sqlite.prepare("INSERT INTO event_group_members (group_id, member_id) VALUES (?,?)").run(groupId, memberId);
    }
    res.json({ ok: true });
  });
  app.delete("/api/event-groups/:groupId/members/:memberId", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const groupId = Number(req.params.groupId);
    const memberId = Number(req.params.memberId);
    sqlite.prepare("DELETE FROM event_group_members WHERE group_id = ? AND member_id = ?").run(groupId, memberId);
    res.json({ ok: true });
  });

  // ─── Lineups (Aufstellungs-Editor) ────────────────────
  app.get("/api/matches/:matchId/lineup", requireAuth(), async (req: Request, res: Response) => {
    const matchId = Number(req.params.matchId);
    const row = sqlite.prepare("SELECT * FROM lineups WHERE match_id = ?").get(matchId) as any;
    if (!row) return res.json(null);
    res.json(row);
  });
  app.post("/api/matches/:matchId/lineup", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const matchId = Number(req.params.matchId);
    const { formation, positions } = req.body;
    const existing = sqlite.prepare("SELECT id FROM lineups WHERE match_id = ?").get(matchId) as any;
    const positionsJson = JSON.stringify(positions || []);
    const now = new Date().toISOString();
    if (existing) {
      sqlite.prepare("UPDATE lineups SET formation = ?, notes = ?, updated_at = ? WHERE match_id = ?").run(formation, positionsJson, now, matchId);
    } else {
      sqlite.prepare("INSERT INTO lineups (match_id, team_id, formation, notes, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?)")
        .run(matchId, req.body.teamId || null, formation, positionsJson, (req as any).user?.id || null, now, now);
    }
    res.json({ ok: true, matchId, formation });
  });

  // ─── Availability ─────────────────────────────────────
  app.get("/api/availability/event/:eventId", requireAuth(), async (req: Request, res: Response) => {
    res.json(await storage.listAvailabilityByEvent(Number(req.params.eventId)));
  });
  app.post("/api/availability", requireAuth(), async (req: Request, res: Response) => {
    const parsed = insertAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.upsertAvailability(parsed.data));
  });


  app.use("/api/events", router);
}

import { Router, type Response, type Request } from "express";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertAttendanceSchema } from "@shared/schema";
export function registerAttendanceRoutes(app: any) {
  const router = Router();

  // ─── Attendance ───────────────────────────────────────
  router.get("/", requireAuth(), async (req: Request, res: Response) => {
    const teamId = Number(req.query.teamId);
    const date = String(req.query.date || "");
    if (!teamId || !date) return res.json([]);
    res.json(await storage.listAttendanceByTeamDate(teamId, date));
  });
  router.get("//member/:id", requireAuth(), async (req: Request, res: Response) => {
    res.json(await storage.listAttendanceByMember(Number(req.params.id)));
  });
  router.get("//summary", requireAuth(), async (req: Request, res: Response) => {
    const teamId = Number(req.query.teamId);
    if (!teamId) return res.json([]);
    res.json(await storage.getAttendanceSummaryByTeam(teamId));
  });
  router.delete("/", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const memberId = Number(req.query.memberId);
    const date = String(req.query.date || "");
    if (!memberId || !date) return res.status(400).json({ message: "memberId und date erforderlich" });
    await storage.deleteAttendance(memberId, date);
    res.json({ ok: true });
  });
  router.post("/", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const parsed = insertAttendanceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.upsertAttendance(parsed.data));
  });
  router.post("//bulk", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const items: any[] = req.body?.items || [];
    const results = [];
    for (const item of items) {
      const parsed = insertAttendanceSchema.safeParse(item);
      if (parsed.success) results.push(await storage.upsertAttendance(parsed.data));
    }
    res.json(results);
  });


  app.use("/api/attendance", router);
}

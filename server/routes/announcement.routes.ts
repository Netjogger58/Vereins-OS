import { Router, type Response, type Request } from "express";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertAnnouncementSchema } from "@shared/schema";
export function registerAnnouncementRoutes(app: any) {
  const router = Router();

  // ─── Announcements ────────────────────────────────────
  router.get("/", requireAuth(), async (_req: Request, res: Response) => {
    res.json(await storage.listAnnouncements());
  });
  router.post("/", requireAuth(["präsident", "admin", "trainer"]), async (req: AuthedRequest, res: Response) => {
    const body = {
      ...req.body,
      authorId: (req as any).user.id,
      createdAt: new Date().toISOString(),
      pinned: !!req.body.pinned,
    };
    const parsed = insertAnnouncementSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createAnnouncement(parsed.data));
  });
  router.patch("/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const a = await storage.updateAnnouncement(Number(req.params.id), req.body);
    res.json(a);
  });
  router.delete("/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    await storage.deleteAnnouncement(Number(req.params.id));
    res.json({ ok: true });
  });


  app.use("/api/announcements", router);
}

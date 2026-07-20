import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertNominationSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { publicUser } from "../auth";
import { insertMemberSchema } from "@shared/schema";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function registerAdminRoutes(app: any) {
  const router = Router();

  // ─── Users (for Präsident) ────────────────────────────
  router.get("/users", requireAuth(["präsident", "admin"]), async (_req: Request, res: Response) => {
    const list = await storage.listUsers();
    res.json(list.map(publicUser));
  });

  // ─── Nominations ─────────────────────────────────────
  router.get("/nominations/event/:eventId", requireAuth(), async (req: Request, res: Response) => {
    res.json(await storage.listNominationsByEvent(Number(req.params.eventId)));
  });
  router.get("/nominations/team/:teamId", requireAuth(), async (req: Request, res: Response) => {
    res.json(await storage.listNominationsByTeam(Number(req.params.teamId)));
  });
  router.get("/nominations/member/:memberId", requireAuth(), async (req: Request, res: Response) => {
    res.json(await storage.listNominationsByMember(Number(req.params.memberId)));
  });
  router.post("/nominations", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const body = { ...req.body, createdAt: new Date().toISOString() };
    const parsed = insertNominationSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createNomination(parsed.data));
  });
  // Spieler antwortet auf Nominierung (ja/nein + Begründung)
  router.patch("/nominations/:id/response", requireAuth(), async (req: Request, res: Response) => {
    const { response, reason } = req.body;
    if (!response || !["ja", "nein"].includes(response)) {
      return res.status(400).json({ message: "response must be 'ja' or 'nein'" });
    }
    const updated = await storage.updateNominationResponse(Number(req.params.id), response, reason);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  router.delete("/nominations/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    await storage.deleteNomination(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Parent Account Management ───────────────────────
  // Admin/Präsident can create elternteil accounts and link them to child users
  router.post("/admin/parents", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    const { email, name, password, childUserId, phone } = req.body;
    if (!email || !name || !password || !childUserId) {
      return res.status(400).json({ message: "email, name, password, childUserId required" });
    }
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "E-Mail bereits registriert" });
    const hash = await bcrypt.hash(password, 10);
    const parent = await storage.createUser({
      email, passwordHash: hash, name, role: "elternteil", phone, active: true,
    } as any);
    await storage.createFamilyLink({
      parentId: parent.id, childId: Number(childUserId), relationship: "parent",
      canManageProfile: true, canManagePayments: true,
    } as any);
    res.json({ ok: true, parentId: parent.id });
  });

  // List family links for a parent
  router.get("/admin/parents/:parentId/children", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    const children = await storage.getChildrenOfParent(Number(req.params.parentId));
    res.json(children);
  });

  // ─── Audit Logs (Security) ─────────────────────────────
  // Only präsident and admin can view audit logs
  router.get("/audit-logs", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { severity, limit, startDate, endDate } = req.query;
    const logs = await storage.listAuditLogs({
      severity: severity as string,
      limit: limit ? parseInt(limit as string) : 100,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(logs);
  });

  // Get unsent critical alerts (for email notification system)
  router.get("/audit-logs/critical", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const alerts = await storage.getUnsentCriticalAlerts();
    res.json(alerts);
  });

  // Mark alert as sent (for email system)
  router.post("/audit-logs/:id/mark-sent", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    await storage.markAuditLogEmailSent(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });


  app.use("/api/admin", router);
}

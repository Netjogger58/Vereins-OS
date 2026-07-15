import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";

const GDPR_ROLES = ["präsident", "admin", "secretaire"] as any[];

export function registerGdprRoutes(app: Express) {
  app.get("/api/gdpr", requireAuth(), async (req, res) => {
    const items = await storage.listGdprConsents((req as any).user.id);
    res.json(items);
  });

  app.post("/api/gdpr/consent", requireAuth(), async (req, res) => {
    const item = await storage.createGdprConsent({
      userId: (req as any).user.id,
      consentType: req.body.consentType || "data_processing",
      consented: true,
      ipAddress: req.ip,
    });
    res.status(201).json(item);
  });

  app.get("/api/gdpr/export", requireAuth(), async (req, res) => {
    const user = (req as any).user!;
    const members = await storage.listMembers();
    const member = members.find((m: any) => m.userId === user.id) || null;
    const consents = await storage.listGdprConsents(user.id);
    const data = { user: { id: user.id, email: user.email, role: user.role }, member, consents };
    res.json(data);
  });

  app.post("/api/gdpr/deletion-request", requireAuth(), async (req, res) => {
    const userId = (req as any).user.id;
    const item = await storage.createGdprDeletionRequest({
      userId,
      reason: req.body.reason || null,
      status: "pending",
    });
    res.status(201).json(item);
  });

  app.get("/api/admin/gdpr/consents", requireAuth(GDPR_ROLES), async (req, res) => {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const items = await storage.listGdprConsents(userId);
    res.json(items);
  });

  app.post("/api/admin/gdpr/consents", requireAuth(GDPR_ROLES), async (req, res) => {
    const item = await storage.createGdprConsent({
      userId: Number(req.body.userId),
      consentType: req.body.consentType || "data_processing",
      consented: req.body.consented ?? true,
      ipAddress: req.ip,
    });
    res.status(201).json(item);
  });

  app.get("/api/admin/gdpr/export/:userId", requireAuth(GDPR_ROLES), async (req, res) => {
    const userId = Number(req.params.userId);
    const data = await storage.getMemberDataExport(userId);
    res.setHeader("Content-Disposition", `attachment; filename="gdpr-export-${userId}.json"`);
    res.json(data);
  });

  app.get("/api/admin/gdpr/deletion-requests", requireAuth(GDPR_ROLES), async (req, res) => {
    const status = req.query.status as string | undefined;
    const items = await storage.listGdprDeletionRequests(status);
    res.json(items);
  });

  app.patch("/api/admin/gdpr/deletion-requests/:id", requireAuth(GDPR_ROLES), async (req, res) => {
    const item = await storage.updateGdprDeletionRequest(Number(req.params.id), {
      status: req.body.status,
      reviewedBy: (req as any).user.id,
      notes: req.body.notes,
    });
    res.json(item);
  });
}

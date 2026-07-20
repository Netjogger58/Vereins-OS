import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertDocumentSchema, insertRegistrationSchema } from "@shared/schema";
import { queueEmail, processPendingEmails } from "../email";
import { getRegistrationConfirmationTemplate } from "../email";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function registerDocumentRoutes(app: any) {
  const router = Router();

  // ─── Documents ───────────────────────────────────────────
  router.get("/documents", requireAuth(), async (req: Request, res: Response) => {
    const { memberId, category, visibility } = req.query;
    res.json(await storage.listDocuments({
      memberId: memberId ? parseInt(memberId as string) : undefined,
      category: category as string | undefined,
      visibility: visibility as string | undefined,
    }));
  });

  router.get("/documents/:id", requireAuth(), async (req: Request, res: Response) => {
    const doc = await storage.getDocument(parseInt(qs(req.params.id)!));
    if (!doc) return res.status(404).json({ message: "Dokument nicht gefunden" });
    res.json(doc);
  });

  router.post("/documents", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertDocumentSchema.safeParse({
      ...req.body,
      uploadedById: authed.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createDocument(parsed.data));
  });

  router.delete("/documents/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteDocument(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Registrations (Online-Anmeldung) ────────────────────
  // Public: Create registration (no auth required)
  router.post("/registrations", async (req: Request, res: Response) => {
    const parsed = insertRegistrationSchema.safeParse({
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    
    const reg = await storage.createRegistration(parsed.data);
    
    // Send confirmation email
    try {
      const settings = await storage.getEmailSettings();
      if (settings?.enabled) {
        const team = reg.teamId ? await storage.getTeam(reg.teamId) : null;
        await queueEmail({
          toEmail: reg.email,
          toName: `${reg.firstName} ${reg.lastName}`,
          subject: "Anmeldung eingegangen - M75",
          body: getRegistrationConfirmationTemplate(reg.firstName, team?.name || null),
          template: "welcome",
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        await processPendingEmails();
      }
    } catch (e) {
      console.error("Failed to send confirmation email:", e);
    }
    
    res.json(reg);
  });

  // Protected: List and manage registrations
  router.get("/registrations", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { status } = req.query;
    res.json(await storage.listRegistrations(status as string | undefined));
  });

  router.get("/registrations/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const reg = await storage.getRegistration(parseInt(qs(req.params.id)!));
    if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
    res.json(reg);
  });

  router.post("/registrations/:id/approve", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { notes } = req.body;
    const reg = await storage.approveRegistration(
      parseInt(qs(req.params.id)!),
      authed.user!.id,
      notes
    );
    if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
    res.json(reg);
  });

  router.post("/registrations/:id/reject", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Grund erforderlich" });
    
    const reg = await storage.rejectRegistration(
      parseInt(qs(req.params.id)!),
      authed.user!.id,
      reason
    );
    if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
    res.json(reg);
  });

  // Convert approved registration → member (auto-fill from registration data)
  router.post("/registrations/:id/convert", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const member = await storage.convertRegistration(
      parseInt(qs(req.params.id)!),
      authed.user!.id
    );
    if (!member) return res.status(404).json({ message: "Anmeldung nicht gefunden oder noch nicht genehmigt" });
    res.json(member);
  });


  app.use("/api/documents", router);
}

import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertEmailSettingsSchema, insertEmailSchema, type InsertEmail } from "@shared/schema";
import { initEmailTransporter, queueEmail, processPendingEmails, sendEmail } from "../email";
import { getFeeReminderTemplate, getSecurityAlertTemplate, getWelcomeEmailTemplate } from "../email";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export async function registerEmailSettingsRoutes(app: any) {
  const router = Router();

  // ─── Email Settings ────────────────────────────────────
  router.get("/email-settings", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const settings = await storage.getEmailSettings();
    // Don't return password
    if (settings) {
      const { smtpPassword, ...safe } = settings;
      res.json(safe);
    } else {
      res.json(null);
    }
  });

  router.post("/email-settings", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertEmailSettingsSchema.safeParse({
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    
    const saved = await storage.saveEmailSettings(parsed.data);
    await initEmailTransporter();
    
    const { smtpPassword, ...safe } = saved;
    res.json(safe);
  });

  router.post("/email-settings/test", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const settings = await storage.getEmailSettings();
    if (!settings || !settings.enabled) {
      return res.status(400).json({ message: "Email nicht konfiguriert" });
    }

    try {
      await queueEmail({
        toEmail: authed.user!.email,
        toName: authed.user!.name,
        subject: "Test-E-Mail M75 Manager",
        body: `<h1>Test erfolgreich!</h1><p>Die E-Mail-Konfiguration funktioniert.</p>`,
        template: "custom",
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      await processPendingEmails();
      res.json({ success: true, message: "Test-E-Mail wurde gesendet" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── Emails ──────────────────────────────────────────────
  router.get("/emails", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { status, userId } = req.query;
    res.json(await storage.listEmails({
      status: status as string | undefined,
      userId: userId ? parseInt(userId as string) : undefined,
      limit: 100,
    }));
  });

  // ─── Email Actions ───────────────────────────────────────
  router.post("/members/:id/send-reminder", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const memberId = parseInt(qs(req.params.id)!);
    const member = await storage.getMember(memberId);
    if (!member || !member.email) {
      return res.status(400).json({ message: "Mitglied hat keine E-Mail-Adresse" });
    }

    const { year } = req.body;
    const fees = await storage.listMemberFees(memberId, year || new Date().getFullYear());
    const openFees = fees.filter(f => f.status === "open" || f.status === "partial");
    
    if (openFees.length === 0) {
      return res.status(400).json({ message: "Keine offenen Beiträge" });
    }

    const totalOpen = openFees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    const dueDate = openFees[0].dueDate;

    await queueEmail({
      toEmail: member.email,
      toName: member.name,
      subject: "Beitragszahlung erinnern - M75",
      body: getFeeReminderTemplate(member.name, totalOpen, dueDate, "https://mersch75.lu/payment"),
      template: "reminder",
      status: "pending",
      memberId: member.id,
      createdAt: new Date().toISOString(),
    });
    
    await processPendingEmails();
    res.json({ success: true, message: "Erinnerung gesendet" });
  });

  // Initialize email on startup
  await initEmailTransporter();


  app.use("/api/emails", router);
}

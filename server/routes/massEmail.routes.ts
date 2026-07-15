import path from "node:path";
import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { sendEmail, initEmailTransporter } from "../email";

export function registerMassEmailRoutes(app: any) {
  const router = Router();

  router.post("/send", requireAuth(["präsident", "admin", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const { filters = {}, subject = "", body = "", documentId } = req.body || {};

    const members = await storage.listMembers();
    const recipients = members.filter((m: any) => {
      if (!m.email) return false;
      if (filters.teamId && String(m.teamId) !== String(filters.teamId)) return false;
      if (filters.membershipStatus && m.membershipStatus !== filters.membershipStatus) return false;
      if (filters.memberType && m.memberType !== filters.memberType) return false;
      if (filters.clubFunction && m.clubFunction !== filters.clubFunction) return false;
      return true;
    });

    if (recipients.length === 0) {
      return res.status(400).json({ message: "Keine Empfänger gefunden" });
    }

    const ok = await initEmailTransporter();
    if (!ok) return res.status(500).json({ message: "E-Mail nicht konfiguriert" });

    const attachments: { filename: string; path: string }[] = [];
    if (documentId) {
      const doc = await storage.getDocument(Number(documentId));
      if (doc && doc.filePath) {
        attachments.push({ filename: doc.fileName, path: path.resolve(doc.filePath) });
      }
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const m of recipients) {
      const personalized = body
        .replace(/\{\{firstName\}\}/g, m.firstName || "")
        .replace(/\{\{lastName\}\}/g, m.lastName || "")
        .replace(/\{\{name\}\}/g, m.name || "");
      const result = await sendEmail(
        {
          toEmail: m.email!,
          subject,
          body: personalized,
          status: "pending",
          sentAt: new Date().toISOString(),
        } as any,
        attachments
      );
      if (result.success) {
        sent++;
      } else {
        failed++;
        if (!errors.includes(result.error || "")) errors.push(result.error || "");
      }
    }

    res.json({ sent, failed, errors });
  });

  app.use("/api/mass-email", router);
}

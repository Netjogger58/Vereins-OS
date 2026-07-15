import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertInvoiceSchema, insertInvoicePaymentSchema } from "@shared/schema";
import { sendEmail, initEmailTransporter } from "../email";

export function registerInvoiceRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (_req, res: Response) => {
    const list = await storage.listInvoices();
    const enriched = await Promise.all(
      list.map(async (inv) => {
        const member = await storage.getMember(inv.memberId);
        const payments = await storage.getInvoicePayments(inv.id!);
        return { ...inv, member, payments, openAmount: Number(inv.amount) - Number(inv.paidAmount) };
      })
    );
    res.json(enriched);
  });

  router.post("/", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const parsed = insertInvoiceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const invoice = await storage.createInvoice(parsed.data);
    res.status(201).json(invoice);
  });

  router.post("/:id/payments", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (req: Request, res: Response) => {
    const invoiceId = Number(req.params.id);
    const parsed = insertInvoicePaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Rechnung nicht gefunden" });
    const payment = await storage.addInvoicePayment({ ...parsed.data, invoiceId });
    const paidAmount = Number(invoice.paidAmount) + Number(parsed.data.amount);
    const status = paidAmount >= Number(invoice.amount) ? "paid" : "open";
    await storage.updateInvoice(invoiceId, { paidAmount, status, paidAt: status === "paid" ? new Date().toISOString() : invoice.paidAt });
    res.status(201).json(payment);
  });

  router.post("/:id/remind", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (req: Request, res: Response) => {
    const invoiceId = Number(req.params.id);
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Rechnung nicht gefunden" });
    const member = await storage.getMember(invoice.memberId);
    if (!member?.email) return res.status(400).json({ message: "Keine E-Mail-Adresse" });
    const ok = await initEmailTransporter();
    if (!ok) return res.status(500).json({ message: "E-Mail nicht konfiguriert" });
    const openAmount = Number(invoice.amount) - Number(invoice.paidAmount);
    const body = `<p>Hallo ${member.firstName || member.name},</p><p>es ist noch ein Betrag von <strong>${openAmount.toFixed(2)} €</strong> offen.</p><p>Beschreibung: ${invoice.description}</p>`;
    const result = await sendEmail({ toEmail: member.email, subject: "Zahlungserinnerung", body, status: "pending", sentAt: new Date().toISOString() } as any);
    res.json({ success: result.success, error: result.error });
  });

  router.delete("/:id", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await storage.deleteInvoice(id);
    res.json({ success: true });
  });

  app.use("/api/invoices", router);
}

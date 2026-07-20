import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertFeeRuleSchema, insertMemberFeeSchema, insertFeePaymentSchema } from "@shared/schema";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function registerFeeRoutes(app: any) {
  const router = Router();

  // ─── Fee Management (Beitragsmodul) ───────────────────────
  // Fee Rules (Beitragsregeln)
  router.get("/fee-rules", requireAuth(["präsident", "admin", "kassenwart"]), async (_req: Request, res: Response) => {
    res.json(await storage.listFeeRules());
  });

  router.post("/fee-rules", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertFeeRuleSchema.safeParse({ ...req.body, createdAt: new Date().toISOString() });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createFeeRule(parsed.data));
  });

  router.patch("/fee-rules/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    res.json(await storage.updateFeeRule(parseInt(qs(req.params.id)!), req.body));
  });

  router.delete("/fee-rules/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteFeeRule(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // Member Fees (Beitragszuordnung)
  router.get("/member-fees", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const { memberId, year } = req.query;
    res.json(await storage.listMemberFees(
      memberId ? parseInt(memberId as string) : undefined,
      year ? parseInt(year as string) : undefined
    ));
  });

  router.get("/members/:id/fees", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const memberId = parseInt(qs(req.params.id)!);
    const fees = await storage.listMemberFees(memberId);
    const summary = await storage.getMemberFeeSummary(memberId);
    res.json({ fees, summary });
  });

  router.post("/member-fees", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertMemberFeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMemberFee(parsed.data));
  });

  router.patch("/member-fees/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    res.json(await storage.updateMemberFee(parseInt(qs(req.params.id)!), req.body));
  });

  router.delete("/member-fees/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteMemberFee(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // Fee Payments (Zahlungseingänge)
  router.get("/member-fees/:id/payments", requireAuth(), async (req: Request, res: Response) => {
    res.json(await storage.listFeePayments(parseInt(qs(req.params.id)!)));
  });

  router.post("/fee-payments", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertFeePaymentSchema.safeParse({
      ...req.body,
      createdById: authed.user!.id,
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createFeePayment(parsed.data));
  });

  router.delete("/fee-payments/:id", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteFeePayment(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Fee Analysis (Beitragsanalyse & Generéierung) ──────
  router.get("/fees/analysis", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    try {
      const analysis = await storage.getFeeAnalysis(year);
      res.json(analysis);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Analyse fehlgeschlagen" });
    }
  });

  router.post("/fees/generate", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    try {
      const result = await storage.generateFees(year, authed.user!.id);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Generierung fehlgeschlagen" });
    }
  });


  app.use("/api/fees", router);
}

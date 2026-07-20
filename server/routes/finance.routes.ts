import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertMeetingSchema, insertTransactionSchema, insertBudgetSchema, insertAccountSchema, insertPlayerFlagSchema } from "@shared/schema";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function registerFinanceRoutes(app: any) {
  const router = Router();

  // ─── Meetings ─────────────────────────────────────────
  router.get("/meetings", requireAuth(), async (_req: Request, res: Response) => {
    res.json(await storage.listMeetings());
  });
  router.post("/meetings", requireAuth(["präsident", "admin", "trainer"]), async (req: AuthedRequest, res: Response) => {
    const suffix = Math.random().toString(36).slice(2, 10);
    const body = {
      ...req.body,
      jitsiRoom: req.body.jitsiRoom || `Mersch75-${suffix}`,
      authorId: (req as any).user.id,
      createdAt: new Date().toISOString(),
    };
    const parsed = insertMeetingSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMeeting(parsed.data));
  });
  router.patch("/meetings/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const m = await storage.updateMeeting(Number(req.params.id), req.body);
    res.json(m);
  });
  router.delete("/meetings/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    await storage.deleteMeeting(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Accounts ─────────────────────────────────────────
  router.get("/accounts", requireAuth(["präsident", "admin", "kassenwart"]), async (_req: Request, res: Response) => {
    res.json(await storage.listAccounts());
  });
  router.post("/accounts", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const parsed = insertAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createAccount(parsed.data));
  });

  // ─── Transactions ─────────────────────────────────────
  router.get("/transactions", requireAuth(["präsident", "admin", "kassenwart"]), async (_req: Request, res: Response) => {
    res.json(await storage.listTransactions());
  });
  router.post("/transactions", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const body = { ...req.body, createdAt: new Date().toISOString() };
    const parsed = insertTransactionSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createTransaction(parsed.data));
  });
  router.delete("/transactions/:id", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Saison-Budgets (Prévisioun) ──────────────────────
  router.get("/season-budgets", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const season = req.query.season as string | undefined;
    res.json(await storage.listSeasonBudgets(season));
  });
  router.post("/season-budgets", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const parsed = insertBudgetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createSeasonBudget(parsed.data));
  });
  router.delete("/season-budgets/:id", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    await storage.deleteSeasonBudget(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Player Flags ─────────────────────────────────────
  router.get("/flags", requireAuth(), async (_req: Request, res: Response) => {
    res.json(await storage.listPlayerFlags());
  });
  router.post("/flags", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const body = { ...req.body, createdAt: new Date().toISOString() };
    const parsed = insertPlayerFlagSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createPlayerFlag(parsed.data));
  });
  router.delete("/flags/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    await storage.deletePlayerFlag(Number(req.params.id));
    res.json({ ok: true });
  });


  app.use("/api/finance", router);
}

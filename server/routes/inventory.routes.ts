import { Router, type Express, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertInventoryItemSchema, insertInventoryLoanSchema } from "@shared/schema";
import {
  listInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  listInventoryLoans,
  createInventoryLoan,
  returnInventoryLoan,
} from "../services/inventory.service";

export function registerInventoryRoutes(app: Express) {
  const router = Router();

  router.get("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (_req, res) => {
    res.json(await listInventoryItems());
  });

  router.post("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req, res) => {
    const parsed = insertInventoryItemSchema.safeParse({ ...req.body, createdAt: new Date().toISOString() });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await createInventoryItem(parsed.data));
  });

  router.get("/:id", requireAuth(), async (req, res) => {
    const item = await getInventoryItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(item);
  });

  router.patch("/:id", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req, res) => {
    const item = await updateInventoryItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(item);
  });

  router.delete("/:id", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    await deleteInventoryItem(Number(req.params.id));
    res.json({ ok: true });
  });

  router.get("/loans", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (_req, res) => {
    res.json(await listInventoryLoans());
  });

  router.post("/loans", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const parsed = insertInventoryLoanSchema.safeParse({ ...req.body, loanedAt: new Date().toISOString() });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      res.json(await createInventoryLoan(parsed.data));
    } catch (e: any) {
      res.status(409).json({ message: e.message });
    }
  });

  router.get("/:id/loans", requireAuth(), async (req, res) => {
    res.json(await listInventoryLoans(Number(req.params.id)));
  });

  router.patch("/loans/:id/return", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: AuthedRequest, res) => {
    const updated = await returnInventoryLoan(Number(req.params.id), req.user?.id, req.body.condition);
    if (!updated) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(updated);
  });

  app.use("/api/inventory", router);
}

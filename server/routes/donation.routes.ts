import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertDonationSchema } from "@shared/schema";

export function registerDonationRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (_req, res: Response) => {
    res.json(await storage.listDonations());
  });

  router.post("/", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const parsed = insertDonationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const donation = await storage.createDonation(parsed.data);
    res.status(201).json(donation);
  });

  router.patch("/:id/receipt", requireAuth(["präsident", "admin", "kassenwart", "secretaire"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const donation = await storage.updateDonation(id, { receiptSent: true });
    if (!donation) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(donation);
  });

  router.delete("/:id", requireAuth(["präsident", "admin", "kassenwart"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await storage.deleteDonation(id);
    res.json({ success: true });
  });

  app.use("/api/donations", router);
}

import { Router, type Request, type Response } from "express";
import { requireAuth } from "../auth";
import { storage } from "../storage";

export function registerTrialRegistrationRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(["präsident", "admin", "secretaire", "trainer"]), async (_req, res: Response) => {
    res.json(await storage.listTrialRegistrations());
  });

  router.patch("/:id", requireAuth(["präsident", "admin", "secretaire", "trainer"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const status = req.body?.status;
    if (!status || typeof status !== "string") return res.status(400).json({ message: "status erforderlich" });
    const r = await storage.updateTrialRegistration(id, { status });
    if (!r) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(r);
  });

  app.use("/api/trial-registrations", router);
}

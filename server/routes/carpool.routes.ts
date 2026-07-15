import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertCarpoolSchema, insertCarpoolPassengerSchema } from "@shared/schema";

export function registerCarpoolRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(), async (req: Request, res: Response) => {
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
    const carpools = eventId ? await storage.getCarpoolByEvent(eventId) : await storage.listCarpools();
    const enriched = await Promise.all(
      carpools.map(async (c) => ({
        ...c,
        passengers: await storage.getCarpoolPassengers(c.id!),
      }))
    );
    res.json(enriched);
  });

  router.post("/", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const parsed = insertCarpoolSchema.safeParse({ ...req.body, driverId: req.user!.id });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const carpool = await storage.createCarpool(parsed.data);
      res.status(201).json(carpool);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  router.post("/:id/join", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const carpoolId = Number(req.params.id);
    if (isNaN(carpoolId)) return res.status(400).json({ message: "Ungültige ID" });
    const carpool = await storage.getCarpool(carpoolId);
    if (!carpool) return res.status(404).json({ message: "Fahrgemeinschaft nicht gefunden" });
    if (carpool.status === "full") return res.status(409).json({ message: "Fahrgemeinschaft ist voll" });
    const existing = (await storage.getCarpoolPassengers(carpoolId)).some((p) => p.passengerId === req.user!.id);
    if (existing) return res.status(409).json({ message: "Bereits eingetragen" });

    try {
      const passenger = await storage.joinCarpool({ carpoolId, passengerId: req.user!.id });
      const count = (await storage.getCarpoolPassengers(carpoolId)).length;
      if (count >= carpool.availableSeats) {
        // no updateCarpoolStatus helper; skip status update for now
      }
      res.status(201).json(passenger);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  router.post("/:id/leave", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const carpoolId = Number(req.params.id);
    if (isNaN(carpoolId)) return res.status(400).json({ message: "Ungültige ID" });
    await storage.leaveCarpool(carpoolId, req.user!.id);
    res.json({ success: true });
  });

  router.delete("/:id", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    const carpool = await storage.getCarpool(id);
    if (!carpool) return res.status(404).json({ message: "Nicht gefunden" });
    if (carpool.driverId !== req.user!.id && !["präsident", "admin", "trainer"].includes(req.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteCarpool(id);
    res.json({ success: true });
  });

  app.use("/api/carpools", router);
}

import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertFacilityBookingSchema } from "@shared/schema";

export function registerFacilityRoutes(app: any) {
  const router = Router();

  // ─── BOOKINGS ───
  router.get("/bookings", requireAuth(), async (req: Request, res: Response) => {
    const facilityId = req.query.facilityId ? Number(req.query.facilityId) : undefined;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    res.json(await storage.listFacilityBookings(facilityId, date));
  });

  router.post("/bookings", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const parsed = insertFacilityBookingSchema.safeParse({ ...req.body, bookedBy: req.user!.id });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const { facilityId, date, startTime, endTime } = parsed.data;
    // Überlappungsprüfung
    const existing = await storage.listFacilityBookings(facilityId, date);
    const overlap = existing.some((b) => {
      if (b.date !== date) return false;
      return (startTime || "") < (b.endTime || "") && (endTime || "") > (b.startTime || "");
    });
    if (overlap) return res.status(409).json({ message: "Zeitraum überschneidet sich mit bestehender Buchung" });
    try {
      const booking = await storage.createFacilityBooking(parsed.data);
      res.status(201).json(booking);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  router.delete("/bookings/:id", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    await storage.deleteFacilityBooking(id);
    res.json({ success: true });
  });

  app.use("/api/facility-bookings", router);
}

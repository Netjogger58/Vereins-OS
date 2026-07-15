import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";

const ALLOWED_FIELDS = [
  "membershipStatus",
  "memberType",
  "clubFunction",
  "internalCategory",
  "flhCategory",
  "teamCategory",
  "nationality",
  "licenceStatus",
  "transferStatus",
  "medicoResult",
  "teamId",
];

const FILTER_FIELDS = [
  "teamId",
  "membershipStatus",
  "memberType",
  "clubFunction",
  "internalCategory",
  "flhCategory",
  "teamCategory",
  "nationality",
  "licenceStatus",
  "transferStatus",
  "medicoResult",
];

export function registerBulkRoutes(app: any) {
  const router = Router();

  router.post("/members", requireAuth(["präsident", "admin", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const { filters = {}, updates = {} } = req.body || {};
    const field = String(updates.field || "");
    const value = updates.value;

    if (!ALLOWED_FIELDS.includes(field)) {
      return res.status(400).json({ message: "Feld nicht erlaubt" });
    }
    if (value === undefined) {
      return res.status(400).json({ message: "Wert fehlt" });
    }

    const members = await storage.listMembers();
    const selected = members.filter((m: any) => {
      for (const f of FILTER_FIELDS) {
        const filterValue = (filters as any)[f];
        if (filterValue !== undefined && filterValue !== "" && String((m as any)[f]) !== String(filterValue)) {
          return false;
        }
      }
      return true;
    });

    let updated = 0;
    for (const m of selected) {
      await storage.updateMember(m.id, { [field]: value });
      updated++;
    }

    res.json({ updated });
  });

  app.use("/api/bulk", router);
}

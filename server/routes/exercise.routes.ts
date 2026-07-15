import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertExerciseSchema, insertExerciseMediaSchema } from "@shared/schema";

export function registerExerciseRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (_req, res: Response) => {
    const list = await storage.listExercises();
    const enriched = await Promise.all(list.map(async (ex) => {
      const media = await storage.listExerciseMedia(ex.id!);
      return { ...ex, media };
    }));
    res.json(enriched);
  });

  router.post("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const parsed = insertExerciseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const exercise = await storage.createExercise({ ...parsed.data, createdBy: req.user!.id });
    res.status(201).json(exercise);
  });

  router.post("/:id/media", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const exerciseId = Number(req.params.id);
    const parsed = insertExerciseMediaSchema.safeParse({ ...req.body, exerciseId });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const media = await storage.addExerciseMedia(parsed.data);
    res.status(201).json(media);
  });

  router.delete("/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    await storage.deleteExercise(Number(req.params.id));
    res.json({ success: true });
  });

  app.use("/api/exercises", router);
}

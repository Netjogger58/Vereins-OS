import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import { insertPollSchema, insertPollVoteSchema, type PollOption } from "@shared/schema";

export function registerPollRoutes(app: any) {
  const router = Router();

  router.get("/", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(await storage.listPolls(teamId, status));
  });

  router.post("/", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: AuthedRequest, res: Response) => {
    const { options = [], ...pollBody } = req.body || {};
    const pollParsed = insertPollSchema.safeParse({ ...pollBody, createdBy: req.user!.id });
    if (!pollParsed.success) return res.status(400).json({ message: pollParsed.error.message });
    if (!Array.isArray(options) || options.length === 0) return res.status(400).json({ message: "Mindestens eine Antwortmöglichkeit erforderlich" });
    const optionObjects = options.map((text: string, i: number) => ({ optionText: String(text), sortOrder: i }));
    try {
      const poll = await storage.createPoll(pollParsed.data, optionObjects);
      res.status(201).json(poll);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  router.get("/:id", requireAuth(), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    const poll = await storage.getPoll(id);
    if (!poll) return res.status(404).json({ message: "Nicht gefunden" });
    const options = await storage.getPollOptions(id);
    const results = await storage.getPollResults(id);
    res.json({ ...poll, options, results });
  });

  router.post("/:id/vote", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const pollId = Number(req.params.id);
    if (isNaN(pollId)) return res.status(400).json({ message: "Ungültige ID" });
    const { optionIds } = req.body || {};
    if (!Array.isArray(optionIds) || optionIds.length === 0) return res.status(400).json({ message: "Option erforderlich" });

    const poll = await storage.getPoll(pollId);
    if (!poll) return res.status(404).json({ message: "Umfrage nicht gefunden" });
    if (poll.status === "closed") return res.status(409).json({ message: "Umfrage ist geschlossen" });

    const options = await storage.getPollOptions(pollId);
    const validOptionIds = new Set(options.map((o: PollOption) => o.id));
    for (const id of optionIds) {
      if (!validOptionIds.has(id)) return res.status(400).json({ message: `Ungültige Option ${id}` });
    }
    if (poll.type !== "multiple" && optionIds.length > 1) {
      return res.status(400).json({ message: "Nur eine Antwort erlaubt" });
    }

    try {
      const votes = await Promise.all(
        optionIds.map((optionId: number) =>
          storage.vote({ pollId, optionId, userId: req.user!.id })
        )
      );
      res.status(201).json(votes);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  router.patch("/:id/close", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Ungültige ID" });
    await storage.closePoll(id);
    res.json({ success: true });
  });

  app.use("/api/polls", router);
}

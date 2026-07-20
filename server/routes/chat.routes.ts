import { Router, type Response, type Request } from "express";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertChatMessageSchema, isParentChatTeam } from "@shared/schema";
export function registerChatRoutes(app: any) {
  const router = Router();

  // ─── Chat ─────────────────────────────────────────────
  // Helper: check if a user can access a team's chat
  async function canAccessTeamChat(user: any, teamId: number): Promise<boolean> {
    if (["präsident", "admin", "secretaire", "trainer", "spieler"].includes(user.role)) {
      return true;
    }
    if (user.role === "elternteil") {
      const team = await storage.getTeam(teamId);
      if (!team || !isParentChatTeam(team.category)) return false;
      const children = await storage.getChildrenOfParent(user.id);
      if (children.length === 0) return false;
      const childUserIds = children.map(c => c.id);
      const teamMembers = await storage.listMembersByTeam(teamId);
      return teamMembers.some(m => m.userId && childUserIds.includes(m.userId));
    }
    return false;
  }

  // Get teams eligible for chat (filtered for elternteil)
  app.get("/api/chat-teams", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const allTeams = await storage.listTeams();
    if (authed.user!.role !== "elternteil") {
      return res.json(allTeams);
    }
    const eligible: typeof allTeams = [];
    for (const team of allTeams) {
      if (isParentChatTeam(team.category)) {
        const children = await storage.getChildrenOfParent(authed.user!.id);
        if (children.length > 0) {
          const childUserIds = children.map(c => c.id);
          const teamMembers = await storage.listMembersByTeam(team.id);
          if (teamMembers.some(m => m.userId && childUserIds.includes(m.userId))) {
            eligible.push(team);
          }
        }
      }
    }
    res.json(eligible);
  });

  router.get("/:teamId", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const teamId = Number(req.params.teamId);
    if (!(await canAccessTeamChat(authed.user, teamId))) {
      return res.status(403).json({ message: "Kein Zugriff auf diesen Team-Chat" });
    }
    const limit = Number(req.query.limit) || 50;
    res.json(await storage.listChatMessages(teamId, limit));
  });
  router.post("/", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const teamId = Number(req.body.teamId);
    if (!teamId || !(await canAccessTeamChat(authed.user, teamId))) {
      return res.status(403).json({ message: "Kein Zugriff auf diesen Team-Chat" });
    }
    const body = {
      ...req.body,
      authorId: authed.user!.id,
      authorName: authed.user!.name,
      createdAt: new Date().toISOString(),
    };
    const parsed = insertChatMessageSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createChatMessage(parsed.data));
  });


  app.use("/api/chat", router);
}

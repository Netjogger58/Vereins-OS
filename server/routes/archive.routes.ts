import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { importArchiveSeasonFromWebsite } from "../archiveImport";

export function registerArchiveRoutes(app: Express) {
  app.get("/api/archive/seasons", requireAuth(), async (_req, res) => {
    const seasons = await storage.getArchiveSeasons();
    res.json(seasons);
  });

  app.get("/api/archive/teams/:seasonId", requireAuth(), async (req, res) => {
    const seasonId = parseInt(req.params.seasonId as string, 10);
    const teams = await storage.getArchiveTeams(seasonId);
    res.json(teams);
  });

  app.get("/api/archive/members/:seasonId", requireAuth(), async (req, res) => {
    const seasonId = parseInt(req.params.seasonId as string, 10);
    const members = await storage.getArchiveMembers(seasonId);
    res.json(members);
  });

  app.get("/api/archive/matches/:seasonId", requireAuth(), async (req, res) => {
    const seasonId = parseInt(req.params.seasonId as string, 10);
    const matches = await storage.getArchiveMatches(seasonId);
    res.json(matches);
  });

  app.get("/api/archive/export/:seasonId", requireAuth(), async (req, res) => {
    const seasonId = parseInt(req.params.seasonId as string, 10);
    const jsonData = await storage.exportSeasonToJson(seasonId);
    if (!jsonData) {
      return res.status(404).json({ message: "Saison nicht gefunden" });
    }
    res.json(JSON.parse(jsonData));
  });

  app.post("/api/archive/import", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    try {
      const imported = await storage.importSeasonFromJson(JSON.stringify(req.body));
      res.json(imported);
    } catch (error) {
      res.status(400).json({ message: "Import fehlgeschlagen", error: String(error) });
    }
  });

  app.post("/api/archive/rollover", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { newSeasonName, newSeasonStart, newSeasonEnd, finishedSeasonName, resetLiveData } = req.body || {};
    if (!newSeasonName || !newSeasonStart || !newSeasonEnd) {
      return res.status(400).json({ message: "newSeasonName, newSeasonStart und newSeasonEnd sind erforderlich" });
    }
    try {
      const result = await storage.rolloverSeason({
        newSeasonName,
        newSeasonStart,
        newSeasonEnd,
        finishedSeasonName,
        resetLiveData: resetLiveData !== false,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Saison-Rollover fehlgeschlagen", error: String(error) });
    }
  });

  app.post("/api/admin/archive/import-website", requireAuth(["präsident", "admin", "secretaire"] as any[]), async (req, res) => {
    const { seasonName, startDate, endDate } = req.body || {};
    if (!seasonName || !startDate || !endDate) {
      return res.status(400).json({ message: "seasonName, startDate und endDate sind erforderlich" });
    }
    try {
      const result = await importArchiveSeasonFromWebsite({ seasonName, startDate, endDate });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Website-Archiv-Import fehlgeschlagen", error: error?.message || String(error) });
    }
  });
}

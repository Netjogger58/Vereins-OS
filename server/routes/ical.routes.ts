import crypto from "node:crypto";
import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest } from "../auth";
import { storage } from "../storage";
import type { Event } from "@shared/schema";

function escapeIcs(str: string) {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsDateTime(iso: string) {
  return iso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildIcs(events: Event[], title: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//M75-Manager//${title}//DE`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const e of events) {
    const start = e.time ? `${e.date}T${e.time}:00` : `${e.date}T00:00:00`;
    const end = e.endTime ? `${e.date}T${e.endTime}:00` : `${e.date}T23:59:59`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:m75-${e.id}@mersch75.lu`,
      `DTSTAMP:${toIcsDateTime(new Date().toISOString())}`,
      `DTSTART:${toIcsDateTime(start)}`,
      `DTEND:${toIcsDateTime(end)}`,
      `SUMMARY:${escapeIcs(e.title)}`,
      e.location ? `LOCATION:${escapeIcs(e.location)}` : "",
      e.description ? `DESCRIPTION:${escapeIcs(e.description)}` : "",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}

export function registerIcalRoutes(app: any) {
  app.get("/calendar/:token.ics", async (req: Request, res: Response) => {
    const user = await storage.getUserByIcalToken(String(req.params.token));
    if (!user) return res.status(404).send("Nicht gefunden");
    const events = await storage.listEvents();
    const ics = buildIcs(events, "M75 Termine");
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", "inline; filename=mersch75.ics");
    res.send(ics);
  });

  app.get("/api/calendar/token", requireAuth(), async (req: AuthedRequest, res: Response) => {
    let token = req.user!.icalToken;
    if (!token) {
      token = crypto.randomBytes(16).toString("hex");
      await storage.updateUser(req.user!.id, { icalToken: token });
    }
    const url = `${req.protocol}://${req.get("host") || "localhost"}/calendar/${token}.ics`;
    res.json({ token, url });
  });
}

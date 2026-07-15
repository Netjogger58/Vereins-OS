import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { sendEmail } from "../email";
import { insertDonationSchema, insertTrialRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export function registerPublicRoutes(app: any) {
  const router = Router();

  router.get("/events", async (_req: Request, res: Response) => {
    const today = new Date().toISOString().slice(0, 10);
    const events = (await storage.listEvents()).filter((e) => e.date >= today);
    res.json(events);
  });

  router.get("/matches", async (_req: Request, res: Response) => {
    const today = new Date().toISOString().slice(0, 10);
    const matches = (await storage.listMatches({})).filter((m: any) => (m.date || m.matchDate || "") >= today);
    res.json(matches);
  });

  router.get("/standings", async (_req: Request, res: Response) => {
    const teams = await storage.listTeams();
    // Simple placeholder standing: based on team list; real implementation would pull match results
    res.json(teams.map((t: any) => ({ team: t.name, played: 0, won: 0, drawn: 0, lost: 0, points: 0, goalsFor: 0, goalsAgainst: 0 })));
  });

  router.get("/sponsors", async (_req: Request, res: Response) => {
    res.json(await storage.listSponsors());
  });

  router.get("/facilities", async (_req: Request, res: Response) => {
    res.json(await storage.listFacilities());
  });

  router.get("/polls", async (_req: Request, res: Response) => {
    const polls = (await storage.listPolls()).filter((p) => p.status === "active");
    const enriched = await Promise.all(
      polls.map(async (p) => {
        const options = await storage.getPollOptions(p.id!);
        const results = await storage.getPollResults(p.id!);
        return { ...p, options, results };
      })
    );
    res.json(enriched);
  });

  router.get("/donations", async (_req: Request, res: Response) => {
    const donations = await storage.listDonations();
    const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const byCampaign: Record<string, number> = {};
    for (const d of donations) {
      const key = d.campaign || "Allgemein";
      byCampaign[key] = (byCampaign[key] || 0) + Number(d.amount);
    }
    res.json({ total, count: donations.length, byCampaign });
  });

  router.post("/donations", async (req: Request, res: Response) => {
    const data = insertDonationSchema.safeParse(req.body);
    if (!data.success) return res.status(400).json({ message: data.error.message });
    const donation = await storage.createDonation(data.data);
    res.status(201).json(donation);
  });

  router.post("/trial-registrations", async (req: Request, res: Response) => {
    const data = insertTrialRegistrationSchema.safeParse(req.body);
    if (!data.success) return res.status(400).json({ message: data.error.message });

    // Alter am Saisonbeginn (1. August) berechnen
    const body = data.data as any;
    if (body.birthdate) {
      const seasonStart = new Date(new Date().getFullYear(), 7, 1);
      const birth = new Date(body.birthdate);
      let age = seasonStart.getFullYear() - birth.getFullYear();
      if (new Date(seasonStart.getFullYear(), birth.getMonth(), birth.getDate()) > seasonStart) age--;
      body.age = age;
    }

    const registration = await storage.createTrialRegistration(body);

    const category = body.teamCategory || "k.A.";
    const childInfo = `${body.childName} (${body.birthdate}${body.gender ? ", " + body.gender : ""})`;
    const parentInfo = `${body.parentName} <${body.email}>${body.phone ? " Tel.: " + body.phone : ""}`;
    const notes = body.note ? "Bemerkung: " + body.note : "";

    const nowIso = new Date().toISOString();

    await sendEmail({
      createdAt: nowIso,
      toEmail: "max.hbm75@gmail.com",
      subject: "Neue Probetraining-Anfrage für Mersch 75",
      body: `<p>Hallo Max,</p>
<p>es liegt eine neue Probetraining-Anfrage vor:</p>
<ul>
  <li>Kind: ${childInfo}</li>
  <li>Kategorie: ${category}</li>
  <li>Elternteil: ${parentInfo}</li>
  ${notes ? "<li>" + notes + "</li>" : ""}
</ul>
<p>Die Anfrage wurde im Vereins-OS erfasst.</p>`
    });

    await sendEmail({
      createdAt: nowIso,
      toEmail: "info@mersch75.lu",
      subject: "Nouvelle demande d'entraînement d'essai – Mersch 75",
      body: `<p>Bonjour,</p>
<p>Une nouvelle demande d'entraînement d'essai est arrivée :</p>
<ul>
  <li>Enfant : ${childInfo}</li>
  <li>Catégorie : ${category}</li>
  <li>Responsable : ${parentInfo}</li>
  ${notes ? "<li>" + notes + "</li>" : ""}
</ul>
<p>Max Blanc a été informé de cette demande.</p>`
    });

    res.status(201).json(registration);
  });

  router.post("/sponsor-inquiries", async (req: Request, res: Response) => {
    const sponsorInquirySchema = z.object({
      company: z.string().min(1, "Firma erforderlich"),
      contactName: z.string().min(1, "Kontaktperson erforderlich"),
      email: z.string().email("Gültige E-Mail erforderlich"),
      phone: z.string().optional(),
      interest: z.string().min(1, "Interesse erforderlich"),
      message: z.string().optional(),
      consent: z.boolean().or(z.string().transform((v) => v === "true" || v === "on")).optional(),
    });

    const parsed = sponsorInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }

    const body = parsed.data;
    const nowIso = new Date().toISOString();
    const phone = body.phone || "k.A.";
    const message = body.message || "k.A.";

    await sendEmail({
      createdAt: nowIso,
      toEmail: "max.hbm75@gmail.com",
      subject: "Neue Sponsor / Partner-Anfrage für Mersch 75",
      body: `<p>Hallo Max,</p>
<p>es liegt eine neue Sponsor / Partner-Anfrage vor:</p>
<ul>
  <li>Firma: ${body.company}</li>
  <li>Kontakt: ${body.contactName}</li>
  <li>E-Mail: ${body.email}</li>
  <li>Telefon: ${phone}</li>
  <li>Interesse: ${body.interest}</li>
  <li>Nachricht: ${message}</li>
</ul>
<p>Die Anfrage wurde über die Website erfasst.</p>`
    });

    await sendEmail({
      createdAt: nowIso,
      toEmail: "info@mersch75.lu",
      subject: "Nouvelle demande de sponsoring / partenariat – Mersch 75",
      body: `<p>Bonjour,</p>
<p>Une nouvelle demande de sponsoring / partenariat est arrivée :</p>
<ul>
  <li>Entreprise : ${body.company}</li>
  <li>Contact : ${body.contactName}</li>
  <li>E-mail : ${body.email}</li>
  <li>Téléphone : ${phone}</li>
  <li>Intérêt : ${body.interest}</li>
  <li>Message : ${message}</li>
</ul>
<p>Max Blanc a été informé de cette demande.</p>`
    });

    res.status(201).json({ success: true });
  });

  app.use("/api/public", router);
}

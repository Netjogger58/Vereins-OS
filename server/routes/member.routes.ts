import { Router, type Response, type Request } from "express";
import { storage, sqlite } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { insertMemberSchema, type InsertEmail } from "@shared/schema";
import { createConvocation, getConvocation, markSent, markConfirmed, markDeclined, buildConvocationEmailHtml, buildConfirmationPage, normalizeLang } from "../medicoConvocation";
import { CONV_TEXTS } from "@shared/convocationText";
import { queueEmail, processPendingEmails } from "../email";

const MEDICO_NOTIFY_EMAIL = process.env.MEDICO_NOTIFY_EMAIL || "info@mersch75.lu";

function publicBaseUrl(req: any): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol || "http";
  return `${proto}://${req.get("host")}`;
}

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function registerMemberRoutes(app: any) {
  const router = Router();

  // ─── Members ──────────────────────────────────────────
  router.get("/", requireAuth(), async (_req: Request, res: Response) => {
    res.json(await storage.listMembers());
  });
  router.get("/:id", requireAuth(), async (req: Request, res: Response) => {
    const m = await storage.getMember(Number(req.params.id));
    if (!m) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(m);
  });
  router.get("/me", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const m = await storage.getMemberByUserId(req.user!.id);
    if (!m) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(m);
  });
  router.get("/children", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const childUsers = await storage.getChildrenOfParent(req.user!.id);
    const children: any[] = [];
    for (const u of childUsers) {
      const m = await storage.getMemberByUserId(u.id);
      if (m) children.push({ ...m, childUserId: u.id });
    }
    res.json(children);
  });
  router.post("/", requireAuth(["präsident", "admin", "trainer"]), async (req: Request, res: Response) => {
    const parsed = insertMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMember(parsed.data));
  });
  router.patch("/:id", requireAuth(["präsident", "admin", "trainer", "spieler", "secretaire"]), async (req: any, res: any) => {
    const id = Number(req.params.id);
    const extra = ["guardianName","guardianPhone","guardianEmail","guardian2Name","guardian2Phone","nationality","contactPerson"];
    const mainFields: any = {};
    const extraFields: any = {};
    for (const [k,v] of Object.entries(req.body)) {
      if (extra.includes(k)) extraFields[k]=v;
      else mainFields[k]=v;
    }
    let m: any = null;
    if (Object.keys(mainFields).length) m = await storage.updateMember(id, mainFields);
    if (Object.keys(extraFields).length) {
      const db = (storage as any).db || require("../storage").db;
      const sets = Object.entries(extraFields).map(([k]) => {
        const col = k.replace(/([A-Z])/g, "_$1").toLowerCase();
        return col+" = ?";
      }).join(", ");
      const vals = [...Object.values(extraFields), id];
      require("better-sqlite3")((storage as any).sqlite?.name || "./data.db")
        .prepare("UPDATE members SET "+sets+" WHERE id = ?").run(...vals);
    }
    if (!m) m = (await storage.getMember(id)) || {};
    res.json(m);
  });
  router.delete("/:id", requireAuth(["präsident", "admin"]), async (req: Request, res: Response) => {
    await storage.deleteMember(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Sekretariat: komplette Mitgliederliste (Excel-Daten + neue Codierung + Präsenz) ──
  // Zugriff nur für Präsident, Admin, Sekretär, Trésorier (Kassenwart).
  app.get("/api/secretary/roster", requireAuth(["präsident", "admin", "secretaire", "kassenwart"]), async (_req: Request, res: Response) => {
    const members = await storage.listMembers();

    // Trainingspräsenz pro Mitglied (attendance-Tabelle, member_id)
    const attMap = new Map<number, { present: number; total: number; last: string | null }>();
    try {
      const rows = sqlite.prepare(
        "SELECT member_id AS mid, SUM(CASE WHEN present THEN 1 ELSE 0 END) AS present, COUNT(*) AS total, MAX(date) AS last FROM attendance GROUP BY member_id"
      ).all() as any[];
      for (const r of rows) attMap.set(Number(r.mid), { present: Number(r.present) || 0, total: Number(r.total) || 0, last: r.last || null });
    } catch { /* Tabelle evtl. leer */ }

    // Matcherpräsenz pro User (match_lineups) — guarded (Tabelle evtl. noch nicht vorhanden)
    const matchMap = new Map<number, number>();
    try {
      const rows = sqlite.prepare("SELECT user_id AS uid, COUNT(*) AS cnt FROM match_lineups GROUP BY user_id").all() as any[];
      for (const r of rows) matchMap.set(Number(r.uid), Number(r.cnt) || 0);
    } catch { /* keine Matchdaten */ }

    // Funktionen pro Mitglied (neue Codierung: comite/officiel/arbitre/coach/…)
    // fnMap = deduplizierte Funktions-Namen (für Filter), fnDetail = eine Zeile je
    // Funktion inkl. Qualifikation (z.B. comite → "Webmanager", officiel → "Chrono").
    const fnMap = new Map<number, string[]>();
    const fnDetail = new Map<number, Map<string, { qualification: string; note: string }>>();
    try {
      const rows = sqlite.prepare("SELECT member_id AS mid, function AS fn, qualification AS qual, note FROM member_functions").all() as any[];
      for (const r of rows) {
        if (!r.fn) continue;
        const mid = Number(r.mid);
        const arr = fnMap.get(mid) || [];
        if (!arr.includes(r.fn)) arr.push(r.fn);
        fnMap.set(mid, arr);
        const dmap = fnDetail.get(mid) || new Map<string, { qualification: string; note: string }>();
        const ex = dmap.get(r.fn);
        // Zeile mit Qualifikation bevorzugen
        if (!ex || (!ex.qualification && r.qual)) dmap.set(r.fn, { qualification: r.qual || "", note: r.note || "" });
        fnDetail.set(mid, dmap);
      }
    } catch { /* keine Funktionen */ }

    const roster = members.map((m: any) => {
      let raw: Record<string, any> = {};
      try { raw = m.rawData ? JSON.parse(m.rawData) : {}; } catch { raw = {}; }
      const att = attMap.get(m.id) || { present: 0, total: 0, last: null };
      const trainingRate = att.total ? Math.round((att.present / att.total) * 100) : null;
      const matchCount = m.userId ? (matchMap.get(m.userId) || 0) : 0;
      const active = att.total > 0 || matchCount > 0;
      const { rawData, faceDescriptor, ...rest } = m;
      const dmap = fnDetail.get(m.id);
      return {
        ...rest,
        functions: fnMap.get(m.id) || [],
        functionDetails: dmap
          ? Array.from(dmap.entries()).map(([fn, v]) => ({ function: fn, qualification: v.qualification, note: v.note }))
          : [],
        trainingPresent: att.present,
        trainingTotal: att.total,
        trainingRate,
        trainingLast: att.last,
        matchCount,
        active,
        raw,
      };
    });

    res.json(roster);
  });

  // ─── Médico-Convocation per E-Mail (mit Bestätigungs-Link) ──
  // Verschickt einen personalisierten Brief; der Empfänger bestätigt per Klick.
  app.post("/api/secretary/medico/convocation", requireAuth(["präsident", "admin", "secretaire", "kassenwart"]), async (req: Request, res: Response) => {
    const memberId = Number(req.body?.memberId);
    const rdvRaw = req.body?.rdv ? String(req.body.rdv) : null; // ISO oder datetime-local
    const member = await storage.getMember(memberId);
    if (!member) return res.status(404).json({ message: "Mitglied nicht gefunden" });
    if (!member.email || !member.email.includes("@")) return res.status(400).json({ message: "Mitglied hat keine gültige E-Mail-Adresse" });

    const lang = normalizeLang(req.body?.lang);
    const rdvDate = rdvRaw ? new Date(rdvRaw) : null;
    if (rdvRaw && isNaN(rdvDate!.getTime())) return res.status(400).json({ message: "Ungültiges RDV-Datum" });

    const token = createConvocation({ memberId: member.id, name: member.name, email: member.email, lang, rdv: rdvDate ? rdvDate.toISOString() : null });
    const baseUrl = publicBaseUrl(req);
    const confirmUrl = `${baseUrl}/medico/confirm/${token}`;
    const html = buildConvocationEmailHtml({ name: member.name, lang, rdv: rdvDate, confirmUrl, baseUrl });

    await queueEmail({
      toEmail: member.email,
      toName: member.name,
      subject: CONV_TEXTS[lang].emailSubject,
      body: html,
      template: "custom",
      status: "pending",
      memberId: member.id,
      createdAt: new Date().toISOString(),
    });
    await processPendingEmails();

    const rec = getConvocation(token);
    if (rec?.sent_at) return res.json({ success: true, sent: true, email: member.email });
    markSent(token, rec?.send_error || "unbekannt");
    return res.status(502).json({ success: false, message: "E-Mail konnte nicht gesendet werden. Ist der SMTP-Zugang in den Einstellungen aktiv?" });
  });

  // Öffentlicher Antwort-Link (kein Login) — Empfänger klickt in der E-Mail.
  // ?a=confirm (Standard) bestätigt den Termin, ?a=decline sagt ihn ab (neuer RDV nötig).
  app.get("/medico/confirm/:token", async (req: Request, res: Response) => {
    const token = String(req.params.token || "");
    const rec = getConvocation(token);
    if (!rec) { res.status(404).send("<h1>Link ungültig</h1>"); return; }
    const lang = normalizeLang(rec.lang);
    const kind = qs(req.query.a as any) === "decline" ? "decline" as const : "confirm" as const;
    const already = !!rec.confirmed_at || !!rec.declined_at;
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    if (!already) {
      const changed = kind === "confirm" ? markConfirmed(token, ip) : markDeclined(token, ip);
      if (changed) {
        // Sekretariat benachrichtigen
        try {
          const rdvStr = rec.rdv ? new Date(rec.rdv).toLocaleString("fr-LU") : "—";
          const meta = `<p>RDV: ${rdvStr}<br/>E-Mail: ${rec.email}<br/>Zeit: ${new Date().toLocaleString("fr-LU")}</p>`;
          const body = kind === "confirm"
            ? `<p><strong>${rec.name}</strong> hat den Médico-Rendez-vous <strong>bestätigt</strong>.</p>${meta}`
            : `<p style="color:#b91c1c"><strong>${rec.name}</strong> kann den Médico-Rendez-vous <strong>NICHT</strong> wahrnehmen — bitte neuen Termin vergeben.</p>${meta}`;
          await queueEmail({
            toEmail: MEDICO_NOTIFY_EMAIL,
            toName: "Sekretariat Mersch 75",
            subject: `${kind === "confirm" ? "Médico bestätigt" : "Médico ABGESAGT"}: ${rec.name}`,
            body,
            template: "custom",
            status: "pending",
            memberId: rec.member_id || undefined,
            createdAt: new Date().toISOString(),
          });
          await processPendingEmails();
        } catch { /* Benachrichtigung optional */ }
      }
    }
    // Anzeige richtet sich nach dem tatsächlich gespeicherten Status.
    const fresh = getConvocation(token);
    const shownKind: "confirm" | "decline" = fresh?.declined_at ? "decline" : fresh?.confirmed_at ? "confirm" : kind;
    res.set("Content-Type", "text/html; charset=utf-8").send(buildConfirmationPage(lang, shownKind, already));
  });

  // Status der versendeten Convocations (für die Sekretariat-Anzeige)
  app.get("/api/secretary/medico/convocations", requireAuth(["präsident", "admin", "secretaire", "kassenwart"]), async (_req: Request, res: Response) => {
    const rows = sqlite.prepare(
      "SELECT member_id AS memberId, name, email, lang, rdv, status, sent_at AS sentAt, confirmed_at AS confirmedAt, declined_at AS declinedAt, created_at AS createdAt FROM medico_convocations ORDER BY created_at DESC LIMIT 500"
    ).all();
    res.json(rows);
  });

  // Médico-Resultat pro Mitglied setzen (apte / apte_temporaire / inapte / absent / "" = löschen).
  const MEDICO_RESULTS = ["apte", "apte_temporaire", "inapte", "absent"];
  app.post("/api/secretary/medico/result", requireAuth(["präsident", "admin", "secretaire", "kassenwart"]), async (req: Request, res: Response) => {
    const memberId = Number(req.body?.memberId);
    const result = String(req.body?.result || "").trim();
    if (!memberId) return res.status(400).json({ message: "memberId erforderlich" });
    if (result && !MEDICO_RESULTS.includes(result)) return res.status(400).json({ message: "Ungültiges Resultat" });
    const member = await storage.getMember(memberId);
    if (!member) return res.status(404).json({ message: "Mitglied nicht gefunden" });
    const now = result ? new Date().toISOString() : null;
    sqlite.prepare("UPDATE members SET medico_result = ?, medico_result_date = ? WHERE id = ?")
      .run(result || null, now, memberId);
    res.json({ success: true, memberId, result: result || null, medicoResultDate: now });
  });


  app.use("/api/members", router);
}

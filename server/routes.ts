import type { Express, Response } from "express";
import express from "express";
import type { Server } from "node:http";
import { randomBytes } from "node:crypto";
import { getArchiveDir } from "./sboArchive";
import bcrypt from "bcryptjs";
import { storage, seedIfEmpty, seedTestCards, sqlite } from "./storage";
import { registerWaitlistRoutes } from "./routes/waitlist.routes";
import { registerGdprRoutes } from "./routes/gdpr.routes";
import { registerArchiveRoutes } from "./routes/archive.routes";
import { registerInventoryRoutes } from "./routes/inventory.routes";
import { registerPollRoutes } from "./routes/poll.routes";
import { registerFacilityRoutes } from "./routes/facility.routes";
import { registerOpponentRoutes } from "./routes/opponent.routes";
import { registerCarpoolRoutes } from "./routes/carpool.routes";
import { registerBulkRoutes } from "./routes/bulk.routes";
import { registerMassEmailRoutes } from "./routes/massEmail.routes";
import { registerBankImportRoutes } from "./routes/bankImport.routes";
import { registerInvoiceRoutes } from "./routes/invoice.routes";
import { registerDonationRoutes } from "./routes/donation.routes";
import { registerIcalRoutes } from "./routes/ical.routes";
import { registerExerciseRoutes } from "./routes/exercise.routes";
import { registerMatchEventRoutes } from "./routes/matchEvent.routes";
import { registerTrialRegistrationRoutes } from "./routes/trialRegistration.routes";
import { registerPublicRoutes } from "./routes/public.routes";
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerTeamRoutes } from "./routes/team.routes";
import { registerMemberRoutes } from "./routes/member.routes";
import { registerAttendanceRoutes } from "./routes/attendance.routes";
import { registerAnnouncementRoutes } from "./routes/announcement.routes";
import { registerEventRoutes } from "./routes/event.routes";
import { registerChatRoutes } from "./routes/chat.routes";
import { registerMatchRoutes } from "./routes/match.routes";
import {
  authMiddleware,
  requireAuth,
  requireApiToken,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
  publicUser,
  loginKey,
  checkLockout,
  recordLoginFailure,
  clearLoginFailures,
  type AuthedRequest,
} from "./auth";
import { maybeStartTwoFactor, verifyTwoFactorCode, trustDevice } from "./twofactor";
import { sendSMS, generateOTPCode, storeOTP, verifyOTP, clearOTP, normalizePhone } from "./sms";
import { isActiveClubMember } from "@shared/memberStatus";
import {
  insertMemberSchema,
  insertTeamSchema,
  insertTrainerCodeSchema,
  insertAnnouncementSchema,
  insertEventSchema,
  insertMeetingSchema,
  insertTransactionSchema,
  insertBudgetSchema,
  insertAccountSchema,
  insertPlayerFlagSchema,
  insertAttendanceSchema,
  insertAvailabilitySchema,
  insertFeeRuleSchema,
  insertMemberFeeSchema,
  insertFeePaymentSchema,
  insertNominationSchema,
  insertChatMessageSchema,
  insertEmailSettingsSchema,
  insertEmailSchema,
  insertDocumentSchema,
  insertRegistrationSchema,
  insertTrainingScheduleSchema,
  insertMatchSchema,
  insertMatchGoalSchema,
  insertStandingSchema,
  type InsertEmail,
  // Archive Schemas
  insertArchiveSeasonSchema,
  insertArchiveTeamSchema,
  insertArchiveMemberSchema,
  insertArchiveMatchSchema,
  insertArchiveEventSchema,
  insertArchiveExportSchema,
  isParentChatTeam,
} from "@shared/schema";
import { initEmailTransporter, queueEmail, processPendingEmails, getWelcomeEmailTemplate, getFeeReminderTemplate, getSecurityAlertTemplate, getRegistrationConfirmationTemplate, sendEmail } from "./email";
import { createConvocation, getConvocation, markSent, markConfirmed, markDeclined, buildConvocationEmailHtml, buildConfirmationPage, normalizeLang } from "./medicoConvocation";
import { CONV_TEXTS } from "@shared/convocationText";

function publicBaseUrl(req: any): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol || "http";
  return `${proto}://${req.get("host")}`;
}
const MEDICO_NOTIFY_EMAIL = process.env.MEDICO_NOTIFY_EMAIL || "info@mersch75.lu";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

// ─── Member-Card-ID Helpers (kompatibel mit mersch75.lu join.html / kees-scanner.html) ───
const CARD_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCardId(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += CARD_ID_ALPHABET[bytes[i] % CARD_ID_ALPHABET.length];
  return out;
}

async function generateUniqueCardId(): Promise<string> {
  for (let tries = 0; tries < 6; tries++) {
    const id = generateCardId();
    const existing = await storage.getMemberCardByCardNumber(id);
    if (!existing) return id;
  }
  return generateCardId();
}

async function generateUniqueTrainerCode(): Promise<string> {
  for (let tries = 0; tries < 8; tries++) {
    const id = generateCardId();
    const existing = await storage.getTrainerCodeByCode(id);
    if (!existing) return id;
  }
  return generateCardId();
}

// Löst die Team-IDs auf, die ein Trainer-Code abdeckt (allTeams => alle Team-IDs)
async function resolveTrainerTeamIds(code: { allTeams: boolean; teamIds: string | null }): Promise<number[]> {
  if (code.allTeams) return (await storage.listTeams()).map((t) => t.id);
  try {
    const parsed = JSON.parse(code.teamIds || "[]");
    return Array.isArray(parsed) ? parsed.map((n: any) => Number(n)).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

// Extracts the canonical 8-char Card-ID from any payload:
// raw 8-char, "Card-ID: XXXXXXXX", JSON {cardNumber}, or "M75-XXXX-XXXX".
function extractCardId(input: string): string {
  const raw = String(input || "");

  // JSON payload (legacy M75 format)
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.cardNumber) return extractCardId(String(parsed.cardNumber));
  } catch { /* not JSON */ }

  // M75-XXXX-XXXX → join the two 4-char groups
  const m75 = raw.toUpperCase().match(/M75-([A-Z0-9]{4})-([A-Z0-9]{4})/);
  if (m75) return (m75[1] + m75[2]);

  // explicit "Card-ID: XXXXXXXX"
  const explicit = raw.match(/CARD[- ]?ID\s*[:=]\s*([A-Z0-9]{8})/i);
  if (explicit) return explicit[1].toUpperCase();

  // bare 8-char token
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length === 8) return compact;
  const any = raw.toUpperCase().match(/\b[A-Z0-9]{8}\b/);
  if (any) return any[0];

  // fallback: M75 + 8 chars compacted
  if (compact.startsWith("M75") && compact.length >= 11) return compact.slice(3, 11);
  return compact.slice(0, 8);
}

// Display format: M75-XXXX-XXXX
function formatCardNumber(cardId: string): string {
  const id = String(cardId || "").toUpperCase();
  return id.length === 8 ? `M75-${id.slice(0, 4)}-${id.slice(4)}` : id;
}

// Mask email for display: j***@example.com
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user[0]}${"*".repeat(Math.max(user.length - 1, 2))}@${domain}`;
}

// Mask phone for display: +352621***456
function maskPhone(phone: string): string {
  if (phone.length <= 4) return "***";
  const start = phone.slice(0, 6);
  const end = phone.slice(-3);
  return `${start}${"*".repeat(Math.max(phone.length - 9, 3))}${end}`;
}


function generateMembersPdfHtml(members: any[]) {
  const rows = members.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.email || "-"}</td>
      <td>${m.phone || "-"}</td>
      <td>${m.birthdate || "-"}</td>
      <td>${m.licenseNumber || "-"}</td>
    </tr>
  `).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mitgliederliste</title>
  <style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;color:#1d1d1f}
  h1{font-size:28px;font-weight:700;letter-spacing:-0.025em;margin-bottom:8px}
  .date{color:#86868b;margin-bottom:24px}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:10px 12px;border-bottom:2px solid #d2d2d7;font-size:13px;color:#86868b;text-transform:uppercase;letter-spacing:0.05em}
  td{padding:10px 12px;border-bottom:1px solid #e5e5ea;font-size:15px}
  tr:hover{background:#f5f5f7}
  .footer{margin-top:32px;font-size:12px;color:#aeaeb2;text-align:center}
  </style></head><body>
  <h1>Mitgliederliste</h1>
  <p class="date">Stand: ${new Date().toLocaleDateString("de-DE")} | ${members.length} Mitglieder</p>
  <table><thead><tr><th>Name</th><th>E-Mail</th><th>Telefon</th><th>Geburtsdatum</th><th>Lizenz</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="footer">Mersch75 Handball · Generiert am ${new Date().toLocaleString("de-DE")}</p>
  </body></html>`;
}

function generateFinancePdfHtml(transactions: any[]) {
  const rows = transactions.map((t: any) => `
    <tr>
      <td>${t.date || "-"}</td>
      <td>${t.description || "-"}</td>
      <td>${t.category || "-"}</td>
      <td class="${t.type === "income" ? "income" : "expense"}">${t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(2)} EUR</td>
    </tr>
  `).join("");
  const balance = transactions.reduce((sum: number, t: any) => sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kassenbuch</title>
  <style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:40px;color:#1d1d1f}
  h1{font-size:28px;font-weight:700;letter-spacing:-0.025em;margin-bottom:8px}
  .date{color:#86868b;margin-bottom:24px}
  .balance{font-size:20px;font-weight:600;margin-bottom:24px}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:10px 12px;border-bottom:2px solid #d2d2d7;font-size:13px;color:#86868b;text-transform:uppercase;letter-spacing:0.05em}
  td{padding:10px 12px;border-bottom:1px solid #e5e5ea;font-size:15px}
  .income{color:#34c759;font-weight:600}
  .expense{color:#ff3b30;font-weight:600}
  .footer{margin-top:32px;font-size:12px;color:#aeaeb2;text-align:center}
  </style></head><body>
  <h1>Kassenbuch</h1>
  <p class="date">Stand: ${new Date().toLocaleDateString("de-DE")} | ${transactions.length} Buchungen</p>
  <p class="balance">Saldo: ${balance >= 0 ? "+" : ""}${balance.toFixed(2)} EUR</p>
  <table><thead><tr><th>Datum</th><th>Beschreibung</th><th>Kategorie</th><th>Betrag</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="footer">Mersch75 Handball · Generiert am ${new Date().toLocaleString("de-DE")}</p>
  </body></html>`;
}

export async function registerRoutes(_httpServer: Server, app: Express): Promise<Server> {
  await seedIfEmpty();
  seedTestCards();

  // Health check endpoint (used by Docker HEALTHCHECK)
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Increase JSON body limit for photo uploads (base64)
  // Note: express.json middleware already configured in index.ts

  // Öffentliche Endpunkte für die Website (kein Login erforderlich)
  registerPublicRoutes(app);

  app.use(authMiddleware);

  // ─── SBO-Archiv (eis PDF-Kopien) statesch ausliwweren ───
  app.use("/sbo-archiv", express.static(getArchiveDir()));

  // ─── Auth ──────────────────────────────────────────────
  registerAuthRoutes(app);
  registerTeamRoutes(app);
  registerMemberRoutes(app);
  registerAttendanceRoutes(app);
  registerAnnouncementRoutes(app);
  registerEventRoutes(app);
  registerChatRoutes(app);
  registerMatchRoutes(app);


  // ─── Meetings ─────────────────────────────────────────
  app.get("/api/meetings", requireAuth(), async (_req, res) => {
    res.json(await storage.listMeetings());
  });
  app.post("/api/meetings", requireAuth(["präsident", "admin", "trainer"]), async (req: AuthedRequest, res) => {
    const suffix = Math.random().toString(36).slice(2, 10);
    const body = {
      ...req.body,
      jitsiRoom: req.body.jitsiRoom || `Mersch75-${suffix}`,
      authorId: (req as any).user.id,
      createdAt: new Date().toISOString(),
    };
    const parsed = insertMeetingSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMeeting(parsed.data));
  });
  app.patch("/api/meetings/:id", requireAuth(["präsident", "admin", "trainer"]), async (req, res) => {
    const m = await storage.updateMeeting(Number(req.params.id), req.body);
    res.json(m);
  });
  app.delete("/api/meetings/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    await storage.deleteMeeting(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Accounts ─────────────────────────────────────────
  app.get("/api/accounts", requireAuth(["präsident", "admin", "kassenwart"]), async (_req, res) => {
    res.json(await storage.listAccounts());
  });
  app.post("/api/accounts", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const parsed = insertAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createAccount(parsed.data));
  });

  // ─── Transactions ─────────────────────────────────────
  app.get("/api/transactions", requireAuth(["präsident", "admin", "kassenwart"]), async (_req, res) => {
    res.json(await storage.listTransactions());
  });
  app.post("/api/transactions", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const body = { ...req.body, createdAt: new Date().toISOString() };
    const parsed = insertTransactionSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createTransaction(parsed.data));
  });
  app.delete("/api/transactions/:id", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Saison-Budgets (Prévisioun) ──────────────────────
  app.get("/api/season-budgets", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const season = req.query.season as string | undefined;
    res.json(await storage.listSeasonBudgets(season));
  });
  app.post("/api/season-budgets", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const parsed = insertBudgetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createSeasonBudget(parsed.data));
  });
  app.delete("/api/season-budgets/:id", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    await storage.deleteSeasonBudget(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Player Flags ─────────────────────────────────────
  app.get("/api/flags", requireAuth(), async (_req, res) => {
    res.json(await storage.listPlayerFlags());
  });
  app.post("/api/flags", requireAuth(["präsident", "admin", "trainer"]), async (req, res) => {
    const body = { ...req.body, createdAt: new Date().toISOString() };
    const parsed = insertPlayerFlagSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createPlayerFlag(parsed.data));
  });
  app.delete("/api/flags/:id", requireAuth(["präsident", "admin", "trainer"]), async (req, res) => {
    await storage.deletePlayerFlag(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Users (for Präsident) ────────────────────────────
  app.get("/api/users", requireAuth(["präsident", "admin"]), async (_req, res) => {
    const list = await storage.listUsers();
    res.json(list.map(publicUser));
  });

  // ─── Nominations ─────────────────────────────────────
  app.get("/api/nominations/event/:eventId", requireAuth(), async (req, res) => {
    res.json(await storage.listNominationsByEvent(Number(req.params.eventId)));
  });
  app.get("/api/nominations/team/:teamId", requireAuth(), async (req, res) => {
    res.json(await storage.listNominationsByTeam(Number(req.params.teamId)));
  });
  app.get("/api/nominations/member/:memberId", requireAuth(), async (req, res) => {
    res.json(await storage.listNominationsByMember(Number(req.params.memberId)));
  });
  app.post("/api/nominations", requireAuth(["präsident", "admin", "trainer"]), async (req, res) => {
    const body = { ...req.body, createdAt: new Date().toISOString() };
    const parsed = insertNominationSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createNomination(parsed.data));
  });
  // Spieler antwortet auf Nominierung (ja/nein + Begründung)
  app.patch("/api/nominations/:id/response", requireAuth(), async (req, res) => {
    const { response, reason } = req.body;
    if (!response || !["ja", "nein"].includes(response)) {
      return res.status(400).json({ message: "response must be 'ja' or 'nein'" });
    }
    const updated = await storage.updateNominationResponse(Number(req.params.id), response, reason);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });
  app.delete("/api/nominations/:id", requireAuth(["präsident", "admin", "trainer"]), async (req, res) => {
    await storage.deleteNomination(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Parent Account Management ───────────────────────
  // Admin/Präsident can create elternteil accounts and link them to child users
  app.post("/api/admin/parents", requireAuth(["präsident", "admin"]), async (req, res) => {
    const { email, name, password, childUserId, phone } = req.body;
    if (!email || !name || !password || !childUserId) {
      return res.status(400).json({ message: "email, name, password, childUserId required" });
    }
    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "E-Mail bereits registriert" });
    const hash = await bcrypt.hash(password, 10);
    const parent = await storage.createUser({
      email, passwordHash: hash, name, role: "elternteil", phone, active: true,
    } as any);
    await storage.createFamilyLink({
      parentId: parent.id, childId: Number(childUserId), relationship: "parent",
      canManageProfile: true, canManagePayments: true,
    } as any);
    res.json({ ok: true, parentId: parent.id });
  });

  // List family links for a parent
  app.get("/api/admin/parents/:parentId/children", requireAuth(["präsident", "admin"]), async (req, res) => {
    const children = await storage.getChildrenOfParent(Number(req.params.parentId));
    res.json(children);
  });

  // Import routes
  const { registerImportRoutes } = await import("./import");
  registerImportRoutes(app);

  // ─── Audit Logs (Security) ─────────────────────────────
  // Only präsident and admin can view audit logs
  app.get("/api/audit-logs", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { severity, limit, startDate, endDate } = req.query;
    const logs = await storage.listAuditLogs({
      severity: severity as string,
      limit: limit ? parseInt(limit as string) : 100,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(logs);
  });

  // Get unsent critical alerts (for email notification system)
  app.get("/api/audit-logs/critical", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const alerts = await storage.getUnsentCriticalAlerts();
    res.json(alerts);
  });

  // Mark alert as sent (for email system)
  app.post("/api/audit-logs/:id/mark-sent", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    await storage.markAuditLogEmailSent(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Fee Management (Beitragsmodul) ───────────────────────
  // Fee Rules (Beitragsregeln)
  app.get("/api/fee-rules", requireAuth(["präsident", "admin", "kassenwart"]), async (_req, res) => {
    res.json(await storage.listFeeRules());
  });

  app.post("/api/fee-rules", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertFeeRuleSchema.safeParse({ ...req.body, createdAt: new Date().toISOString() });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createFeeRule(parsed.data));
  });

  app.patch("/api/fee-rules/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    res.json(await storage.updateFeeRule(parseInt(qs(req.params.id)!), req.body));
  });

  app.delete("/api/fee-rules/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteFeeRule(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // Member Fees (Beitragszuordnung)
  app.get("/api/member-fees", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const { memberId, year } = req.query;
    res.json(await storage.listMemberFees(
      memberId ? parseInt(memberId as string) : undefined,
      year ? parseInt(year as string) : undefined
    ));
  });

  app.get("/api/members/:id/fees", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const memberId = parseInt(qs(req.params.id)!);
    const fees = await storage.listMemberFees(memberId);
    const summary = await storage.getMemberFeeSummary(memberId);
    res.json({ fees, summary });
  });

  app.post("/api/member-fees", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertMemberFeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createMemberFee(parsed.data));
  });

  app.patch("/api/member-fees/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    res.json(await storage.updateMemberFee(parseInt(qs(req.params.id)!), req.body));
  });

  app.delete("/api/member-fees/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteMemberFee(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // Fee Payments (Zahlungseingänge)
  app.get("/api/member-fees/:id/payments", requireAuth(), async (req, res) => {
    res.json(await storage.listFeePayments(parseInt(qs(req.params.id)!)));
  });

  app.post("/api/fee-payments", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertFeePaymentSchema.safeParse({
      ...req.body,
      createdById: authed.user!.id,
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createFeePayment(parsed.data));
  });

  app.delete("/api/fee-payments/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteFeePayment(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Fee Analysis (Beitragsanalyse & Generéierung) ──────
  app.get("/api/fees/analysis", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    try {
      const analysis = await storage.getFeeAnalysis(year);
      res.json(analysis);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Analyse fehlgeschlagen" });
    }
  });

  app.post("/api/fees/generate", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const authed = req as AuthedRequest;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    try {
      const result = await storage.generateFees(year, authed.user!.id);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Generierung fehlgeschlagen" });
    }
  });

  // ─── Email Settings ────────────────────────────────────
  app.get("/api/email-settings", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const settings = await storage.getEmailSettings();
    // Don't return password
    if (settings) {
      const { smtpPassword, ...safe } = settings;
      res.json(safe);
    } else {
      res.json(null);
    }
  });

  app.post("/api/email-settings", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertEmailSettingsSchema.safeParse({
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    
    const saved = await storage.saveEmailSettings(parsed.data);
    await initEmailTransporter();
    
    const { smtpPassword, ...safe } = saved;
    res.json(safe);
  });

  app.post("/api/email-settings/test", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const settings = await storage.getEmailSettings();
    if (!settings || !settings.enabled) {
      return res.status(400).json({ message: "Email nicht konfiguriert" });
    }

    try {
      await queueEmail({
        toEmail: authed.user!.email,
        toName: authed.user!.name,
        subject: "Test-E-Mail M75 Manager",
        body: `<h1>Test erfolgreich!</h1><p>Die E-Mail-Konfiguration funktioniert.</p>`,
        template: "custom",
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      await processPendingEmails();
      res.json({ success: true, message: "Test-E-Mail wurde gesendet" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // ─── Emails ──────────────────────────────────────────────
  app.get("/api/emails", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { status, userId } = req.query;
    res.json(await storage.listEmails({
      status: status as string | undefined,
      userId: userId ? parseInt(userId as string) : undefined,
      limit: 100,
    }));
  });

  // ─── Documents ───────────────────────────────────────────
  app.get("/api/documents", requireAuth(), async (req, res) => {
    const { memberId, category, visibility } = req.query;
    res.json(await storage.listDocuments({
      memberId: memberId ? parseInt(memberId as string) : undefined,
      category: category as string | undefined,
      visibility: visibility as string | undefined,
    }));
  });

  app.get("/api/documents/:id", requireAuth(), async (req, res) => {
    const doc = await storage.getDocument(parseInt(qs(req.params.id)!));
    if (!doc) return res.status(404).json({ message: "Dokument nicht gefunden" });
    res.json(doc);
  });

  app.post("/api/documents", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertDocumentSchema.safeParse({
      ...req.body,
      uploadedById: authed.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createDocument(parsed.data));
  });

  app.delete("/api/documents/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteDocument(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Registrations (Online-Anmeldung) ────────────────────
  // Public: Create registration (no auth required)
  app.post("/api/registrations", async (req, res) => {
    const parsed = insertRegistrationSchema.safeParse({
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    
    const reg = await storage.createRegistration(parsed.data);
    
    // Send confirmation email
    try {
      const settings = await storage.getEmailSettings();
      if (settings?.enabled) {
        const team = reg.teamId ? await storage.getTeam(reg.teamId) : null;
        await queueEmail({
          toEmail: reg.email,
          toName: `${reg.firstName} ${reg.lastName}`,
          subject: "Anmeldung eingegangen - M75",
          body: getRegistrationConfirmationTemplate(reg.firstName, team?.name || null),
          template: "welcome",
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        await processPendingEmails();
      }
    } catch (e) {
      console.error("Failed to send confirmation email:", e);
    }
    
    res.json(reg);
  });

  // Protected: List and manage registrations
  app.get("/api/registrations", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { status } = req.query;
    res.json(await storage.listRegistrations(status as string | undefined));
  });

  app.get("/api/registrations/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const reg = await storage.getRegistration(parseInt(qs(req.params.id)!));
    if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
    res.json(reg);
  });

  app.post("/api/registrations/:id/approve", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { notes } = req.body;
    const reg = await storage.approveRegistration(
      parseInt(qs(req.params.id)!),
      authed.user!.id,
      notes
    );
    if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
    res.json(reg);
  });

  app.post("/api/registrations/:id/reject", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Grund erforderlich" });
    
    const reg = await storage.rejectRegistration(
      parseInt(qs(req.params.id)!),
      authed.user!.id,
      reason
    );
    if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
    res.json(reg);
  });

  // Convert approved registration → member (auto-fill from registration data)
  app.post("/api/registrations/:id/convert", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const member = await storage.convertRegistration(
      parseInt(qs(req.params.id)!),
      authed.user!.id
    );
    if (!member) return res.status(404).json({ message: "Anmeldung nicht gefunden oder noch nicht genehmigt" });
    res.json(member);
  });

  // ─── Email Actions ───────────────────────────────────────
  app.post("/api/members/:id/send-reminder", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const memberId = parseInt(qs(req.params.id)!);
    const member = await storage.getMember(memberId);
    if (!member || !member.email) {
      return res.status(400).json({ message: "Mitglied hat keine E-Mail-Adresse" });
    }

    const { year } = req.body;
    const fees = await storage.listMemberFees(memberId, year || new Date().getFullYear());
    const openFees = fees.filter(f => f.status === "open" || f.status === "partial");
    
    if (openFees.length === 0) {
      return res.status(400).json({ message: "Keine offenen Beiträge" });
    }

    const totalOpen = openFees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    const dueDate = openFees[0].dueDate;

    await queueEmail({
      toEmail: member.email,
      toName: member.name,
      subject: "Beitragszahlung erinnern - M75",
      body: getFeeReminderTemplate(member.name, totalOpen, dueDate, "https://mersch75.lu/payment"),
      template: "reminder",
      status: "pending",
      memberId: member.id,
      createdAt: new Date().toISOString(),
    });
    
    await processPendingEmails();
    res.json({ success: true, message: "Erinnerung gesendet" });
  });

  // Initialize email on startup
  await initEmailTransporter();

  // ─── Statistics ────────────────────────────────────────
  app.get("/api/statistics/members", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    res.json(await storage.getMemberStatistics());
  });

  app.get("/api/statistics/finance", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    res.json(await storage.getFinancialStatistics(year));
  });

  app.get("/api/statistics/fees", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    res.json(await storage.getFeeStatistics(year));
  });

  app.get("/api/statistics/attendance", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    const month = req.query.month as string | undefined;
    res.json(await storage.getAttendanceStatistics(teamId, month));
  });

  // ─── Training Schedules ────────────────────────────────
  app.get("/api/training-schedules", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    res.json(await storage.listTrainingSchedules(teamId));
  });

  app.get("/api/training-schedules/:id", requireAuth(), async (req, res) => {
    const schedule = await storage.getTrainingSchedule(parseInt(qs(req.params.id)!));
    if (!schedule) return res.status(404).json({ message: "Trainingsplan nicht gefunden" });
    res.json(schedule);
  });

  app.post("/api/training-schedules", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const parsed = insertTrainingScheduleSchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.json(await storage.createTrainingSchedule(parsed.data));
  });

  app.patch("/api/training-schedules/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const updated = await storage.updateTrainingSchedule(parseInt(qs(req.params.id)!), req.body);
    if (!updated) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(updated);
  });

  app.delete("/api/training-schedules/:id", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deleteTrainingSchedule(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // Generate events from schedules
  app.post("/api/training-schedules/generate", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate und endDate erforderlich" });
    }
    const requestedTeamId: number | undefined = req.body.teamId ? Number(req.body.teamId) : undefined;

    // Trainer dürfen nur die Teams generieren, die ihr Trainer-Code abdeckt.
    if (authed.user!.role === "trainer") {
      const code = await storage.getTrainerCodeByUser(authed.user!.id);
      // Fallback auf altes Einzel-Team, falls (noch) kein Trainer-Code vorhanden ist
      const allowed = code
        ? await resolveTrainerTeamIds(code)
        : (authed.user!.teamId ? [authed.user!.teamId] : []);
      if (allowed.length === 0) {
        return res.status(400).json({ message: "Keine Teams zugeordnet" });
      }
      // Bestimmtes Team gewünscht → muss erlaubt sein
      if (requestedTeamId) {
        if (!allowed.includes(requestedTeamId)) {
          return res.status(403).json({ message: "Dieses Team ist deinem Code nicht zugeordnet" });
        }
        const count = await storage.generateEventsFromSchedules(startDate, endDate, requestedTeamId);
        return res.json({ success: true, generatedCount: count });
      }
      // Kein Team gewählt → für alle erlaubten Teams generieren
      let total = 0;
      for (const tId of allowed) {
        total += await storage.generateEventsFromSchedules(startDate, endDate, tId);
      }
      return res.json({ success: true, generatedCount: total });
    }

    // Admin/Präsident/Sekretär: optional ein Team, sonst alle
    const count = await storage.generateEventsFromSchedules(startDate, endDate, requestedTeamId);
    res.json({ success: true, generatedCount: count });
  });

  // ─── Player Statistics (Spielerstatistiken) ────────────────
  app.get("/api/player-statistics", requireAuth(), async (req, res) => {
    const playerId = req.query.playerId ? parseInt(req.query.playerId as string) : undefined;
    const season = req.query.season as string | undefined;
    
    if (!playerId) {
      return res.status(400).json({ message: "playerId erforderlich" });
    }
    
    const stats = await storage.getPlayerStatistics(playerId, season);
    res.json(stats);
  });

  app.get("/api/top-scorers", requireAuth(), async (req, res) => {
    const competition = req.query.competition as string | undefined;
    const season = req.query.season as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const topScorers = await storage.getTopScorers(competition, season, limit);
    res.json(topScorers);
  });

  // ─── FLH Import (handball4all.de Import) ──────────────────
  app.post("/api/matches/import-flh", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { url, teamId, season, htmlContent } = req.body;
    if (!url || !teamId || !season) {
      return res.status(400).json({ message: "url, teamId und season erforderlich" });
    }
    
    // Import from FLH
    const { importMatchFromFLH } = await import("./flhImport.js");
    const result = await importMatchFromFLH(url, parseInt(teamId), season, htmlContent);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  });

  app.post("/api/matches/batch-import-flh", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { urls, teamId, season } = req.body;
    if (!urls || !Array.isArray(urls) || !teamId || !season) {
      return res.status(400).json({ message: "urls (Array), teamId und season erforderlich" });
    }
    
    const { batchImportFLH } = await import("./flhImport.js");
    const results = await batchImportFLH(urls, parseInt(teamId), season);
    
    res.json(results);
  });

  // ─── SBO-Archiv (eege Kopie vun de Handball4All-Berichter) ─
  app.post("/api/matches/:id/archive-sbo", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { archiveMatchSbo } = await import("./sboArchive.js");
    const result = await archiveMatchSbo(parseInt(String(req.params.id)), { force: !!req.body?.force });
    res.status(result.success ? 200 : 400).json(result);
  });

  app.post("/api/matches/archive-sbo-all", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { teamId, season, competition, force } = req.body || {};
    const filter: { teamId?: number; season?: string; competition?: string } = {};
    if (teamId) filter.teamId = parseInt(teamId);
    if (season) filter.season = season;
    if (competition) filter.competition = competition;
    const { batchArchiveSbo } = await import("./sboArchive.js");
    const results = await batchArchiveSbo(filter, { force: !!force });
    res.json(results);
  });

  // ─── Magic Links (Passwordless Login) ─────────────────────
  app.post("/api/auth/magic-link", async (req, res) => {
    const { email, phone, countryCode = "+352", action = "login", method = "email" } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ message: "Email oder Telefonnummer erforderlich" });
    }
    
    // Find user by email or phone
    let user;
    if (email) {
      user = await storage.getUserByEmail(email);
    } else {
      // Find by phone - would need a phone field in users table
      // For now, we'll need to implement this lookup
      user = await storage.getUserByPhone?.(phone);
    }
    
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });
    
    // Create magic link token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
    
    await storage.createMagicLink({
      token,
      email: email || null,
      phone: phone || null,
      countryCode,
      userId: user.id,
      action,
      method,
      used: false,
      expiresAt,
    });
    
    const magicUrl = `${req.headers.origin || "http://localhost:3000"}/magic-login?token=${token}`;
    
    if (method === "sms" && phone) {
      // SMS Gateway integration (placeholder)
      // In production: integrate with Twilio, Nexmo, or local SMS provider
      console.log(`SMS Magic Link an ${countryCode}${phone}: ${magicUrl}`);
      console.log("[SMS Gateway] Bitte SMS Provider konfigurieren (Twilio/Nexmo/etc.)");
      
      res.json({ 
        success: true, 
        message: `Magic Link per SMS an ${countryCode} ${phone} gesendet`,
        method: "sms"
      });
    } else {
      // Email
      console.log(`Magic Link per Email an ${email}: ${magicUrl}`);
      
      res.json({ 
        success: true, 
        message: "Magic Link per Email gesendet",
        method: "email"
      });
    }
  });

  app.get("/api/auth/verify-magic-link", async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token erforderlich" });
    
    const magicLink = await storage.getMagicLinkByToken(token as string);
    if (!magicLink) return res.status(404).json({ message: "Ungültiger Token" });
    if (magicLink.used) return res.status(400).json({ message: "Bereits verwendet" });
    if (new Date(magicLink.expiresAt) < new Date()) return res.status(400).json({ message: "Abgelaufen" });
    
    // Mark as used
    await storage.markMagicLinkUsed(magicLink.id);
    
    // Get user and create session
    const user = await storage.getUser(magicLink.userId!);
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });
    
    const sessionToken = createSession(user.id);
    setSessionCookie(res, sessionToken);
    
    res.json({ 
      success: true, 
      user: { ...publicUser(user), _token: sessionToken },
      action: magicLink.action
    });
  });

  // ─── QR-Code Mitgliedsausweis ──────────────────────────────
  app.post("/api/member-cards", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { userId, validUntil } = req.body;
    if (!userId) return res.status(400).json({ message: "userId erforderlich" });
    
    const user = await storage.getUser(parseInt(userId));
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });
    
    // Reuse a provided Card-ID (e.g. generated at JoinUs registration) instead of
    // generating a new one. Only generate when none is supplied.
    let cardId: string;
    const provided = extractCardId(String(req.body.cardNumber ?? req.body.cardId ?? ""));
    if (provided) {
      if (!/^[A-Z0-9]{8}$/.test(provided)) {
        return res.status(400).json({ message: "Ungültige Card-ID (8 Zeichen A–Z/0–9 erwartet)" });
      }
      const clash = await storage.getMemberCardByCardNumber(provided);
      if (clash) {
        return res.status(409).json({ message: "Card-ID bereits vergeben", cardNumber: formatCardNumber(provided) });
      }
      cardId = provided;
    } else {
      cardId = await generateUniqueCardId();
    }
    const cardNumber = cardId; // canonical 8-char id (displayed as M75-XXXX-XXXX)

    // QR payload in the SAME text format as the website (join.html / kees-scanner.html)
    const qrData = [
      "MEMBERSKAART MERSCH75",
      "Card-ID: " + cardId,
      "Numm: " + (user.name || "-"),
      "Roll/Relatioun: " + (user.role || "-"),
      "Lizenz: -",
    ].join("\n");

    const card = await storage.createMemberCard({
      userId: user.id,
      cardNumber,
      qrCodeData: qrData,
      validFrom: new Date().toISOString(),
      validUntil: validUntil || null,
      active: true,
      issuedBy: authed.user!.id
    });
    
    res.json(card);
  });

  app.get("/api/member-cards", requireAuth(), async (_req: any, res: any) => {
    const cards = await storage.listMemberCards();
    const users = await storage.listUsers();
    const userById = new Map<number, any>(users.map((u: any) => [u.id, u]));
    const enriched = cards.map((card: any) => {
      const u = userById.get(card.userId);
      return {
        ...card,
        cardNumberDisplay: formatCardNumber(card.cardNumber),
        userName: u?.name || null,
        userRole: u?.role || null,
        userEmail: u?.email || null,
      };
    });
    res.json(enriched);
  });

  // Verify a scanned card (accepts raw QR payload, "M75-XXXX-XXXX" or 8-char Card-ID)
  app.post("/api/member-cards/verify", requireAuth(), async (req, res) => {
    const source = req.body?.raw || req.body?.cardNumber || "";
    const cardId = extractCardId(String(source));

    if (!cardId) {
      return res.json({ status: "invalid", reason: "Keine Karten-Nummer erkannt", card: null, user: null });
    }

    const card = await storage.getMemberCardByCardNumber(cardId);
    if (!card) {
      return res.json({ status: "unknown", reason: "Karte nicht in der Datenbank", card: null, user: null, cardNumber: formatCardNumber(cardId) });
    }

    const user = await storage.getUser(card.userId);
    const now = new Date();
    let status = "valid";
    let reason = "Gültiger Mitgliedsausweis";

    if (!card.active) {
      status = "blocked";
      reason = "Karte ist deaktiviert";
    } else if (card.validUntil && new Date(card.validUntil) < now) {
      status = "expired";
      reason = "Karte ist abgelaufen";
    }

    res.json({ status, reason, card: { ...card, cardNumberDisplay: formatCardNumber(card.cardNumber) }, user: user || null });
  });

  app.get("/api/member-cards/:userId", requireAuth(), async (req, res) => {
    const card = await storage.getMemberCardByUserId(parseInt(qs(req.params.userId)!));
    if (!card) return res.status(404).json({ message: "Keine Karte gefunden" });
    res.json(card);
  });

  app.post("/api/member-cards/:id/deactivate", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deactivateMemberCard(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Benachrichtigungen ─────────────────────────────
  app.get("/api/notifications", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const notifications = await storage.listNotifications(authed.user!.id);
    const unreadCount = await storage.getUnreadNotificationsCount(authed.user!.id);
    res.json({ notifications, unreadCount });
  });

  app.post("/api/notifications/:id/read", requireAuth(), async (req, res) => {
    await storage.markNotificationRead(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  // ─── Audit Log (für Admins) ─────────────────────────
  app.get("/api/audit-logs", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { userId, entityType, limit } = req.query;
    const logs = await storage.listActivityLogs({
      userId: userId ? parseInt(userId as string) : undefined,
      entityType: entityType as string | undefined,
      limit: limit ? parseInt(limit as string) : 100
    });
    res.json(logs);
  });

  // ─── Spielaufstellungen ─────────────────────────────
  app.get("/api/matches/:matchId/lineup", requireAuth(), async (req, res) => {
    const lineup = await storage.getMatchLineup(parseInt(qs(req.params.matchId)!));
    res.json(lineup);
  });

  app.post("/api/matches/:matchId/lineup", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { userId, position, jerseyNumber, isStarting } = req.body;
    const lineup = await storage.createMatchLineup({
      matchId: parseInt(qs(req.params.matchId)!),
      userId,
      position,
      jerseyNumber: jerseyNumber || null,
      isStarting: isStarting ?? true,
      notes: null,
      confirmed: false
    });
    res.json(lineup);
  });

  // ─── Trainings-Anwesenheit ──────────────────────────
  app.get("/api/training-schedules/:scheduleId/attendance", requireAuth(), async (req, res) => {
    const attendance = await storage.getAttendanceBySchedule(parseInt(qs(req.params.scheduleId)!));
    res.json(attendance);
  });

  app.post("/api/training-schedules/:scheduleId/attendance", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { userId, status, notes } = req.body;
    const attendance = await storage.createAttendance({
      scheduleId: parseInt(qs(req.params.scheduleId)!),
      userId,
      status,
      checkedInAt: new Date().toISOString(),
      checkedInBy: authed.user!.id,
      notes: notes || null
    });
    res.json(attendance);
  });

  // ─── Familien-Verknüpfungen ────────────────────────
  app.get("/api/users/:parentId/children", requireAuth(), async (req, res) => {
    const children = await storage.getChildrenOfParent(parseInt(qs(req.params.parentId)!));
    res.json(children);
  });

  app.post("/api/family-links", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const { parentId, childId, relationship } = req.body;
    const link = await storage.createFamilyLink({
      parentId,
      childId,
      relationship: relationship || "parent",
      canManageProfile: true,
      canManagePayments: true
    });
    res.json(link);
  });

  // ─── Dokumente mit Ablaufdatum ─────────────────────
  app.get("/api/documents/expiring", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "secretaire"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const expiring = await storage.getExpiringDocuments(days);
    res.json(expiring);
  });

  // ─── SEPA Mandate ─────────────────────────────────
  app.post("/api/sepa-mandates", requireAuth(["präsident", "admin", "kassenwart"]), async (req: any, res: any) => {
    const { memberId, iban, bic, accountHolder, signedAt } = req.body;
    const year = new Date().getFullYear();
    const count = (await storage.listSepaMandates()).length;
    const mandateReference = `M75-${year}-${String(count + 1).padStart(4, '0')}`;
    const mandate = await storage.createSepaMandate({
      memberId,
      mandateReference,
      iban,
      bic: bic || null,
      accountHolder,
      signedAt: signedAt || new Date().toISOString(),
      status: "active",
    });
    res.json(mandate);
  });

  app.get("/api/sepa-mandates", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const mandates = await storage.listSepaMandates();
    res.json(mandates);
  });

  // ─── Geburtstage API ─────────────────────────────
  app.get("/api/users/birthdays", requireAuth(), async (req, res) => {
    const allUsers = await storage.listUsers();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // Benutzer mit Geburtsdatum (wir müssen das users Schema erweitern für birthday)
    // Für jetzt geben wir alle Benutzer zurück
    res.json(allUsers.map(u => ({ 
      id: u.id, 
      name: u.name, 
      email: u.email,
      role: u.role 
    })));
  });

  // ═══════════════════════════════════════════════════════════
  // 10 NEUE FEATURES API ROUTES
  // ═══════════════════════════════════════════════════════════

  // ─── 1. CARPOOL (Fahrgemeinschaften) ──────────────────────
  app.get("/api/events/:eventId/carpools", requireAuth(), async (req, res) => {
    const carpools = await storage.getCarpoolByEvent(parseInt(qs(req.params.eventId)!));
    res.json(carpools);
  });

  app.post("/api/carpools", requireAuth(), async (req, res) => {
    const { eventId, departureTime, departureLocation, availableSeats, notes } = req.body;
    const authed = req as AuthedRequest;
    const carpool = await storage.createCarpool({
      eventId,
      driverId: authed.user!.id,
      departureTime,
      departureLocation,
      availableSeats: availableSeats || 4,
      status: "open",
      notes: notes || null
    });
    res.json(carpool);
  });

  app.post("/api/carpools/:carpoolId/join", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const passenger = await storage.joinCarpool({
      carpoolId: parseInt(qs(req.params.carpoolId)!),
      passengerId: authed.user!.id,
      status: "confirmed"
    });
    res.json(passenger);
  });

  app.post("/api/carpools/:carpoolId/leave", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    await storage.leaveCarpool(parseInt(qs(req.params.carpoolId)!), authed.user!.id);
    res.json({ success: true });
  });

  // ─── 2. REFEREES (Schiedsrichter) ─────────────────────────
  app.get("/api/referees", requireAuth(), async (req, res) => {
    const { active } = req.query;
    const referees = await storage.listReferees(active !== undefined ? active === "true" : undefined);
    res.json(referees);
  });

  app.post("/api/referees", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const referee = await storage.createReferee(req.body);
    res.json(referee);
  });

  app.post("/api/matches/:matchId/assign-referee", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { refereeId, role } = req.body;
    const assignment = await storage.assignReferee({
      refereeId,
      matchId: parseInt(qs(req.params.matchId)!),
      role: role || "referee",
      status: "assigned"
    });
    res.json(assignment);
  });

  // ─── 3. INVENTORY (Material-Inventar) ───────────────────
  app.get("/api/inventory", requireAuth(), async (req, res) => {
    const { category } = req.query;
    const items = await storage.listInventoryItems(category as string | undefined);
    res.json(items);
  });

  app.post("/api/inventory", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "kassenwart"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const item = await storage.createInventoryItem(req.body);
    res.json(item);
  });

  app.post("/api/inventory/:itemId/loan", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const loan = await storage.loanItem({
      itemId: parseInt(qs(req.params.itemId)!),
      userId: authed.user!.id,
      quantity: req.body.quantity || 1,
      checkedOutBy: authed.user!.id
    });
    res.json(loan);
  });

  app.post("/api/inventory-loans/:loanId/return", requireAuth(), async (req, res) => {
    const { condition } = req.body;
    await storage.returnItem(parseInt(qs(req.params.loanId)!), condition);
    res.json({ success: true });
  });

  // ─── 4. INJURIES (Verletzungen & Reha) ───────────────────
  app.get("/api/injuries", requireAuth(), async (req, res) => {
    const { userId, status } = req.query;
    const injuries = await storage.listInjuries(
      userId ? parseInt(userId as string) : undefined,
      status as string | undefined
    );
    res.json(injuries);
  });

  app.post("/api/injuries", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const injury = await storage.createInjury(req.body);
    res.json(injury);
  });

  app.post("/api/injuries/:injuryId/rehab", requireAuth(), async (req, res) => {
    const session = await storage.addRehabSession({
      injuryId: parseInt(qs(req.params.injuryId)!),
      ...req.body
    });
    res.json(session);
  });

  // ─── 5. POLLS (Umfragen & Abstimmungen) ──────────────────
  app.get("/api/polls", requireAuth(), async (req, res) => {
    const { teamId, status } = req.query;
    const polls = await storage.listPolls(
      teamId ? parseInt(teamId as string) : undefined,
      status as string | undefined
    );
    res.json(polls);
  });

  app.post("/api/polls", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const { title, description, type, anonymous, teamId, options } = req.body;
    const poll = await storage.createPoll({
      title,
      description,
      type: type || "single",
      anonymous: anonymous ?? false,
      teamId: teamId || null,
      createdBy: authed.user!.id,
      startsAt: new Date().toISOString(),
      endsAt: null,
      status: "active"
    }, options || []);
    res.json(poll);
  });

  app.post("/api/polls/:pollId/vote", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const { optionId } = req.body;
    const vote = await storage.vote({
      pollId: parseInt(qs(req.params.pollId)!),
      optionId,
      userId: authed.user!.id
    });
    res.json(vote);
  });

  app.get("/api/polls/:pollId/results", requireAuth(), async (req, res) => {
    const results = await storage.getPollResults(parseInt(qs(req.params.pollId)!));
    res.json(results);
  });

  // ─── 6. OPPONENTS (Gegner-Analyse) ────────────────────────
  app.get("/api/opponents", requireAuth(), async (req, res) => {
    const opponents = await storage.listOpponents();
    res.json(opponents);
  });

  app.post("/api/opponents", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const opponent = await storage.createOpponent(req.body);
    res.json(opponent);
  });

  app.get("/api/opponents/:opponentId/history", requireAuth(), async (req, res) => {
    const history = await storage.getOpponentHistory(parseInt(qs(req.params.opponentId)!));
    const stats = await storage.getOpponentStats(parseInt(qs(req.params.opponentId)!));
    res.json({ history, stats });
  });

  // ─── 7. MATCH REPORTS (Spielberichte) ─────────────────────
  app.get("/api/match-reports", requireAuth(), async (req, res) => {
    const { status } = req.query;
    const reports = await storage.listMatchReports(status as string | undefined);
    res.json(reports);
  });

  app.post("/api/matches/:matchId/report", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const year = new Date().getFullYear();
    const count = (await storage.listMatchReports()).length;
    const reportNumber = `SB-${year}-${String(count + 1).padStart(4, '0')}`;
    
    const report = await storage.createMatchReport({
      matchId: parseInt(qs(req.params.matchId)!),
      reportNumber,
      generatedBy: authed.user!.id,
      pdfUrl: null,
      status: "draft",
      submittedTo: null,
      submittedAt: null,
      notes: req.body.notes || null
    });
    res.json(report);
  });

  // ─── 8. DUTY ROSTER (Dienstplan) ──────────────────────────
  app.get("/api/duty-roster", requireAuth(), async (req, res) => {
    const { eventId, userId } = req.query;
    const roster = await storage.getDutyRoster(
      eventId ? parseInt(eventId as string) : undefined,
      userId ? parseInt(userId as string) : undefined
    );
    res.json(roster);
  });

  app.post("/api/duty-roster", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const duty = await storage.createDutyRoster(req.body);
    res.json(duty);
  });

  app.post("/api/duty-roster/:rosterId/swap-request", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const { requestedTo, message } = req.body;
    const swap = await storage.requestSwap({
      rosterId: parseInt(qs(req.params.rosterId)!),
      requestedBy: authed.user!.id,
      requestedTo,
      message: message || null
    });
    res.json(swap);
  });

  // ─── 9. FAN ZONE (Öffentlicher Bereich) ─────────────────
  app.get("/api/public/content", async (req, res) => {
    // Keine Authentifizierung nötig - öffentlicher Endpunkt
    const content = await storage.getPublicContent();
    res.json(content);
  });

  app.get("/api/fan/content", requireAuth(), async (req, res) => {
    const { type, published } = req.query;
    const content = await storage.listFanContent(
      type as string | undefined,
      published !== undefined ? published === "true" : undefined
    );
    res.json(content);
  });

  app.post("/api/fan/content", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const content = await storage.createFanContent({
      ...req.body,
      createdBy: authed.user!.id
    });
    res.json(content);
  });

  app.post("/api/fan/content/:id/publish", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.publishContent(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });

  app.get("/api/matches/:matchId/liveticker", async (req, res) => {
    // Keine Authentifizierung nötig - öffentlicher Endpunkt
    const ticker = await storage.getLiveTicker(parseInt(qs(req.params.matchId)!));
    res.json(ticker);
  });

  app.post("/api/matches/:matchId/liveticker", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const entry = await storage.addLiveTickerEntry({
      matchId: parseInt(qs(req.params.matchId)!),
      ...req.body,
      createdBy: authed.user!.id
    });
    res.json(entry);
  });

  // ─── 10. EXTERNAL CALENDARS (Sync) ──────────────────────
  app.get("/api/calendars", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const calendars = await storage.getExternalCalendars(authed.user!.id);
    res.json(calendars);
  });

  app.post("/api/calendars", requireAuth(), async (req, res) => {
    const authed = req as AuthedRequest;
    const calendar = await storage.createExternalCalendar({
      ...req.body,
      userId: authed.user!.id
    });
    res.json(calendar);
  });

  // ─── ARCHIVE API (Saison-Archiv) ────────────────────────
  
  // === NEW FEATURE API ROUTES ===

  // Sponsors
  app.get("/api/sponsors", requireAuth(), async (req, res) => {
    const items = await storage.listSponsors();
    res.json(items);
  });
  app.post("/api/sponsors", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.createSponsor(req.body);
    res.status(201).json(item);
  });
  app.put("/api/sponsors/:id", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.updateSponsor(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/sponsors/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    await storage.deleteSponsor(Number(req.params.id));
    res.status(204).end();
  });

  // Gallery
  app.get("/api/gallery", requireAuth(), async (req, res) => {
    const album = req.query.album as string | undefined;
    const items = await storage.listGalleryPhotos(album);
    res.json(items);
  });
  app.post("/api/gallery", requireAuth(), async (req, res) => {
    const item = await storage.createGalleryPhoto({...req.body, uploadedBy: (req as any).user.id});
    res.status(201).json(item);
  });
  app.delete("/api/gallery/:id", requireAuth(), async (req, res) => {
    await storage.deleteGalleryPhoto(Number(req.params.id));
    res.status(204).end();
  });

  // Duties
  app.get("/api/duties", requireAuth(), async (req, res) => {
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;
    const items = await storage.listDuties(teamId);
    res.json(items);
  });
  app.post("/api/duties", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req, res) => {
    const item = await storage.createDuty(req.body);
    res.status(201).json(item);
  });
  app.put("/api/duties/:id", requireAuth(["präsident", "admin", "trainer", "secretaire"]), async (req, res) => {
    const item = await storage.updateDuty(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/duties/:id", requireAuth(["präsident", "admin", "trainer"]), async (req, res) => {
    await storage.deleteDuty(Number(req.params.id));
    res.status(204).end();
  });

  // Facilities
  app.get("/api/facilities", requireAuth(), async (req, res) => {
    const items = await storage.listFacilities();
    res.json(items);
  });
  app.post("/api/facilities", requireAuth(["präsident", "admin"]), async (req, res) => {
    const item = await storage.createFacility(req.body);
    res.status(201).json(item);
  });
  app.put("/api/facilities/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    const item = await storage.updateFacility(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/facilities/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    await storage.deleteFacility(Number(req.params.id));
    res.status(204).end();
  });

  // Facility Bookings
  app.get("/api/facility-bookings", requireAuth(), async (req, res) => {
    const facilityId = req.query.facilityId ? Number(req.query.facilityId) : undefined;
    const date = req.query.date as string | undefined;
    const items = await storage.listFacilityBookings(facilityId, date);
    res.json(items);
  });
  app.post("/api/facility-bookings", requireAuth(), async (req, res) => {
    const item = await storage.createFacilityBooking({...req.body, bookedBy: (req as any).user.id});
    res.status(201).json(item);
  });
  app.delete("/api/facility-bookings/:id", requireAuth(), async (req, res) => {
    await storage.deleteFacilityBooking(Number(req.params.id));
    res.status(204).end();
  });

  // Shop Products
  app.get("/api/shop", requireAuth(), async (req, res) => {
    const category = req.query.category as string | undefined;
    const items = await storage.listShopProducts(category);
    res.json(items);
  });
  app.post("/api/shop", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.createShopProduct(req.body);
    res.status(201).json(item);
  });
  app.put("/api/shop/:id", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.updateShopProduct(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/shop/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    await storage.deleteShopProduct(Number(req.params.id));
    res.status(204).end();
  });

  // Shop Orders
  app.get("/api/shop-orders", requireAuth(), async (req, res) => {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const items = await storage.listShopOrders(userId);
    res.json(items);
  });
  app.post("/api/shop-orders", requireAuth(), async (req, res) => {
    const item = await storage.createShopOrder({...req.body, userId: (req as any).user.id});
    res.status(201).json(item);
  });
  app.put("/api/shop-orders/:id", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.updateShopOrder(Number(req.params.id), req.body);
    res.json(item);
  });

  // Budget
  app.get("/api/budget", requireAuth(["präsident", "admin", "kassenwart"]), async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const items = await storage.listBudgetItems(year);
    res.json(items);
  });
  app.post("/api/budget", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const item = await storage.createBudgetItem(req.body);
    res.status(201).json(item);
  });
  app.put("/api/budget/:id", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const item = await storage.updateBudgetItem(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/budget/:id", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    await storage.deleteBudgetItem(Number(req.params.id));
    res.status(204).end();
  });

  // Newsletter
  app.get("/api/newsletter", requireAuth(), async (req, res) => {
    const items = await storage.listNewsletters();
    res.json(items);
  });
  app.post("/api/newsletter", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.createNewsletter(req.body);
    res.status(201).json(item);
  });
  app.put("/api/newsletter/:id", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.updateNewsletter(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/newsletter/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    await storage.deleteNewsletter(Number(req.params.id));
    res.status(204).end();
  });
  app.post("/api/newsletter/:id/send", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const newsletter = await storage.getNewsletter(Number(req.params.id));
    if (!newsletter) return res.status(404).json({ error: "Not found" });
    const users = await storage.listUsers();
    const recipients = users.filter(u => u.email).map(u => u.email!);
    try {
      await sendEmail({
        toEmail: recipients.join(","),
        subject: newsletter.subject,
        body: newsletter.content,
        createdAt: new Date().toISOString(),
      });
      await storage.updateNewsletter(newsletter.id, {
        status: "sent",
        sentAt: new Date().toISOString(),
        recipientCount: recipients.length,
      });
      res.json({ success: true, recipients: recipients.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Website Pages (public + admin)
  app.get("/api/website", requireAuth(), async (req, res) => {
    const items = await storage.listWebsitePages();
    res.json(items);
  });
  app.get("/api/website/:slug", async (req: any, res: any) => {
    const page = await storage.getWebsitePageBySlug(req.params.slug);
    if (!page || !page.published) return res.status(404).json({ error: "Not found" });
    res.json(page);
  });
  app.post("/api/website", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.createWebsitePage(req.body);
    res.status(201).json(item);
  });
  app.put("/api/website/:id", requireAuth(["präsident", "admin", "secretaire"]), async (req, res) => {
    const item = await storage.updateWebsitePage(Number(req.params.id), req.body);
    res.json(item);
  });
  app.delete("/api/website/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    await storage.deleteWebsitePage(Number(req.params.id));
    res.status(204).end();
  });

  // PDF Export
  app.get("/api/export/members/pdf", requireAuth(["präsident", "admin", "secretaire", "kassenwart"]), async (req: any, res: any) => {
    const members = (await storage.listMembers()).filter(isActiveClubMember);
    const html = generateMembersPdfHtml(members);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });
  app.get("/api/export/finance/pdf", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const transactions = await storage.listTransactions();
    const html = generateFinancePdfHtml(transactions);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });

  // Push Notifications - VAPID public key
  app.get("/api/push/vapid-public-key", requireAuth(), (req: any, res: any) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
  });
  app.post("/api/push/subscribe", requireAuth(), async (req, res) => {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ error: "Missing subscription" });
    res.json({ success: true });
  });

  // Birthday check
  app.get("/api/birthdays/today", requireAuth(), async (req, res) => {
    const members = await storage.listMembers();
    const today = new Date();
    const todayStr = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const birthdays = members.filter(m => m.birthdate && m.birthdate.endsWith(todayStr));
    res.json(birthdays);
  });

  
  // Event RSVP
  app.get("/api/events/:id/rsvps", requireAuth(), async (req: any, res: any) => {
    const rsvps = await storage.listEventRsvps(Number(req.params.id));
    res.json(rsvps);
  });
  app.post("/api/events/:id/rsvp", requireAuth(), async (req: any, res: any) => {
    const eventId = Number(req.params.id);
    const userId = (req as any).user.id;
    let rsvp = await storage.getEventRsvp(eventId, userId);
    if (rsvp) {
      rsvp = await storage.updateEventRsvp(rsvp.id, { status: req.body.status, guests: req.body.guests, note: req.body.note });
    } else {
      rsvp = await storage.createEventRsvp({ eventId, userId, status: req.body.status || "attending", guests: req.body.guests || 0, note: req.body.note });
    }
    res.json(rsvp);
  });

  
  // QR Check-in
  app.get("/api/qr/checkin/:eventId", requireAuth(), async (req: any, res: any) => {
    const checkins = await storage.listQrCheckins(Number(req.params.eventId));
    res.json(checkins);
  });
  app.post("/api/qr/checkin", requireAuth(), async (req: any, res: any) => {
    const eventId = Number(req.body.eventId);
    if (!eventId) return res.status(400).json({ message: "eventId erforderlich" });

    let memberId: number | null = req.body.memberId ? Number(req.body.memberId) : null;
    let cardholderUserId: number | null = null;
    let resolvedName: string | null = null;

    // Resolve a scanned card → cardholder user → member
    const cardSource = req.body.raw || req.body.cardNumber;
    if (cardSource) {
      const cardId = extractCardId(String(cardSource));
      const card = cardId ? await storage.getMemberCardByCardNumber(cardId) : undefined;
      if (!card) {
        return res.status(404).json({ message: "Karte nicht gefunden", status: "unknown" });
      }
      if (!card.active) {
        return res.status(409).json({ message: "Karte ist deaktiviert", status: "blocked" });
      }
      if (card.validUntil && new Date(card.validUntil) < new Date()) {
        return res.status(409).json({ message: "Karte ist abgelaufen", status: "expired" });
      }
      cardholderUserId = card.userId;
      const cardUser = await storage.getUser(card.userId);
      resolvedName = cardUser?.name || null;
      const allMembers = await storage.listMembers();
      const matchedMember = allMembers.find((m: any) => m.userId === card.userId);
      if (matchedMember) {
        memberId = matchedMember.id;
        // Vorname + kompletter Nachname in Großschrift (PT/ES-Doppelnamen, verheiratete Frauen)
        const mm: any = matchedMember;
        if (mm.lastName) {
          const first = mm.firstName ? String(mm.firstName).toLowerCase().replace(/(^|[\s\-'’])([a-zà-ÿ])/g, (_m: string, sep: string, ch: string) => sep + ch.toUpperCase()) + " " : "";
          resolvedName = first + String(mm.lastName).toUpperCase();
        }
      }
    }

    // Prevent duplicate check-ins for the same event (match on member or cardholder user)
    const existing = await storage.listQrCheckins(eventId);
    const duplicate = existing.find((c: any) =>
      (memberId != null && c.memberId === memberId) ||
      (cardholderUserId != null && c.userId === cardholderUserId)
    );
    if (duplicate) {
      return res.status(200).json({ ...duplicate, status: "duplicate", name: resolvedName, message: "Bereits eingecheckt" });
    }

    const checkin = await storage.createQrCheckin({
      eventId,
      memberId: memberId ?? undefined,
      userId: cardholderUserId ?? (req as any).user.id,
      method: req.body.method || "qr",
    });
    res.status(201).json({ ...checkin, status: "valid", name: resolvedName });
  });

  // Lineups
  app.get("/api/lineups/:matchId", requireAuth(), async (req: any, res: any) => {
    const lineups = await storage.listLineups(Number(req.params.matchId));
    res.json(lineups);
  });
  app.post("/api/lineups", requireAuth(["präsident", "admin", "trainer"]), async (req: any, res: any) => {
    const lineup = await storage.createLineup({...req.body, createdBy: (req as any).user.id});
    res.status(201).json(lineup);
  });
  app.put("/api/lineups/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: any, res: any) => {
    const lineup = await storage.updateLineup(Number(req.params.id), req.body);
    res.json(lineup);
  });
  app.delete("/api/lineups/:id", requireAuth(["präsident", "admin", "trainer"]), async (req: any, res: any) => {
    await storage.deleteLineup(Number(req.params.id));
    res.status(204).end();
  });

  // FLH Sync
  app.get("/api/flh/sync-logs", requireAuth(["präsident", "admin"]), async (req: any, res: any) => {
    const logs = await storage.listFlhSyncLogs();
    res.json(logs);
  });
  app.post("/api/flh/sync", requireAuth(["präsident", "admin"]), async (req: any, res: any) => {
    const log = await storage.createFlhSyncLog({
      syncType: req.body.syncType || "members",
      status: "pending",
      startedAt: new Date().toISOString(),
    });
    try {
      const members = await storage.listMembers();
      const withLicense = members.filter(m => m.licenseNumber);
      await storage.updateFlhSyncLog(log.id, {
        status: "completed",
        recordsProcessed: withLicense.length,
        completedAt: new Date().toISOString(),
      });
      res.json({ success: true, membersWithLicense: withLicense.length });
    } catch (err: any) {
      await storage.updateFlhSyncLog(log.id, {
        status: "failed",
        errorMessage: err.message,
        completedAt: new Date().toISOString(),
      });
      res.status(500).json({ error: err.message });
    }
  });

  // SEPA Mandates
  app.get("/api/sepa/mandates", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const mandates = await storage.listSepaMandates();
    res.json(mandates);
  });
  app.post("/api/sepa/mandates", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const mandate = await storage.createSepaMandate(req.body);
    res.status(201).json(mandate);
  });
  app.put("/api/sepa/mandates/:id", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const mandate = await storage.updateSepaMandate(Number(req.params.id), req.body);
    res.json(mandate);
  });

  // SEPA Transactions
  app.get("/api/sepa/transactions", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const mandateId = req.query.mandateId ? Number(req.query.mandateId) : undefined;
    const transactions = await storage.listSepaTransactions(mandateId);
    res.json(transactions);
  });
  app.post("/api/sepa/transactions", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const transaction = await storage.createSepaTransaction(req.body);
    res.status(201).json(transaction);
  });
  app.post("/api/sepa/generate-xml", requireAuth(["präsident", "kassenwart", "admin"]), async (req: any, res: any) => {
    const { transactions } = req.body;
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?><Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02"><CstmrDrctDbtInitn><GrpHdr><MsgId>MSG' + Date.now() + '</MsgId><CreDtTm>' + new Date().toISOString() + '</CreDtTm><NbOfTxs>' + transactions.length + '</NbOfTxs><InitgPty><Nm>Mersch75 Handball</Nm></InitgPty></GrpHdr>';
    let xmlBody = '';
    let total = 0;
    for (const tx of transactions) {
      xmlBody += '<DrctDbtTxInf><PmtId><EndToEndId>E2E' + Date.now() + '</EndToEndId></PmtId><InstdAmt Ccy="EUR">' + tx.amount.toFixed(2) + '</InstdAmt><DrctDbtTx><MndtRltdInf><MndtId>' + (tx.mandateRef || 'REF') + '</MndtId></MndtRltdInf></DrctDbtTx><DbtrAgt><FinInstnId><BIC>' + (tx.bic || '') + '</BIC></FinInstnId></DbtrAgt><Dbtr><Nm>' + (tx.name || '') + '</Nm></Dbtr><DbtrAcct><Id><IBAN>' + (tx.iban || '') + '</IBAN></Id></DbtrAcct><RmtInf><Ustrd>' + (tx.description || '') + '</Ustrd></RmtInf></DrctDbtTxInf>';
      total += tx.amount;
    }
    const xml = xmlHeader + '<PmtInf><PmtInfId>PMT' + Date.now() + '</PmtInfId><PmtMtd>DD</PmtMtd><NbOfTxs>' + transactions.length + '</NbOfTxs><CtrlSum>' + total.toFixed(2) + '</CtrlSum>' + xmlBody + '</PmtInf></CstmrDrctDbtInitn></Document>';
    res.json({ xml, total, count: transactions.length });
  });

  // ─── API-Token Verwaltung (Admin/Präsident) ─────────────
  app.get("/api/admin/tokens", requireAuth(["präsident", "admin"]), async (_req, res) => {
    try {
      const tokens = sqlite.prepare("SELECT id, name, scopes, created_at, last_used_at, expires_at, active FROM api_tokens ORDER BY created_at DESC").all();
      res.json(tokens);
    } catch (e) {
      res.status(500).json({ message: "Fehler beim Laden der Tokens" });
    }
  });

  app.post("/api/admin/tokens", requireAuth(["präsident", "admin"]), async (req, res) => {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ message: "Name erforderlich" });
    const scopes = Array.isArray(req.body?.scopes) ? req.body.scopes : [];
    const expiresAt = req.body?.expiresAt || null;
    const token = randomBytes(32).toString("hex");
    try {
      const info = sqlite.prepare(
        "INSERT INTO api_tokens (token, name, scopes, expires_at, active) VALUES (?, ?, ?, ?, 1)"
      ).run(token, name, JSON.stringify(scopes), expiresAt);
      res.status(201).json({ id: info.lastInsertRowid, token, name, scopes, expires_at: expiresAt, active: 1 });
    } catch (e) {
      res.status(500).json({ message: "Fehler beim Erstellen des Tokens" });
    }
  });

  app.patch("/api/admin/tokens/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    const id = Number(req.params.id);
    const updates: string[] = [];
    const values: any[] = [];
    if (req.body?.name !== undefined) { updates.push("name = ?"); values.push(String(req.body.name).trim()); }
    if (req.body?.active !== undefined) { updates.push("active = ?"); values.push(req.body.active ? 1 : 0); }
    if (req.body?.scopes !== undefined) { updates.push("scopes = ?"); values.push(JSON.stringify(req.body.scopes)); }
    if (req.body?.expiresAt !== undefined) { updates.push("expires_at = ?"); values.push(req.body.expiresAt || null); }
    if (!updates.length) return res.status(400).json({ message: "Keine Felder zum Aktualisieren" });
    values.push(id);
    try {
      sqlite.prepare(`UPDATE api_tokens SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      const updated = sqlite.prepare("SELECT id, name, scopes, created_at, last_used_at, expires_at, active FROM api_tokens WHERE id = ?").get(id);
      if (!updated) return res.status(404).json({ message: "Token nicht gefunden" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Fehler beim Aktualisieren" });
    }
  });

  app.delete("/api/admin/tokens/:id", requireAuth(["präsident", "admin"]), async (req, res) => {
    try {
      sqlite.prepare("DELETE FROM api_tokens WHERE id = ?").run(Number(req.params.id));
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Fehler beim Löschen" });
    }
  });

  // ─── Öffentliche API (mit API-Token, keine User-Session nötig) ───
  // Für externe Programme: Website, Newsletter-Tools, etc.

  // GET /api/public/events — Termine (read:events)
  app.get("/api/public/events", requireApiToken(["read:events"]), async (_req, res) => {
    const events = await storage.listEvents();
    res.json(events.map((e: any) => ({
      id: e.id, title: e.title, type: e.type, date: e.date,
      time: e.time || null, location: e.location || null, teamId: e.teamId || null,
    })));
  });

  // GET /api/public/teams — Teams (read:teams)
  app.get("/api/public/teams", requireApiToken(["read:teams"]), async (_req, res) => {
    const teams = await storage.listTeams();
    res.json(teams.map((t: any) => ({ id: t.id, name: t.name, category: t.category })));
  });

  // GET /api/public/announcements — Ankündigungen (read:announcements)
  app.get("/api/public/announcements", requireApiToken(["read:announcements"]), async (_req, res) => {
    const announcements = await storage.listAnnouncements();
    res.json(announcements.map((a: any) => ({
      id: a.id, title: a.title, content: a.content, createdAt: a.createdAt, pinned: a.pinned,
    })));
  });

  // GET /api/public/members — Mitglieder (read:members, ohne sensible Daten)
  app.get("/api/public/members", requireApiToken(["read:members"]), async (_req, res) => {
    const members = await storage.listMembers();
    res.json(members.map((m: any) => ({
      id: m.id, name: m.name, teamId: m.teamId || null, clubFunction: m.clubFunction || null,
    })));
  });

  // GET /api/public/matches — Spiele (read:events)
  app.get("/api/public/matches", requireApiToken(["read:events"]), async (_req, res) => {
    const matches = sqlite.prepare("SELECT id, team_id, opponent, match_date, match_time, status, competition, home_away FROM matches ORDER BY match_date DESC LIMIT 100").all();
    res.json(matches);
  });

  // Modulare Routen registrieren
  registerWaitlistRoutes(app);
  registerGdprRoutes(app);
  registerArchiveRoutes(app);
  registerInventoryRoutes(app);
  registerPollRoutes(app);
  registerFacilityRoutes(app);
  registerOpponentRoutes(app);
  registerCarpoolRoutes(app);
  registerBulkRoutes(app);
  registerMassEmailRoutes(app);
  registerBankImportRoutes(app);
  registerInvoiceRoutes(app);
  registerDonationRoutes(app);
  registerIcalRoutes(app);
  registerExerciseRoutes(app);
  registerMatchEventRoutes(app);
  registerTrialRegistrationRoutes(app);

  return _httpServer;
}

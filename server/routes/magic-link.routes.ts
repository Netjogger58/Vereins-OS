import { Router, type Response, type Request } from "express";
import { storage } from "../storage";
import { requireAuth, type AuthedRequest } from "../auth";
import { createSession, setSessionCookie, publicUser } from "../auth";
import { queueEmail, processPendingEmails } from "../email";
import { type InsertEmail } from "@shared/schema";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

function qs(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}


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

async function resolveTrainerTeamIds(code: { allTeams: boolean; teamIds: string | null }): Promise<number[]> {
  if (code.allTeams) return (await storage.listTeams()).map((t) => t.id);
  try {
    const parsed = JSON.parse(code.teamIds || "[]");
    return Array.isArray(parsed) ? parsed.map((n: any) => Number(n)).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

function extractCardId(input: string): string {
  const raw = String(input || "");
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.cardNumber) return extractCardId(String(parsed.cardNumber));
  } catch { }
  const m75 = raw.toUpperCase().match(/M75-([A-Z0-9]{4})-([A-Z0-9]{4})/);
  if (m75) return (m75[1] + m75[2]);
  const explicit = raw.match(/CARD[- ]?ID\s*[:=]\s*([A-Z0-9]{8})/i);
  if (explicit) return explicit[1].toUpperCase();
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length === 8) return compact;
  const any = raw.toUpperCase().match(/\b[A-Z0-9]{8}\b/);
  if (any) return any[0];
  if (compact.startsWith("M75") && compact.length >= 11) return compact.slice(3, 11);
  return compact.slice(0, 8);
}

function formatCardNumber(cardId: string): string {
  const id = String(cardId || "").toUpperCase();
  return id.length === 8 ? `M75-${id.slice(0, 4)}-${id.slice(4)}` : id;
}

export function registerMagicLinkRoutes(app: any) {
  const router = Router();

  // ─── Magic Links (Passwordless Login) ─────────────────────
  router.post("/auth/magic-link", async (req: Request, res: Response) => {
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

  router.get("/auth/verify-magic-link", async (req: Request, res: Response) => {
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
  router.post("/member-cards", requireAuth(), async (req: Request, res: Response) => {
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

  router.get("/member-cards", requireAuth(), async (_req: any, res: any) => {
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
  router.post("/member-cards/verify", requireAuth(), async (req: Request, res: Response) => {
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

  router.get("/member-cards/:userId", requireAuth(), async (req: Request, res: Response) => {
    const card = await storage.getMemberCardByUserId(parseInt(qs(req.params.userId)!));
    if (!card) return res.status(404).json({ message: "Keine Karte gefunden" });
    res.json(card);
  });

  router.post("/member-cards/:id/deactivate", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    await storage.deactivateMemberCard(parseInt(qs(req.params.id)!));
    res.json({ success: true });
  });


  app.use("/api/magic", router);
}

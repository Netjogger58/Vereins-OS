import { Router, type Response } from "express";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import {
  requireAuth,
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
} from "../auth";
import { maybeStartTwoFactor, verifyTwoFactorCode, trustDevice } from "../twofactor";
import { sendSMS, generateOTPCode, storeOTP, verifyOTP, clearOTP, normalizePhone } from "../sms";
import { isActiveClubMember } from "@shared/memberStatus";
import { type InsertEmail } from "@shared/schema";
import { queueEmail, processPendingEmails } from "../email";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user[0]}${"*".repeat(Math.max(user.length - 1, 2))}@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return "***";
  const start = phone.slice(0, 6);
  const end = phone.slice(-3);
  return `${start}${"*".repeat(Math.max(phone.length - 9, 3))}${end}`;
}

const FUNCTION_ROLE: Record<string, string> = {
  Admin: "admin",
  Comité: "präsident",
  Officiel: "secretaire",
  Entraîneur: "trainer",
  Arbitre: "spieler",
  Spieler: "spieler",
  Mitglied: "spieler",
};
const roleForFunction = (f?: string | null) => (f && FUNCTION_ROLE[f]) || "spieler";

export function registerAuthRoutes(app: any) {
  const router = Router();

  router.post("/login", async (req: AuthedRequest, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "E-Mail und Passwort erforderlich" });
    const key = loginKey(req, email);
    const lock = checkLockout(key);
    if (lock.locked) return res.status(429).json({ message: "Zu viele Fehlversuche. Bitte später erneut versuchen.", retryAfter: lock.retryAfter });
    const user = await storage.getUserByEmail(email.toLowerCase());
    if (!user || !user.active) { recordLoginFailure(key); return res.status(401).json({ message: "Ungültige Zugangsdaten" }); }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) { recordLoginFailure(key); return res.status(401).json({ message: "Ungültige Zugangsdaten" }); }
    clearLoginFailures(key);
    const twoFa = await maybeStartTwoFactor(req, user);
    if (twoFa) return res.json(twoFa);
    const token = createSession(user.id);
    setSessionCookie(res, token);
    // Return token in body so the frontend can use Bearer auth (works in iframe/cross-origin)
    res.json({ ...publicUser(user), _token: token });
  });

  router.post("/logout", (req: AuthedRequest, res: Response) => {
    if (req.sessionToken) destroySession(req.sessionToken);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  router.get("/me", (req: AuthedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    res.json(publicUser(req.user));
  });

  // ─── Random-No (Karten-)Login ──────────────────────────
  // Mapping Vereinsfunktion -> App-Rolle (Test-Version).
  // HINWEIS: In Produktion sollten erhöhte Rollen (Comité/Officiel/Trainer)
  // eine 2. Stufe (Passwort/Code) erfordern – siehe Admin-Login.
  const FUNCTION_ROLE: Record<string, string> = {
    Admin: "admin",
    Comité: "präsident",
    Officiel: "secretaire",
    Entraîneur: "trainer",
    Arbitre: "spieler",
    Spieler: "spieler",
    Mitglied: "spieler",
  };
  const roleForFunction = (f?: string | null) => (f && FUNCTION_ROLE[f]) || "spieler";

  // Nur Identität anzeigen (Name + Funktion), ohne Login
  router.post("/identify-card", async (req: AuthedRequest, res: Response) => {
    const cardId = String((req.body || {}).cardId || "").trim();
    if (!cardId) return res.status(400).json({ message: "Random-No erforderlich" });
    const member = await storage.getMemberByCardId(cardId);
    if (!member) return res.json({ found: false });
    res.json({
      found: true,
      name: member.name,
      clubFunction: member.clubFunction || "Mitglied",
      teamCategory: member.teamCategory || null,
      role: roleForFunction(member.clubFunction),
    });
  });

  // Login per Random-No: verknüpften User finden/anlegen + Session
  router.post("/card-login", async (req: AuthedRequest, res: Response) => {
    const cardId = String((req.body || {}).cardId || "").trim();
    if (!cardId) return res.status(400).json({ message: "Random-No erforderlich" });
    const key = loginKey(req, `card:${cardId}`);
    const lock = checkLockout(key);
    if (lock.locked) return res.status(429).json({ message: "Zu viele Fehlversuche. Bitte später erneut versuchen.", retryAfter: lock.retryAfter });
    const member = await storage.getMemberByCardId(cardId);
    if (!member) { recordLoginFailure(key); return res.status(401).json({ message: "Unbekannte Random-No" }); }
    clearLoginFailures(key);

    const role = roleForFunction(member.clubFunction);
    const email = `card.${(member.cardId || "").toLowerCase()}@m75.local`;

    let user = member.userId ? await storage.getUser(member.userId) : undefined;
    if (!user) user = await storage.getUserByEmail(email);
    if (!user) {
      const hash = await bcrypt.hash(randomBytes(16).toString("hex"), 10);
      user = await storage.createUser({
        email,
        passwordHash: hash,
        name: member.name,
        role: role as any,
        active: true,
      });
      await storage.updateMember(member.id, { userId: user.id });
    } else if (user.role !== role || user.name !== member.name) {
      user = (await storage.updateUser(user.id, { role: role as any, name: member.name })) || user;
      if (!member.userId) await storage.updateMember(member.id, { userId: user.id });
    }

    const twoFa = await maybeStartTwoFactor(req, user, member.email, { memberName: member.name, clubFunction: member.clubFunction });
    if (twoFa) return res.json(twoFa);
    const token = createSession(user.id);
    setSessionCookie(res, token);
    res.json({ ...publicUser(user), _token: token, memberName: member.name, clubFunction: member.clubFunction });
  });

  // Admin-Login (Punkt im Logo) per Passwort
  router.post("/admin-login", async (req: AuthedRequest, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "E-Mail und Passwort erforderlich" });
    const key = loginKey(req, `admin:${email}`);
    const lock = checkLockout(key);
    if (lock.locked) return res.status(429).json({ message: "Zu viele Fehlversuche. Bitte später erneut versuchen.", retryAfter: lock.retryAfter });
    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash || !['admin','präsident'].includes(user.role)) {
      recordLoginFailure(key);
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      recordLoginFailure(key);
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }
    clearLoginFailures(key);
    const twoFa = await maybeStartTwoFactor(req, user);
    if (twoFa) return res.json(twoFa);
    const token = createSession(user.id);
    setSessionCookie(res, token);
    res.json({ ...publicUser(user), _token: token });
  });

  // ─── Member PIN Login (Registratioun + Login) ──────────────
  // Step 1: Member identifizéieren via Numm + Virnumm + Geburtsdatum
  router.post("/identify-member", async (req: AuthedRequest, res: Response) => {
    const { firstName, lastName, birthdate } = req.body || {};
    if (!firstName || !lastName || !birthdate) {
      return res.status(400).json({ message: "Vorname, Nachname und Geburtsdatum erforderlich" });
    }
    const matches = await storage.getMemberByNameAndBirthdate(firstName, lastName, birthdate);
    if (!matches.length) return res.json({ found: false });
    // Filter: nëmmen aktiv Memberen
    const active = matches.filter(m => isActiveClubMember(m));
    if (!active.length) return res.json({ found: false, reason: "inactive" });
    // Éischte Match zréckginn (keng Roll-Info leak)
    const m = active[0];
    res.json({
      found: true,
      memberId: m.id,
      name: m.name,
      hasPhone: !!m.phone && m.phone !== "unbekannt",
      hasEmail: !!m.email,
      phoneOwner: m.phoneOwner || null,
      hasPin: false, // gëtt méi spéit bei der Registratioun gesat
    });
  });

  // Step 2: OTP Code un d'Handynummer vum Member schécken
  router.post("/register-otp", async (req: AuthedRequest, res: Response) => {
    const { memberId, countryCode = "+352" } = req.body || {};
    if (!memberId) return res.status(400).json({ message: "Member ID erforderlich" });
    const member = await storage.getMember(Number(memberId));
    if (!member) return res.status(404).json({ message: "Mitglied nicht gefunden" });
    if (!isActiveClubMember(member)) return res.status(403).json({ message: "Mitglied nicht aktiv" });

    // Telefonnummer aus Member-Daten
    const rawPhone = member.phone;
    if (!rawPhone || rawPhone === "unbekannt") {
      // Fallback op Email wann keng Handynummer
      if (member.email) {
        const code = generateOTPCode();
        storeOTP(`email:${member.id}`, code, member.id);
        // Email OTP schécken (via bestoenden Email System)
        try {
          await queueEmail({
            toEmail: member.email,
            toName: member.name,
            subject: "M75 Manager — Registrierungs-Code",
            body: `<p>Dein Registrierungs-Code lautet: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>Der Code ist 10 Minuten gültig.</p>`,
            template: "custom",
            status: "pending",
            createdAt: new Date().toISOString(),
          } as InsertEmail);
          await processPendingEmails();
        } catch (e) {
          console.error("[register-otp] Email failed:", e);
        }
        console.log(`[register-otp] Email OTP for member ${member.id}: ${code}`);
        return res.json({ success: true, method: "email", masked: maskEmail(member.email) });
      }
      return res.status(400).json({ message: "Keine Telefonnummer oder E-Mail hinterlegt" });
    }

    // Normaliséieren an OTP schécken
    const normalized = normalizePhone(rawPhone);
    const fullPhone = normalized.startsWith("+") ? normalized : `${countryCode}${normalized}`;
    const code = generateOTPCode();
    storeOTP(fullPhone, code, member.id);

    const result = await sendSMS(fullPhone, `M75 Manager: Dein Registrierungs-Code lautet ${code}`);
    if (!result.success) {
      // Fallback: Code an Console loggen (Dev Mode)
      console.log(`[register-otp] SMS failed, code for member ${member.id}: ${code}`);
      return res.json({ success: true, method: "sms", masked: maskPhone(fullPhone), fallback: true });
    }
    res.json({ success: true, method: "sms", masked: maskPhone(fullPhone) });
  });

  // Step 3: OTP verifizéieren + PIN setzen → User Account erstellen
  router.post("/register-complete", async (req: AuthedRequest, res: Response) => {
    const { memberId, otpCode, pin, countryCode = "+352", method = "sms" } = req.body || {};
    if (!memberId || !otpCode || !pin) {
      return res.status(400).json({ message: "Member ID, Code und PIN erforderlich" });
    }
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({ message: "PIN muss genau 6 Ziffern haben" });
    }
    const member = await storage.getMember(Number(memberId));
    if (!member) return res.status(404).json({ message: "Mitglied nicht gefunden" });
    if (!isActiveClubMember(member)) return res.status(403).json({ message: "Mitglied nicht aktiv" });

    // OTP verifizéieren
    let otpKey: string;
    if (method === "email") {
      otpKey = `email:${member.id}`;
    } else {
      const normalized = normalizePhone(member.phone || "");
      otpKey = normalized.startsWith("+") ? normalized : `${countryCode}${normalized}`;
    }
    const otpResult = verifyOTP(otpKey, String(otpCode));
    if (!otpResult.valid) {
      return res.status(401).json({ message: otpResult.error || "Ungültiger Code" });
    }

    // User Account erstellen oder verbinden (wéi bei card-login)
    const role = roleForFunction(member.clubFunction);
    const email = `pin.${member.id}@m75.local`;

    let user = member.userId ? await storage.getUser(member.userId) : undefined;
    if (!user) user = await storage.getUserByEmail(email);
    if (!user) {
      const hash = await bcrypt.hash(randomBytes(16).toString("hex"), 10);
      user = await storage.createUser({
        email,
        passwordHash: hash,
        name: member.name,
        role: role as any,
        active: true,
      });
      await storage.updateMember(member.id, { userId: user.id });
    } else if (user.role !== role || user.name !== member.name) {
      user = (await storage.updateUser(user.id, { role: role as any, name: member.name })) || user;
      if (!member.userId) await storage.updateMember(member.id, { userId: user.id });
    }

    // PIN hashen a späicheren
    const pinHash = await bcrypt.hash(String(pin), 10);
    user = (await storage.updateUser(user.id, { pinHash })) || user;

    // Session erstellen
    clearOTP(otpKey);
    const token = createSession(user.id);
    setSessionCookie(res, token);
    res.json({ ...publicUser(user), _token: token, memberName: member.name, clubFunction: member.clubFunction });
  });

  // PIN Login (zukünfteg Logins)
  router.post("/pin-login", async (req: AuthedRequest, res: Response) => {
    const { firstName, lastName, birthdate, pin } = req.body || {};
    if (!firstName || !lastName || !birthdate || !pin) {
      return res.status(400).json({ message: "Alle Felder erforderlich" });
    }
    const key = loginKey(req, `pin:${firstName}:${lastName}:${birthdate}`);
    const lock = checkLockout(key);
    if (lock.locked) return res.status(429).json({ message: "Zu viele Fehlversuche. Bitte später erneut versuchen.", retryAfter: lock.retryAfter });

    const matches = await storage.getMemberByNameAndBirthdate(firstName, lastName, birthdate);
    const active = matches.filter(m => isActiveClubMember(m));
    if (!active.length) {
      recordLoginFailure(key);
      return res.status(401).json({ message: "Mitglied nicht gefunden" });
    }
    const member = active[0];
    const user = member.userId ? await storage.getUser(member.userId) : undefined;
    if (!user || !user.pinHash) {
      recordLoginFailure(key);
      return res.status(401).json({ message: "Kein PIN gesetzt. Bitte zuerst registrieren." });
    }

    const pinOk = await bcrypt.compare(String(pin), user.pinHash);
    if (!pinOk) {
      recordLoginFailure(key);
      return res.status(401).json({ message: "Falscher PIN" });
    }

    clearLoginFailures(key);
    const twoFa = await maybeStartTwoFactor(req, user, member.email, { memberName: member.name, clubFunction: member.clubFunction });
    if (twoFa) return res.json(twoFa);
    const token = createSession(user.id);
    setSessionCookie(res, token);
    res.json({ ...publicUser(user), _token: token, memberName: member.name, clubFunction: member.clubFunction });
  });

  // PIN Reset — OTP schécken fir nei PIN ze setzen
  router.post("/pin-reset-request", async (req: AuthedRequest, res: Response) => {
    const { firstName, lastName, birthdate, countryCode = "+352" } = req.body || {};
    if (!firstName || !lastName || !birthdate) {
      return res.status(400).json({ message: "Vorname, Nachname und Geburtsdatum erforderlich" });
    }
    const matches = await storage.getMemberByNameAndBirthdate(firstName, lastName, birthdate);
    const active = matches.filter(m => isActiveClubMember(m));
    if (!active.length) return res.status(404).json({ message: "Mitglied nicht gefunden" });
    const member = active[0];

    // Reuse register-otp logic
    const rawPhone = member.phone;
    if (!rawPhone || rawPhone === "unbekannt") {
      if (member.email) {
        const code = generateOTPCode();
        storeOTP(`email:${member.id}`, code, member.id);
        try {
          await queueEmail({
            toEmail: member.email,
            toName: member.name,
            subject: "M75 Manager — PIN Reset Code",
            body: `<p>Dein Code zum Zurücksetzen des PIN lautet: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>Der Code ist 10 Minuten gültig.</p>`,
            template: "custom",
            status: "pending",
            createdAt: new Date().toISOString(),
          } as InsertEmail);
          await processPendingEmails();
        } catch (e) {
          console.error("[pin-reset] Email failed:", e);
        }
        console.log(`[pin-reset] Email OTP for member ${member.id}: ${code}`);
        return res.json({ success: true, method: "email", masked: maskEmail(member.email), memberId: member.id });
      }
      return res.status(400).json({ message: "Keine Telefonnummer oder E-Mail hinterlegt" });
    }

    const normalized = normalizePhone(rawPhone);
    const fullPhone = normalized.startsWith("+") ? normalized : `${countryCode}${normalized}`;
    const code = generateOTPCode();
    storeOTP(fullPhone, code, member.id);
    const result = await sendSMS(fullPhone, `M75 Manager: Dein Code zum Zurücksetzen des PIN lautet ${code}`);
    if (!result.success) {
      console.log(`[pin-reset] SMS failed, code for member ${member.id}: ${code}`);
      return res.json({ success: true, method: "sms", masked: maskPhone(fullPhone), fallback: true, memberId: member.id });
    }
    res.json({ success: true, method: "sms", masked: maskPhone(fullPhone), memberId: member.id });
  });

  // PIN Reset — OTP verifizéieren + nei PIN setzen
  router.post("/pin-reset-complete", async (req: AuthedRequest, res: Response) => {
    const { memberId, otpCode, pin, countryCode = "+352", method = "sms" } = req.body || {};
    if (!memberId || !otpCode || !pin) {
      return res.status(400).json({ message: "Member ID, Code und neuer PIN erforderlich" });
    }
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({ message: "PIN muss genau 6 Ziffern haben" });
    }
    const member = await storage.getMember(Number(memberId));
    if (!member) return res.status(404).json({ message: "Mitglied nicht gefunden" });

    let otpKey: string;
    if (method === "email") {
      otpKey = `email:${member.id}`;
    } else {
      const normalized = normalizePhone(member.phone || "");
      otpKey = normalized.startsWith("+") ? normalized : `${countryCode}${normalized}`;
    }
    const otpResult = verifyOTP(otpKey, String(otpCode));
    if (!otpResult.valid) {
      return res.status(401).json({ message: otpResult.error || "Ungültiger Code" });
    }

    const user = member.userId ? await storage.getUser(member.userId) : undefined;
    if (!user) return res.status(404).json({ message: "Kein Benutzerkonto gefunden. Bitte zuerst registrieren." });

    const pinHash = await bcrypt.hash(String(pin), 10);
    await storage.updateUser(user.id, { pinHash });
    clearOTP(otpKey);

    // Automatesch aloggen
    const token = createSession(user.id);
    setSessionCookie(res, token);
    res.json({ ...publicUser(user), _token: token, memberName: member.name, clubFunction: member.clubFunction });
  });

  // 2FA-Code prüfen und Session erstellen
  router.post("/2fa/verify", async (req: AuthedRequest, res: Response) => {
    const { challenge, code, trustDevice: trust } = req.body || {};
    const result = verifyTwoFactorCode(String(challenge || ""), String(code || ""));
    if (!result.ok) return res.status(401).json({ message: result.error });
    const user = await storage.getUser(result.userId);
    if (!user || !user.active) return res.status(401).json({ message: "Unbekannter Benutzer" });
    const token = createSession(user.id);
    setSessionCookie(res, token);
    const payload: Record<string, unknown> = { ...publicUser(user), _token: token, ...(result.extra || {}) };
    if (trust) payload._deviceToken = trustDevice(user.id);
    res.json(payload);
  });

  router.patch("/password", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const { current, next } = req.body || {};
    if (!current || !next) return res.status(400).json({ message: "Felder fehlen" });
    const user = (req as any).user!;
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Aktuelles Passwort falsch" });
    const hash = await bcrypt.hash(next, 10);
    await storage.updateUser(user.id, { passwordHash: hash });
    res.json({ ok: true });
  });

  router.patch("/profile", requireAuth(), async (req: AuthedRequest, res: Response) => {
    const { name, photoUrl } = req.body || {};
    const user = await storage.updateUser((req as any).user.id, {
      ...(name !== undefined ? { name } : {}),
      ...(photoUrl !== undefined ? { photoUrl } : {}),
    });
    if (!user) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(publicUser(user));
  });
  app.use("/api/auth", router);
}

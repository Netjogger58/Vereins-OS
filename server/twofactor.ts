import { randomBytes, randomInt } from "node:crypto";
import type { Request } from "express";
import type { User } from "@shared/schema";
import { sqlite } from "./storage";
import { sendEmail } from "./email";

// Rollen, die einen 2. Faktor benötigen (Zugriff auf sensible Daten).
export const PRIVILEGED_ROLES = ["admin", "präsident", "secretaire", "kassenwart", "trainer"];

const CODE_TTL_MS = 1000 * 60 * 10; // Code 10 Minuten gültig
const MAX_CODE_ATTEMPTS = 5;
const TRUST_TTL_MS = 1000 * 60 * 60 * 24 * Number(process.env.TRUSTED_DEVICE_DAYS || 30);

type Challenge = {
  userId: number;
  code: string;
  expiresAt: number;
  attempts: number;
  extra?: Record<string, unknown>;
};
const challenges = new Map<string, Challenge>();

// ─── Trusted Devices (persistiert, überleben Neustart) ───
const stmtTrustInsert = sqlite.prepare(
  "INSERT INTO trusted_devices (token, user_id, created_at, last_used) VALUES (?, ?, ?, ?)"
);
const stmtTrustGet = sqlite.prepare(
  "SELECT user_id AS userId, created_at AS createdAt FROM trusted_devices WHERE token = ?"
);
const stmtTrustTouch = sqlite.prepare("UPDATE trusted_devices SET last_used = ? WHERE token = ?");
const stmtTrustDelete = sqlite.prepare("DELETE FROM trusted_devices WHERE token = ?");
const stmtTrustCleanup = sqlite.prepare("DELETE FROM trusted_devices WHERE created_at < ?");

export function isPrivileged(role: string): boolean {
  return PRIVILEGED_ROLES.includes(role);
}

export function isTrustedDevice(token: string | undefined, userId: number): boolean {
  if (!token) return false;
  const row = stmtTrustGet.get(token) as { userId: number; createdAt: number } | undefined;
  if (!row || row.userId !== userId) return false;
  if (Date.now() - row.createdAt > TRUST_TTL_MS) {
    stmtTrustDelete.run(token);
    return false;
  }
  stmtTrustTouch.run(Date.now(), token);
  return true;
}

export function trustDevice(userId: number): string {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  stmtTrustInsert.run(token, userId, now, now);
  return token;
}

setInterval(() => {
  try { stmtTrustCleanup.run(Date.now() - TRUST_TTL_MS); } catch { /* ignore */ }
}, 24 * 60 * 60 * 1000).unref?.();

// ─── Challenge-Flow ───
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}

function codeEmailBody(name: string, code: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#002F65">Dein Anmeldecode</h2>
      <p>Hallo ${name},</p>
      <p>dein Bestätigungscode für die Anmeldung im M75 Manager:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#002F65">${code}</p>
      <p style="color:#666;font-size:13px">Der Code ist 10 Minuten gültig. Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail.</p>
    </div>`;
}

/**
 * Startet eine 2FA-Challenge, wenn nötig.
 * Rückgabe null = kein 2FA nötig (nicht privilegiert, vertrauenswürdiges Gerät,
 * oder in Produktion kein Versandweg verfügbar -> normaler Login).
 */
export async function maybeStartTwoFactor(
  req: Request,
  user: User,
  fallbackEmail?: string | null,
  extra?: Record<string, unknown>
): Promise<{ twoFactorRequired: true; challenge: string; maskedEmail: string } | null> {
  // Opt-in Ausschalter: 2FA komplett deaktivieren (z.B. Einzelnutzer / lokaler Betrieb).
  // Standard bleibt AN – greift nur, wenn DISABLE_2FA explizit gesetzt ist.
  if (process.env.DISABLE_2FA === "1" || process.env.DISABLE_2FA === "true") return null;
  if (!isPrivileged(user.role)) return null;
  const deviceToken = String((req.body || {}).deviceToken || "");
  if (deviceToken && isTrustedDevice(deviceToken, user.id)) return null;

  // Ziel-Adresse: echte User-Email, sonst Fallback (z.B. Mitglieds-Email bei Karten-Login).
  let target: string | null = null;
  if (user.email && !user.email.endsWith("@m75.local")) target = user.email;
  else if (fallbackEmail && fallbackEmail.includes("@")) target = fallbackEmail;

  const code = String(randomInt(100000, 1000000));
  const token = randomBytes(24).toString("hex");

  let delivered = false;
  let masked = "";
  if (target) {
    const result = await sendEmail({
      toEmail: target,
      toName: user.name,
      subject: `M75 Manager – Anmeldecode: ${code.slice(0, 3)} ${code.slice(3)}`,
      body: codeEmailBody(user.name, code),
      template: "custom",
      status: "pending",
      createdAt: new Date().toISOString(),
      userId: user.id,
    } as any);
    delivered = result.success;
    masked = maskEmail(target);
  }

  // Dev-Fallback: SMTP nicht konfiguriert -> Code in die Server-Konsole.
  if (!delivered && process.env.NODE_ENV !== "production") {
    console.log(`🔐 [2FA] Anmeldecode für ${user.name} <${user.email}>: ${code}`);
    delivered = true;
    masked = target ? maskEmail(target) : "Server-Konsole (Dev-Modus)";
  }

  // Produktion ohne Versandweg: 2FA nicht erzwingbar -> normaler Login (mit Warnung).
  if (!delivered) {
    console.warn(`⚠️ [2FA] Kein Versandweg für ${user.email} – Login ohne 2. Faktor.`);
    return null;
  }

  challenges.set(token, { userId: user.id, code, expiresAt: Date.now() + CODE_TTL_MS, attempts: 0, extra });
  return { twoFactorRequired: true, challenge: token, maskedEmail: masked };
}

export function verifyTwoFactorCode(
  challengeToken: string,
  code: string
): { ok: true; userId: number; extra?: Record<string, unknown> } | { ok: false; error: string } {
  const c = challenges.get(challengeToken);
  if (!c) return { ok: false, error: "Anfrage abgelaufen. Bitte erneut anmelden." };
  if (Date.now() > c.expiresAt) {
    challenges.delete(challengeToken);
    return { ok: false, error: "Code abgelaufen. Bitte erneut anmelden." };
  }
  c.attempts++;
  if (c.attempts > MAX_CODE_ATTEMPTS) {
    challenges.delete(challengeToken);
    return { ok: false, error: "Zu viele Fehlversuche. Bitte erneut anmelden." };
  }
  if (c.code !== String(code).trim()) {
    return { ok: false, error: "Falscher Code." };
  }
  challenges.delete(challengeToken);
  return { ok: true, userId: c.userId, extra: c.extra };
}

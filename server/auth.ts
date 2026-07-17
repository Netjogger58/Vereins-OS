import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";
import type { User, Role } from "@shared/schema";
import { storage, sqlite } from "./storage";

type Session = { userId: number; createdAt: number };

// Absolute lifetime (max age regardless of activity) und Idle-Timeout (Inaktivität).
const ABSOLUTE_TTL = 1000 * 60 * 60 * 24 * Number(process.env.SESSION_MAX_DAYS || 30);
const IDLE_TTL = 1000 * 60 * 60 * Number(process.env.SESSION_IDLE_HOURS || 12);

// Prepared statements (persistente Sessions in SQLite -> überleben Server-Neustart).
// Lazy vorbereitet, da `sqlite` erst nach initDatabase() verfügbar ist (Modul-Import passiert vorher).
type Stmt = ReturnType<typeof sqlite.prepare>;
let _stmtInsert: Stmt, _stmtGet: Stmt, _stmtTouch: Stmt, _stmtDelete: Stmt, _stmtCleanup: Stmt;

function stmtInsert() { return (_stmtInsert ??= sqlite.prepare("INSERT INTO sessions (token, user_id, created_at, last_seen) VALUES (?, ?, ?, ?)")); }
function stmtGet() { return (_stmtGet ??= sqlite.prepare("SELECT user_id AS userId, created_at AS createdAt, last_seen AS lastSeen FROM sessions WHERE token = ?")); }
function stmtTouch() { return (_stmtTouch ??= sqlite.prepare("UPDATE sessions SET last_seen = ? WHERE token = ?")); }
function stmtDelete() { return (_stmtDelete ??= sqlite.prepare("DELETE FROM sessions WHERE token = ?")); }
function stmtCleanup() { return (_stmtCleanup ??= sqlite.prepare("DELETE FROM sessions WHERE created_at < ? OR last_seen < ?")); }

export function createSession(userId: number): string {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  stmtInsert().run(token, userId, now, now);
  return token;
}

export function destroySession(token: string) {
  stmtDelete().run(token);
}

export function getSession(token: string | undefined): Session | undefined {
  if (!token) return undefined;
  const row = stmtGet().get(token) as { userId: number; createdAt: number; lastSeen: number } | undefined;
  if (!row) return undefined;
  const now = Date.now();
  // Absolut abgelaufen ODER zu lange inaktiv -> Session ungültig.
  if (now - row.createdAt > ABSOLUTE_TTL || now - row.lastSeen > IDLE_TTL) {
    stmtDelete().run(token);
    return undefined;
  }
  // Idle-Timer nur höchstens 1x/Minute aktualisieren (spart Writes).
  if (now - row.lastSeen > 60 * 1000) stmtTouch().run(now, token);
  return { userId: row.userId, createdAt: row.createdAt };
}

// Abgelaufene Sessions periodisch entfernen.
function cleanupSessions() {
  const now = Date.now();
  try { stmtCleanup().run(now - ABSOLUTE_TTL, now - IDLE_TTL); } catch { /* ignore */ }
}
// Erster Cleanup verzögert, damit initDatabase() (setzt `sqlite`) sicher gelaufen ist.
setTimeout(cleanupSessions, 5000).unref?.();
setInterval(cleanupSessions, 60 * 60 * 1000).unref?.();

// ─── Login-Lockout (Brute-Force-Schutz für Passwort UND 8-stelligen Code) ───
type Attempt = { count: number; first: number; lockedUntil: number };
const loginAttempts = new Map<string, Attempt>();
const LOCK_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 8);
const LOCK_WINDOW_MS = 1000 * 60 * Number(process.env.LOGIN_WINDOW_MIN || 15);
const LOCK_DURATION_MS = 1000 * 60 * Number(process.env.LOGIN_LOCK_MIN || 15);

export function loginKey(req: Request, identifier: string): string {
  const fwd = req.headers["x-forwarded-for"];
  const ip = (typeof fwd === "string" ? fwd.split(",")[0].trim() : req.socket.remoteAddress) || "unknown";
  return `${ip}|${identifier.toLowerCase()}`;
}

export function checkLockout(key: string): { locked: boolean; retryAfter: number } {
  const a = loginAttempts.get(key);
  if (!a) return { locked: false, retryAfter: 0 };
  const now = Date.now();
  if (a.lockedUntil > now) return { locked: true, retryAfter: Math.ceil((a.lockedUntil - now) / 1000) };
  return { locked: false, retryAfter: 0 };
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  let a = loginAttempts.get(key);
  if (!a || now - a.first > LOCK_WINDOW_MS) a = { count: 0, first: now, lockedUntil: 0 };
  a.count++;
  if (a.count >= LOCK_MAX_ATTEMPTS) a.lockedUntil = now + LOCK_DURATION_MS;
  loginAttempts.set(key, a);
}

export function clearLoginFailures(key: string) {
  loginAttempts.delete(key);
}

export interface AuthedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

// Extract Bearer token from Authorization header OR cookie (fallback for local dev)
function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fallback: cookie (works in local dev)
  const cookieHeader = req.headers.cookie ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)m75_sid=([^;]+)/);
  return match?.[1];
}

export async function authMiddleware(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  const session = getSession(token);
  if (session) {
    const user = await storage.getUser(session.userId);
    if (user) {
      req.user = user;
      req.sessionToken = token;
    }
  }
  next();
}

export function requireAuth(roles?: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (roles && !roles.includes(req.user.role as Role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// ─── API-Token Middleware (für externe Programme ohne User-Login) ───
// Header: Authorization: Token <64-char hex token>
// Scopes: read:members, read:events, read:teams, read:announcements, read:statistics, write:announcements
export function requireApiToken(scopes?: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Token ")) {
      return res.status(401).json({ message: "API token required (Authorization: Token <token>)" });
    }
    const token = authHeader.slice(6).trim();
    if (!token) return res.status(401).json({ message: "Invalid token format" });
    let row: any;
    try {
      row = sqlite.prepare("SELECT id, token, name, scopes, expires_at, active FROM api_tokens WHERE token = ?").get(token);
    } catch {
      return res.status(500).json({ message: "Token lookup failed" });
    }
    if (!row || !row.active) return res.status(401).json({ message: "Invalid or disabled token" });
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (scopes) {
      let tokenScopes: string[] = [];
      try { tokenScopes = JSON.parse(row.scopes || "[]"); } catch { tokenScopes = []; }
      if (!scopes.some(s => tokenScopes.includes(s))) {
        return res.status(403).json({ message: "Insufficient scope", required: scopes, has: tokenScopes });
      }
    }
    try {
      sqlite.prepare("UPDATE api_tokens SET last_used_at = ? WHERE id = ?").run(new Date().toISOString(), row.id);
    } catch { /* ignore */ }
    next();
  };
}

// Keep cookie helpers for backward compatibility (local dev)
export function setSessionCookie(res: Response, token: string) {
  res.setHeader(
    "Set-Cookie",
    `m75_sid=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${ABSOLUTE_TTL / 1000}`
  );
}

export function clearSessionCookie(res: Response) {
  res.setHeader("Set-Cookie", `m75_sid=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`);
}

export function publicUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";
import type { User, Role } from "@shared/schema";
import { storage } from "./storage";

type Session = { userId: number; createdAt: number };
const sessions = new Map<string, Session>();
const SESSION_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

export function createSession(userId: number): string {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function getSession(token: string | undefined): Session | undefined {
  if (!token) return undefined;
  const s = sessions.get(token);
  if (!s) return undefined;
  if (Date.now() - s.createdAt > SESSION_TTL) {
    sessions.delete(token);
    return undefined;
  }
  return s;
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

// Keep cookie helpers for backward compatibility (local dev)
export function setSessionCookie(res: Response, token: string) {
  res.setHeader(
    "Set-Cookie",
    `m75_sid=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${SESSION_TTL / 1000}`
  );
}

export function clearSessionCookie(res: Response) {
  res.setHeader("Set-Cookie", `m75_sid=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`);
}

export function publicUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}

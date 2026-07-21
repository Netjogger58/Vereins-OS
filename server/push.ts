import * as webpush from "web-push";
import { type Request, type Response } from "express";
import { sqlite } from "./storage";
import { requireAuth, type AuthedRequest } from "./auth";
import fs from "node:fs";
import path from "node:path";

const VAPID_FILE = "./data/vapid.json";

function ensureVapidKeys() {
  let publicKey = process.env.VAPID_PUBLIC_KEY;
  let privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) return { publicKey, privateKey };
  try {
    if (fs.existsSync(VAPID_FILE)) {
      const data = JSON.parse(fs.readFileSync(VAPID_FILE, "utf-8"));
      if (data.publicKey && data.privateKey) return data;
    }
  } catch {}
  const keys = webpush.generateVAPIDKeys();
  fs.mkdirSync(path.dirname(VAPID_FILE), { recursive: true });
  fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2));
  return keys;
}

const vapid = ensureVapidKeys();
const subject = process.env.VAPID_SUBJECT || "mailto:info@mersch75.lu";
webpush.setVapidDetails(subject, vapid.publicKey, vapid.privateKey);

export function getVapidPublicKey() {
  return vapid.publicKey;
}

function ensurePushSubscriptionsTable() {
  sqlite.prepare(`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  try { sqlite.prepare("CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id)").run(); } catch {}
}
ensurePushSubscriptionsTable();

export function saveSubscription(userId: number, subscription: webpush.PushSubscription) {
  const now = new Date().toISOString();
  sqlite.prepare(`INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, user_id = excluded.user_id`).run(
    userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, now
  );
}

export function removeSubscription(userId: number, endpoint: string) {
  sqlite.prepare("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?").run(userId, endpoint);
}

function getRows(userIds?: number[]) {
  if (userIds && userIds.length > 0) {
    return sqlite.prepare(`SELECT * FROM push_subscriptions WHERE user_id IN (${userIds.join(",")})`).all() as any[];
  }
  return sqlite.prepare("SELECT * FROM push_subscriptions").all() as any[];
}

function toSub(row: any): webpush.PushSubscription {
  return { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
}

async function sendToRows(rows: any[], payload: any) {
  const data = JSON.stringify(payload);
  for (const row of rows) {
    try {
      await webpush.sendNotification(toSub(row), data);
    } catch (e: any) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        sqlite.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(row.endpoint);
      }
    }
  }
}

export async function sendPushToUsers(userIds: number[], payload: { title: string; body: string; url?: string }) {
  await sendToRows(getRows(userIds), payload);
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }) {
  await sendToRows(getRows(), payload);
}

export async function sendPushToTeam(teamId: number, payload: { title: string; body: string; url?: string }) {
  const memberIds = (sqlite.prepare("SELECT user_id FROM members WHERE team_id = ? AND user_id IS NOT NULL").all(teamId) as any[]).map(r => r.user_id);
  const childIds = new Set(memberIds);
  const parentRows = childIds.size > 0 ? (sqlite.prepare(`SELECT parent_id FROM family_links WHERE child_id IN (${[...childIds].join(",")})`).all() as any[]) : [];
  const parentIds = parentRows.map(r => r.parent_id);
  const userIds = Array.from(new Set([...childIds, ...parentIds]));
  if (userIds.length > 0) await sendPushToUsers(userIds, payload);
}

export function registerPushRoutes(app: any) {
  app.get("/api/push/vapid-public-key", (_req: Request, res: Response) => {
    res.json({ publicKey: getVapidPublicKey() });
  });

  app.post("/api/push/subscribe", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const { subscription } = req.body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ message: "Subscription unvollständig" });
    }
    saveSubscription(authed.user!.id, subscription);
    res.json({ ok: true });
  });

  app.post("/api/push/unsubscribe", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: "endpoint erforderlich" });
    removeSubscription(authed.user!.id, endpoint);
    res.json({ ok: true });
  });

  app.post("/api/push/send", requireAuth(), async (req: Request, res: Response) => {
    const authed = req as AuthedRequest;
    if (!["präsident", "admin", "trainer"].includes(authed.user!.role)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    const { title, body, url, userIds } = req.body;
    if (!title || !body) return res.status(400).json({ message: "title und body erforderlich" });
    if (Array.isArray(userIds) && userIds.length > 0) {
      await sendPushToUsers(userIds, { title, body, url });
    } else {
      await sendPushToAll({ title, body, url });
    }
    res.json({ ok: true });
  });
}

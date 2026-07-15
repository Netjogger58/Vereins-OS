import { db } from "../storage";
import { waitlistEntries, members, type InsertWaitlistEntry, type WaitlistEntry, type Member } from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export async function listWaitlistEntries(teamId?: number): Promise<WaitlistEntry[]> {
  if (teamId) {
    return db.select().from(waitlistEntries).where(eq(waitlistEntries.teamId, teamId)).orderBy(asc(waitlistEntries.createdAt)).all();
  }
  return db.select().from(waitlistEntries).orderBy(asc(waitlistEntries.createdAt)).all();
}

export async function createWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry> {
  return db.insert(waitlistEntries).values(data).returning().get();
}

export async function updateWaitlistEntry(id: number, data: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined> {
  return db.update(waitlistEntries).set(data).where(eq(waitlistEntries.id, id)).returning().get();
}

export async function deleteWaitlistEntry(id: number): Promise<void> {
  db.delete(waitlistEntries).where(eq(waitlistEntries.id, id)).run();
}

export async function convertWaitlistEntryToMember(id: number): Promise<Member | undefined> {
  const entry = await db.select().from(waitlistEntries).where(eq(waitlistEntries.id, id)).get();
  if (!entry) return undefined;
  const parts = (entry.memberName || "").trim().split(/\s+/);
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : entry.memberName || "";
  const member = await db.insert(members).values({
    name: entry.memberName || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    birthdate: entry.birthdate,
    email: entry.email,
    phone: entry.phone,
    teamId: entry.teamId,
    membershipStatus: "pending",
    memberType: "spieler",
  }).returning().get();
  await db.update(waitlistEntries).set({ status: "converted" }).where(eq(waitlistEntries.id, id)).run();
  return member;
}

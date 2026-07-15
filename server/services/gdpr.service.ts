import { db } from "../storage";
import {
  gdprConsents,
  gdprDeletionRequests,
  members,
  attendance,
  trainingAttendance,
  memberFees,
  type InsertGdprConsent,
  type InsertGdprDeletionRequest,
  type GdprConsent,
  type GdprDeletionRequest,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export async function listGdprConsents(userId?: number): Promise<GdprConsent[]> {
  if (userId) {
    return db.select().from(gdprConsents).where(eq(gdprConsents.userId, userId)).orderBy(desc(gdprConsents.consentedAt)).all();
  }
  return db.select().from(gdprConsents).orderBy(desc(gdprConsents.consentedAt)).all();
}

export async function createGdprConsent(data: InsertGdprConsent): Promise<GdprConsent> {
  return db.insert(gdprConsents).values(data).returning().get();
}

export async function listGdprDeletionRequests(status?: string): Promise<GdprDeletionRequest[]> {
  if (status) {
    return db.select().from(gdprDeletionRequests).where(eq(gdprDeletionRequests.status, status)).orderBy(desc(gdprDeletionRequests.requestedAt)).all();
  }
  return db.select().from(gdprDeletionRequests).orderBy(desc(gdprDeletionRequests.requestedAt)).all();
}

export async function createGdprDeletionRequest(data: InsertGdprDeletionRequest): Promise<GdprDeletionRequest> {
  return db.insert(gdprDeletionRequests).values(data).returning().get();
}

export async function updateGdprDeletionRequest(id: number, data: Partial<InsertGdprDeletionRequest>): Promise<GdprDeletionRequest | undefined> {
  const set: any = { ...data };
  if (data.status && data.status !== "pending") set.reviewedAt = new Date().toISOString();
  return db.update(gdprDeletionRequests).set(set).where(eq(gdprDeletionRequests.id, id)).returning().get();
}

export async function getMemberDataExport(userId: number): Promise<any> {
  const member = await db.select().from(members).where(eq(members.userId, userId)).get();
  const consents = await db.select().from(gdprConsents).where(eq(gdprConsents.userId, userId)).orderBy(desc(gdprConsents.consentedAt)).all();
  const attendanceRecords = member
    ? await db.select().from(attendance).where(eq(attendance.memberId, member.id)).orderBy(desc(attendance.date)).all()
    : [];
  const trainingRecords = await db.select().from(trainingAttendance).where(eq(trainingAttendance.userId, userId)).orderBy(desc(trainingAttendance.createdAt)).all();
  const fees = member
    ? await db.select().from(memberFees).where(eq(memberFees.memberId, member.id)).orderBy(desc(memberFees.createdAt)).all()
    : [];
  return { member, consents, attendanceRecords, trainingRecords, fees };
}

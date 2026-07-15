import { db } from "../storage";
import {
  inventoryItems,
  inventoryLoans,
  users,
  members,
  type InventoryItem,
  type InventoryLoan,
  type InsertInventoryItem,
  type InsertInventoryLoan,
} from "@shared/schema";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

export async function listInventoryItems(): Promise<InventoryItem[]> {
  return db.select().from(inventoryItems).orderBy(desc(inventoryItems.createdAt)).all();
}

export async function getInventoryItem(id: number): Promise<InventoryItem | undefined> {
  return db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).get();
}

export async function createInventoryItem(data: InsertInventoryItem): Promise<InventoryItem> {
  return db.insert(inventoryItems).values({
    ...data,
    availableQuantity: data.totalQuantity ?? 1,
    createdAt: new Date().toISOString(),
  }).returning().get();
}

export async function updateInventoryItem(id: number, data: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
  const existing = await getInventoryItem(id);
  if (!existing) return undefined;
  const updated = await db.update(inventoryItems).set(data).where(eq(inventoryItems.id, id)).returning().get();
  if (data.totalQuantity != null) {
    await recalcAvailableQuantity(id);
  }
  return updated;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  db.delete(inventoryLoans).where(eq(inventoryLoans.itemId, id)).run();
  db.delete(inventoryItems).where(eq(inventoryItems.id, id)).run();
}

export async function listInventoryLoans(itemId?: number, userId?: number): Promise<InventoryLoan[]> {
  if (itemId) {
    return db.select().from(inventoryLoans).where(eq(inventoryLoans.itemId, itemId)).orderBy(desc(inventoryLoans.loanedAt)).all();
  }
  if (userId) {
    return db.select().from(inventoryLoans).where(eq(inventoryLoans.userId, userId)).orderBy(desc(inventoryLoans.loanedAt)).all();
  }
  return db.select().from(inventoryLoans).orderBy(desc(inventoryLoans.loanedAt)).all();
}

export async function getInventoryLoan(id: number): Promise<InventoryLoan | undefined> {
  return db.select().from(inventoryLoans).where(eq(inventoryLoans.id, id)).get();
}

export async function createInventoryLoan(data: InsertInventoryLoan): Promise<InventoryLoan> {
  const item = await getInventoryItem(data.itemId);
  if (!item) throw new Error("Item not found");
  const activeLoans = await db.select({ total: sql<number>`coalesce(sum(quantity),0)` })
    .from(inventoryLoans)
    .where(and(eq(inventoryLoans.itemId, data.itemId), isNull(inventoryLoans.returnedAt)))
    .get();
  const totalOut = activeLoans?.total ?? 0;
  const available = (item.totalQuantity ?? 1) - totalOut;
  if (available < (data.quantity ?? 1)) {
    throw new Error("Nicht genügend Exemplare verfügbar");
  }
  const loan = await db.insert(inventoryLoans).values({
    ...data,
    loanedAt: new Date().toISOString(),
  }).returning().get();
  await recalcAvailableQuantity(data.itemId);
  return loan;
}

export async function returnInventoryLoan(id: number, checkedInBy?: number, condition?: string): Promise<InventoryLoan | undefined> {
  const loan = await getInventoryLoan(id);
  if (!loan) return undefined;
  const updated = await db.update(inventoryLoans).set({
    returnedAt: new Date().toISOString(),
    checkedInBy,
    condition,
  }).where(eq(inventoryLoans.id, id)).returning().get();
  await recalcAvailableQuantity(loan.itemId);
  return updated;
}

async function recalcAvailableQuantity(itemId: number): Promise<void> {
  const item = await getInventoryItem(itemId);
  if (!item) return;
  const active = await db.select({ total: sql<number>`coalesce(sum(quantity),0)` })
    .from(inventoryLoans)
    .where(and(eq(inventoryLoans.itemId, itemId), isNull(inventoryLoans.returnedAt)))
    .get();
  const available = (item.totalQuantity ?? 1) - (active?.total ?? 0);
  db.update(inventoryItems).set({ availableQuantity: Math.max(0, available) }).where(eq(inventoryItems.id, itemId)).run();
}

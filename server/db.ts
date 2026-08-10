import { and, count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertRegistration, InsertUser, registrations, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ---------- Pre-launch registrations ----------

export async function usernameExists(username: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db
    .select()
    .from(registrations)
    .where(eq(registrations.username, username.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}

export async function emailExists(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db
    .select()
    .from(registrations)
    .where(eq(registrations.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}

export async function createRegistration(reg: InsertRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(registrations).values(reg);
}

export async function registrationCount() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db
    .select({ value: count() })
    .from(registrations)
    .where(eq(registrations.status, "active"));
  return rows[0]?.value ?? 0;
}

export async function setEmailSent(registrationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(registrations).set({ emailSent: true }).where(eq(registrations.registrationId, registrationId));
}

export async function registrationById(registrationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db
    .select({ id: registrations.id, status: registrations.status })
    .from(registrations)
    .where(and(eq(registrations.registrationId, registrationId), eq(registrations.status, "active")))
    .limit(1);
  return rows[0];
}

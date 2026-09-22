import { MongoClient, type Collection, type Db } from "mongodb";
import type {
  AdminUserDoc,
  ApplicationDoc,
  CourseDoc,
  NotificationDoc,
} from "./types";

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB ?? "dw_private";

if (!uri) {
  throw new Error("DATABASE_URL is not set. Add your MongoDB connection string to .env.");
}

// Next.js hot-reloads modules in development, which would otherwise open a new
// connection pool on every edit until Mongo refuses them.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalForMongo._mongoClientPromise) {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    retryWrites: true,
  });
  globalForMongo._mongoClientPromise = client.connect();
}

export const clientPromise: Promise<MongoClient> = globalForMongo._mongoClientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function adminUsers(): Promise<Collection<AdminUserDoc>> {
  return (await getDb()).collection<AdminUserDoc>("adminUsers");
}

export async function courses(): Promise<Collection<CourseDoc>> {
  return (await getDb()).collection<CourseDoc>("courses");
}

export async function applications(): Promise<Collection<ApplicationDoc>> {
  return (await getDb()).collection<ApplicationDoc>("applications");
}

export async function notifications(): Promise<Collection<NotificationDoc>> {
  return (await getDb()).collection<NotificationDoc>("notifications");
}

/**
 * Creates every index the app relies on. Safe to run repeatedly — createIndex
 * is a no-op when an identical index already exists.
 */
export async function ensureIndexes(): Promise<string[]> {
  const created: string[] = [];

  const users = await adminUsers();
  created.push(await users.createIndex({ email: 1 }, { unique: true }));
  created.push(await users.createIndex({ role: 1 }));

  const courseCol = await courses();
  created.push(await courseCol.createIndex({ slug: 1 }, { unique: true }));
  created.push(await courseCol.createIndex({ isActive: 1, sortOrder: 1 }));

  const appCol = await applications();
  created.push(await appCol.createIndex({ referenceNo: 1 }, { unique: true }));
  // Sparse: an application has no order id until checkout starts, and a plain
  // unique index would treat every one of those as the same missing value.
  created.push(
    await appCol.createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true }),
  );
  created.push(await appCol.createIndex({ courseSlug: 1 }));
  created.push(await appCol.createIndex({ status: 1 }));
  created.push(await appCol.createIndex({ phone: 1 }));
  created.push(await appCol.createIndex({ createdAt: -1 }));

  const notificationCol = await notifications();
  created.push(await notificationCol.createIndex({ isActive: 1, createdAt: -1 }));

  return created;
}

/** Turns a user-supplied string into a safe case-insensitive regex fragment. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

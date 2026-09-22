import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { adminUsers } from "./mongodb";
import type { AdminRole } from "./types";

const COOKIE_NAME = "dw_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short (need 16+ characters).");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Checks credentials against the adminUsers collection. Returns null for a bad
 * email, a bad password or a deactivated account alike, so the caller cannot
 * tell which.
 */
export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  const col = await adminUsers();
  const user = await col.findOne({ email: email.trim().toLowerCase() });

  // Still hash on a missing user so the response time does not reveal whether
  // the email exists.
  if (!user) {
    await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return null;
  }

  if (!user.isActive) return null;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  await col.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function createAdminSession(session: AdminSession): Promise<void> {
  const token = await new SignJWT({
    email: session.email,
    name: session.name,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const role = payload.role;

    if (role !== "SUPER_ADMIN" && role !== "ADMIN") return null;
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : payload.email,
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Re-reads the role from the database rather than trusting the cookie, so
 * demoting or deactivating someone takes effect immediately instead of when
 * their 8-hour token expires.
 */
export async function getVerifiedAdminSession(): Promise<AdminSession | null> {
  const session = await getAdminSession();
  if (!session || !ObjectId.isValid(session.id)) return null;

  const col = await adminUsers();
  const user = await col.findOne({ _id: new ObjectId(session.id) });

  if (!user || !user.isActive) return null;

  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireSuperAdmin(): Promise<AdminSession | null> {
  const session = await getVerifiedAdminSession();
  if (!session || session.role !== "SUPER_ADMIN") return null;
  return session;
}

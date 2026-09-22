import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { adminUsers } from "@/lib/mongodb";
import { hashPassword, requireSuperAdmin } from "@/lib/auth";
import { adminUserSchema, fieldErrors } from "@/lib/validation";
import type { AdminUserDoc } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json(
      { message: "Only a super-admin can add admin users." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the fields.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { email, name, password, role, isActive } = parsed.data;

  if (!password) {
    return NextResponse.json(
      { message: "A password is required.", errors: { password: "Set a password" } },
      { status: 422 },
    );
  }

  const now = new Date();
  const doc: AdminUserDoc = {
    email: email.toLowerCase(),
    name,
    role,
    isActive,
    passwordHash: await hashPassword(password),
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const col = await adminUsers();
    const result = await col.insertOne(doc);

    return NextResponse.json(
      {
        user: {
          id: String(result.insertedId),
          email: doc.email,
          name: doc.name,
          role: doc.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        {
          message: "That email already has an account.",
          errors: { email: "Already in use" },
        },
        { status: 409 },
      );
    }
    console.error("[users] create failed", error);
    return NextResponse.json({ message: "Could not create the user." }, { status: 500 });
  }
}

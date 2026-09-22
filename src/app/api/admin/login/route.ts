import { NextResponse } from "next/server";
import { authenticateAdmin, createAdminSession, destroyAdminSession } from "@/lib/auth";
import { adminLoginSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check your details.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;

  const session = await authenticateAdmin(email, password);
  if (!session) {
    // Deliberately vague: never reveal which half of the pair was wrong, or
    // whether the account exists but is deactivated.
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  await createAdminSession(session);
  return NextResponse.json({ ok: true, role: session.role });
}

export async function DELETE() {
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}

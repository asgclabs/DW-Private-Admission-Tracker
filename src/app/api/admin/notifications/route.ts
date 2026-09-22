import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { notifications } from "@/lib/mongodb";
import { getVerifiedAdminSession } from "@/lib/auth";
import { fieldErrors, notificationSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authorised." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the fields.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const now = new Date();
  const col = await notifications();
  const result = await col.insertOne({ ...parsed.data, createdAt: now, updatedAt: now });

  return NextResponse.json(
    { notification: { id: String(result.insertedId), ...parsed.data } },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authorised." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Missing or invalid id." }, { status: 400 });
  }

  const col = await notifications();
  await col.deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ ok: true });
}

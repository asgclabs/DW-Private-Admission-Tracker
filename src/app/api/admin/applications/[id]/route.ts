import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { applications } from "@/lib/mongodb";
import { getVerifiedAdminSession } from "@/lib/auth";
import { adminUpdateSchema, fieldErrors } from "@/lib/validation";
import { statusLabel } from "@/lib/status";
import type { ApplicationEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authorised." }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Application not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid update.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const col = await applications();
  const _id = new ObjectId(id);
  const application = await col.findOne({ _id }, { projection: { status: 1 } });

  if (!application) {
    return NextResponse.json({ message: "Application not found." }, { status: 404 });
  }

  const { status, adminNotes, message } = parsed.data;
  const statusChanged = Boolean(status && status !== application.status);
  const now = new Date();

  const event: ApplicationEvent | null =
    statusChanged || message
      ? {
          status: status ?? application.status,
          message: message || `Status changed to ${statusLabel(status ?? application.status)}.`,
          actor: session.email,
          createdAt: now,
        }
      : null;

  await col.updateOne(
    { _id },
    {
      $set: {
        ...(status ? { status } : {}),
        adminNotes: adminNotes || null,
        updatedAt: now,
      },
      // A blank note on an unchanged status would be an empty log line, so skip it.
      ...(event ? { $push: { events: event } } : {}),
    },
  );

  const updated = await col.findOne(
    { _id },
    { projection: { status: 1, adminNotes: 1 } },
  );

  return NextResponse.json({
    application: { id, status: updated?.status, adminNotes: updated?.adminNotes },
  });
}

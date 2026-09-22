import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import { courses } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth";
import { parseCoursePayload } from "@/lib/course-payload";
import type { CourseDoc } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json(
      { message: "Only a super-admin can create courses." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseCoursePayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: parsed.errors },
      { status: 422 },
    );
  }

  const now = new Date();
  const doc: CourseDoc = {
    ...parsed.data,
    paymentPageUrl: parsed.data.paymentPageUrl ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const col = await courses();
    const result = await col.insertOne(doc);

    revalidatePath("/");
    revalidatePath(`/programs/${doc.slug}`);

    return NextResponse.json(
      { course: { id: String(result.insertedId), slug: doc.slug } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        {
          message: "That URL slug is already taken.",
          errors: { slug: "Another course already uses this slug." },
        },
        { status: 409 },
      );
    }
    console.error("[courses] create failed", error);
    return NextResponse.json({ message: "Could not create the course." }, { status: 500 });
  }
}

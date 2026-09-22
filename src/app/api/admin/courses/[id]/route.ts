import { NextResponse } from "next/server";
import { MongoServerError, ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { applications, courses } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth";
import { parseCoursePayload } from "@/lib/course-payload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json(
      { message: "Only a super-admin can edit courses." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const col = await courses();
  const _id = new ObjectId(id);
  const existing = await col.findOne({ _id });

  if (!existing) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  // A quick publish/unpublish toggle from the course list.
  const keys = Object.keys(body as object);
  if (keys.length === 1 && typeof (body as Record<string, unknown>).isActive === "boolean") {
    const isActive = (body as { isActive: boolean }).isActive;
    await col.updateOne({ _id }, { $set: { isActive, updatedAt: new Date() } });

    revalidatePath("/");
    revalidatePath(`/programs/${existing.slug}`);

    return NextResponse.json({ course: { id, isActive } });
  }

  const parsed = parseCoursePayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: parsed.errors },
      { status: 422 },
    );
  }

  try {
    await col.updateOne(
      { _id },
      {
        $set: {
          ...parsed.data,
          paymentPageUrl: parsed.data.paymentPageUrl ?? null,
          updatedAt: new Date(),
        },
      },
    );

    // Applications keep their own snapshot of the fee, but the display name
    // should follow a rename so admin lists do not show stale labels.
    if (existing.shortName !== parsed.data.shortName || existing.slug !== parsed.data.slug) {
      const appCol = await applications();
      await appCol.updateMany(
        { courseId: _id },
        { $set: { courseName: parsed.data.shortName, courseSlug: parsed.data.slug } },
      );
    }

    revalidatePath("/");
    revalidatePath(`/programs/${parsed.data.slug}`);
    if (existing.slug !== parsed.data.slug) revalidatePath(`/programs/${existing.slug}`);

    return NextResponse.json({ course: { id, slug: parsed.data.slug } });
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
    console.error("[courses] update failed", error);
    return NextResponse.json({ message: "Could not update the course." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json(
      { message: "Only a super-admin can delete courses." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  const _id = new ObjectId(id);
  const appCol = await applications();

  // Nothing in MongoDB stops this delete, so the guard has to live here:
  // removing a course with applications would orphan paid student records.
  const count = await appCol.countDocuments({ courseId: _id });
  if (count > 0) {
    return NextResponse.json(
      {
        message: `This course has ${count} application${count === 1 ? "" : "s"} and cannot be deleted. Turn it off instead to remove it from the website.`,
      },
      { status: 409 },
    );
  }

  const col = await courses();
  const deleted = await col.findOneAndDelete({ _id });

  if (deleted) {
    revalidatePath("/");
    revalidatePath(`/programs/${deleted.slug}`);
  }

  return NextResponse.json({ ok: true });
}

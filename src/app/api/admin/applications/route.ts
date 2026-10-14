import { NextResponse } from "next/server";
import { MongoServerError, ObjectId } from "mongodb";
import { getVerifiedAdminSession } from "@/lib/auth";
import { applications, courses } from "@/lib/mongodb";
import { buildOfflineApplication, offlineApplicationSchema } from "@/lib/offline-application";
import { fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getVerifiedAdminSession();
  if (!session) return NextResponse.json({ message: "Not authorised." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Invalid request body." }, { status: 400 }); }

  const parsed = offlineApplicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) }, { status: 422 });

  const course = await (await courses()).findOne({ _id: new ObjectId(parsed.data.courseId) });
  if (!course) return NextResponse.json({ message: "Selected course no longer exists." }, { status: 404 });

  const col = await applications();
  const doc = buildOfflineApplication(parsed.data, course, session);
  const response = (record: typeof doc) => NextResponse.json({ application: { id: String(record._id), referenceNo: record.referenceNo } }, { status: 201 });
  // Retry only a reference-number collision. A repeated submission returns the original record.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await col.insertOne(doc);
      return response(doc);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const existing = await col.findOne({ _id: doc._id });
        if (existing) return response({ ...existing, _id: doc._id });
        doc.referenceNo = buildOfflineApplication(parsed.data, course, session).referenceNo;
        continue;
      }
      console.error("[applications] offline creation failed", error);
      return NextResponse.json({ message: "Could not save the registration. Please try again." }, { status: 500 });
    }
  }
  return NextResponse.json({ message: "Could not allocate a reference number. Please try again." }, { status: 500 });
}

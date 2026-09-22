import { NextResponse } from "next/server";
import { applications } from "@/lib/mongodb";
import { fieldErrors, trackSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the details.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { referenceNo, phone } = parsed.data;

  const col = await applications();
  // The phone is part of the query, not a check afterwards, so a wrong number
  // is indistinguishable from an unknown reference.
  const application = await col.findOne({
    referenceNo: referenceNo.toUpperCase(),
    phone,
  });

  if (!application) {
    return NextResponse.json(
      { message: "No application found with that reference number and mobile number." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    application: {
      referenceNo: application.referenceNo,
      fullName: application.fullName,
      programName: application.courseName,
      programSlug: application.courseSlug,
      amount: application.amount,
      status: application.status,
      paymentStatus: application.paymentStatus,
      examYear: application.examYear,
      createdAt: application.createdAt,
      paidAt: application.paidAt,
      adminNotes: application.adminNotes,
      events: (application.events ?? [])
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((event) => ({
          status: event.status,
          message: event.message,
          createdAt: event.createdAt,
        })),
    },
  });
}

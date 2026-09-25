import { NextResponse } from "next/server";
import { applications, courses } from "@/lib/mongodb";
import { getRazorpay } from "@/lib/razorpay";
import { generateReferenceNo } from "@/lib/reference";
import { amountInPaise } from "@/lib/course-view";
import { isCatalogFieldKey, parseCustomFields } from "@/lib/field-catalog";
import { buildApplicationSchema, fieldErrors } from "@/lib/validation";
import type { ApplicationDoc, StudentCategory, SubjectCombination } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof body.courseSlug === "string" ? body.courseSlug : "";
  if (!slug) {
    return NextResponse.json({ message: "No course selected." }, { status: 400 });
  }

  const courseCol = await courses();
  const course = await courseCol.findOne({ slug });

  // A draft or deleted course must never take money.
  if (!course || !course.isActive) {
    return NextResponse.json(
      { message: "This course is not accepting applications right now." },
      { status: 404 },
    );
  }

  // The schema is built from the stored course config, not from the payload, so
  // a tampered request cannot enable a field the course does not ask for.
  const schema = buildApplicationSchema(course);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const input = parsed.data as Record<string, unknown>;
  const enabled = new Set<string>((course.catalogFields ?? []).filter(isCatalogFieldKey));

  const pick = (key: string): string | null => {
    if (!enabled.has(key)) return null;
    const value = input[key];
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  };

  const pickList = (key: string): string[] => {
    if (!enabled.has(key)) return [];
    const value = input[key];
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  };

  const dateOfBirth = pick("dateOfBirth");

  // Only store answers to fields this course actually defines.
  const definedKeys = new Set(parseCustomFields(course.customFields).map((f) => f.key));
  const rawCustom = (input.custom ?? {}) as Record<string, unknown>;
  const customAnswers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawCustom)) {
    if (definedKeys.has(key) && value !== undefined && value !== "") {
      customAnswers[key] = value;
    }
  }

  const appCol = await applications();
  const referenceNo = await uniqueReferenceNo(slug);
  const now = new Date();

  const doc: ApplicationDoc = {
    referenceNo,
    courseId: course._id!,
    courseName: course.shortName,
    courseSlug: course.slug,

    fullName: String(input.fullName),
    email: String(input.email),
    phone: String(input.phone),
    altPhone: typeof input.altPhone === "string" ? input.altPhone : null,
    remarks: typeof input.remarks === "string" ? input.remarks : null,

    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    gender: pick("gender"),
    fatherName: pick("fatherName"),
    motherName: pick("motherName"),

    address: pick("address"),
    city: pick("city"),
    state: pick("state"),
    pincode: pick("pincode"),

    rollNo: pick("rollNo"),
    previousSchool: pick("previousSchool"),
    schoolCode: pick("schoolCode"),
    passingYear: pick("passingYear"),
    examYear: pick("examYear"),
    studentCategory: pick("studentCategory") as StudentCategory | null,
    studentClass: pick("studentClass"),
    subjectCombination: pick("subjectCombination") as SubjectCombination | null,
    subjects: pickList("subjects"),
    improvementSubjects: pickList("improvementSubjects"),
    failedSubjects: pickList("failedSubjects"),

    customAnswers,

    // Taken from the course document, never from the browser.
    amount: course.fee,
    paymentStatus: "PENDING",
    razorpayPaymentId: null,
    razorpaySignature: null,
    paidAt: null,

    status: "PENDING_PAYMENT",
    adminNotes: null,

    events: [
      {
        status: "PENDING_PAYMENT",
        message: "Application submitted. Waiting for payment.",
        actor: "system",
        createdAt: now,
      },
    ],

    createdAt: now,
    updatedAt: now,
  };

  let insertedId;
  try {
    const result = await appCol.insertOne(doc);
    insertedId = result.insertedId;
  } catch (error) {
    console.error("[applications] insert failed", error);
    return NextResponse.json(
      { message: "Could not save your application. Please try again." },
      { status: 500 },
    );
  }

  try {
    const order = await getRazorpay().orders.create({
      amount: amountInPaise(course.fee),
      currency: "INR",
      receipt: referenceNo,
      notes: {
        referenceNo,
        course: course.slug,
        applicationId: String(insertedId),
      },
    });

    await appCol.updateOne(
      { _id: insertedId },
      { $set: { razorpayOrderId: order.id, updatedAt: new Date() } },
    );

    return NextResponse.json(
      {
        referenceNo,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
        order: { id: order.id, amount: order.amount, currency: order.currency },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[applications] razorpay order failed", error);
    // The application document stays so support can recover the student manually.
    return NextResponse.json(
      {
        message:
          `Your details are saved as ${referenceNo}, but the payment window could not be opened. ` +
          "Please try again or contact support.",
      },
      { status: 502 },
    );
  }
}

/** Retries on the (very unlikely) collision rather than surfacing a 500. */
async function uniqueReferenceNo(slug: string): Promise<string> {
  const col = await applications();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateReferenceNo(slug);
    const existing = await col.findOne(
      { referenceNo: candidate },
      { projection: { _id: 1 } },
    );
    if (!existing) return candidate;
  }
  throw new Error("Could not allocate a unique reference number");
}

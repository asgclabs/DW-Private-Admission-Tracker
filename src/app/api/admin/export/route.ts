import { NextResponse } from "next/server";
import { applications } from "@/lib/mongodb";
import { getVerifiedAdminSession } from "@/lib/auth";
import { buildApplicationFilter } from "@/lib/application-query";
import { statusLabel } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = [
  "Reference No",
  "Program",
  "Status",
  "Payment",
  "Amount",
  "Full Name",
  "Phone",
  "WhatsApp Number",
  "Email",
  "Date of Birth",
  "Gender",
  "Father Name",
  "Mother Name",
  "Address",
  "City",
  "District",
  "State",
  "Pincode",
  "Roll No",
  "School",
  "School Code",
  "Passing Year",
  "Exam Year",
  "Category",
  "Class",
  "Subject Combination",
  "Subjects",
  "Improvement Subjects",
  "Failed Subjects",
  "Student Remarks",
  "Extra Answers",
  "Admin Notes",
  "Razorpay Order",
  "Razorpay Payment",
  "Paid At",
  "Applied At",
];

/** Flattens the per-course custom answers into one readable cell. */
function formatCustomAnswers(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return Object.entries(value as Record<string, unknown>)
    .map(([key, answer]) => `${key}: ${String(answer)}`)
    .join("; ");
}

/** Guards against CSV formula injection when the file opens in Excel. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authorised." }, { status: 401 });
  }

  const url = new URL(request.url);
  const filter = buildApplicationFilter({
    q: url.searchParams.get("q") ?? undefined,
    program: url.searchParams.get("program") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    payment: url.searchParams.get("payment") ?? undefined,
  });

  const col = await applications();
  const docs = await col.find(filter).sort({ createdAt: -1 }).limit(5000).toArray();

  const rows = docs.map((a) =>
    [
      a.referenceNo,
      a.courseName,
      statusLabel(a.status),
      a.paymentStatus,
      a.amount,
      a.fullName,
      a.phone,
      a.altPhone,
      a.email,
      a.dateOfBirth ? a.dateOfBirth.toISOString().slice(0, 10) : "",
      a.gender,
      a.fatherName,
      a.motherName,
      a.address,
      a.city,
      a.district,
      a.state,
      a.pincode,
      a.rollNo,
      a.previousSchool,
      a.schoolCode,
      a.passingYear,
      a.examYear,
      a.studentCategory,
      a.studentClass,
      a.subjectCombination,
      (a.subjects ?? []).join("; "),
      (a.improvementSubjects ?? []).join("; "),
      (a.failedSubjects ?? []).join("; "),
      a.remarks,
      formatCustomAnswers(a.customAnswers),
      a.adminNotes,
      a.razorpayOrderId,
      a.razorpayPaymentId,
      a.paidAt,
      a.createdAt,
    ]
      .map(escapeCell)
      .join(","),
  );

  // BOM so Excel opens the rupee sign and Indian names correctly.
  const csv = `﻿${COLUMNS.map(escapeCell).join(",")}\n${rows.join("\n")}`;
  const filename = `applications-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

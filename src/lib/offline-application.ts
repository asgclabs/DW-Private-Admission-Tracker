import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { generateReferenceNo } from "./reference";
import type { ApplicationDoc, CourseDoc } from "./types";

export const offlineApplicationSchema = z.object({
  submissionId: z.string().uuid(),
  courseId: z.string().regex(/^[a-f\d]{24}$/i, "Select a course"),
  fullName: z.string().trim().min(3, "Enter the student's full name").max(120),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email address").max(160).or(z.literal("")).default(""),
  amount: z.number().int("Enter the amount in whole rupees").positive().max(1_000_000),
  paidDate: z.string().date("Enter a valid payment date").refine(
    (value) => value <= new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    "Payment date cannot be in the future",
  ),
  offlineReceipt: z.string().trim().max(200).default(""),
  adminNotes: z.string().trim().max(2000).default(""),
});

export function buildOfflineApplication(
  input: z.infer<typeof offlineApplicationSchema>,
  course: CourseDoc & { _id: ObjectId },
  admin: { id: string; email: string },
): ApplicationDoc & { _id: ObjectId } {
  const now = new Date();
  // Repeated requests from the same form reuse MongoDB's unique primary key.
  const _id = new ObjectId(createHash("sha256").update(`${admin.id}:${input.submissionId}`).digest("hex").slice(0, 24));
  return {
    _id, referenceNo: generateReferenceNo(course.slug),
    courseId: course._id, courseName: course.shortName, courseSlug: course.slug,
    fullName: input.fullName, phone: input.phone, email: input.email,
    altPhone: null, dateOfBirth: null, gender: null, fatherName: null, motherName: null,
    address: null, city: null, state: null, district: null, pincode: null,
    rollNo: null, previousSchool: null, schoolCode: null, passingYear: null, examYear: null,
    studentCategory: null, studentClass: null, subjectCombination: null,
    subjects: [], failedSubjects: [], improvementSubjects: [], remarks: null, customAnswers: {},
    amount: input.amount, paymentStatus: "PAID", paymentSource: "OFFLINE",
    offlineReceipt: input.offlineReceipt || null,
    razorpayPaymentId: null, razorpaySignature: null,
    paidAt: new Date(`${input.paidDate}T00:00:00+05:30`),
    status: "PAID", adminNotes: input.adminNotes || null,
    events: [{ status: "PAID", message: `Offline registration created. Payment of ₹${input.amount} received${input.offlineReceipt ? ` (receipt: ${input.offlineReceipt})` : ""}.`, actor: admin.email, createdAt: now }],
    createdAt: now, updatedAt: now,
  };
}

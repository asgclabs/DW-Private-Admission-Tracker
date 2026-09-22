import type { ObjectId } from "mongodb";
import type { CustomField } from "./field-catalog";

export type AdminRole = "SUPER_ADMIN" | "ADMIN";

export type StudentCategory = "COMPARTMENT" | "IMPROVEMENT" | "ESSENTIAL_REPEAT";

export type SubjectCombination = "PCM" | "PCB" | "COMMERCE" | "HUMANITIES";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type ApplicationStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "UNDER_REVIEW"
  | "DOCUMENTS_REQUIRED"
  | "FORM_SUBMITTED"
  | "ADMIT_CARD_ISSUED"
  | "COMPLETED"
  | "CANCELLED";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "UNDER_REVIEW",
  "DOCUMENTS_REQUIRED",
  "FORM_SUBMITTED",
  "ADMIT_CARD_ISSUED",
  "COMPLETED",
  "CANCELLED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export type AdminUserDoc = {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * A course/program a super-admin creates from the dashboard. Everything the
 * public site shows, and which fields its form collects, lives in this document.
 */
export type CourseDoc = {
  _id?: ObjectId;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  /** Fee in whole rupees. Razorpay is charged this value converted to paise. */
  fee: number;
  audience: string;
  whoCanEnroll: string[];
  offers: string[];
  highlights: string[];
  /** Reference to the original hosted Razorpay Payment Page, if the course has one. */
  paymentPageUrl: string | null;
  accent: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  /** Keys from the field catalog (src/lib/field-catalog.ts) this form collects. */
  catalogFields: string[];
  /** Subset of catalogFields the student must fill in. */
  requiredFields: string[];
  customFields: CustomField[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Status history lives inside the application document rather than in its own
 * collection: events are few, always read together with the application, and
 * never queried on their own.
 */
export type ApplicationEvent = {
  status: ApplicationStatus;
  message: string;
  actor: string;
  createdAt: Date;
};

export type ApplicationDoc = {
  _id?: ObjectId;
  referenceNo: string;

  courseId: ObjectId;
  /**
   * Snapshot of the course at application time, so later edits to the course
   * never rewrite what a student actually signed up and paid for.
   */
  courseName: string;
  courseSlug: string;

  fullName: string;
  email: string;
  phone: string;
  altPhone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  fatherName: string | null;
  motherName: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  rollNo: string | null;
  previousSchool: string | null;
  schoolCode: string | null;
  passingYear: string | null;
  examYear: string | null;
  studentCategory: StudentCategory | null;
  subjectCombination: SubjectCombination | null;
  subjects: string[];
  failedSubjects: string[];
  improvementSubjects: string[];
  remarks: string | null;

  /** Answers to the course's custom fields: { "<field key>": <answer> } */
  customAnswers: Record<string, unknown>;

  amount: number;
  paymentStatus: PaymentStatus;
  /** Absent (not null) until the Razorpay order is created — see the sparse index. */
  razorpayOrderId?: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paidAt: Date | null;

  status: ApplicationStatus;
  adminNotes: string | null;

  events: ApplicationEvent[];

  createdAt: Date;
  updatedAt: Date;
};

export type NotificationDoc = {
  _id?: ObjectId;
  title: string;
  body: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

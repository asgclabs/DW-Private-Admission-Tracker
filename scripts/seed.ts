/**
 * Creates the database indexes, the first super-admin, and the three starter
 * courses. Safe to re-run: it never resets an existing password and never
 * overwrites a course you have edited in the dashboard.
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import type { CourseDoc } from "../src/lib/types";

config({ path: ".env" });

const uri = process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB ?? "dw_private";

if (!uri) {
  throw new Error("DATABASE_URL is not set. Add your MongoDB connection string to .env.");
}

type SeedCourse = Omit<CourseDoc, "_id" | "createdAt" | "updatedAt">;

const COURSES: SeedCourse[] = [
  {
    slug: "focus-improvement",
    name: "Focus 4.0 — Improvement Students",
    shortName: "Focus 4.0 (Improvement)",
    tagline: "Improve your CBSE Board marks in 2026 with end-to-end mentorship.",
    fee: 999,
    audience: "Students who want to improve their CBSE Board exam marks",
    whoCanEnroll: [
      "Passed students who want to improve marks in one or more subjects",
      "Students appearing as private candidates for improvement in 2026",
    ],
    offers: [
      "CBSE form filling support",
      "Regular meetings with mentors",
      "Study materials for every subject",
      "Personal mentorship till the exam",
    ],
    highlights: [
      "Step-by-step guidance on the improvement category",
      "Deadline reminders so nothing is missed",
      "Notes and important questions shared in the group",
    ],
    paymentPageUrl: "https://rzp.io/rzp/0gTMW3ke",
    accent: "amber",
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    catalogFields: [
      "dateOfBirth",
      "gender",
      "fatherName",
      "motherName",
      "address",
      "city",
      "state",
      "pincode",
      "rollNo",
      "previousSchool",
      "schoolCode",
      "passingYear",
      "examYear",
      "improvementSubjects",
    ],
    requiredFields: ["improvementSubjects"],
    customFields: [],
  },
  {
    slug: "focus-er",
    name: "Focus 4.0 — Essential Repeat / Failure",
    shortName: "Focus 4.0 (ER / Failure)",
    tagline: "Clear your CBSE Board exams with a structured repeat plan.",
    fee: 999,
    audience: "Essential Repeat (ER) and failed students targeting the next board exam",
    whoCanEnroll: [
      "Students marked Essential Repeat in the CBSE result",
      "Students who could not clear the board exam and are repeating",
    ],
    offers: [
      "CBSE form filling support",
      "Regular meetings with mentors",
      "Study materials for your subject combination",
      "Personal mentorship till the exam",
    ],
    highlights: [
      "Subject-combination based preparation (PCM, PCB, Commerce, Humanities)",
      "Focused revision plan for the whole year",
      "Previous year papers with solutions",
    ],
    paymentPageUrl: "https://rzp.io/rzp/GFzVpH0b",
    accent: "rose",
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    catalogFields: [
      "dateOfBirth",
      "gender",
      "fatherName",
      "motherName",
      "address",
      "city",
      "state",
      "pincode",
      "subjectCombination",
      "rollNo",
      "previousSchool",
      "schoolCode",
      "passingYear",
      "examYear",
      "failedSubjects",
    ],
    requiredFields: ["subjectCombination"],
    customFields: [],
  },
  {
    slug: "circle",
    name: "Circle 4.0 — Ultimate Form Filling Support",
    shortName: "Circle 4.0",
    tagline:
      "Form filling support for Compartment, Improvement and Essential Repeat students in 2026.",
    fee: 499,
    audience: "Every CBSE private student who needs the form filled correctly",
    whoCanEnroll: [
      "Compartment students",
      "Improvement students",
      "Essential Repeat students",
      "Any CBSE private candidate for 2026",
    ],
    offers: [
      "Form filling assistance — we fill the form for you",
      "Admit card details and timely updates",
      "Exam guidance with tips and strategies",
      "Exclusive online community",
      "Study notes shared in the group",
      "Monthly meeting for guidance",
    ],
    highlights: [
      "Simplified process broken into small steps",
      "Timely updates so you never miss a deadline",
      "Strict confidentiality of your personal information",
    ],
    paymentPageUrl: "https://rzp.io/rzp/vAq2V3kO",
    accent: "sky",
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    catalogFields: [
      "studentCategory",
      "examYear",
      "subjects",
      "dateOfBirth",
      "gender",
      "fatherName",
      "motherName",
      "rollNo",
      "previousSchool",
      "schoolCode",
      "passingYear",
      "address",
      "city",
      "state",
      "pincode",
    ],
    requiredFields: ["studentCategory"],
    customFields: [],
  },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
  }
  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  }

  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  // Indexes first: the unique index on email is what makes the upsert below safe.
  await db.collection("adminUsers").createIndex({ email: 1 }, { unique: true });
  await db.collection("adminUsers").createIndex({ role: 1 });
  await db.collection("courses").createIndex({ slug: 1 }, { unique: true });
  await db.collection("courses").createIndex({ isActive: 1, sortOrder: 1 });
  await db.collection("applications").createIndex({ referenceNo: 1 }, { unique: true });
  await db
    .collection("applications")
    .createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true });
  await db.collection("applications").createIndex({ courseSlug: 1 });
  await db.collection("applications").createIndex({ status: 1 });
  await db.collection("applications").createIndex({ phone: 1 });
  await db.collection("applications").createIndex({ createdAt: -1 });
  await db.collection("notifications").createIndex({ isActive: 1, createdAt: -1 });
  console.log("Indexes ready.");

  const users = db.collection("adminUsers");
  const existing = await users.findOne({ email });
  const now = new Date();

  if (existing) {
    // Never silently reset a password that is already in use.
    await users.updateOne(
      { email },
      { $set: { role: "SUPER_ADMIN", isActive: true, updatedAt: now } },
    );
    console.log(`Super-admin already exists: ${email} (role confirmed, password unchanged)`);
  } else {
    await users.insertOne({
      email,
      name: "Super Admin",
      passwordHash: await bcrypt.hash(password, 12),
      role: "SUPER_ADMIN",
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created super-admin: ${email}`);
  }

  const courses = db.collection("courses");
  for (const course of COURSES) {
    const result = await courses.updateOne(
      { slug: course.slug },
      { $setOnInsert: { ...course, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    const action = result.upsertedCount > 0 ? "created" : "already present, left as-is";
    console.log(`Course ${course.slug} (₹${course.fee}): ${action}`);
  }

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

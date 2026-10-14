import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { buildOfflineApplication, offlineApplicationSchema } from "./offline-application";
import type { CourseDoc } from "./types";
import { paymentMonthStarts } from "./payment-query";

const course = { _id: new ObjectId(), slug: "circle", shortName: "Circle 4.0" } as CourseDoc & { _id: ObjectId };
const admin = { id: new ObjectId().toHexString(), email: "admin@example.test" };
const valid = {
  submissionId: randomUUID(), courseId: String(course._id),
  fullName: "Test Student", phone: "9876543210", email: "",
  amount: 499, paidDate: "2026-01-02", offlineReceipt: "CASH-001", adminNotes: "Cash received at office",
};

test("offline registrations create paid records with payment date, receipt and admin audit", () => {
  const doc = buildOfflineApplication(offlineApplicationSchema.parse(valid), course, admin);
  assert.equal(doc.paymentStatus, "PAID");
  assert.equal(doc.status, "PAID");
  assert.equal(doc.paymentSource, "OFFLINE");
  assert.equal(doc.amount, 499);
  assert.equal(doc.courseSlug, "circle");
  assert.equal(doc.offlineReceipt, "CASH-001");
  assert.equal(doc.events[0].actor, admin.email);
  assert.equal(doc.paidAt?.toISOString(), "2026-01-01T18:30:00.000Z");
  assert.equal(doc.razorpayOrderId, undefined);
  assert.equal(doc.razorpayPaymentId, null);
  assert.match(doc.referenceNo, /^DW/);
});

test("retrying a form has the same unique database ID; separate registrations have different IDs", () => {
  const input = offlineApplicationSchema.parse(valid);
  const first = buildOfflineApplication(input, course, admin);
  const retry = buildOfflineApplication(input, course, admin);
  const separate = buildOfflineApplication({ ...input, submissionId: randomUUID() }, course, admin);
  assert.equal(String(first._id), String(retry._id));
  assert.notEqual(String(first._id), String(separate._id));
});

test("offline validation rejects invalid payments, dates and student details", () => {
  for (const invalid of [
    { amount: 0 }, { amount: -1 }, { amount: 10.5 }, { amount: "499" }, { amount: 1000001 },
    { paidDate: "2099-01-01" }, { paidDate: "2026-02-30" }, { paidDate: "invalid" },
    { phone: "123" }, { email: "invalid" }, { fullName: "" }, { courseId: "invalid" }, { submissionId: "invalid" },
  ]) {
    assert.equal(offlineApplicationSchema.safeParse({ ...valid, ...invalid }).success, false, JSON.stringify(invalid));
  }
});

test("email, receipt and notes can be omitted for offline admissions", () => {
  const { email, offlineReceipt, adminNotes, ...minimal } = valid;
  const parsed = offlineApplicationSchema.parse(minimal);
  assert.equal(parsed.email, "");
  assert.equal(parsed.offlineReceipt, "");
  assert.equal(parsed.adminNotes, "");
});

test("monthly collections use Indian midnight including across year boundaries", () => {
  const starts = paymentMonthStarts(new Date("2026-12-31T19:00:00.000Z"));
  assert.equal(starts.thisMonth.toISOString(), "2026-12-31T18:30:00.000Z");
  assert.equal(starts.previousMonth.toISOString(), "2026-11-30T18:30:00.000Z");
});

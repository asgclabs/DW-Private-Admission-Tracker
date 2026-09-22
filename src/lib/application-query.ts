import type { Document, Filter } from "mongodb";
import { APPLICATION_STATUSES, PAYMENT_STATUSES } from "./types";
import type { ApplicationDoc, ApplicationStatus, PaymentStatus } from "./types";

/** Turns a user-supplied string into a safe case-insensitive regex fragment. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type ApplicationFilters = {
  q?: string;
  program?: string;
  status?: string;
  payment?: string;
};

/**
 * Shared by the admin list and the CSV export so the file you download always
 * matches the rows you were looking at.
 */
export function buildApplicationFilter(
  params: ApplicationFilters,
): Filter<ApplicationDoc> {
  const filter: Filter<ApplicationDoc> = {};

  if (params.q?.trim()) {
    // Escaped so a stray "(" in a search box cannot throw an invalid-regex error.
    const term = new RegExp(escapeRegex(params.q.trim()), "i");
    filter.$or = [
      { referenceNo: term },
      { fullName: term },
      { phone: term },
      { email: term },
      { rollNo: term },
    ];
  }

  if (params.program) {
    filter.courseSlug = params.program;
  }

  if (params.status && APPLICATION_STATUSES.includes(params.status as ApplicationStatus)) {
    filter.status = params.status as ApplicationStatus;
  }

  if (params.payment && PAYMENT_STATUSES.includes(params.payment as PaymentStatus)) {
    filter.paymentStatus = params.payment as PaymentStatus;
  }

  return filter;
}

export type GroupedApplicationRow = {
  _id: unknown;
  referenceNo: string;
  fullName: string;
  phone: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
};

export type CourseGroup = {
  _id: unknown;
  courseName: string;
  courseSlug: string;
  count: number;
  docs: GroupedApplicationRow[];
};

/**
 * Groups applications by course so the admin can see every course's volume at
 * a glance instead of only via the flat table's filter. Sorts newest-first
 * before grouping so `$push` + `$slice` yields each course's most recent
 * applications without a second query per course.
 */
export function buildGroupedApplicationsPipeline(
  filter: Filter<ApplicationDoc>,
  limitPerGroup = 8,
): Document[] {
  return [
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$courseId",
        courseName: { $first: "$courseName" },
        courseSlug: { $first: "$courseSlug" },
        count: { $sum: 1 },
        docs: {
          $push: {
            _id: "$_id",
            referenceNo: "$referenceNo",
            fullName: "$fullName",
            phone: "$phone",
            status: "$status",
            paymentStatus: "$paymentStatus",
            createdAt: "$createdAt",
          },
        },
      },
    },
    { $project: { courseName: 1, courseSlug: 1, count: 1, docs: { $slice: ["$docs", limitPerGroup] } } },
  ];
}

/**
 * Presentation-side course helpers.
 *
 * Kept separate from `courses.ts` on purpose: client components need the
 * CourseView type and the accent classes, and importing those from a module
 * that also opens a MongoDB connection would pull the driver into the browser
 * bundle.
 */
import { parseCustomFields, type CustomField } from "./field-catalog";
import type { ComparisonRow, CourseDoc } from "./types";

/** A course shaped for rendering — no ObjectId or Date, safe for client components. */
export type CourseView = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  fee: number;
  audience: string;
  whoCanEnroll: string[];
  offers: string[];
  highlights: string[];
  paymentPageUrl: string | null;
  accent: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  catalogFields: string[];
  requiredFields: string[];
  customFields: CustomField[];
  comparison: ComparisonRow[];
};

export function toCourseView(course: CourseDoc): CourseView {
  return {
    id: String(course._id),
    slug: course.slug,
    name: course.name,
    shortName: course.shortName,
    tagline: course.tagline,
    fee: course.fee,
    audience: course.audience,
    whoCanEnroll: course.whoCanEnroll ?? [],
    offers: course.offers ?? [],
    highlights: course.highlights ?? [],
    paymentPageUrl: course.paymentPageUrl ?? null,
    accent: course.accent,
    isActive: course.isActive,
    isFeatured: course.isFeatured,
    sortOrder: course.sortOrder,
    catalogFields: course.catalogFields ?? [],
    requiredFields: course.requiredFields ?? [],
    customFields: parseCustomFields(course.customFields),
    comparison: (course.comparison ?? []).map((row) => ({
      label: row.label,
      value: row.value ?? "",
      plain: Boolean(row.plain),
    })),
  };
}

export function amountInPaise(fee: number): number {
  return Math.round(fee * 100);
}

export const ACCENTS = [
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "sky", label: "Sky" },
  { value: "emerald", label: "Emerald" },
  { value: "violet", label: "Violet" },
] as const;

/** Static class names per accent — Tailwind cannot see dynamically built strings. */
export const ACCENT_CLASSES: Record<
  string,
  { bar: string; chip: string; check: string; border: string }
> = {
  amber: {
    bar: "bg-amber-400",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
    check: "text-amber-500",
    border: "hover:border-amber-300",
  },
  rose: {
    bar: "bg-rose-400",
    chip: "bg-rose-50 text-rose-800 ring-rose-200",
    check: "text-rose-500",
    border: "hover:border-rose-300",
  },
  sky: {
    bar: "bg-sky-400",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
    check: "text-sky-500",
    border: "hover:border-sky-300",
  },
  emerald: {
    bar: "bg-emerald-400",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    check: "text-emerald-500",
    border: "hover:border-emerald-300",
  },
  violet: {
    bar: "bg-violet-400",
    chip: "bg-violet-50 text-violet-800 ring-violet-200",
    check: "text-violet-500",
    border: "hover:border-violet-300",
  },
};

export function accentClasses(accent: string) {
  return ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.sky;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormShell } from "@/components/form/form-shell";
import { DynamicApplicationForm } from "@/components/form/dynamic-application-form";
import { getLiveCourseBySlug } from "@/lib/courses";
import { FIELD_CATALOG, type CatalogFieldKey } from "@/lib/field-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getLiveCourseBySlug(slug);
  if (!course) return { title: "Course not found" };

  return {
    title: `Apply — ${course.shortName}`,
    description: course.tagline,
  };
}

/** Query parameters the Program Finder sends, and the form field each one fills. */
const PREFILL_PARAMS: Record<string, CatalogFieldKey> = {
  category: "studentCategory",
  class: "studentClass",
};

/**
 * Turns the finder's answers into starting values for this course's form. Only
 * fields the course actually collects, and only values on the field's own list,
 * are accepted — anything else in the URL is ignored.
 */
function prefillFrom(
  searchParams: Record<string, string | string[] | undefined>,
  catalogFields: string[],
): Record<string, string> {
  const prefill: Record<string, string> = {};
  for (const [param, key] of Object.entries(PREFILL_PARAMS)) {
    const raw = searchParams[param];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || !catalogFields.includes(key)) continue;
    if ((FIELD_CATALOG[key].options ?? []).some((option) => option.value === value)) {
      prefill[key] = value;
    }
  }
  return prefill;
}

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const course = await getLiveCourseBySlug(slug);
  if (!course) notFound();

  const prefill = prefillFrom(await searchParams, course.catalogFields);

  return (
    <FormShell course={course}>
      <DynamicApplicationForm course={course} prefill={prefill} />
    </FormShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormShell } from "@/components/form/form-shell";
import { DynamicApplicationForm } from "@/components/form/dynamic-application-form";
import { getLiveCourseBySlug } from "@/lib/courses";

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

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getLiveCourseBySlug(slug);
  if (!course) notFound();

  return (
    <FormShell course={course}>
      <DynamicApplicationForm course={course} />
    </FormShell>
  );
}

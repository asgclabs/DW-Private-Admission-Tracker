import { CourseCard } from "@/components/course-card";
import { ComparisonTable } from "@/components/comparison-table";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { FinderSection } from "@/components/landing/finder-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { SectionHeading } from "@/components/landing/section-heading";
import { StickyApplyBar } from "@/components/landing/sticky-apply-bar";
import { getLiveCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await getLiveCourses();

  // "From ₹…" is always the cheapest live course, never a hard-coded number.
  const lowestFee = courses.length > 0 ? Math.min(...courses.map((course) => course.fee)) : null;

  return (
    <>
      <Hero lowestFee={lowestFee} />

      <ProblemSolution />

      <FinderSection
        courses={courses.map((course) => ({
          slug: course.slug,
          shortName: course.shortName,
          fee: course.fee,
          originalFee: course.originalFee,
          tagline: course.tagline,
        }))}
      />

      <section
        id="programs"
        className="scroll-mt-20 border-y border-slate-200/70 bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28"
      >
        <div className="container-page">
          <SectionHeading eyebrow="Programs & fees" title="One simple, one-time fee">
            Choose form filling with updates, or full-year preparation on top. No hidden
            charges, and your reference number arrives the moment you pay.
          </SectionHeading>

          {courses.length > 0 ? (
            <div className="mt-16 grid items-start gap-8 lg:grid-cols-3 lg:gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-sm text-slate-500">
              Applications for the next session will open soon.
            </p>
          )}

          {courses.length > 1 && (
            <div className="mt-24">
              <SectionHeading eyebrow="Side by side" title="Compare every program" />
              <ComparisonTable courses={courses} />
            </div>
          )}
        </div>
      </section>

      <HowItWorks />

      <FaqSection />

      <FinalCta lowestFee={lowestFee} />

      <StickyApplyBar lowestFee={lowestFee} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Price, SavingBadge } from "@/components/price";
import { getLiveCourseBySlug, getLiveCourses } from "@/lib/courses";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getLiveCourseBySlug(slug);
  if (!course) return { title: "Course not found" };

  return { title: course.name, description: course.tagline };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, others] = await Promise.all([getLiveCourseBySlug(slug), getLiveCourses()]);
  if (!course) notFound();

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-12">
          <nav className="text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/#programs" className="hover:text-brand-600">
              Programs
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">{course.shortName}</span>
          </nav>

          <h1 className="mt-4 max-w-3xl text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {course.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {course.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Price fee={course.fee} originalFee={course.originalFee} size="lg" />
            <SavingBadge fee={course.fee} originalFee={course.originalFee} />
            <Link href={`/apply/${course.slug}`} className="btn-primary">
              Apply now
            </Link>
            <Link href="/track" className="btn-secondary">
              Track application
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900">Who can enroll</h2>
            <ul className="mt-4 space-y-3">
              {course.whoCanEnroll.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900">What we offer</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.offers.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900">Why students pick this</h2>
            <ul className="mt-4 space-y-3">
              {course.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Other programs</h2>
            <div className="mt-4 space-y-3">
              {others.filter((p) => p.slug !== course.slug).map((p) => (
                <Link
                  key={p.slug}
                  href={`/programs/${p.slug}`}
                  className="block rounded-lg border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{p.shortName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    &#8377;{p.fee.toLocaleString("en-IN")} &middot; {p.audience}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm font-bold text-slate-900">Questions before paying?</p>
            <div className="mt-3 space-y-2 text-sm">
              <a href={SITE.phoneHref} className="block font-medium text-brand-600">
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="block text-slate-600">
                {SITE.email}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

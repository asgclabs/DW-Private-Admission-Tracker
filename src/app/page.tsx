import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Faq } from "@/components/faq";
import { getLiveCourses } from "@/lib/courses";
import { CATEGORIES, FAQS, PROCESS_STEPS } from "@/lib/content";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await getLiveCourses();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-white text-brand-700 ring-brand-200">
              Session 2026 &middot; Applications open
            </span>
            <h1 className="mt-6 text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              CBSE Private Students Guide for Compartment, Improvement &amp; Failure
            </h1>
            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
              Everything a private candidate needs in one place &mdash; understand your
              category, pick the right support program, and let us fill and track your CBSE
              form from application to admit card.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="#programs" className="btn-primary">
                View programs &amp; fees
              </Link>
              <Link href="/track" className="btn-secondary">
                Track your application
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Secure payment via Razorpay &middot; Instant reference number &middot; Support on{" "}
              <a href={SITE.phoneHref} className="font-medium text-brand-600">
                {SITE.phone}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Category guide */}
      <section id="categories" className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Step one</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            First, find out which category you fall in
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            CBSE treats compartment, improvement and essential repeat students very
            differently. Filling the wrong category is the single most common mistake private
            candidates make.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((category) => (
            <div key={category.key} className="card flex flex-col p-6">
              <h3 className="text-base font-bold text-slate-900">{category.title}</h3>
              <p className="mt-1 text-xs font-medium tracking-wide text-brand-600 uppercase">
                {category.subtitle}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{category.body}</p>
              <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
                {category.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/apply/${category.program}`}
                className="mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Apply for this category &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Step two</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Choose your support program
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Pick the level of support you need &mdash; from form filling and deadline
              updates right through to full-year mentorship.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {courses.length > 1 && (
            <div className="card mt-12 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Compare</th>
                      {courses.map((course) => (
                        <th key={course.id} className="px-6 py-4 font-semibold">
                          {course.shortName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-700">Fee</td>
                      {courses.map((course) => (
                        <td key={course.id} className="px-6 py-4 font-semibold text-slate-900">
                          &#8377;{course.fee.toLocaleString("en-IN")}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-700">Who it is for</td>
                      {courses.map((course) => (
                        <td key={course.id} className="px-6 py-4 text-slate-600">
                          {course.audience}
                        </td>
                      ))}
                    </tr>
                    {Array.from(
                      new Set(courses.flatMap((course) => course.offers)),
                    ).map((offer) => (
                      <tr key={offer}>
                        <td className="px-6 py-4 font-medium text-slate-700">{offer}</td>
                        {courses.map((course) => (
                          <td key={course.id} className="px-6 py-4 text-slate-600">
                            {course.offers.includes(offer) ? "Yes" : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section id="process" className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">How it works</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            From application to admit card in six steps
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((step) => (
            <div key={step.step} className="card p-6">
              <span className="text-xs font-bold tracking-widest text-brand-500">
                {step.step}
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Questions</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <Faq items={FAQS} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="rounded-3xl bg-brand-700 px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to secure your 2026 attempt?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
            Applications for compartment, improvement and essential repeat candidates are
            open. Start now and get your reference number in minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="#programs"
              className="btn bg-white text-brand-700 hover:bg-brand-50 focus-visible:ring-white"
            >
              Start application
            </Link>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-brand-600 text-white ring-1 ring-brand-400 ring-inset hover:bg-brand-500 focus-visible:ring-white"
            >
              Talk to us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

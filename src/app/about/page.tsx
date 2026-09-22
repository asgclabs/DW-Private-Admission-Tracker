import type { Metadata } from "next";
import Link from "next/link";
import { getLiveCourses } from "@/lib/courses";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Doon Winner Academy helps CBSE private candidates through compartment, improvement and essential repeat examinations.",
};

const STATS = [
  { value: "3", label: "Support programs" },
  { value: "2026", label: "Current session" },
  { value: "100%", label: "Form filling assistance" },
];

export const dynamic = "force-dynamic";

export default async function Page() {
  const courses = await getLiveCourses();

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow">About us</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              We help students who have to sit the board exam again
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
              {SITE.name} works with CBSE private candidates — students in compartment,
              improvement and essential repeat categories who no longer have a school guiding
              them through the process.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-slate-600">
          <p>
            A student who fails, or who wants to improve their marks, suddenly finds themselves
            outside the system. The school that used to fill the form is no longer responsible
            for them. Deadlines are announced on a CBSE portal they have never used. The
            categories &mdash; compartment, improvement, essential repeat &mdash; each carry
            their own rules, and picking the wrong one costs an entire year.
          </p>
          <p>
            That gap is what we fill. We explain which category applies to you, complete the
            private candidate form on your behalf, keep you informed of every deadline through
            to the admit card, and give you the notes and mentoring to actually clear the exam
            this time.
          </p>
          <p>
            Every application gets a reference number the moment it is created, so you always
            know where your case stands instead of wondering whether anything is happening.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="card p-6 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-brand-600">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
            Our programs
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            {courses.map((program) => (
              <Link
                key={program.slug}
                href={`/programs/${program.slug}`}
                className="card p-6 transition hover:border-brand-300 hover:shadow-md"
              >
                <p className="text-sm font-bold text-slate-900">{program.shortName}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{program.audience}</p>
                <p className="mt-4 text-lg font-extrabold text-brand-600">
                  &#8377;{program.fee.toLocaleString("en-IN")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">A note on what we are not</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We are an independent guidance service. We are not affiliated with CBSE and we do
            not influence results, marks or board decisions. What we do is make sure your
            application is correct, submitted on time, and that you are prepared for the exam.
          </p>
          <Link href="/contact" className="btn-primary mt-6">
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}

import { CATEGORIES } from "@/lib/content";
import { ProgramFinder, type FinderCourse } from "@/components/program-finder";
import { SectionHeading } from "./section-heading";

const ACCENT: Record<string, { bar: string; chip: string }> = {
  compartment: { bar: "bg-amber-400", chip: "bg-amber-50 text-amber-800" },
  improvement: { bar: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-800" },
  "essential-repeat": { bar: "bg-rose-400", chip: "bg-rose-50 text-rose-800" },
};

export function FinderSection({ courses }: { courses: FinderCourse[] }) {
  return (
    <section id="finder" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      {/* Older links point at /#categories; keep them landing here. */}
      <span id="categories" className="absolute top-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute top-24 left-1/2 h-[26rem] w-[52rem] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <SectionHeading eyebrow="30-second check" title="Which category are you in?">
          CBSE treats compartment, improvement and essential repeat students very differently.
          Answer a few quick questions and we&apos;ll tell you where you stand and which
          program fits.
        </SectionHeading>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-brand-200 via-white to-indigo-200 p-px shadow-2xl shadow-brand-900/10">
            <ProgramFinder courses={courses} className="overflow-hidden rounded-[1.7rem] bg-white" />
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Free, no sign-up &middot; Your answers stay on this page
          </p>
        </div>

        <p className="mt-20 text-center text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          How each category works
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((category) => {
            const accent = ACCENT[category.key];
            return (
              <div
                key={category.key}
                className="reveal flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              >
                <div className={`h-1 ${accent?.bar ?? "bg-brand-400"}`} />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-slate-900">{category.title}</h3>
                  <span
                    className={`mt-2 self-start rounded-full px-2.5 py-1 text-xs font-semibold ${accent?.chip ?? ""}`}
                  >
                    {category.subtitle}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{category.body}</p>
                  <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                    {category.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

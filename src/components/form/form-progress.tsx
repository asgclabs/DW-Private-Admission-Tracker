"use client";

export type SectionProgress = {
  id: string;
  title: string;
  /** Required fields in the section. */
  total: number;
  /** Required fields filled in validly. */
  done: number;
};

function jumpTo(id: string) {
  const section = document.getElementById(`section-${id}`);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  // Put the caret in the section's first empty field so the student can type straight away.
  const empty = [...section.querySelectorAll<HTMLInputElement>("input, select, textarea")].find(
    (el) => el.type !== "hidden" && el.type !== "checkbox" && !el.value,
  );
  (empty ?? section.querySelector<HTMLElement>("input, select, textarea, button"))?.focus({
    preventScroll: true,
  });
}

export function FormProgress({ sections }: { sections: SectionProgress[] }) {
  const tracked = sections.filter((section) => section.total > 0);
  const total = tracked.reduce((sum, section) => sum + section.total, 0);
  const done = tracked.reduce((sum, section) => sum + section.done, 0);
  const percent = total === 0 ? 100 : Math.round((done / total) * 100);
  const complete = done === total;

  return (
    <div className="sticky top-16 z-20 -mx-6 -mt-6 mb-2 rounded-t-2xl border-b border-slate-100 bg-white/95 px-6 pt-5 pb-4 backdrop-blur sm:-mx-8 sm:-mt-8 sm:px-8">
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="font-semibold text-slate-700" aria-live="polite">
          {complete ? (
            <span className="text-emerald-700">All required details done &mdash; review and pay</span>
          ) : (
            <>
              {done} of {total} required details done
            </>
          )}
        </p>
        <span className={`font-bold ${complete ? "text-emerald-600" : "text-brand-600"}`}>
          {percent}%
        </span>
      </div>

      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Application progress"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            complete ? "bg-emerald-500" : "bg-brand-600"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <nav aria-label="Form sections" className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {sections.map((section) => {
          const sectionDone = section.total > 0 && section.done === section.total;
          const optional = section.total === 0;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => jumpTo(section.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                sectionDone
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : optional
                    ? "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                    : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-brand-400"
              }`}
            >
              {sectionDone ? (
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                !optional && (
                  <span className="text-slate-400">
                    {section.done}/{section.total}
                  </span>
                )
              )}
              {section.title}
              {optional && <span className="font-normal text-slate-400">optional</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

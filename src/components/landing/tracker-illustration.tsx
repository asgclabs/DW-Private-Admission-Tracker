import { BellIcon, CheckCircleIcon } from "@/components/icons";

const STEPS = [
  { label: "Payment received", note: "Reference number issued", state: "done" },
  { label: "Under review", note: "Documents checked by our team", state: "done" },
  { label: "CBSE form submitted", note: "Filled in the right category", state: "current" },
  { label: "Admit card issued", note: "We share the details", state: "next" },
  { label: "Completed", note: "Exam day guidance", state: "next" },
] as const;

/**
 * A picture of the product rather than a stock photo: what a student's tracker
 * looks like mid-way through. It is an illustration, labelled "Example", and
 * uses no real student's data.
 */
export function TrackerIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      {/* soft glow behind the card */}
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-300/40 via-indigo-300/30 to-sky-200/40 blur-2xl" />

      <div className="relative rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl shadow-brand-900/10 ring-1 ring-slate-900/5 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              Application tracker
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">DWCI-26-7K2M9P</p>
            <p className="text-xs text-slate-500">Circle 4.0 &middot; Class 12th</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Example
          </span>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-500" />
        </div>

        <ol className="mt-5 space-y-0">
          {STEPS.map((step, index) => (
            <li key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                {step.state === "done" ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                ) : step.state === "current" ? (
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/60 motion-reduce:animate-none" />
                    <span className="relative h-6 w-6 rounded-full border-[6px] border-brand-600 bg-white" />
                  </span>
                ) : (
                  <span className="h-6 w-6 rounded-full border-2 border-slate-200 bg-white" />
                )}
                {index < STEPS.length - 1 && (
                  <span
                    className={`w-0.5 flex-1 ${step.state === "done" ? "bg-emerald-300" : "bg-slate-200"}`}
                  />
                )}
              </div>
              <div className="pb-4">
                <p
                  className={`text-sm font-semibold ${
                    step.state === "next" ? "text-slate-400" : "text-slate-900"
                  }`}
                >
                  {step.label}
                  {step.state === "current" && (
                    <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                      In progress
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">{step.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* floating chips — hidden on small screens where they would overflow */}
      <div className="landing-float absolute -top-14 left-4 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl ring-1 ring-slate-900/5 sm:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircleIcon className="h-4 w-4" />
        </span>
        <span className="text-xs leading-tight">
          <span className="block font-bold text-slate-900">Form filled for you</span>
          <span className="text-slate-500">Right category, first time</span>
        </span>
      </div>

      <div className="landing-float-delayed absolute -right-8 -bottom-6 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl ring-1 ring-slate-900/5 sm:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <BellIcon className="h-4 w-4" />
        </span>
        <span className="text-xs leading-tight">
          <span className="block font-bold text-slate-900">Deadline reminders</span>
          <span className="text-slate-500">So nothing is missed</span>
        </span>
      </div>
    </div>
  );
}

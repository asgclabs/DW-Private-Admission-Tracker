import Link from "next/link";
import { PROCESS_STEPS } from "@/lib/content";
import { SectionHeading } from "./section-heading";

export function HowItWorks() {
  return (
    <section id="process" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="How it works"
              title="From application to admit card in seven steps"
              align="left"
            >
              You spend about three minutes on the form. We handle the rest and keep you posted
              at every step.
            </SectionHeading>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#finder" className="btn-primary">
                Start with the 30-second check
              </Link>
              <Link href="/track" className="btn-secondary">
                Track an application
              </Link>
            </div>
          </div>
        </div>

        <ol className="relative lg:col-span-7">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.step} className="reveal relative flex gap-5 pb-10 last:pb-0">
              {index < PROCESS_STEPS.length - 1 && (
                <span
                  className="absolute top-12 bottom-0 left-6 w-px bg-gradient-to-b from-brand-300 to-slate-200"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white font-display text-sm font-extrabold text-brand-700 shadow-md ring-1 ring-brand-100">
                {step.step}
              </span>
              <div className="pt-2.5">
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

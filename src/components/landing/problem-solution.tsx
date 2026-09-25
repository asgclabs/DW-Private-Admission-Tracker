import type { ComponentType } from "react";
import {
  AcademicCapIcon,
  AlertIcon,
  BellIcon,
  CalendarIcon,
  DocumentIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import { SectionHeading } from "./section-heading";

type Icon = ComponentType<{ className?: string }>;

/** What makes being a private candidate hard — in the student's own terms. */
const PAINS: { icon: Icon; title: string; body: string }[] = [
  {
    icon: DocumentIcon,
    title: "No school to fill your form",
    body: "Once you are a private candidate, your old school is no longer responsible for your CBSE form. It is on you.",
  },
  {
    icon: CalendarIcon,
    title: "Deadlines on an unfamiliar portal",
    body: "Dates are announced on a CBSE portal you have probably never used. Miss the window and you wait a whole year.",
  },
  {
    icon: AlertIcon,
    title: "The wrong category costs a year",
    body: "Compartment, improvement and essential repeat each follow different rules. Pick the wrong one and it can cost you the attempt.",
  },
];

/** What the programs actually include (see each course's offer list). */
const FEATURES: { icon: Icon; title: string; body: string; tone: string }[] = [
  {
    icon: DocumentIcon,
    title: "We fill your CBSE form",
    body: "Our team completes your private-candidate form in the right category and confirms it with you.",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: BellIcon,
    title: "Never miss a date",
    body: "Timely updates on the form window, admit cards and exams, so nothing slips past you.",
    tone: "bg-amber-50 text-amber-600",
  },
  {
    icon: AcademicCapIcon,
    title: "Notes, practice & mentorship",
    body: "Subject-wise notes, practice papers, board exam guidance and personal mentorship with Focus 4.0.",
    tone: "bg-violet-50 text-violet-600",
  },
  {
    icon: UsersIcon,
    title: "A community that gets it",
    body: "An exclusive online group of students in the same situation, plus regular meetings with us.",
    tone: "bg-sky-50 text-sky-600",
  },
  {
    icon: SearchIcon,
    title: "No guesswork",
    body: "Not sure where you stand? Our 30-second check tells you your category and the right program.",
    tone: "bg-rose-50 text-rose-600",
  },
  {
    icon: ShieldIcon,
    title: "Safe, simple payment",
    body: "One-time fee through Razorpay with UPI, cards or net banking, and a reference number instantly.",
    tone: "bg-emerald-50 text-emerald-600",
  },
];

export function ProblemSolution() {
  return (
    <section className="relative border-y border-slate-200/70 bg-slate-50 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Why students come to us" title="Being a private candidate is confusing.">
          Nobody hands you a checklist after a compartment, a fail or a decision to improve.
          These are the three things that trip most students up.
        </SectionHeading>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PAINS.map((pain) => (
            <div
              key={pain.title}
              className="reveal flex gap-4 rounded-2xl border border-slate-200 bg-white/70 p-5 sm:p-6 md:block"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <pain.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 md:mt-4">{pain.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 md:mt-2">{pain.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="my-14 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300" />
          <span className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-lg shadow-brand-600/20">
            So we take it off your plate
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="reveal group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:block sm:p-6"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feature.tone}`}>
                <feature.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 sm:mt-4">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:mt-2">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Price } from "@/components/price";

export type FinderCourse = {
  slug: string;
  shortName: string;
  fee: number;
  originalFee: number | null;
  tagline: string;
};

type StudentClass = "Class 12th" | "Class 10th";
type Result = "passed" | "failed";
type Failed = "1" | "2" | "3+";
type Support = "form" | "full";
type Category = "IMPROVEMENT" | "COMPARTMENT" | "ESSENTIAL_REPEAT";

type Answers = {
  studentClass?: StudentClass;
  result?: Result;
  failed?: Failed;
  support?: Support;
};

type StepKey = keyof Answers;

type Option<T extends string> = { value: T; label: string; hint?: string };

const STEPS: Record<StepKey, { question: string; options: Option<string>[] }> = {
  studentClass: {
    question: "Which board exam is this for?",
    options: [
      { value: "Class 12th", label: "Class 12th", hint: "Senior secondary" },
      { value: "Class 10th", label: "Class 10th", hint: "Secondary" },
    ],
  },
  result: {
    question: "What did your last result say?",
    options: [
      { value: "passed", label: "I passed", hint: "But I want better marks" },
      { value: "failed", label: "I didn't clear every subject", hint: "Compartment, fail or ER" },
    ],
  },
  failed: {
    question: "How many subjects didn't you clear?",
    options: [
      { value: "1", label: "One subject" },
      { value: "2", label: "Two subjects" },
      { value: "3+", label: "Three or more" },
    ],
  },
  support: {
    question: "How much help do you want?",
    options: [
      {
        value: "form",
        label: "Just get my form filled right",
        hint: "Form filling, admit card & exam updates",
      },
      {
        value: "full",
        label: "Full preparation too",
        hint: "Notes, mentorship, meetings & practice papers",
      },
    ],
  },
};

/** The questions still relevant for the answers so far, in order. */
function stepsFor(answers: Answers): StepKey[] {
  const steps: StepKey[] = ["studentClass", "result"];
  if (answers.result === "failed") steps.push("failed");
  steps.push("support");
  return steps;
}

/**
 * CBSE places Class 10 candidates who fail up to two subjects in compartment
 * (supplementary); for Class 12 the limit is one. Beyond that the result is
 * Essential Repeat.
 */
function categoryFor(answers: Answers): Category {
  if (answers.result === "passed") return "IMPROVEMENT";
  const limit = answers.studentClass === "Class 10th" ? 2 : 1;
  const failed = answers.failed === "3+" ? 3 : Number(answers.failed);
  return failed <= limit ? "COMPARTMENT" : "ESSENTIAL_REPEAT";
}

const CATEGORY_COPY: Record<Category, { title: string; body: string }> = {
  IMPROVEMENT: {
    title: "Improvement",
    body: "You re-appear as a private candidate in the subjects you want to improve, and the better of your two scores counts.",
  },
  COMPARTMENT: {
    title: "Compartment",
    body: "You only re-appear in the subject(s) you didn't clear, in the compartment (supplementary) exam. The rest of your result stands.",
  },
  ESSENTIAL_REPEAT: {
    title: "Essential Repeat (ER)",
    body: "CBSE marks the result Essential Repeat, so you appear again in all subjects in the next annual board exam.",
  },
};

function recommendationFor(answers: Answers, category: Category) {
  const focus = category === "IMPROVEMENT" ? "focus-improvement" : "focus-er";
  return answers.support === "form"
    ? { primary: "circle", alternative: focus }
    : { primary: focus, alternative: "circle" };
}

export function ProgramFinder({
  courses,
  className = "card overflow-hidden",
}: {
  courses: FinderCourse[];
  /** Container styling, so a page can frame the finder its own way. */
  className?: string;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);

  const steps = stepsFor(answers);
  const current = steps.find((key) => answers[key] === undefined);
  const done = current === undefined;
  const answeredCount = steps.filter((key) => answers[key] !== undefined).length;
  const progress = Math.round((answeredCount / steps.length) * 100);

  // Move focus to each new question (or the result) so keyboard and
  // screen-reader users follow along — but not on first render.
  useEffect(() => {
    if (touched.current) headingRef.current?.focus();
  }, [current, done]);

  function choose(key: StepKey, value: string) {
    touched.current = true;
    setAnswers((prev) => {
      const next = { ...prev, [key]: value } as Answers;
      // Changing the result from "failed" to "passed" makes the count irrelevant.
      if (key === "result" && value === "passed") delete next.failed;
      return next;
    });
  }

  function back() {
    touched.current = true;
    const answered = steps.filter((key) => answers[key] !== undefined);
    const last = answered[answered.length - 1];
    if (!last) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[last];
      return next;
    });
  }

  function restart() {
    touched.current = true;
    setAnswers({});
  }

  const bySlug = new Map(courses.map((course) => [course.slug, course]));

  return (
    <div className={className}>
      <div className="h-1.5 bg-slate-100" aria-hidden="true">
        <div
          className="h-full bg-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${done ? 100 : progress}%` }}
        />
      </div>

      <div className="p-6 sm:p-10" aria-live="polite">
        {!done && current ? (
          <div key={current} className="finder-step">
            <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
              Question {answeredCount + 1} of {steps.length}
            </p>
            <h3
              ref={headingRef}
              tabIndex={-1}
              className="mt-2 text-lg font-bold text-slate-900 outline-none sm:text-xl"
            >
              {STEPS[current].question}
            </h3>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {STEPS[current].options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => choose(current, option.value)}
                  className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                    <span
                      aria-hidden="true"
                      className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
                    >
                      &rarr;
                    </span>
                  </span>
                  {option.hint && (
                    <span className="mt-1 block text-xs text-slate-500">{option.hint}</span>
                  )}
                </button>
              ))}
            </div>

            {answeredCount > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-6 text-xs font-medium text-slate-500 hover:text-brand-600"
              >
                &larr; Back
              </button>
            )}
          </div>
        ) : (
          <FinderResult
            answers={answers}
            bySlug={bySlug}
            headingRef={headingRef}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}

function FinderResult({
  answers,
  bySlug,
  headingRef,
  onRestart,
}: {
  answers: Answers;
  bySlug: Map<string, FinderCourse>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const category = categoryFor(answers);
  const copy = CATEGORY_COPY[category];
  const { primary, alternative } = recommendationFor(answers, category);
  const primaryCourse = bySlug.get(primary);
  const alternativeCourse = bySlug.get(alternative);

  // Carry the answers into the form so the student doesn't answer twice.
  const prefill = new URLSearchParams({
    category,
    class: answers.studentClass ?? "",
  }).toString();

  return (
    <div className="finder-step">
      <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
        Your result
      </p>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-lg font-bold text-slate-900 outline-none sm:text-xl"
      >
        You fall in the <span className="text-brand-700">{copy.title}</span> category
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.body}</p>

      {primaryCourse ? (
        <div className="mt-6 rounded-xl border-2 border-brand-500 bg-brand-50/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="badge bg-brand-600 text-white ring-brand-600">Recommended</span>
              <p className="mt-2 text-base font-bold text-slate-900">
                {primaryCourse.shortName}
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-600">{primaryCourse.tagline}</p>
            </div>
            <Price fee={primaryCourse.fee} originalFee={primaryCourse.originalFee} size="md" />
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href={`/apply/${primaryCourse.slug}?${prefill}`} className="btn-primary">
              Apply for {primaryCourse.shortName}
            </Link>
            <Link href={`/programs/${primaryCourse.slug}`} className="btn-secondary">
              See what&apos;s included
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          That program isn&apos;t open right now.{" "}
          <Link href="#programs" className="font-semibold underline">
            See the programs that are
          </Link>
          .
        </p>
      )}

      {alternativeCourse && (
        <p className="mt-4 text-sm text-slate-600">
          {answers.support === "form" ? "Want notes and mentorship too? " : "Only need the form filled? "}
          <Link
            href={`/apply/${alternativeCourse.slug}?${prefill}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {alternativeCourse.shortName} (&#8377;{alternativeCourse.fee.toLocaleString("en-IN")})
          </Link>{" "}
          covers that.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          This is a guide. The status on your CBSE mark sheet is final.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

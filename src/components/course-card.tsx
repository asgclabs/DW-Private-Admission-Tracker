import Link from "next/link";
import { SavingBadge, rupees } from "@/components/price";
import { accentClasses, type CourseView } from "@/lib/course-view";

/** Enough to compare at a glance; the full list lives on the program page. */
const VISIBLE_OFFERS = 6;

export function CourseCard({ course }: { course: CourseView }) {
  const accent = accentClasses(course.accent);
  const visible = course.offers.slice(0, VISIBLE_OFFERS);
  const hidden = course.offers.length - visible.length;

  return (
    <div
      className={`reveal relative flex flex-col rounded-3xl bg-white transition duration-300 hover:-translate-y-1 ${
        course.isFeatured
          ? "order-first mt-3 shadow-2xl shadow-brand-900/15 ring-2 ring-brand-600 lg:order-none lg:-my-4"
          : "shadow-sm ring-1 ring-slate-200 hover:shadow-xl"
      }`}
    >
      {course.isFeatured && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap text-white uppercase shadow-lg shadow-brand-600/30">
          Most popular
        </span>
      )}

      {!course.isFeatured && <div className={`h-1.5 w-full rounded-t-3xl ${accent.bar}`} />}

      <div className={`flex flex-1 flex-col p-7 sm:p-8 ${course.isFeatured ? "pt-9 sm:pt-10" : ""}`}>
        <h3 className="text-xl font-bold text-slate-900">{course.shortName}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{course.tagline}</p>

        {course.originalFee !== null && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <del className="text-lg font-semibold text-slate-400 decoration-rose-500/70 decoration-2">
              <span className="sr-only">Original price </span>
              {rupees(course.originalFee)}
            </del>
            <SavingBadge fee={course.fee} originalFee={course.originalFee} />
          </div>
        )}
        <div className={`${course.originalFee !== null ? "mt-1" : "mt-6"} flex items-end gap-2`}>
          <span className="font-display text-5xl font-extrabold tracking-tight text-slate-900">
            {rupees(course.fee)}
          </span>
          <span className="pb-1.5 text-sm text-slate-500">one-time fee</span>
        </div>

        <span className={`badge mt-4 self-start ${accent.chip}`}>{course.audience}</span>

        <Link
          href={`/apply/${course.slug}`}
          className={`${course.isFeatured ? "btn-primary shadow-lg shadow-brand-600/25" : "btn-secondary"} mt-7 w-full`}
        >
          Apply for {course.shortName}
        </Link>

        <div className="mt-7 border-t border-slate-100 pt-6">
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">What you get</p>
          <ul className="mt-4 space-y-3">
            {visible.map((offer) => (
              <li key={offer} className="flex gap-2.5 text-sm text-slate-700">
                <svg
                  className={`mt-0.5 h-4 w-4 shrink-0 ${accent.check}`}
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
                <span>{offer}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/programs/${course.slug}`}
            className="mt-5 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {hidden > 0 ? `+ ${hidden} more included` : "View full details"}
            <span aria-hidden="true" className="ml-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

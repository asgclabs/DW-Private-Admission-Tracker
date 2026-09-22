import Link from "next/link";
import { accentClasses, type CourseView } from "@/lib/course-view";

export function CourseCard({ course }: { course: CourseView }) {
  const accent = accentClasses(course.accent);

  return (
    <div
      className={`card relative flex flex-col overflow-hidden transition hover:shadow-md ${accent.border} ${
        course.isFeatured ? "ring-2 ring-brand-500" : ""
      }`}
    >
      <div className={`h-1.5 w-full ${accent.bar}`} />

      {course.isFeatured && (
        <span className="absolute top-5 right-5 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
          Most popular
        </span>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="pr-24 text-lg font-bold text-slate-900">{course.shortName}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{course.tagline}</p>

        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            &#8377;{course.fee.toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-slate-500">one time</span>
        </div>

        <span className={`badge mt-4 self-start ${accent.chip}`}>{course.audience}</span>

        <ul className="mt-6 space-y-3">
          {course.offers.map((offer) => (
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

        <div className="mt-7 flex flex-col gap-2 pt-1">
          <Link href={`/apply/${course.slug}`} className="btn-primary w-full">
            Apply for {course.shortName}
          </Link>
          <Link
            href={`/programs/${course.slug}`}
            className="text-center text-xs font-medium text-slate-500 hover:text-brand-600"
          >
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}

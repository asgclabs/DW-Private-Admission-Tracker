import Link from "next/link";
import type { CourseView } from "@/lib/course-view";

const DASH = "—";

type Cell = { value: string; plain: boolean } | null;

/**
 * Builds the table's rows from the live courses. Row order is first-seen order
 * across courses, so a course only needs to list the rows it cares about, and
 * a row one course lacks simply shows a dash for it.
 */
function buildRows(courses: CourseView[]) {
  const labels: string[] = [];
  for (const course of courses) {
    for (const row of course.comparison) {
      if (!labels.includes(row.label)) labels.push(row.label);
    }
  }

  return labels.map((label) => ({
    label,
    cells: courses.map((course): Cell => {
      const row = course.comparison.find((r) => r.label === label);
      return row ? { value: row.value, plain: Boolean(row.plain) } : null;
    }),
  }));
}

/**
 * Before any course has comparison rows (e.g. a database that predates this
 * table) fall back to comparing the offer lists, so the table never renders
 * empty.
 */
function buildFallbackRows(courses: CourseView[]) {
  const offers = Array.from(new Set(courses.flatMap((course) => course.offers)));

  return [
    {
      label: "Who it is for",
      cells: courses.map((course): Cell => ({ value: course.audience, plain: true })),
    },
    ...offers.map((offer) => ({
      label: offer,
      cells: courses.map(
        (course): Cell => ({
          value: course.offers.includes(offer) ? "Yes" : DASH,
          plain: false,
        }),
      ),
    })),
  ];
}

function CellContent({ cell }: { cell: Cell }) {
  if (!cell || !cell.value || cell.value === DASH) {
    return <span className="text-slate-300">{DASH}</span>;
  }

  if (cell.plain) {
    return <span className="text-slate-600">{cell.value}</span>;
  }

  return (
    <span className="inline-flex items-start gap-1.5 font-medium text-slate-800">
      <span aria-hidden="true" className="text-emerald-600">
        &#10003;
      </span>
      {cell.value}
    </span>
  );
}

export function ComparisonTable({ courses }: { courses: CourseView[] }) {
  if (courses.length < 2) return null;

  const hasRows = courses.some((course) => course.comparison.length > 0);
  const rows = hasRows ? buildRows(courses) : buildFallbackRows(courses);

  // The label column stays pinned while the course columns scroll sideways
  // on a phone; it needs a solid background so scrolled cells pass beneath it.
  const labelCell =
    "sticky left-0 z-10 bg-white px-4 py-4 font-medium text-slate-700 shadow-[1px_0_0_0_var(--color-slate-100)] group-hover:bg-slate-50 sm:px-6";
  const col = (featured: boolean) =>
    `px-4 py-4 align-top sm:px-6 ${featured ? "bg-brand-50/50" : ""}`;

  return (
    <div className="card mt-12 overflow-hidden">
      <p className="border-b border-slate-100 px-4 py-2 text-center text-[11px] text-slate-400 sm:hidden">
        Swipe sideways to compare &rarr;
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="sticky left-0 z-10 w-[28%] bg-slate-50 px-4 py-4 font-semibold sm:px-6">
                Compare
              </th>
              {courses.map((course) => (
                <th
                  key={course.id}
                  className={`px-4 py-4 font-semibold sm:px-6 ${course.isFeatured ? "bg-brand-50 text-brand-700" : "bg-slate-50"}`}
                >
                  {course.shortName}
                  {course.isFeatured && (
                    <span className="mt-1 block text-[10px] font-bold tracking-wide text-brand-600">
                      Most popular
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="group transition-colors hover:bg-slate-50">
              <td className={labelCell}>Fee</td>
              {courses.map((course) => (
                <td key={course.id} className={`${col(course.isFeatured)} text-base font-bold text-slate-900`}>
                  &#8377;{course.fee.toLocaleString("en-IN")}
                </td>
              ))}
            </tr>
            {rows.map((row) => (
              <tr key={row.label} className="group transition-colors hover:bg-slate-50">
                <td className={labelCell}>{row.label}</td>
                {row.cells.map((cell, index) => (
                  <td key={courses[index].id} className={col(courses[index].isFeatured)}>
                    <CellContent cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 z-10 bg-white px-4 py-5 sm:px-6" />
              {courses.map((course) => (
                <td key={course.id} className={`${col(course.isFeatured)} py-5`}>
                  <Link
                    href={`/apply/${course.slug}`}
                    className={`${course.isFeatured ? "btn-primary" : "btn-secondary"} w-full px-3 py-2 text-xs`}
                  >
                    Apply &middot; &#8377;{course.fee.toLocaleString("en-IN")}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

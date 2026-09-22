import Link from "next/link";
import { PAYMENT_TONE, STATUS_TONE, statusLabel, type StatusKey } from "@/lib/status";
import type { GroupedApplicationRow } from "@/lib/application-query";

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CourseApplicationGroup({
  courseName,
  courseSlug,
  count,
  docs,
  filteredHref,
  unmatched = false,
}: {
  courseName: string;
  courseSlug: string;
  count: number;
  docs: GroupedApplicationRow[];
  /** Link back to the flat table, pre-filtered to just this course. */
  filteredHref: string;
  /** True when the course document behind this slug no longer exists. */
  unmatched?: boolean;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-900">{courseName}</h2>
          <span className="badge bg-brand-50 text-brand-700 ring-brand-200">
            {count.toLocaleString("en-IN")} {count === 1 ? "application" : "applications"}
          </span>
          {unmatched && (
            <span className="badge bg-amber-50 text-amber-700 ring-amber-200">
              Course deleted
            </span>
          )}
        </div>
        {count > 0 && (
          <Link href={filteredHref} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all &rarr;
          </Link>
        )}
      </div>

      {docs.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">
          No applications yet for {courseSlug ? `/apply/${courseSlug}` : "this course"}.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {docs.map((doc) => (
            <Link
              key={String(doc._id)}
              href={`/admin/applications/${String(doc._id)}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{doc.fullName}</p>
                <p className="text-xs text-slate-500">
                  {doc.phone} &middot;{" "}
                  <span className="font-mono">{doc.referenceNo}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${STATUS_TONE[doc.status as StatusKey]}`}>
                  {statusLabel(doc.status)}
                </span>
                <span className={`badge ${PAYMENT_TONE[doc.paymentStatus] ?? ""}`}>
                  {doc.paymentStatus}
                </span>
                <span className="text-xs text-slate-400">{formatDate(doc.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {count > docs.length && (
        <div className="border-t border-slate-100 px-5 py-3 text-center">
          <Link href={filteredHref} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all {count.toLocaleString("en-IN")} &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}

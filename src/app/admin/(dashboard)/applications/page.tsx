import Link from "next/link";
import { applications } from "@/lib/mongodb";
import { getAllCourses } from "@/lib/courses";
import {
  buildApplicationFilter,
  buildGroupedApplicationsPipeline,
  type CourseGroup,
} from "@/lib/application-query";
import { PAYMENT_TONE, STATUS_LABELS, STATUS_TONE, statusLabel, type StatusKey } from "@/lib/status";
import { AdminFilters } from "@/components/admin/admin-filters";
import { CourseApplicationGroup } from "@/components/admin/course-application-group";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const PER_COURSE_LIMIT = 8;

type SearchParams = {
  q?: string;
  program?: string;
  status?: string;
  payment?: string;
  page?: string;
  view?: string;
};

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Builds a filter query string, carrying q/program/status/payment across a view switch. */
function paramsForView(params: SearchParams, view: "table" | "grouped"): string {
  const query = new URLSearchParams();
  for (const key of ["q", "program", "status", "payment"] as const) {
    const value = params[key];
    if (value) query.set(key, value);
  }
  if (view === "grouped") query.set("view", "grouped");
  return query.toString();
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const isGrouped = params.view === "grouped";
  const page = Math.max(1, Number(params.page) || 1);
  const filter = buildApplicationFilter(params);

  const col = await applications();
  const courses = await getAllCourses();

  const total = await col.countDocuments(filter);

  const query = new URLSearchParams(
    Object.entries(params).filter(([key, value]) => key !== "page" && value) as [string, string][],
  ).toString();

  const tableHref = `/admin/applications${paramsForView(params, "table") ? `?${paramsForView(params, "table")}` : ""}`;
  const groupedHref = `/admin/applications?${paramsForView(params, "grouped")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total.toLocaleString("en-IN")} matching {total === 1 ? "record" : "records"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <Link
              href={tableHref}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                !isGrouped ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Table
            </Link>
            <Link
              href={groupedHref}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                isGrouped ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              By Course
            </Link>
          </div>
          <a
            href={`/api/admin/export?${query}`}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 ring-inset hover:bg-slate-50"
          >
            Export CSV
          </a>
        </div>
      </div>

      <AdminFilters
        programs={courses.map((c) => ({ value: c.slug, label: c.shortName }))}
        statuses={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        defaults={{
          q: params.q ?? "",
          program: params.program ?? "",
          status: params.status ?? "",
          payment: params.payment ?? "",
          view: params.view ?? "",
        }}
      />

      {isGrouped ? (
        <GroupedByCourseView
          filter={filter}
          params={params}
          courses={courses}
        />
      ) : (
        <TableView
          filter={filter}
          page={page}
          total={total}
          query={query}
        />
      )}
    </div>
  );
}

async function TableView({
  filter,
  page,
  total,
  query,
}: {
  filter: ReturnType<typeof buildApplicationFilter>;
  page: number;
  total: number;
  query: string;
}) {
  const col = await applications();
  const docs = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Reference</th>
              <th className="px-5 py-3.5 font-semibold">Student</th>
              <th className="px-5 py-3.5 font-semibold">Program</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Payment</th>
              <th className="px-5 py-3.5 font-semibold">Applied</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                  No applications match these filters.
                </td>
              </tr>
            )}
            {docs.map((application) => (
              <tr key={String(application._id)} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/applications/${String(application._id)}`}
                    className="font-mono text-xs font-semibold text-brand-600 hover:underline"
                  >
                    {application.referenceNo}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{application.fullName}</p>
                  <p className="text-xs text-slate-500">{application.phone}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{application.courseName}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUS_TONE[application.status as StatusKey]}`}>
                    {statusLabel(application.status)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${PAYMENT_TONE[application.paymentStatus] ?? ""}`}>
                    {application.paymentStatus}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDate(application.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/applications?${query}&page=${page - 1}`}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/applications?${query}&page=${page + 1}`}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

async function GroupedByCourseView({
  filter,
  params,
  courses,
}: {
  filter: ReturnType<typeof buildApplicationFilter>;
  params: SearchParams;
  courses: Awaited<ReturnType<typeof getAllCourses>>;
}) {
  const col = await applications();
  const groups = await col
    .aggregate<CourseGroup>(buildGroupedApplicationsPipeline(filter, PER_COURSE_LIMIT))
    .toArray();

  const groupById = new Map(groups.map((g) => [String(g._id), g]));
  const matchedIds = new Set<string>();

  // Every current course gets a section, even with zero matching applications,
  // so the admin sees the full roster at a glance — not just courses with hits.
  const sections = courses.map((course) => {
    const group = groupById.get(course.id);
    if (group) matchedIds.add(course.id);
    return {
      key: course.id,
      courseName: course.shortName,
      courseSlug: course.slug,
      count: group?.count ?? 0,
      docs: group?.docs ?? [],
      unmatched: false,
    };
  });

  // A course can only be deleted once it has zero applications (enforced in
  // the delete route), so this should never fire in normal use — but the
  // course snapshot on each application exists precisely to survive it if
  // that guard is ever loosened or data arrives some other way.
  for (const group of groups) {
    const id = String(group._id);
    if (!matchedIds.has(id)) {
      sections.push({
        key: id,
        courseName: group.courseName || "Unknown course",
        courseSlug: group.courseSlug || "",
        count: group.count,
        docs: group.docs,
        unmatched: true,
      });
    }
  }

  if (sections.every((s) => s.count === 0) && courses.length === 0) {
    return (
      <div className="card p-12 text-center text-sm text-slate-500">No courses yet.</div>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section) => {
        const filteredQuery = new URLSearchParams();
        for (const key of ["q", "status", "payment"] as const) {
          const value = params[key];
          if (value) filteredQuery.set(key, value);
        }
        if (section.courseSlug) filteredQuery.set("program", section.courseSlug);

        return (
          <CourseApplicationGroup
            key={section.key}
            courseName={section.courseName}
            courseSlug={section.courseSlug}
            count={section.count}
            docs={section.docs}
            unmatched={section.unmatched}
            filteredHref={`/admin/applications?${filteredQuery.toString()}`}
          />
        );
      })}
    </div>
  );
}

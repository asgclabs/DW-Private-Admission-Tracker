import Link from "next/link";
import { redirect } from "next/navigation";
import { applications, courses } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth";
import { CourseRow } from "@/components/admin/course-row";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await requireSuperAdmin();
  if (!session) redirect("/admin");

  const col = await courses();
  const docs = await col.find({}).sort({ sortOrder: 1, createdAt: 1 }).toArray();

  // One grouped count instead of a query per course.
  const appCol = await applications();
  const counts = await appCol
    .aggregate<{ _id: string; count: number }>([
      { $group: { _id: { $toString: "$courseId" }, count: { $sum: 1 } } },
    ])
    .toArray();

  const countBySlug = new Map(counts.map((c) => [c._id, c.count]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a course here and it appears on the website immediately.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary px-4 py-2.5 text-sm">
          New course
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-medium text-slate-700">No courses yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Create your first course to start taking applications.
          </p>
          <Link href="/admin/courses/new" className="btn-primary mt-6">
            New course
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((course) => (
            <CourseRow
              key={String(course._id)}
              course={{
                id: String(course._id),
                slug: course.slug,
                shortName: course.shortName,
                tagline: course.tagline,
                fee: course.fee,
                originalFee: course.originalFee ?? null,
                isActive: course.isActive,
                isFeatured: course.isFeatured,
                sortOrder: course.sortOrder,
                fieldCount: (course.catalogFields ?? []).length,
                applicationCount: countBySlug.get(String(course._id)) ?? 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

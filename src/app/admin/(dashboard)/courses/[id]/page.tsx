import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { applications } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth";
import { getCourseById } from "@/lib/courses";
import { CourseEditor } from "@/components/admin/course-editor";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSuperAdmin();
  if (!session) redirect("/admin");

  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();

  const appCol = await applications();
  const count = await appCol.countDocuments({ courseId: new ObjectId(id) });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-xs text-slate-500 hover:text-brand-600">
          &larr; Back to courses
        </Link>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
          {course.shortName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {count} application{count === 1 ? "" : "s"} so far.
          {count > 0 &&
            " Changing the fee only affects new applications — existing records keep what they paid."}
        </p>
      </div>

      <CourseEditor course={course} />
    </div>
  );
}

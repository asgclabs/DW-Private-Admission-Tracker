import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { CourseEditor } from "@/components/admin/course-editor";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const session = await requireSuperAdmin();
  if (!session) redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-xs text-slate-500 hover:text-brand-600">
          &larr; Back to courses
        </Link>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900">New course</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill this in and turn it on — it goes live on the website straight away.
        </p>
      </div>

      <CourseEditor />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  slug: string;
  shortName: string;
  tagline: string;
  fee: number;
  originalFee: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  fieldCount: number;
  applicationCount: number;
};

export function CourseRow({ course }: { course: Row }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(course.isActive);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function toggleLive() {
    const next = !isActive;
    setIsActive(next);
    setError(null);

    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });

    if (!res.ok) {
      setIsActive(!next);
      const payload = await res.json().catch(() => ({}));
      setError(payload.message ?? "Could not update.");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function remove() {
    setError(null);
    const res = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.message ?? "Could not delete.");
      setConfirmDelete(false);
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">{course.shortName}</h2>
            <span
              className={`badge ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-100 text-slate-600 ring-slate-200"
              }`}
            >
              {isActive ? "Live" : "Draft"}
            </span>
            {course.isFeatured && (
              <span className="badge bg-brand-50 text-brand-700 ring-brand-200">
                Most popular
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm text-slate-600">{course.tagline}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              &#8377;{course.fee.toLocaleString("en-IN")}
              {course.originalFee !== null && course.originalFee > course.fee && (
                <del className="ml-1.5 font-normal text-slate-400">
                  &#8377;{course.originalFee.toLocaleString("en-IN")}
                </del>
              )}
            </span>
            <span>/apply/{course.slug}</span>
            <span>{course.fieldCount} extra fields</span>
            <span>
              {course.applicationCount} application{course.applicationCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleLive}
            disabled={pending}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              isActive
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isActive ? "Turn off" : "Go live"}
          </button>

          <Link
            href={`/admin/courses/${course.id}`}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Edit
          </Link>

          {isActive && (
            <Link
              href={`/apply/${course.slug}`}
              target="_blank"
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              View
            </Link>
          )}

          {confirmDelete ? (
            <>
              <button
                type="button"
                onClick={remove}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

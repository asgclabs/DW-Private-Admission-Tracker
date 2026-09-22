"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/** Inline "publish a notice" panel on the dashboard — the fuller manager
 * (pin, hide, delete existing notices) lives at /admin/notifications. */
export function QuickNotification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(data.get("title") ?? ""),
          body: String(data.get("body") ?? ""),
          isPinned: false,
          isActive: true,
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload.message ?? "Could not publish.");
        return;
      }

      setSuccess("Notification published to the website.");
      form.reset();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          <p className="mt-1 text-xs text-slate-500">Publish notices for students.</p>
        </div>
        <Link href="/admin/notifications" className="text-xs font-medium text-brand-600 hover:text-brand-700">
          View all &rarr;
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="qn-title" className="label">
            Title
          </label>
          <input id="qn-title" name="title" required placeholder="CBSE form window opens 1 October" className="input" />
        </div>
        <div>
          <label htmlFor="qn-body" className="label">
            Message
          </label>
          <textarea id="qn-body" name="body" rows={3} required className="input" />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </p>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 text-sm">
            {loading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}

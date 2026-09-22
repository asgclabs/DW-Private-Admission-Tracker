"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
};

export function NotificationManager({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(data.get("title") ?? ""),
          body: String(data.get("body") ?? ""),
          isPinned: data.get("isPinned") === "on",
          isActive: true,
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload.message ?? "Could not publish.");
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setConfirmId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleCreate} className="card h-fit p-6">
        <h2 className="text-sm font-bold text-slate-900">New notification</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input id="title" name="title" required className="input" />
          </div>
          <div>
            <label htmlFor="body" className="label">
              Message
            </label>
            <textarea id="body" name="body" rows={5} required className="input" />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPinned"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Pin to the top
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Publishing…" : "Publish"}
        </button>
      </form>

      <div className="space-y-4 lg:col-span-2">
        {notifications.length === 0 && (
          <div className="card p-10 text-center text-sm text-slate-500">
            No notifications published yet.
          </div>
        )}

        {notifications.map((notification) => (
          <article key={notification.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {notification.isPinned && (
                    <span className="badge bg-brand-50 text-brand-700 ring-brand-200">
                      Pinned
                    </span>
                  )}
                  {!notification.isActive && (
                    <span className="badge bg-slate-100 text-slate-600 ring-slate-200">
                      Hidden
                    </span>
                  )}
                  <time className="text-xs text-slate-500">
                    {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{notification.title}</h3>
                <p className="mt-1.5 text-sm whitespace-pre-line text-slate-600">
                  {notification.body}
                </p>
              </div>

              {confirmId === notification.id ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(notification.id)}
                    disabled={loading}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(notification.id)}
                  className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notifications } from "@/lib/mongodb";
import type { NotificationDoc } from "@/lib/types";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "Latest CBSE notices, deadlines and updates for private candidates appearing in compartment, improvement and essential repeat exams.",
};

export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function NotificationsPage() {
  let docs: NotificationDoc[] = [];
  let unavailable = false;

  try {
    const col = await notifications();
    docs = await col
      .find({ isActive: true })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .toArray();
  } catch {
    unavailable = true;
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-eyebrow">Updates</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Deadlines, CBSE notices and announcements for private candidates. Check back before
          every important date.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        {unavailable && (
          <div className="card p-8 text-center text-sm text-slate-500">
            Notifications are temporarily unavailable. Please try again shortly.
          </div>
        )}

        {!unavailable && docs.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-sm font-medium text-slate-700">No notifications yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Announcements about CBSE dates and deadlines will appear here.
            </p>
          </div>
        )}

        {docs.map((notification) => (
          <article key={String(notification._id)} className="card p-6">
            <div className="flex flex-wrap items-center gap-3">
              {notification.isPinned && (
                <span className="badge bg-brand-50 text-brand-700 ring-brand-200">Pinned</span>
              )}
              <time className="text-xs text-slate-500">
                {formatDate(notification.createdAt)}
              </time>
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900">{notification.title}</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-600">
              {notification.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

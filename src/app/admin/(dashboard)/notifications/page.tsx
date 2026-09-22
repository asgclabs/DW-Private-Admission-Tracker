import { notifications } from "@/lib/mongodb";
import { NotificationManager } from "@/components/admin/notification-manager";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const col = await notifications();
  const docs = await col
    .find({})
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(100)
    .toArray();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Announcements shown on the public notifications page.
        </p>
      </div>

      <NotificationManager
        notifications={docs.map((n) => ({
          id: String(n._id),
          title: n.title,
          body: n.body,
          isPinned: n.isPinned,
          isActive: n.isActive,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

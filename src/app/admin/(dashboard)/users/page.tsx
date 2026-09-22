import { redirect } from "next/navigation";
import { adminUsers } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await requireSuperAdmin();
  if (!session) redirect("/admin");

  const col = await adminUsers();
  const docs = await col.find({}).sort({ role: 1, createdAt: 1 }).toArray();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Super-admins manage courses, fees and staff. Admins only handle applications and
          notifications.
        </p>
      </div>

      <UserManager
        currentUserId={session.id}
        users={docs.map((user) => ({
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        }))}
      />
    </div>
  );
}

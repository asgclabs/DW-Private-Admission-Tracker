import { redirect } from "next/navigation";
import { getVerifiedAdminSession } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getVerifiedAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <AdminHeader email={session.email} name={session.name} role={session.role} />
      <AdminMobileNav role={session.role} />
      <div className="flex min-h-0 flex-1">
        <div className="hidden md:block">
          <AdminSidebar role={session.role} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

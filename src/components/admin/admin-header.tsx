"use client";

import { useRouter } from "next/navigation";
import { SITE } from "@/lib/site";

export function AdminHeader({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
}) {
  const router = useRouter();
  const isSuperAdmin = role === "SUPER_ADMIN";

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {name.charAt(0).toUpperCase() || "D"}
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-slate-900">Admin Panel</span>
          <span className="block text-xs text-slate-500">{SITE.name}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isSuperAdmin && (
          <span className="badge hidden bg-brand-50 text-brand-700 ring-brand-200 sm:inline-flex">
            Super Admin
          </span>
        )}
        <span className="hidden text-xs text-slate-500 sm:block">{email}</span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

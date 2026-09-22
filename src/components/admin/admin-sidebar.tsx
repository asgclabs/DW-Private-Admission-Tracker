"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AcademicCapIcon, BellIcon, DashboardIcon, DocumentIcon, UsersIcon } from "./icons";

export function AdminSidebar({ role }: { role: "SUPER_ADMIN" | "ADMIN" }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const links = [
    { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
    { href: "/admin/applications", label: "Applications", icon: DocumentIcon },
    { href: "/admin/notifications", label: "Notifications", icon: BellIcon },
    ...(isSuperAdmin
      ? [
          { href: "/admin/courses", label: "Courses", icon: AcademicCapIcon },
          { href: "/admin/users", label: "Users", icon: UsersIcon },
        ]
      : []),
  ];

  return (
    <nav className="w-56 shrink-0 border-r border-slate-200 bg-white px-3 py-5">
      <ul className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminMobileNav({ role }: { role: "SUPER_ADMIN" | "ADMIN" }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";

  const links = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/applications", label: "Applications" },
    { href: "/admin/notifications", label: "Notifications" },
    ...(isSuperAdmin
      ? [
          { href: "/admin/courses", label: "Courses" },
          { href: "/admin/users", label: "Users" },
        ]
      : []),
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
              active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

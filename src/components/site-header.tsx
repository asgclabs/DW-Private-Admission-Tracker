"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            DW
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-900">{SITE.name}</span>
            <span className="block text-xs text-slate-500">CBSE Private Students Guide</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/#programs" className="btn-primary ml-2 px-4 py-2">
            Apply Now
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/#programs" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Apply Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

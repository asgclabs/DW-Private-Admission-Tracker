"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { LEGAL_LINKS, NAV_LINKS, SITE } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              DW
            </span>
            <span className="text-sm font-bold text-slate-900">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Guidance and form filling support for CBSE private students appearing in
            Compartment, Improvement and Essential Repeat exams.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.18em] text-slate-900 uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-600 hover:text-brand-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.18em] text-slate-900 uppercase">
            Policies
          </h3>
          <ul className="mt-4 space-y-2.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-brand-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.18em] text-slate-900 uppercase">
            Contact Us
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-brand-600">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.phoneHref} className="hover:text-brand-600">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-brand-600">
                <WhatsAppIcon className="h-4 w-4 text-emerald-600" />
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            Not affiliated with CBSE. We provide guidance and form filling assistance only.
          </p>
        </div>
      </div>
    </footer>
  );
}

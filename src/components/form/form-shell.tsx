import Link from "next/link";
import type { ReactNode } from "react";
import type { CourseView } from "@/lib/course-view";
import { SITE } from "@/lib/site";

export function FormShell({
  course,
  children,
}: {
  course: CourseView;
  children: ReactNode;
}) {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-8">
          <nav className="text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/#programs" className="hover:text-brand-600">
              Programs
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">{course.shortName}</span>
          </nav>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {course.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {course.tagline}
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6 sm:p-8">{children}</div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Program fee
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              &#8377;{course.fee.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              One time payment &middot; No other charges
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Included
              </p>
              <ul className="mt-3 space-y-2.5">
                {course.offers.map((offer) => (
                  <li key={offer} className="flex gap-2.5 text-sm text-slate-600">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{offer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm font-bold text-slate-900">Need help filling this?</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Call or message us and we will walk you through the form.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a href={SITE.phoneHref} className="block font-medium text-brand-600">
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="block text-slate-600">
                {SITE.email}
              </a>
            </div>
          </div>

          <p className="px-2 text-xs leading-relaxed text-slate-500">
            Payments are processed securely by Razorpay. Doon Winner Academy is an independent
            guidance service and is not affiliated with CBSE.
          </p>
        </aside>
      </div>
    </div>
  );
}

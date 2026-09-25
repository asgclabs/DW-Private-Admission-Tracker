import Link from "next/link";
import { SITE } from "@/lib/site";
import { TrackerIllustration } from "./tracker-illustration";

function Tick() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Hero({ lowestFee }: { lowestFee: number | null }) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* backdrop: faint grid fading out, and two soft colour glows */}
      <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand-200/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-40 left-[-15%] h-[28rem] w-[28rem] rounded-full bg-sky-100/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-20 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-28">
        <div className="lg:col-span-7 lg:pr-8">
          <Link
            href="#finder"
            className="group inline-flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3 pl-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/10 backdrop-blur transition hover:ring-brand-300"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Open
            </span>
            Session 2027 applications
            <span aria-hidden="true" className="text-slate-400 transition group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>

          <h1 className="mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.2rem]">
            CBSE Private Students Guide for{" "}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Compartment, Improvement &amp; Failure
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Know your category, pick the right program, and let our team fill your CBSE
            private-candidate form &mdash; then follow every step until your admit card.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="#finder" className="btn-primary px-7 py-3.5 text-base shadow-lg shadow-brand-600/25">
              Find my program
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="#programs" className="btn-secondary px-7 py-3.5 text-base">
              See programs &amp; fees
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {lowestFee !== null && (
              <li className="flex items-center gap-2">
                <Tick />
                Programs from <strong className="text-slate-900">&#8377;{lowestFee.toLocaleString("en-IN")}</strong>
              </li>
            )}
            <li className="flex items-center gap-2">
              <Tick />
              Instant reference number
            </li>
            <li className="flex items-center gap-2">
              <Tick />
              Secure Razorpay payment
            </li>
          </ul>

          <p className="mt-6 text-sm text-slate-500">
            Already applied?{" "}
            <Link href="/track" className="font-semibold text-brand-600 hover:text-brand-700">
              Track your application
            </Link>{" "}
            &middot; Questions?{" "}
            <a href={SITE.phoneHref} className="font-semibold text-brand-600 hover:text-brand-700">
              {SITE.phone}
            </a>
          </p>
        </div>

        <div className="lg:col-span-5">
          <TrackerIllustration />
        </div>
      </div>
    </section>
  );
}

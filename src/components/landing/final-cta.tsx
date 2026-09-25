import Link from "next/link";
import { SITE } from "@/lib/site";

export function FinalCta({ lowestFee }: { lowestFee: number | null }) {
  return (
    <section id="get-started" className="container-page py-20 sm:py-24">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-950 px-6 py-16 text-center shadow-2xl sm:px-16 sm:py-20">
        <div
          className="absolute -top-24 left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600/60 via-indigo-500/50 to-violet-500/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="landing-grid-dark absolute inset-0 -z-10" aria-hidden="true" />

        <p className="text-xs font-bold tracking-[0.2em] text-brand-200 uppercase">
          Session 2027 is open
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl">
          Your next attempt starts with the right form.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-100">
          Find your category in 30 seconds, pick a program
          {lowestFee !== null && <> from &#8377;{lowestFee.toLocaleString("en-IN")}</>}, and get
          your reference number the moment you pay.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="#finder"
            className="btn bg-white px-7 py-3.5 text-base text-brand-800 hover:bg-brand-50 focus-visible:ring-white"
          >
            Find my program
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn px-7 py-3.5 text-base text-white ring-1 ring-white/30 ring-inset hover:bg-white/10 focus-visible:ring-white"
          >
            Talk to us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Phone-only bar that keeps "Apply" in reach once the hero's buttons have
 * scrolled away, and steps aside when the final call to action is on screen
 * so the page never shows two of them at once.
 */
export function StickyApplyBar({ lowestFee }: { lowestFee: number | null }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const cta = document.getElementById("get-started");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting);
        if (entry.target === cta) setCtaVisible(entry.isIntersecting);
      }
    });
    if (hero) observer.observe(hero);
    if (cta) observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  const show = !heroVisible && !ctaVisible;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.25)] backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-xs leading-tight text-slate-600">
          <span className="block font-bold text-slate-900">Session 2027 is open</span>
          {lowestFee !== null && <>Programs from &#8377;{lowestFee.toLocaleString("en-IN")}</>}
        </p>
        <div className="flex shrink-0 gap-2">
          <Link
            href="#finder"
            tabIndex={show ? 0 : -1}
            className="rounded-lg px-3 py-2.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 ring-inset"
          >
            Help me choose
          </Link>
          <Link
            href="#programs"
            tabIndex={show ? 0 : -1}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/30"
          >
            Apply now
          </Link>
        </div>
      </div>
    </div>
  );
}

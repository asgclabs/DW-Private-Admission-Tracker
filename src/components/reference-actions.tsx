"use client";

import { useEffect, useState } from "react";
import { DRAFT_PREFIX } from "./form/use-form-assist";

/** Copy button that confirms in place, with a fallback for browsers without the Clipboard API. */
export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older mobile browsers, or a non-secure context.
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
        copied
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-brand-400"
      } ${className}`}
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

/**
 * Reference-number actions on the success page. Also removes the form's
 * refresh-safe draft: once an application exists the draft has done its job,
 * and leaving personal details in storage would only invite a duplicate.
 */
export function ReferenceActions({
  referenceNo,
  courseName,
  trackUrl,
}: {
  referenceNo: string;
  courseName: string;
  trackUrl: string;
}) {
  useEffect(() => {
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith(DRAFT_PREFIX)) sessionStorage.removeItem(key);
      }
    } catch {
      // Storage unavailable — nothing to clear.
    }
  }, []);

  // Sends the reference to the student's own WhatsApp (they pick the chat),
  // so it's saved somewhere they will actually find it later.
  const message = `My Doon Winner application for ${courseName}\nReference: ${referenceNo}\nTrack: ${trackUrl}`;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <CopyButton value={referenceNo} label="Copy reference" />
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.04c-.24.68-1.41 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.94-4.66-4.12-.13-.18-1.11-1.48-1.11-2.82s.7-2 .95-2.27c.25-.27.55-.34.73-.34l.52.01c.17.01.39-.06.61.47.24.56.79 1.94.86 2.08.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.35Z" />
        </svg>
        Save to WhatsApp
      </a>
    </div>
  );
}

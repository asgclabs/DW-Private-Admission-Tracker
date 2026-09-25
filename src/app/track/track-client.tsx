"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/reference-actions";
import { PAYMENT_TONE, STATUS_FLOW, STATUS_TONE, statusLabel, type StatusKey } from "@/lib/status";

type TrackedApplication = {
  referenceNo: string;
  fullName: string;
  programName: string;
  programSlug: string | null;
  amount: number;
  status: StatusKey;
  paymentStatus: string;
  examYear: string | null;
  createdAt: string;
  paidAt: string | null;
  adminNotes: string | null;
  events: { status: StatusKey; message: string; createdAt: string }[];
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TrackClient({ initialRef }: { initialRef?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TrackedApplication | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // On a phone the result renders below the fold — bring it into view.
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setLoading(true);
    setError(null);
    setErrors({});
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNo: String(data.get("referenceNo") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload.message ?? "Could not find that application.");
        setErrors(payload.errors ?? {});
        return;
      }

      setResult(payload.application);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentIndex = result ? STATUS_FLOW.indexOf(result.status) : -1;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Track your application
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Enter the reference number you received after payment along with the mobile number
          used in the application.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card mx-auto mt-10 max-w-xl p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="referenceNo" className="label">
              Reference number <span className="text-rose-500">*</span>
            </label>
            <input
              id="referenceNo"
              name="referenceNo"
              defaultValue={initialRef}
              placeholder="e.g. DWFI-26-4F8K2Q"
              autoComplete="off"
              spellCheck={false}
              className={`input uppercase ${errors.referenceNo ? "input-error" : ""}`}
            />
            {errors.referenceNo && <p className="error-text">{errors.referenceNo}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="label">
              Mobile number <span className="text-rose-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              onInput={(event) => {
                const el = event.currentTarget;
                if (/\D/.test(el.value)) el.value = el.value.replace(/\D/g, "");
              }}
              className={`input ${errors.phone ? "input-error" : ""}`}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "Searching…" : "Search"}
        </button>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}
      </form>

      {result && (
        <div ref={resultRef} className="mx-auto mt-10 max-w-3xl scroll-mt-24 space-y-6">
          <div className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Reference number
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <p className="text-xl font-extrabold tracking-tight text-slate-900">
                    {result.referenceNo}
                  </p>
                  <CopyButton value={result.referenceNo} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{result.fullName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${STATUS_TONE[result.status]}`}>
                  {statusLabel(result.status)}
                </span>
                <span className={`badge ${PAYMENT_TONE[result.paymentStatus] ?? ""}`}>
                  Payment: {result.paymentStatus}
                </span>
              </div>
            </div>

            <dl className="mt-8 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Program</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{result.programName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Amount</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  &#8377;{result.amount.toLocaleString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Applied on</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(result.createdAt)}
                </dd>
              </div>
            </dl>

            {result.paymentStatus === "PENDING" && result.programSlug && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">Payment not completed</p>
                <p className="mt-1 text-sm text-amber-700">
                  Your details are saved but the fee has not been received.{" "}
                  <Link
                    href={`/apply/${result.programSlug}`}
                    className="font-semibold underline"
                  >
                    Complete the payment
                  </Link>{" "}
                  to activate your application.
                </p>
              </div>
            )}

            {result.adminNotes && (
              <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-medium text-sky-900">Message from our team</p>
                <p className="mt-1 text-sm whitespace-pre-line text-sky-800">
                  {result.adminNotes}
                </p>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900">Progress</h2>
            <ol className="mt-6 space-y-0">
              {STATUS_FLOW.map((step, index) => {
                const done = currentIndex >= index && currentIndex !== -1;
                const isCurrent = currentIndex === index;
                return (
                  <li key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {index < STATUS_FLOW.length - 1 && (
                        <span
                          className={`w-0.5 flex-1 ${done ? "bg-brand-200" : "bg-slate-200"}`}
                        />
                      )}
                    </div>
                    <div className="pb-8">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent ? "text-brand-700" : done ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {statusLabel(step)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* History */}
          {result.events.length > 0 && (
            <div className="card p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-900">Activity</h2>
              <ul className="mt-5 space-y-4">
                {result.events.map((event, index) => (
                  <li key={index} className="border-l-2 border-slate-200 pl-4">
                    <p className="text-sm text-slate-800">{event.message}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatDate(event.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

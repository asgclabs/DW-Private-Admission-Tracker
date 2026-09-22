"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

const PAYMENT_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export function AdminFilters({
  programs,
  statuses,
  defaults,
}: {
  programs: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
  defaults: { q: string; program: string; status: string; payment: string; view?: string };
}) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = new URLSearchParams();

    // "view" (table vs. grouped-by-course) is a display mode, not a filter,
    // but it still has to survive a filter submit or it'd silently reset.
    for (const key of ["q", "program", "status", "payment", "view"]) {
      const value = String(data.get(key) ?? "").trim();
      if (value) query.set(key, value);
    }

    router.push(query.toString() ? `/admin/applications?${query}` : "/admin/applications");
  }

  function handleReset() {
    router.push(defaults.view === "grouped" ? "/admin/applications?view=grouped" : "/admin/applications");
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <input
            name="q"
            defaultValue={defaults.q}
            placeholder="Search reference, name, phone, email or roll no."
            className="input"
          />
        </div>

        <select name="program" defaultValue={defaults.program} className="input">
          <option value="">All programs</option>
          {programs.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select name="status" defaultValue={defaults.status} className="input">
          <option value="">All statuses</option>
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select name="payment" defaultValue={defaults.payment} className="input">
          <option value="">All payments</option>
          {PAYMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="view" value={defaults.view ?? ""} />

      <div className="mt-3 flex gap-2">
        <button type="submit" className="btn-primary px-4 py-2 text-xs">
          Apply filters
        </button>
        <button type="button" onClick={handleReset} className="btn-ghost px-4 py-2 text-xs">
          Reset
        </button>
      </div>
    </form>
  );
}

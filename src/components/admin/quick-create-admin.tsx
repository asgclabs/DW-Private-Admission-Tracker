"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/** Inline "create admin" panel on the dashboard — the fuller role/status
 * controls live at /admin/users, this is the fast path for a quick add. */
export function QuickCreateAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: email.split("@")[0] || "Admin",
          password,
          role: "ADMIN",
          isActive: true,
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload.message ?? "Could not create the admin account.");
        return;
      }

      setSuccess(`Admin account created for ${email}.`);
      form.reset();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-eyebrow">Super admin tools</p>
          <h2 className="mt-1 text-base font-bold text-slate-900">Create admin account</h2>
          <p className="mt-1 text-xs text-slate-500">
            Add new admin access with an email and password. Revenue stays visible only here.
          </p>
        </div>
        <span className="badge bg-brand-50 text-brand-700 ring-brand-200">Super Admin only</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qc-email" className="label">
            Admin Email
          </label>
          <input
            id="qc-email"
            name="email"
            type="email"
            required
            placeholder="admin@doon.edu"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="qc-password" className="label">
            Password
          </label>
          <input
            id="qc-password"
            name="password"
            type="text"
            required
            minLength={10}
            placeholder="Set admin password"
            className="input font-mono text-xs"
          />
        </div>

        {error && (
          <p role="alert" className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="sm:col-span-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {success}
          </p>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 text-sm">
            {loading ? "Creating…" : "Create Admin"}
          </button>
        </div>
      </form>
    </section>
  );
}

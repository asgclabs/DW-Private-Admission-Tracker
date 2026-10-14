"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Course = { id: string; name: string; fee: number; isActive: boolean };

export function OfflineApplicationForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseId, setCourseId] = useState("");
  const [amount, setAmount] = useState("");
  const submissionId = useRef<string | null>(null);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const data = new FormData(event.currentTarget);
    submissionId.current ??= crypto.randomUUID();
    setLoading(true);
    setError("");
    setErrors({});
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data), amount: Number(amount), submissionId: submissionId.current }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message ?? "Could not save the registration.");
        setErrors(result.errors ?? {});
        return;
      }
      router.push(`/admin/applications/${result.application.id}`);
      router.refresh();
    } catch {
      setError("Could not confirm the registration was saved. Retry this form to avoid a duplicate entry.");
    } finally { setLoading(false); }
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Offline admissions</h2>
          <p className="mt-1 text-sm text-slate-500">Manually register a student whose payment you have received offline.</p>
        </div>
        <button type="button" className="btn-primary" aria-expanded={open} aria-controls="offline-registration" onClick={() => setOpen(!open)}>
          {open ? "Close form" : "Add offline application"}
        </button>
      </div>
      {open && (
        <form id="offline-registration" onSubmit={submit} className="mt-6">
          <fieldset disabled={loading} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="offline-name" className="label">Student full name *</label>
              <input id="offline-name" name="fullName" required minLength={3} maxLength={120} className="input" autoComplete="name" />
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="offline-phone" className="label">Mobile number *</label>
              <input id="offline-phone" name="phone" type="tel" required pattern="[6-9][0-9]{9}" maxLength={10} className="input" autoComplete="tel" />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="offline-email" className="label">Email (optional)</label>
              <input id="offline-email" name="email" type="email" maxLength={160} className="input" autoComplete="email" />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="offline-course" className="label">Course *</label>
              <select id="offline-course" name="courseId" required value={courseId} onChange={(event) => {
                setCourseId(event.target.value);
                setAmount(String(courses.find((course) => course.id === event.target.value)?.fee ?? ""));
              }} className="input">
                <option value="">Select a course</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.name}{course.isActive ? "" : " (inactive)"}</option>)}
              </select>
              {errors.courseId && <p className="error-text">{errors.courseId}</p>}
            </div>
            <div>
              <label htmlFor="offline-amount" className="label">Amount received (₹) *</label>
              <input id="offline-amount" name="amount" type="number" required min={1} max={1000000} step={1} value={amount} onChange={(event) => setAmount(event.target.value)} className="input" />
              {errors.amount && <p className="error-text">{errors.amount}</p>}
            </div>
            <div>
              <label htmlFor="offline-date" className="label">Payment received on *</label>
              <input id="offline-date" name="paidDate" type="date" required max={today} defaultValue={today} className="input" />
              {errors.paidDate && <p className="error-text">{errors.paidDate}</p>}
            </div>
            <div>
              <label htmlFor="offline-receipt" className="label">Receipt / transaction reference (optional)</label>
              <input id="offline-receipt" name="offlineReceipt" maxLength={200} className="input" />
              {errors.offlineReceipt && <p className="error-text">{errors.offlineReceipt}</p>}
            </div>
            <div>
              <label htmlFor="offline-notes" className="label">Admin notes (optional)</label>
              <textarea id="offline-notes" name="adminNotes" rows={2} maxLength={2000} className="input" />
              {errors.adminNotes && <p className="error-text">{errors.adminNotes}</p>}
            </div>
            <p className="help sm:col-span-2">Saving marks this application as paid and adds the amount to offline payments received.</p>
            {error && <p role="alert" className="error-text sm:col-span-2">{error}</p>}
            {courses.length === 0 && <p className="error-text sm:col-span-2">Create a course before adding a registration.</p>}
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={loading || courses.length === 0} className="btn-primary">{loading ? "Saving…" : "Save paid offline application"}</button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}

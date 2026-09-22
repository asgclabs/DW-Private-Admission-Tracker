"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function StatusUpdateForm({
  applicationId,
  currentStatus,
  currentNotes,
  statuses,
}: {
  applicationId: string;
  currentStatus: string;
  currentNotes: string;
  statuses: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: String(data.get("status") ?? ""),
          adminNotes: String(data.get("adminNotes") ?? ""),
          message: String(data.get("message") ?? ""),
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setFeedback({ ok: false, text: payload.message ?? "Could not update." });
        return;
      }

      setFeedback({ ok: true, text: "Updated. The student can see this on the tracker." });
      router.refresh();
    } catch {
      setFeedback({ ok: false, text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h2 className="text-sm font-bold text-slate-900">Update application</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select id="status" name="status" defaultValue={currentStatus} className="input">
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="label">
            Activity note
          </label>
          <input
            id="message"
            name="message"
            placeholder="e.g. Documents received, form filled"
            className="input"
          />
          <p className="help">Added to the activity log the student sees.</p>
        </div>

        <div>
          <label htmlFor="adminNotes" className="label">
            Message to student
          </label>
          <textarea
            id="adminNotes"
            name="adminNotes"
            rows={4}
            defaultValue={currentNotes}
            placeholder="Shown on the tracking page"
            className="input"
          />
        </div>
      </div>

      {feedback && (
        <p
          role="status"
          className={`mt-4 rounded-lg px-3 py-2 text-xs ${
            feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

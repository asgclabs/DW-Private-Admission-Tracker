"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
};

export function UserManager({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          name: String(data.get("name") ?? ""),
          password: String(data.get("password") ?? ""),
          role: String(data.get("role") ?? "ADMIN"),
          isActive: true,
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload.message ?? "Could not create the user.");
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setRowError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setRowError({ id, text: payload.message ?? "Could not update." });
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    setRowError(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setRowError({ id, text: payload.message ?? "Could not remove." });
      setConfirmId(null);
      return;
    }
    setConfirmId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleCreate} className="card h-fit p-6">
        <h2 className="text-sm font-bold text-slate-900">Add admin user</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Temporary password
            </label>
            <input
              id="password"
              name="password"
              type="text"
              minLength={10}
              required
              className="input font-mono text-xs"
            />
            <p className="help">
              At least 10 characters. Share it with them and ask them to change it.
            </p>
          </div>
          <div>
            <label htmlFor="role" className="label">
              Role
            </label>
            <select id="role" name="role" defaultValue="ADMIN" className="input">
              <option value="ADMIN">Admin — applications only</option>
              <option value="SUPER_ADMIN">Super-admin — full access</option>
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Adding…" : "Add user"}
        </button>
      </form>

      <div className="space-y-3 lg:col-span-2">
        {users.map((user) => (
          <div key={user.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <span
                    className={`badge ${
                      user.role === "SUPER_ADMIN"
                        ? "bg-violet-50 text-violet-700 ring-violet-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}
                  >
                    {user.role === "SUPER_ADMIN" ? "Super-admin" : "Admin"}
                  </span>
                  {!user.isActive && (
                    <span className="badge bg-rose-50 text-rose-700 ring-rose-200">
                      Deactivated
                    </span>
                  )}
                  {user.id === currentUserId && (
                    <span className="text-xs text-slate-400">(you)</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {user.lastLoginAt
                    ? `Last signed in ${new Date(user.lastLoginAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Never signed in"}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    patch(user.id, {
                      role: user.role === "SUPER_ADMIN" ? "ADMIN" : "SUPER_ADMIN",
                    })
                  }
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {user.role === "SUPER_ADMIN" ? "Make admin" : "Make super-admin"}
                </button>

                <button
                  type="button"
                  onClick={() => patch(user.id, { isActive: !user.isActive })}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {user.isActive ? "Deactivate" : "Reactivate"}
                </button>

                {user.id !== currentUserId &&
                  (confirmId === user.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => remove(user.id)}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(user.id)}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  ))}
              </div>
            </div>

            {rowError?.id === user.id && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
              >
                {rowError.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

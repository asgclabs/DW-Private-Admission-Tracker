"use client";

import type { ComparisonRow } from "@/lib/types";

/**
 * Edits the rows one course contributes to the home-page comparison table.
 * Rows are matched across courses by label, so the same wording must be used
 * on every course for a row to line up.
 */
export function ComparisonBuilder({
  rows,
  onChange,
}: {
  rows: ComparisonRow[];
  onChange: (rows: ComparisonRow[]) => void;
}) {
  function update(index: number, patch: Partial<ComparisonRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {rows.length === 0 && (
        <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          No rows yet. Without any, the table falls back to comparing the &ldquo;What students
          get&rdquo; lists.
        </p>
      )}

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-12"
          >
            <input
              value={row.label}
              onChange={(e) => update(index, { label: e.target.value })}
              placeholder="Row label, e.g. Study Materials"
              aria-label="Row label"
              className="input sm:col-span-5"
            />
            <input
              value={row.value}
              onChange={(e) => update(index, { value: e.target.value })}
              placeholder={row.plain ? "Text shown as-is" : "Yes, Monthly, — for not included"}
              aria-label="Value for this course"
              className="input sm:col-span-4"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-600 sm:col-span-1">
              <input
                type="checkbox"
                checked={Boolean(row.plain)}
                onChange={(e) => update(index, { plain: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Text
            </label>
            <div className="flex justify-end gap-1 sm:col-span-2">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="Move down"
                className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label="Remove row"
                className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...rows, { label: "", value: "Yes", plain: false }])}
        className="btn-ghost mt-3 px-3 py-2 text-xs"
      >
        Add row
      </button>
    </div>
  );
}

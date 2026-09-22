"use client";

import { useState, type KeyboardEvent } from "react";

/** Small repeatable-text-row editor used for bullet lists and dropdown options. */
export function ListBuilder({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Otherwise Enter would submit the whole course form.
      event.preventDefault();
      add();
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="flex-1 text-sm text-slate-700">{item}</span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  aria-label="Remove"
                  className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button type="button" onClick={add} className="btn-ghost px-4 py-2 text-xs">
          Add
        </button>
      </div>
    </div>
  );
}

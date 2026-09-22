import type { ComponentType } from "react";

type IconComponent = ComponentType<{ className?: string }>;

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  orange: "bg-orange-50 text-orange-600",
  indigo: "bg-indigo-50 text-indigo-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
  pink: "bg-pink-50 text-pink-600",
} as const;

export type StatTone = keyof typeof TONES;

export function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: IconComponent;
  tone: StatTone;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

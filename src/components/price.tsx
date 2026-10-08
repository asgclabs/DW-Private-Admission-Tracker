const SIZES = {
  sm: { now: "text-base font-bold", was: "text-xs" },
  md: { now: "text-2xl font-extrabold tracking-tight", was: "text-sm" },
  lg: { now: "text-3xl font-extrabold tracking-tight", was: "text-base" },
} as const;

export function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** How much the student saves, or null when there is no higher original price. */
export function saving(fee: number, originalFee?: number | null): number | null {
  return originalFee && originalFee > fee ? originalFee - fee : null;
}

/** Current fee, followed by the original price struck through when the course has one. */
export function Price({
  fee,
  originalFee,
  size = "md",
  className = "",
}: {
  fee: number;
  originalFee?: number | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const style = SIZES[size];
  const showOriginal = saving(fee, originalFee) !== null;

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={`text-slate-900 ${style.now}`}>{rupees(fee)}</span>
      {showOriginal && (
        <del className={`font-medium text-slate-400 decoration-rose-500/70 ${style.was}`}>
          <span className="sr-only">Original price </span>
          {rupees(originalFee!)}
        </del>
      )}
    </span>
  );
}

/** "Save ₹2,000" pill, rendered only when there is something to save. */
export function SavingBadge({
  fee,
  originalFee,
  className = "",
}: {
  fee: number;
  originalFee?: number | null;
  className?: string;
}) {
  const amount = saving(fee, originalFee);
  if (amount === null) return null;
  const percent = Math.round((amount / originalFee!) * 100);

  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 ring-inset ${className}`}
    >
      Save {rupees(amount)} &middot; {percent}% off
    </span>
  );
}

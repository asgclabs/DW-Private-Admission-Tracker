export const STATUS_LABELS = {
  PENDING_PAYMENT: "Payment pending",
  PAID: "Payment received",
  UNDER_REVIEW: "Under review",
  DOCUMENTS_REQUIRED: "Documents required",
  FORM_SUBMITTED: "CBSE form submitted",
  ADMIT_CARD_ISSUED: "Admit card issued",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export type StatusKey = keyof typeof STATUS_LABELS;

/** The happy path a student walks through, used to draw the tracker timeline. */
export const STATUS_FLOW: StatusKey[] = [
  "PENDING_PAYMENT",
  "PAID",
  "UNDER_REVIEW",
  "FORM_SUBMITTED",
  "ADMIT_CARD_ISSUED",
  "COMPLETED",
];

export const STATUS_TONE: Record<StatusKey, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UNDER_REVIEW: "bg-sky-50 text-sky-700 ring-sky-200",
  DOCUMENTS_REQUIRED: "bg-orange-50 text-orange-700 ring-orange-200",
  FORM_SUBMITTED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  ADMIT_CARD_ISSUED: "bg-violet-50 text-violet-700 ring-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const PAYMENT_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-200",
  REFUNDED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as StatusKey] ?? status;
}

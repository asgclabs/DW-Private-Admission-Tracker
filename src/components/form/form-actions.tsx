"use client";

export function FormActions({ loading, fee }: { loading: boolean; fee: number }) {
  return (
    <div className="mt-6 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-xs text-slate-500">
        You will be redirected to Razorpay to pay securely.
      </p>
      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
            Processing&hellip;
          </>
        ) : (
          <>Proceed to pay &#8377;{fee.toLocaleString("en-IN")}</>
        )}
      </button>
    </div>
  );
}

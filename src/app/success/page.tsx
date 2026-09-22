import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { applications } from "@/lib/mongodb";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Application Confirmed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const col = await applications();
  const application = await col.findOne(
    { referenceNo: ref.toUpperCase() },
    {
      projection: {
        referenceNo: 1,
        fullName: 1,
        courseName: 1,
        amount: 1,
        paymentStatus: 1,
      },
    },
  );

  if (!application) notFound();

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-8 w-8 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>

        <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {application.paymentStatus === "PAID"
            ? "Payment received. You are enrolled."
            : "Application submitted."}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Thank you, {application.fullName.split(" ")[0]}. Save your reference number &mdash; it
          is how you track everything from here.
        </p>

        <div className="card mt-10 p-8">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Your reference number
          </p>
          <p className="mt-3 font-mono text-2xl font-extrabold tracking-wider text-brand-700 sm:text-3xl">
            {application.referenceNo}
          </p>

          <dl className="mt-8 grid gap-5 border-t border-slate-100 pt-6 text-left sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Program</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {application.courseName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Amount paid</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                &#8377;{application.amount.toLocaleString("en-IN")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left">
          <p className="text-sm font-bold text-slate-900">What happens next</p>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="font-bold text-brand-600">1.</span>
              <span>
                Our team reviews your details and contacts you on the number you provided.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-brand-600">2.</span>
              <span>
                We ask for the documents needed for your category and fill the CBSE form for
                you.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-brand-600">3.</span>
              <span>
                You follow every update on the tracking page right up to the admit card.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/track?ref=${encodeURIComponent(application.referenceNo)}`}
            className="btn-primary"
          >
            Track my application
          </Link>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Questions? Write to{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand-600">
            {SITE.email}
          </a>{" "}
          or call{" "}
          <a href={SITE.phoneHref} className="font-medium text-brand-600">
            {SITE.phone}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

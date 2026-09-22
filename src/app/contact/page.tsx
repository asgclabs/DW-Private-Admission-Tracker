import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach Doon Winner Academy for help with CBSE compartment, improvement and essential repeat applications.",
};

const CHANNELS = [
  {
    label: "Call us",
    value: SITE.phone,
    href: SITE.phoneHref,
    note: "Monday to Saturday, 10 AM to 7 PM",
  },
  {
    label: "Email us",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "We reply within one working day",
  },
  {
    label: "WhatsApp",
    value: "Message us",
    href: SITE.whatsapp,
    note: "Fastest way to reach the team",
  },
];

export default function Page() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-eyebrow">Contact</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          We are here to help
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Not sure which category you fall in, or which program to choose? Ask us before you
          pay — we would rather answer a question than fix a wrong application.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
        {CHANNELS.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="card p-6 text-center transition hover:border-brand-300 hover:shadow-md"
          >
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {channel.label}
            </p>
            <p className="mt-3 text-sm font-bold text-brand-600">{channel.value}</p>
            <p className="mt-2 text-xs text-slate-500">{channel.note}</p>
          </a>
        ))}
      </div>

      <div className="card mx-auto mt-10 max-w-3xl p-8">
        <h2 className="text-base font-bold text-slate-900">Already applied?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Keep your reference number ready when you contact us — it lets us pull up your case
          immediately. You can also check the current status yourself on the tracking page.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/track" className="btn-primary">
            Track application
          </Link>
          <Link href="/#programs" className="btn-secondary">
            View programs
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-slate-500">
        {SITE.name} is an independent guidance service and is not affiliated with CBSE. For
        official notices, always refer to the CBSE website.
      </p>
    </div>
  );
}

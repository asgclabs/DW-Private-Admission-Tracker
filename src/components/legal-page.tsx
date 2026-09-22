import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {updated && <p className="mt-2 text-xs text-slate-500">Last updated: {updated}</p>}
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-900">{heading}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

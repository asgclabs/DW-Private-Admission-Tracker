import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p
        className={`text-xs font-bold tracking-[0.2em] uppercase ${
          tone === "dark" ? "text-brand-200" : "text-brand-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl ${
          tone === "dark" ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {children && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            tone === "dark" ? "text-brand-100" : "text-slate-600"
          }`}
        >
          {children}
        </p>
      )}
    </div>
  );
}

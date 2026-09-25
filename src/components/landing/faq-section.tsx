import { Faq } from "@/components/faq";
import { FAQS } from "@/lib/content";
import { SITE } from "@/lib/site";
import { SectionHeading } from "./section-heading";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-slate-200/70 bg-slate-50 py-20 sm:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Questions" title="Answers before you pay" align="left">
            The things students and parents ask us most.
          </SectionHeading>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-900">Still not sure?</p>
            <p className="mt-1 text-sm text-slate-600">
              Ask us before you apply &mdash; we&apos;d rather answer a question than fix a
              wrong form.
            </p>
            <div className="mt-5 space-y-2">
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Chat on WhatsApp
              </a>
              <a href={SITE.phoneHref} className="btn-secondary w-full py-2.5">
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Faq items={FAQS} />
        </div>
      </div>
    </section>
  );
}

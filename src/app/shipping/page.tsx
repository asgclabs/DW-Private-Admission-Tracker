import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping and Delivery",
  description: "How Doon Winner Academy delivers program access and study material.",
};

export default function Page() {
  return (
    <LegalPage title="Shipping and Delivery" updated="20 September 2026">
      <LegalSection heading="Digital delivery">
        <p>
          Our programs are delivered digitally. There is no physical product to ship unless we
          specifically tell you otherwise for a particular batch.
        </p>
      </LegalSection>

      <LegalSection heading="What you receive and when">
        <LegalList
          items={[
            "Reference number — generated immediately after a successful payment and shown on screen.",
            "Welcome contact — our team calls or messages you on the registered mobile number within 24 to 48 working hours.",
            "Student group access — you are added to the WhatsApp or online community within 2 working days.",
            "Study material and notes — shared in the group through the session, as scheduled for your program.",
            "Form filling — carried out during the official CBSE application window for your category, not immediately on payment.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Form filling timelines">
        <p>
          CBSE opens the private candidate application window on its own schedule. We cannot fill
          your form before the window opens. Once it does, we complete your form and confirm the
          submission with you, and your status on the tracking page moves to &ldquo;CBSE form
          submitted&rdquo;.
        </p>
      </LegalSection>

      <LegalSection heading="If you have not heard from us">
        <p>
          If more than 48 working hours have passed since your payment and nobody has contacted
          you, write to{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand-600">
            {SITE.email}
          </a>{" "}
          or call{" "}
          <a href={SITE.phoneHref} className="font-medium text-brand-600">
            {SITE.phone}
          </a>{" "}
          with your reference number. Check your spam folder too — our emails sometimes land
          there.
        </p>
      </LegalSection>

      <LegalSection heading="Physical material">
        <p>
          If a program includes printed material, it is dispatched to the address you gave in the
          application form and normally arrives within 7 to 10 working days. Please make sure
          your address and PIN code are correct, since we cannot recover a package delivered to a
          wrong address you supplied.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

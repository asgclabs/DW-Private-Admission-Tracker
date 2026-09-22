import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation and Refund Policy",
  description: "Cancellation and refund terms for Doon Winner Academy programs.",
};

export default function Page() {
  return (
    <LegalPage title="Cancellation and Refund Policy" updated="19 September 2026">
      <LegalSection heading="Non-refundable fees">
        <p>
          All program fees paid to {SITE.name} are non-refundable. This is stated on every
          payment page before you pay and you confirm it again when you submit the application
          form. Once a payment is completed, the enrolment is treated as final.
        </p>
      </LegalSection>

      <LegalSection heading="Why fees are non-refundable">
        <p>
          Our programs begin work immediately after enrolment — your details are reviewed, your
          CBSE form filling slot is reserved, you are added to the student group, and study
          material is released to you. These costs cannot be recovered once incurred.
        </p>
      </LegalSection>

      <LegalSection heading="Cancellation by the student">
        <LegalList
          items={[
            "You may stop using the program at any time, but no refund is issued.",
            "If you have paid twice for the same program by mistake, write to us within 7 days with both payment IDs and we will refund the duplicate payment.",
            "If a payment was deducted but no reference number was generated, contact us with the Razorpay payment ID and we will either activate your application or return the amount.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Cancellation by us">
        <p>
          If we are unable to deliver the program you paid for — for example, if your category
          is outside what we support, or if you are not eligible to appear as a private
          candidate — we will tell you and refund the fee in full.
        </p>
      </LegalSection>

      <LegalSection heading="How refunds are processed">
        <p>
          Approved refunds are returned to the original payment method through Razorpay. Banks
          usually credit the amount within 5 to 10 working days of the refund being initiated.
        </p>
      </LegalSection>

      <LegalSection heading="What we do not guarantee">
        <p>
          Our fee covers guidance, form filling assistance and study support. It does not
          guarantee any examination result, marks, or a decision by CBSE. Missing a CBSE
          deadline because required documents or information were not shared with us in time is
          not grounds for a refund.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          For any refund question, write to{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand-600">
            {SITE.email}
          </a>{" "}
          or call{" "}
          <a href={SITE.phoneHref} className="font-medium text-brand-600">
            {SITE.phone}
          </a>{" "}
          with your reference number.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

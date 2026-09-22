import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Doon Winner Academy collects, uses and protects student information.",
};

export default function Page() {
  return (
    <LegalPage title="Privacy Policy" updated="20 September 2026">
      <LegalSection heading="What this policy covers">
        <p>
          This policy explains what information {SITE.name} collects when you apply for a
          program, why we collect it, and what we do with it. It applies to this website and to
          the support we provide over phone, email and WhatsApp.
        </p>
      </LegalSection>

      <LegalSection heading="Information we collect">
        <LegalList
          items={[
            "Identity details: your name, parents' names, date of birth and gender.",
            "Contact details: mobile number, alternate number, email address and postal address.",
            "CBSE record: roll number, school name and code, year of passing, category and the subjects you are appearing in.",
            "Payment record: the Razorpay order and payment identifiers for your transaction.",
          ]}
        />
        <p>
          We do not store your card number, UPI PIN, net banking credentials or any other
          payment instrument details. Those are handled entirely by Razorpay.
        </p>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <LegalList
          items={[
            "To fill the CBSE private candidate form on your behalf, accurately and in the correct category.",
            "To contact you about documents, deadlines, admit cards and exam guidance.",
            "To process your fee and issue a reference number you can track.",
            "To share study material and add you to the relevant student group.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          Your details are entered into the official CBSE application system as part of the form
          filling service you pay for. Payment information is shared with Razorpay, our payment
          processor. Beyond this, we do not sell, rent or trade your information with anyone.
        </p>
        <p>
          We may disclose information if required to do so by law or by a lawful request from a
          government authority.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Application records are retained for the duration of the examination cycle you applied
          for, and afterwards for as long as needed to answer queries about your application or
          to meet legal and accounting obligations.
        </p>
      </LegalSection>

      <LegalSection heading="How we protect it">
        <p>
          Data is stored in an access-controlled database. Only authorised staff can view
          student records, and the tracking page requires both a reference number and the
          registered mobile number before any application is shown.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <LegalList
          items={[
            "You can ask us for a copy of the information we hold about you.",
            "You can ask us to correct anything that is inaccurate — important, since errors carry into the CBSE form.",
            "You can ask us to delete your record once your examination cycle is complete.",
            "You can opt out of non-essential messages at any time.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Children's information">
        <p>
          Many of our students are under 18. Where that is the case, we expect a parent or
          guardian to submit the application and to remain in contact with us throughout.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          For any privacy question or request, write to{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand-600">
            {SITE.email}
          </a>{" "}
          or call{" "}
          <a href={SITE.phoneHref} className="font-medium text-brand-600">
            {SITE.phone}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

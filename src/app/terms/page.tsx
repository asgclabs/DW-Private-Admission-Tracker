import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing the use of Doon Winner Academy programs and this website.",
};

export default function Page() {
  return (
    <LegalPage title="Terms of Use" updated="20 September 2026">
      <LegalSection heading="Agreement">
        <p>
          By using this website or enrolling in any program offered by {SITE.name}, you agree to
          these terms. If you do not agree with them, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection heading="What we are">
        <p>
          {SITE.name} is an independent guidance and coaching service for CBSE private
          candidates. We are <strong>not affiliated with, endorsed by, or acting on behalf
          of CBSE</strong> or any government body. All examination rules, dates, fees, results
          and final decisions rest solely with CBSE.
        </p>
      </LegalSection>

      <LegalSection heading="What we provide">
        <LegalList
          items={[
            "Assistance in filling the CBSE private candidate form for compartment, improvement and essential repeat categories.",
            "Updates on deadlines, admit cards and examination announcements.",
            "Study material, notes and previous year papers as described in your program.",
            "Mentoring and meetings as described in your program.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Your responsibilities">
        <LegalList
          items={[
            "Give accurate information. The CBSE form is filled from exactly what you submit, and an error in your details becomes an error in your application.",
            "Send requested documents on time. CBSE deadlines are fixed and we cannot extend them.",
            "Keep your reference number safe and do not share it publicly.",
            "Respond to our calls and messages during the application window.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="What we do not promise">
        <p>
          We do not guarantee any examination result, any particular marks, admission anywhere,
          or a favourable decision from CBSE. We also cannot be responsible for delays,
          rejections or changes caused by CBSE, by the examination portal, or by incorrect or
          late information provided by you.
        </p>
      </LegalSection>

      <LegalSection heading="Fees and payment">
        <p>
          Program fees are shown on the website before payment and are collected through
          Razorpay. Fees are non-refundable, as set out in our{" "}
          <a href="/refund" className="font-medium text-brand-600">
            Cancellation and Refund Policy
          </a>
          . Fees may change for future sessions, but never for an enrolment already paid for.
        </p>
      </LegalSection>

      <LegalSection heading="Study material and content">
        <p>
          Notes, question papers, recordings and other material shared with you are for your
          personal use only. Reselling, republishing or circulating them outside the program is
          not permitted.
        </p>
      </LegalSection>

      <LegalSection heading="Conduct in student groups">
        <p>
          We may remove a student from the community or the program, without refund, for abusive
          behaviour, harassment of other students or staff, or sharing paid material publicly.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the extent permitted by law, our total liability for any claim relating to a program
          is limited to the fee you paid for that program.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          We may update these terms from time to time. The date at the top of this page shows
          when they were last revised, and the version in force is the one published here.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand-600">
            {SITE.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

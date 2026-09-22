import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { applications } from "@/lib/mongodb";
import { PAYMENT_TONE, STATUS_LABELS, STATUS_TONE, statusLabel, type StatusKey } from "@/lib/status";
import { StatusUpdateForm } from "@/components/admin/status-update-form";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "—";
  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-right text-sm text-slate-900">{value || "—"}</dd>
    </div>
  );
}

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const col = await applications();
  const application = await col.findOne({ _id: new ObjectId(id) });

  if (!application) notFound();

  const customAnswers: [string, string][] = Object.entries(
    application.customAnswers ?? {},
  ).map(([key, value]) => [
    key.replace(/_/g, " "),
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value),
  ]);

  const events = (application.events ?? [])
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/applications" className="text-xs text-slate-500 hover:text-brand-600">
          &larr; Back to applications
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl font-extrabold tracking-tight text-slate-900">
              {application.referenceNo}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {application.fullName} &middot; {application.courseName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${STATUS_TONE[application.status as StatusKey]}`}>
              {statusLabel(application.status)}
            </span>
            <span className={`badge ${PAYMENT_TONE[application.paymentStatus] ?? ""}`}>
              Payment: {application.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Student details</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <Row label="Full name" value={application.fullName} />
              <Row
                label="Mobile"
                value={
                  <a href={`tel:${application.phone}`} className="text-brand-600">
                    {application.phone}
                  </a>
                }
              />
              <Row label="Alternate mobile" value={application.altPhone} />
              <Row
                label="Email"
                value={
                  <a href={`mailto:${application.email}`} className="text-brand-600">
                    {application.email}
                  </a>
                }
              />
              <Row
                label="Date of birth"
                value={
                  application.dateOfBirth
                    ? application.dateOfBirth.toLocaleDateString("en-IN")
                    : null
                }
              />
              <Row label="Gender" value={application.gender} />
              <Row label="Father's name" value={application.fatherName} />
              <Row label="Mother's name" value={application.motherName} />
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">CBSE details</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <Row label="Roll number" value={application.rollNo} />
              <Row label="School" value={application.previousSchool} />
              <Row label="School code" value={application.schoolCode} />
              <Row label="Year of passing / last attempt" value={application.passingYear} />
              <Row label="Exam year" value={application.examYear} />
              <Row label="Category" value={application.studentCategory} />
              <Row label="Subject combination" value={application.subjectCombination} />
              <Row
                label="Subjects"
                value={application.subjects?.length ? application.subjects.join(", ") : null}
              />
              <Row
                label="Improvement subjects"
                value={
                  application.improvementSubjects?.length
                    ? application.improvementSubjects.join(", ")
                    : null
                }
              />
              <Row
                label="Failed subjects"
                value={
                  application.failedSubjects?.length
                    ? application.failedSubjects.join(", ")
                    : null
                }
              />
              <Row label="Remarks from student" value={application.remarks} />
            </dl>
          </section>

          {customAnswers.length > 0 && (
            <section className="card p-6">
              <h2 className="text-sm font-bold text-slate-900">Extra questions</h2>
              <p className="mt-1 text-xs text-slate-500">
                Answers to the questions set on {application.courseName}.
              </p>
              <dl className="mt-4 divide-y divide-slate-100">
                {customAnswers.map(([key, value]) => (
                  <Row key={key} label={key} value={value} />
                ))}
              </dl>
            </section>
          )}

          <section className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Address</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <Row label="Address" value={application.address} />
              <Row label="City" value={application.city} />
              <Row label="State" value={application.state} />
              <Row label="PIN code" value={application.pincode} />
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Payment</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <Row
                label="Amount"
                value={`₹${application.amount.toLocaleString("en-IN")}`}
              />
              <Row label="Razorpay order" value={application.razorpayOrderId} />
              <Row label="Razorpay payment" value={application.razorpayPaymentId} />
              <Row label="Paid at" value={formatDateTime(application.paidAt)} />
            </dl>
          </section>
        </div>

        <aside className="space-y-6">
          <StatusUpdateForm
            applicationId={String(application._id)}
            currentStatus={application.status}
            currentNotes={application.adminNotes ?? ""}
            statuses={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />

          <section className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Activity</h2>
            <ul className="mt-4 space-y-4">
              {events.map((event, index) => (
                <li key={index} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-sm text-slate-800">{event.message}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDateTime(event.createdAt)} &middot; {event.actor}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="text-sm font-bold text-slate-900">Record</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <Row label="Applied on" value={formatDateTime(application.createdAt)} />
              <Row label="Last updated" value={formatDateTime(application.updatedAt)} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

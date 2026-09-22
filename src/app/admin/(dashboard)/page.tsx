import { applications } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/auth";
import { StatCard } from "@/components/admin/stat-card";
import { QuickCreateAdmin } from "@/components/admin/quick-create-admin";
import { QuickNotification } from "@/components/admin/quick-notification";
import {
  AlertIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  IdCardIcon,
  PaperAirplaneIcon,
  RupeeIcon,
  SearchIcon,
  TrendDownIcon,
  TrendUpIcon,
  XCircleIcon,
} from "@/components/admin/icons";

export const dynamic = "force-dynamic";

type FacetCount = { count: number }[];
type FacetSum = { total: number }[];

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function count(rows: FacetCount): number {
  return rows[0]?.count ?? 0;
}

function sum(rows: FacetSum): number {
  return rows[0]?.total ?? 0;
}

export default async function AdminDashboardHome() {
  const session = await requireSuperAdmin();
  const isSuperAdmin = Boolean(session);

  const col = await applications();
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const [facets] = await col
    .aggregate<{
      total: FacetCount;
      last28Days: FacetCount;
      thisMonth: FacetCount;
      prevMonth: FacetCount;
      pendingPayment: FacetCount;
      underReview: FacetCount;
      documentsRequired: FacetCount;
      formSubmitted: FacetCount;
      admitCardIssued: FacetCount;
      completed: FacetCount;
      cancelled: FacetCount;
      revenueThisMonth: FacetSum;
      revenueTotal: FacetSum;
    }>([
      {
        $facet: {
          total: [{ $count: "count" }],
          last28Days: [{ $match: { createdAt: { $gte: last28 } } }, { $count: "count" }],
          thisMonth: [{ $match: { createdAt: { $gte: startOfThisMonth } } }, { $count: "count" }],
          prevMonth: [
            { $match: { createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth } } },
            { $count: "count" },
          ],
          pendingPayment: [{ $match: { paymentStatus: "PENDING" } }, { $count: "count" }],
          underReview: [{ $match: { status: "UNDER_REVIEW" } }, { $count: "count" }],
          documentsRequired: [{ $match: { status: "DOCUMENTS_REQUIRED" } }, { $count: "count" }],
          formSubmitted: [{ $match: { status: "FORM_SUBMITTED" } }, { $count: "count" }],
          admitCardIssued: [{ $match: { status: "ADMIT_CARD_ISSUED" } }, { $count: "count" }],
          completed: [{ $match: { status: "COMPLETED" } }, { $count: "count" }],
          cancelled: [{ $match: { status: "CANCELLED" } }, { $count: "count" }],
          revenueThisMonth: [
            { $match: { paymentStatus: "PAID", paidAt: { $gte: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          revenueTotal: [
            { $match: { paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
    ])
    .toArray();

  const totalApplications = count(facets.total);
  const thisMonthCount = count(facets.thisMonth);
  const prevMonthCount = count(facets.prevMonth);
  const trendDelta = thisMonthCount - prevMonthCount;
  const trendDown = trendDelta < 0;

  const revenueTotal = sum(facets.revenueTotal);
  const revenueThisMonth = sum(facets.revenueThisMonth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of admission applications and revenue.
        </p>
      </div>

      {/* Row 1: volume */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DocumentIcon}
          tone="blue"
          label="Total Applications"
          value={totalApplications.toLocaleString("en-IN")}
        />
        <StatCard
          icon={CalendarIcon}
          tone="purple"
          label="New (Last 28 Days)"
          value={count(facets.last28Days).toLocaleString("en-IN")}
        />
        <StatCard
          icon={trendDown ? TrendDownIcon : TrendUpIcon}
          tone={trendDown ? "red" : "green"}
          label="This Month vs Previous Month"
          value={`${trendDelta > 0 ? "+" : ""}${trendDelta.toLocaleString("en-IN")}`}
          sub={`This month: ${thisMonthCount.toLocaleString("en-IN")} · Previous month: ${prevMonthCount.toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={ClockIcon}
          tone="amber"
          label="Pending Payment"
          value={count(facets.pendingPayment).toLocaleString("en-IN")}
        />
      </div>

      {/* Row 2: workflow stages */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={SearchIcon}
          tone="sky"
          label="Under Review"
          value={count(facets.underReview).toLocaleString("en-IN")}
        />
        <StatCard
          icon={AlertIcon}
          tone="orange"
          label="Documents Required"
          value={count(facets.documentsRequired).toLocaleString("en-IN")}
        />
        <StatCard
          icon={PaperAirplaneIcon}
          tone="indigo"
          label="CBSE Form Submitted"
          value={count(facets.formSubmitted).toLocaleString("en-IN")}
        />
        <StatCard
          icon={IdCardIcon}
          tone="violet"
          label="Admit Card Issued"
          value={count(facets.admitCardIssued).toLocaleString("en-IN")}
        />
      </div>

      {/* Row 3: outcomes and revenue */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircleIcon}
          tone="emerald"
          label="Completed"
          value={count(facets.completed).toLocaleString("en-IN")}
        />
        <StatCard
          icon={XCircleIcon}
          tone="rose"
          label="Cancelled"
          value={count(facets.cancelled).toLocaleString("en-IN")}
        />
        {isSuperAdmin && (
          <>
            <StatCard
              icon={RupeeIcon}
              tone="pink"
              label="Revenue This Month"
              value={money(revenueThisMonth)}
            />
            <StatCard
              icon={RupeeIcon}
              tone="green"
              label="Total Collection"
              value={money(revenueTotal)}
            />
          </>
        )}
      </div>

      {isSuperAdmin && <QuickCreateAdmin />}

      <QuickNotification />
    </div>
  );
}

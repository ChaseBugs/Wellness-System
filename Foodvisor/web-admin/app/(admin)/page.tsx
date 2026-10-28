import { LibraryBig, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import VerificationQueueCard from "@/components/dashboard/VerificationQueueCard";
import RecentFeedCard from "@/components/dashboard/RecentFeedCard";
import BarMini from "@/components/charts/BarMini";
import Sparkline from "@/components/charts/Sparkline";
import Ring from "@/components/charts/Ring";
import { apiFetch } from "@/lib/api";

type DashboardData = {
  totals: Record<string, number>;
  unverified: Record<string, number>;
  recentAdditions: Array<{ resource: string; id: string; label: string; createdAt: string }>;
  trend: { last30Days: Array<{ date: string; total: number }> };
};

const FALLBACK: DashboardData = {
  totals: {}, unverified: {}, recentAdditions: [], trend: { last30Days: [] }
};

const RESOURCE_META: Record<string, { label: string; href: string }> = {
  foods: { label: "Foods", href: "/foods" },
  recipes: { label: "Recipes", href: "/recipes" },
  activities: { label: "Activities", href: "/activities" },
  users: { label: "Users", href: "/users" },
  mealLogs: { label: "Meal logs", href: "/meal-logs" },
  weightEntries: { label: "Weight entries", href: "/weight-entries" },
  programs: { label: "Programs", href: "/programs" },
  referenceSources: { label: "Reference sources", href: "/reference-sources" },
  nutrientIntakeRules: { label: "Nutrient intake rules", href: "/nutrient-intake-rules" },
  conditionDietRules: { label: "Condition diet rules", href: "/condition-diet-rules" },
  riskAssessmentRules: { label: "Risk assessment rules", href: "/risk-assessment-rules" },
  nutritionTerminology: { label: "Nutrition terminology", href: "/nutrition-terminology" },
  dataValidationRules: { label: "Data validation rules", href: "/data-validation-rules" }
};

export default async function DashboardPage() {
  const data = await apiFetch<DashboardData>("/dashboard").catch(() => FALLBACK);

  const totalRecords = Object.entries(data.totals).filter(([k]) => k !== "caloriesLogged").reduce((s, [, v]) => s + (v as number), 0);
  const totalUnverified = Object.values(data.unverified).reduce((s, v) => s + (v as number), 0);
  const verified = totalRecords - totalUnverified;

  const barItems = Object.keys(RESOURCE_META).map((k) => ({
    label: RESOURCE_META[k].label,
    value: data.totals[k] ?? 0,
    href: RESOURCE_META[k].href
  })).sort((a, b) => b.value - a.value);

  const queueRows = Object.keys(RESOURCE_META).map((k) => ({
    resource: k,
    label: RESOURCE_META[k].label,
    count: data.unverified[k] ?? 0,
    href: `${RESOURCE_META[k].href}?doctor_verified=false`
  }));

  const trendTotal = data.trend.last30Days.reduce((s, d) => s + d.total, 0);

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Total records, doctor-verification queue, and 30-day activity across every collection."
      />

      <div className="dashboard-hero">
        <KpiCard label="Total records" value={totalRecords} icon={LibraryBig} accent />
        <KpiCard label="Pending review" value={totalUnverified} icon={ShieldCheck} sub="doctor_verified = false" />
        <article className="dashboard-card kpi-ring-card">
          <Ring value={verified} total={Math.max(1, totalRecords)} size={72} />
          <div>
            <strong>Verified</strong>
            <span>{verified.toLocaleString()} of {totalRecords.toLocaleString()}</span>
          </div>
        </article>
        <article className="dashboard-card">
          <h3>30-day additions</h3>
          <Sparkline points={data.trend.last30Days.map((d) => d.total)} height={56} />
          <p className="dashboard-sub">{trendTotal.toLocaleString()} new records</p>
        </article>
      </div>

      <section className="dashboard-card">
        <h3>Records by collection</h3>
        <BarMini items={barItems} />
      </section>

      <div className="dashboard-grid">
        <VerificationQueueCard rows={queueRows} />
        <RecentFeedCard items={data.recentAdditions} />
      </div>
    </section>
  );
}

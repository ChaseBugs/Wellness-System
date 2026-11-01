"use client";

import Link from "next/link";
import { ClipboardCheck, CreditCard, Dumbbell, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import BarMini from "@/components/charts/BarMini";
import KpiCard from "@/components/dashboard/KpiCard";
import { ADMIN_BASES, platformFetch } from "@/lib/api";

/** GET /admin/overview */
type Overview = {
  accounts: { total: number; editors: number; admins: number; newLast7Days: number };
  subscriptions: { active: number; appPro: number; wellnessPass: number };
  review: { contentInReview: number; contentDrafts: number; exercisesAwaitingReview: number; routinesAwaitingReview: number };
  apps: Array<{ code: string; name: string; installs: number }>;
};

// Apps that have their own admin section here.
const APP_SECTIONS: Record<string, string> = { foodvisor: "/foodvisor", babygrow: "/babygrow", "height-increase": "/height" };

export default function PlatformOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    platformFetch<Overview>(`${ADMIN_BASES.platform}/overview`).then(setData).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const awaiting = data ? data.review.contentInReview + data.review.exercisesAwaitingReview + data.review.routinesAwaitingReview : 0;

  return (
    <section>
      <PageHeader title="Platform overview" subtitle="Accounts, subscriptions and the review backlog across every Wellness app." />
      {error ? <p className="error">{error}</p> : null}
      {!data && !error ? <p className="muted">Loading…</p> : null}
      {data ? (
        <>
          <div className="dashboard-hero">
            <KpiCard label="Accounts" value={data.accounts.total} icon={Users} sub={`${data.accounts.newLast7Days} new in 7 days`} accent />
            <KpiCard label="Staff" value={data.accounts.editors + data.accounts.admins} icon={ShieldCheck} sub={`${data.accounts.admins} admins · ${data.accounts.editors} editors`} />
            <KpiCard label="Active subscriptions" value={data.subscriptions.active} icon={CreditCard} sub={`${data.subscriptions.wellnessPass} Wellness Pass · ${data.subscriptions.appPro} App Pro`} />
            <KpiCard label="Awaiting expert review" value={awaiting} icon={ClipboardCheck} sub="content, exercises and routines" />
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card">
              <h3>Review backlog</h3>
              <BarMini
                items={[
                  { label: "Content in review", value: data.review.contentInReview, href: "/platform/review" },
                  { label: "Content drafts", value: data.review.contentDrafts, href: "/platform/review" },
                  { label: "Exercises awaiting review", value: data.review.exercisesAwaitingReview, href: "/platform/review?tab=exercises" },
                  { label: "Routines awaiting review", value: data.review.routinesAwaitingReview, href: "/platform/review?tab=routines" }
                ]}
              />
            </section>
            <section className="dashboard-card">
              <h3>Accounts per app</h3>
              <BarMini items={data.apps.map((app) => ({ label: app.name, value: app.installs, href: APP_SECTIONS[app.code] }))} />
            </section>
          </div>

          <section className="dashboard-card">
            <h3>Admin sections</h3>
            <div className="tab-row">
              <Link className="button-link" href="/foodvisor"><Dumbbell size={14} /> Foodvisor</Link>
              <Link className="button-link" href="/babygrow"><UserPlus size={14} /> BabyGrow</Link>
              <Link className="button-link" href="/height"><Dumbbell size={14} /> HeightIncrease</Link>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

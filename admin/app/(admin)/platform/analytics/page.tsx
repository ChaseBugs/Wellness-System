"use client";

import { Activity, Eye, Repeat, Users } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import BarMini from "@/components/charts/BarMini";
import KpiCard from "@/components/dashboard/KpiCard";
import { platformFetch } from "@/lib/api";

type CatalogApp = { code: string; name: string; backendModule: boolean };
type Kpis = {
  activeUsers: number;
  anonymousVisitors: number;
  topEvents: Array<{ name: string; count: number }>;
  retention: { cohortSize: number; d1: number; d7: number; d30: number };
};

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
const rate = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "—");

/** Active users, top events and D1/D7/D30 retention for one app (from client analytics events). */
export default function AnalyticsPage() {
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [app, setApp] = useState("foodvisor");
  const [from, setFrom] = useState(day(29));
  const [to, setTo] = useState(day(0));
  const [data, setData] = useState<Kpis | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    platformFetch<CatalogApp[]>("/catalog/apps").then(setApps).catch(() => setApps([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    platformFetch<Kpis>(`/analytics/kpis?app=${app}&from=${from}&to=${to}`)
      .then((kpis) => {
        if (cancelled) return;
        setData(kpis);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to load");
      });
    return () => { cancelled = true; };
  }, [app, from, to]);

  return (
    <section className="page">
      <PageHeader title="Analytics" subtitle="Usage from the apps' analytics events. Accounts are counted once across apps." />
      <section className="panel">
        <div className="toolbar">
          <select value={app} onChange={(e) => setApp(e.target.value)}>
            {(apps.length ? apps : [{ code: "foodvisor", name: "Foodvisor", backendModule: true }]).map((entry) => (
              <option key={entry.code} value={entry.code}>{entry.name}{entry.backendModule ? "" : " (no backend module)"}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {data ? (
        <>
          <div className="dashboard-hero">
            <KpiCard label="Active users" value={data.activeUsers} icon={Users} accent />
            <KpiCard label="Anonymous visitors" value={data.anonymousVisitors} icon={Eye} />
            <KpiCard label="New in period" value={data.retention.cohortSize} icon={Activity} />
            <KpiCard
              label="D7 retention"
              value={rate(data.retention.d7, data.retention.cohortSize)}
              icon={Repeat}
              sub={`D1 ${rate(data.retention.d1, data.retention.cohortSize)} · D30 ${rate(data.retention.d30, data.retention.cohortSize)}`}
            />
          </div>
          <section className="dashboard-card">
            <h3>Top events</h3>
            {data.topEvents.length ? <BarMini items={data.topEvents.map((event) => ({ label: event.name, value: event.count }))} /> : <p className="muted">No events in this period.</p>}
          </section>
        </>
      ) : null}
    </section>
  );
}

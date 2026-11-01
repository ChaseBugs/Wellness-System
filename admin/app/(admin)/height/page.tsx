"use client";

import { Activity, BookOpen, Dumbbell, Megaphone, Repeat, Users } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import BarMini from "@/components/charts/BarMini";
import KpiCard from "@/components/dashboard/KpiCard";
import { ADMIN_BASES, platformFetch } from "@/lib/api";

/** GET /apps/height-increase/admin/stats */
type HeightStats = {
  totals: { users: number; activeUsers: number; exercises: number; plans: number; articles: number; logsToday: number; notifications: number };
  latestLogs: Array<{ id: string; userEmail: string; date: string; heightCm: number | null; weightKg: number | null; workoutMinutes: number; sleepHours: number | null }>;
  charts: {
    workoutByDay: Array<{ label: string; entries: number; workoutMinutes: number; averageSleepHours: number }>;
    contentMix: Array<{ label: string; value: number }>;
  };
};

const show = (value: number | null) => (value === null || value === undefined ? "—" : String(value));

export default function HeightDashboardPage() {
  const [data, setData] = useState<HeightStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    platformFetch<HeightStats>(`${ADMIN_BASES.height}/stats`).then(setData).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  return (
    <section>
      <PageHeader title="HeightIncrease" subtitle="Live content (published only), users and the last 14 days of logs." />
      {error ? <p className="error">{error}</p> : null}
      {!data && !error ? <p className="muted">Loading…</p> : null}
      {data ? (
        <>
          <div className="dashboard-hero">
            <KpiCard label="Users" value={data.totals.users} icon={Users} sub={`${data.totals.activeUsers} active`} accent />
            <KpiCard label="Live exercises" value={data.totals.exercises} icon={Dumbbell} />
            <KpiCard label="Live plans" value={data.totals.plans} icon={Repeat} />
            <KpiCard label="Articles" value={data.totals.articles} icon={BookOpen} />
            <KpiCard label="Logs today" value={data.totals.logsToday} icon={Activity} />
            <KpiCard label="Push campaigns" value={data.totals.notifications} icon={Megaphone} />
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card">
              <h3>Workout minutes per day</h3>
              {data.charts.workoutByDay.length === 0 ? (
                <p className="muted">No logs in the last 14 days.</p>
              ) : (
                <BarMini items={data.charts.workoutByDay.map((day) => ({ label: `${day.label} (${day.entries})`, value: day.workoutMinutes }))} />
              )}
            </section>
            <section className="dashboard-card">
              <h3>Live content</h3>
              <BarMini items={data.charts.contentMix} />
            </section>
          </div>

          <section className="panel">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Date</th><th>Height</th><th>Weight</th><th>Sleep</th><th>Workout</th></tr>
                </thead>
                <tbody>
                  {data.latestLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.userEmail}</td>
                      <td>{log.date}</td>
                      <td>{show(log.heightCm)}</td>
                      <td>{show(log.weightKg)}</td>
                      <td>{show(log.sleepHours)}</td>
                      <td>{log.workoutMinutes}</td>
                    </tr>
                  ))}
                  {data.latestLogs.length === 0 ? <tr><td className="empty-row" colSpan={6}>No logs yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

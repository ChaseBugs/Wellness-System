"use client";

import { useEffect, useState } from "react";
import { BarChart, DonutChart, LineChart } from "@/components/Charts";
import PageHeader from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";
import { formatValue, labelize } from "@/lib/format";

type ChartItem = {
  label: string;
  value?: number;
  workoutMinutes?: number;
  entries?: number;
  averageSleepHours?: number;
};

type StatsResponse = {
  totals: Record<string, number>;
  latestLogs: Record<string, unknown>[];
  charts: {
    workoutByDay: ChartItem[];
    contentMix: ChartItem[];
    users: ChartItem[];
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<StatsResponse>("/admin/stats").then(setData).catch((err) => setError(err.message));
  }, []);

  return (
      <section className="page">
        <PageHeader
          title="Dashboard"
          subtitle="Detailed app activity, content inventory, and report trends."
        />

        {error ? <div className="error">{error}</div> : null}
        {!data ? <div className="muted">Loading dashboard...</div> : null}

        {data ? (
          <>
            <div className="grid">
              {Object.entries(data.totals).map(([key, value]) => (
                <div className="stat span-3" key={key}>
                  <b>{value}</b>
                  <span>{labelize(key)}</span>
                </div>
              ))}
            </div>

            <div className="grid">
              <section className="panel span-8">
                <div className="panel-head">
                  <h2>Workout Minutes Trend</h2>
                  <span className="badge">Last 14 days</span>
                </div>
                <div className="panel-body">
                  <LineChart data={data.charts.workoutByDay} />
                </div>
              </section>

              <section className="panel span-4">
                <div className="panel-head">
                  <h2>Content Mix</h2>
                </div>
                <div className="panel-body">
                  <DonutChart data={data.charts.contentMix} />
                </div>
              </section>

              <section className="panel span-6">
                <div className="panel-head">
                  <h2>User Status</h2>
                </div>
                <div className="panel-body">
                  <BarChart data={data.charts.users} />
                </div>
              </section>

              <section className="panel span-6">
                <div className="panel-head">
                  <h2>Daily Log Entries</h2>
                </div>
                <div className="panel-body">
                  <BarChart data={data.charts.workoutByDay} valueKey="entries" />
                </div>
              </section>
            </div>

            <section className="panel">
              <div className="panel-head">
                <h2>Latest Report Logs</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Date</th>
                      <th>Height</th>
                      <th>Weight</th>
                      <th>Sleep</th>
                      <th>Workout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.latestLogs.map((log, index) => (
                      <tr key={String(log._id || index)}>
                        <td>{formatValue(log.user)}</td>
                        <td>{formatValue(log.date)}</td>
                        <td>{formatValue(log.heightCm)}</td>
                        <td>{formatValue(log.weightKg)}</td>
                        <td>{formatValue(log.sleepHours)}</td>
                        <td>{formatValue(log.workoutMinutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </section>
  );
}

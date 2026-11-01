"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { platformFetch } from "@/lib/api";

type Rule = {
  id: string; code: string; sourceApp: string; targetApp: string; triggerEvent: string; lookbackDays: number;
  headline: string; priority: number; maxImpressionsPerWeek: number; isActive: boolean;
};
type RuleStats = { ruleId: string; impressions: number; clicks: number; dismissals: number; installs: number; clickThroughRate: number; installRate: number };

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

/** Cross-app recommendation rules (source app → target app) with their performance in a date range. */
export default function RecommendationsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [stats, setStats] = useState<RuleStats[]>([]);
  const [from, setFrom] = useState(day(29));
  const [to, setTo] = useState(day(0));
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  // Bumped after an edit to reload the rules.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      platformFetch<Rule[]>("/recommendations/rules"),
      platformFetch<RuleStats[]>(`/recommendations/stats?from=${from}&to=${to}`)
    ])
      .then(([ruleList, statList]) => {
        if (cancelled) return;
        setRules(ruleList);
        setStats(statList);
        setError("");
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load"); });
    return () => { cancelled = true; };
  }, [from, to, version]);

  const load = useCallback(() => setVersion((value) => value + 1), []);

  const statsById = useMemo(() => new Map(stats.map((row) => [row.ruleId, row])), [stats]);
  const q = query.toLowerCase();
  const visible = rules.filter((rule) => !q || rule.code.includes(q) || rule.sourceApp.includes(q) || rule.targetApp.includes(q));

  async function update(rule: Rule, body: Partial<Rule>) {
    try {
      await platformFetch(`/recommendations/rules/${rule.id}`, { method: "PATCH", body: JSON.stringify(body) });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  function editPriority(rule: Rule) {
    const value = window.prompt(`Priority for ${rule.code} (higher shows first)`, String(rule.priority));
    if (value === null) return;
    const priority = Number(value);
    if (!Number.isInteger(priority) || priority < 0) return setError("Priority must be a whole number of 0 or more");
    update(rule, { priority });
  }

  return (
    <section className="page">
      <PageHeader
        title="Recommendations"
        subtitle="Rules fire only for users who did the trigger in the source app, don't have the target app, and haven't opted out. They never read health or child data."
      />
      <section className="panel">
        <div className="toolbar">
          <label className="search-field"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by app or code" /></label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <span>{visible.length} rules</span>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule</th><th>From → to</th><th>Trigger</th><th>Priority</th><th>Shown</th><th>CTR</th><th>Installs</th><th>Install rate</th><th>Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((rule) => {
                const s = statsById.get(rule.id);
                return (
                  <tr key={rule.id}>
                    <td title={rule.headline}>{rule.code}</td>
                    <td>{rule.sourceApp} → {rule.targetApp}</td>
                    <td>{rule.triggerEvent} ({rule.lookbackDays}d)</td>
                    <td>{rule.priority}</td>
                    <td>{s?.impressions ?? 0}</td>
                    <td>{pct(s?.clickThroughRate ?? 0)}</td>
                    <td>{s?.installs ?? 0}</td>
                    <td>{pct(s?.installRate ?? 0)}</td>
                    <td><span className={`badge ${rule.isActive ? "ok" : ""}`}>{rule.isActive ? "on" : "off"}</span></td>
                    <td className="row-actions">
                      <button onClick={() => update(rule, { isActive: !rule.isActive })} type="button">{rule.isActive ? "Pause" : "Activate"}</button>
                      <button onClick={() => editPriority(rule)} type="button">Priority</button>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 ? <tr><td className="empty-row" colSpan={10}>No rules.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

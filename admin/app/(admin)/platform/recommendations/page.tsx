"use client";

import { Check, Plus, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import { ApiError, platformFetch } from "@/lib/api";

type Rule = {
  id: string; code: string; sourceApp: string; targetApp: string; triggerEvent: string; lookbackDays: number;
  headline: string; body: string | null; deepLink: string | null; priority: number; maxImpressionsPerWeek: number; isActive: boolean;
};
type RuleStats = { ruleId: string; impressions: number; clicks: number; dismissals: number; installs: number; clickThroughRate: number; installRate: number };
type CatalogApp = { code: string; name: string; lifecycle: string };
/** The rule being created (no id) or edited. */
type Draft = Partial<Rule>;

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

function describeError(err: unknown, fallback: string) {
  if (!(err instanceof Error)) return fallback;
  const details = err instanceof ApiError && Array.isArray(err.details) ? (err.details as Array<{ msg?: string; path?: string }>) : [];
  const messages = details.map((d) => (d.path ? `${d.path}: ${d.msg}` : d.msg)).filter(Boolean);
  return messages.length ? `${err.message}: ${messages.join(", ")}` : err.message;
}

/** Cross-app recommendation rules (source app → target app) with their performance in a date range. */
export default function RecommendationsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [stats, setStats] = useState<RuleStats[]>([]);
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [from, setFrom] = useState(day(29));
  const [to, setTo] = useState(day(0));
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    platformFetch<CatalogApp[]>("/catalog/apps")
      .then((list) => { if (!cancelled) setApps(list); })
      .catch(() => { /* The form falls back to free text when the catalog can't load. */ });
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(() => setVersion((value) => value + 1), []);

  const statsById = useMemo(() => new Map(stats.map((row) => [row.ruleId, row])), [stats]);
  const triggerEvents = useMemo(() => [...new Set(rules.map((rule) => rule.triggerEvent))].sort(), [rules]);
  const q = query.toLowerCase();
  const visible = rules.filter((rule) => !q || rule.code.includes(q) || rule.sourceApp.includes(q) || rule.targetApp.includes(q));

  async function update(rule: Rule, body: Partial<Rule>) {
    try {
      await platformFetch(`/recommendations/rules/${rule.id}`, { method: "PATCH", body: JSON.stringify(body) });
      load();
    } catch (err) {
      setError(describeError(err, "Update failed"));
    }
  }

  function editPriority(rule: Rule) {
    const value = window.prompt(`Priority for ${rule.code} (higher shows first)`, String(rule.priority));
    if (value === null) return;
    const priority = Number(value);
    if (!Number.isInteger(priority) || priority < 0) return setError("Priority must be a whole number of 0 or more");
    update(rule, { priority });
  }

  function openEditor(rule: Draft) {
    setFormError("");
    setDraft(rule);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const optional = (name: string) => text(name) || null;
    const body: Record<string, unknown> = {
      triggerEvent: text("triggerEvent"),
      lookbackDays: Number(text("lookbackDays")),
      headline: text("headline"),
      body: optional("body"),
      deepLink: optional("deepLink"),
      priority: Number(text("priority")),
      maxImpressionsPerWeek: Number(text("maxImpressionsPerWeek"))
    };
    if (!draft.id) {
      Object.assign(body, { code: text("code"), sourceApp: text("sourceApp"), targetApp: text("targetApp"), isActive: form.get("isActive") === "true" });
      if (body.sourceApp === body.targetApp) return setFormError("The source and target apps must differ.");
      // The create endpoint takes omitted optional fields, not nulls.
      if (body.body === null) delete body.body;
      if (body.deepLink === null) delete body.deepLink;
    }

    setSaving(true);
    try {
      await platformFetch(draft.id ? `/recommendations/rules/${draft.id}` : "/recommendations/rules", {
        method: draft.id ? "PATCH" : "POST",
        body: JSON.stringify(body)
      });
      setDraft(null);
      load();
    } catch (err) {
      setFormError(describeError(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Recommendations"
        subtitle="Rules fire only for users who did the trigger in the source app, don't have the target app, and haven't opted out. They never read health or child data."
        action={<button className="primary" type="button" onClick={() => openEditor({})}><Plus size={16} /> New rule</button>}
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
                <th>Rule</th><th>From → to</th><th>Trigger</th><th>Priority</th><th>Shown</th><th>CTR</th><th>Installs</th><th>Install rate</th><th>Active</th><th className="actions-wide">Actions</th>
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
                      <button onClick={() => openEditor(rule)} type="button">Edit</button>
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

      {draft && (
        <Modal onClose={() => setDraft(null)}>
          <form className="editor" onSubmit={submit}>
            <div className="modal-head">
              <h2>{draft.id ? `Edit ${draft.code}` : "New recommendation rule"}</h2>
              <button type="button" onClick={() => setDraft(null)}><X size={16} /> Close</button>
            </div>
            <div className="editor-grid">
              {draft.id ? null : (
                <>
                  <label>
                    <span>Code</span>
                    <input name="code" required pattern="[a-z0-9][a-z0-9_\-]{2,79}" placeholder="foodvisor-to-healthy-recipes" title="Lowercase letters, digits, - and _ (3-80)" />
                  </label>
                  <label>
                    <span>Starts active</span>
                    <select name="isActive" defaultValue="false"><option value="false">No (paused)</option><option value="true">Yes</option></select>
                  </label>
                  <AppSelect name="sourceApp" label="Source app (where the trigger happens)" apps={apps} />
                  <AppSelect name="targetApp" label="Target app (recommended)" apps={apps} />
                </>
              )}
              <label>
                <span>Trigger event</span>
                <input name="triggerEvent" required list="trigger-events" defaultValue={draft.triggerEvent ?? ""} pattern="[a-z][a-z0-9_]{1,63}" placeholder="meal_logged" title="An analytics event name: lowercase letters, digits and _" />
                <datalist id="trigger-events">{triggerEvents.map((name) => <option key={name} value={name} />)}</datalist>
              </label>
              <label>
                <span>Lookback (days)</span>
                <input name="lookbackDays" type="number" min={1} max={90} required defaultValue={draft.lookbackDays ?? 14} />
              </label>
              <label className="wide-field">
                <span>Headline</span>
                <input name="headline" required maxLength={140} defaultValue={draft.headline ?? ""} />
              </label>
              <label className="wide-field">
                <span>Body</span>
                <textarea name="body" maxLength={500} defaultValue={draft.body ?? ""} />
              </label>
              <label className="wide-field">
                <span>Deep link</span>
                <input name="deepLink" maxLength={500} defaultValue={draft.deepLink ?? ""} placeholder="wellness://healthy-recipes/home" />
              </label>
              <label>
                <span>Priority (higher shows first)</span>
                <input name="priority" type="number" min={0} max={10000} required defaultValue={draft.priority ?? 100} />
              </label>
              <label>
                <span>Max impressions per week</span>
                <input name="maxImpressionsPerWeek" type="number" min={1} max={50} required defaultValue={draft.maxImpressionsPerWeek ?? 3} />
              </label>
            </div>
            {formError ? <p className="error">{formError}</p> : null}
            <div className="editor-actions">
              <button type="button" onClick={() => setDraft(null)}><X size={16} /> Cancel</button>
              <button className="primary" type="submit" disabled={saving}><Check size={16} /> {saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

function AppSelect({ name, label, apps }: { name: string; label: string; apps: CatalogApp[] }) {
  return (
    <label>
      <span>{label}</span>
      {apps.length ? (
        <select name={name} required defaultValue="">
          <option value="" disabled>Select an app</option>
          {apps.map((app) => <option key={app.code} value={app.code}>{app.name} ({app.lifecycle})</option>)}
        </select>
      ) : (
        <input name={name} required placeholder="app code" />
      )}
    </label>
  );
}

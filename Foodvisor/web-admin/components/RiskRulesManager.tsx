"use client";

import { Activity, BadgeCheck, Calculator, RefreshCw, Ruler, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

type RiskRule = {
  _id: string;
  ruleKey: string;
  standardCode: string;
  metricKey: string;
  metricLabel: string;
  populationGroup: string;
  ageMin?: number;
  ageMax?: number;
  gender?: "all" | "male" | "female";
  thresholds?: unknown;
  interpretationKo: string;
  dataSource: string;
  sourceRefs?: string[];
  tags?: string[];
  doctor_verified?: boolean;
};

type ApiList = {
  items: RiskRule[];
  total: number;
  page: number;
  limit: number;
};

type ThresholdItem = {
  label?: string;
  comparator?: string;
  valueMin?: number;
  valueMax?: number;
  bmiMin?: number;
  bmiMax?: number;
  age?: number;
  maleOverweight?: number;
  maleObesity?: number;
  femaleOverweight?: number;
  femaleObesity?: number;
  maleP75?: number;
  maleP90?: number;
  femaleP75?: number;
  femaleP90?: number;
  bmiCategory?: string;
  totalGainMinKg?: number;
  totalGainMaxKg?: number;
  weeklyGainMinKg?: number;
  weeklyGainMaxKg?: number;
};

type WeightOrHeightThresholds = {
  male?: number[][];
  female?: number[][];
  unit?: string;
  bands?: string[];
  note?: string;
};

type HeightWeightThresholds = {
  formula?: string;
  chineseWst428?: ThresholdItem[];
  healthyWeightKgFormula?: { min?: string; max?: string };
};

const populationLabels: Record<string, string> = {
  adult: "adult",
  child_adolescent: "children/youth",
  pregnant: "pregnant woman"
};

const metricLabels: Record<string, string> = {
  bmi: "adult BMI",
  height_weight_bmi: "key-weight BMI",
  child_bmi: "children BMI",
  weight_kg: "weight by age",
  waist_cm: "waist circumference",
  height_cm: "height by age",
  pregnancy_weight_gain_kg: "pregnancy weight gain"
};

const metricOptions = [
  { value: "", label: "all indicators" },
  { value: "bmi", label: "adult BMI" },
  { value: "height_weight_bmi", label: "key-weight BMI" },
  { value: "child_bmi", label: "children BMI" },
  { value: "weight_kg", label: "weight by age" },
  { value: "height_cm", label: "height by age" },
  { value: "waist_cm", label: "waist circumference" },
  { value: "pregnancy_weight_gain_kg", label: "pregnancy weight gain" }
];

function ageLabel(rule: RiskRule) {
  if (rule.ageMin != null && rule.ageMax != null) return `${rule.ageMin}-${rule.ageMax}three`;
  if (rule.ageMin != null) return `${rule.ageMin}aged over`;
  if (rule.ageMax != null) return `${rule.ageMax}under age`;
  return "all";
}

function genderLabel(gender?: string) {
  if (gender === "male") return "male";
  if (gender === "female") return "female";
  return "all";
}

function comparatorLabel(item: ThresholdItem) {
  const min = item.valueMin ?? item.bmiMin;
  const max = item.valueMax ?? item.bmiMax;
  if (item.comparator === "lt") return `< ${max}`;
  if (item.comparator === "gte") return `>= ${min}`;
  if (min != null && max != null) return `${min} - ${max}`;
  if (min != null) return `>= ${min}`;
  if (max != null) return `< ${max}`;
  return "-";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asThresholdItems(value: unknown): ThresholdItem[] {
  return Array.isArray(value) ? value.filter(isObject) as ThresholdItem[] : [];
}

function renderSimpleBands(items: ThresholdItem[], unit = "") {
  return (
    <div className="risk-band-list">
      {items.map((item, index) => (
        <div className="risk-band" key={`${item.label ?? item.bmiCategory ?? index}-${index}`}>
          <span>{item.label ?? item.bmiCategory ?? `standard ${index + 1}`}</span>
          <strong>{comparatorLabel(item)}{unit ? ` ${unit}` : ""}</strong>
        </div>
      ))}
    </div>
  );
}

function renderRowsTable(rows: number[][], unit: string, heading: string) {
  return (
    <div className="risk-mini-table-block">
      <h3>{heading}</h3>
      <table className="risk-mini-table">
        <thead>
          <tr>
            <th>age</th>
            <th>-2 standard deviation</th>
            <th>-1 standard deviation</th>
            <th>median</th>
            <th>+1 standard deviation</th>
            <th>+2 standard deviation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${heading}-${row[0]}`}>
              <td>{row[0]}three</td>
              <td>{row[1]}{unit}</td>
              <td>{row[2]}{unit}</td>
              <td>{row[3]}{unit}</td>
              <td>{row[4]}{unit}</td>
              <td>{row[5]}{unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderGenderedGrowthTable(thresholds: WeightOrHeightThresholds, fallbackUnit: string) {
  const unit = thresholds.unit ?? fallbackUnit;
  return (
    <div className="risk-table-pair">
      {thresholds.male?.length ? renderRowsTable(thresholds.male, unit, "remain") : null}
      {thresholds.female?.length ? renderRowsTable(thresholds.female, unit, "girl") : null}
      {thresholds.note ? <p className="risk-note">{thresholds.note}</p> : null}
    </div>
  );
}

function renderChildBmiTable(items: ThresholdItem[]) {
  return (
    <table className="risk-mini-table">
      <thead>
        <tr>
          <th>age</th>
          <th>boy overweight</th>
          <th>boy obese</th>
          <th>girl overweight</th>
          <th>girl obesity</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={`bmi-${item.age}`}>
            <td>{item.age}three</td>
            <td>{item.maleOverweight}</td>
            <td>{item.maleObesity}</td>
            <td>{item.femaleOverweight}</td>
            <td>{item.femaleObesity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderWaistTable(items: ThresholdItem[]) {
  return (
    <table className="risk-mini-table">
      <thead>
        <tr>
          <th>age</th>
          <th>remain P75</th>
          <th>remain P90</th>
          <th>girl P75</th>
          <th>girl P90</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={`waist-${item.age}`}>
            <td>{item.age}three</td>
            <td>{item.maleP75}cm</td>
            <td>{item.maleP90}cm</td>
            <td>{item.femaleP75}cm</td>
            <td>{item.femaleP90}cm</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderPregnancy(items: ThresholdItem[]) {
  return (
    <table className="risk-mini-table">
      <thead>
        <tr>
          <th>BMI Classification</th>
          <th>total increase</th>
          <th>increase per week</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.bmiCategory}>
            <td>{item.bmiCategory}</td>
            <td>{item.totalGainMinKg}-{item.totalGainMaxKg}kg</td>
            <td>{item.weeklyGainMinKg}-{item.weeklyGainMaxKg}kg</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderThresholds(rule: RiskRule) {
  if (rule.metricKey === "weight_kg" && isObject(rule.thresholds)) {
    return renderGenderedGrowthTable(rule.thresholds as WeightOrHeightThresholds, "kg");
  }

  if (rule.metricKey === "height_cm" && isObject(rule.thresholds)) {
    return renderGenderedGrowthTable(rule.thresholds as WeightOrHeightThresholds, "cm");
  }

  if (rule.metricKey === "height_weight_bmi" && isObject(rule.thresholds)) {
    const thresholds = rule.thresholds as HeightWeightThresholds;
    return (
      <div className="risk-threshold-stack">
        <p className="risk-formula">{thresholds.formula}</p>
        {thresholds.chineseWst428 ? renderSimpleBands(thresholds.chineseWst428, "BMI") : null}
        {thresholds.healthyWeightKgFormula ? (
          <p className="risk-note">Calculate appropriate weight: {thresholds.healthyWeightKgFormula.min} - {thresholds.healthyWeightKgFormula.max}</p>
        ) : null}
      </div>
    );
  }

  const items = asThresholdItems(rule.thresholds);
  if (!items.length) return <p className="risk-note">Baseline values have not been finalized yet.</p>;

  if (rule.metricKey === "child_bmi") return renderChildBmiTable(items);
  if (rule.metricKey === "waist_cm") return renderWaistTable(items);
  if (rule.metricKey === "pregnancy_weight_gain_kg") return renderPregnancy(items);
  return renderSimpleBands(items, rule.metricKey.includes("bmi") ? "BMI" : "");
}

function ruleIcon(metricKey: string) {
  if (metricKey.includes("height") || metricKey.includes("weight")) return Ruler;
  if (metricKey.includes("bmi")) return Calculator;
  if (metricKey.includes("waist")) return Activity;
  return Users;
}

export default function RiskRulesManager() {
  const [items, setItems] = useState<RiskRule[]>([]);
  const [query, setQuery] = useState("");
  const [population, setPopulation] = useState("");
  const [metric, setMetric] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "100", sort: "metricKey" });
      if (query.trim()) params.set("q", query.trim());
      if (population) params.set("populationGroup", population);
      if (metric) params.set("metricKey", metric);
      const data = await apiFetch<ApiList>(`/risk-assessment-rules?${params.toString()}`);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Risk RulesFailed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [population, metric]);

  const stats = useMemo(() => {
    const child = items.filter((item) => item.populationGroup === "child_adolescent").length;
    const adult = items.filter((item) => item.populationGroup === "adult").length;
    const verified = items.filter((item) => item.doctor_verified).length;
    return { child, adult, verified };
  }, [items]);

  return (
    <section className="page risk-rules-page">
      <PageHeader
        title="Risk Rules"
        subtitle="key, weight, BMI, waist circumference, Pregnancy weight gain standards are organized in an easy-to-read manner for administrators.."
        action={<button type="button" onClick={load}><RefreshCw size={16} /> refresh</button>}
      />

      <section className="risk-summary-strip">
        <div><strong>{items.length}</strong><span>Showing</span></div>
        <div><strong>{stats.child}</strong><span>children/youth</span></div>
        <div><strong>{stats.adult}</strong><span>adult</span></div>
        <div><strong>{stats.verified}</strong><span>Verified</span></div>
      </section>

      <section className="panel">
        <div className="toolbar risk-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && load()}
              placeholder="standard name, indicators, Target Search"
            />
          </label>
          <button onClick={load} type="button">Search</button>
          <select className="sort-select" value={population} onChange={(event) => setPopulation(event.target.value)}>
            <option value="">all targets</option>
            <option value="adult">adult</option>
            <option value="child_adolescent">children/youth</option>
            <option value="pregnant">pregnant woman</option>
          </select>
          <select className="sort-select" value={metric} onChange={(event) => setMetric(event.target.value)}>
            {metricOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
          </select>
          <span>{loading ? "Loading..." : `${items.length}dog standard`}</span>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="risk-rule-grid">
          {items.map((rule) => {
            const Icon = ruleIcon(rule.metricKey);
            return (
              <article className="risk-rule-card" key={rule._id}>
                <header className="risk-rule-card-head">
                  <div className="risk-rule-icon"><Icon size={18} /></div>
                  <div>
                    <p>{rule.standardCode}</p>
                    <h2>{metricLabels[rule.metricKey] ?? rule.metricLabel}</h2>
                  </div>
                  {rule.doctor_verified ? <span className="badge ok"><BadgeCheck size={14} /> verification</span> : <span className="badge">Not verified</span>}
                </header>

                <div className="risk-meta-grid">
                  <span><b>target</b>{populationLabels[rule.populationGroup] ?? rule.populationGroup}</span>
                  <span><b>age</b>{ageLabel(rule)}</span>
                  <span><b>gender</b>{genderLabel(rule.gender)}</span>
                  <span><b>material</b>{rule.dataSource}</span>
                </div>

                <p className="risk-interpretation">{rule.interpretationKo}</p>

                <div className="risk-threshold-wrap">
                  {renderThresholds(rule)}
                </div>

                {rule.tags?.length ? (
                  <div className="risk-tag-row">
                    {rule.tags.map((tag, index) => <span key={`${rule._id}-${tag}-${index}`}>{tag}</span>)}
                  </div>
                ) : null}
              </article>
            );
          })}

          {!loading && !items.length ? <p className="empty-row">suitable for conditions Risk RuleThere is no.</p> : null}
        </div>
      </section>
    </section>
  );
}

"use client";

import { BadgeCheck, ClipboardCheck, Pencil, Plus, RefreshCw, Search, ShieldAlert, Target, Users, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

type NutrientRule = {
  _id?: string;
  ruleKey?: string;
  standardCode: string;
  nutrientKey: string;
  nutrientLabel: string;
  referenceType: string;
  unit: string;
  rawValue: string;
  comparator?: "eq" | "lt" | "lte" | "gt" | "gte" | "range";
  value?: number;
  valueMin?: number;
  valueMax?: number;
  ageGroup: string;
  ageMin?: number | null;
  ageMax?: number | null;
  gender?: "all" | "male" | "female";
  lifeStage?: string;
  populationGroup?: string;
  physicalActivityLevel?: string;
  dataSource: string;
  sourceNote?: string;
  sourceRefs?: string[];
  tags?: string[];
  doctor_verified?: boolean;
};

type ApiList = {
  items: NutrientRule[];
  total: number;
  page: number;
  limit: number;
};

type NutrientSummary = {
  key: string;
  label: string;
  count: number;
  verified: number;
  referenceTypes: string[];
};

const referenceLabels: Record<string, string> = {
  EER: "energy needs",
  EAR: "Average Requirement",
  RNI: "Recommended intake amount",
  AI: "Sufficient intake amount",
  UL: "upper intake limit",
  AMDR: "Energy ratio",
  PI: "Preventive intake amount",
  SPL: "Specific limit amount"
};

const referenceTone: Record<string, string> = {
  RNI: "good",
  AI: "good",
  EER: "energy",
  EAR: "base",
  UL: "danger",
  AMDR: "range"
};

const populationLabels: Record<string, string> = {
  general: "general",
  infant: "breastfeeding",
  child: "children",
  adolescent: "youth",
  adult: "adult",
  senior: "Loin",
  pregnant: "pregnant woman",
  lactating: "breastfeeding woman"
};

const genderLabels: Record<string, string> = {
  all: "all",
  male: "male",
  female: "woman"
};

const lifeStageLabels: Record<string, string> = {
  general: "general",
  pregnant: "pregnancy",
  lactating: "lactation"
};

const nutrientKoLabels: Record<string, string> = {
  biotin: "biotin",
  calcium: "Calcium",
  carbs: "carbohydrates",
  chloride: "goat",
  choline: "Colin",
  chromium: "chrome",
  copper: "Dong",
  energyKcal: "energy",
  fat: "fat",
  folate: "folic acid",
  iodine: "Yod",
  iron: "iron",
  magnesium: "Magnesium",
  molybdenum: "molybdenum",
  niacin: "niacin",
  niacinamide: "Niacinamide",
  pantothenicAcid: "pantothenic acid",
  potassium: "Calium",
  protein: "protein",
  selenium: "selenium",
  sodium: "Sodium",
  vitaminA: "vitamins A",
  vitaminB1: "vitamins B1",
  vitaminB2: "vitamins B2",
  vitaminB6: "vitamins B6",
  vitaminB12: "vitamins B12",
  vitaminC: "vitamins C",
  vitaminD: "vitamins D",
  vitaminE: "vitamins E",
  vitaminK: "vitamins K",
  zinc: "zinc",
  n3PolyunsaturatedFattyAcid: "n-3 Polyunsaturated fatty acids",
  n6PolyunsaturatedFattyAcid: "n-6 Polyunsaturated fatty acids"
};

const defaultSource = "Chinese Dietary Reference Intakes WST578";

function normalizeUnit(unit: string) {
  return unit.replace("?g", "ug");
}

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "";
  return Number.isInteger(value) ? String(value) : String(value);
}

function valueText(rule: NutrientRule) {
  const unit = normalizeUnit(rule.unit);
  if (rule.comparator === "range") return `${formatNumber(rule.valueMin)}-${formatNumber(rule.valueMax)} ${unit}`.trim();
  if (rule.comparator === "lt") return `< ${formatNumber(rule.value)} ${unit}`.trim();
  if (rule.comparator === "lte") return `<= ${formatNumber(rule.value)} ${unit}`.trim();
  if (rule.comparator === "gt") return `> ${formatNumber(rule.value)} ${unit}`.trim();
  if (rule.comparator === "gte") return `>= ${formatNumber(rule.value)} ${unit}`.trim();
  return `${rule.rawValue || formatNumber(rule.value)} ${unit}`.trim();
}

function ageText(rule: NutrientRule) {
  if (rule.ageGroup) return rule.ageGroup.replace("～", "From three years old");
  if (rule.ageMin != null && rule.ageMax != null) return `${rule.ageMin}-${rule.ageMax}three`;
  if (rule.ageMin != null) return `${rule.ageMin}From three years old`;
  if (rule.ageMax != null) return `${rule.ageMax}up to three`;
  return "all";
}

function splitTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
}

function blankRule(selectedNutrient: string, summaries: NutrientSummary[]): Partial<NutrientRule> {
  const nutrient = summaries.find((item) => item.key === selectedNutrient) ?? summaries[0];
  return {
    standardCode: "WST578",
    nutrientKey: nutrient?.key ?? "",
    nutrientLabel: nutrient?.label ?? "",
    referenceType: "RNI",
    unit: "mg/d",
    rawValue: "",
    comparator: "eq",
    ageGroup: "",
    gender: "all",
    lifeStage: "general",
    populationGroup: "general",
    dataSource: defaultSource,
    sourceRefs: [],
    tags: ["WST578", "DRI"],
    doctor_verified: false
  };
}

function summarizeNutrients(items: NutrientRule[]) {
  const map = new Map<string, NutrientSummary>();
  for (const item of items) {
    const current = map.get(item.nutrientKey) ?? {
      key: item.nutrientKey,
      label: item.nutrientLabel,
      count: 0,
      verified: 0,
      referenceTypes: []
    };
    current.count += 1;
    if (item.doctor_verified) current.verified += 1;
    if (!current.referenceTypes.includes(item.referenceType)) current.referenceTypes.push(item.referenceType);
    map.set(item.nutrientKey, current);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function uniqueOptions(items: NutrientRule[], key: keyof NutrientRule) {
  return [...new Set(items.map((item) => String(item[key] ?? "")).filter(Boolean))].sort();
}

function nutrientDisplayName(item?: Pick<NutrientSummary, "key" | "label">) {
  if (!item) return "Choose your nutrients";
  return nutrientKoLabels[item.key] ?? item.label;
}

type NutrientIntakeRulesManagerProps = {
  embedded?: boolean;
};

export default function NutrientIntakeRulesManager({ embedded = false }: NutrientIntakeRulesManagerProps) {
  const [items, setItems] = useState<NutrientRule[]>([]);
  const [selectedNutrient, setSelectedNutrient] = useState("");
  const [nutrientQuery, setNutrientQuery] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [populationGroup, setPopulationGroup] = useState("");
  const [gender, setGender] = useState("");
  const [lifeStage, setLifeStage] = useState("");
  const [editing, setEditing] = useState<Partial<NutrientRule> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const first = await apiFetch<ApiList>("/nutrient-intake-rules?page=1&limit=500&sort=nutrientKey");
      const pages = Math.ceil(first.total / first.limit);
      const rest = await Promise.all(
        Array.from({ length: Math.max(pages - 1, 0) }, (_, index) =>
          apiFetch<ApiList>(`/nutrient-intake-rules?page=${index + 2}&limit=500&sort=nutrientKey`)
        )
      );
      const all = [first, ...rest].flatMap((page) => page.items);
      setItems(all);
      setSelectedNutrient((current) => current || (all.find((item) => item.nutrientKey === "energyKcal")?.nutrientKey ?? all[0]?.nutrientKey ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load nutritional intake guidelines.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const summaries = useMemo(() => summarizeNutrients(items), [items]);
  const nutrientOptions = useMemo(() => (
    summaries.filter((item) => {
      const q = nutrientQuery.trim().toLowerCase();
      const koLabel = nutrientDisplayName(item).toLowerCase();
      return !q || item.key.toLowerCase().includes(q) || item.label.toLowerCase().includes(q) || koLabel.includes(q);
    })
  ), [summaries, nutrientQuery]);

  const selectedSummary = summaries.find((item) => item.key === selectedNutrient);
  const selectedItems = useMemo(() => items
    .filter((item) => item.nutrientKey === selectedNutrient)
    .filter((item) => !referenceType || item.referenceType === referenceType)
    .filter((item) => !populationGroup || item.populationGroup === populationGroup)
    .filter((item) => !gender || item.gender === gender)
    .filter((item) => !lifeStage || item.lifeStage === lifeStage)
    .sort((a, b) => (a.ageMin ?? 999) - (b.ageMin ?? 999) || String(a.gender).localeCompare(String(b.gender)) || a.referenceType.localeCompare(b.referenceType)),
  [items, selectedNutrient, referenceType, populationGroup, gender, lifeStage]);

  const grouped = useMemo(() => {
    const map = new Map<string, NutrientRule[]>();
    for (const item of selectedItems) map.set(item.referenceType, [...(map.get(item.referenceType) ?? []), item]);
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [selectedItems]);

  const referenceOptions = uniqueOptions(items.filter((item) => item.nutrientKey === selectedNutrient), "referenceType");
  const populationOptions = uniqueOptions(items.filter((item) => item.nutrientKey === selectedNutrient), "populationGroup");
  const genderOptions = uniqueOptions(items.filter((item) => item.nutrientKey === selectedNutrient), "gender");
  const lifeStageOptions = uniqueOptions(items.filter((item) => item.nutrientKey === selectedNutrient), "lifeStage");
  const verifiedCount = items.filter((item) => item.doctor_verified).length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const formData = new FormData(event.currentTarget);
    const nutrientKey = String(formData.get("nutrientKey") ?? "").trim();
    const referenceTypeValue = String(formData.get("referenceType") ?? "").trim();
    const ageGroup = String(formData.get("ageGroup") ?? "").trim();
    const genderValue = String(formData.get("gender") ?? "all").trim();
    const payload: Record<string, unknown> = {
      ruleKey: String(formData.get("ruleKey") ?? "").trim() || `wst578-${nutrientKey}-${referenceTypeValue}-${ageGroup}-${genderValue}`.replaceAll(" ", "-"),
      standardCode: String(formData.get("standardCode") ?? "WST578").trim(),
      nutrientKey,
      nutrientLabel: String(formData.get("nutrientLabel") ?? "").trim(),
      referenceType: referenceTypeValue,
      unit: String(formData.get("unit") ?? "").trim(),
      rawValue: String(formData.get("rawValue") ?? "").trim(),
      comparator: String(formData.get("comparator") ?? "eq"),
      value: optionalNumber(formData.get("value")),
      valueMin: optionalNumber(formData.get("valueMin")),
      valueMax: optionalNumber(formData.get("valueMax")),
      ageGroup,
      ageMin: optionalNumber(formData.get("ageMin")),
      ageMax: optionalNumber(formData.get("ageMax")),
      gender: genderValue,
      lifeStage: String(formData.get("lifeStage") ?? "general").trim() || "general",
      populationGroup: String(formData.get("populationGroup") ?? "general").trim() || "general",
      physicalActivityLevel: String(formData.get("physicalActivityLevel") ?? "").trim(),
      dataSource: String(formData.get("dataSource") ?? defaultSource).trim() || defaultSource,
      sourceNote: String(formData.get("sourceNote") ?? "").trim(),
      sourceRefs: splitTags(formData.get("sourceRefs")),
      tags: splitTags(formData.get("tags")),
      doctor_verified: formData.get("doctor_verified") === "true"
    };

    setSaving(true);
    setError("");
    try {
      const id = editing._id;
      await apiFetch<NutrientRule>(id ? `/nutrient-intake-rules/${id}` : "/nutrient-intake-rules", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setEditing(null);
      await load();
      setSelectedNutrient(nutrientKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save nutritional intake guidelines.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={embedded ? "nutrient-rules-page is-embedded" : "page nutrient-rules-page"}>
      {embedded ? null : (
        <PageHeader
          title="Nutrient intake standards"
          subtitle="age, gender, pregnancy/lactation, View energy and nutrient standards at a glance according to your activity level.."
          action={(
            <div className="nutrient-actions">
              <button className="primary" type="button" onClick={() => setEditing(blankRule(selectedNutrient, summaries))}><Plus size={16} /> new standards</button>
              <button type="button" onClick={load} aria-label="refresh"><RefreshCw size={16} /></button>
            </div>
          )}
        />
      )}

      {embedded ? (
        <div className="nutrient-embedded-head">
          <div>
            <p>WST578 rubric</p>
            <h2>Nutrient intake standards according to age and gender</h2>
          </div>
          <div className="nutrient-actions">
            <button className="primary" type="button" onClick={() => setEditing(blankRule(selectedNutrient, summaries))}><Plus size={16} /> new standards</button>
            <button type="button" onClick={load} aria-label="refresh"><RefreshCw size={16} /></button>
          </div>
        </div>
      ) : null}

      <section className="nutrient-summary-strip">
        <div><ClipboardCheck size={18} /><strong>{items.length}</strong><span>overall criteria</span></div>
        <div><Target size={18} /><strong>{summaries.length}</strong><span>nutrients</span></div>
        <div><BadgeCheck size={18} /><strong>{verifiedCount}</strong><span>Verified</span></div>
        <div><Users size={18} /><strong>{selectedSummary?.count ?? 0}</strong><span>select nutrients</span></div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="nutrient-layout">
        <aside className="nutrient-sidebar-panel">
          <div className="nutrient-sidebar-title">
            <div>
              <p>Nutrients List</p>
              <strong>{nutrientOptions.length}dog</strong>
            </div>
            <span>{loading ? "..." : `${summaries.length}`}</span>
          </div>
          <label className="search-field">
            <Search size={16} />
            <input value={nutrientQuery} onChange={(event) => setNutrientQuery(event.target.value)} placeholder="Nutrient Search" />
          </label>
          <div className="nutrient-list">
            {nutrientOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                className={item.key === selectedNutrient ? "active" : ""}
                onClick={() => {
                  setSelectedNutrient(item.key);
                  setReferenceType("");
                  setPopulationGroup("");
                  setGender("");
                  setLifeStage("");
                }}
              >
                <div className="nutrient-list-main">
                  <span>{nutrientDisplayName(item)}</span>
                  <b>{item.count}</b>
                </div>
                <small>{item.label}</small>
                <div className="nutrient-ref-chips">
                  {item.referenceTypes.map((type) => <i key={`${item.key}-${type}`}>{type}</i>)}
                </div>
              </button>
            ))}
            {!nutrientOptions.length ? <p className="nutrient-list-empty">No nutrients found.</p> : null}
          </div>
        </aside>

        <section className="nutrient-main-panel">
          <div className="nutrient-selected-head">
            <div>
              <p>{selectedSummary?.key ?? "nutrient"}</p>
              <h2>{nutrientDisplayName(selectedSummary)}</h2>
            </div>
            <span>{loading ? "Loading..." : `${selectedItems.length}dog standard display`}</span>
          </div>

          <div className="nutrient-filter-row">
            <select value={referenceType} onChange={(event) => setReferenceType(event.target.value)} aria-label="Standard type">
              <option value="">All standard types</option>
              {referenceOptions.map((value) => <option key={value} value={value}>{referenceLabels[value] ?? value}</option>)}
            </select>
            <select value={populationGroup} onChange={(event) => setPopulationGroup(event.target.value)} aria-label="target">
              <option value="">all targets</option>
              {populationOptions.map((value) => <option key={value} value={value}>{populationLabels[value] ?? value}</option>)}
            </select>
            <select value={gender} onChange={(event) => setGender(event.target.value)} aria-label="gender">
              <option value="">all genders</option>
              {genderOptions.map((value) => <option key={value} value={value}>{genderLabels[value] ?? value}</option>)}
            </select>
            <select value={lifeStage} onChange={(event) => setLifeStage(event.target.value)} aria-label="menstrual stage">
              <option value="">every step</option>
              {lifeStageOptions.map((value) => <option key={value} value={value}>{lifeStageLabels[value] ?? value}</option>)}
            </select>
          </div>

          <div className="nutrient-reference-stack">
            {grouped.map(([type, rules]) => (
              <article className={`nutrient-reference-card is-${referenceTone[type] ?? "base"}`} key={type}>
                <header>
                  <div>
                    <p>{type}</p>
                    <h3>{referenceLabels[type] ?? type}</h3>
                  </div>
                  <span>{rules.length}dog</span>
                </header>
                <div className="nutrient-rule-table-wrap">
                  <table className="nutrient-rule-table">
                    <thead>
                      <tr>
                        <th>age</th>
                        <th>target</th>
                        <th>gender</th>
                        <th>step/activity</th>
                        <th>reference value</th>
                        <th>status</th>
                        <th>edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule) => (
                        <tr key={rule._id ?? rule.ruleKey}>
                          <td>{ageText(rule)}</td>
                          <td>{populationLabels[rule.populationGroup ?? ""] ?? rule.populationGroup ?? "general"}</td>
                          <td>{genderLabels[rule.gender ?? "all"] ?? rule.gender}</td>
                          <td>{lifeStageLabels[rule.lifeStage ?? "general"] ?? rule.lifeStage}{rule.physicalActivityLevel ? ` · ${rule.physicalActivityLevel}` : ""}</td>
                          <td><strong>{valueText(rule)}</strong></td>
                          <td>{rule.doctor_verified ? <span className="badge ok"><BadgeCheck size={14} /> verification</span> : <span className="badge"><ShieldAlert size={14} /> Confirmation required</span>}</td>
                          <td><button type="button" className="nutrient-edit-button" onClick={() => setEditing(rule)} aria-label="Modification of intake standards"><Pencil size={14} /> Edit</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}

            {!loading && !grouped.length ? <p className="empty-row">There are no nutritional intake standards suitable for the conditions..</p> : null}
          </div>
        </section>
      </section>

      {editing ? (
        <Modal onClose={() => setEditing(null)}>
          <form className="editor nutrient-editor" onSubmit={submit}>
            <div className="modal-head">
              <h2>{editing._id ? "Modification of intake standards" : "Addition of new intake standards"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="close"><X size={16} /></button>
            </div>
            <div className="editor-grid">
              <label>rules key<input name="ruleKey" defaultValue={editing.ruleKey ?? ""} placeholder="Automatically generated when empty" /></label>
              <label>standard code<input name="standardCode" defaultValue={editing.standardCode ?? "WST578"} required /></label>
              <label>nutrients key<input name="nutrientKey" defaultValue={editing.nutrientKey ?? ""} required /></label>
              <label>nutrient name<input name="nutrientLabel" defaultValue={editing.nutrientLabel ?? ""} required /></label>
              <label>Standard type<input name="referenceType" defaultValue={editing.referenceType ?? "RNI"} required /></label>
              <label>unit<input name="unit" defaultValue={editing.unit ?? ""} required /></label>
              <label>Raw data value<input name="rawValue" defaultValue={editing.rawValue ?? ""} required /></label>
              <label>comparative expression
                <select name="comparator" defaultValue={editing.comparator ?? "eq"}>
                  <option value="eq">Same as</option><option value="lt">less than</option><option value="lte">Below</option>
                  <option value="gt">excess</option><option value="gte">more than</option><option value="range">range</option>
                </select>
              </label>
              <label>value<input name="value" type="number" step="any" defaultValue={editing.value ?? ""} /></label>
              <label>minimum value<input name="valueMin" type="number" step="any" defaultValue={editing.valueMin ?? ""} /></label>
              <label>maximum value<input name="valueMax" type="number" step="any" defaultValue={editing.valueMax ?? ""} /></label>
              <label>Age range<input name="ageGroup" defaultValue={editing.ageGroup ?? ""} required /></label>
              <label>Minimum age<input name="ageMin" type="number" step="any" defaultValue={editing.ageMin ?? ""} /></label>
              <label>age max<input name="ageMax" type="number" step="any" defaultValue={editing.ageMax ?? ""} /></label>
              <label>gender
                <select name="gender" defaultValue={editing.gender ?? "all"}>
                  <option value="all">all</option><option value="male">male</option><option value="female">woman</option>
                </select>
              </label>
              <label>menstrual stage<input name="lifeStage" defaultValue={editing.lifeStage ?? "general"} /></label>
              <label>target<input name="populationGroup" defaultValue={editing.populationGroup ?? "general"} /></label>
              <label>activity level<input name="physicalActivityLevel" defaultValue={editing.physicalActivityLevel ?? ""} /></label>
              <label>doctor verification
                <select name="doctor_verified" defaultValue={String(Boolean(editing.doctor_verified))}>
                  <option value="false">Not verified</option><option value="true">verification</option>
                </select>
              </label>
              <label className="wide-field">data source<input name="dataSource" defaultValue={editing.dataSource ?? defaultSource} required /></label>
              <label className="wide-field">Source Description<textarea name="sourceNote" defaultValue={editing.sourceNote ?? ""} /></label>
              <label className="wide-field">source file<input name="sourceRefs" defaultValue={(editing.sourceRefs ?? []).join(", ")} /></label>
              <label className="wide-field">tag<input name="tags" defaultValue={(editing.tags ?? []).join(", ")} /></label>
            </div>
            <div className="editor-actions">
              <button type="button" onClick={() => setEditing(null)}>Cancel</button>
              <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "save"}</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

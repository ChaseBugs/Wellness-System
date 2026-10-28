"use client";

import { AlertTriangle, BadgeCheck, Ban, CheckCircle2, HeartPulse, Pencil, Plus, RefreshCw, Search, ShieldAlert, SlidersHorizontal, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

type DietRule = {
  _id: string;
  ruleKey: string;
  conditionKey: string;
  conditionLabel: string;
  ruleType: string;
  priority?: number;
  nutrientKey?: string;
  comparator?: "eq" | "lt" | "lte" | "gt" | "gte" | "range" | "avoid" | "prefer";
  targetValue?: number;
  targetMin?: number;
  targetMax?: number;
  unit?: string;
  recommendationKo: string;
  foodTagsPrefer?: string[];
  foodTagsAvoid?: string[];
  cautionTags?: string[];
  dataSource: string;
  doctor_verified?: boolean;
};

type ApiList = {
  items: DietRule[];
  total: number;
  page: number;
  limit: number;
};

type ConditionOption = {
  _id: string;
  conditionKey: string;
  conditionLabel: string;
  descriptionKo?: string;
  sortOrder?: number;
  dataSource?: string;
  doctor_verified?: boolean;
};

type ConditionApiList = {
  items: ConditionOption[];
  total: number;
  page: number;
  limit: number;
};

type RuleMode = "all" | "avoid" | "prefer" | "limit";
type Comparator = NonNullable<DietRule["comparator"]>;

const conditionNames: Record<string, string> = {
  hypertension: "high blood pressure",
  hyperlipidemia: "hyperlipidemia",
  diabetes: "diabetes",
  adult_obesity: "adult obesity",
  child_obesity: "Obesity in children and adolescents",
  gout_hyperuricemia: "hyperuricemia/gout",
  ckd: "chronic kidney disease",
  stroke: "stroke",
  cancer: "malignant tumor",
  elderly: "elderly people",
  gestational_diabetes: "gestational diabetes",
  infant_complementary_feeding: "Supplementary food for weaning"
};

const nutrientNames: Record<string, string> = {
  sodium: "sodium",
  potassium: "potassium",
  carbs: "carbohydrates",
  addedSugar: "Added sugar",
  saturatedFat: "saturated fat",
  cholesterol: "cholesterol",
  fiber: "dietary fiber",
  energyKcal: "calories",
  protein: "protein",
  phosphorus: "lean",
  calcium: "Calcium",
  iron: "iron"
};

const tagNames: Record<string, string> = {
  low_sodium: "blandly",
  high_sodium: "salty food",
  processed_food: "processed food",
  pickled_food: "pickled food",
  high_potassium: "foods high in potassium",
  high_fiber: "Foods high in dietary fiber",
  whole_grain: "wailing",
  vegetable: "Vegetables",
  fruit: "fruit",
  legume: "legumes",
  low_gi: "low glycemic index",
  sweet_drink: "sweet drink",
  added_sugar: "Added sugar",
  sweet_snack: "sweet snack",
  fried_food: "fried food",
  high_saturated_fat: "Foods high in saturated fat",
  high_cholesterol: "foods high in cholesterol",
  plant_food: "plant food",
  unsaturated_fat: "unsaturated fat",
  fish: "fish",
  low_energy_density: "low caloric density",
  high_energy_density: "high caloric density",
  high_protein: "foods high in protein",
  vegetable_fruit_priority: "vegetables and fruits",
  lean_protein: "lean protein",
  fast_food: "Attribute food",
  balanced_meal: "balanced diet",
  milk: "milk products",
  regular_meal: "regular meals",
  activity: "increase activity",
  late_night_snack: "It's late at night",
  low_purine: "low purine foods",
  high_purine_seafood: "Purine-rich seafood",
  organ_meat: "organ meat",
  alcohol: "alcohol",
  water: "water",
  low_sugar: "mortgage",
  fructose: "Fructose",
  high_quality_protein: "high quality protein",
  egg: "chicken egg",
  tofu: "tofu",
  low_potassium_vegetable: "low potassium vegetables",
  banana: "banana",
  orange: "orange",
  potato: "potato",
  fresh_food: "fresh food",
  fresh_meat: "fresh meat",
  phosphate_additive: "lean additives",
  cola: "cola",
  balanced_fluid: "water balance",
  excess_fluid: "overhydration",
  plant_oil: "vegetable oil",
  nuts: "nuts",
  smoked_food: "smoked food",
  processed_meat: "processed meat",
  dairy: "milk products",
  small_fish: "small fish",
  soft_food: "soft food",
  small_meal: "Small meals",
  hard_food: "hard food",
  small_frequent: "Eat small amounts often",
  balanced_weight_gain: "weight gain balance",
  iron_fortified: "iron fortified diet",
  red_meat: "red meat",
  liver: "Liver",
  natural_food: "natural food",
  salt: "salt",
  honey: "honey",
  age_appropriate_texture: "Monthly age-customized texture",
  single_introduction: "Introduce one thing at a time",
  multiple_allergen_at_once: "Simultaneous introduction of multiple allergic foods"
};

const modeOptions: Array<{ value: RuleMode; label: string }> = [
  { value: "all", label: "full rules" },
  { value: "avoid", label: "limit/prohibited" },
  { value: "prefer", label: "recommended" },
  { value: "limit", label: "Numerical criteria" }
];

const comparatorOptions: Array<{ value: Comparator; label: string }> = [
  { value: "avoid", label: "limit/prohibited" },
  { value: "prefer", label: "recommended" },
  { value: "lte", label: "Below" },
  { value: "lt", label: "less than" },
  { value: "gte", label: "more than" },
  { value: "gt", label: "excess" },
  { value: "range", label: "range" },
  { value: "eq", label: "Same as" }
];

const dataSourceDefault = "Chinese national food therapy and diet guidelines";

function labelCondition(rule: DietRule) {
  return conditionNames[rule.conditionKey] ?? rule.conditionLabel ?? rule.conditionKey;
}

function conditionLabelFromOptions(conditions: ConditionOption[], conditionKey: string) {
  return conditions.find((item) => item.conditionKey === conditionKey)?.conditionLabel ?? conditionNames[conditionKey] ?? conditionKey;
}

function labelTag(tag: string) {
  return tagNames[tag] ?? tag.replaceAll("_", " ");
}

function ruleMode(rule: DietRule): Exclude<RuleMode, "all"> {
  if (rule.comparator === "avoid" || (rule.foodTagsAvoid?.length ?? 0) > 0 || (rule.cautionTags?.length ?? 0) > 0) return "avoid";
  if (rule.comparator === "prefer") return "prefer";
  return "limit";
}

function modeLabel(mode: Exclude<RuleMode, "all">) {
  if (mode === "avoid") return "limit";
  if (mode === "prefer") return "recommended";
  return "standard";
}

function targetText(rule: DietRule) {
  const nutrient = rule.nutrientKey ? nutrientNames[rule.nutrientKey] ?? rule.nutrientKey : "food";
  const unit = rule.unit ? ` ${rule.unit}` : "";
  if (rule.comparator === "avoid") return "Avoid";
  if (rule.comparator === "prefer") return "First of all";
  if (rule.comparator === "lt") return `${nutrient} < ${rule.targetValue}${unit}`;
  if (rule.comparator === "lte") return `${nutrient} <= ${rule.targetValue ?? "standard"}${unit}`;
  if (rule.comparator === "gt") return `${nutrient} > ${rule.targetValue}${unit}`;
  if (rule.comparator === "gte") return `${nutrient} >= ${rule.targetValue}${unit}`;
  if (rule.comparator === "range") {
    const min = rule.targetMin != null ? rule.targetMin : "";
    const max = rule.targetMax != null ? rule.targetMax : "";
    return `${nutrient} ${min}-${max}${unit}`.replace(" -", " ");
  }
  return nutrient;
}

function modeIcon(mode: Exclude<RuleMode, "all">) {
  if (mode === "avoid") return Ban;
  if (mode === "prefer") return CheckCircle2;
  return SlidersHorizontal;
}

function modeClass(mode: Exclude<RuleMode, "all">) {
  if (mode === "avoid") return "condition-rule-card is-avoid";
  if (mode === "prefer") return "condition-rule-card is-prefer";
  return "condition-rule-card is-limit";
}

function groupByCondition(items: DietRule[], conditions: ConditionOption[]) {
  const groups = new Map<string, DietRule[]>();
  for (const item of items) {
    const key = item.conditionKey || "other";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([conditionKey, rules]) => ({
    conditionKey,
    label: conditionLabelFromOptions(conditions, conditionKey) ?? rules[0]?.conditionLabel ?? conditionKey,
    rules: [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  }));
}

function visibleByMode(rule: DietRule, mode: RuleMode) {
  return mode === "all" || ruleMode(rule) === mode;
}

function tagsToText(tags?: string[]) {
  return (tags ?? []).join(", ");
}

function parseTags(value: FormDataEntryValue | null) {
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

function blankRule(conditions: ConditionOption[]): Partial<DietRule> {
  const first = conditions[0] ?? { conditionKey: "hypertension", conditionLabel: conditionNames.hypertension };
  return {
    conditionKey: first.conditionKey,
    conditionLabel: first.conditionLabel,
    comparator: "avoid",
    priority: 1,
    dataSource: dataSourceDefault,
    doctor_verified: false,
    foodTagsPrefer: [],
    foodTagsAvoid: [],
    cautionTags: []
  };
}

function slugifyConditionKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function ConditionDietRulesManager() {
  const [items, setItems] = useState<DietRule[]>([]);
  const [conditions, setConditions] = useState<ConditionOption[]>([]);
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("");
  const [mode, setMode] = useState<RuleMode>("all");
  const [editing, setEditing] = useState<Partial<DietRule> | null>(null);
  const [editingCondition, setEditingCondition] = useState<Partial<ConditionOption> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "200", sort: "priority" });
      if (query.trim()) params.set("q", query.trim());
      if (condition) params.set("conditionKey", condition);
      const data = await apiFetch<ApiList>(`/condition-diet-rules?${params.toString()}`);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal rules.");
    } finally {
      setLoading(false);
    }
  }

  async function loadConditions() {
    const data = await apiFetch<ConditionApiList>("/condition-diet-conditions?page=1&limit=200&sort=sortOrder");
    setConditions(data.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  useEffect(() => {
    loadConditions().catch((err) => setError(err instanceof Error ? err.message : "Failed to load disease name list."));
  }, []);

  const filtered = useMemo(() => items.filter((item) => visibleByMode(item, mode)), [items, mode]);
  const groups = useMemo(() => groupByCondition(filtered, conditions), [filtered, conditions]);
  const stats = useMemo(() => ({
    conditions: conditions.length || new Set(items.map((item) => item.conditionKey)).size,
    avoid: items.filter((item) => ruleMode(item) === "avoid").length,
    prefer: items.filter((item) => ruleMode(item) === "prefer").length,
    limit: items.filter((item) => ruleMode(item) === "limit").length
  }), [items]);

  async function submitRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const formData = new FormData(event.currentTarget);
    const conditionKey = String(formData.get("conditionKey") ?? "").trim();
    const ruleType = String(formData.get("ruleType") ?? "").trim();
    const conditionLabel = conditionLabelFromOptions(conditions, conditionKey);
    const payload: Record<string, unknown> = {
      ruleKey: String(formData.get("ruleKey") ?? "").trim() || `${conditionKey}-${ruleType}`,
      conditionKey,
      conditionLabel,
      ruleType,
      priority: optionalNumber(formData.get("priority")) ?? 1,
      nutrientKey: String(formData.get("nutrientKey") ?? "").trim(),
      comparator: String(formData.get("comparator") ?? "avoid"),
      targetValue: optionalNumber(formData.get("targetValue")),
      targetMin: optionalNumber(formData.get("targetMin")),
      targetMax: optionalNumber(formData.get("targetMax")),
      unit: String(formData.get("unit") ?? "").trim(),
      recommendationKo: String(formData.get("recommendationKo") ?? "").trim(),
      foodTagsPrefer: parseTags(formData.get("foodTagsPrefer")),
      foodTagsAvoid: parseTags(formData.get("foodTagsAvoid")),
      cautionTags: parseTags(formData.get("cautionTags")),
      dataSource: String(formData.get("dataSource") ?? dataSourceDefault).trim() || dataSourceDefault,
      doctor_verified: formData.get("doctor_verified") === "true"
    };

    setSaving(true);
    setError("");
    try {
      const id = editing._id;
      await apiFetch<DietRule>(id ? `/condition-diet-rules/${id}` : "/condition-diet-rules", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save meal rules.");
    } finally {
      setSaving(false);
    }
  }

  async function submitCondition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCondition) return;

    const formData = new FormData(event.currentTarget);
    const label = String(formData.get("conditionLabel") ?? "").trim();
    const conditionKey = String(formData.get("conditionKey") ?? "").trim() || slugifyConditionKey(label);
    const payload = {
      conditionKey,
      conditionLabel: label,
      category: "condition_diet",
      descriptionKo: String(formData.get("descriptionKo") ?? "").trim(),
      sortOrder: optionalNumber(formData.get("sortOrder")) ?? conditions.length + 1,
      dataSource: String(formData.get("dataSource") ?? dataSourceDefault).trim() || dataSourceDefault,
      tags: parseTags(formData.get("tags")),
      doctor_verified: formData.get("doctor_verified") === "true"
    };

    setSaving(true);
    setError("");
    try {
      const id = editingCondition._id;
      await apiFetch<ConditionOption>(id ? `/condition-diet-conditions/${id}` : "/condition-diet-conditions", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setEditingCondition(null);
      await loadConditions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save disease name.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page condition-diet-page">
      <PageHeader
        title="Meal rules for each disease"
        subtitle="Foods to limit depending on illness and health condition, Foods to Recommend, Check nutrient standards at a glance."
        action={(
          <div className="condition-page-actions">
            <button className="condition-add-button" type="button" onClick={() => setEditing(blankRule(conditions))}><Plus size={16} /> new rule</button>
            <button className="condition-add-secondary" type="button" onClick={() => setEditingCondition({ sortOrder: conditions.length + 1, dataSource: dataSourceDefault, doctor_verified: false })}><Plus size={16} /> Add disease name</button>
            <button className="condition-refresh-button" type="button" onClick={load} aria-label="refresh"><RefreshCw size={16} /></button>
          </div>
        )}
      />

      <section className="condition-summary-strip">
        <div><HeartPulse size={18} /><strong>{stats.conditions}</strong><span>bottle/status</span></div>
        <div><Ban size={18} /><strong>{stats.avoid}</strong><span>limit rule</span></div>
        <div><CheckCircle2 size={18} /><strong>{stats.prefer}</strong><span>Recommended Rules</span></div>
        <div><SlidersHorizontal size={18} /><strong>{stats.limit}</strong><span>Numerical criteria</span></div>
      </section>

      <section className="condition-catalog-panel">
        <header>
          <div>
            <p>Data base disease name</p>
            <h2>First register the name of the disease to be used in the meal rules.</h2>
          </div>
          <button type="button" onClick={() => setEditingCondition({ sortOrder: conditions.length + 1, dataSource: dataSourceDefault, doctor_verified: false })}>
            <Plus size={15} /> Add disease name
          </button>
        </header>
        <div className="condition-catalog-list">
          {conditions.map((item) => (
            <button key={item.conditionKey} type="button" onClick={() => setEditingCondition(item)}>
              <span>{item.conditionLabel}</span>
              <small>{item.conditionKey}</small>
              <Pencil size={13} />
            </button>
          ))}
          {!conditions.length ? <span className="condition-catalog-empty">There is no registered disease name.</span> : null}
        </div>
      </section>

      <section className="panel">
        <div className="toolbar condition-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && load()}
              placeholder="disease name, nutrients, Recommendation search"
            />
          </label>
          <button type="button" onClick={load}>Search</button>
          <select className="sort-select" value={condition} onChange={(event) => setCondition(event.target.value)}>
            <option value="">all bottles/status</option>
            {conditions.map((option) => <option key={option.conditionKey} value={option.conditionKey}>{option.conditionLabel}</option>)}
          </select>
          <select className="sort-select" value={mode} onChange={(event) => setMode(event.target.value as RuleMode)}>
            {modeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <span>{loading ? "Loading..." : `${filtered.length}dog rules`}</span>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="condition-group-list">
          {groups.map((group) => (
            <section className="condition-group" key={group.conditionKey}>
              <header className="condition-group-head">
                <div>
                  <p>Meal management target</p>
                  <h2>{group.label}</h2>
                </div>
                <span>{group.rules.length}dog rules</span>
              </header>

              <div className="condition-rule-grid">
                {group.rules.map((rule) => {
                  const currentMode = ruleMode(rule);
                  const Icon = modeIcon(currentMode);
                  return (
                    <article className={modeClass(currentMode)} key={rule._id}>
                      <header>
                        <span className="condition-rule-icon"><Icon size={17} /></span>
                        <div>
                          <p>{modeLabel(currentMode)}</p>
                          <h3>{targetText(rule)}</h3>
                        </div>
                        {rule.doctor_verified ? <span className="badge ok"><BadgeCheck size={14} /> verification</span> : <span className="badge"><AlertTriangle size={14} /> Confirmation required</span>}
                      </header>

                      <p className="condition-recommendation">{rule.recommendationKo}</p>

                      {rule.foodTagsAvoid?.length || rule.cautionTags?.length ? (
                        <div className="condition-tag-block danger">
                          <b><ShieldAlert size={14} /> limit/caution</b>
                          <div>{[...(rule.foodTagsAvoid ?? []), ...(rule.cautionTags ?? [])].map((tag, index) => <span key={`${rule._id}-avoid-${tag}-${index}`}>{labelTag(tag)}</span>)}</div>
                        </div>
                      ) : null}

                      {rule.foodTagsPrefer?.length ? (
                        <div className="condition-tag-block good">
                          <b><CheckCircle2 size={14} /> recommended</b>
                          <div>{rule.foodTagsPrefer.map((tag, index) => <span key={`${rule._id}-prefer-${tag}-${index}`}>{labelTag(tag)}</span>)}</div>
                        </div>
                      ) : null}

                      <footer>
                        <div>
                          <span>{rule.ruleType.replaceAll("_", " ")}</span>
                          {rule.nutrientKey ? <span>{nutrientNames[rule.nutrientKey] ?? rule.nutrientKey}</span> : null}
                        </div>
                        <button className="condition-edit-button" type="button" onClick={() => setEditing(rule)} aria-label="Modify meal rules"><Pencil size={14} /> Edit</button>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {!loading && !groups.length ? <p className="empty-row">There are no dietary rules that meet the conditions..</p> : null}
        </div>
      </section>

      {editing ? (
        <Modal onClose={() => setEditing(null)}>
          <form className="editor condition-editor" onSubmit={submitRule}>
            <div className="modal-head">
              <h2>{editing._id ? "Modify meal rules" : "Add new meal rule"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="close"><X size={16} /></button>
            </div>

            <div className="editor-grid">
              <label>
                bottle/status
                <select name="conditionKey" defaultValue={editing.conditionKey ?? conditions[0]?.conditionKey ?? "hypertension"} required>
                  {conditions.map((item) => <option key={item.conditionKey} value={item.conditionKey}>{item.conditionLabel}</option>)}
                </select>
              </label>

              <label>
                rules key
                <input name="ruleKey" defaultValue={editing.ruleKey ?? ""} placeholder="If empty, the name of the disease-Automatically created by rule type" />
              </label>

              <label>
                Rule type
                <input name="ruleType" defaultValue={editing.ruleType ?? ""} placeholder="yes: sodium_limit, alcohol_limit" required />
              </label>

              <label>
                Category
                <select name="comparator" defaultValue={editing.comparator ?? "avoid"}>
                  {comparatorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label>
                nutrients
                <input name="nutrientKey" defaultValue={editing.nutrientKey ?? ""} placeholder="yes: sodium, addedSugar, protein" />
              </label>

              <label>
                unit
                <input name="unit" defaultValue={editing.unit ?? ""} placeholder="yes: mg/d, %E, g/kg/d" />
              </label>

              <label>
                target value
                <input name="targetValue" type="number" step="any" defaultValue={editing.targetValue ?? ""} />
              </label>

              <label>
                priority
                <input name="priority" type="number" defaultValue={editing.priority ?? 1} />
              </label>

              <label>
                minimum value
                <input name="targetMin" type="number" step="any" defaultValue={editing.targetMin ?? ""} />
              </label>

              <label>
                maximum value
                <input name="targetMax" type="number" step="any" defaultValue={editing.targetMax ?? ""} />
              </label>

              <label className="wide-field">
                Recommendation
                <textarea name="recommendationKo" defaultValue={editing.recommendationKo ?? ""} placeholder="Meal management sentences that users can understand" required />
              </label>

              <label className="wide-field">
                Recommended food tags
                <input name="foodTagsPrefer" defaultValue={tagsToText(editing.foodTagsPrefer)} placeholder="yes: vegetable, whole_grain, fish" />
              </label>

              <label className="wide-field">
                Restricted food tags
                <input name="foodTagsAvoid" defaultValue={tagsToText(editing.foodTagsAvoid)} placeholder="yes: alcohol, high_sodium, fried_food" />
              </label>

              <label className="wide-field">
                caution tag
                <input name="cautionTags" defaultValue={tagsToText(editing.cautionTags)} placeholder="You can leave it the same as the limit tag." />
              </label>

              <label>
                doctor verification
                <select name="doctor_verified" defaultValue={String(Boolean(editing.doctor_verified))}>
                  <option value="false">Not verified</option>
                  <option value="true">verification</option>
                </select>
              </label>

              <label>
                data source
                <input name="dataSource" defaultValue={editing.dataSource ?? dataSourceDefault} required />
              </label>
            </div>

            <div className="editor-actions">
              <button type="button" onClick={() => setEditing(null)}>Cancel</button>
              <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "save"}</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editingCondition ? (
        <Modal onClose={() => setEditingCondition(null)}>
          <form className="editor condition-editor" onSubmit={submitCondition}>
            <div className="modal-head">
              <h2>{editingCondition._id ? "Modification of disease name" : "Add new disease name"}</h2>
              <button type="button" onClick={() => setEditingCondition(null)} aria-label="close"><X size={16} /></button>
            </div>

            <div className="editor-grid">
              <label>
                disease name
                <input name="conditionLabel" defaultValue={editingCondition.conditionLabel ?? ""} placeholder="yes: liver disease, gastritis, anemia" required />
              </label>

              <label>
                disease name key
                <input name="conditionKey" defaultValue={editingCondition.conditionKey ?? ""} placeholder="If empty, automatically generated from disease name" />
              </label>

              <label>
                display order
                <input name="sortOrder" type="number" defaultValue={editingCondition.sortOrder ?? conditions.length + 1} />
              </label>

              <label>
                doctor verification
                <select name="doctor_verified" defaultValue={String(Boolean(editingCondition.doctor_verified))}>
                  <option value="false">Not verified</option>
                  <option value="true">verification</option>
                </select>
              </label>

              <label className="wide-field">
                Description
                <textarea name="descriptionKo" defaultValue={editingCondition.descriptionKo ?? ""} placeholder="Write down the purpose of dietary management for this disease.." />
              </label>

              <label className="wide-field">
                tag
                <input name="tags" defaultValue={tagsToText((editingCondition as { tags?: string[] }).tags)} placeholder="yes: liver, condition_diet" />
              </label>

              <label className="wide-field">
                data source
                <input name="dataSource" defaultValue={editingCondition.dataSource ?? dataSourceDefault} required />
              </label>
            </div>

            <div className="editor-actions">
              <button type="button" onClick={() => setEditingCondition(null)}>Cancel</button>
              <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "save"}</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

"use client";

import { Activity, BadgeCheck, Calculator, ClipboardCheck, Ruler, Search, Target, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import NutrientIntakeRulesManager from "@/components/NutrientIntakeRulesManager";
import { apiFetch } from "@/lib/api";

type DailyProfile = {
  _id: string;
  profileKey: string;
  label: string;
  ageMin: number;
  ageMax: number;
  gender?: string;
  purpose: string;
  notes?: string;
  values?: Record<string, number>;
  doctor_verified?: boolean;
};

type NutritionConstraint = {
  _id: string;
  profileKey: string;
  nutrientKey: string;
  nutrientLabel: string;
  unit?: string;
  lowerBound?: number;
  upperBound?: number;
  isPercentOfCalories?: boolean;
  caloriesPerGram?: number;
  doctor_verified?: boolean;
};

type NutrientTarget = {
  nutrientKey: string;
  nutrientLabel: string;
  unit: string;
  goalType?: "RNI" | "AI" | "EER" | "EAR";
  EAR?: number;
  RNI?: number;
  AI?: number;
  UL?: number;
  EER?: number;
  AMDR?: { value?: number; min?: number; max?: number; unit: string };
  units?: Partial<Record<"EAR" | "RNI" | "AI" | "UL" | "EER" | "AMDR", string>>;
  sourceRuleKeys?: string[];
};

type ApiList<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

type TargetResponse = {
  requestedProfile?: DailyTargetProfile;
  profile?: DailyTargetProfile;
  warnings?: DailyTargetWarning[];
  count: number;
  targets: NutrientTarget[];
  goals: Record<string, number | null>;
};

type DailyTab = "needed" | "rules" | "constraints";

type DailyTargetProfile = {
  age: number;
  gender: string;
  lifeStage?: string;
  populationGroup?: string;
  physicalActivityLevel?: string;
};

type DailyTargetWarning = {
  code: string;
  message: string;
};

const nutrientLabels: Record<string, string> = {
  calories: "energy",
  energyKcal: "energy",
  protein: "protein",
  carbs: "carbohydrates",
  carbohydrateG: "carbohydrates",
  fat: "fat",
  saturatedFat: "saturated fat",
  fiber: "dietary fiber",
  dietaryFiberG: "dietary fiber",
  sugar: "party",
  sodium: "Sodium",
  calcium: "Calcium",
  iron: "iron",
  potassium: "Calium",
  magnesium: "Magnesium",
  zinc: "zinc",
  folate: "folic acid",
  vitaminC: "vitamins C",
  vitaminD: "vitamins D"
};

const highlightKeys = ["calories", "protein", "carbs", "fat", "fiber", "sodium", "calcium", "iron"];

function formatValue(value?: number | null, unit = "") {
  if (value == null || Number.isNaN(value)) return "-";
  return `${Number.isInteger(value) ? value : Number(value.toFixed(2))}${unit ? ` ${unit}` : ""}`;
}

function targetGoal(target: NutrientTarget) {
  return target.RNI ?? target.AI ?? target.EER ?? target.EAR;
}

function targetUnit(unit: string) {
  return unit.replace("?g", "ug");
}

function refUnit(target: NutrientTarget, type: keyof NonNullable<NutrientTarget["units"]>) {
  return targetUnit(target.units?.[type] ?? target.unit);
}

function goalLabel(type?: string) {
  if (type === "RNI") return "Recommended intake amount";
  if (type === "AI") return "Sufficient intake amount";
  if (type === "EER") return "energy needs";
  if (type === "EAR") return "Average Requirement";
  return "reference value";
}

function amdrText(target: NutrientTarget) {
  if (!target.AMDR) return "";
  if (target.AMDR.value != null) return formatValue(target.AMDR.value, targetUnit(target.AMDR.unit));
  const min = target.AMDR.min != null ? target.AMDR.min : "";
  const max = target.AMDR.max != null ? target.AMDR.max : "";
  return `${min}-${max} ${targetUnit(target.AMDR.unit)}`;
}

function populationFromAge(age: number) {
  if (age < 1) return "infant";
  if (age < 11) return "child";
  if (age < 18) return "adolescent";
  if (age >= 65) return "senior";
  return "adult";
}

function isPregnancyOrLactation(stage: string) {
  return stage.startsWith("pregnancy") || stage === "lactation" || stage === "pregnant" || stage === "lactating";
}

function populationForStage(stage: string) {
  if (stage.startsWith("pregnancy") || stage === "pregnant") return "pregnant";
  if (stage === "lactation" || stage === "lactating") return "lactating";
  return "";
}

function ageLabel(profile: DailyProfile) {
  return `${profile.ageMin}-${profile.ageMax}three`;
}

export default function DailyNutritionManager() {
  const [tab, setTab] = useState<DailyTab>("needed");
  const [profiles, setProfiles] = useState<DailyProfile[]>([]);
  const [constraints, setConstraints] = useState<NutritionConstraint[]>([]);
  const [targets, setTargets] = useState<NutrientTarget[]>([]);
  const [profileQuery, setProfileQuery] = useState("");
  const [constraintQuery, setConstraintQuery] = useState("");
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("all");
  const [populationGroup, setPopulationGroup] = useState("adult");
  const [lifeStage, setLifeStage] = useState("general");
  const [pal, setPal] = useState("moderate");
  const [loading, setLoading] = useState(true);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetWarnings, setTargetWarnings] = useState<DailyTargetWarning[]>([]);
  const [error, setError] = useState("");

  async function loadBasics() {
    setLoading(true);
    setError("");
    try {
      const [profileData, constraintData] = await Promise.all([
        apiFetch<ApiList<DailyProfile>>("/daily-value-profiles?page=1&limit=100&sort=profileKey"),
        apiFetch<ApiList<NutritionConstraint>>("/nutrition-constraints?page=1&limit=100&sort=profileKey")
      ]);
      setProfiles(profileData.items);
      setConstraints(constraintData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Daily nutrition data could not be loaded..");
    } finally {
      setLoading(false);
    }
  }

  async function loadTargets() {
    setTargetLoading(true);
    setError("");
    try {
      const data = await apiFetch<TargetResponse>("/daily-targets/resolve", {
        method: "POST",
        body: JSON.stringify({ age, gender, populationGroup, lifeStage, physicalActivityLevel: pal })
      });
      setTargets(data.targets);
      setTargetWarnings(data.warnings ?? []);
      if (data.profile) {
        setAge(data.profile.age);
        setGender(data.profile.gender);
        setPopulationGroup(data.profile.populationGroup ?? populationFromAge(data.profile.age));
        setLifeStage(data.profile.lifeStage ?? "general");
        setPal(data.profile.physicalActivityLevel ?? "moderate");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate daily requirement.");
    } finally {
      setTargetLoading(false);
    }
  }

  useEffect(() => {
    loadBasics();
    loadTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProfiles = useMemo(() => {
    const q = profileQuery.trim().toLowerCase();
    return profiles.filter((profile) => !q || profile.label.toLowerCase().includes(q) || profile.purpose.toLowerCase().includes(q) || profile.profileKey.toLowerCase().includes(q));
  }, [profiles, profileQuery]);

  const filteredConstraints = useMemo(() => {
    const q = constraintQuery.trim().toLowerCase();
    return constraints.filter((item) => !q || item.profileKey.toLowerCase().includes(q) || item.nutrientKey.toLowerCase().includes(q) || item.nutrientLabel.toLowerCase().includes(q));
  }, [constraints, constraintQuery]);

  const topTargets = useMemo(() => {
    const priority = ["energyKcal", "protein", "carbs", "fat", "calcium", "iron", "sodium", "folate", "vitaminC", "vitaminD"];
    const rank = (key: string) => {
      const index = priority.indexOf(key);
      return index === -1 ? 999 : index;
    };
    return [...targets].sort((a, b) => rank(a.nutrientKey) - rank(b.nutrientKey) || a.nutrientKey.localeCompare(b.nutrientKey)).slice(0, 12);
  }, [targets]);

  const verifiedProfiles = profiles.filter((profile) => profile.doctor_verified).length;
  const verifiedConstraints = constraints.filter((item) => item.doctor_verified).length;
  const expectedPopulation = populationFromAge(age);
  const stagePopulation = populationForStage(lifeStage);
  const profileWarnings = [
    populationGroup !== expectedPopulation ? `age ${age}Usually at age '${expectedPopulation}' Target is correct.` : "",
    gender === "male" && (lifeStage === "pregnant" || lifeStage === "lactating") ? "pregnant in men/Feeding stages cannot be applied." : "",
    (lifeStage === "pregnant" || lifeStage === "lactating") && populationGroup !== lifeStage ? "pregnancy/It is recommended that the feeding stage be set to the same value.." : ""
  ].filter(Boolean);
  const canonicalProfileWarnings = [
    ...profileWarnings,
    gender === "male" && isPregnancyOrLactation(lifeStage) ? "Pregnancy/lactation targets require female gender." : "",
    stagePopulation && populationGroup !== stagePopulation ? `Population group should be ${stagePopulation} for the selected life stage.` : ""
  ].filter((message, index, all) => Boolean(message) && all.indexOf(message) === index);

  function normalizeProfileInputs() {
    const nextPopulation = stagePopulation || expectedPopulation;
    setPopulationGroup(nextPopulation);
    if (isPregnancyOrLactation(lifeStage)) setGender("female");
  }

  return (
    <section className="page daily-nutrition-page">
      <PageHeader
        title="Nutrients needed per day"
        subtitle="Daily Values, Nutrient Intake Rules, Nutrition ConstraintsView in one place and check your actual daily goal.."
        action={<button type="button" onClick={() => { loadBasics(); loadTargets(); }}>refresh</button>}
      />

      <section className="daily-nutrition-summary">
        <div><Target size={18} /><strong>{profiles.length}</strong><span>Daily Value profile</span></div>
        <div><ClipboardCheck size={18} /><strong>{targets.length}</strong><span>Calculated Requirements</span></div>
        <div><Ruler size={18} /><strong>{constraints.length}</strong><span>Optimization limits</span></div>
        <div><BadgeCheck size={18} /><strong>{verifiedProfiles + verifiedConstraints}</strong><span>Verified Item</span></div>
      </section>

      <section className="daily-tabbar" aria-label="Daily nutritional data">
        <button type="button" className={tab === "needed" ? "active" : ""} onClick={() => setTab("needed")}><Calculator size={16} /> daily requirement</button>
        <button type="button" className={tab === "rules" ? "active" : ""} onClick={() => setTab("rules")}><ClipboardCheck size={16} /> Intake standard table</button>
        <button type="button" className={tab === "constraints" ? "active" : ""} onClick={() => setTab("constraints")}><Ruler size={16} /> Dietary Limits</button>
      </section>

      {error ? <p className="error">{error}</p> : null}

      {tab === "needed" ? (
        <section className="daily-needed-layout">
          <div className="daily-calculator-panel">
            <header>
              <p>Enter your profile</p>
              <h2>Daily target amount required by the user</h2>
            </header>
            <div className="daily-input-grid">
              <label>age<input type="number" min={0} max={120} value={age} onChange={(event) => setAge(Number(event.target.value))} /></label>
              <label>gender
                <select value={gender} onChange={(event) => setGender(event.target.value)}>
                  <option value="all">all</option><option value="male">male</option><option value="female">woman</option>
                </select>
              </label>
              <label>target
                <select value={populationGroup} onChange={(event) => setPopulationGroup(event.target.value)}>
                  <option value="general">general</option><option value="infant">breastfeeding</option><option value="child">children</option>
                  <option value="adolescent">youth</option><option value="adult">adult</option><option value="senior">Loin</option>
                  <option value="pregnant">pregnant woman</option><option value="lactating">lactation</option>
                </select>
              </label>
              <label>step
                <select value={lifeStage} onChange={(event) => setLifeStage(event.target.value)}>
                  <option value="general">general</option><option value="pregnancy">full pregnancy</option><option value="pregnancy_early">early pregnancy</option><option value="pregnancy_mid">second trimester</option><option value="pregnancy_late">late pregnancy</option><option value="lactation">lactation</option>
                </select>
              </label>
              <label>activity level
                <select value={pal} onChange={(event) => setPal(event.target.value)}>
                  <option value="rest">stable</option><option value="light">lightness</option><option value="moderate">Normal</option><option value="heavy">high</option>
                </select>
              </label>
            </div>
            {canonicalProfileWarnings.length || targetWarnings.length ? (
              <div className="daily-profile-warnings">
                {canonicalProfileWarnings.map((message) => <p key={message}>{message}</p>)}
                {targetWarnings.map((warning) => <p key={warning.code}>{warning.message}</p>)}
                <button type="button" onClick={normalizeProfileInputs}>Automatic cleaning of input values</button>
              </div>
            ) : null}
            <button className="primary" type="button" onClick={loadTargets} disabled={targetLoading}>{targetLoading ? "Calculating..." : "Calculate your needs"}</button>
          </div>

          <div className="daily-target-panel">
            <header>
              <div>
                <p>calculation result</p>
                <h2>Target amount as of today</h2>
              </div>
              <span>{targetLoading ? "Calculating" : `${targets.length}dog`}</span>
            </header>
            <div className="daily-target-grid">
              {topTargets.map((target) => (
                <article key={target.nutrientKey}>
                  <span>{nutrientLabels[target.nutrientKey] ?? target.nutrientLabel}</span>
                  <strong>{formatValue(targetGoal(target), targetUnit(target.unit))}</strong>
                  <small>{goalLabel(target.goalType)}{target.UL ? ` · upper limit ${formatValue(target.UL, refUnit(target, "UL"))}` : ""}</small>
                  <div className="daily-target-detail">
                    {target.EAR != null ? <em>EAR {formatValue(target.EAR, refUnit(target, "EAR"))}</em> : null}
                    {target.RNI != null ? <em>RNI {formatValue(target.RNI, refUnit(target, "RNI"))}</em> : null}
                    {target.AI != null ? <em>AI {formatValue(target.AI, refUnit(target, "AI"))}</em> : null}
                    {target.EER != null ? <em>EER {formatValue(target.EER, refUnit(target, "EER"))}</em> : null}
                    {target.AMDR ? <em>AMDR {amdrText(target)}</em> : null}
                  </div>
                  <small>output: RNI → AI → EER → EAR</small>
                </article>
              ))}
            </div>
          </div>

          <div className="daily-profile-panel">
            <header>
              <div>
                <p>Daily Values</p>
                <h2>Daily profile used in the app</h2>
              </div>
              <label className="search-field">
                <Search size={16} />
                <input value={profileQuery} onChange={(event) => setProfileQuery(event.target.value)} placeholder="Profile Search" />
              </label>
            </header>
            <div className="daily-profile-grid">
              {filteredProfiles.map((profile) => (
                <article key={profile._id}>
                  <header>
                    <div>
                      <p>{profile.profileKey}</p>
                      <h3>{profile.label}</h3>
                    </div>
                    <span>{ageLabel(profile)}</span>
                  </header>
                  <div className="daily-profile-values">
                    {highlightKeys.map((key) => (
                      <div key={`${profile._id}-${key}`}>
                        <span>{nutrientLabels[key] ?? key}</span>
                        <strong>{formatValue(profile.values?.[key])}</strong>
                      </div>
                    ))}
                  </div>
                  {profile.notes ? <p className="daily-profile-note">{profile.notes}</p> : null}
                </article>
              ))}
              {!loading && !filteredProfiles.length ? <p className="empty-row">There is no profile.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "rules" ? <NutrientIntakeRulesManager embedded /> : null}

      {tab === "constraints" ? (
        <section className="daily-constraints-panel">
          <header>
            <div>
              <p>Nutrition Constraints</p>
              <h2>Lower limit used for diet optimization/upper limit</h2>
            </div>
            <label className="search-field">
              <Search size={16} />
              <input value={constraintQuery} onChange={(event) => setConstraintQuery(event.target.value)} placeholder="profile, Nutrient Search" />
            </label>
          </header>
          <div className="daily-constraint-list">
            {filteredConstraints.map((item) => (
              <article key={item._id}>
                <div className="daily-constraint-name">
                  <Utensils size={16} />
                  <div>
                    <h3>{nutrientLabels[item.nutrientKey] ?? item.nutrientLabel}</h3>
                    <p>{item.profileKey}</p>
                  </div>
                </div>
                <div className="daily-bound-row">
                  <span>lower limit <b>{formatValue(item.lowerBound, item.unit)}</b></span>
                  <span>upper limit <b>{item.upperBound ? formatValue(item.upperBound, item.unit) : "None"}</b></span>
                  {item.isPercentOfCalories ? <span><Activity size={14} /> Calorie ratio</span> : null}
                </div>
              </article>
            ))}
            {!loading && !filteredConstraints.length ? <p className="empty-row">There are no limits that meet the conditions.</p> : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}

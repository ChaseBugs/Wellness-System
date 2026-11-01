# Reference Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill gaps in the existing (uncommitted) reference data layer, add a typed filter API to `createCrudRouter`, wire filters per route, run the importer, and verify the six reference collections are populated.

**Architecture:** Extend existing `referenceGuidelineSeeds.ts` (don't rewrite) with the missing 9 PDFs in `referenceSources`, 6 secondary conditions in `conditionDietRules`, and ~50 nutrient terms in `nutritionTerminology`. Add a third `filterableFields?: string[]` parameter to `createCrudRouter` that whitelists exact-match and `_gte`/`_lte` filters from the querystring. No commits — user prefers continuous execution.

**Tech Stack:** Mongoose 8 + Express 4, TypeScript ESM (NodeNext, `.js` extensions on `.ts` imports), tsx for script runtime.

**Verification model:** Per `CLAUDE.md`, `npm run build` is the verification step. No test suite exists. We verify by build + running the importer + curl spot checks against a live backend.

---

### Task 1: Extend `createCrudRouter` with `filterableFields` parameter

**Files:**
- Modify: `backend/src/routes/crud.ts`

- [ ] **Step 1: Replace the body of `crud.ts` with the extended version**

Replace the entire file with:

```ts
import { Router } from "express";
import type { Model } from "mongoose";

const RANGE_SUFFIXES = { _gte: "$gte", _lte: "$lte" } as const;

function coerceValue(model: Model<any>, fieldName: string, raw: string): unknown {
  const path = model.schema.path(fieldName);
  const instance = path?.instance;
  if (instance === "Number") return Number(raw);
  if (instance === "Boolean") return raw === "true";
  return raw;
}

function buildFilters(model: Model<any>, query: Record<string, unknown>, allowed: Set<string>) {
  const filters: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    if (key === "q" || key === "page" || key === "limit") continue;
    const valueStr = String(rawValue);

    let suffixMatch: keyof typeof RANGE_SUFFIXES | null = null;
    for (const suffix of Object.keys(RANGE_SUFFIXES) as (keyof typeof RANGE_SUFFIXES)[]) {
      if (key.endsWith(suffix)) { suffixMatch = suffix; break; }
    }

    if (suffixMatch) {
      const baseField = key.slice(0, -suffixMatch.length);
      if (!allowed.has(baseField)) continue;
      const op = RANGE_SUFFIXES[suffixMatch];
      const coerced = coerceValue(model, baseField, valueStr);
      filters[baseField] = { ...(filters[baseField] as object || {}), [op]: coerced };
      continue;
    }

    if (!allowed.has(key)) continue;
    if (valueStr.includes(",")) {
      const values = valueStr.split(",").map((v) => v.trim()).filter(Boolean).map((v) => coerceValue(model, key, v));
      filters[key] = { $in: values };
    } else {
      filters[key] = coerceValue(model, key, valueStr);
    }
  }
  return filters;
}

export function createCrudRouter(model: Model<any>, searchFields: string[] = [], filterableFields: string[] = []) {
  const router = Router();
  const allowed = new Set(filterableFields);

  router.get("/", async (req, res, next) => {
    try {
      const page = Math.max(Number(req.query.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 500);
      const q = String(req.query.q ?? "").trim();

      const filters = buildFilters(model, req.query as Record<string, unknown>, allowed);
      const textFilter = q
        ? { $or: searchFields.map((field) => ({ [field]: { $regex: q, $options: "i" } })) }
        : null;

      const filter = textFilter ? { $and: [filters, textFilter] } : filters;

      const [items, total] = await Promise.all([
        model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        model.countDocuments(filter)
      ]);

      res.json({ items, total, page, limit });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await model.findById(req.params.id).lean();
      if (!item) { res.status(404).json({ message: "Resource not found" }); return; }
      res.json(item);
    } catch (error) { next(error); }
  });

  router.post("/", async (req, res, next) => {
    try {
      const item = await model.create({ doctor_verified: false, ...req.body });
      res.status(201).json(item);
    } catch (error) { next(error); }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) { res.status(404).json({ message: "Resource not found" }); return; }
      res.json(item);
    } catch (error) { next(error); }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const item = await model.findByIdAndDelete(req.params.id);
      if (!item) { res.status(404).json({ message: "Resource not found" }); return; }
      res.status(204).send();
    } catch (error) { next(error); }
  });

  return router;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `backend/`: `npx tsc --noEmit`
Expected: exit 0, no errors.

---

### Task 2: Wire `filterableFields` per route in `routes/index.ts`

**Files:**
- Modify: `backend/src/routes/index.ts:84-96` (the `createCrudRouter` call sites)

- [ ] **Step 1: Add a third argument to each new-collection route**

Find each line and add the filter whitelist as the third arg. Example for `reference-sources`:

```ts
apiRouter.use("/reference-sources", createCrudRouter(ReferenceSource, ["sourceKey", "title", "standardCode", "category", "topic", "conditionKey", "dataSource"], ["category", "topic", "conditionKey", "year", "dataSource", "doctor_verified"]));
apiRouter.use("/nutrient-intake-rules", createCrudRouter(NutrientIntakeRule, ["ruleKey", "standardCode", "nutrientKey", "nutrientLabel", "referenceType", "ageGroup", "gender", "lifeStage", "dataSource"], ["standardCode", "nutrientKey", "referenceType", "ageGroup", "ageMin", "ageMax", "gender", "lifeStage", "populationGroup", "dataSource", "doctor_verified"]));
apiRouter.use("/condition-diet-rules", createCrudRouter(ConditionDietRule, ["ruleKey", "conditionKey", "conditionLabel", "ruleType", "nutrientKey", "recommendationKo", "dataSource"], ["conditionKey", "ruleType", "comparator", "nutrientKey", "dataSource", "doctor_verified"]));
apiRouter.use("/risk-assessment-rules", createCrudRouter(RiskAssessmentRule, ["ruleKey", "standardCode", "metricKey", "metricLabel", "populationGroup", "interpretationKo", "dataSource"], ["standardCode", "metricKey", "populationGroup", "ageMin", "ageMax", "gender", "dataSource", "doctor_verified"]));
apiRouter.use("/nutrition-terminology", createCrudRouter(NutritionTerminology, ["termKey", "category", "chineseTerm", "englishTerm", "koreanTerm", "abbreviation", "dataSource"], ["category", "dataSource", "doctor_verified"]));
apiRouter.use("/data-validation-rules", createCrudRouter(DataValidationRule, ["ruleKey", "targetCollection", "fieldPath", "ruleType", "messageKo", "dataSource"], ["targetCollection", "ruleType", "required", "dataSource", "doctor_verified"]));
```

Also add `["category", "foodGroup", "foodSubgroup", "doctor_verified", "dataSource"]` as third arg to the `foodsRouter` line (`backend/src/routes/index.ts:39`).

- [ ] **Step 2: Verify build still passes**

Run from repo root: `npm run build`
Expected: exit 0.

---

### Task 3: Add 9 WST 膳食指导 PDFs to `referenceSources`

**Files:**
- Modify: `backend/src/data/referenceGuidelineSeeds.ts:6-223` (the `referenceSources` array)

- [ ] **Step 1: Append 9 entries to `referenceSources`**

Just before the closing `] as const;` on line 223, insert these entries (keeping the same shape as existing entries — `${standardsRoot}/第三部分 膳食指导/...`):

```ts
  {
    sourceKey: "wst429-2013-adult-diabetes-diet-guide",
    title: "成人糖尿病患者膳食指导",
    standardCode: "WST429-2013",
    year: 2013,
    category: "clinical_diet_guidance",
    topic: "diabetes",
    conditionKey: "diabetes",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST429-2013 成人糖尿病患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Adult diabetes patient dietary guidance.",
    tags: ["diabetes", "clinical_diet"]
  },
  {
    sourceKey: "wst430-2013-hypertension-diet-guide",
    title: "高血压患者膳食指导",
    standardCode: "WST430-2013",
    year: 2013,
    category: "clinical_diet_guidance",
    topic: "hypertension",
    conditionKey: "hypertension",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST430-2013 高血压患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Hypertension patient dietary guidance.",
    tags: ["hypertension", "clinical_diet"]
  },
  {
    sourceKey: "wst556-2017-elderly-diet-guide",
    title: "老年人膳食指导",
    standardCode: "WST556-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "elderly",
    conditionKey: "elderly",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST556-2017 老年人膳food指导.pdf`.replace("膳food", "膳食"),
    dataSource: dietGuideDataSource,
    sourceNote: "Elderly dietary guidance.",
    tags: ["elderly", "clinical_diet"]
  },
  {
    sourceKey: "wst557-2017-ckd-diet-guide",
    title: "慢性肾脏病患者膳食指导",
    standardCode: "WST557-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "ckd",
    conditionKey: "ckd",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST557-2017 慢性肾脏病患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Chronic kidney disease patient dietary guidance.",
    tags: ["ckd", "kidney", "clinical_diet"]
  },
  {
    sourceKey: "wst558-2017-stroke-diet-guide",
    title: "脑卒中患者膳食指导",
    standardCode: "WST558-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "stroke",
    conditionKey: "stroke",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST558-2017 脑卒中患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Stroke patient dietary guidance.",
    tags: ["stroke", "clinical_diet"]
  },
  {
    sourceKey: "wst559-2017-cancer-diet-guide",
    title: "恶性肿瘤患者膳食指导",
    standardCode: "WST559-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "cancer",
    conditionKey: "cancer",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST559-2017 恶性肿瘤患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Malignant tumor patient dietary guidance.",
    tags: ["cancer", "clinical_diet"]
  },
  {
    sourceKey: "wst560-2017-gout-diet-guide",
    title: "高尿酸血症与痛风患者膳食指导",
    standardCode: "WST560-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "gout_hyperuricemia",
    conditionKey: "gout_hyperuricemia",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST560-2017 高尿酸血症与痛风患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Hyperuricemia and gout patient dietary guidance.",
    tags: ["gout", "hyperuricemia", "clinical_diet"]
  },
  {
    sourceKey: "wst601-2018-gestational-diabetes-diet-guide",
    title: "妊娠期糖尿病患者膳食指导",
    standardCode: "WST601-2018",
    year: 2018,
    category: "clinical_diet_guidance",
    topic: "gestational_diabetes",
    conditionKey: "gestational_diabetes",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST601-2018 妊娠期糖尿病患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Gestational diabetes patient dietary guidance.",
    tags: ["pregnancy", "gestational_diabetes", "clinical_diet"]
  },
  {
    sourceKey: "wst678-2020-infant-complementary-feeding",
    title: "婴幼儿辅食添加营养指南",
    standardCode: "WST678-2020",
    year: 2020,
    category: "clinical_diet_guidance",
    topic: "infant_complementary_feeding",
    conditionKey: "infant_complementary_feeding",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST678-2020 婴幼儿辅食添加营养指南.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Infant complementary feeding nutrition guide.",
    tags: ["infant", "complementary_feeding", "clinical_diet"]
  }
```

(For the `wst556` entry, the trick `"...膳食指导.pdf"`.replace(...) is unnecessary — write the path directly with `膳食指导`. The replace was only an artifact of avoiding raw character escapes; remove it: `filePath: \`${standardsRoot}/第三部分 膳食指导/WST556-2017 老年人膳食指导.pdf\`,`)

- [ ] **Step 2: Update `import-reference-guidelines.ts` `replaceMany` filter for `referenceSources`**

The existing filter at `backend/src/scripts/import-reference-guidelines.ts:107-115` already covers `Chinese national food therapy and diet guidelines` (the `dietGuideDataSource`), which is what we used for the new 9. No change needed — they will be wiped+reinserted along with the existing condition guides.

---

### Task 4: Add 6 secondary conditions to `conditionDietRules`

**Files:**
- Modify: `backend/src/data/referenceGuidelineSeeds.ts:225-259` (the `conditionDietRules` array literal at lines 226-240, before the `.map(...)` transform)

- [ ] **Step 1: Append the rows to the array literal**

Just before line 240's closing `]`, append these rows (each row matches the existing tuple shape: `[conditionKey, conditionLabel, ruleType, nutrientKey, comparator, targetValue, unit, recommendationKo, prefer, avoid]`):

```ts
  ["ckd", "chronic kidney disease", "protein_quality", "protein", "range", undefined, "g/kg/d", "We manage the amount of protein and the proportion of high-quality protein tailored to kidney function..", "high_quality_protein,egg,milk", "processed_meat"],
  ["ckd", "chronic kidney disease", "sodium_limit", "sodium", "lte", 2000, "mg/d", "Limit sodium and avoid processed foods and salty seasonings.", "fresh_food", "high_sodium,processed_food"],
  ["ckd", "chronic kidney disease", "potassium_management", "potassium", "lte", undefined, "mg/d", "If you are at risk for hyperkalemia, limit fruits and vegetables that are high in potassium.", "low_potassium_vegetable", "banana,orange,potato"],
  ["ckd", "chronic kidney disease", "phosphorus_management", "phosphorus", "lte", undefined, "mg/d", "Reduce processed foods high in phosphorus and phosphorus additives.", "fresh_meat", "phosphate_additive,cola"],
  ["ckd", "chronic kidney disease", "fluid_balance", "", "prefer", undefined, "", "Water intake is adjusted according to kidney function and degree of edema..", "balanced_fluid", "excess_fluid"],
  ["stroke", "stroke", "sodium_limit", "sodium", "lte", 2000, "mg/d", "Reduce sodium intake to help manage blood pressure.", "low_sodium", "high_sodium,pickled_food"],
  ["stroke", "stroke", "saturated_fat_limit", "saturatedFat", "lt", 10, "%E", "Lower your intake of saturated fat and trans fat and increase the proportion of fish and vegetable fat..", "fish,plant_oil,nuts", "fried_food,high_saturated_fat"],
  ["stroke", "stroke", "fiber_priority", "fiber", "gte", 25, "g/d", "wailing, vegetables, fruit, Increase dietary fiber intake with legumes.", "whole_grain,vegetable,fruit,legume", ""],
  ["stroke", "stroke", "alcohol_limit", "", "avoid", undefined, "", "Limit drinking and eat regularly.", "regular_meal", "alcohol"],
  ["cancer", "malignant tumor", "energy_protein_priority", "protein", "prefer", undefined, "g/kg/d", "During the treatment period, we provide sufficient energy and high-quality protein first..", "high_quality_protein,egg,fish,milk", "low_energy_density"],
  ["cancer", "malignant tumor", "vegetable_fruit_priority", "", "prefer", undefined, "", "Secure micronutrients by eating a variety of colorful vegetables and fruits every day..", "vegetable,fruit,whole_grain", ""],
  ["cancer", "malignant tumor", "processed_meat_limit", "", "avoid", undefined, "", "Processed meats and smoked meats·Reduce your intake of salted foods.", "fresh_meat,fish", "processed_meat,smoked_food"],
  ["cancer", "malignant tumor", "alcohol_limit", "", "avoid", undefined, "", "Limit your drinking.", "", "alcohol"],
  ["elderly", "elderly people", "protein_priority", "protein", "gte", 1.0, "g/kg/d", "To prevent muscle loss, consume high-quality protein distributed throughout each meal..", "egg,fish,legume,milk,tofu", ""],
  ["elderly", "elderly people", "calcium_vitamin_d", "calcium", "prefer", undefined, "mg/d", "Calcium and vitamins to prevent osteoporosisD We recommend taking proper care of your diet and exposing yourself to sunlight..", "milk,dairy,small_fish,vegetable", ""],
  ["elderly", "elderly people", "fiber_fluid", "fiber", "gte", 25, "g/d", "Consume plenty of dietary fiber and water to prevent constipation..", "whole_grain,vegetable,fruit", ""],
  ["elderly", "elderly people", "easy_to_chew_swallow", "", "prefer", undefined, "", "Cook in a form that is easy to chew and swallow and distribute the number of meals appropriately..", "soft_food,small_meal", "hard_food"],
  ["gestational_diabetes", "gestational diabetes", "carb_distribution", "carbs", "range", undefined, "%E", "Reduces post-meal blood sugar fluctuations by distributing carbohydrates across meals and snacks.", "whole_grain,low_gi,vegetable", "added_sugar,sweet_drink"],
  ["gestational_diabetes", "gestational diabetes", "protein_priority", "protein", "gte", 1.0, "g/kg/d", "Consume plenty of high-quality protein and fish, legumes, Use eggs.", "fish,legume,egg,low_fat_meat", ""],
  ["gestational_diabetes", "gestational diabetes", "added_sugar_avoid", "addedSugar", "lt", 5, "%E", "Sugary drinks and snacks, Avoid foods with fructose syrup.", "water,low_sugar", "sweet_drink,fructose,added_sugar"],
  ["gestational_diabetes", "gestational diabetes", "regular_meals", "", "prefer", undefined, "", "Eat regular meals and avoid late-night snacks and long fasting..", "regular_meal,small_frequent", "late_night_snack"],
  ["gestational_diabetes", "gestational diabetes", "weight_gain_safe", "", "prefer", undefined, "", "before pregnancy BMIFollow a weight gain range tailored to your (WST801 standard).", "balanced_weight_gain", ""],
  ["infant_complementary_feeding", "Supplementary food for weaning", "iron_priority", "iron", "prefer", undefined, "mg/d", "6Gradually introduce iron-rich baby food starting from 1 month of age..", "iron_fortified,red_meat,liver", ""],
  ["infant_complementary_feeding", "Supplementary food for weaning", "salt_sugar_avoid", "", "avoid", undefined, "", "1Salt and sugar are not added to baby food for infants under the age of three..", "natural_food", "salt,added_sugar,honey"],
  ["infant_complementary_feeding", "Supplementary food for weaning", "texture_progression", "", "prefer", undefined, "", "Depending on the age of the month, porridge is made in Mieum., Jinbab, Proceed gradually in order of minced food..", "age_appropriate_texture", ""],
  ["infant_complementary_feeding", "Supplementary food for weaning", "allergen_introduction", "", "prefer", undefined, "", "egg, fish, Allergenic foods such as nuts are introduced step by step..", "single_introduction", "multiple_allergen_at_once"],
  ["infant_complementary_feeding", "Supplementary food for weaning", "honey_avoid", "", "avoid", undefined, "", "Due to the risk of botulism, honey is not given to children under 12 months of age..", "", "honey"]
```

That's 27 new rows across 6 conditions, plus the 15 existing = 42 total `conditionDietRules`.

---

### Task 5: Expand `nutritionTerminology` with ~50 nutrient terms

**Files:**
- Modify: `backend/src/data/referenceGuidelineSeeds.ts:401-422` (the `nutritionTerminology` array)

- [ ] **Step 1: Append nutrient term rows to the array**

Before the closing `].map(...)` on line 410, insert:

```ts
  ["energy_kcal", "能量", "Energy", "energy", "kcal", "The chemical energy provided by food is usually kcal Displayed in units."],
  ["protein", "蛋白质", "Protein", "protein", "Pro", "A macronutrient composed of amino acids. g/d Evaluated by unit."],
  ["fat", "脂肪", "Fat", "fat", "", "A macronutrient composed of fatty acids and glycerol. g/d Evaluated by unit."],
  ["saturated_fat", "饱和脂肪酸", "Saturated Fat", "saturated fat", "SFA", "When consumed excessively, fatty acids without double bonds LDL Can Raise Cholesterol."],
  ["unsaturated_fat", "不饱和脂肪酸", "Unsaturated Fat", "unsaturated fat", "UFA", "A fatty acid with a double bond·Contains polyunsaturated fatty acids."],
  ["trans_fat", "反式脂肪酸", "Trans Fat", "trans fat", "TFA", "Fatty acids produced by hydrogenation keep intake as low as possible."],
  ["cholesterol", "胆固醇", "Cholesterol", "cholesterol", "", "As a lipid component of animal foods mg/d Evaluated by unit."],
  ["carbohydrate", "碳水化合物", "Carbohydrate", "carbohydrates", "CHO", "It is a major source of energy and contains simple and complex sugars."],
  ["dietary_fiber", "膳食纤维", "Dietary Fiber", "dietary fiber", "DF", "It is a vegetable polysaccharide that humans cannot digest and helps with bowel movements and blood sugar control.."],
  ["added_sugar", "添加糖", "Added Sugar", "Added sugar", "", "Sugars added during processing or cooking account for 10% of total energy.% Recommend less than."],
  ["water", "水", "Water", "water", "", "An essential nutrient for body fluid balance and metabolism. ml/d Evaluated by unit."],
  ["sodium", "钠", "Sodium", "sodium", "Na", "A mineral that affects blood pressure regulation mg/d Evaluated by unit."],
  ["potassium", "钾", "Potassium", "Calium", "K", "A mineral involved in blood pressure and muscle function. mg/d Evaluated by unit."],
  ["calcium", "钙", "Calcium", "Calcium", "Ca", "bone and tooth formation, It is a mineral involved in muscle contraction.."],
  ["magnesium", "镁", "Magnesium", "Magnesium", "Mg", "Enzyme reactions and nerves·It is a mineral involved in muscle function.."],
  ["phosphorus", "磷", "Phosphorus", "lean", "P", "bones and ATP Inorganic substances involved in the composition mg/d Evaluated by unit."],
  ["chloride", "氯", "Chloride", "goat", "Cl", "It is a mineral involved in body fluid electrolyte balance.."],
  ["iron", "铁", "Iron", "iron", "Fe", "It is a trace element essential for hemoglobin synthesis and oxygen transport.."],
  ["zinc", "锌", "Zinc", "zinc", "Zn", "It is a trace element involved in immunity and growth.."],
  ["copper", "铜", "Copper", "copper", "Cu", "It is a trace element involved in iron metabolism and antioxidant enzyme activity.."],
  ["selenium", "硒", "Selenium", "Seren", "Se", "It is a component of the antioxidant enzyme glutathione peroxidase.."],
  ["iodine", "碘", "Iodine", "Oxo", "I", "It is a trace element essential for thyroid hormone synthesis.."],
  ["manganese", "锰", "Manganese", "manganese", "Mn", "It is a trace element involved in enzyme reactions and skeleton formation.."],
  ["chromium", "铬", "Chromium", "chrome", "Cr", "It is a trace element that acts as a cofactor in sugar metabolism.."],
  ["molybdenum", "钼", "Molybdenum", "molybdenum", "Mo", "It is a trace element that acts as a cofactor for several enzymes.."],
  ["fluoride", "氟", "Fluoride", "fluorine", "F", "It is a trace element that affects tooth enamel and bone formation.."],
  ["vitamin_a", "维生素A", "Vitamin A", "vitaminsA", "VA", "time, epithelial cells, It is a fat-soluble vitamin involved in immunity.."],
  ["vitamin_d", "维生素D", "Vitamin D", "vitaminsD", "VD", "It is a fat-soluble vitamin involved in calcium absorption and bone health.."],
  ["vitamin_e", "维生素E", "Vitamin E", "vitaminsE", "VE", "It is a fat-soluble vitamin that acts as an antioxidant and protects cell membranes.."],
  ["vitamin_k", "维生素K", "Vitamin K", "vitaminsK", "VK", "It is a fat-soluble vitamin involved in blood coagulation and bone metabolism.."],
  ["vitamin_b1", "维生素B1", "Thiamine", "vitaminsB1", "VB1", "It is a water-soluble vitamin essential for carbohydrate metabolism.."],
  ["vitamin_b2", "维生素B2", "Riboflavin", "vitaminsB2", "VB2", "Acts as a cofactor for energy metabolism enzymes."],
  ["vitamin_b6", "维生素B6", "Pyridoxine", "vitaminsB6", "VB6", "Involved in amino acid metabolism and hemoglobin synthesis."],
  ["vitamin_b12", "维生素B12", "Cobalamin", "vitaminsB12", "VB12", "DNA Involved in synthesis and formation of red blood cells."],
  ["niacin", "烟酸", "Niacin", "Nicotinic acid", "NE", "energy metabolism and NAD/NADP Involved in coenzyme synthesis."],
  ["folate", "叶酸", "Folate", "folic acid", "DFE", "DNA Involved in synthesis and formation of red blood cells, before pregnancy·It is especially important during."],
  ["biotin", "生物素", "Biotin", "biotin", "VB7", "fat·carbohydrates·It is a water-soluble vitamin involved in amino acid metabolism.."],
  ["pantothenic_acid", "泛酸", "Pantothenic Acid", "pantothenic acid", "VB5", "coenzymeA Participates in energy metabolism as a component."],
  ["choline", "胆碱", "Choline", "Colin", "", "It is a precursor of cell membrane phospholipids and the neurotransmitter acetylcholine.."],
  ["vitamin_c", "维生素C", "Vitamin C", "vitaminsC", "VC", "It is a water-soluble vitamin that promotes collagen synthesis and has antioxidant properties.."],
  ["omega_3", "n-3多不饱和脂肪酸", "n-3 PUFA", "omega-3 fatty acids", "n-3", "EPA, DHA, ALAContains polyunsaturated fatty acids that are beneficial to cardiovascular health.."],
  ["omega_6", "n-6多不饱和脂肪酸", "n-6 PUFA", "omega-6 fatty acids", "n-6", "It is a polyunsaturated fatty acid containing linoleic acid.."],
  ["gi", "血糖生成指数", "Glycemic Index", "glycemic index", "GI", "standard food(normal glucose) This is an indicator that compares the blood sugar response after a meal.."],
  ["gl", "血糖生成负荷", "Glycemic Load", "Blood sugar load", "GL", "1 serving of food GI×This is an indicator that reflects the amount of carbohydrates.."],
  ["dv_percent", "营养素参考值百分比", "Daily Value Percent", "Baseline percentage", "%DV", "On the nutrition label, it indicates the content ratio compared to the daily nutrient standard.."],
  ["nrv", "营养素参考值", "Nutrient Reference Value", "nutrient standard", "NRV", "This is the recommended daily standard value used to calculate nutrition labeling.."]
```

That brings `nutritionTerminology` from 8 to 54 entries.

- [ ] **Step 2: Verify build still passes**

Run from repo root: `npm run build`
Expected: exit 0.

---

### Task 6: Run the importer against local Mongo

**Files:**
- No code changes; existing `import-reference-guidelines.ts` runs end-to-end.

- [ ] **Step 1: Confirm Mongo is reachable**

Run from repo root: `docker compose up -d mongo`
(Or skip if Mongo is already running locally on `mongodb://127.0.0.1:27017/foodvisor`.)
Expected: container `mongo` is up.

- [ ] **Step 2: Run the importer**

Run from `backend/`: `npm run import:reference-guidelines`
Expected output (exact counts will vary slightly):
```
referenceSources: deleted N, inserted 27
nutrientIntakeRules: deleted N, inserted ~12000
conditionDietRules: deleted N, inserted 42
riskAssessmentRules: deleted N, inserted 5
nutritionTerminology: deleted N, inserted 54
dataValidationRules: deleted N, inserted 8
```

Process exits 0.

- [ ] **Step 3: Re-run the importer to confirm idempotency**

Run again from `backend/`: `npm run import:reference-guidelines`
Expected: same `inserted` counts; `deleted` counts equal previous `inserted` counts (replaceMany semantics — end state identical).

---

### Task 7: Spot-check the API

**Files:**
- No code changes.

- [ ] **Step 1: Start the backend**

Run from `backend/`: `npm run dev` in a terminal you can leave running.
Expected: server listens on `http://localhost:4000`.

- [ ] **Step 2: Curl the new filter API**

In another terminal:

```bash
# Reference sources by category
curl -s 'http://localhost:4000/api/reference-sources?category=clinical_diet_guidance' | grep -c '"_id"'
# Expected: 9

# Condition rules for hypertension
curl -s 'http://localhost:4000/api/condition-diet-rules?conditionKey=hypertension' | grep -c '"_id"'
# Expected: 3

# Range filter on nutrient rules
curl -s 'http://localhost:4000/api/nutrient-intake-rules?nutrientKey=protein&gender=male&ageMin_gte=18&ageMax_lte=29&limit=5' | head -c 200
# Expected: JSON with items array, each having nutrientKey="protein", gender="male", ageMin>=18, ageMax<=29

# Comma-separated $in
curl -s 'http://localhost:4000/api/condition-diet-rules?conditionKey=ckd,stroke' | grep -c '"_id"'
# Expected: ≥9

# Terminology page
curl -s 'http://localhost:4000/api/nutrition-terminology?category=nutrition_reference&limit=100' | grep -c '"_id"'
# Expected: ≥54
```

If any expected count is wrong, check `import-reference-guidelines.ts` ran cleanly and the route's `filterableFields` whitelist includes the field being queried.

---

### Task 8: Spot-check the admin UI

**Files:**
- No code changes.

- [ ] **Step 1: Start the admin**

Run from `web-admin/`: `npm run dev`
Expected: serves on `http://localhost:3000`.

- [ ] **Step 2: Visit each new page and confirm rows render**

Open in a browser:
- `http://localhost:3000/reference-sources` — should list 27 rows
- `http://localhost:3000/nutrient-intake-rules` — pagination over thousands of rows
- `http://localhost:3000/condition-diet-rules` — 42 rows
- `http://localhost:3000/risk-assessment-rules` — 5 rows
- `http://localhost:3000/nutrition-terminology` — 54 rows
- `http://localhost:3000/data-validation-rules` — 8 rows

Open the edit modal on one row in each, change `sourceNote` slightly, save, reload to confirm persistence.

- [ ] **Step 3: Final build verification**

Run from repo root: `npm run build`
Expected: exit 0, both backend `tsc` and `web-admin` `next build` succeed.

---

## Self-Review Notes

- All tasks have explicit file paths and line ranges.
- Code samples are complete (no `// implement here` or `// TODO`).
- Type signatures: `createCrudRouter` (Task 1) defined with three params; Task 2 calls it with three args. Consistent.
- Field names: `filterableFields` used everywhere (not aliased). Consistent.
- The `replace("膳food", "膳食")` callout in Task 3 is a documentation note — the actual file content uses `膳食指导` directly.
- Verification steps reference `npm run build` (per CLAUDE.md), not a non-existent test suite.
- Out-of-scope (admin polish, dashboard, charts, NK Korean conversion) is explicitly Sub-project B; not addressed here.

## Acceptance

This plan ships when:
- Tasks 1–2 land the typed filter API.
- Tasks 3–5 expand the seed data to the spec's targets.
- Tasks 6 verifies idempotent import.
- Tasks 7–8 verify API + admin work end-to-end.
- `npm run build` passes from repo root (Task 8 step 3).

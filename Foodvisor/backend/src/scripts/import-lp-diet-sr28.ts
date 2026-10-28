import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";
import { NutritionConstraint } from "../models/nutrition-constraint.js";

type CsvRecord = Record<string, string>;

const dataSource = "USDA SR28 via lp-diet-main";
const constraintProfileKey = "lp-diet-sr28-adult";
const basePath = path.join(process.cwd(), "..", "food data", "lp-diet-main");
const sr28Path = path.resolve(process.env.LP_DIET_SR28_CSV_PATH || path.join(basePath, "sr28.csv"));
const constraintsPath = path.resolve(process.env.LP_DIET_CONSTRAINTS_CSV_PATH || path.join(basePath, "constraints.csv"));

const zeroDailyValues = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  saturatedFat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0,
  calcium: 0,
  iron: 0,
  magnesium: 0,
  potassium: 0,
  zinc: 0,
  vitaminA: 0,
  vitaminB1: 0,
  vitaminB2: 0,
  vitaminB3: 0,
  vitaminB6: 0,
  vitaminB12: 0,
  vitaminC: 0,
  vitaminD: 0,
  vitaminE: 0,
  vitaminK: 0,
  folate: 0
};

const nutrientFieldMap: Record<string, { key: string; label: string; unit: string; percent?: boolean; caloriesPerGram?: number }> = {
  "calcium (mg)": { key: "calciumMg", label: "calcium", unit: "mg" },
  "carbohydrate (g)": { key: "carbohydrateG", label: "carbohydrate", unit: "g" },
  "choline (mg)": { key: "cholineMg", label: "choline", unit: "mg" },
  "copper (mg)": { key: "copperMg", label: "copper", unit: "mg" },
  "dietary fiber (g)": { key: "dietaryFiberG", label: "dietary fiber", unit: "g" },
  "dietary folate (Î¼g)": { key: "dietaryFolateUg", label: "dietary folate", unit: "ug" },
  "dietary folate (μg)": { key: "dietaryFolateUg", label: "dietary folate", unit: "ug" },
  "energy (kcal)": { key: "energyKcal", label: "energy", unit: "kcal" },
  "iron (mg)": { key: "ironMg", label: "iron", unit: "mg" },
  "magnesium (mg)": { key: "magnesiumMg", label: "magnesium", unit: "mg" },
  "manganese (mg)": { key: "manganeseMg", label: "manganese", unit: "mg" },
  "niacin (mg)": { key: "niacinMg", label: "niacin", unit: "mg" },
  "pantothenic acid (mg)": { key: "pantothenicAcidMg", label: "pantothenic acid", unit: "mg" },
  "phosphorus (mg)": { key: "phosphorusMg", label: "phosphorus", unit: "mg" },
  "polyunsaturated fatty acids (g)": { key: "polyunsaturatedFatG", label: "polyunsaturated fatty acids", unit: "g" },
  "potassium (mg)": { key: "potassiumMg", label: "potassium", unit: "mg" },
  "protein (g)": { key: "proteinG", label: "protein", unit: "g" },
  "riboflavin (mg)": { key: "riboflavinMg", label: "riboflavin", unit: "mg" },
  "selenium (Î¼g)": { key: "seleniumUg", label: "selenium", unit: "ug" },
  "selenium (μg)": { key: "seleniumUg", label: "selenium", unit: "ug" },
  "sodium (mg)": { key: "sodiumMg", label: "sodium", unit: "mg" },
  "thiamin (mg)": { key: "thiaminMg", label: "thiamin", unit: "mg" },
  "total fat (g)": { key: "totalFatG", label: "total fat", unit: "% calories", percent: true, caloriesPerGram: 9 },
  "vitamin a (Î¼g)": { key: "vitaminAUg", label: "vitamin a", unit: "ug" },
  "vitamin a (μg)": { key: "vitaminAUg", label: "vitamin a", unit: "ug" },
  "vitamin b12 (Î¼g)": { key: "vitaminB12Ug", label: "vitamin b12", unit: "ug" },
  "vitamin b12 (μg)": { key: "vitaminB12Ug", label: "vitamin b12", unit: "ug" },
  "vitamin b6 (mg)": { key: "vitaminB6Mg", label: "vitamin b6", unit: "mg" },
  "vitamin c (mg)": { key: "vitaminCMg", label: "vitamin c", unit: "mg" },
  "vitamin d (iu)": { key: "vitaminDIu", label: "vitamin d", unit: "iu" },
  "vitamin e (mg)": { key: "vitaminEMg", label: "vitamin e", unit: "mg" },
  "vitamin k (Î¼g)": { key: "vitaminKUg", label: "vitamin k", unit: "ug" },
  "vitamin k (μg)": { key: "vitaminKUg", label: "vitamin k", unit: "ug" },
  "zinc (mg)": { key: "zincMg", label: "zinc", unit: "mg" }
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function num(value: unknown) {
  const parsed = Number(clean(value).replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseCsv(text: string) {
  const source = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (quoted) {
      if (char === "\"") {
        if (source[index + 1] === "\"") {
          cell += "\"";
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === "\"") quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((value) => value.length > 1 || value[0] !== "");
}

async function loadRecords(filePath: string) {
  const rows = parseCsv(await readFile(filePath, "utf8"));
  const headers = rows[0].map((header) => clean(header).replace(/^\uFEFF/, ""));

  return rows.slice(1).map((row, index) => {
    const record: CsvRecord = {};
    headers.forEach((header, columnIndex) => {
      record[header] = row[columnIndex] ?? "";
    });
    record.__rowNumber = String(index + 2);
    return record;
  });
}

function pct(value: number, dailyValue: number) {
  return Number((((value || 0) / dailyValue) * 100).toFixed(1));
}

function percentFor(values: typeof dailyValueProfiles[number]["values"], food: typeof zeroDailyValues) {
  return Object.fromEntries(Object.entries(food).map(([key, amount]) => [key, pct(amount, values[key as keyof typeof values] || 1)]));
}

function classify(name: string) {
  const text = name.toLowerCase();
  const pairs: Array<[RegExp, string, string, string]> = [
    [/\b(beef|pork|lamb|veal|mutton|goat|ham|bacon|sausage|meat|offal)\b/, "meat", "animal food", "meat"],
    [/\b(chicken|turkey|duck|goose|poultry)\b/, "poultry", "animal food", "poultry"],
    [/\b(fish|salmon|tuna|cod|herring|sardine|trout|shrimp|prawn|crab|lobster|oyster|clam|mussel|scallop|seaweed|kelp)\b/, "seafood", "animal or marine food", "seafood"],
    [/\b(egg|eggs)\b/, "egg", "animal food", "egg"],
    [/\b(milk|cheese|yogurt|yoghurt|cream|butter|dairy|cheddar|mozzarella)\b/, "dairy", "animal food", "dairy"],
    [/\b(apple|banana|orange|grape|pear|peach|melon|berry|fruit|mango|pineapple|lemon|lime|apricot|plum|cherry|kiwi|fig|date)\b/, "fruit", "plant food", "fruit"],
    [/\b(vegetable|lettuce|spinach|cabbage|broccoli|carrot|onion|pepper|tomato|potato|asparagus|beet|celery|pumpkin|zucchini)\b/, "vegetable", "plant food", "vegetable"],
    [/\b(bean|soy|tofu|lentil|pea|chickpea|legume)\b/, "legume", "plant food", "legume"],
    [/\b(nut|almond|walnut|cashew|hazelnut|pistachio|seed|peanut|sesame)\b/, "nuts and seeds", "plant food", "nuts and seeds"],
    [/\b(rice|wheat|oat|barley|corn|cereal|bread|pasta|noodle|flour|cracker|toast|grain|rye)\b/, "grain", "plant food", "grain"],
    [/\b(oil|lard|margarine|shortening|fat|butter)\b/, "fat and oil", "fat and oil", "fat and oil"],
    [/\b(juice|drink|beverage|tea|coffee|soda|wine|beer|water|syrup)\b/, "beverage", "beverage", "beverage"],
    [/\b(spice|salt|sauce|seasoning|curry|vinegar|mustard)\b/, "seasoning", "seasoning", "seasoning"],
    [/\b(candy|chocolate|cake|cookie|dessert|pie|ice cream|snack|biscuit|pastry|pudding)\b/, "snack", "mixed food", "sweet or snack"],
    [/\b(soup|pizza|sandwich|burger|meal|salad|stew|casserole)\b/, "prepared food", "mixed food", "prepared food"]
  ];

  for (const [pattern, category, foodGroup, foodSubgroup] of pairs) {
    if (pattern.test(text)) return { category, foodGroup, foodSubgroup };
  }

  return { category: "food", foodGroup: "food", foodSubgroup: "general" };
}

function inferAllergens(name: string) {
  const text = name.toLowerCase();
  const values: string[] = [];
  if (/\b(milk|cheese|yogurt|yoghurt|cream|butter|dairy|lactose)\b/.test(text)) values.push("milk");
  if (/\b(egg|eggs)\b/.test(text)) values.push("egg");
  if (/\b(fish|salmon|tuna|cod|herring|sardine|trout)\b/.test(text)) values.push("fish");
  if (/\b(shrimp|prawn|crab|lobster|crayfish)\b/.test(text)) values.push("crustacean shellfish");
  if (/\b(oyster|clam|mussel|scallop)\b/.test(text)) values.push("mollusk shellfish");
  if (/\b(peanut|peanuts)\b/.test(text)) values.push("peanut");
  if (/\b(almond|walnut|cashew|hazelnut|pistachio|pecan|macadamia|tree nut)\b/.test(text)) values.push("tree nuts");
  if (/\b(wheat|flour|bread|pasta|noodle|cracker|toast|rye)\b/.test(text)) values.push("wheat");
  if (/\b(soy|tofu|soybean|soybeans)\b/.test(text)) values.push("soy");
  if (/\b(sesame)\b/.test(text)) values.push("sesame");
  return [...new Set(values)];
}

function dietUseCases(calories: number, protein: number, fat: number, carbs: number, fiber: number, sugar: number, sodium: number) {
  const values: string[] = [];
  if (calories <= 120 || fiber >= 5) values.push("weight_loss");
  if (sugar <= 5 && fiber >= 2) values.push("diabetes_management");
  if (protein >= 15) values.push("athlete", "muscle_gain");
  if (fiber >= 5) values.push("high_fiber_diet");
  if (sodium <= 50) values.push("low_sodium");
  if (fat >= 10 && carbs <= 10) values.push("low_carb");
  if (carbs >= 20 && fat <= 3) values.push("pre_workout_energy");
  return [...new Set(values)];
}

function buildSourceNutrition(record: CsvRecord) {
  return {
    energyKcal: num(record["energy (kcal)"]),
    proteinG: num(record["protein (g)"]),
    totalFatG: num(record["total fat (g)"]),
    carbohydrateG: num(record["carbohydrate (g)"]),
    dietaryFiberG: num(record["dietary fiber (g)"]),
    sugarG: num(record["sugar (g)"]),
    calciumMg: num(record["calcium (mg)"]),
    ironMg: num(record["iron (mg)"]),
    magnesiumMg: num(record["magnesium (mg)"]),
    phosphorusMg: num(record["phosphorus (mg)"]),
    potassiumMg: num(record["potassium (mg)"]),
    sodiumMg: num(record["sodium (mg)"]),
    zincMg: num(record["zinc (mg)"]),
    copperMg: num(record["copper (mg)"]),
    manganeseMg: num(record["manganese (mg)"]),
    seleniumUg: num(record["selenium (Î¼g)"] || record["selenium (μg)"]),
    vitaminCMg: num(record["vitamin c (mg)"]),
    thiaminMg: num(record["thiamin (mg)"]),
    riboflavinMg: num(record["riboflavin (mg)"]),
    niacinMg: num(record["niacin (mg)"]),
    pantothenicAcidMg: num(record["pantothenic acid (mg)"]),
    vitaminB6Mg: num(record["vitamin b6 (mg)"]),
    totalFolateUg: num(record["total folate (Î¼g)"] || record["total folate (μg)"]),
    dietaryFolateUg: num(record["dietary folate equivalents (Î¼g)"] || record["dietary folate equivalents (μg)"]),
    cholineMg: num(record["choline (mg)"]),
    vitaminB12Ug: num(record["vitamin b12 (Î¼g)"] || record["vitamin b12 (μg)"]),
    vitaminAIu: num(record["vitamin a (iu)"]),
    vitaminAUg: num(record["vitamin a retinol activity equivalents (Î¼g)"] || record["vitamin a retinol activity equivalents (μg)"]),
    vitaminDMcg: num(record["vitamin d (Î¼g)"] || record["vitamin d (μg)"]),
    vitaminDIu: num(record["vitamin d (iu)"]),
    vitaminEMg: num(record["vitamin e (alpha-tocopherol) (mg)"]),
    vitaminKUg: num(record["vitamin k (phylloquinone) (Î¼g)"] || record["vitamin k (phylloquinone) (μg)"]),
    saturatedFatG: num(record["saturated fatty acid (g)"]),
    monounsaturatedFatG: num(record["monounsaturated fatty acids (g)"]),
    polyunsaturatedFatG: num(record["polyunsaturated fatty acids (g)"]),
    cholesterolMg: num(record["cholesterol (mg)"])
  };
}

function buildFood(record: CsvRecord) {
  const name = clean(record.description);
  const sourceNutrition = buildSourceNutrition(record);
  const classification = classify(name);
  const dvBase = {
    ...zeroDailyValues,
    calories: sourceNutrition.energyKcal,
    protein: sourceNutrition.proteinG,
    carbs: sourceNutrition.carbohydrateG,
    fat: sourceNutrition.totalFatG,
    saturatedFat: sourceNutrition.saturatedFatG,
    fiber: sourceNutrition.dietaryFiberG,
    sugar: sourceNutrition.sugarG,
    sodium: sourceNutrition.sodiumMg,
    cholesterol: sourceNutrition.cholesterolMg,
    calcium: sourceNutrition.calciumMg,
    iron: sourceNutrition.ironMg,
    magnesium: sourceNutrition.magnesiumMg,
    potassium: sourceNutrition.potassiumMg,
    zinc: sourceNutrition.zincMg,
    vitaminA: sourceNutrition.vitaminAUg,
    vitaminB1: sourceNutrition.thiaminMg,
    vitaminB2: sourceNutrition.riboflavinMg,
    vitaminB3: sourceNutrition.niacinMg,
    vitaminB6: sourceNutrition.vitaminB6Mg,
    vitaminB12: sourceNutrition.vitaminB12Ug,
    vitaminC: sourceNutrition.vitaminCMg,
    vitaminD: sourceNutrition.vitaminDMcg,
    vitaminE: sourceNutrition.vitaminEMg,
    vitaminK: sourceNutrition.vitaminKUg,
    folate: sourceNutrition.dietaryFolateUg
  };
  const fat = sourceNutrition.totalFatG;
  const oiliness = fat >= 20 ? "very high" : fat >= 10 ? "high" : fat >= 3 ? "medium" : "low";

  return {
    koreanName: name,
    chineseName: "",
    sourceFoodId: clean(record.ndb_id),
    dataType: "USDA SR28",
    category: classification.category,
    foodGroup: classification.foodGroup,
    foodSubgroup: classification.foodSubgroup,
    servingSize: "100 g",
    calories: sourceNutrition.energyKcal,
    macros: {
      protein: sourceNutrition.proteinG,
      fat: sourceNutrition.totalFatG,
      carbs: sourceNutrition.carbohydrateG,
      fiber: sourceNutrition.dietaryFiberG
    },
    saturatedFat: sourceNutrition.saturatedFatG,
    transFat: 0,
    unsaturatedFat: Number((sourceNutrition.monounsaturatedFatG + sourceNutrition.polyunsaturatedFatG).toFixed(4)),
    cholesterolMg: sourceNutrition.cholesterolMg,
    sugar: sourceNutrition.sugarG,
    glycemicIndex: 0,
    oiliness,
    oilinessScore: fat >= 20 ? 5 : fat >= 10 ? 4 : fat >= 3 ? 2 : 0,
    vitamins: {
      vitaminA: dvBase.vitaminA,
      vitaminB1: dvBase.vitaminB1,
      vitaminB2: dvBase.vitaminB2,
      vitaminB3: dvBase.vitaminB3,
      vitaminB6: dvBase.vitaminB6,
      vitaminB12: dvBase.vitaminB12,
      vitaminC: dvBase.vitaminC,
      vitaminD: dvBase.vitaminD,
      vitaminE: dvBase.vitaminE,
      vitaminK: dvBase.vitaminK,
      folate: dvBase.folate
    },
    minerals: {
      calcium: dvBase.calcium,
      iron: dvBase.iron,
      magnesium: dvBase.magnesium,
      potassium: dvBase.potassium,
      sodium: dvBase.sodium,
      zinc: dvBase.zinc
    },
    allergens: inferAllergens(name),
    ingredients: [name],
    additives: [],
    dailyValuePercent: percentFor(dailyValueProfiles[0].values, dvBase),
    dailyValuePercentByProfile: dailyValueProfiles.map((profile) => ({
      profileKey: profile.profileKey,
      label: profile.label,
      purpose: profile.purpose,
      values: percentFor(profile.values, dvBase)
    })),
    dietUseCases: dietUseCases(
      sourceNutrition.energyKcal,
      sourceNutrition.proteinG,
      sourceNutrition.totalFatG,
      sourceNutrition.carbohydrateG,
      sourceNutrition.dietaryFiberG,
      sourceNutrition.sugarG,
      sourceNutrition.sodiumMg
    ),
    dietUseNote:
      "USDA SR28 per-100g nutrient data imported from lp-diet-main. Review before medical recommendation.",
    dataSource,
    sourceNutrition,
    sourceNote: JSON.stringify({
      sourceProject: "lp-diet-main",
      sourceFile: "sr28.csv",
      originalDataset: "USDA National Nutrient Database for Standard Reference, Release 28",
      rowNumber: record.__rowNumber,
      ndbId: clean(record.ndb_id)
    }),
    tags: [classification.category, classification.foodGroup, classification.foodSubgroup, "usda-sr28", "lp-diet-main"].filter(Boolean),
    doctor_verified: false
  };
}

async function importFoods() {
  for (const profile of dailyValueProfiles) {
    await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
  }

  const records = await loadRecords(sr28Path);
  const docs = records.filter((record) => clean(record.description)).map(buildFood);

  const deleted = await Food.deleteMany({ dataSource });
  console.log(`Deleted ${deleted.deletedCount} existing ${dataSource} foods.`);

  for (let index = 0; index < docs.length; index += 500) {
    await Food.insertMany(docs.slice(index, index + 500), { ordered: false });
    console.log(`Imported ${Math.min(index + 500, docs.length)}/${docs.length} ${dataSource} foods.`);
  }
}

async function importConstraints() {
  const rows = await loadRecords(constraintsPath);
  const docs = rows
    .map((record) => {
      const nutrient = clean(record.nutrient);
      const meta = nutrientFieldMap[nutrient];
      if (!meta) return null;

      return {
        profileKey: constraintProfileKey,
        nutrientKey: meta.key,
        nutrientLabel: meta.label,
        unit: meta.unit,
        lowerBound: num(record.lower_bound),
        upperBound: num(record.upper_bound),
        isPercentOfCalories: Boolean(meta.percent),
        caloriesPerGram: meta.caloriesPerGram || 0,
        dataSource,
        sourceNote: JSON.stringify({
          sourceProject: "lp-diet-main",
          sourceFile: "constraints.csv",
          originalNutrient: nutrient
        }),
        doctor_verified: false
      };
    })
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));

  const deleted = await NutritionConstraint.deleteMany({ profileKey: constraintProfileKey, dataSource });
  console.log(`Deleted ${deleted.deletedCount} existing ${constraintProfileKey} constraints.`);

  await NutritionConstraint.insertMany(docs, { ordered: false });
  console.log(`Imported ${docs.length} ${constraintProfileKey} nutrition constraints.`);
}

await connectDatabase();
await importFoods();
await importConstraints();
await mongoose.disconnect();

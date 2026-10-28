import "dotenv/config";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";

type FdcNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
};

type FdcFood = {
  fdcId: number;
  description: string;
  dataType?: string;
  brandOwner?: string;
  foodCategory?: string;
  ingredients?: string;
  foodNutrients?: FdcNutrient[];
};

type FdcSearchResponse = {
  foods?: FdcFood[];
};

const apiKey = process.env.FDC_API_KEY || "DEMO_KEY";
const targetCount = Number(process.env.FDC_IMPORT_LIMIT || Number.MAX_SAFE_INTEGER);
const pageSize = 200;
const maxPagesPerQuery = Number(process.env.FDC_MAX_PAGES_PER_QUERY || 50);
const includeBranded = process.env.FDC_INCLUDE_BRANDED === "true";
const imageMode = (process.env.FDC_IMAGE_MODE || "none").toLowerCase();
const dataTypes = includeBranded
  ? ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"]
  : ["Foundation", "SR Legacy", "Survey (FNDDS)"];
const imageDir = path.join(process.cwd(), "public", "images", "foods");
const statePath = path.join(process.cwd(), "public", "images", "foods", "_usda-import-state.json");

const queries = [
  "chicken", "beef", "pork", "fish", "salmon", "tuna", "shrimp", "egg", "milk", "cheese",
  "yogurt", "rice", "bread", "pasta", "oat", "bean", "lentil", "tofu", "apple", "banana",
  "berry", "orange", "tomato", "potato", "broccoli", "spinach", "carrot", "nuts", "oil", "soup"
];

type ImportState = {
  imported: number;
  lastQuery: string;
  lastPage: number;
  rateLimitedAt?: string;
  complete?: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

function cleanName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function localImageUrl(fdcId: number, name: string) {
  return `/images/foods/usda-${fdcId}-${slugify(name)}.svg`;
}

function nutrient(food: FdcFood, names: string[], numbers: string[] = []) {
  const item = food.foodNutrients?.find((entry) => {
    const name = (entry.nutrientName || "").toLowerCase();
    const number = entry.nutrientNumber || "";
    return names.some((candidate) => name.includes(candidate)) || numbers.includes(number);
  });
  return Number(item?.value || 0);
}

function pct(value: number | undefined, dailyValue: number) {
  return Number((((value ?? 0) / dailyValue) * 100).toFixed(1));
}

function classify(food: FdcFood) {
  const text = `${food.description} ${food.foodCategory || ""}`.toLowerCase();
  if (/salmon|tuna|mackerel|fish|cod|sardine/.test(text)) return { category: "fish", foodGroup: "animal food", foodSubgroup: "sea fish" };
  if (/shrimp|crab|oyster|clam|lobster|shellfish/.test(text)) return { category: "seafood", foodGroup: "animal food", foodSubgroup: "shellfish" };
  if (/chicken|turkey|duck/.test(text)) return { category: "meat", foodGroup: "animal food", foodSubgroup: "poultry" };
  if (/beef|pork|lamb|veal/.test(text)) return { category: "meat", foodGroup: "animal food", foodSubgroup: "red meat" };
  if (/milk|cheese|yogurt|cream/.test(text)) return { category: "dairy", foodGroup: "animal food", foodSubgroup: "dairy" };
  if (/egg/.test(text)) return { category: "egg", foodGroup: "animal food", foodSubgroup: "egg" };
  if (/rice|bread|pasta|oat|cereal|wheat|corn/.test(text)) return { category: "grain", foodGroup: "plant food", foodSubgroup: "grain" };
  if (/bean|lentil|pea|tofu|soy/.test(text)) return { category: "legume", foodGroup: "plant food", foodSubgroup: "legume" };
  if (/apple|banana|orange|berry|fruit|grape|melon/.test(text)) return { category: "fruit", foodGroup: "plant food", foodSubgroup: "fruit" };
  if (/broccoli|spinach|tomato|carrot|potato|vegetable|lettuce/.test(text)) return { category: "vegetable", foodGroup: "plant food", foodSubgroup: "vegetable" };
  if (/almond|nut|peanut|cashew/.test(text)) return { category: "nuts", foodGroup: "plant food", foodSubgroup: "nuts and seeds" };
  if (/oil|butter|margarine/.test(text)) return { category: "oil", foodGroup: "fat and oil", foodSubgroup: "oil" };
  return { category: "food", foodGroup: "mixed food", foodSubgroup: food.foodCategory || "general" };
}

function allergens(food: FdcFood) {
  const text = `${food.description} ${food.ingredients || ""}`.toLowerCase();
  const values: string[] = [];
  if (/milk|cheese|yogurt|cream|butter/.test(text)) values.push("milk");
  if (/egg/.test(text)) values.push("egg");
  if (/fish|salmon|tuna|cod|mackerel/.test(text)) values.push("fish");
  if (/shrimp|crab|lobster/.test(text)) values.push("crustacean shellfish");
  if (/oyster|clam|mussel/.test(text)) values.push("mollusk shellfish");
  if (/peanut/.test(text)) values.push("peanut");
  if (/almond|cashew|walnut|hazelnut|pecan/.test(text)) values.push("tree nuts");
  if (/wheat|bread|pasta|flour/.test(text)) values.push("wheat");
  if (/soy|tofu/.test(text)) values.push("soy");
  return [...new Set(values)];
}

function dietUseCases(calories: number, protein: number, fat: number, carbs: number, fiber: number, sugar: number, sodium: number, glycemicIndex: number) {
  const values: string[] = [];
  if (calories <= 120 || fiber >= 5) values.push("weight_loss");
  if (glycemicIndex <= 55 && sugar <= 5) values.push("diabetes_management");
  if (protein >= 15) values.push("athlete", "muscle_gain");
  if (fiber >= 5) values.push("high_fiber_diet");
  if (sodium <= 50) values.push("low_sodium");
  if (fat >= 10 && carbs <= 10) values.push("low_carb");
  if (carbs >= 20 && fat <= 2) values.push("pre_workout_energy");
  return [...new Set(values)];
}

function percentFor(values: typeof dailyValueProfiles[number]["values"], food: {
  calories: number; protein: number; carbs: number; fat: number; saturatedFat: number; fiber: number; sugar: number;
  sodium: number; cholesterol: number; calcium: number; iron: number; magnesium: number; potassium: number; zinc: number;
  vitaminA: number; vitaminB1: number; vitaminB2: number; vitaminB3: number; vitaminB6: number; vitaminB12: number;
  vitaminC: number; vitaminD: number; vitaminE: number; vitaminK: number; folate: number;
}) {
  return {
    calories: pct(food.calories, values.calories),
    protein: pct(food.protein, values.protein),
    carbs: pct(food.carbs, values.carbs),
    fat: pct(food.fat, values.fat),
    saturatedFat: pct(food.saturatedFat, values.saturatedFat),
    fiber: pct(food.fiber, values.fiber),
    sugar: pct(food.sugar, values.sugar),
    sodium: pct(food.sodium, values.sodium),
    cholesterol: pct(food.cholesterol, values.cholesterol),
    calcium: pct(food.calcium, values.calcium),
    iron: pct(food.iron, values.iron),
    magnesium: pct(food.magnesium, values.magnesium),
    potassium: pct(food.potassium, values.potassium),
    zinc: pct(food.zinc, values.zinc),
    vitaminA: pct(food.vitaminA, values.vitaminA),
    vitaminB1: pct(food.vitaminB1, values.vitaminB1),
    vitaminB2: pct(food.vitaminB2, values.vitaminB2),
    vitaminB3: pct(food.vitaminB3, values.vitaminB3),
    vitaminB6: pct(food.vitaminB6, values.vitaminB6),
    vitaminB12: pct(food.vitaminB12, values.vitaminB12),
    vitaminC: pct(food.vitaminC, values.vitaminC),
    vitaminD: pct(food.vitaminD, values.vitaminD),
    vitaminE: pct(food.vitaminE, values.vitaminE),
    vitaminK: pct(food.vitaminK, values.vitaminK),
    folate: pct(food.folate, values.folate)
  };
}

async function writePlaceholder(food: FdcFood) {
  await mkdir(imageDir, { recursive: true });
  const filePath = path.join(imageDir, `usda-${food.fdcId}-${slugify(food.description)}.svg`);
  const label = cleanName(food.description).slice(0, 52);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" rx="28" fill="#f8fafc"/>
  <circle cx="74" cy="74" r="42" fill="#dcfce7"/>
  <text x="200" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#172033">${label.replace(/&/g, "&amp;")}</text>
  <text x="200" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#64748b">USDA FDC ${food.fdcId}</text>
  <text x="200" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#16a34a">${(food.dataType || "FoodData Central").replace(/&/g, "&amp;")}</text>
</svg>`;
  await writeFile(filePath, svg);
}

async function readState(): Promise<ImportState | null> {
  try {
    return JSON.parse(await readFile(statePath, "utf8")) as ImportState;
  } catch {
    return null;
  }
}

async function writeState(state: ImportState) {
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(state, null, 2));
}

function normalizeFood(food: FdcFood) {
  const calories = nutrient(food, ["energy"], ["208"]);
  const protein = nutrient(food, ["protein"], ["203"]);
  const fat = nutrient(food, ["total lipid", "total fat"], ["204"]);
  const carbs = nutrient(food, ["carbohydrate"], ["205"]);
  const fiber = nutrient(food, ["fiber"], ["291"]);
  const sugar = nutrient(food, ["sugars"], ["269"]);
  const saturatedFat = nutrient(food, ["saturated"], ["606"]);
  const transFat = nutrient(food, ["trans"], ["605"]);
  const omega3 = nutrient(food, ["18:3", "22:6", "20:5"]);
  const omega6 = nutrient(food, ["18:2"]);
  const unsaturatedFat = Math.max(Number((fat - saturatedFat - transFat).toFixed(1)), 0);
  const sodium = nutrient(food, ["sodium"], ["307"]);
  const cholesterol = nutrient(food, ["cholesterol"], ["601"]);
  const calcium = nutrient(food, ["calcium"], ["301"]);
  const iron = nutrient(food, ["iron"], ["303"]);
  const magnesium = nutrient(food, ["magnesium"], ["304"]);
  const potassium = nutrient(food, ["potassium"], ["306"]);
  const zinc = nutrient(food, ["zinc"], ["309"]);
  const vitaminA = nutrient(food, ["vitamin a"], ["320"]);
  const vitaminB1 = nutrient(food, ["thiamin"], ["404"]);
  const vitaminB2 = nutrient(food, ["riboflavin"], ["405"]);
  const vitaminB3 = nutrient(food, ["niacin"], ["406"]);
  const vitaminB6 = nutrient(food, ["vitamin b-6"], ["415"]);
  const vitaminB12 = nutrient(food, ["vitamin b-12"], ["418"]);
  const vitaminC = nutrient(food, ["vitamin c"], ["401"]);
  const vitaminD = nutrient(food, ["vitamin d"], ["328"]);
  const vitaminE = nutrient(food, ["vitamin e"], ["323"]);
  const vitaminK = nutrient(food, ["vitamin k"], ["430"]);
  const folate = nutrient(food, ["folate"], ["417"]);
  const glycemicIndex = carbs <= 5 ? 0 : 50;
  const classified = classify(food);
  const dvBase = {
    calories, protein, carbs, fat, saturatedFat, fiber, sugar, sodium, cholesterol, calcium, iron, magnesium,
    potassium, zinc, vitaminA, vitaminB1, vitaminB2, vitaminB3, vitaminB6, vitaminB12, vitaminC, vitaminD,
    vitaminE, vitaminK, folate
  };

  return {
    fdcId: food.fdcId,
    dataType: food.dataType,
    name: cleanName(food.description),
    brand: food.brandOwner,
    ...classified,
    servingSize: "100 g",
    calories,
    macros: { protein, fat, carbs, fiber },
    saturatedFat,
    transFat,
    unsaturatedFat,
    omega3,
    omega6,
    cholesterolMg: cholesterol,
    sugar,
    glycemicIndex,
    oiliness: fat >= 20 ? "very high" : fat >= 10 ? "high" : fat >= 3 ? "Normal" : "low",
    oilinessScore: fat >= 20 ? 5 : fat >= 10 ? 4 : fat >= 3 ? 2 : 0,
    vitamins: { vitaminA, vitaminB1, vitaminB2, vitaminB3, vitaminB6, vitaminB12, vitaminC, vitaminD, vitaminE, vitaminK, folate },
    minerals: { calcium, iron, magnesium, potassium, sodium, zinc },
    bestTimeToEat: protein >= 15 ? ["lunch", "dinner", "After exercise"] : carbs >= 20 ? ["morning", "lunch", "before exercise"] : ["snack"],
    goodPairings: [],
    avoidPairings: sodium > 400 ? ["extra salt"] : [],
    cautionGroups: allergens(food).map((item) => `${item} allergy`),
    cautions: sodium > 400 ? "High sodium food. Use caution for blood pressure or edema management." : "",
    benefits: "Imported from USDA FoodData Central per 100 g nutrient data.",
    allergens: allergens(food),
    ingredients: food.ingredients ? food.ingredients.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30) : [cleanName(food.description)],
    additives: [],
    dailyValuePercent: percentFor(dailyValueProfiles[0].values, dvBase),
    dailyValuePercentByProfile: dailyValueProfiles.map((profile) => ({
      profileKey: profile.profileKey,
      label: profile.label,
      purpose: profile.purpose,
      values: percentFor(profile.values, dvBase)
    })),
    dietUseCases: dietUseCases(calories, protein, fat, carbs, fiber, sugar, sodium, glycemicIndex),
    dietUseNote: "USDA imported nutrient record. Diet use tags are program filters and should be reviewed by an admin.",
    dataSource: "USDA FoodData Central",
    sourceNote: "Per-100g values imported from FoodData Central search results. Some branded/restaurant records may be label-derived.",
    tags: [classified.category, classified.foodSubgroup, food.dataType || "USDA"].filter(Boolean),
    imageUrl: imageMode === "generated" ? localImageUrl(food.fdcId, food.description) : "",
    imageStatus: imageMode === "generated" ? "generated_placeholder" : "missing",
    doctor_verified: false
  };
}

async function search(query: string, pageNumber: number) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          pageSize,
          pageNumber,
      dataType: dataTypes,
          sortBy: "fdcId",
          sortOrder: "desc"
        }),
        signal: AbortSignal.timeout(60000)
      });
      if (response.status === 429) {
        throw new Error("FDC_RATE_LIMIT");
      }
      if (!response.ok) throw new Error(`FDC search failed for ${query}: ${response.status}`);
      return response.json() as Promise<FdcSearchResponse>;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
    }
  }

  throw lastError;
}

await connectDatabase();

for (const profile of dailyValueProfiles) {
  await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
}

const seen = new Set<number>();
const existingFoods = await Food.find({ fdcId: { $exists: true } }).select("fdcId").lean();
for (const food of existingFoods) {
  if (typeof food.fdcId === "number") seen.add(food.fdcId);
}

let imported = seen.size;
console.log(`USDA import starting with ${imported} existing imported foods.`);
const previousState = await readState();
if (previousState && !previousState.complete) {
  console.log(`Previous import state: ${previousState.imported} imported, last ${previousState.lastQuery} page ${previousState.lastPage}.`);
}

for (const query of queries) {
  for (let page = 1; page <= maxPagesPerQuery && imported < targetCount; page += 1) {
    let data: FdcSearchResponse;
    try {
      data = await search(query, page);
    } catch (error) {
      if (error instanceof Error && error.message === "FDC_RATE_LIMIT") {
        await writeState({ imported, lastQuery: query, lastPage: page, rateLimitedAt: new Date().toISOString() });
        console.log(`USDA rate limit on ${query} page ${page}. Saved resume state. Change VPN or wait, then rerun npm run import:usda.`);
        process.exit(0);
      }
      throw error;
    }
    const foods = data.foods || [];
    if (!foods.length) break;

    for (const fdcFood of foods) {
      if (imported >= targetCount) break;
      if (!fdcFood.fdcId || seen.has(fdcFood.fdcId)) continue;
      seen.add(fdcFood.fdcId);

      const food = normalizeFood(fdcFood);
      if (imageMode === "generated") {
        await writePlaceholder(fdcFood);
      }
      await Food.updateOne(
        { fdcId: fdcFood.fdcId },
        { $set: food, $setOnInsert: { koreanName: "" } },
        { upsert: true }
      );
      imported += 1;
    }

    await writeState({ imported, lastQuery: query, lastPage: page });
    console.log(`Imported ${imported}/${targetCount} after ${query} page ${page}`);
  }
  if (imported >= targetCount) break;
}

await writeState({ imported, lastQuery: "complete", lastPage: 0, complete: imported >= targetCount });
console.log(`USDA import complete: ${imported} foods. Re-run later to import newly available or previously rate-limited pages.`);
process.exit(0);

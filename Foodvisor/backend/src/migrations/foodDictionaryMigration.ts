import { mkdir, stat, writeFile } from "fs/promises";
import path from "path";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { foodDictionary } from "../data/foodDictionary.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";

const imageDir = path.join(process.cwd(), "public", "images", "foods");

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function localImageUrl(name: string) {
  return `/images/foods/${slugify(name)}.svg`;
}

function pct(value: number | undefined, dailyValue: number) {
  return Number((((value ?? 0) / dailyValue) * 100).toFixed(1));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function inferAllergens(food: (typeof foodDictionary)[number]) {
  const text = `${food.name} ${food.category} ${food.foodSubgroup} ${food.tags.join(" ")}`.toLowerCase();
  const allergens: string[] = [];

  if (["salmon", "mackerel", "tuna", "fish"].some((term) => text.includes(term))) allergens.push("fish");
  if (text.includes("shrimp")) allergens.push("crustacean shellfish");
  if (text.includes("oyster")) allergens.push("mollusk shellfish");
  if (text.includes("yogurt") || text.includes("dairy")) allergens.push("milk");
  if (text.includes("tofu") || text.includes("soy")) allergens.push("soy");
  if (text.includes("almond") || text.includes("nuts")) allergens.push("tree nuts");
  if (text.includes("egg")) allergens.push("egg");

  return allergens;
}

function inferDietUseCases(food: (typeof foodDictionary)[number]) {
  const cases: string[] = [];
  const tags = food.tags as readonly string[];
  const protein = food.macros.protein;
  const fat = food.macros.fat;
  const carbs = food.macros.carbs;
  const fiber = food.macros.fiber;

  if (food.calories <= 120 || fiber >= 5) cases.push("weight_loss");
  if (food.glycemicIndex <= 55 && food.sugar <= 5) cases.push("diabetes_management");
  if (protein >= 15) cases.push("athlete", "muscle_gain");
  if (fiber >= 5) cases.push("high_fiber_diet");
  if (food.minerals.sodium <= 50) cases.push("low_sodium");
  if (tags.includes("omega-3") || food.name === "Olive Oil" || food.name === "Avocado") cases.push("heart_health");
  if (fat >= 10 && carbs <= 10) cases.push("low_carb");
  if (carbs >= 20 && fat <= 2) cases.push("pre_workout_energy");

  return unique(cases);
}

function enrichFood(food: (typeof foodDictionary)[number]) {
  const vitamins = food.vitamins;
  const minerals = food.minerals;
  const transFat = 0;
  const unsaturatedFat = Math.max(Number((food.macros.fat - food.saturatedFat - transFat).toFixed(1)), 0);
  const tags = food.tags as readonly string[];
  const omega3 = tags.includes("omega-3") ? (food.name === "Mackerel" ? 2.6 : food.name === "Salmon" ? 2.3 : 0.3) : 0;
  const omega6 = food.name === "Almonds" ? 12.3 : food.name === "Olive Oil" ? 9.8 : food.name === "Avocado" ? 1.7 : 0;

  const percentFor = (values: typeof dailyValueProfiles[number]["values"]) => ({
    calories: pct(food.calories, values.calories),
    protein: pct(food.macros.protein, values.protein),
    carbs: pct(food.macros.carbs, values.carbs),
    fat: pct(food.macros.fat, values.fat),
    saturatedFat: pct(food.saturatedFat, values.saturatedFat),
    fiber: pct(food.macros.fiber, values.fiber),
    sugar: pct(food.sugar, values.sugar),
    sodium: pct(minerals.sodium, values.sodium),
    cholesterol: pct(food.cholesterolMg, values.cholesterol),
    calcium: pct(minerals.calcium, values.calcium),
    iron: pct(minerals.iron, values.iron),
    magnesium: pct(minerals.magnesium, values.magnesium),
    potassium: pct(minerals.potassium, values.potassium),
    zinc: pct(minerals.zinc, values.zinc),
    vitaminA: pct(vitamins.vitaminA, values.vitaminA),
    vitaminB1: pct(vitamins.vitaminB1, values.vitaminB1),
    vitaminB2: pct(vitamins.vitaminB2, values.vitaminB2),
    vitaminB3: pct(vitamins.vitaminB3, values.vitaminB3),
    vitaminB6: pct(vitamins.vitaminB6, values.vitaminB6),
    vitaminB12: pct(vitamins.vitaminB12, values.vitaminB12),
    vitaminC: pct(vitamins.vitaminC, values.vitaminC),
    vitaminD: pct(vitamins.vitaminD, values.vitaminD),
    vitaminE: pct(vitamins.vitaminE, values.vitaminE),
    vitaminK: pct(vitamins.vitaminK, values.vitaminK),
    folate: pct(vitamins.folate, values.folate)
  });

  return {
    ...food,
    imageUrl: food.imageUrl,
    imageStatus: "needs_real_download",
    transFat,
    unsaturatedFat,
    omega3,
    omega6,
    allergens: inferAllergens(food),
    ingredients: [food.name],
    additives: [],
    dietUseCases: inferDietUseCases(food),
    dietUseNote: "Use cases are program tags for filtering and education. Final recommendations should account for the user's health profile, allergies, and clinician guidance.",
    dailyValuePercent: percentFor(dailyValueProfiles[0].values),
    dailyValuePercentByProfile: dailyValueProfiles.map((profile) => ({
      profileKey: profile.profileKey,
      label: profile.label,
      purpose: profile.purpose,
      values: percentFor(profile.values)
    }))
  };
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(food: (typeof foodDictionary)[number]) {
  const filePath = path.join(imageDir, `${slugify(food.name)}.svg`);
  if (await exists(filePath)) return false;

  if (process.env.FOODVISOR_DOWNLOAD_REMOTE_IMAGES === "true") try {
    const response = await fetch(food.imageUrl, {
      redirect: "follow",
      headers: { "User-Agent": "FoodvisorMigration/1.0" },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (contentType.includes("svg")) {
      await writeFile(filePath, buffer);
      return true;
    }
  } catch {
    // Fall through to a deterministic local SVG. This keeps offline installs complete.
  }

  return false;
}

export async function downloadFoodImages() {
  await mkdir(imageDir, { recursive: true });
  let downloaded = 0;

  for (const food of foodDictionary) {
    if (await downloadImage(food)) downloaded += 1;
  }

  return { downloaded, total: foodDictionary.length, imageDir };
}

export async function migrateFoodDictionary(options: { downloadImages?: boolean; skipFoods?: boolean } = {}) {
  if (options.downloadImages) {
    await downloadFoodImages();
  }

  for (const profile of dailyValueProfiles) {
    await DailyValueProfile.updateOne(
      { profileKey: profile.profileKey },
      { $set: profile },
      { upsert: true }
    );
  }

  if (!options.skipFoods) {
    for (const food of foodDictionary.map(enrichFood)) {
      await Food.updateOne(
        { name: food.name },
        { $set: food },
        { upsert: true }
      );
    }
  }

  return {
    foodCount: options.skipFoods ? 0 : foodDictionary.length,
    profileCount: dailyValueProfiles.length
  };
}

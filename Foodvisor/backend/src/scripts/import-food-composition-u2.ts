import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";

type CsvRecord = Record<string, string>;

const dataSource = "Food-composition-dataset-master U2";
const defaultCsvPath = path.join(process.cwd(), "..", "food data", "Food-composition-dataset-master", "U2.csv");
const csvPath = path.resolve(process.env.FOOD_COMPOSITION_U2_PATH || defaultCsvPath);

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

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function num(value: unknown) {
  const raw = clean(value).replace(/%$/, "");
  if (!raw) return 0;

  const parsed = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return 0;
  return parsed > 0 ? parsed : 0;
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

async function loadU2Records() {
  const rows = parseCsv(await readFile(csvPath, "utf8"));
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

function value(record: CsvRecord, key: string) {
  return num(record[key]);
}

function classify(name: string) {
  const text = name.toLowerCase();
  const pairs: Array<[RegExp, string, string, string]> = [
    [/\b(beef|pork|lamb|veal|mutton|goat|ham|bacon|sausage|meat)\b/, "meat", "animal food", "meat"],
    [/\b(chicken|turkey|duck|goose|poultry)\b/, "poultry", "animal food", "poultry"],
    [/\b(fish|salmon|tuna|cod|herring|sardine|trout|shrimp|prawn|crab|lobster|oyster|clam|mussel|scallop|seaweed|kelp)\b/, "seafood", "animal or marine food", "seafood"],
    [/\b(egg|eggs)\b/, "egg", "animal food", "egg"],
    [/\b(milk|cheese|yogurt|yoghurt|cream|butter|dairy)\b/, "dairy", "animal food", "dairy"],
    [/\b(apple|banana|orange|grape|pear|peach|melon|berry|fruit|mango|pineapple|lemon|lime|avocado)\b/, "fruit", "plant food", "fruit"],
    [/\b(vegetable|lettuce|spinach|cabbage|broccoli|carrot|onion|pepper|tomato|lotus|root|purslane|gourd|potato)\b/, "vegetable", "plant food", "vegetable"],
    [/\b(bean|soy|tofu|lentil|pea|chickpea|legume)\b/, "legume", "plant food", "legume"],
    [/\b(nut|almond|walnut|cashew|hazelnut|pistachio|seed|peanut)\b/, "nuts and seeds", "plant food", "nuts and seeds"],
    [/\b(rice|wheat|oat|barley|corn|cereal|bread|pasta|noodle|flour|cracker|toast|grain)\b/, "grain", "plant food", "grain"],
    [/\b(oil|lard|margarine|shortening|fat)\b/, "fat and oil", "fat and oil", "fat and oil"],
    [/\b(juice|drink|beverage|tea|coffee|soda|wine|beer)\b/, "beverage", "beverage", "beverage"],
    [/\b(spice|salt|sauce|seasoning|curry|vinegar)\b/, "seasoning", "seasoning", "seasoning"],
    [/\b(candy|chocolate|cake|cookie|dessert|pie|ice cream|snack)\b/, "snack", "mixed food", "sweet or snack"],
    [/\b(soup|pizza|sandwich|burger|meal|campbell|restaurant|fast food)\b/, "prepared food", "mixed food", "prepared food"]
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
  if (/\b(wheat|flour|bread|pasta|noodle|cracker|toast)\b/.test(text)) values.push("wheat");
  if (/\b(soy|tofu|soybean|soybeans)\b/.test(text)) values.push("soy");
  if (/\b(sesame)\b/.test(text)) values.push("sesame");
  return [...new Set(values)];
}

function pct(value: number, dailyValue: number) {
  return Number((((value || 0) / dailyValue) * 100).toFixed(1));
}

function percentFor(values: typeof dailyValueProfiles[number]["values"], food: typeof zeroDailyValues) {
  return Object.fromEntries(Object.entries(food).map(([key, amount]) => [key, pct(amount, values[key as keyof typeof values] || 1)]));
}

function dietUseCases(calories: number, protein: number, fat: number, carbs: number, fiber: number, sugar: number, sodium: number, glycemicLoad: number) {
  const values: string[] = [];
  if (calories <= 120 || fiber >= 5) values.push("weight_loss");
  if ((glycemicLoad > 0 && glycemicLoad <= 10) || (sugar <= 5 && fiber >= 2)) values.push("diabetes_management");
  if (protein >= 15) values.push("athlete", "muscle_gain");
  if (fiber >= 5) values.push("high_fiber_diet");
  if (sodium <= 50) values.push("low_sodium");
  if (fat >= 10 && carbs <= 10) values.push("low_carb");
  if (carbs >= 20 && fat <= 3) values.push("pre_workout_energy");
  return [...new Set(values)];
}

function buildFood(record: CsvRecord) {
  const name = clean(record["name:"]);
  const classification = classify(name);
  const calories = value(record, "Calories:");
  const carbs = value(record, "Calories From Carbohydrate:") / 4 || value(record, "Starch:") + value(record, "Sugars:") + value(record, "Dietary Fiber:");
  const protein = value(record, "Protein:");
  const fat = value(record, "Total Fat:");
  const fiber = value(record, "Dietary Fiber:");
  const sugar = value(record, "Sugars:");
  const saturatedFat = value(record, "Saturated Fat:");
  const transFat = value(record, "Total trans fatty acids:");
  const monoFat = value(record, "Monounsaturated Fat:");
  const polyFat = value(record, "Polyunsaturated Fat:");
  const sodium = value(record, "Sodium:");
  const cholesterol = value(record, "Cholesterol:");
  const glycemicLoad = value(record, "GLYCEMIC_LOAD:");

  const dvBase = {
    ...zeroDailyValues,
    calories,
    protein,
    carbs,
    fat,
    saturatedFat,
    fiber,
    sugar,
    sodium,
    cholesterol,
    calcium: value(record, "Calcium:"),
    iron: value(record, "Iron:"),
    magnesium: value(record, "Magnesium:"),
    potassium: value(record, "Potassium:"),
    zinc: value(record, "Zinc:"),
    vitaminA: value(record, "Vitamin A:"),
    vitaminB1: value(record, "Thiamin:"),
    vitaminB2: value(record, "Riboflavin:"),
    vitaminB3: value(record, "Niacin:"),
    vitaminB6: value(record, "Vitamin B6:"),
    vitaminB12: value(record, "Vitamin B12:"),
    vitaminC: value(record, "Vitamin C:"),
    vitaminD: value(record, "Vitamin D:"),
    vitaminE: value(record, "Vitamin E (Alpha Tocopherol):"),
    vitaminK: value(record, "Vitamin K:"),
    folate: value(record, "Folate:")
  };

  return {
    koreanName: name,
    chineseName: "",
    dataType: "Food Composition Dataset U2",
    category: classification.category,
    foodGroup: classification.foodGroup,
    foodSubgroup: classification.foodSubgroup,
    servingSize: "100 g",
    calories,
    macros: {
      protein: Number(protein.toFixed(4)),
      fat: Number(fat.toFixed(4)),
      carbs: Number(carbs.toFixed(4)),
      fiber: Number(fiber.toFixed(4))
    },
    saturatedFat,
    transFat,
    unsaturatedFat: Number((monoFat + polyFat).toFixed(4)),
    omega3: value(record, "Total Omega-3 fatty acids:"),
    omega6: value(record, "Total Omega-6 fatty acids:"),
    cholesterolMg: cholesterol,
    sugar,
    glycemicIndex: 0,
    oiliness: fat >= 20 ? "very high" : fat >= 10 ? "high" : fat >= 3 ? "medium" : "low",
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
    bestTimeToEat: [],
    goodPairings: [],
    avoidPairings: [],
    cautionGroups: [],
    cautions: "",
    koreanCautions: "",
    benefits: "",
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
    dietUseCases: dietUseCases(calories, protein, fat, carbs, fiber, sugar, sodium, glycemicLoad),
    dietUseNote:
      "Per-100g values imported from Food-composition-dataset-master U2. Original TCM-style tag and scoring fields are preserved in sourceNote for ML classification.",
    dataSource,
    sourceNote: JSON.stringify({
      sourceProject: "Food-composition-dataset-master",
      sourceFile: "U2.csv",
      rowNumber: record.__rowNumber,
      originalName: name,
      tcmTagRaw: clean(record.tag),
      fullnessFactor: clean(record["Fullness Factor:"]),
      nutrientDensityRating: clean(record["ND Rating:"]),
      weightLossScore: clean(record["Weight loss:"]),
      optimumHealthScore: clean(record["Optimum health:"]),
      weightGainScore: clean(record["Weight gain:"]),
      carbsRatio: clean(record["carbs ratio:"]),
      fatsRatio: clean(record["fats ratio:"]),
      proteinRatio: clean(record["protein ratio:"]),
      glycemicLoad: clean(record["GLYCEMIC_LOAD:"]),
      completenessScore: clean(record["Completeness Score:"]),
      aminoAcidScore: clean(record["Amino Acid Score:"]),
      caloriesFromCarbohydrate: clean(record["Calories From Carbohydrate:"]),
      caloriesFromFat: clean(record["Calories From Fat:"]),
      caloriesFromProtein: clean(record["Calories From Protein:"]),
      starchG: clean(record["Starch:"]),
      sucroseG: clean(record["Sucrose:"]),
      glucoseG: clean(record["Glucose:"]),
      fructoseG: clean(record["Fructose:"]),
      lactoseG: clean(record["Lactose:"]),
      maltoseG: clean(record["Maltose:"]),
      galactoseG: clean(record["Galactose:"]),
      monoUnsaturatedFatG: monoFat,
      polyUnsaturatedFatG: polyFat,
      cholineMg: clean(record["Choline:"]),
      betaineMg: clean(record["Betaine:"]),
      copperMg: clean(record["Copper:"]),
      manganeseMg: clean(record["Manganese:"]),
      seleniumUg: clean(record["Selenium:"]),
      phosphorusMg: clean(record["Phosphorus:"]),
      waterG: clean(record["Water:"]),
      ashG: clean(record["Ash:"]),
      caffeineMg: clean(record["Caffeine:"]),
      theobromineMg: clean(record["Theobromine:"])
    }),
    tags: [classification.category, classification.foodGroup, classification.foodSubgroup, `tcm-tag-${clean(record.tag)}`].filter(Boolean),
    doctor_verified: false
  };
}

await connectDatabase();

for (const profile of dailyValueProfiles) {
  await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
}

const records = await loadU2Records();
const docs = records.filter((record) => clean(record["name:"])).map(buildFood);

const deleted = await Food.deleteMany({ dataSource });
console.log(`Deleted ${deleted.deletedCount} existing ${dataSource} foods.`);

for (let index = 0; index < docs.length; index += 500) {
  await Food.insertMany(docs.slice(index, index + 500), { ordered: false });
  console.log(`Imported ${Math.min(index + 500, docs.length)}/${docs.length} ${dataSource} foods.`);
}

const uniqueNames = new Set(docs.map((doc) => doc.koreanName)).size;
console.log(`Food-composition U2 import complete. Imported ${docs.length} foods with ${uniqueNames} unique names.`);

await mongoose.disconnect();

import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";

type CsvRecord = Record<string, string>;

const dataSource = "FoodYou-main SwissFoodCompositionDatabase";
const sourceUrl = "https://naehrwertdaten.ch";
const defaultCsvPath = path.join(
  process.cwd(),
  "..",
  "food data",
  "FoodYou-main",
  "app",
  "src",
  "commonMain",
  "composeResources",
  "files",
  "swiss-food-composition-database",
  "data.csv"
);
const csvPath = path.resolve(process.env.FOODYOU_SWISS_CSV_PATH || defaultCsvPath);

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
  const raw = clean(value);
  if (!raw) return 0;

  const parsed = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return 0;
  return parsed > 0 ? parsed : 0;
}

function gramsToMg(value: unknown) {
  return Number((num(value) * 1000).toFixed(6));
}

function gramsToMicrograms(value: unknown) {
  return Number((num(value) * 1_000_000).toFixed(6));
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

async function loadRecords() {
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

function classify(name: string) {
  const text = name.toLowerCase();
  const pairs: Array<[RegExp, string, string, string]> = [
    [/\b(beef|pork|lamb|veal|mutton|goat|ham|bacon|sausage|meat|offal)\b/, "meat", "animal food", "meat"],
    [/\b(chicken|turkey|duck|goose|poultry)\b/, "poultry", "animal food", "poultry"],
    [/\b(fish|salmon|tuna|cod|herring|sardine|trout|shrimp|prawn|crab|lobster|oyster|clam|mussel|scallop|seaweed|kelp)\b/, "seafood", "animal or marine food", "seafood"],
    [/\b(egg|eggs)\b/, "egg", "animal food", "egg"],
    [/\b(milk|cheese|yogurt|yoghurt|cream|butter|dairy|quark|curd)\b/, "dairy", "animal food", "dairy"],
    [/\b(apple|banana|orange|grape|pear|peach|melon|berry|fruit|mango|pineapple|lemon|lime|apricot|plum|cherry|kiwi|fig|date)\b/, "fruit", "plant food", "fruit"],
    [/\b(vegetable|lettuce|spinach|cabbage|broccoli|carrot|onion|pepper|tomato|potato|asparagus|beet|celery|leek|pumpkin|zucchini|aubergine|eggplant)\b/, "vegetable", "plant food", "vegetable"],
    [/\b(bean|soy|tofu|lentil|pea|chickpea|legume)\b/, "legume", "plant food", "legume"],
    [/\b(nut|almond|walnut|cashew|hazelnut|pistachio|seed|peanut|sesame)\b/, "nuts and seeds", "plant food", "nuts and seeds"],
    [/\b(rice|wheat|oat|barley|corn|cereal|bread|pasta|noodle|flour|cracker|toast|grain|spelt|rye|millet)\b/, "grain", "plant food", "grain"],
    [/\b(oil|lard|margarine|shortening|fat)\b/, "fat and oil", "fat and oil", "fat and oil"],
    [/\b(juice|drink|beverage|tea|coffee|soda|wine|beer|water|syrup)\b/, "beverage", "beverage", "beverage"],
    [/\b(spice|salt|sauce|seasoning|curry|vinegar|mustard)\b/, "seasoning", "seasoning", "seasoning"],
    [/\b(candy|chocolate|cake|cookie|dessert|pie|ice cream|snack|biscuit|pastry|pudding)\b/, "snack", "mixed food", "sweet or snack"],
    [/\b(soup|pizza|sandwich|burger|meal|lasagne|salad|stew|casserole)\b/, "prepared food", "mixed food", "prepared food"]
  ];

  for (const [pattern, category, foodGroup, foodSubgroup] of pairs) {
    if (pattern.test(text)) return { category, foodGroup, foodSubgroup };
  }

  return { category: "food", foodGroup: "food", foodSubgroup: "general" };
}

function inferAllergens(name: string) {
  const text = name.toLowerCase();
  const values: string[] = [];
  if (/\b(milk|cheese|yogurt|yoghurt|cream|butter|dairy|lactose|quark|curd)\b/.test(text)) values.push("milk");
  if (/\b(egg|eggs)\b/.test(text)) values.push("egg");
  if (/\b(fish|salmon|tuna|cod|herring|sardine|trout)\b/.test(text)) values.push("fish");
  if (/\b(shrimp|prawn|crab|lobster|crayfish)\b/.test(text)) values.push("crustacean shellfish");
  if (/\b(oyster|clam|mussel|scallop)\b/.test(text)) values.push("mollusk shellfish");
  if (/\b(peanut|peanuts)\b/.test(text)) values.push("peanut");
  if (/\b(almond|walnut|cashew|hazelnut|pistachio|pecan|macadamia|tree nut)\b/.test(text)) values.push("tree nuts");
  if (/\b(wheat|flour|bread|pasta|noodle|cracker|toast|spelt|rye)\b/.test(text)) values.push("wheat");
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

function buildFood(record: CsvRecord) {
  const name = clean(record.name);
  const classification = classify(name);
  const calories = num(record.energy);
  const protein = num(record.proteins);
  const carbs = num(record.carbohydrates);
  const fat = num(record.fats);
  const fiber = num(record.dietary_fiber);
  const sugar = num(record.sugars);
  const saturatedFat = num(record.saturated_fats);
  const transFat = 0;
  const monoFat = num(record.monounsaturated_fats);
  const polyFat = num(record.polyunsaturated_fats);
  const sodiumMg = gramsToMg(record.sodium);
  const cholesterolMg = gramsToMg(record.cholesterol);
  const packageWeight = num(record.package_weight);
  const servingWeight = num(record.serving_weight);

  const dvBase = {
    ...zeroDailyValues,
    calories,
    protein,
    carbs,
    fat,
    saturatedFat,
    fiber,
    sugar,
    sodium: sodiumMg,
    cholesterol: cholesterolMg,
    calcium: gramsToMg(record.calcium),
    iron: gramsToMg(record.iron),
    magnesium: gramsToMg(record.magnesium),
    potassium: gramsToMg(record.potassium),
    zinc: gramsToMg(record.zinc),
    vitaminA: gramsToMicrograms(record.vitamin_a),
    vitaminB1: gramsToMg(record.vitamin_b1),
    vitaminB2: gramsToMg(record.vitamin_b2),
    vitaminB3: gramsToMg(record.vitamin_b3),
    vitaminB6: gramsToMg(record.vitamin_b6),
    vitaminB12: gramsToMicrograms(record.vitamin_b12),
    vitaminC: gramsToMg(record.vitamin_c),
    vitaminD: gramsToMicrograms(record.vitamin_d),
    vitaminE: gramsToMg(record.vitamin_e),
    vitaminK: num(record.vitamin_k_micro),
    folate: gramsToMicrograms(record.vitamin_b9)
  };

  const oiliness = fat >= 20 ? "very high" : fat >= 10 ? "high" : fat >= 3 ? "medium" : "low";
  const oilinessScore = fat >= 20 ? 5 : fat >= 10 ? 4 : fat >= 3 ? 2 : 0;

  return {
    koreanName: name,
    chineseName: "",
    dataType: "Swiss Food Composition Database",
    brand: clean(record.brand),
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
    omega3: num(record.omega3),
    omega6: num(record.omega6),
    cholesterolMg,
    sugar,
    glycemicIndex: 0,
    oiliness,
    oilinessScore,
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
    dietUseCases: dietUseCases(calories, protein, fat, carbs, fiber, sugar, sodiumMg),
    dietUseNote:
      "Per-100g values imported from the FoodYou-main embedded Swiss Food Composition Database CSV. Review source licensing and translations before medical use.",
    dataSource,
    sourceNote: JSON.stringify({
      sourceProject: "FoodYou-main",
      originalDataSource: "Swiss Food Composition Database",
      sourceFile: "data.csv",
      sourceUrl,
      rowNumber: record.__rowNumber,
      originalName: name,
      saltG: clean(record.salt),
      caffeineMg: clean(record.caffeine_milli),
      addedSugarsG: "",
      solubleFiberG: "",
      insolubleFiberG: "",
      vitaminB5G: clean(record.vitamin_b5),
      vitaminB7Micro: clean(record.vitamin_b7_micro),
      manganeseMg: clean(record.manganese_milli),
      copperMg: clean(record.copper_milli),
      phosphorusMg: gramsToMg(record.phosphorus),
      seleniumUg: gramsToMicrograms(record.selenium),
      iodineUg: gramsToMicrograms(record.iodine),
      packageWeightG: packageWeight || "",
      servingWeightG: servingWeight || ""
    }),
    tags: [classification.category, classification.foodGroup, classification.foodSubgroup, "swiss-food-composition-database", "foodyou-main"].filter(Boolean),
    barcode: clean(record.barcode),
    doctor_verified: false
  };
}

await connectDatabase();

for (const profile of dailyValueProfiles) {
  await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
}

const records = await loadRecords();
const docs = records.filter((record) => clean(record.name)).map(buildFood);

const deleted = await Food.deleteMany({ dataSource });
console.log(`Deleted ${deleted.deletedCount} existing ${dataSource} foods.`);

for (let index = 0; index < docs.length; index += 500) {
  await Food.insertMany(docs.slice(index, index + 500), { ordered: false });
  console.log(`Imported ${Math.min(index + 500, docs.length)}/${docs.length} ${dataSource} foods.`);
}

const uniqueNames = new Set(docs.map((doc) => doc.koreanName)).size;
console.log(`FoodYou Swiss import complete. Imported ${docs.length} foods with ${uniqueNames} unique names.`);

await mongoose.disconnect();

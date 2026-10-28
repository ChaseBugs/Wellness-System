import "dotenv/config";
import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";

type SourceKey = "usda_no_branded" | "usda_branded" | "menustat";

type SourceConfig = {
  key: SourceKey;
  file: string;
  dataSource: string;
};

type ParsedFood = {
  source: SourceConfig;
  name: string;
  brand?: string;
};

const root = path.resolve(process.env.CFD_DATA_ROOT || path.join(process.cwd(), "..", "food data", "ComprehensiveFoodDatabase-master"));
const imageDir = path.join(process.cwd(), "public", "images", "foods");
const importLimit = Number(process.env.CFD_IMPORT_LIMIT || Number.MAX_SAFE_INTEGER);
const batchSize = Number(process.env.CFD_BATCH_SIZE || 1000);
const imageMode = (process.env.CFD_IMAGE_MODE || "none").toLowerCase();
const sourceKeys = (process.env.CFD_SOURCES || "usda_no_branded,usda_branded,menustat")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean) as SourceKey[];

const sourceConfigs: Record<SourceKey, SourceConfig> = {
  usda_no_branded: {
    key: "usda_no_branded",
    file: path.join(root, "image_scraping", "src_data", "usda_no_branded.txt"),
    dataSource: "ComprehensiveFoodDatabase USDA Non-Branded"
  },
  usda_branded: {
    key: "usda_branded",
    file: path.join(root, "image_scraping", "src_data", "usda_branded.txt"),
    dataSource: "ComprehensiveFoodDatabase USDA Branded"
  },
  menustat: {
    key: "menustat",
    file: path.join(root, "image_scraping", "src_data", "menustat.txt"),
    dataSource: "ComprehensiveFoodDatabase Menustat"
  }
};

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

const zeroVitamins = {
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

const zeroMinerals = {
  calcium: 0,
  iron: 0,
  magnesium: 0,
  potassium: 0,
  sodium: 0,
  zinc: 0
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalize(value?: string) {
  return clean(value || "").toLowerCase();
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64) || "food";
}

function hash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function recordKey(name: string, brand?: string) {
  return `${normalize(brand)}::${normalize(name)}`;
}

function classify(name: string) {
  const text = normalize(name);
  if (/salmon|tuna|mackerel|fish|cod|sardine|trout|halibut/.test(text)) return { category: "fish", foodGroup: "animal food", foodSubgroup: "sea fish" };
  if (/shrimp|crab|oyster|clam|lobster|shellfish|mussel|scallop/.test(text)) return { category: "seafood", foodGroup: "animal food", foodSubgroup: "shellfish" };
  if (/chicken|turkey|duck|goose/.test(text)) return { category: "meat", foodGroup: "animal food", foodSubgroup: "poultry" };
  if (/beef|pork|lamb|veal|ham|bacon|sausage/.test(text)) return { category: "meat", foodGroup: "animal food", foodSubgroup: "red or processed meat" };
  if (/milk|cheese|yogurt|cream|butter/.test(text)) return { category: "dairy", foodGroup: "animal food", foodSubgroup: "dairy" };
  if (/\begg\b/.test(text)) return { category: "egg", foodGroup: "animal food", foodSubgroup: "egg" };
  if (/rice|bread|pasta|oat|cereal|wheat|corn|noodle|tortilla|flour/.test(text)) return { category: "grain", foodGroup: "plant food", foodSubgroup: "grain" };
  if (/bean|lentil|pea|tofu|soy|chickpea/.test(text)) return { category: "legume", foodGroup: "plant food", foodSubgroup: "legume" };
  if (/apple|banana|orange|berry|fruit|grape|melon|mango|peach|pear|pineapple/.test(text)) return { category: "fruit", foodGroup: "plant food", foodSubgroup: "fruit" };
  if (/broccoli|spinach|tomato|carrot|potato|vegetable|lettuce|onion|pepper|cabbage/.test(text)) return { category: "vegetable", foodGroup: "plant food", foodSubgroup: "vegetable" };
  if (/almond|nut|peanut|cashew|walnut|seed/.test(text)) return { category: "nuts", foodGroup: "plant food", foodSubgroup: "nuts and seeds" };
  if (/oil|margarine|shortening/.test(text)) return { category: "oil", foodGroup: "fat and oil", foodSubgroup: "oil" };
  if (/pizza|burger|sandwich|taco|soup|salad|bowl|meal|roll|wrap/.test(text)) return { category: "prepared food", foodGroup: "mixed food", foodSubgroup: "restaurant or prepared dish" };
  return { category: "food", foodGroup: "mixed food", foodSubgroup: "general" };
}

function allergens(name: string, brand?: string) {
  const text = normalize(`${brand || ""} ${name}`);
  const values: string[] = [];
  if (/milk|cheese|yogurt|cream|butter/.test(text)) values.push("milk");
  if (/\begg\b/.test(text)) values.push("egg");
  if (/fish|salmon|tuna|cod|mackerel|trout/.test(text)) values.push("fish");
  if (/shrimp|crab|lobster/.test(text)) values.push("crustacean shellfish");
  if (/oyster|clam|mussel|scallop/.test(text)) values.push("mollusk shellfish");
  if (/peanut/.test(text)) values.push("peanut");
  if (/almond|cashew|walnut|hazelnut|pecan/.test(text)) values.push("tree nuts");
  if (/wheat|bread|pasta|flour|noodle/.test(text)) values.push("wheat");
  if (/soy|tofu/.test(text)) values.push("soy");
  return [...new Set(values)];
}

function dietUseCases(classification: ReturnType<typeof classify>) {
  if (classification.category === "fish") return ["heart_health", "athlete"];
  if (classification.category === "vegetable") return ["weight_loss", "diabetes_management", "high_fiber_diet"];
  if (classification.category === "fruit") return ["weight_loss", "pre_workout_energy"];
  if (classification.category === "legume") return ["weight_loss", "diabetes_management", "high_fiber_diet", "athlete"];
  if (classification.category === "meat" || classification.category === "egg" || classification.category === "dairy") return ["athlete", "muscle_gain"];
  if (classification.category === "prepared food") return ["general_tracking"];
  return ["general_tracking"];
}

function localImageUrl(source: SourceKey, name: string, brand?: string) {
  const id = hash(`${source}:${brand || ""}:${name}`);
  return `/images/foods/cfd-${source}-${id}-${slugify(name)}.svg`;
}

async function writeGeneratedImage(food: ParsedFood) {
  if (imageMode === "none") return;
  await mkdir(imageDir, { recursive: true });
  const relativeUrl = localImageUrl(food.source.key, food.name, food.brand);
  const filePath = path.join(process.cwd(), relativeUrl.replace(/^\/images\//, "public/images/"));
  const label = clean(food.name).slice(0, 50);
  const sourceLabel = food.brand ? clean(food.brand).slice(0, 42) : food.source.dataSource.replace("ComprehensiveFoodDatabase ", "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" rx="24" fill="#fff7ed"/>
  <rect x="24" y="24" width="352" height="252" rx="18" fill="#ffffff"/>
  <circle cx="74" cy="78" r="38" fill="#bbf7d0"/>
  <path d="M55 82c12-25 42-25 52 0-10 19-41 21-52 0z" fill="#22c55e"/>
  <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#172033">${xmlEscape(label)}</text>
  <text x="200" y="174" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#475569">${xmlEscape(sourceLabel)}</text>
  <text x="200" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#16a34a">Offline Foodvisor asset</text>
</svg>`;
  await writeFile(filePath, svg);
}

function parseLine(source: SourceConfig, line: string): ParsedFood | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (source.key === "usda_no_branded") {
    return { source, name: clean(trimmed) };
  }

  const [rawBrand, ...rest] = trimmed.split("\t");
  const name = clean(rest.join(" "));
  const brand = clean(rawBrand || "");
  if (!name) return null;
  return { source, name, brand };
}

function buildDocument(food: ParsedFood) {
  const classification = classify(food.name);
  const allergyList = allergens(food.name, food.brand);
  return {
    koreanName: food.name,
    brand: food.brand,
    dataType: food.source.key,
    ...classification,
    servingSize: "100 g",
    calories: 0,
    macros: { protein: 0, fat: 0, carbs: 0, fiber: 0 },
    saturatedFat: 0,
    transFat: 0,
    unsaturatedFat: 0,
    omega3: 0,
    omega6: 0,
    cholesterolMg: 0,
    sugar: 0,
    glycemicIndex: 0,
    oiliness: "unknown",
    oilinessScore: 0,
    vitamins: zeroVitamins,
    minerals: zeroMinerals,
    bestTimeToEat: [],
    goodPairings: [],
    avoidPairings: [],
    cautionGroups: allergyList.map((item) => `${item} allergy`),
    cautions: allergyList.length ? "Potential allergen inferred from the food name. Admin review required." : "",
    benefits: "",
    allergens: allergyList,
    ingredients: [food.name],
    additives: [],
    dailyValuePercent: zeroDailyValues,
    dailyValuePercentByProfile: dailyValueProfiles.map((profile) => ({
      profileKey: profile.profileKey,
      label: profile.label,
      purpose: profile.purpose,
      values: zeroDailyValues
    })),
    dietUseCases: dietUseCases(classification),
    dietUseNote: "Imported from ComprehensiveFoodDatabase source lists. Nutrient details are not included in these local text files.",
    dataSource: food.source.dataSource,
    sourceNote: "This local project source provides food/brand or restaurant/item names. Use USDA FDC import or MenuWithNutrition scrape CSV for nutrient values.",
    tags: [classification.category, classification.foodSubgroup, food.source.key].filter(Boolean),
    imageUrl: imageMode === "generated" ? localImageUrl(food.source.key, food.name, food.brand) : "",
    imageStatus: imageMode === "generated" ? "generated_placeholder" : "missing",
    doctor_verified: false
  };
}

async function flush(batch: ReturnType<typeof buildDocument>[], source: SourceConfig) {
  if (!batch.length) return;

  const operations = batch.map((doc) => ({
    updateOne: {
      filter: { koreanName: doc.koreanName, brand: doc.brand, dataSource: source.dataSource },
      update: { $setOnInsert: doc },
      upsert: true
    }
  }));

  await Food.bulkWrite(
    operations as Parameters<typeof Food.bulkWrite>[0],
    { ordered: false }
  );
}

await connectDatabase();

for (const profile of dailyValueProfiles) {
  await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
}

const existing = await Food.find({}, { koreanName: 1, brand: 1 }).lean();
const seen = new Set(existing.map((food) => recordKey(String(food.koreanName || ""), typeof food.brand === "string" ? food.brand : undefined)));

let imported = 0;
let skippedDuplicates = 0;

for (const key of sourceKeys) {
  const source = sourceConfigs[key];
  if (!source) {
    console.warn(`Skipping unknown CFD source: ${key}`);
    continue;
  }

  const content = await readFile(source.file, "utf8");
  const batch: ReturnType<typeof buildDocument>[] = [];
  let sourceImported = 0;

  for (const line of content.split(/\r?\n/)) {
    if (imported >= importLimit) break;
    const parsed = parseLine(source, line);
    if (!parsed) continue;

    const keyForRecord = recordKey(parsed.name, parsed.brand);
    if (seen.has(keyForRecord)) {
      skippedDuplicates += 1;
      continue;
    }
    seen.add(keyForRecord);

    await writeGeneratedImage(parsed);
    batch.push(buildDocument(parsed));
    imported += 1;
    sourceImported += 1;

    if (batch.length >= batchSize) {
      await flush(batch, source);
      batch.length = 0;
      console.log(`Imported ${imported} ComprehensiveFoodDatabase foods so far...`);
    }
  }

  await flush(batch, source);
  console.log(`Source ${source.key}: imported ${sourceImported}.`);
  if (imported >= importLimit) break;
}

console.log(`ComprehensiveFoodDatabase import complete. Imported ${imported}; skipped ${skippedDuplicates} duplicates.`);
process.exit(0);

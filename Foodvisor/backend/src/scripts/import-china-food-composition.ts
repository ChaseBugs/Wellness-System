import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";
import { translateChineseFoodName } from "../utils/chineseFoodKorean.js";

type ChinaFoodRecord = {
  foodCode?: string;
  foodName?: string;
  edible?: string;
  water?: string;
  energyKCal?: string;
  energyKJ?: string;
  protein?: string;
  fat?: string;
  CHO?: string;
  dietaryFiber?: string;
  cholesterol?: string;
  ash?: string;
  vitaminA?: string;
  carotene?: string;
  retinol?: string;
  thiamin?: string;
  riboflavin?: string;
  niacin?: string;
  vitaminC?: string;
  vitaminETotal?: string;
  vitaminE1?: string;
  vitaminE2?: string;
  vitaminE3?: string;
  Ca?: string;
  P?: string;
  K?: string;
  Na?: string;
  Mg?: string;
  Fe?: string;
  Zn?: string;
  Se?: string;
  Cu?: string;
  Mn?: string;
  remark?: string;
};

type SourceFile = {
  fileName: string;
  sourceCategory: string;
  sourceSubgroup: string;
  records: ChinaFoodRecord[];
};

type GiGroup = {
  foodGroup?: string;
  list?: Array<{ foodName?: string; GI?: number | string }>;
};

const dataSource = "china-food-composition-data-main";
const defaultDataDir = path.join(
  process.cwd(),
  "..",
  "food data",
  "china-food-composition-data-main",
  "json_data_vision_251206_Qwen2-5-VL-72B-Instruct"
);
const dataDir = path.resolve(process.env.CHINA_FOOD_COMPOSITION_ROOT || defaultDataDir);
const giPath = path.resolve(
  process.env.CHINA_FOOD_GI_PATH ||
    path.join(process.cwd(), "..", "food data", "china-food-composition-data-main", "json_gi_of_foods", "glycemic_index_of_foods.json")
);

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

const categoryMap: Record<string, { category: string; group: string }> = {
  "乳类及其制品": { category: "dairy", group: "animal food" },
  "其他类": { category: "food", group: "food" },
  "动物油脂类": { category: "animal fat", group: "fat and oil" },
  "坚果种子类": { category: "nuts and seeds", group: "plant food" },
  "干豆类及其制品": { category: "legume", group: "plant food" },
  "植物油": { category: "plant oil", group: "fat and oil" },
  "水果类及其制品": { category: "fruit", group: "plant food" },
  "畜肉类及其制品": { category: "meat", group: "animal food" },
  "禽肉类及其制品": { category: "poultry", group: "animal food" },
  "菌藻类": { category: "mushroom and algae", group: "plant food" },
  "蔬菜类及其制品": { category: "vegetable", group: "plant food" },
  "薯类淀粉及其制品": { category: "starch and tuber", group: "plant food" },
  "蛋类及其制品": { category: "egg", group: "animal food" },
  "谷类及其制品": { category: "grain", group: "plant food" },
  "鱼虾蟹贝类": { category: "seafood", group: "animal food" },
  "婴幼儿食品": { category: "infant food", group: "special diet food" }
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function num(value: unknown) {
  const raw = clean(value);
  if (!raw || /^(?:-|—|–|一|二|tr|trace)$/i.test(raw)) return 0;

  const matches = raw.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/g);
  if (!matches?.length) return 0;

  const parsed = Number(matches[matches.length - 1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeName(value: string) {
  return clean(value)
    .replace(/^[*＊]\s*/, "")
    .replace(/[（(].*?[）)]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function parseSourceParts(fileName: string) {
  const base = fileName.replace(/^merged[-_]/, "").replace(/\.json$/i, "");
  const [sourceCategory = "food", ...rest] = base.split("-");
  return {
    sourceCategory,
    sourceSubgroup: rest.join("-") || sourceCategory
  };
}

function classify(sourceCategory: string, sourceSubgroup: string) {
  const mapped = categoryMap[sourceCategory] || { category: sourceCategory || "food", group: "food" };
  return {
    category: mapped.category,
    foodGroup: mapped.group,
    foodSubgroup: sourceSubgroup || sourceCategory || "general"
  };
}

function pct(value: number, dailyValue: number) {
  return Number((((value || 0) / dailyValue) * 100).toFixed(1));
}

function percentFor(values: typeof dailyValueProfiles[number]["values"], food: typeof zeroDailyValues) {
  return Object.fromEntries(Object.entries(food).map(([key, value]) => [key, pct(value, values[key as keyof typeof values] || 1)]));
}

function inferAllergens(name: string, sourceCategory: string, sourceSubgroup: string) {
  const text = `${name} ${sourceCategory} ${sourceSubgroup}`;
  const values: string[] = [];
  if (/牛奶|酸奶|奶粉|奶酪|炼乳|奶油|乳/.test(text)) values.push("milk");
  if (/鸡蛋|鸭蛋|鹅蛋|鹌鹑蛋|蛋/.test(text)) values.push("egg");
  if (/鱼|鳕|鲑|带鱼|鲫|鲤|鲢|鲤|鲈|鲳|鲅|鳗|鳟|鲨/.test(text)) values.push("fish");
  if (/虾|蟹|龙虾|螃蟹/.test(text)) values.push("crustacean shellfish");
  if (/贝|蛤|蛏|牡蛎|扇贝|鲍|螺/.test(text)) values.push("mollusk shellfish");
  if (/花生/.test(text)) values.push("peanut");
  if (/核桃|杏仁|腰果|榛子|松子|开心果|栗|树坚果|坚果/.test(text)) values.push("tree nuts");
  if (/小麦|面粉|面条|馒头|挂面|麦/.test(text)) values.push("wheat");
  if (/黄豆|黑豆|大豆|豆腐|豆浆|豆乳|豆/.test(text)) values.push("soy");
  return [...new Set(values)];
}

function dietUseCases(calories: number, protein: number, fat: number, carbs: number, fiber: number, sodium: number, glycemicIndex: number) {
  const values: string[] = [];
  if (calories <= 120 || fiber >= 5) values.push("weight_loss");
  if ((glycemicIndex > 0 && glycemicIndex <= 55) || fiber >= 2) values.push("diabetes_management");
  if (protein >= 15) values.push("athlete", "muscle_gain");
  if (fiber >= 5) values.push("high_fiber_diet");
  if (sodium <= 50) values.push("low_sodium");
  if (fat >= 10 && carbs <= 10) values.push("low_carb");
  if (carbs >= 20 && fat <= 3) values.push("pre_workout_energy");
  return [...new Set(values)];
}

async function loadSourceFiles() {
  const files = (await readdir(dataDir)).filter((file) => file.toLowerCase().endsWith(".json")).sort();
  const sourceFiles: SourceFile[] = [];

  for (const fileName of files) {
    const filePath = path.join(dataDir, fileName);
    const records = JSON.parse(await readFile(filePath, "utf8")) as ChinaFoodRecord[];
    if (!Array.isArray(records)) {
      throw new Error(`${filePath} is not a JSON array`);
    }

    sourceFiles.push({
      fileName,
      ...parseSourceParts(fileName),
      records
    });
  }

  return sourceFiles;
}

async function loadGiMap() {
  try {
    const groups = JSON.parse(await readFile(giPath, "utf8")) as GiGroup[];
    const map = new Map<string, number>();

    for (const group of groups) {
      for (const item of group.list || []) {
        const name = normalizeName(clean(item.foodName));
        const gi = num(item.GI);
        if (name && gi > 0) map.set(name, gi);
      }
    }

    return map;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`GI data skipped: ${message}`);
    return new Map<string, number>();
  }
}

function buildFood(record: ChinaFoodRecord, source: SourceFile, giMap: Map<string, number>) {
  const chineseName = clean(record.foodName);
  const normalizedChineseName = normalizeName(chineseName);
  const { category, foodGroup, foodSubgroup } = classify(source.sourceCategory, source.sourceSubgroup);
  const calories = num(record.energyKCal);
  const protein = num(record.protein);
  const fat = num(record.fat);
  const carbs = num(record.CHO);
  const fiber = num(record.dietaryFiber);
  const sodium = num(record.Na);
  const cholesterol = num(record.cholesterol);
  const glycemicIndex = giMap.get(normalizedChineseName) || 0;

  const dvBase = {
    ...zeroDailyValues,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sodium,
    cholesterol,
    calcium: num(record.Ca),
    iron: num(record.Fe),
    magnesium: num(record.Mg),
    potassium: num(record.K),
    zinc: num(record.Zn),
    vitaminA: num(record.vitaminA) || num(record.retinol),
    vitaminB1: num(record.thiamin),
    vitaminB2: num(record.riboflavin),
    vitaminB3: num(record.niacin),
    vitaminC: num(record.vitaminC),
    vitaminE: num(record.vitaminETotal)
  };

  const oiliness = fat >= 20 ? "very high" : fat >= 10 ? "high" : fat >= 3 ? "medium" : "low";
  const oilinessScore = fat >= 20 ? 5 : fat >= 10 ? 4 : fat >= 3 ? 2 : 0;

  return {
    koreanName: translateChineseFoodName(chineseName, category),
    chineseName,
    dataType: "China Food Composition Data",
    category,
    foodGroup,
    foodSubgroup,
    servingSize: "100 g edible portion",
    calories,
    macros: { protein, fat, carbs, fiber },
    saturatedFat: 0,
    transFat: 0,
    unsaturatedFat: 0,
    omega3: 0,
    omega6: 0,
    cholesterolMg: cholesterol,
    sugar: 0,
    glycemicIndex,
    oiliness,
    oilinessScore,
    vitamins: {
      vitaminA: dvBase.vitaminA,
      vitaminB1: dvBase.vitaminB1,
      vitaminB2: dvBase.vitaminB2,
      vitaminB3: dvBase.vitaminB3,
      vitaminB6: 0,
      vitaminB12: 0,
      vitaminC: dvBase.vitaminC,
      vitaminD: 0,
      vitaminE: dvBase.vitaminE,
      vitaminK: 0,
      folate: 0
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
    allergens: inferAllergens(chineseName, source.sourceCategory, source.sourceSubgroup),
    ingredients: [chineseName],
    additives: [],
    dailyValuePercent: percentFor(dailyValueProfiles[0].values, dvBase),
    dailyValuePercentByProfile: dailyValueProfiles.map((profile) => ({
      profileKey: profile.profileKey,
      label: profile.label,
      purpose: profile.purpose,
      values: percentFor(profile.values, dvBase)
    })),
    dietUseCases: dietUseCases(calories, protein, fat, carbs, fiber, sodium, glycemicIndex),
    dietUseNote:
      "Per-100g edible-portion values imported from china-food-composition-data-main. OCR/vision-extracted source rows should be admin-reviewed before medical use.",
    dataSource,
    sourceNote: JSON.stringify({
      sourceProject: dataSource,
      sourceFolder: path.basename(dataDir),
      sourceFile: source.fileName,
      foodCode: clean(record.foodCode),
      sourceCategory: source.sourceCategory,
      sourceSubgroup: source.sourceSubgroup,
      ediblePortionPercent: clean(record.edible),
      waterG: clean(record.water),
      energyKJ: clean(record.energyKJ),
      ashG: clean(record.ash),
      phosphorusMg: clean(record.P),
      seleniumUg: clean(record.Se),
      copperMg: clean(record.Cu),
      manganeseMg: clean(record.Mn),
      caroteneUg: clean(record.carotene),
      vitaminEAlphaTocopherolMg: clean(record.vitaminE1),
      vitaminEGammaTocopherolMg: clean(record.vitaminE2),
      vitaminEDeltaTocopherolMg: clean(record.vitaminE3),
      remark: clean(record.remark)
    }),
    tags: [category, foodGroup, foodSubgroup, source.sourceCategory, source.sourceSubgroup].filter(Boolean),
    doctor_verified: false
  };
}

await connectDatabase();

for (const profile of dailyValueProfiles) {
  await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
}

const sourceFiles = await loadSourceFiles();
const giMap = await loadGiMap();
const docs = sourceFiles.flatMap((source) =>
  source.records
    .filter((record) => clean(record.foodName))
    .map((record) => buildFood(record, source, giMap))
);

const deleted = await Food.deleteMany({ dataSource });
console.log(`Deleted ${deleted.deletedCount} existing ${dataSource} foods.`);

for (let index = 0; index < docs.length; index += 500) {
  await Food.insertMany(docs.slice(index, index + 500), { ordered: false });
  console.log(`Imported ${Math.min(index + 500, docs.length)}/${docs.length} ${dataSource} foods.`);
}

const withGi = docs.filter((doc) => doc.glycemicIndex > 0).length;
console.log(`China food composition import complete. Imported ${docs.length} foods from ${sourceFiles.length} files; ${withGi} matched GI values.`);

await mongoose.disconnect();

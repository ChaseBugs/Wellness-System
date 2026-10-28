import "dotenv/config";
import { createHash } from "crypto";
import { copyFile, mkdir, readFile, rm } from "fs/promises";
import path from "path";
import { connectDatabase } from "../db.js";
import { dailyValueProfiles } from "../data/dailyValueProfiles.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { Food } from "../models/food.js";
import { translateChineseFoodName } from "../utils/chineseFoodKorean.js";

type MaterialRecord = {
  name: string;
  alias?: string;
  introduction?: string;
  season?: string;
  effect?: string;
  body_constitution?: string;
  small_class?: string;
  big_class?: string;
};

type NutrientRecord = Record<string, string>;

type ImportRecord = {
  name: string;
  material?: MaterialRecord;
  nutrient?: NutrientRecord;
};

const dataRoot = path.resolve(process.env.FOOD_MATERIAL_ROOT || path.join(process.cwd(), "..", "food data", "food-material-master"));
const materialJsonPath = path.join(dataRoot, "json", "food_material.json");
const nutrientJsonPath = path.join(dataRoot, "json", "nutrient.json");
const sourcePicDir = path.join(dataRoot, "pic");
const outputImageDir = path.join(process.cwd(), "public", "images", "food-material");

const categoryMap: Record<string, { category: string; group: string }> = {
  "蔬菜类": { category: "vegetable", group: "plant food" },
  "蔬菜类及制品": { category: "vegetable", group: "plant food" },
  "水果类": { category: "fruit", group: "plant food" },
  "水果类及制品": { category: "fruit", group: "plant food" },
  "水产品": { category: "seafood", group: "animal food" },
  "鱼虾蟹贝类": { category: "seafood", group: "animal food" },
  "畜肉类": { category: "meat", group: "animal food" },
  "畜肉类及制品": { category: "meat", group: "animal food" },
  "禽肉类及制品": { category: "poultry", group: "animal food" },
  "禽蛋类": { category: "egg and poultry", group: "animal food" },
  "蛋类及制品": { category: "egg", group: "animal food" },
  "米面豆乳类": { category: "grain and legume", group: "plant food" },
  "谷类及制品": { category: "grain", group: "plant food" },
  "薯类、淀粉及制品": { category: "starch and tuber", group: "plant food" },
  "干豆类及制品": { category: "legume", group: "plant food" },
  "菌藻类": { category: "mushroom and algae", group: "plant food" },
  "坚果、种子类": { category: "nuts and seeds", group: "plant food" },
  "菜品": { category: "prepared food", group: "mixed food" },
  "调味品": { category: "seasoning", group: "seasoning" },
  "小吃、甜饼": { category: "snack", group: "mixed food" },
  "速食食品": { category: "convenience food", group: "mixed food" },
  "饮料类": { category: "beverage", group: "beverage" },
  "含酒精饮料": { category: "alcoholic beverage", group: "beverage" },
  "糖、果脯和蜜饯、蜂蜜": { category: "sweetener and preserved fruit", group: "sweet food" },
  "糖、果脯、蜜饯": { category: "sweetener and preserved fruit", group: "sweet food" },
  "婴幼儿食品": { category: "infant food", group: "special diet food" }
};

const exactKoreanNames: Record<string, string> = {
  "白菜": "cabbage",
  "油菜": "rapeseed",
  "芹菜": "celery",
  "菠菜": "spinach",
  "生菜": "lettuce",
  "韭菜": "chive",
  "黄瓜": "cucumber",
  "西红柿": "tomato",
  "番茄": "tomato",
  "土豆": "potato",
  "马铃薯": "potato",
  "甘薯": "sweet potato",
  "红薯": "sweet potato",
  "小麦": "wheat",
  "大米": "rice",
  "米饭": "rice",
  "小米": "millet",
  "玉米": "corn",
  "黄豆": "soybean",
  "黑豆": "black beans",
  "绿豆": "green beans",
  "红豆": "Red beans",
  "豆腐": "tofu",
  "豆浆": "soy milk",
  "鸡蛋": "egg",
  "鸭蛋": "duck egg",
  "牛奶": "milk",
  "酸奶": "yogurt",
  "苹果": "apple",
  "香蕉": "banana",
  "梨": "ship",
  "葡萄": "grapes",
  "西瓜": "watermelon",
  "桃": "peach",
  "橙": "orange",
  "柠檬": "lemon",
  "草莓": "strawberry",
  "猪肉": "pork",
  "牛肉": "beef",
  "羊肉": "lamb",
  "鸡肉": "chicken",
  "鸭肉": "duck meat",
  "鱼": "fish",
  "虾": "shrimp",
  "蟹": "crab",
  "海带": "Kelp",
  "紫菜": "Kim",
  "木耳": "Wood ear mushroom",
  "香菇": "shiitake mushrooms",
  "平菇": "Oyster Mushroom",
  "金针菇": "Enoki Mushroom",
  "花生": "peanut",
  "核桃": "walnut",
  "杏仁": "almond",
  "芝麻": "sesame seeds",
  "蜂蜜": "honey",
  "白糖": "white sugar",
  "酱油": "soy sauce",
  "醋": "vinegar",
  "盐": "salt",
  "姜": "ginger",
  "大蒜": "garlic",
  "洋葱": "onion",
  "胡萝卜": "carrot",
  "南瓜": "pumpkin",
  "茄子": "eggplant",
  "辣椒": "pepper"
};

const replacementKoreanTerms: Array<[string, string]> = Object.entries({
  "马铃薯": "potato",
  "西红柿": "tomato",
  "胡萝卜": "carrot",
  "小麦粉": "flour",
  "面粉": "flour",
  "面条": "noodles",
  "挂面": "dried noodles",
  "馒头": "steamed buns",
  "米饭": "rice",
  "大米": "rice",
  "糯米": "glutinous rice",
  "黑米": "black rice",
  "玉米": "corn",
  "小米": "millet",
  "黄豆": "soybean",
  "黑豆": "black beans",
  "绿豆": "green beans",
  "红豆": "Red beans",
  "豆腐": "tofu",
  "豆浆": "soy milk",
  "牛奶": "milk",
  "酸奶": "yogurt",
  "奶粉": "powdered milk",
  "奶酪": "cheese",
  "鸡蛋": "egg",
  "鸭蛋": "duck egg",
  "鸡": "chicken",
  "鸭": "duck",
  "鹅": "goose",
  "猪肉": "pork",
  "猪": "pig",
  "牛肉": "beef",
  "牛": "cow",
  "羊肉": "lamb",
  "羊": "sheep",
  "鱼": "fish",
  "虾": "shrimp",
  "蟹": "crab",
  "贝": "clam",
  "海带": "Kelp",
  "紫菜": "Kim",
  "苹果": "apple",
  "香蕉": "banana",
  "葡萄": "grapes",
  "西瓜": "watermelon",
  "草莓": "strawberry",
  "柠檬": "lemon",
  "橙": "orange",
  "梨": "ship",
  "桃": "peach",
  "白菜": "cabbage",
  "菠菜": "spinach",
  "生菜": "lettuce",
  "韭菜": "chive",
  "芹菜": "celery",
  "黄瓜": "cucumber",
  "甘薯": "sweet potato",
  "红薯": "sweet potato",
  "土豆": "potato",
  "洋葱": "onion",
  "大蒜": "garlic",
  "辣椒": "pepper",
  "南瓜": "pumpkin",
  "茄子": "eggplant",
  "花生": "peanut",
  "核桃": "walnut",
  "杏仁": "almond",
  "芝麻": "sesame seeds",
  "蜂蜜": "honey",
  "白糖": "white sugar",
  "红糖": "brown sugar",
  "酱油": "soy sauce",
  "醋": "vinegar",
  "盐": "salt",
  "油": "oil",
  "干": "dry",
  "鲜": "fresh",
  "粉": "powder",
  "片": "side",
  "仁": "kernel",
  "皮": "shell",
  "汤": "Tang",
  "粥": "porridge",
  "饭": "rice",
  "肉": "meat"
}).sort((a, b) => b[0].length - a[0].length);

const zeroDailyValues = {
  calories: 0, protein: 0, carbs: 0, fat: 0, saturatedFat: 0, fiber: 0, sugar: 0, sodium: 0,
  cholesterol: 0, calcium: 0, iron: 0, magnesium: 0, potassium: 0, zinc: 0, vitaminA: 0,
  vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0,
  vitaminD: 0, vitaminE: 0, vitaminK: 0, folate: 0
};

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function num(value: string | undefined) {
  const parsed = Number(clean(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function hash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function slugify(value: string) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "food";
}

function baseName(value: string) {
  return clean(value).replace(/[（(［\[].*?[）)］\]]/g, "");
}

function koreanName(chineseName: string) {
  const direct = exactKoreanNames[chineseName] || exactKoreanNames[baseName(chineseName)];
  if (direct) return direct;

  let result = chineseName;
  for (const [source, target] of replacementKoreanTerms) {
    result = result.split(source).join(target);
  }

  result = result
    .replace(/[（(]/g, " (")
    .replace(/[）)]/g, ")")
    .replace(/，/g, ", ")
    .replace(/均值/g, "average")
    .replace(/标准/g, "standard")
    .replace(/特制/g, "special")
    .replace(/煮/g, "boiled")
    .replace(/蒸/g, "steamed")
    .replace(/烤/g, "baked")
    .replace(/炒/g, "roasted");

  return clean(result);
}

function containsCjk(value: string) {
  return /[\u4e00-\u9fff]/u.test(value);
}

const koreanCategoryNames: Record<string, string> = {
  vegetable: "vegetables",
  fruit: "fruit",
  seafood: "seafood",
  meat: "meat",
  poultry: "poultry",
  "egg and poultry": "poultry and eggs",
  egg: "eggs",
  "grain and legume": "Cereals and pulses",
  grain: "grains",
  "starch and tuber": "starches and bulbs",
  legume: "pulses",
  "mushroom and algae": "mushrooms and seaweed",
  "nuts and seeds": "nuts and seeds",
  "prepared food": "cooked food",
  seasoning: "seasoning",
  snack: "snack",
  "convenience food": "convenience food",
  beverage: "drink",
  "alcoholic beverage": "liquor",
  "sweetener and preserved fruit": "Sugars and pickled fruits",
  "infant food": "infant food",
  food: "food"
};

const koreanSubgroupNames: Record<string, string> = {
  "茎叶类": "leaf stems",
  "根茎类": "rhizomes",
  "瓜果类": "fruits and vegetables",
  "鲜豆类": "Fresh beans",
  "菌藻类": "mushroom seaweed",
  "仁果类": "causality",
  "核果类": "stone fruit",
  "浆果类": "berries",
  "柑橘类": "citrus fruits",
  "瓜类": "Cucurbits",
  "热带水果": "tropical fruit",
  "畜肉类": "livestock meat",
  "禽肉类": "poultry meat",
  "蛋类": "eggs",
  "鱼类": "fish",
  "虾类": "shrimp",
  "蟹类": "crab",
  "贝类": "shellfish",
  "谷类及制品": "Cereals and Products",
  "薯类、淀粉及制品": "paper starch products",
  "干豆类及制品": "Dried beans and products",
  "水果类及制品": "fruits and products",
  "坚果、种子类": "nuts and seeds"
};

function resolvedKoreanName(chineseName: string, classification: ReturnType<typeof classify>) {
  const translated = translateChineseFoodName(chineseName, classification.category);
  if (!containsCjk(translated)) return translated;

  const category = koreanCategoryNames[classification.category] || "food";
  const subgroup = koreanSubgroupNames[classification.foodSubgroup] || "";
  return clean(`${subgroup || category} ingredients ${hash(chineseName).slice(0, 6)}`);
}

function koreanCaution(value = "") {
  const original = clean(value);
  if (!original) return "";

  const direct: Record<string, string> = {
    "阳虚质体质应忌食或少食": "Those with a yielding constitution should avoid or consume less..",
    "一般人群均可食用": "Generally can be consumed by most people.",
    "平和质体质；一般人群均可食用。": "People with a peaceful constitution and the general public can consume it..",
    "麻疹后、疮疥、目疾者不宜食;": "After measles, People with skin swelling or eye disease are advised to avoid consumption.."
  };
  if (direct[original]) return direct[original];

  let result = original;
  const replacements: Array<[RegExp, string]> = [
    [/一般人群/g, "general public"],
    [/均可食用/g, "Can be consumed"],
    [/不宜食用|不宜食|忌食/g, "Be careful about intake"],
    [/少食/g, "eat less"],
    [/慎食/g, "Consume with caution"],
    [/过敏/g, "allergy"],
    [/体质/g, "constitution"],
    [/阳虚质/g, "concession"],
    [/阴虚质/g, "Um huh"],
    [/气虚质/g, "Giheo"],
    [/痰湿质/g, "dampness"],
    [/湿热质/g, "moist heat"],
    [/血瘀质/g, "blood fish"],
    [/特禀质/g, "special constitution"],
    [/孕妇/g, "pregnant woman"],
    [/儿童/g, "children"],
    [/老人/g, "old man"],
    [/糖尿病/g, "diabetes"],
    [/高血压/g, "high blood pressure"],
    [/痛风/g, "gout"],
    [/肾病/g, "kidney disease"],
    [/腹泻/g, "diarrhea"],
    [/便秘/g, "constipation"],
    [/胃/g, "above"],
    [/肝/g, "Liver"],
    [/肾/g, "height"],
    [/应/g, ""],
    [/或/g, "or"],
    [/者/g, "person"],
    [/；|;/g, "; "],
    [/，|、/g, ", "],
    [/。/g, "."]
  ];
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  result = clean(result);
  if (!result || containsCjk(result)) {
    return `Caution Translation review required ${hash(original).slice(0, 6)}`;
  }
  return result;
}

function splitList(value = "") {
  return clean(value)
    .split(/[、,，;；]/)
    .map((item) => clean(item))
    .filter(Boolean)
    .slice(0, 20);
}

function classify(material?: MaterialRecord, nutrient?: NutrientRecord) {
  const sourceCategory = clean(material?.big_class || nutrient?.["食物类别"] || "food");
  const mapped = categoryMap[sourceCategory] || { category: sourceCategory || "food", group: "food" };
  return {
    category: mapped.category,
    foodGroup: mapped.group,
    foodSubgroup: clean(material?.small_class || nutrient?.["食物类别"] || sourceCategory || "general"),
    sourceCategory
  };
}

function inferAllergens(name: string, category: string) {
  const text = `${name} ${category}`;
  const values: string[] = [];
  if (/牛奶|酸奶|奶粉|奶酪|乳/.test(text)) values.push("milk");
  if (/鸡蛋|鸭蛋|蛋/.test(text)) values.push("egg");
  if (/鱼|三文鱼|鳕|鲑|鲔|带鱼|鲫|鲤/.test(text)) values.push("fish");
  if (/虾|蟹|龙虾|螃蟹/.test(text)) values.push("crustacean shellfish");
  if (/贝|蛤|蛏|牡蛎|扇贝|鲍/.test(text)) values.push("mollusk shellfish");
  if (/花生/.test(text)) values.push("peanut");
  if (/核桃|杏仁|腰果|榛子|松子|开心果|坚果/.test(text)) values.push("tree nuts");
  if (/小麦|面粉|面条|馒头|挂面|麦/.test(text)) values.push("wheat");
  if (/黄豆|黑豆|豆腐|豆浆|豆乳|大豆/.test(text)) values.push("soy");
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

function pct(value: number, dailyValue: number) {
  return Number((((value || 0) / dailyValue) * 100).toFixed(1));
}

function percentFor(values: typeof dailyValueProfiles[number]["values"], food: typeof zeroDailyValues) {
  return Object.fromEntries(Object.entries(food).map(([key, value]) => [key, pct(value, values[key as keyof typeof values] || 1)]));
}

async function loadJson<T>(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function copyImageIfExists(name: string, picMap: Map<string, string>) {
  const source = picMap.get(`${name}.jpg`);
  if (!source) return "";

  await mkdir(outputImageDir, { recursive: true });
  const fileName = `material-${hash(name)}-${slugify(koreanName(name))}.jpg`;
  const target = path.join(outputImageDir, fileName);
  await copyFile(source, target);
  return `/images/food-material/${fileName}`;
}

function buildFood(record: ImportRecord, imageUrl: string) {
  const { material, nutrient } = record;
  const classification = classify(material, nutrient);
  const koName = resolvedKoreanName(record.name, classification);
  const chineseCaution = clean(material?.body_constitution || "");
  const calories = num(nutrient?.["能量（千卡）"]);
  const protein = num(nutrient?.["蛋白质（克）"]);
  const fat = num(nutrient?.["脂肪（克）"]);
  const carbs = num(nutrient?.["碳水化合物（克）"]);
  const fiber = num(nutrient?.["膳食纤维（克）"]);
  const sodium = num(nutrient?.["钠（毫克）"]);
  const saturatedFat = num(nutrient?.["饱和脂肪酸（克）"]);
  const monoFat = num(nutrient?.["单不饱和脂肪酸（克）"]);
  const polyFat = num(nutrient?.["多不饱和脂肪酸（克）"]);
  const cholesterol = num(nutrient?.["胆固醇（毫克）"]);
  const sugar = 0;
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
    calcium: num(nutrient?.["钙（毫克）"]),
    iron: num(nutrient?.["铁（毫克）"]),
    magnesium: num(nutrient?.["镁（毫克）"]),
    potassium: num(nutrient?.["钾（毫克）"]),
    zinc: num(nutrient?.["锌（毫克）"]),
    vitaminA: num(nutrient?.["维生素A（微克RE）"]),
    vitaminB1: num(nutrient?.["硫胺素（毫克）"]),
    vitaminB2: num(nutrient?.["核黄素（毫克）"]),
    vitaminB3: num(nutrient?.["烟酸（毫克）"]),
    vitaminB6: num(nutrient?.["维生素B6（毫克）"]),
    vitaminB12: num(nutrient?.["维生素B12（微克）"]),
    vitaminC: num(nutrient?.["维生素C（毫克）"]),
    vitaminE: num(nutrient?.["维生素E（毫克）"]),
    folate: num(nutrient?.["叶酸（微克）"])
  };
  const allergenList = inferAllergens(record.name, classification.sourceCategory);

  return {
    koreanName: koName,
    chineseName: record.name,
    dataType: "food-material-master",
    category: classification.category,
    foodGroup: classification.foodGroup,
    foodSubgroup: classification.foodSubgroup,
    servingSize: "100 g edible portion",
    calories,
    macros: { protein, fat, carbs, fiber },
    saturatedFat,
    transFat: 0,
    unsaturatedFat: Number((monoFat + polyFat).toFixed(2)),
    omega3: 0,
    omega6: 0,
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
      vitaminD: 0,
      vitaminE: dvBase.vitaminE,
      vitaminK: 0,
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
    cautionGroups: splitList(material?.body_constitution),
    cautions: chineseCaution,
    koreanCautions: koreanCaution(chineseCaution),
    benefits: clean([material?.introduction, material?.effect].filter(Boolean).join("\n\n")),
    allergens: allergenList,
    ingredients: [record.name],
    additives: [],
    dailyValuePercent: percentFor(dailyValueProfiles[0].values, dvBase),
    dailyValuePercentByProfile: dailyValueProfiles.map((profile) => ({
      profileKey: profile.profileKey,
      label: profile.label,
      purpose: profile.purpose,
      values: percentFor(profile.values, dvBase)
    })),
    dietUseCases: dietUseCases(calories, protein, fat, carbs, fiber, sugar, sodium),
    dietUseNote: "Per-100g values imported from food-material-master. Korean names are generated from a local Chinese-to-Korean food glossary and should be admin-reviewed for uncommon items.",
    dataSource: "food-material-master",
    sourceNote: JSON.stringify({
      originalChineseName: record.name,
      alias: material?.alias || "",
      season: material?.season || "",
      sourceCategory: classification.sourceCategory,
      ediblePortionPercent: nutrient?.["食部（%）"] || "",
      waterG: nutrient?.["水分（克）"] || "",
      ashG: nutrient?.["灰分（克）"] || "",
      phosphorusMg: nutrient?.["磷（毫克）"] || "",
      seleniumUg: nutrient?.["硒（微克）"] || "",
      copperMg: nutrient?.["铜（毫克）"] || "",
      iodineUg: nutrient?.["碘（微克）"] || "",
      manganeseMg: nutrient?.["锰（毫克）"] || "",
      caroteneUg: nutrient?.["胡萝卜素（微克）"] || "",
      monoUnsaturatedFatG: monoFat,
      polyUnsaturatedFatG: polyFat
    }),
    tags: [classification.category, classification.foodSubgroup, classification.sourceCategory, ...(material?.season ? splitList(material.season) : [])].filter(Boolean),
    imageUrl,
    imageSource: imageUrl ? "food-material-master local pic" : "",
    imageSourceUrl: imageUrl,
    imageLicense: "food-material-master repository asset",
    imageStatus: imageUrl ? "downloaded" : "missing",
    doctor_verified: false
  };
}

await connectDatabase();

const materials = await loadJson<MaterialRecord[]>(materialJsonPath);
const nutrients = await loadJson<NutrientRecord[]>(nutrientJsonPath);
const picFiles = await import("fs").then((fs) => fs.readdirSync(sourcePicDir));
const picMap = new Map(picFiles.filter((file) => file.toLowerCase().endsWith(".jpg")).map((file) => [file, path.join(sourcePicDir, file)]));
const records = new Map<string, ImportRecord>();

for (const material of materials) {
  records.set(material.name, { name: material.name, material });
}

for (const nutrient of nutrients) {
  const name = clean(nutrient["食物名称"]);
  if (!name) continue;
  const existing = records.get(name);
  if (existing?.nutrient) continue;
  records.set(name, { name, material: existing?.material, nutrient });
}

await rm(outputImageDir, { recursive: true, force: true });
await mkdir(outputImageDir, { recursive: true });

for (const profile of dailyValueProfiles) {
  await DailyValueProfile.updateOne({ profileKey: profile.profileKey }, { $set: profile }, { upsert: true });
}

const deleted = await Food.deleteMany({});
console.log(`Deleted ${deleted.deletedCount} existing foods.`);

const docs = [];
let imageCount = 0;
for (const record of records.values()) {
  const imageUrl = await copyImageIfExists(record.name, picMap);
  if (imageUrl) imageCount += 1;
  docs.push(buildFood(record, imageUrl));
}

if (docs.length) {
  await Food.insertMany(docs, { ordered: false });
}

console.log(`Imported ${docs.length} food-material-master foods.`);
console.log(`Copied ${imageCount} local food images to ${outputImageDir}.`);
process.exit(0);

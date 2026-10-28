import { readFileSync } from "fs";
import path from "path";

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function stripVariant(value: string) {
  return clean(value).replace(/[（(［[].*?[）)］\]]/g, "");
}

const exactNames: Record<string, string> = {
  白菜: "cabbage",
  油菜: "rapeseed",
  芹菜: "celery",
  菠菜: "spinach",
  韭菜: "chive",
  生菜: "lettuce",
  黄瓜: "cucumber",
  西红柿: "Tomato",
  番茄: "Tomato",
  土豆: "potato",
  马铃薯: "potato",
  甘薯: "sweet potato",
  红薯: "sweet potato",
  大米: "rice",
  米饭: "rice",
  小米: "Joe",
  玉米: "corn",
  小麦: "wheat",
  黄豆: "soybean",
  黑豆: "black beans",
  绿豆: "green beans",
  红豆: "Red beans",
  豆腐: "tofu",
  豆浆: "soy milk",
  鸡蛋: "chicken egg",
  鸭蛋: "duck egg",
  牛奶: "cow milk",
  酸奶: "yogurt",
  苹果: "apple",
  香蕉: "banana",
  梨: "ship",
  葡萄: "grapes",
  西瓜: "watermelon",
  桃: "peach",
  橙: "orange",
  柠檬: "lemon",
  草莓: "strawberry",
  猪肉: "pork",
  牛肉: "beef",
  羊肉: "lamb",
  鸡肉: "chicken",
  鸭肉: "duck meat",
  鱼: "fish",
  虾: "shrimp",
  蟹: "crab",
  海带: "Kelp",
  紫菜: "Kim",
  木耳: "Wood ear mushroom",
  香菇: "shiitake mushrooms",
  平菇: "Oyster Mushroom",
  金针菇: "Enoki Mushroom",
  花生: "Rock Hwaseong",
  核桃: "walnut",
  杏仁: "one way",
  芝麻: "sesame seeds",
  蜂蜜: "honey",
  白糖: "white sugar",
  红糖: "brown sugar",
  酱油: "soy sauce",
  醋: "vinegar",
  盐: "salt",
  姜: "ginger",
  大蒜: "garlic",
  洋葱: "onion",
  胡萝卜: "blush",
  南瓜: "pumpkin",
  茄子: "eggplant",
  辣椒: "pepper"
};

let referenceNames: Record<string, string> | null = null;

function loadReferenceNames() {
  if (referenceNames) return referenceNames;

  const referencePath = path.resolve(process.env.FOOD_TRANSLATION_REFERENCE || path.join(process.cwd(), "..", "reference.md"));
  const parsed: Record<string, string> = {};

  try {
    const content = readFileSync(referencePath, "utf8");

    // Parse JSON-style "Chinese": "Korean" entries
    const jsonPattern = /"([^"]+)"\s*:\s*"([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = jsonPattern.exec(content))) {
      parsed[clean(match[1])] = clean(match[2]);
    }

    // Parse arrow-style "Chinese → Korean" entries (comments after ( stripped)
    // Handles: 白菜 → cabbage, 芹菜 → celery (comment...), 山楂脯 → mountain sandpaper
    const arrowPattern = /^([^\n→"]+?)\s*→\s*([^\n(（]+)/gm;
    while ((match = arrowPattern.exec(content))) {
      const chinese = clean(match[1]);
      const korean = clean(match[2].split(/[（(]/)[0]);
      if (chinese && korean && /[一-鿿]/.test(chinese)) {
        // Don't overwrite a higher-quality JSON entry
        if (!parsed[chinese]) parsed[chinese] = korean;
      }
    }
  } catch (error) {
    console.warn(`Could not load food translation reference at ${referencePath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  referenceNames = parsed;
  return referenceNames;
}

const phraseMap: Array<[string, string]> = Object.entries({
  西红柿: "Tomato",
  番茄: "Tomato",
  马铃薯: "potato",
  胡萝卜: "blush",
  小麦粉: "flour",
  面粉: "flour",
  面条: "noodles",
  挂面: "dried noodles",
  馒头: "steamed buns",
  包子: "dumplings",
  饺子: "gyoza",
  米饭: "rice",
  大米: "rice",
  糯米: "glutinous rice",
  黑米: "black rice",
  玉米: "corn",
  小米: "Joe",
  燕麦: "oats",
  荞麦: "Buckwheat",
  高粱: "sorghum",
  黄豆: "soybean",
  黑豆: "black beans",
  绿豆: "green beans",
  红豆: "Red beans",
  豆腐: "tofu",
  豆浆: "soy milk",
  豆芽: "bean sprouts",
  牛奶: "cow milk",
  酸奶: "yogurt",
  奶粉: "powdered milk",
  奶酪: "Milk products",
  鸡蛋: "chicken egg",
  鸭蛋: "duck egg",
  鸡肉: "chicken",
  鸭肉: "duck meat",
  鹅肉: "goose meat",
  猪肉: "pork",
  牛肉: "beef",
  羊肉: "lamb",
  鱼肉: "fish meat",
  海带: "Kelp",
  紫菜: "Kim",
  苹果: "apple",
  香蕉: "banana",
  葡萄: "grapes",
  西瓜: "watermelon",
  草莓: "strawberry",
  柠檬: "lemon",
  橙子: "orange",
  橘子: "Tangerine",
  梨: "ship",
  桃: "peach",
  杏肉: "Apricot fruit flesh",
  杏干: "dried apricots",
  西梅: "plum",
  李子: "plums",
  枣: "jujube",
  白菜: "cabbage",
  菠菜: "spinach",
  生菜: "lettuce",
  韭菜: "chive",
  芹菜: "celery",
  黄瓜: "cucumber",
  甘薯: "sweet potato",
  红薯: "sweet potato",
  土豆: "potato",
  洋葱: "onion",
  大蒜: "garlic",
  辣椒: "pepper",
  南瓜: "pumpkin",
  茄子: "eggplant",
  花生: "Rock Hwaseong",
  核桃: "walnut",
  杏仁: "one way",
  芝麻: "sesame seeds",
  蜂蜜: "honey",
  白糖: "white sugar",
  红糖: "brown sugar",
  酱油: "soy sauce",
  食醋: "vinegar",
  醋: "vinegar",
  食盐: "salt",
  九制: "relief",
  蜜饯: "Pickled honey",
  果脯: "Pickled fruit",
  果干: "dried fruit",
  脱水: "dry",
  速冻: "Langdon",
  罐头: "drowsy",
  鲜: "fresh",
  干: "dry",
  熟: "cooked",
  生: "raw",
  煮: "boiled",
  蒸: "steamed",
  烤: "baked",
  炒: "roasted",
  炸: "fried",
  卤: "stew",
  酱: "chapter",
  咸: "salting",
  甜: "sweet",
  酸: "god",
  辣: "spicy",
  粉: "powder",
  片: "side",
  仁: "kernel",
  皮: "shell",
  汤: "Tang",
  粥: "porridge",
  饭: "rice",
  肉: "pulp",
  油: "oil"
}).sort((a, b) => b[0].length - a[0].length);

const charMap: Record<string, string> = {
  白: "white", 菜: "vegetables", 油: "oil", 芹: "celery", 菠: "spinach", 韭: "chive", 生: "raw", 黄: "yellow",
  瓜: "Park", 西: "western", 红: "red", 柿: "persimmon", 番: "Tomato", 茄: "eggplant", 土: "soil", 豆: "beans",
  甘: "sweet", 薯: "documents", 米: "rice", 饭: "rice", 小: "small", 玉: "corn", 麦: "wheat", 黑: "black",
  绿: "green", 腐: "tofu", 浆: "juice", 鸡: "chicken", 鸭: "duck", 蛋: "Al", 牛: "cow", 奶: "milk",
  酸: "god", 苹: "apple", 果: "fruit", 香: "incense", 蕉: "banana", 梨: "ship", 葡: "grapes", 萄: "grapes",
  桃: "peach", 橙: "orange", 柠: "lemon", 檬: "lemon", 草: "grass", 莓: "strawberry", 猪: "pig",
  羊: "sheep", 肉: "pulp", 鱼: "fish", 虾: "shrimp", 蟹: "crab", 海: "sea", 紫: "purple",
  木: "sore throat", 菇: "mushroom", 平: "oyster", 金: "gold", 针: "spit", 花: "flower", 核: "nuclear",
  杏: "apricot", 芝: "Sesame", 麻: "sesame seeds", 蜂: "punishment", 蜜: "honey", 糖: "sugar", 酱: "chapter", 醋: "vinegar",
  盐: "salt", 姜: "ginger", 蒜: "garlic", 洋: "sheep", 葱: "green onion", 胡: "ho", 萝: "Radish", 卜: "fortune",
  南: "M", 辣: "spicy", 椒: "pepper", 清: "Cheong", 凉: "quantity", 九: "phrase", 制: "processing", 梅: "plum",
  李: "plums", 子: "Now", 枣: "jujube", 脯: "pickled", 饯: "pickled", 仁: "kernel", 干: "dry",
  鲜: "fresh", 熟: "cooked", 炒: "roasted", 烤: "baked", 蒸: "steamed", 煮: "boiled", 炸: "fried",
  卤: "stew", 咸: "salty", 甜: "sweet", 粉: "powder", 片: "side", 皮: "shell", 汤: "Tang", 粥: "porridge",
  藻: "seaweed", 贝: "clam", 蚌: "clam", 螺: "conch", 鳝: "eel", 鳗: "eel", 鳕: "Daegu",
  鲫: "crucian carp", 鲤: "carp", 鳜: "Mandarin fish", 鲢: "salmon", 鳙: "fish", 带: "Cutlassfish", 鳖: "grow up",
  鹅: "goose", 鹌: "quail", 鹑: "quail", 乳: "You", 酪: "Milk products", 燕: "oats", 荞: "Buckwheat",
  粱: "sorghum", 薏: "coix", 莲: "kite", 藕: "lotus root", 竹: "bamboo shoots", 笋: "bamboo shoots", 蘑: "mushroom",
  银: "silver", 耳: "Wood ear mushroom", 葵: "sunflower", 瓣: "piece", 根: "roots", 茎: "stem", 叶: "leaves"
};

const categoryFallbacks: Record<string, string> = {
  vegetable: "Vegetables",
  fruit: "fruit",
  seafood: "sea products",
  meat: "meat",
  poultry: "poultry",
  egg: "eggs",
  "egg and poultry": "poultry and eggs",
  grain: "grains",
  "grain and legume": "Cereals and pulses",
  "starch and tuber": "Documents and all classifications",
  legume: "pulses",
  "mushroom and algae": "mushrooms and seaweed",
  "nuts and seeds": "nuts and seeds",
  "prepared food": "cuisine food",
  seasoning: "seasoning",
  snack: "military food",
  beverage: "drink",
  "alcoholic beverage": "alcohol",
  "sweetener and preserved fruit": "Sugars and pickled fruits",
  "infant food": "infant food"
};

function hasCjk(value: string) {
  return /[㐀-鿿]/u.test(value);
}

function cleanup(value: string) {
  return clean(
    value
      .replace(/[，、]/g, " ")
      .replace(/[（）]/g, " ")
      .replace(/[()]/g, " ")
      .replace(/[;；:：]/g, " ")
      .replace(/\s+/g, " ")
  );
}

const dprkTermMap: Array<[string, string]> = Object.entries({
  cooking: "Ryori",
  cooking: "Ryori",
  ingredients: "Ryorigam",
  material: "Ryorigam",
  vegetables: "Vegetables",
  vegetables: "Vegetables",
  egg: "chicken egg",
  egg: "chicken egg",
  cabbage: "street cabbage",
  cauliflower: "Flower side cabbage",
  broccoli: "Blue-flowered cabbage",
  tomato: "Tomato",
  cherry tomatoes: "Bell cutting board",
  cherry tomatoes: "Bell cutting board",
  celery: "celery",
  paprika: "sweet pepper",
  green pepper: "sweet pepper",
  sweet potato: "sweet potato",
  zucchini pumpkin: "Western pumpkin",
  Zucchini: "young pumpkin",
  orange: "orange",
  yogurt: "yogurt",
  yogurt: "yogurt",
  cheese: "Milk products",
  butter: "suck",
  margarine: "margarine",
  milk: "cow milk",
  powdered milk: "powdered milk",
  beef: "beef",
  pork: "pork",
  chicken: "chicken",
  duck meat: "duck meat",
  seafood: "sea products",
  seaweed: "marine life",
  Kelp: "Kelp",
  Kim: "Kim",
  canned food: "drowsy",
  frozen: "Langdon",
  refrigerated: "Langjang",
  noodles: "noodles",
  dumplings: "dumplings",
  snack: "military food",
  liquor: "alcohol",
  juice: "fruit sweet water",
  juice: "fruit sweet water",
  source: "seasoned juice",
  dressing: "seasoned juice",
  oil: "oil",
  salad: "Langchae",
  almond: "one way",
  cashew nuts: "Cashew nuts",
  peanut: "Rock Hwaseong",
  corn: "corn",
  carrot: "blush",
  Mucheong: "Radish leaves",
  chives: "green onion",
  green onion: "green onion",
  tuna: "tuna",
  mackerel: "mackerel",
  salmon: "salmon",
  pulp: "fruit flesh",
  food: "groceries"
}).sort((a, b) => b[0].length - a[0].length);

export function normalizeDprkKoreanName(value = "") {
  let result = clean(value);
  for (const [source, target] of dprkTermMap) {
    result = result.split(source).join(target);
  }
  return clean(result);
}

export function translateChineseFoodName(chineseName = "", category = "food") {
  const original = clean(chineseName);
  if (!original) return categoryFallbacks[category] || "food";

  const base = stripVariant(original);
  const reference = loadReferenceNames();
  const direct = reference[original] || reference[base] || exactNames[original] || exactNames[base];
  if (direct) return normalizeDprkKoreanName(direct);

  let translated = original;
  const referencePhrases = Object.entries(reference).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of referencePhrases) {
    translated = translated.split(source).join(` ${target} `);
  }
  for (const [source, target] of phraseMap) {
    translated = translated.split(source).join(` ${target} `);
  }

  if (hasCjk(translated)) {
    translated = Array.from(translated)
      .map((char) => {
        if (/[㐀-鿿]/u.test(char)) return charMap[char] ? ` ${charMap[char]} ` : " ";
        return char;
      })
      .join("");
  }

  const result = cleanup(translated);
  if (result) return normalizeDprkKoreanName(result);

  return normalizeDprkKoreanName(`${categoryFallbacks[category] || "food"} Ryorigam`);
}

export function referenceTranslationCount() {
  return Object.keys(loadReferenceNames()).length;
}

export function hasReferenceTranslation(chineseName = "") {
  const original = clean(chineseName);
  const base = stripVariant(original);
  const reference = loadReferenceNames();
  return Boolean(reference[original] || reference[base]);
}

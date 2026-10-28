/**
 * verify-food-data.ts  —  Run: npx tsx src/verify-food-data.ts
 *
 * Checks:
 *  1. Source JSON quality (zero-cal records, macro mismatches)
 *  2. Translation quality in MongoDB (Korean names still containing CJK)
 *  3. Source vs DB coverage
 */
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { connectDatabase } from "../db.js";
import { Food } from "../models/food.js";

const dataRoot = path.resolve(
  process.env.FOOD_MATERIAL_ROOT ||
  path.join(process.cwd(), "..", "food data", "food-material-master")
);

type NutrientRecord = Record<string, string>;

function num(v: string | undefined) {
  const n = Number((v || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const R = "\x1b[31m", Y = "\x1b[33m", G = "\x1b[32m", B = "\x1b[1m", Z = "\x1b[0m";
const ok   = (s: string) => `${G}✓${Z} ${s}`;
const warn = (s: string) => `${Y}⚠${Z} ${s}`;
const fail = (s: string) => `${R}✗${Z} ${s}`;
const hdr  = (s: string) => `\n${B}── ${s} ──${Z}`;

await connectDatabase();

const materials = JSON.parse(readFileSync(path.join(dataRoot, "json", "food_material.json"), "utf8")) as Record<string,string>[];
const nutrients = JSON.parse(readFileSync(path.join(dataRoot, "json", "nutrient.json"), "utf8")) as NutrientRecord[];

const matNames = new Set(materials.map(m => (m.name || "").trim()).filter(Boolean));
const nutNames = new Map<string, NutrientRecord>(
  nutrients
    .map(n => [(n["食物名称"] || "").trim(), n] as [string, NutrientRecord])
    .filter(([k]) => k)
);
const allSourceNames = new Set([...matNames, ...nutNames.keys()]);

// ── 1. Source JSON summary ────────────────────────────────────────────────────
console.log(hdr("Source JSON"));
console.log(`  food_material.json : ${materials.length} records`);
console.log(`  nutrient.json      : ${nutrients.length} records`);
console.log(`  Unique names       : ${allSourceNames.size}`);
console.log(`  Have both sources  : ${[...matNames].filter(n => nutNames.has(n)).length}`);
console.log(`  Material only      : ${[...matNames].filter(n => !nutNames.has(n)).length}`);
console.log(`  Nutrient only      : ${[...nutNames.keys()].filter(n => !matNames.has(n)).length}`);

// ── 2. Zero/empty calorie records ────────────────────────────────────────────
console.log(hdr("Zero / Missing Calories in source"));
const zeroCal: string[] = [];
for (const [name, n] of nutNames) {
  const cal = (n["能量（千卡）"] || "").trim();
  if (!cal || cal === "0") zeroCal.push(name);
}
if (zeroCal.length === 0) {
  console.log(ok("All records have calorie data"));
} else {
  console.log(warn(`${zeroCal.length} records with missing/zero calories (herbs, sub-components):`));
  zeroCal.forEach(n => console.log(`    ${Y}${n}${Z}`));
}

// ── 3. Macro/calorie mismatches ───────────────────────────────────────────────
console.log(hdr("Macro vs Calorie Consistency (>50% deviation)"));
const realMismatch: { name: string; cal: number; est: number }[] = [];
for (const [name, n] of nutNames) {
  const cal = num(n["能量（千卡）"]);
  const prot = num(n["蛋白质（克）"]);
  const fat  = num(n["脂肪（克）"]);
  const carb = num(n["碳水化合物（克）"]);
  const fiber = num(n["膳食纤维（克）"]);
  if (cal <= 0) continue;
  const est = prot * 4 + fat * 9 + carb * 4;
  if (est <= 0) continue;
  if (Math.abs(est - cal) / cal <= 0.5) continue;
  // Expected causes: fiber subtraction, alcohol calories
  const fiberAdj = prot * 4 + fat * 9 + Math.max(0, carb - fiber) * 4;
  const isAlcohol = (n["食物类别"] || "").includes("酒");
  const fiberFixed = Math.abs(fiberAdj - cal) / cal < 0.25;
  if (!isAlcohol && !fiberFixed) realMismatch.push({ name, cal, est: Math.round(est) });
}
if (realMismatch.length === 0) {
  console.log(ok("No unexplained macro mismatches (fiber/alcohol account for all deviations)"));
} else {
  console.log(fail(`${realMismatch.length} unexplained macro mismatches — review these:`));
  realMismatch.forEach(m => console.log(`    ${m.name}: stated=${m.cal} kcal, macro-est=${m.est} kcal`));
}

// ── 4. MongoDB checks ─────────────────────────────────────────────────────────
console.log(hdr("MongoDB Foods Collection"));
const totalDb = await Food.countDocuments();
console.log(`  Total foods in DB  : ${totalDb}`);

if (totalDb === 0) {
  console.log(warn("DB is empty — run: npx tsx src/import-food-material.ts"));
  process.exit(0);
}

const CJK = /[一-鿿㐀-䶿]/;
const allFoods = await Food.find(
  { dataSource: "food-material-master" },
  { koreanName: 1, chineseName: 1, calories: 1 }
).lean();

const badTranslations = allFoods.filter(f => CJK.test(f.koreanName || ""));
if (badTranslations.length === 0) {
  console.log(ok("All Korean names are CJK-free"));
} else {
  console.log(fail(`${badTranslations.length} foods with CJK chars in koreanName (incomplete translation):`));
  badTranslations.slice(0, 25).forEach(f =>
    console.log(`    ${R}${f.chineseName}${Z}  →  ${f.koreanName}`)
  );
  if (badTranslations.length > 25) console.log(`    ... and ${badTranslations.length - 25} more`);
}

const dbZeroCal = allFoods.filter(f => f.calories === 0);
if (dbZeroCal.length > 0) {
  console.log(warn(`${dbZeroCal.length} foods in DB with 0 calories:`));
  dbZeroCal.slice(0, 10).forEach(f => console.log(`    ${f.chineseName}`));
}

const dbChinese = new Set(allFoods.map(f => (f.chineseName || "").trim()).filter(Boolean));
const notInDb = [...allSourceNames].filter(n => !dbChinese.has(n));
if (notInDb.length === 0) {
  console.log(ok("All source foods are present in DB"));
} else {
  console.log(warn(`${notInDb.length} source foods not found in DB (may need re-import):`));
  notInDb.slice(0, 15).forEach(n => console.log(`    ${Y}${n}${Z}`));
}

// ── 5. Summary ────────────────────────────────────────────────────────────────
console.log(hdr("Summary"));
console.log(`  Source records           : ${allSourceNames.size}`);
console.log(`  DB records               : ${totalDb}`);
const badC = badTranslations.length;
const zeroC = zeroCal.length;
const realC = realMismatch.length;
const notC  = notInDb.length;
console.log(`  Bad Korean translations  : ${badC  > 0 ? R : G}${badC}${Z}`);
console.log(`  Zero-cal source records  : ${zeroC > 0 ? Y : G}${zeroC}${Z}  (herbs/sub-components)`);
console.log(`  Unexplained macro issues : ${realC > 0 ? R : G}${realC}${Z}`);
console.log(`  Not imported to DB       : ${notC  > 0 ? Y : G}${notC}${Z}`);

if (badC > 0) {
  console.log(`\n${Y}TIP: After fixing translations, re-run the importer:${Z}`);
  console.log(`     npx tsx src/import-food-material.ts`);
}

process.exit(0);

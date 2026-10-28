import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { Food } from "../models/food.js";

type NutrientRow = Record<string, string>;
type MaterialRow = Record<string, string>;

const NUTRIENT_PATH = path.resolve(process.cwd(), "..", "food data", "food-material-master", "json", "nutrient.json");
const MATERIAL_PATH = path.resolve(process.cwd(), "..", "food data", "food-material-master", "json", "food_material.json");

// nutrient.json key → schema dotted-path
const NUTRIENT_FIELD_MAP: { src: string; path: string; label: string }[] = [
  { src: "能量（千卡）",     path: "calories",            label: "calories" },
  { src: "蛋白质（克）",     path: "macros.protein",      label: "protein" },
  { src: "脂肪（克）",       path: "macros.fat",          label: "fat" },
  { src: "碳水化合物（克）", path: "macros.carbs",        label: "carbs" },
  { src: "膳食纤维（克）",   path: "macros.fiber",        label: "fiber" },
  { src: "维生素A（微克RE）", path: "vitamins.vitaminA",   label: "vitA" },
  { src: "硫胺素（毫克）",   path: "vitamins.vitaminB1",  label: "vitB1" },
  { src: "核黄素（毫克）",   path: "vitamins.vitaminB2",  label: "vitB2" },
  { src: "烟酸（毫克）",     path: "vitamins.vitaminB3",  label: "vitB3" },
  { src: "维生素B6（毫克）", path: "vitamins.vitaminB6",  label: "vitB6" },
  { src: "维生素B12（微克）", path: "vitamins.vitaminB12", label: "vitB12" },
  { src: "维生素C（毫克）",  path: "vitamins.vitaminC",   label: "vitC" },
  { src: "维生素E（毫克）",  path: "vitamins.vitaminE",   label: "vitE" },
  { src: "叶酸（微克）",     path: "vitamins.folate",     label: "folate" },
  { src: "钙（毫克）",       path: "minerals.calcium",    label: "calcium" },
  { src: "铁（毫克）",       path: "minerals.iron",       label: "iron" },
  { src: "镁（毫克）",       path: "minerals.magnesium",  label: "magnesium" },
  { src: "钾（毫克）",       path: "minerals.potassium",  label: "potassium" },
  { src: "钠（毫克）",       path: "minerals.sodium",     label: "sodium" },
  { src: "锌（毫克）",       path: "minerals.zinc",       label: "zinc" }
];

function getDotted(obj: unknown, dotted: string): unknown {
  return dotted.split(".").reduce<unknown>((cur, k) => {
    if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
      return (cur as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function valuesMatch(src: number, db: number): boolean {
  // tolerance: 0.5% relative, or 0.05 absolute (whichever is larger)
  const diff = Math.abs(src - db);
  if (diff <= 0.05) return true;
  const rel = src === 0 ? Infinity : diff / Math.abs(src);
  return rel <= 0.005;
}

async function loadJsonArray<T>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

async function main() {
  console.log("Loading source files...");
  const [nutrientRows, materialRows] = await Promise.all([
    loadJsonArray<NutrientRow>(NUTRIENT_PATH),
    loadJsonArray<MaterialRow>(MATERIAL_PATH)
  ]);
  console.log(`[nutrient.json] ${nutrientRows.length} rows`);
  console.log(`[food_material.json] ${materialRows.length} rows`);

  // Build lookups by Chinese name (food name = key)
  const nutrientByName = new Map<string, NutrientRow>();
  for (const row of nutrientRows) {
    const name = String(row["食物名称"] ?? "").trim();
    if (!name) continue;
    if (!nutrientByName.has(name)) nutrientByName.set(name, row);
  }
  const materialByName = new Map<string, MaterialRow>();
  for (const row of materialRows) {
    const name = String(row["name"] ?? "").trim();
    if (!name) continue;
    if (!materialByName.has(name)) materialByName.set(name, row);
  }
  console.log(`[lookups] ${nutrientByName.size} unique Chinese names in nutrient, ${materialByName.size} in material`);

  await connectDatabase();
  const totalWithChinese = await Food.countDocuments({ chineseName: { $exists: true, $ne: "" } });
  console.log(`[db] ${totalWithChinese} foods have a chineseName`);
  console.log("");

  let scanned = 0;
  let foundInNutrient = 0;
  let foundInMaterial = 0;
  let foundInBoth = 0;
  let foundInNeither = 0;

  // Field-level stats
  const fieldStats = new Map<string, { compared: number; match: number; mismatch: number }>();
  for (const f of NUTRIENT_FIELD_MAP) fieldStats.set(f.label, { compared: 0, match: 0, mismatch: 0 });

  type Sample = { chinese: string; korean: string; field: string; src: number; db: number };
  const sampleMismatches: Sample[] = [];
  const sampleMissing: { chinese: string; korean: string }[] = [];

  const cursor = Food.find(
    { chineseName: { $exists: true, $ne: "" } },
    { _id: 1, chineseName: 1, koreanName: 1, calories: 1, macros: 1, vitamins: 1, minerals: 1 }
  ).lean().cursor();

  for await (const doc of cursor) {
    scanned++;
    const cn = String(doc.chineseName ?? "").trim();
    if (!cn) continue;
    const nutrientRow = nutrientByName.get(cn);
    const materialRow = materialByName.get(cn);

    if (nutrientRow) foundInNutrient++;
    if (materialRow) foundInMaterial++;
    if (nutrientRow && materialRow) foundInBoth++;
    if (!nutrientRow && !materialRow) {
      foundInNeither++;
      if (sampleMissing.length < 20) {
        sampleMissing.push({ chinese: cn, korean: String(doc.koreanName ?? "") });
      }
      continue;
    }

    if (!nutrientRow) continue; // material-only has no numeric fields to verify

    for (const f of NUTRIENT_FIELD_MAP) {
      const srcRaw = nutrientRow[f.src];
      const srcNum = parseNum(srcRaw);
      const dbNum = parseNum(getDotted(doc, f.path));
      const stats = fieldStats.get(f.label)!;
      if (srcNum === null) continue; // source has no value → skip
      if (dbNum === null) {
        stats.compared++;
        stats.mismatch++;
        if (sampleMismatches.length < 30) {
          sampleMismatches.push({
            chinese: cn,
            korean: String(doc.koreanName ?? ""),
            field: f.label,
            src: srcNum,
            db: NaN
          });
        }
        continue;
      }
      stats.compared++;
      if (valuesMatch(srcNum, dbNum)) {
        stats.match++;
      } else {
        stats.mismatch++;
        if (sampleMismatches.length < 30) {
          sampleMismatches.push({
            chinese: cn,
            korean: String(doc.koreanName ?? ""),
            field: f.label,
            src: srcNum,
            db: dbNum
          });
        }
      }
    }
  }

  console.log("─── Coverage ───");
  console.log(`Scanned (with chineseName): ${scanned}`);
  console.log(`Found in nutrient.json:     ${foundInNutrient}`);
  console.log(`Found in food_material:     ${foundInMaterial}`);
  console.log(`Found in both:              ${foundInBoth}`);
  console.log(`Found in neither:           ${foundInNeither}`);
  console.log("");

  console.log("─── Field accuracy (vs nutrient.json source of truth) ───");
  console.log(`${"field".padEnd(10)} ${"compared".padStart(9)}  ${"match".padStart(7)}  ${"mismatch".padStart(8)}  accuracy`);
  for (const f of NUTRIENT_FIELD_MAP) {
    const s = fieldStats.get(f.label)!;
    if (s.compared === 0) continue;
    const acc = ((s.match / s.compared) * 100).toFixed(1);
    console.log(`${f.label.padEnd(10)} ${String(s.compared).padStart(9)}  ${String(s.match).padStart(7)}  ${String(s.mismatch).padStart(8)}  ${acc}%`);
  }
  console.log("");

  if (sampleMismatches.length) {
    console.log("─── Sample mismatches (first 30) ───");
    for (const m of sampleMismatches) {
      const dbStr = Number.isNaN(m.db) ? "(missing)" : String(m.db);
      console.log(`  ${m.chinese.padEnd(8)} (${m.korean}) ${m.field}: src=${m.src} db=${dbStr}`);
    }
    console.log("");
  }

  if (sampleMissing.length) {
    console.log("─── Sample foods with no source row (first 20) ───");
    for (const s of sampleMissing) {
      console.log(`  ${s.chinese} (${s.korean})`);
    }
    console.log("");
  }

  await mongoose.disconnect();
  console.log("DONE — verification complete (read-only).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

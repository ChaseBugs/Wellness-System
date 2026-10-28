import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { Activity } from "../models/activity.js";

const dataSource = "OpenNutriTracker-main physical activities";
const defaultSourcePath = path.join(
  process.cwd(),
  "..",
  "food data",
  "OpenNutriTracker-main",
  "lib",
  "core",
  "data",
  "data_source",
  "physical_activity_data_source.dart"
);
const sourcePath = path.resolve(process.env.OPENNUTRITRACKER_ACTIVITIES_PATH || defaultSourcePath);
const referenceBodyWeightKg = Number(process.env.ACTIVITY_REFERENCE_WEIGHT_KG || 70);

type ParsedActivity = {
  code: string;
  specificActivity: string;
  description: string;
  metValue: number;
  type: string;
};

function normalizeText(value: string) {
  return value
    .replace(/â€™/g, "'")
    .replace(/Âµ/g, "micro")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => {
    if (/^(or|and|the|of|in|on|for|by|to|with)$/i.test(word)) return word.toLowerCase();
    return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
  });
}

function categoryLabel(type: string) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

function iconFor(type: string) {
  const icons: Record<string, string> = {
    bicycling: "bike",
    conditioningExercise: "dumbbell",
    dancing: "music",
    running: "run",
    sport: "trophy",
    waterActivities: "waves",
    winterActivities: "snowflake"
  };
  return icons[type] || "activity";
}

function buildName(activity: ParsedActivity) {
  const base = toTitleCase(activity.specificActivity);
  if (!activity.description || activity.description.toLowerCase() === "general") return base;
  return `${base} (${activity.description})`;
}

function parseActivities(source: string): ParsedActivity[] {
  const pattern =
    /PhysicalActivityDBO\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*([0-9.]+),\s*\[[^\]]*\],\s*PhysicalActivityTypeDBO\.([A-Za-z]+),\s*\)/g;

  return [...source.matchAll(pattern)].map((match) => ({
    code: match[1],
    specificActivity: normalizeText(match[2]),
    description: normalizeText(match[3]),
    metValue: Number(match[4]),
    type: match[5]
  }));
}

function buildActivity(activity: ParsedActivity) {
  const category = categoryLabel(activity.type);
  const caloriesPerHour = Number((activity.metValue * referenceBodyWeightKg).toFixed(1));

  return {
    name: buildName(activity),
    category,
    caloriesPerHour,
    metValue: activity.metValue,
    icon: iconFor(activity.type),
    description: activity.description,
    dataSource,
    sourceCode: activity.code,
    sourceNote: JSON.stringify({
      sourceProject: "OpenNutriTracker-main",
      sourceFile: "lib/core/data/data_source/physical_activity_data_source.dart",
      sourceReference: "2011 Compendium of Physical Activities, Ainsworth et al.",
      sourceCode: activity.code,
      originalSpecificActivity: activity.specificActivity,
      originalDescription: activity.description,
      originalType: activity.type,
      caloriesPerHourReferenceWeightKg: referenceBodyWeightKg,
      caloriesFormula: "MET * bodyWeightKg * durationHours"
    }),
    tags: [
      "met",
      "physical-activity",
      "opennutritracker-main",
      category,
      activity.specificActivity,
      activity.type
    ],
    doctor_verified: false
  };
}

await connectDatabase();

const source = await readFile(sourcePath, "utf8");
const parsed = parseActivities(source);

if (parsed.length === 0) {
  throw new Error(`No activities parsed from ${sourcePath}`);
}

const docs = parsed.map(buildActivity);

const deleted = await Activity.deleteMany({ dataSource });
console.log(`Deleted ${deleted.deletedCount} existing ${dataSource} activities.`);

await Activity.insertMany(docs, { ordered: false });

console.log(
  `OpenNutriTracker activity import complete. Imported ${docs.length} activities using ${referenceBodyWeightKg}kg reference calories.`
);

await mongoose.disconnect();

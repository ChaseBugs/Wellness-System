import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { DailyValueProfile } from "../models/daily-value-profile.js";
import { getDailyTargets, preferredGoal, type UserProfileForTargets } from "../services/dailyTargets.js";

/**
 * Generate DailyValueProfile rows from the WST578 NutrientIntakeRule data so the foods
 * scoring layer can pick a profile by (age, gender, lifeStage) instead of relying on
 * hand-curated profiles in `data/dailyValueProfiles.ts`.
 *
 * One profile per row in PROFILES below. Each profile picks the user's preferred goal
 * (RNI > AI > EER) per nutrient and stores it in the `values` subdocument keyed by the
 * dailyValuePercentSchema field names.
 *
 * Re-runnable: idempotent upsert by `profileKey`. Existing curated rows with non-WST578
 * dataSource are left untouched; we only manage rows whose dataSource starts with
 * "Chinese Dietary Reference Intakes WST578".
 */

const DATA_SOURCE = "Chinese Dietary Reference Intakes WST578";
const SOURCE_NOTE = "Auto-generated from NutrientIntakeRule (WST578) preferred goals (RNI > AI > EER).";

/**
 * Map DRI nutrientKey → field name on DailyValueProfile.values (dailyValuePercentSchema).
 * Keys not in this map are dropped.
 */
const FIELD_MAP: Record<string, string> = {
  energyKcal: "calories",
  protein: "protein",
  fat: "fat",
  carbs: "carbs",
  fiber: "fiber",
  saturatedFat: "saturatedFat",
  addedSugar: "sugar",
  sodium: "sodium",
  cholesterol: "cholesterol",
  calcium: "calcium",
  iron: "iron",
  magnesium: "magnesium",
  potassium: "potassium",
  zinc: "zinc",
  vitaminA: "vitaminA",
  vitaminB1: "vitaminB1",
  vitaminB2: "vitaminB2",
  niacin: "vitaminB3",
  vitaminB6: "vitaminB6",
  vitaminB12: "vitaminB12",
  vitaminC: "vitaminC",
  vitaminD: "vitaminD",
  vitaminE: "vitaminE",
  vitaminK: "vitaminK",
  folate: "folate"
};

type ProfileSpec = {
  profileKey: string;
  label: string;
  ageMin: number;
  ageMax: number;
  gender: "male" | "female" | "all";
  purpose: string;
  notes: string;
  driProfile: UserProfileForTargets;
};

const PROFILES: ProfileSpec[] = [
  // Adults — split by gender because RNI for several nutrients (iron, energy) differs sharply.
  {
    profileKey: "wst578_adult_male_19_49",
    label: "WST578 Adult Male (19-49)",
    ageMin: 19, ageMax: 49, gender: "male",
    purpose: "general_health",
    notes: "WST578 adult male personal goals.",
    driProfile: { age: 30, gender: "male", lifeStage: "general", populationGroup: "general" }
  },
  {
    profileKey: "wst578_adult_female_19_49",
    label: "WST578 Adult Female (19-49)",
    ageMin: 19, ageMax: 49, gender: "female",
    purpose: "general_health",
    notes: "WST578 adult female personal goals.",
    driProfile: { age: 30, gender: "female", lifeStage: "general", populationGroup: "general" }
  },
  {
    profileKey: "wst578_adult_male_50_64",
    label: "WST578 Adult Male (50-64)",
    ageMin: 50, ageMax: 64, gender: "male",
    purpose: "general_health",
    notes: "WST578 mid-life adult male personal goals.",
    driProfile: { age: 55, gender: "male", lifeStage: "general", populationGroup: "general" }
  },
  {
    profileKey: "wst578_adult_female_50_64",
    label: "WST578 Adult Female (50-64)",
    ageMin: 50, ageMax: 64, gender: "female",
    purpose: "general_health",
    notes: "WST578 mid-life adult female personal goals.",
    driProfile: { age: 55, gender: "female", lifeStage: "general", populationGroup: "general" }
  },

  // Elderly
  {
    profileKey: "wst578_elderly_male_65_plus",
    label: "WST578 Elderly Male (65+)",
    ageMin: 65, ageMax: 120, gender: "male",
    purpose: "elderly",
    notes: "WST578 elderly male personal goals (>=65).",
    driProfile: { age: 70, gender: "male", lifeStage: "general", populationGroup: "elderly" }
  },
  {
    profileKey: "wst578_elderly_female_65_plus",
    label: "WST578 Elderly Female (65+)",
    ageMin: 65, ageMax: 120, gender: "female",
    purpose: "elderly",
    notes: "WST578 elderly female personal goals (>=65).",
    driProfile: { age: 70, gender: "female", lifeStage: "general", populationGroup: "elderly" }
  },

  // Adolescents
  {
    profileKey: "wst578_adolescent_male_12_18",
    label: "WST578 Adolescent Male (12-18)",
    ageMin: 12, ageMax: 18, gender: "male",
    purpose: "growth",
    notes: "WST578 adolescent male personal goals.",
    driProfile: { age: 15, gender: "male", lifeStage: "general", populationGroup: "general" }
  },
  {
    profileKey: "wst578_adolescent_female_12_18",
    label: "WST578 Adolescent Female (12-18)",
    ageMin: 12, ageMax: 18, gender: "female",
    purpose: "growth",
    notes: "WST578 adolescent female personal goals.",
    driProfile: { age: 15, gender: "female", lifeStage: "general", populationGroup: "general" }
  },

  // Children
  {
    profileKey: "wst578_child_6_11",
    label: "WST578 Child (6-11)",
    ageMin: 6, ageMax: 11, gender: "all",
    purpose: "growth",
    notes: "WST578 school-age child personal goals (gender-neutral baseline).",
    driProfile: { age: 9, gender: "all", lifeStage: "general", populationGroup: "general" }
  },

  // Pregnancy
  {
    profileKey: "wst578_pregnancy_early",
    label: "WST578 Pregnancy (1st trimester)",
    ageMin: 14, ageMax: 50, gender: "female",
    purpose: "pregnancy",
    notes: "WST578 1st-trimester pregnancy personal goals.",
    driProfile: { age: 30, gender: "female", lifeStage: "pregnancy_early", populationGroup: "pregnant" }
  },
  {
    profileKey: "wst578_pregnancy_mid",
    label: "WST578 Pregnancy (2nd trimester)",
    ageMin: 14, ageMax: 50, gender: "female",
    purpose: "pregnancy",
    notes: "WST578 2nd-trimester pregnancy personal goals.",
    driProfile: { age: 30, gender: "female", lifeStage: "pregnancy_mid", populationGroup: "pregnant" }
  },
  {
    profileKey: "wst578_pregnancy_late",
    label: "WST578 Pregnancy (3rd trimester)",
    ageMin: 14, ageMax: 50, gender: "female",
    purpose: "pregnancy",
    notes: "WST578 3rd-trimester pregnancy personal goals.",
    driProfile: { age: 30, gender: "female", lifeStage: "pregnancy_late", populationGroup: "pregnant" }
  },
  {
    profileKey: "wst578_lactation",
    label: "WST578 Lactation",
    ageMin: 14, ageMax: 50, gender: "female",
    purpose: "lactation",
    notes: "WST578 lactation personal goals.",
    driProfile: { age: 30, gender: "female", lifeStage: "lactation", populationGroup: "lactating" }
  }
];

async function buildValues(profile: UserProfileForTargets): Promise<Record<string, number>> {
  const targets = await getDailyTargets(profile);
  const values: Record<string, number> = {};
  for (const target of targets) {
    const field = FIELD_MAP[target.nutrientKey];
    if (!field) continue;
    const goal = preferredGoal(target);
    if (typeof goal !== "number") continue;
    values[field] = Math.round(goal * 100) / 100;
  }
  return values;
}

async function main() {
  await connectDatabase();
  let upserted = 0;
  let skipped = 0;
  for (const spec of PROFILES) {
    const values = await buildValues(spec.driProfile);
    if (Object.keys(values).length === 0) {
      console.warn(`[generate-dvp] no targets resolved for ${spec.profileKey}; skipping`);
      skipped++;
      continue;
    }
    await DailyValueProfile.updateOne(
      { profileKey: spec.profileKey },
      {
        $set: {
          profileKey: spec.profileKey,
          label: spec.label,
          ageMin: spec.ageMin,
          ageMax: spec.ageMax,
          gender: spec.gender,
          purpose: spec.purpose,
          notes: spec.notes,
          dataSource: DATA_SOURCE,
          sourceNote: SOURCE_NOTE,
          sourceRefs: ["reference/1711103428637300/营养标准汇编20231205/第一部分 营养素摄入量"],
          values,
          doctor_verified: false
        }
      },
      { upsert: true }
    );
    upserted++;
    console.log(`[generate-dvp] ${spec.profileKey}: ${Object.keys(values).length} nutrients`);
  }
  console.log(`[generate-dvp] done. upserted=${upserted} skipped=${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

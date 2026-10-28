import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";

type BackfillRule = {
  collection: string;
  dataSource: string;
  sourceNote?: string;
  sourceRefs?: string[];
};

const missingDataSource = {
  $or: [{ dataSource: { $exists: false } }, { dataSource: "" }, { dataSource: null }]
};

const rules: BackfillRule[] = [
  {
    collection: "dailyvalueprofiles",
    dataSource: "Foodvisor curated daily value profiles",
    sourceNote:
      "Curated app targets derived from FDA Daily Values-style nutrient limits and Foodvisor goal adjustments. Review against local clinical guidelines before medical use.",
    sourceRefs: [
      "reference/1711103428637300/营养标准汇编20231205/第一部分 营养素摄入量",
      "reference/1711103428637300/营养标准汇编20231205/第四部分 评估标准/WST428-2013 成人体重判定.pdf"
    ]
  },
  {
    collection: "humanTypeQA",
    dataSource: "Foodvisor curated Sasang questionnaire v1",
    sourceNote:
      "Curated constitution tendency questionnaire for app classification. This is not a medical diagnosis and must be clinically reviewed before treatment use."
  },
  {
    collection: "humanTypeSurvey",
    dataSource: "user_input",
    sourceNote: "User-submitted constitution survey answer set."
  },
  {
    collection: "meallogs",
    dataSource: "user_input",
    sourceNote: "User-submitted meal log."
  },
  {
    collection: "users",
    dataSource: "user_input",
    sourceNote: "User profile data submitted through the app or admin."
  },
  {
    collection: "weightentries",
    dataSource: "user_input",
    sourceNote: "User-submitted body weight entry."
  },
  {
    collection: "programs",
    dataSource: "web_admin",
    sourceNote: "Admin-created program content."
  },
  {
    collection: "recipes",
    dataSource: "web_admin",
    sourceNote: "Admin-created recipe content."
  },
  {
    collection: "recipeingredients",
    dataSource: "web_admin",
    sourceNote: "Admin-created recipe ingredient content."
  },
  {
    collection: "foods",
    dataSource: "legacy_foodvisor_seed",
    sourceNote: "Legacy Foodvisor seed food record without original import source."
  },
  {
    collection: "activities",
    dataSource: "OpenNutriTracker-main physical activities",
    sourceNote: "Physical activity MET values imported from OpenNutriTracker-main."
  },
  {
    collection: "nutritionconstraints",
    dataSource: "USDA SR28 via lp-diet-main",
    sourceNote: "Diet optimizer nutrient bounds imported from lp-diet-main constraints.csv."
  }
];

await connectDatabase();

for (const rule of rules) {
  const col = mongoose.connection.collection(rule.collection);
  const count = await col.countDocuments();
  if (!count) {
    console.log(`${rule.collection}: empty, skipped`);
    continue;
  }

  const update: Record<string, unknown> = {
    dataSource: rule.dataSource
  };
  if (rule.sourceNote) update.sourceNote = rule.sourceNote;
  if (rule.sourceRefs?.length) update.sourceRefs = rule.sourceRefs;

  const result = await col.updateMany(missingDataSource, { $set: update });
  console.log(`${rule.collection}: ${result.modifiedCount}/${count} records backfilled`);
}

await mongoose.disconnect();

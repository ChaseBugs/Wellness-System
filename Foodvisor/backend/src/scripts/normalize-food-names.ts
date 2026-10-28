import "dotenv/config";
import { connectDatabase } from "../db.js";
import { hasReferenceTranslation, referenceTranslationCount, translateChineseFoodName } from "../utils/chineseFoodKorean.js";
import mongoose from "mongoose";

type FoodDoc = {
  _id: unknown;
  chineseName?: string;
  koreanName?: string;
  category?: string;
};

await connectDatabase();

const foods = mongoose.connection.collection<FoodDoc>("foods");
const docs = await foods.find({}, { projection: { chineseName: 1, koreanName: 1, category: 1 } }).toArray();

let changed = 0;
let withoutChineseName = 0;
let referenceMatches = 0;
const operations = docs.map((food) => {
  const chineseName = String(food.chineseName || "").trim();
  if (chineseName && hasReferenceTranslation(chineseName)) referenceMatches += 1;
  const koreanName = chineseName
    ? translateChineseFoodName(chineseName, String(food.category || "food"))
    : String(food.koreanName || "").trim();

  if (!chineseName) withoutChineseName += 1;
  changed += 1;

  return {
    updateOne: {
      filter: { _id: food._id },
      update: {
        $set: { koreanName: koreanName || "food" },
        $unset: { name: 1 }
      }
    }
  };
});

if (operations.length) {
  for (let index = 0; index < operations.length; index += 500) {
    await foods.bulkWrite(operations.slice(index, index + 500) as Parameters<typeof foods.bulkWrite>[0], { ordered: false });
  }
}

try {
  await foods.dropIndex("name_1");
  console.log("Dropped foods.name_1 index");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("index not found")) {
    console.warn(`Could not drop foods.name_1 index: ${message}`);
  }
}

const remainingNameFields = await foods.countDocuments({ name: { $exists: true } });
const koreanNameDocs = await foods.find({}, { projection: { koreanName: 1 } }).toArray();
const remainingChineseInKoreanName = koreanNameDocs.filter((food) => /[\u3400-\u9fff]/u.test(String(food.koreanName || ""))).length;

console.log(`Normalized ${changed} food names from chineseName to koreanName`);
console.log(`Reference dictionary entries: ${referenceTranslationCount()}`);
console.log(`Foods matched by reference.md: ${referenceMatches}`);
console.log(`Foods without chineseName: ${withoutChineseName}`);
console.log(`Remaining name fields: ${remainingNameFields}`);
console.log(`Korean names still containing Chinese characters: ${remainingChineseInKoreanName}`);

await mongoose.disconnect();

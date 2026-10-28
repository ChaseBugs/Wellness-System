import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { translateChineseFoodName } from "../utils/chineseFoodKorean.js";

type FoodDoc = {
  _id: unknown;
  chineseName?: string;
  koreanName?: string;
  category?: string;
};

type TranslationItem = {
  id: string;
  chineseName: string;
  category: string;
};

type TranslationResult = {
  id: string;
  koreanName: string;
};

const apiKey = process.env.DEEPSEEK_API_KEY;
const apiUrl = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const batchSize = Number(process.env.DEEPSEEK_TRANSLATE_BATCH_SIZE || 80);
const limit = Number(process.env.DEEPSEEK_TRANSLATE_LIMIT || 0);
const delayMs = Number(process.env.DEEPSEEK_TRANSLATE_DELAY_MS || 900);
const overwrite = process.env.DEEPSEEK_TRANSLATE_OVERWRITE !== "false";
const referencePath = path.resolve(process.env.FOOD_TRANSLATION_REFERENCE || path.join(process.cwd(), "..", "reference.md"));

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function hasChinese(value: string) {
  return /[\u3400-\u9fff]/u.test(value);
}

function describeError(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const cause = "cause" in error ? (error as Error & { cause?: unknown }).cause : undefined;
  return cause ? `${error.message}; cause=${String(cause)}` : error.message;
}

function extractJsonArray(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced?.[1] || content;
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("DeepSeek response did not contain a JSON array");
  return JSON.parse(text.slice(start, end + 1)) as TranslationResult[];
}

async function loadReferenceExcerpt() {
  try {
    const content = await readFile(referencePath, "utf8");
    return content.slice(0, 18000);
  } catch {
    return "";
  }
}

async function translateBatch(items: TranslationItem[], referenceExcerpt: string) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: [
            "You translate Chinese food names into Korean food database names.",
            "Return only valid JSON. No markdown unless the JSON itself is inside plain text.",
            "Rules:",
            "- Preserve the input id exactly.",
            "- koreanName must be DPRK/North Korean standard Korean food name in Hangul only, with short natural wording.",
            "- Prefer DPRK-style vocabulary and orthography where it differs from South Korean usage.",
            "- Examples of preferred DPRK-style wording: Ryori not cooking, Ryorigam not ingredients when describing ingredients, Vegetables for vegetables when natural, chicken egg for chicken egg, oil not oil, milk products/milk depending on common food name.",
            "- Avoid South Korean loanwords when a natural DPRK Korean word exists.",
            "- Do not include Chinese characters.",
            "- Do not include explanations, categories, notes, or quotes around the whole response.",
            "- Use the provided glossary/reference as authoritative when a source name or phrase appears there.",
            "- If the Chinese name is a processed food, translate the processing/state too, for example dried, boiled, salted, canned, powdered.",
            "- Output schema: [{\"id\":\"...\",\"koreanName\":\"...\"}]"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            reference: referenceExcerpt,
            foods: items
          })
        }
      ],
      temperature: 0,
      stream: false,
      max_tokens: 6000,
      thinking: { type: "disabled" }
    }),
    signal: AbortSignal.timeout(120000)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`DeepSeek HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content || "";
  const results = extractJsonArray(content);
  const resultMap = new Map(results.map((item) => [String(item.id), clean(String(item.koreanName || ""))]));

  return items.map((item) => {
    const koreanName = resultMap.get(item.id) || translateChineseFoodName(item.chineseName, item.category);
    return {
      id: item.id,
      koreanName: hasChinese(koreanName) ? translateChineseFoodName(item.chineseName, item.category) : koreanName
    };
  });
}

if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY is missing from foodvisor/backend/.env");
}

await connectDatabase();

const foods = mongoose.connection.collection("foods");
const filter = overwrite
  ? { chineseName: { $type: "string", $ne: "" } }
  : {
      chineseName: { $type: "string", $ne: "" },
      $or: [
        { koreanName: { $exists: false } },
        { koreanName: "" },
        { koreanName: /[\u3400-\u9fff]/u }
      ]
    };

const docs = await foods.find(filter, { projection: { chineseName: 1, koreanName: 1, category: 1 } }).toArray() as FoodDoc[];
const selected = limit > 0 ? docs.slice(0, limit) : docs;
const referenceExcerpt = await loadReferenceExcerpt();

let translated = 0;
let failed = 0;

for (let index = 0; index < selected.length; index += batchSize) {
  const batchDocs = selected.slice(index, index + batchSize);
  const items = batchDocs.map((food) => ({
    id: String(food._id),
    chineseName: clean(String(food.chineseName || "")),
    category: clean(String(food.category || "food"))
  }));

  try {
    const results = await translateBatch(items, referenceExcerpt);
    const operations = results.map((result) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(result.id) },
        update: {
          $set: { koreanName: result.koreanName || "food" },
          $unset: { name: 1 }
        }
      }
    }));

    if (operations.length) {
      await foods.bulkWrite(operations, { ordered: false });
    }

    translated += results.length;
    console.log(`Translated ${translated}/${selected.length}`);
  } catch (error) {
    failed += batchDocs.length;
    console.warn(`Batch ${index / batchSize + 1} failed: ${describeError(error)}`);
  }

  if (index + batchSize < selected.length) await sleep(delayMs);
}

try {
  await foods.dropIndex("name_1");
  console.log("Dropped foods.name_1 index");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("index not found")) console.warn(`Could not drop foods.name_1 index: ${message}`);
}

const remainingNameFields = await foods.countDocuments({ name: { $exists: true } });
const koreanNameDocs = await foods.find({}, { projection: { koreanName: 1 } }).toArray() as Array<{ koreanName?: string }>;
const remainingChineseInKoreanName = koreanNameDocs.filter((food) => hasChinese(String(food.koreanName || ""))).length;

console.log(`DeepSeek translation complete. translated=${translated}, failed=${failed}`);
console.log(`Remaining name fields: ${remainingNameFields}`);
console.log(`Korean names still containing Chinese characters: ${remainingChineseInKoreanName}`);

await mongoose.disconnect();

import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { connectDatabase } from "../db.js";
import { Food } from "../models/food.js";

type FoodRecord = {
  _id: unknown;
  koreanName?: string;
  chineseName?: string;
  brand?: string;
  category?: string;
  foodGroup?: string;
  foodSubgroup?: string;
  dataSource?: string;
  imageUrl?: string;
  imageSourceUrl?: string;
  imageLicense?: string;
};

type ImageCandidate = {
  provider: "Direct Source URL" | "OpenFoodFacts" | "Wikimedia Commons";
  imageUrl: string;
  sourceUrl: string;
  pageUrl: string;
  license: string;
  title: string;
  score: number;
};

const imageDir = path.join(process.cwd(), "public", "images", "foods");
const limit = Number(process.env.REAL_IMAGE_LIMIT || 100);
const delayMs = Number(process.env.REAL_IMAGE_DELAY_MS || 6500);
const minScore = Number(process.env.REAL_IMAGE_MIN_SCORE || 0.5);
const providerOrder = (process.env.REAL_IMAGE_PROVIDERS || "sourceUrl,openfoodfacts,wikimedia")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const sourceFilter = (process.env.REAL_IMAGE_SOURCES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "food";
}

function tokens(value = "") {
  const stop = new Set(["and", "or", "the", "a", "an", "with", "without", "food", "foods", "fresh", "raw", "cooked"]);
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stop.has(token));
}

function scoreMatch(query: string, candidate: string) {
  const queryTokens = [...new Set(tokens(query))];
  const candidateTokens = new Set(tokens(candidate));
  if (!queryTokens.length || !candidateTokens.size) return 0;
  const matched = queryTokens.filter((token) => candidateTokens.has(token)).length;
  return matched / queryTokens.length;
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

function queryFor(food: FoodRecord) {
  const name = clean(food.koreanName || food.chineseName || "");
  const brand = clean(food.brand);
  return brand ? `${brand} ${name}` : name;
}

async function sourceUrlCandidate(food: FoodRecord): Promise<ImageCandidate | null> {
  const sourceUrl = clean(food.imageSourceUrl || (food.imageUrl && /^https?:\/\//i.test(food.imageUrl) ? food.imageUrl : ""));
  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return null;

  return {
    provider: "Direct Source URL",
    imageUrl: sourceUrl,
    sourceUrl,
    pageUrl: sourceUrl,
    license: clean(food.imageLicense || "Direct image source URL"),
    title: queryFor(food),
    score: 1
  };
}

async function openFoodFactsCandidate(food: FoodRecord): Promise<ImageCandidate | null> {
  if (!food.brand) return null;

  const query = queryFor(food);
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "10",
    fields: "product_name,brands,image_front_url,image_url,url,code"
  });
  const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`, {
    headers: { "User-Agent": "Foodvisor/0.1 image downloader - local development" },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`OpenFoodFacts HTTP ${response.status}`);

  const data = await response.json() as { products?: Array<Record<string, string>> };
  const candidates: ImageCandidate[] = [];
  for (const product of data.products || []) {
    const title = clean(`${product.brands || ""} ${product.product_name || ""}`);
    const imageUrl = product.image_front_url || product.image_url;
    if (!imageUrl || !title) continue;
    candidates.push({
        provider: "OpenFoodFacts" as const,
        imageUrl,
        sourceUrl: imageUrl,
        pageUrl: product.url || `https://world.openfoodfacts.org/product/${product.code || ""}`,
        license: "CC BY-SA 3.0 / Open Food Facts product image",
        title,
        score: scoreMatch(query, title)
    });
  }
  candidates.sort((a, b) => b.score - a.score);

  return candidates[0] && candidates[0].score >= minScore ? candidates[0] : null;
}

async function wikimediaCandidate(food: FoodRecord): Promise<ImageCandidate | null> {
  if (food.brand) return null;

  const query = `${clean(food.koreanName || food.chineseName || "")} food`;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata"
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: { "User-Agent": "Foodvisor/0.1 image downloader - local development" },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Wikimedia HTTP ${response.status}`);

  const data = await response.json() as {
    query?: {
      pages?: Record<string, {
        title?: string;
        imageinfo?: Array<{
          url?: string;
          mime?: string;
          descriptionurl?: string;
          extmetadata?: Record<string, { value?: string }>;
        }>;
      }>;
    };
  };

  const candidates: ImageCandidate[] = [];
  for (const page of Object.values(data.query?.pages || {})) {
    for (const info of page.imageinfo || []) {
      const mime = info.mime || "";
      if (!info.url || !mime.startsWith("image/")) continue;
      const title = clean((page.title || "").replace(/^File:/, ""));
      candidates.push({
        provider: "Wikimedia Commons" as const,
        imageUrl: info.url,
        sourceUrl: info.url,
        pageUrl: info.descriptionurl || info.url,
        license: clean(info.extmetadata?.LicenseShortName?.value || "Wikimedia Commons license"),
        title,
        score: scoreMatch(food.koreanName || food.chineseName || "", title)
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  return candidates[0] && candidates[0].score >= minScore ? candidates[0] : null;
}

async function findCandidate(food: FoodRecord) {
  for (const provider of providerOrder) {
    try {
      if (provider === "sourceurl" || provider === "source_url") {
        const candidate = await sourceUrlCandidate(food);
        if (candidate) return candidate;
      }
      if (provider === "openfoodfacts") {
        const candidate = await openFoodFactsCandidate(food);
        if (candidate) return candidate;
      }
      if (provider === "wikimedia") {
        const candidate = await wikimediaCandidate(food);
        if (candidate) return candidate;
      }
    } catch (error) {
      console.warn(`${provider} failed for ${queryFor(food)}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return null;
}

async function saveImage(food: FoodRecord, candidate: ImageCandidate) {
  const response = await fetch(candidate.imageUrl, {
    headers: { "User-Agent": "Foodvisor/0.1 image downloader - local development" },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Image download HTTP ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) throw new Error(`Unexpected content type ${contentType}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 2048) throw new Error("Image too small to trust");

  const ext = extensionFromContentType(contentType);
  const fileName = `real-${String(food._id)}-${slugify(food.koreanName || food.chineseName || "food")}.${ext}`;
  const filePath = path.join(imageDir, fileName);
  await writeFile(filePath, buffer);
  return `/images/foods/${fileName}`;
}

await connectDatabase();
await mkdir(imageDir, { recursive: true });

const query: Record<string, unknown> = {
  $or: [
    { imageUrl: { $exists: false } },
    { imageUrl: "" },
    { imageUrl: { $regex: "^https?://" } },
    { imageSourceUrl: { $regex: "^https?://" } },
    { imageStatus: "missing" }
  ]
};
if (sourceFilter.length) {
  query.dataSource = { $in: sourceFilter };
}

const foods = await Food.find(query)
  .select("koreanName chineseName brand category foodGroup foodSubgroup dataSource imageUrl imageSourceUrl imageLicense")
  .sort({ brand: -1, koreanName: 1 })
  .limit(limit)
  .lean() as FoodRecord[];

let downloaded = 0;
let missed = 0;

for (const food of foods) {
  const candidate = await findCandidate(food);
  if (!candidate) {
    missed += 1;
    await Food.updateOne({ _id: food._id }, { $set: { imageStatus: "missing" } });
    console.log(`No trusted image: ${queryFor(food)}`);
    await sleep(delayMs);
    continue;
  }

  try {
    const imageUrl = await saveImage(food, candidate);
    await Food.updateOne(
      { _id: food._id },
      {
        $set: {
          imageUrl,
          imageSource: candidate.provider,
          imageSourceUrl: candidate.sourceUrl,
          imagePageUrl: candidate.pageUrl,
          imageLicense: candidate.license,
          imageStatus: "downloaded"
        }
      }
    );
    downloaded += 1;
    console.log(`Downloaded ${downloaded}/${foods.length}: ${queryFor(food)} <- ${candidate.provider} (${candidate.score.toFixed(2)})`);
  } catch (error) {
    missed += 1;
    await Food.updateOne({ _id: food._id }, { $set: { imageStatus: "download_failed" } });
    console.warn(`Download failed for ${queryFor(food)}: ${error instanceof Error ? error.message : String(error)}`);
  }

  await sleep(delayMs);
}

console.log(`Real food image download complete. Downloaded ${downloaded}; missed ${missed}; checked ${foods.length}.`);
process.exit(0);

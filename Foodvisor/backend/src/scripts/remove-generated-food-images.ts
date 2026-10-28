import "dotenv/config";
import { opendir, unlink } from "fs/promises";
import path from "path";
import { connectDatabase } from "../db.js";
import { Food } from "../models/food.js";

const imageDir = path.join(process.cwd(), "public", "images", "foods");
const patterns = [/^cfd-.*\.svg$/i, /^usda-.*\.svg$/i];
const concurrency = Number(process.env.REMOVE_IMAGE_CONCURRENCY || 100);

function isGenerated(name: string) {
  return patterns.some((pattern) => pattern.test(name));
}

async function removeGeneratedFiles() {
  let checked = 0;
  let removed = 0;
  const pending = new Set<Promise<void>>();
  const dir = await opendir(imageDir);

  async function schedule(filePath: string) {
    const task = unlink(filePath)
      .then(() => {
        removed += 1;
      })
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          console.warn(`Failed to remove ${filePath}: ${error.message}`);
        }
      })
      .finally(() => {
        pending.delete(task);
      });

    pending.add(task);
    if (pending.size >= concurrency) {
      await Promise.race(pending);
    }
  }

  for await (const entry of dir) {
    if (!entry.isFile()) continue;
    checked += 1;
    if (!isGenerated(entry.name)) continue;
    await schedule(path.join(imageDir, entry.name));
    if (removed > 0 && removed % 25000 === 0) {
      console.log(`Removed ${removed} generated image files...`);
    }
  }

  await Promise.all(pending);
  return { checked, removed };
}

await connectDatabase();

const dbResult = await Food.updateMany(
  {
    imageUrl: { $regex: "^/images/foods/(cfd-|usda-)" }
  },
  {
    $unset: {
      imageUrl: "",
      imageSource: "",
      imageSourceUrl: "",
      imagePageUrl: "",
      imageLicense: ""
    },
    $set: {
      imageStatus: "missing"
    }
  }
);

const fileResult = await removeGeneratedFiles();

console.log(`Cleared ${dbResult.modifiedCount} generated image references.`);
console.log(`Removed ${fileResult.removed} generated image files from ${imageDir}.`);
process.exit(0);

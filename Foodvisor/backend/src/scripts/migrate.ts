import "dotenv/config";
import { connectDatabase } from "../db.js";
import { migrateFoodDictionary } from "../migrations/foodDictionaryMigration.js";

await connectDatabase();

const downloadImages = process.argv.includes("--download-images");
const result = await migrateFoodDictionary({ downloadImages });

console.log(`Migrated ${result.foodCount} foods and ${result.profileCount} daily value profiles.`);
process.exit(0);

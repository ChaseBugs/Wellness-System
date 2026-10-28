import "dotenv/config";
import { connectDatabase } from "../db.js";
import { migrateFoodDictionary } from "../migrations/foodDictionaryMigration.js";

await connectDatabase();

const result = await migrateFoodDictionary({ downloadImages: true });

console.log(`Seeded ${result.foodCount} foods and ${result.profileCount} daily value profiles without clearing existing data.`);
process.exit(0);

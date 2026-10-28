import "dotenv/config";
import { downloadFoodImages } from "../migrations/foodDictionaryMigration.js";

const result = await downloadFoodImages();
console.log(`Downloaded ${result.downloaded}/${result.total} food images to ${result.imageDir}.`);

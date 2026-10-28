import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";

const missingDataSource = {
  $or: [{ dataSource: { $exists: false } }, { dataSource: "" }, { dataSource: null }]
};

await connectDatabase();

const db = mongoose.connection.db;
if (!db) {
  throw new Error("MongoDB connection is not ready.");
}

const collections = await db.listCollections().toArray();
let failed = false;

for (const collection of collections.sort((a, b) => a.name.localeCompare(b.name))) {
  const col = mongoose.connection.collection(collection.name);
  const total = await col.countDocuments();
  const missing = await col.countDocuments(missingDataSource);
  const sources = (await col.distinct("dataSource")).filter(Boolean).sort();

  if (total > 0 && missing > 0) failed = true;

  console.log(
    JSON.stringify({
      collection: collection.name,
      total,
      missingDataSource: missing,
      dataSources: sources
    })
  );
}

await mongoose.disconnect();

if (failed) {
  process.exitCode = 1;
}

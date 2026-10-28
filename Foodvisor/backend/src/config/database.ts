import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoDbUri);
  logger.db.connect("MongoDB connected", {
    host: mongoose.connection.host,
    name: mongoose.connection.name
  });
}

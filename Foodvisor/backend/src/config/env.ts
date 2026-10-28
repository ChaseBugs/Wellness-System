import "dotenv/config";

export type NodeEnv = "development" | "test" | "production";

function numberEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringListEnv(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function nodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV;
  if (value === "production" || value === "test") return value;
  return "development";
}

export const env = {
  nodeEnv: nodeEnv(),
  port: numberEnv("PORT", 4000),
  mongoDbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/foodvisor",
  corsOrigins: stringListEnv("CORS_ORIGIN", ["http://localhost:3000", "http://localhost:3001"]),
  jsonLimit: process.env.JSON_LIMIT || "10mb",
  autoMigrate: process.env.AUTO_MIGRATE !== "false",
  apiPrefix: process.env.API_PREFIX || "/api"
} as const;

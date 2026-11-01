import dotenv from "dotenv";

dotenv.config({ quiet: true });

export type NodeEnv = "development" | "test" | "production";

function numberEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return process.env[name] !== undefined && Number.isFinite(parsed) ? parsed : fallback;
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return raw === "true" || raw === "1";
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

const resolvedNodeEnv = nodeEnv();
const isProduction = resolvedNodeEnv === "production";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret !== "change-me-in-production") return secret;
  // Fail fast: a guessable signing key in production would let anyone mint tokens.
  if (isProduction) throw new Error("JWT_SECRET must be set to a strong value in production");
  return "dev-only-insecure-jwt-secret";
}

export const env = {
  nodeEnv: resolvedNodeEnv,
  isProduction,
  port: numberEnv("PORT", 4500),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/wellness_platform",
  dbPoolMax: numberEnv("DB_POOL_MAX", 20),
  autoMigrate: booleanEnv("AUTO_MIGRATE", !isProduction),
  corsOrigins: stringListEnv("CORS_ORIGIN", ["http://localhost:3000", "http://localhost:3001"]),
  jsonLimit: process.env.JSON_LIMIT || "1mb",
  jwtSecret: jwtSecret(),
  jwtAccessTtlSeconds: numberEnv("JWT_ACCESS_TTL_SECONDS", 900),
  refreshTokenTtlDays: numberEnv("REFRESH_TOKEN_TTL_DAYS", 30),
  bcryptRounds: numberEnv("BCRYPT_ROUNDS", 10),
  // The dev store trusts client payloads, so it can never be enabled in production.
  devStoreEnabled: !isProduction && booleanEnv("DEV_STORE_ENABLED", true),
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@wellness.local",
    adminPassword: process.env.SEED_ADMIN_PASSWORD || "Admin123!",
    sampleContent: !isProduction && booleanEnv("SEED_SAMPLE_CONTENT", true)
  }
} as const;

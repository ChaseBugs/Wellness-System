import pg from "pg";
import { env } from "./env.js";
import logger from "../utils/logger.js";

// NUMERIC/BIGINT arrive as strings by default; every value we store fits safely in a JS number.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => Number.parseFloat(value));
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number.parseInt(value, 10));
// Keep DATE columns as "YYYY-MM-DD" so calendar days never shift with the server timezone.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.databaseUrl,
      max: env.dbPoolMax,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000
    });
    pool.on("error", (error) => {
      logger.db.error("Unexpected error on idle client", { error: error.message });
    });
  }
  return pool;
}

export async function connectDatabase(): Promise<void> {
  const client = await getPool().connect();
  try {
    const result = await client.query<{ server_version: string }>("SHOW server_version");
    const url = new URL(env.databaseUrl);
    logger.db.connect("PostgreSQL connected", {
      host: url.hostname,
      database: url.pathname.slice(1),
      version: result.rows[0]?.server_version
    });
  } finally {
    client.release();
  }
}

export async function closeDatabase(): Promise<void> {
  if (!pool) return;
  await pool.end();
  pool = null;
}

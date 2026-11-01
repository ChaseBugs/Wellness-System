import fs from "fs";
import path from "path";
import type pg from "pg";
import { APP_CATALOG } from "../config/app-catalog.js";
import logger from "./logger.js";
import { withTransaction } from "./sql.js";

const MIGRATIONS_DIR = path.join(process.cwd(), "database", "migrations");

/**
 * Applies every `database/migrations/NNN_<name>.sql` file that has not run yet, in filename order,
 * each inside its own transaction. Platform migrations use 0xx numbers and app modules use 1xx.
 */
export async function runMigrations(pool: pg.Pool): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const applied = new Set(
    (await pool.query<{ name: string }>("SELECT name FROM public.schema_migrations")).rows.map((row) => row.name)
  );
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^\d{3}_.+\.sql$/.test(file))
    .sort();

  const newlyApplied: string[] = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const started = Date.now();
    await withTransaction(pool, async (client) => {
      await client.query(sql);
      await client.query("INSERT INTO public.schema_migrations (name) VALUES ($1)", [file]);
    });
    logger.db.migration(`Applied ${file}`, { ms: Date.now() - started });
    newlyApplied.push(file);
  }

  await syncAppCatalog(pool);
  return newlyApplied;
}

/** Upserts the code-defined app catalog so app_code foreign keys always have a target row. */
export async function syncAppCatalog(pool: pg.Pool): Promise<void> {
  for (const app of APP_CATALOG) {
    await pool.query(
      `INSERT INTO identity.apps (code, name, category, data_sensitivity, lifecycle, backend_module, wellness_pass_eligible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         data_sensitivity = EXCLUDED.data_sensitivity,
         lifecycle = EXCLUDED.lifecycle,
         backend_module = EXCLUDED.backend_module,
         wellness_pass_eligible = EXCLUDED.wellness_pass_eligible,
         updated_at = now()`,
      [app.code, app.name, app.category, app.dataSensitivity, app.lifecycle, app.backendModule, app.wellnessPassEligible]
    );
  }
  logger.db.success("App catalog synced", { apps: APP_CATALOG.length });
}

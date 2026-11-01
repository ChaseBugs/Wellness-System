import { closeDatabase, connectDatabase, getPool } from "../config/database.js";
import logger, { EMOJIS } from "../utils/logger.js";
import { runMigrations } from "../utils/migrations.js";

async function main(): Promise<void> {
  await connectDatabase();
  const applied = await runMigrations(getPool());
  logger.successWithEmoji(EMOJIS.MIGRATION, applied.length ? "Migrations applied" : "Database already up to date", "MIGRATION", {
    applied
  });
}

main()
  .catch((error: unknown) => {
    logger.errorWithEmoji(EMOJIS.ERROR, "Migration failed", "MIGRATION", {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());

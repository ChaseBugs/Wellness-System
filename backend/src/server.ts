import { createServer } from "http";
import { createApp } from "./app.js";
import { closeDatabase, connectDatabase, getPool } from "./config/database.js";
import { env } from "./config/env.js";
import logger, { EMOJIS } from "./utils/logger.js";
import { runMigrations } from "./utils/migrations.js";

const app = createApp();
const server = createServer(app);

async function bootstrap() {
  await connectDatabase();

  if (env.autoMigrate) {
    const applied = await runMigrations(getPool());
    logger.db.migration("Migrations checked", { applied });
  }

  server.listen(env.port, () => {
    logger.server.start(env.port, env.nodeEnv, {
      apiDocs: `http://localhost:${env.port}/api-docs`,
      apiPrefix: env.apiPrefix
    });
  });
}

function shutdown(signal: string) {
  logger.server.shutdown(signal);
  server.close(() => {
    closeDatabase().finally(() => process.exit(0));
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap().catch((error: unknown) => {
  logger.errorWithEmoji(EMOJIS.ERROR, "Server bootstrap failed", "SERVER", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});

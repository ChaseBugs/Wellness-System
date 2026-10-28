import { createServer } from "http";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { migrateFoodDictionary } from "./migrations/foodDictionaryMigration.js";
import logger, { EMOJIS } from "./utils/logger.js";

const app = createApp();
const server = createServer(app);

async function bootstrap() {
  await connectDatabase();

  const migrationResult = env.autoMigrate
    ? await migrateFoodDictionary({ skipFoods: true })
    : { foodCount: 0, profileCount: 0 };

  if (env.autoMigrate) {
    logger.db.migration("Food dictionary migration checked", migrationResult);
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
    process.exit(0);
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

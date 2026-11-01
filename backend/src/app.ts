import compression from "compression";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { getPool } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import { modules } from "./modules/module-registry.js";
import { STATIC_URL_PREFIX, staticRoot } from "./modules/platform/media/providers/local-disk-storage.js";
import { IMAGE_UPLOAD_PATH } from "./modules/platform/media/routes/media-routes.js";
import { buildOpenApiDocument, swaggerHtml } from "./swagger/swagger.js";
import logger from "./utils/logger.js";
import { sendError, sendSuccess } from "./utils/response.js";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(requestId);
  app.use(
    cors({
      origin(origin, callback) {
        // Native mobile apps send no Origin header; browsers (admin panels) must be allow-listed.
        if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    })
  );
  // Images are loaded cross-origin by the admin panels, so resources must not be same-origin only.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
  // Image uploads carry base64 bodies and register their own larger JSON parser.
  const jsonParser = express.json({ limit: env.jsonLimit });
  const uploadPath = `${env.apiPrefix}/media${IMAGE_UPLOAD_PATH}`;
  app.use((req, res, next) => (req.path === uploadPath ? next() : jsonParser(req, res, next)));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(requestLogger);

  app.use(STATIC_URL_PREFIX, express.static(staticRoot(), { maxAge: "7d", fallthrough: true }));

  const openApiDocument = buildOpenApiDocument();
  app.get("/", (_req, res) => res.redirect("/api-docs"));
  app.get("/api-docs.json", (_req, res) => res.json(openApiDocument));
  app.get("/api-docs", (_req, res) => res.type("html").send(swaggerHtml("Wellness Platform API", "/api-docs.json")));

  /**
   * @openapi
   * /health:
   *   get:
   *     tags: [System]
   *     summary: Service and database health plus mounted modules
   *     responses: { 200: { description: Healthy }, 503: { description: Database unreachable } }
   */
  app.get(`${env.apiPrefix}/health`, async (_req, res) => {
    const moduleList = modules.map((module) => ({ name: module.name, kind: module.kind, basePath: module.basePath || "/" }));
    try {
      await getPool().query("SELECT 1");
      sendSuccess(res, { status: "ok", service: "wellness-platform-backend", database: "ok", modules: moduleList });
    } catch (error) {
      logger.server.health("degraded", { error: error instanceof Error ? error.message : String(error) });
      sendError(res, "SERVICE_UNAVAILABLE", "Database unreachable", 503);
    }
  });

  for (const module of modules) {
    const mountPath = `${env.apiPrefix}${module.basePath}`;
    app.use(mountPath, module.router);
    logger.module.mounted(module.name, mountPath, { kind: module.kind });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

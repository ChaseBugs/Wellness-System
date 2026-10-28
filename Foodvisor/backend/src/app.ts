import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import { apiRouter } from "./routes/index.js";
import { openApiDocument, swaggerHtml } from "./swagger.js";

export function createApp() {
  const app = express();

  app.use(requestId);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    })
  );
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: env.jsonLimit }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(requestLogger);

  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));
  app.get("/", (_req, res) => res.redirect("/api-docs"));
  app.get("/api-docs.json", (_req, res) => res.json(openApiDocument));
  app.get("/api-docs", (_req, res) =>
    res.type("html").send(swaggerHtml("Foodvisor API Docs", "/api-docs.json"))
  );
  app.use(env.apiPrefix, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

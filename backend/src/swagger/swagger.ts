import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";
import { APP_CODES } from "../config/app-catalog.js";
import { env } from "../config/env.js";

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Assembles the spec from the `@openapi` JSDoc blocks in every module's route files (.ts in dev, .js in dist). */
export function buildOpenApiDocument(): object {
  return swaggerJsdoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Wellness Platform API",
        version: "0.1.0",
        description:
          "One modular backend for every Wellness Ecosystem app: shared platform modules (identity, subscriptions, content, routines, analytics, notifications, recommendations) plus one module per app under /apps/{appCode}. Responses use the envelope { success, data, meta } or { success: false, error, meta }."
      },
      servers: [{ url: env.apiPrefix, description: "Current server" }],
      tags: [
        { name: "System" },
        { name: "Identity" },
        { name: "Subscriptions" },
        { name: "Content" },
        { name: "Routine" },
        { name: "Analytics" },
        { name: "Notifications" },
        { name: "Recommendations" },
        { name: "Media" },
        { name: "BabyGrow" },
        { name: "Foodvisor" },
        { name: "HeightIncrease" },
        { name: "HealthyRecipes" },
        { name: "Routine Apps", description: "Daily Workout, Daily Yoga and HeightIncrease programs (shared Routine Engine)" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        },
        parameters: {
          AppCode: {
            name: "X-App-Code",
            in: "header",
            required: true,
            description: "The calling app",
            schema: { type: "string", enum: [...APP_CODES] }
          },
          AppCodeOptional: {
            name: "X-App-Code",
            in: "header",
            required: false,
            description: "The calling app (records the install and attribution)",
            schema: { type: "string", enum: [...APP_CODES] }
          },
          Id: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          Page: { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
          Limit: { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } }
        }
      }
    },
    apis: [
      path.join(srcDir, "app.{ts,js}").replace(/\\/g, "/"),
      path.join(srcDir, "modules/**/routes/*.{ts,js}").replace(/\\/g, "/")
    ]
  });
}

export function swaggerHtml(title: string, specUrl: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: "${specUrl}", dom_id: "#swagger-ui", persistAuthorization: true });
    </script>
  </body>
</html>`;
}

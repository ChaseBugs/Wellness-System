export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Foodvisor Backend API",
    version: "0.1.0",
    description: "Admin and mobile-content API for Foodvisor nutrition resources."
  },
  servers: [
    {
      url: "/",
      description: "Current server"
    }
  ],
  tags: [
    { name: "System" },
    { name: "Dashboard" },
    { name: "Resources" }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service health",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" }
              }
            }
          }
        }
      }
    },
    "/api/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Dashboard totals",
        responses: {
          "200": {
            description: "Dashboard counters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardStats" }
              }
            }
          }
        }
      }
    },
    "/api/{resource}": {
      get: {
        tags: ["Resources"],
        summary: "List resources",
        parameters: [
          { $ref: "#/components/parameters/ResourceName" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "q", in: "query", schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Resource list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ListResponse" }
              }
            }
          }
        }
      },
      post: {
        tags: ["Resources"],
        summary: "Create resource",
        parameters: [{ $ref: "#/components/parameters/ResourceName" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourcePayload" }
            }
          }
        },
        responses: {
          "201": {
            description: "Created resource",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          }
        }
      }
    },
    "/api/{resource}/{id}": {
      get: {
        tags: ["Resources"],
        summary: "Get resource detail",
        parameters: [
          { $ref: "#/components/parameters/ResourceName" },
          { $ref: "#/components/parameters/ObjectId" }
        ],
        responses: {
          "200": {
            description: "Resource detail",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          },
          "404": { $ref: "#/components/responses/NotFound" }
        }
      },
      put: {
        tags: ["Resources"],
        summary: "Update resource",
        parameters: [
          { $ref: "#/components/parameters/ResourceName" },
          { $ref: "#/components/parameters/ObjectId" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourcePayload" }
            }
          }
        },
        responses: {
          "200": {
            description: "Updated resource",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          },
          "404": { $ref: "#/components/responses/NotFound" }
        }
      },
      delete: {
        tags: ["Resources"],
        summary: "Delete resource",
        parameters: [
          { $ref: "#/components/parameters/ResourceName" },
          { $ref: "#/components/parameters/ObjectId" }
        ],
        responses: {
          "204": { description: "Deleted" },
          "404": { $ref: "#/components/responses/NotFound" }
        }
      }
    }
  },
  components: {
    parameters: {
      ResourceName: {
        name: "resource",
        in: "path",
        required: true,
        schema: {
          type: "string",
          enum: ["foods", "recipes", "activities", "users", "meal-logs", "weight-entries", "programs"]
        }
      },
      ObjectId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" }
      }
    },
    responses: {
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      }
    },
    schemas: {
      Health: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "foodvisor-backend" }
        }
      },
      DashboardStats: {
        type: "object",
        properties: {
          foods: { type: "integer" },
          recipes: { type: "integer" },
          activities: { type: "integer" },
          users: { type: "integer" },
          mealLogs: { type: "integer" },
          weightEntries: { type: "integer" },
          caloriesLogged: { type: "number" }
        }
      },
      ListResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { type: "object", additionalProperties: true }
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" }
        }
      },
      ResourcePayload: {
        type: "object",
        additionalProperties: true,
        example: {
          name: "Greek Yogurt",
          category: "Dairy",
          doctor_verified: false
        }
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" }
        }
      }
    }
  }
} as const;

export function swaggerHtml(title: string, specUrl: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: "${specUrl}", dom_id: "#swagger-ui" });
    </script>
  </body>
</html>`;
}

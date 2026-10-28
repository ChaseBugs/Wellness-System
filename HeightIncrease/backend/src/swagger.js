const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Height Increase Backend API",
    version: "1.0.0",
    description: "Backend API for Height Increase mobile app, admin panel, auth, content, and reporting."
  },
  servers: [
    {
      url: "/",
      description: "Current server"
    }
  ],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Admin" },
    { name: "Mobile" }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          200: {
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
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: { $ref: "#/components/responses/AuthSuccess" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user or admin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: { $ref: "#/components/responses/AuthSuccess" },
          401: { $ref: "#/components/responses/Error" }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Admin dashboard statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Dashboard totals, latest logs, and chart data",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          }
        }
      }
    },
    "/api/admin/{resource}": {
      get: {
        tags: ["Admin"],
        summary: "List admin resources",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/AdminResource" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", example: "-createdAt" } }
        ],
        responses: {
          200: {
            description: "Paginated resource list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminListResponse" }
              }
            }
          }
        }
      },
      post: {
        tags: ["Admin"],
        summary: "Create admin resource",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/AdminResource" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true }
            }
          }
        },
        responses: {
          201: {
            description: "Created item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminItemResponse" }
              }
            }
          }
        }
      }
    },
    "/api/admin/{resource}/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get admin resource detail",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/AdminResource" },
          { $ref: "#/components/parameters/ObjectId" }
        ],
        responses: {
          200: {
            description: "Resource detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminItemResponse" }
              }
            }
          }
        }
      },
      patch: {
        tags: ["Admin"],
        summary: "Update admin resource",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/AdminResource" },
          { $ref: "#/components/parameters/ObjectId" }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true }
            }
          }
        },
        responses: {
          200: {
            description: "Updated item",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminItemResponse" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete admin resource",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/AdminResource" },
          { $ref: "#/components/parameters/ObjectId" }
        ],
        responses: {
          200: {
            description: "Delete confirmation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deleted: { type: "boolean" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/mobile/home": {
      get: {
        tags: ["Mobile"],
        summary: "Mobile home content",
        responses: {
          200: {
            description: "Home banners, cards, and articles",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          }
        }
      }
    },
    "/api/mobile/exercises": {
      get: {
        tags: ["Mobile"],
        summary: "Active exercises",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "level", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { $ref: "#/components/responses/Items" }
        }
      }
    },
    "/api/mobile/training-plans": {
      get: {
        tags: ["Mobile"],
        summary: "Active training plans",
        parameters: [
          { name: "level", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { $ref: "#/components/responses/Items" }
        }
      }
    },
    "/api/mobile/articles": {
      get: {
        tags: ["Mobile"],
        summary: "Published articles",
        parameters: [{ name: "category", in: "query", schema: { type: "string" } }],
        responses: {
          200: { $ref: "#/components/responses/Items" }
        }
      }
    },
    "/api/mobile/profile": {
      get: {
        tags: ["Mobile"],
        summary: "Authenticated mobile profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Profile, goals, and latest logs",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          }
        }
      },
      patch: {
        tags: ["Mobile"],
        summary: "Update mobile profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true }
            }
          }
        },
        responses: {
          200: {
            description: "Updated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/mobile/reports": {
      get: {
        tags: ["Mobile"],
        summary: "Authenticated report logs",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 30 } }],
        responses: {
          200: {
            description: "Report summary and logs",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true }
              }
            }
          }
        }
      }
    },
    "/api/mobile/logs": {
      post: {
        tags: ["Mobile"],
        summary: "Create or update daily log",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true, required: ["date"] }
            }
          }
        },
        responses: {
          201: {
            description: "Saved daily log",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminItemResponse" }
              }
            }
          }
        }
      }
    },
    "/api/mobile/goals": {
      post: {
        tags: ["Mobile"],
        summary: "Create user goal",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true }
            }
          }
        },
        responses: {
          201: {
            description: "Created goal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminItemResponse" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    parameters: {
      AdminResource: {
        name: "resource",
        in: "path",
        required: true,
        schema: {
          type: "string",
          enum: ["users", "exercises", "training-plans", "articles", "banners", "logs", "goals", "notifications", "settings"]
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
      AuthSuccess: {
        description: "Authenticated user and token",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string" }
              }
            }
          }
        }
      },
      Items: {
        description: "Items response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: { type: "object", additionalProperties: true }
                }
              }
            }
          }
        }
      },
      Error: {
        description: "Error response",
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
          ok: { type: "boolean" },
          service: { type: "string", example: "height-increase-backend" },
          time: { type: "string", format: "date-time" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          measurements: { type: "object", additionalProperties: true }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@height.local" },
          password: { type: "string", format: "password", example: "Admin123!" }
        }
      },
      User: {
        type: "object",
        additionalProperties: true,
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
          status: { type: "string" }
        }
      },
      AdminListResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { type: "object", additionalProperties: true }
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              pages: { type: "integer" }
            }
          }
        }
      },
      AdminItemResponse: {
        type: "object",
        properties: {
          item: { type: "object", additionalProperties: true }
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
};

function swaggerHtml(title, specUrl) {
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

module.exports = {
  openApiDocument,
  swaggerHtml
};

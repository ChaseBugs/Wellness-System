import { Router, type RequestHandler } from "express";
import { getPool } from "../../config/database.js";
import { AuditLogRepository } from "./audit-log-repository.js";
import { ResourceController } from "./resource-controller.js";
import type { ResourceDefinition } from "./resource-definition.js";
import { ResourceRepository } from "./resource-repository.js";
import { ResourceService } from "./resource-service.js";

export function createResourceService(): ResourceService {
  const pool = getPool();
  return new ResourceService(new ResourceRepository(pool), new AuditLogRepository(pool));
}

/**
 * Mounts the standard admin CRUD routes for one resource. `guards` (authenticate + role) run first.
 * Bulk routes are registered before "/:id" so they are not captured as ids.
 */
export function createResourceRouter(definition: ResourceDefinition, guards: RequestHandler[], service = createResourceService()): Router {
  const controller = new ResourceController(definition, service);
  const router = Router();
  router.use(...guards);
  router.get("/", controller.list);
  router.post("/", controller.create);
  if (definition.reviewField) router.patch("/bulk-verify", controller.bulkVerify);
  router.delete("/bulk", controller.bulkDelete);
  router.get("/:id", controller.get);
  router.put("/:id", controller.update);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
}

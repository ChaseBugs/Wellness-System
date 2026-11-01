import { getPool } from "../../../config/database.js";
import type { EntitlementChecker } from "./domain/entitlement-checker.js";
import { PlanRepository } from "./repositories/plan-repository.js";
import { PurchaseRepository } from "./repositories/purchase-repository.js";
import { EntitlementService } from "./services/entitlement-service.js";

/** The one supported way for other modules to obtain entitlement checks (they depend on the port only). */
export function createEntitlementChecker(): EntitlementChecker {
  const pool = getPool();
  return new EntitlementService(new PurchaseRepository(pool), new PlanRepository(pool));
}

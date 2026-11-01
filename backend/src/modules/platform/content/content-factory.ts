import { getPool } from "../../../config/database.js";
import { createEntitlementChecker } from "../subscription/entitlement-factory.js";
import { ContentItemRepository } from "./repositories/content-item-repository.js";
import { ContentItemService } from "./services/content-item-service.js";

/** How app modules read Content Factory items (recipes, guides) without touching its repository. */
export function createContentItemService(): ContentItemService {
  return new ContentItemService(new ContentItemRepository(getPool()), createEntitlementChecker());
}

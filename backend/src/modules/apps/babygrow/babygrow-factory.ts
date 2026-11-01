import { getPool } from "../../../config/database.js";
import { createContentItemService } from "../../platform/content/content-factory.js";
import type { ContentItemService } from "../../platform/content/services/content-item-service.js";
import { UserRepository } from "../../platform/identity/repositories/user-repository.js";
import { ChildRepository } from "./repositories/child-repository.js";
import { ParentProfileRepository } from "./repositories/parent-profile-repository.js";
import { ChildService } from "./services/child-service.js";

/** ChildService owns caregiver access checks, so every BabyGrow service is built on top of it. */
export function createChildService(): ChildService {
  const pool = getPool();
  return new ChildService(new ChildRepository(pool), new UserRepository(pool), new ParentProfileRepository(pool));
}

/** The Content Factory holds BabyGrow's activities, recipes, stories, articles and daily updates. */
export function createLibraryCatalog(): ContentItemService {
  return createContentItemService();
}

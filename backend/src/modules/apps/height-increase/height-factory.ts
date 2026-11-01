import { getPool } from "../../../config/database.js";
import { createContentItemService } from "../../platform/content/content-factory.js";
import { UserRepository } from "../../platform/identity/repositories/user-repository.js";
import { DailyLogRepository } from "./repositories/daily-log-repository.js";
import { GoalRepository } from "./repositories/goal-repository.js";
import { HeightCatalogRepository } from "./repositories/height-catalog-repository.js";
import { HeightMeasurementRepository } from "./repositories/height-measurement-repository.js";
import { HeightProfileRepository } from "./repositories/height-profile-repository.js";
import { HeightCatalogService } from "./services/height-catalog-service.js";
import { HeightProfileService } from "./services/height-profile-service.js";

export function createHeightProfileService(): HeightProfileService {
  const pool = getPool();
  return new HeightProfileService(
    new HeightProfileRepository(pool),
    new DailyLogRepository(pool),
    new GoalRepository(pool),
    new HeightMeasurementRepository(pool),
    new UserRepository(pool)
  );
}

export function createHeightCatalogService(): HeightCatalogService {
  return new HeightCatalogService(new HeightCatalogRepository(getPool()), createContentItemService());
}

import { getPool } from "../../../config/database.js";
import { NutritionReferenceRepository } from "./repositories/nutrition-reference-repository.js";
import { ProfileRepository } from "./repositories/profile-repository.js";
import { DailyTargetService } from "./services/daily-target-service.js";

/** DailyTargetService is shared by the targets, optimizer and intake-analysis endpoints. */
export function createDailyTargetService(): DailyTargetService {
  const pool = getPool();
  return new DailyTargetService(new NutritionReferenceRepository(pool), new ProfileRepository(pool));
}

import { getPool } from "../../../config/database.js";
import { createEntitlementChecker } from "../subscription/entitlement-factory.js";
import { ExerciseRepository } from "./repositories/exercise-repository.js";
import { RoutineRepository } from "./repositories/routine-repository.js";
import { SessionRepository } from "./repositories/session-repository.js";
import { RoutineService } from "./services/routine-service.js";
import { SessionService } from "./services/session-service.js";

export function createRoutineService(): RoutineService {
  const pool = getPool();
  return new RoutineService(new RoutineRepository(pool), new ExerciseRepository(pool), createEntitlementChecker());
}

export function createSessionService(): SessionService {
  return new SessionService(new SessionRepository(getPool()), createRoutineService(), createEntitlementChecker());
}

import { Router } from "express";
import { fixedAppContext } from "../../../middleware/app-context.js";
import { authenticate } from "../../../middleware/auth.js";
import type { WellnessModule } from "../../module.js";
import { createRoutineAppRouter } from "../../platform/routine/routes/routine-app-routes.js";

/**
 * Daily Workout is a brand on top of the shared Routine Engine (routines, timers, sessions, weekly
 * progress). Workout-only features, such as custom routine builders or set/rep logging, go here as
 * their own resources with a 1NN_app_daily_workout.sql migration.
 */
const router = Router();
router.use(fixedAppContext("daily-workout"), authenticate);
router.use(createRoutineAppRouter("daily-workout"));

export const dailyWorkoutModule: WellnessModule = {
  name: "daily-workout",
  kind: "app",
  appCode: "daily-workout",
  basePath: "/apps/daily-workout",
  router,
  description: "Daily Workout: goal-based programs, sessions and weekly progress on the Routine Engine"
};

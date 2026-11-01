import { Router } from "express";
import { fixedAppContext } from "../../../middleware/app-context.js";
import { authenticate } from "../../../middleware/auth.js";
import type { WellnessModule } from "../../module.js";
import { createRoutineAppRouter } from "../../platform/routine/routes/routine-app-routes.js";

/**
 * Daily Yoga reuses the Routine Engine, as the strategy says Yoga should reuse the Workout engine.
 * Pose guides live in the Content Factory (content_type "yoga_pose").
 */
const router = Router();
router.use(fixedAppContext("daily-yoga"), authenticate);
router.use(createRoutineAppRouter("daily-yoga"));

export const dailyYogaModule: WellnessModule = {
  name: "daily-yoga",
  kind: "app",
  appCode: "daily-yoga",
  basePath: "/apps/daily-yoga",
  router,
  description: "Daily Yoga: 10-30 minute classes by level, sessions and streaks on the Routine Engine"
};

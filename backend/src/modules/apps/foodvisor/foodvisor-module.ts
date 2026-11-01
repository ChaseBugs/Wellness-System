import { Router } from "express";
import { fixedAppContext } from "../../../middleware/app-context.js";
import { authenticate } from "../../../middleware/auth.js";
import type { WellnessModule } from "../../module.js";
import { adminRouter } from "./routes/admin-routes.js";
import { dailySummaryRouter } from "./routes/daily-summary-routes.js";
import { foodRouter } from "./routes/food-routes.js";
import { humanTypePublicRouter, humanTypeRouter } from "./routes/human-type-routes.js";
import { mealLogRouter } from "./routes/meal-log-routes.js";
import { nutritionGoalRouter } from "./routes/nutrition-goal-routes.js";
import { nutritionToolsPublicRouter, nutritionToolsRouter } from "./routes/nutrition-tools-routes.js";
import { profileRouter, programPublicRouter } from "./routes/profile-routes.js";

const router = Router();
router.use(fixedAppContext("foodvisor"));

// Admin resources carry their own editor/admin guards.
router.use("/admin", adminRouter);

// Public calculators and catalogs: usable before the user creates an account.
router.use(nutritionToolsPublicRouter);
router.use(programPublicRouter);
router.use(humanTypePublicRouter);

// Everything below belongs to a signed-in user.
router.use(authenticate);
router.use("/foods", foodRouter);
router.use("/meal-logs", mealLogRouter);
router.use("/nutrition-goal", nutritionGoalRouter);
router.use("/daily-summary", dailySummaryRouter);
router.use(nutritionToolsRouter);
router.use(profileRouter);
router.use(humanTypeRouter);

export const foodvisorModule: WellnessModule = {
  name: "foodvisor",
  kind: "app",
  appCode: "foodvisor",
  basePath: "/apps/foodvisor",
  router,
  description:
    "Foodvisor: food composition DB, meal logging, WS/T 578 daily targets, LP diet optimizer, intake analysis, body metrics, Sasang questionnaire and the reference-data admin"
};

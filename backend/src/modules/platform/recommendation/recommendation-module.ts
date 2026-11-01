import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { recommendationRouter } from "./routes/recommendation-routes.js";
import { recommendationRuleRouter } from "./routes/recommendation-rule-routes.js";

// Rule routes first so "/rules" is never captured by "/:ruleId/...".
const router = Router();
router.use(recommendationRuleRouter);
router.use(recommendationRouter);

export const recommendationModule: WellnessModule = {
  name: "recommendation",
  kind: "platform",
  basePath: "/recommendations",
  router,
  description: "Cross-app growth engine: intent-triggered, frequency-capped, opt-out aware recommendations"
};

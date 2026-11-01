import { Router } from "express";
import { fixedAppContext } from "../../../middleware/app-context.js";
import { authenticate } from "../../../middleware/auth.js";
import type { WellnessModule } from "../../module.js";
import { createRoutineAppRouter } from "../../platform/routine/routes/routine-app-routes.js";
import { createHeightCampaignService } from "./height-factory.js";
import { adminRouter } from "./routes/admin-routes.js";
import { catalogRouter } from "./routes/catalog-routes.js";
import { heightMeasurementRouter } from "./routes/height-measurement-routes.js";
import { profileRouter } from "./routes/profile-routes.js";

const router = Router();
router.use(fixedAppContext("height-increase"));

// Admin resources carry their own editor/admin guards.
router.use("/admin", adminRouter);

// Public catalog: home, exercises, training plans, articles, banners.
router.use(catalogRouter);

// Everything below belongs to a signed-in user.
router.use(authenticate);
router.use("/measurements", heightMeasurementRouter);
router.use(profileRouter);
// Posture and activity programs: /routines, /sessions, /progress from the shared Routine Engine.
router.use(createRoutineAppRouter("height-increase"));

const campaignService = createHeightCampaignService();

export const heightIncreaseModule: WellnessModule = {
  name: "height-increase",
  kind: "app",
  appCode: "height-increase",
  basePath: "/apps/height-increase",
  router,
  description:
    "HeightIncrease: measurements and observed trend, daily logs, goals, reports, banners, articles, posture/activity programs and the admin",
  // Scheduled push campaigns (height.notifications with a scheduled_at).
  jobs: [{ name: "campaigns", run: (now) => campaignService.sendDue(now) }]
};

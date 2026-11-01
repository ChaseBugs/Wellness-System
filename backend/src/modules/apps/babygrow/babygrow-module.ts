import { Router } from "express";
import { fixedAppContext } from "../../../middleware/app-context.js";
import { authenticate } from "../../../middleware/auth.js";
import type { WellnessModule } from "../../module.js";
import { adminRouter } from "./routes/admin-routes.js";
import { careLogRouter } from "./routes/care-log-routes.js";
import { careViewRouter } from "./routes/care-view-routes.js";
import { childRouter } from "./routes/child-routes.js";
import { growthRecordRouter } from "./routes/growth-record-routes.js";
import { childLibraryRouter, libraryRouter } from "./routes/library-routes.js";
import { childMilestoneRouter, milestoneDefinitionRouter } from "./routes/milestone-routes.js";
import { profileRouter } from "./routes/profile-routes.js";

const router = Router();
router.use(fixedAppContext("babygrow"));

// Admin resources carry their own editor/admin guards.
router.use("/admin", adminRouter);

// Everything below belongs to a signed-in caregiver.
router.use(authenticate);
router.use("/profile", profileRouter);
router.use("/milestone-definitions", milestoneDefinitionRouter);
router.use(libraryRouter);
// Nested child resources first so they are not shadowed by the child router's "/:childId".
router.use("/children/:childId/growth-records", growthRecordRouter);
router.use("/children/:childId/care-logs", careLogRouter);
router.use("/children/:childId/milestones", childMilestoneRouter);
router.use("/children/:childId", careViewRouter, childLibraryRouter);
router.use("/children", childRouter);

export const babygrowModule: WellnessModule = {
  name: "babygrow",
  kind: "app",
  appCode: "babygrow",
  basePath: "/apps/babygrow",
  router,
  description:
    "BabyGrow (TalentBaby): child profiles, caregiver sharing, growth, care logs, milestones, activities and daily plan, recipes, articles, stories and the content admin"
};

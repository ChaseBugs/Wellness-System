import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { entitlementRouter } from "./routes/entitlement-routes.js";
import { planRouter } from "./routes/plan-routes.js";
import { purchaseRouter } from "./routes/purchase-routes.js";

const router = Router();
router.use(planRouter);
router.use(entitlementRouter);
router.use(purchaseRouter);

export const subscriptionModule: WellnessModule = {
  name: "subscription",
  kind: "platform",
  basePath: "/subscriptions",
  router,
  description: "App Pro and Wellness Pass plans, server-side purchase verification, entitlements and restore"
};

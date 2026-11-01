import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { eventRouter } from "./routes/event-routes.js";
import { kpiRouter } from "./routes/kpi-routes.js";

const router = Router();
router.use(eventRouter);
router.use(kpiRouter);

export const analyticsModule: WellnessModule = {
  name: "analytics",
  kind: "platform",
  basePath: "/analytics",
  router,
  description: "Shared event stream, launch KPIs and retention cohorts"
};

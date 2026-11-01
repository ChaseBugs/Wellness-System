import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { deviceRouter } from "./routes/device-routes.js";
import { reminderRouter } from "./routes/reminder-routes.js";

const router = Router();
router.use(deviceRouter);
router.use(reminderRouter);

export const notificationModule: WellnessModule = {
  name: "notification",
  kind: "platform",
  basePath: "/notifications",
  router,
  description: "Push device registry and per-app reminder schedules"
};

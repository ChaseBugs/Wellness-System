import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { createPushDispatchService } from "./push-factory.js";
import { deviceRouter } from "./routes/device-routes.js";
import { pushRouter } from "./routes/push-routes.js";
import { reminderRouter } from "./routes/reminder-routes.js";

const router = Router();
router.use(pushRouter);
router.use(deviceRouter);
router.use(reminderRouter);

const pushService = createPushDispatchService();

export const notificationModule: WellnessModule = {
  name: "notification",
  kind: "platform",
  basePath: "/notifications",
  router,
  description: "Push device registry, per-app reminder schedules and push delivery",
  jobs: [{ name: "reminders", run: (now) => pushService.dispatchDueReminders(now) }]
};

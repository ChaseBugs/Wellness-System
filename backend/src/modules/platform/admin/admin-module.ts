import type { WellnessModule } from "../../module.js";
import { platformAdminRouter } from "./routes/platform-admin-routes.js";

export const adminModule: WellnessModule = {
  name: "admin",
  kind: "platform",
  basePath: "/admin",
  router: platformAdminRouter,
  description: "Unified admin: accounts and roles, purchases, plans, audit log and the platform overview (app admins live under /apps/<app>/admin)"
};

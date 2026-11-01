import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { appRouter } from "./routes/app-routes.js";
import { authRouter } from "./routes/auth-routes.js";
import { consentRouter } from "./routes/consent-routes.js";
import { userRouter } from "./routes/user-routes.js";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/catalog", appRouter);
router.use("/consents", consentRouter);

export const identityModule: WellnessModule = {
  name: "identity",
  kind: "platform",
  basePath: "",
  router,
  description: "One Wellness account, app installs and cross-app consents"
};

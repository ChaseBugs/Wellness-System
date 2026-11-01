import { Router } from "express";
import type { WellnessModule } from "../../module.js";
import { exerciseRouter } from "./routes/exercise-routes.js";
import { routineRouter } from "./routes/routine-routes.js";

// Editor endpoints only. User-facing routine APIs are mounted inside each app module via createRoutineAppRouter.
const router = Router();
router.use("/exercises", exerciseRouter);
router.use("/routines", routineRouter);

export const routineModule: WellnessModule = {
  name: "routine",
  kind: "platform",
  basePath: "/routine",
  router,
  description: "Routine Engine: exercises, routines, sessions and progress shared by workout/yoga/posture apps"
};

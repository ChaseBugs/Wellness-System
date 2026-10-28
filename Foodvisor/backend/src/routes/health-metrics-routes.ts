import { Router } from "express";
import { HealthMetricsController } from "../controllers/health-metrics-controller.js";
import { validate } from "../middleware/validate.js";
import { calculateHealthMetricsValidation } from "../validators/health-metrics-validator.js";

export const healthMetricsRouter = Router();
const healthMetricsController = new HealthMetricsController();

healthMetricsRouter.post(
  "/calculate",
  validate(calculateHealthMetricsValidation),
  healthMetricsController.calculate
);

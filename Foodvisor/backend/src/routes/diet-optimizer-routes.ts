import { Router } from "express";
import { DietOptimizerController } from "../controllers/diet-optimizer-controller.js";

export const dietOptimizerRouter = Router();
const dietOptimizerController = new DietOptimizerController();

dietOptimizerRouter.post("/optimize", dietOptimizerController.optimize);

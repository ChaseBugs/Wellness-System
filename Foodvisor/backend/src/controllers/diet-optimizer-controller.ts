import type { NextFunction, Request, Response } from "express";
import { optimizeDiet } from "../services/dietOptimizer.js";
import logger from "../utils/logger.js";
import { sendSuccess } from "../utils/response.js";

export class DietOptimizerController {
  optimize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await optimizeDiet(req.body || {});
      logger.food.optimize(Boolean(result.feasible), {
        dataSource: result.feasible ? result.dataSource : undefined,
        candidateCount: result.candidateCount
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestPath = req.originalUrl || req.path;

  logger.api.request(req.method, requestPath, {
    ip: req.ip,
    userAgent: req.get("user-agent")
  });

  res.on("finish", () => {
    logger.api.response(req.method, requestPath, res.statusCode, {
      duration: `${Date.now() - startTime}ms`,
      ip: req.ip
    });
  });

  next();
}

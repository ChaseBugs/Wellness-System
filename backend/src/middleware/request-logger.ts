import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestPath = req.originalUrl || req.path;

  logger.api.request(req.method, requestPath, {
    reqId: req.id,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    appCode: req.get("x-app-code")
  });

  res.on("finish", () => {
    logger.api.response(req.method, requestPath, res.statusCode, {
      reqId: req.id,
      duration: `${Date.now() - startTime}ms`,
      userId: req.user?.id
    });
  });

  next();
}

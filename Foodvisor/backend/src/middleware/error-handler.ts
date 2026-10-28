import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";

function classify(error: unknown): { statusCode: number; code: string; message: string; details?: unknown } {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, code: error.code, message: error.message, details: error.details };
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const details: Record<string, string> = {};
    for (const [field, e] of Object.entries(error.errors)) {
      details[field] = (e as mongoose.Error.ValidatorError).message;
    }
    return { statusCode: 400, code: "VALIDATION_ERROR", message: "Validation failed", details };
  }
  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 400, code: "INVALID_ID", message: `Invalid ${error.path}: ${error.value}` };
  }
  if (error instanceof SyntaxError && (error as any).status === 400 && "body" in (error as any)) {
    return { statusCode: 400, code: "BAD_REQUEST", message: "Invalid JSON body" };
  }
  return {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: error instanceof Error ? error.message : "Unexpected error"
  };
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const { statusCode, code, message, details } = classify(error);

  logger.api.error(req.method, req.path, message, {
    reqId: req.id,
    statusCode,
    code,
    stack: error instanceof Error ? error.stack : undefined
  });

  sendError(res, code, message, statusCode, details, req.id);
}

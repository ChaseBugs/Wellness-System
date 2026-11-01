import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";

interface PgError {
  code: string;
  detail?: string;
  constraint?: string;
}

function isPgError(error: unknown): error is PgError {
  return typeof error === "object" && error !== null && typeof (error as PgError).code === "string" && "severity" in error;
}

function classify(error: unknown): { statusCode: number; code: string; message: string; details?: unknown } {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, code: error.code, message: error.message, details: error.details };
  }
  if (isPgError(error)) {
    // Map constraint violations to client errors so the API never leaks a 500 for bad input.
    if (error.code === "23505") return { statusCode: 409, code: "CONFLICT", message: "Resource already exists", details: { constraint: error.constraint } };
    if (error.code === "23503") return { statusCode: 400, code: "INVALID_REFERENCE", message: "Referenced resource does not exist", details: { constraint: error.constraint } };
    if (error.code === "23514") return { statusCode: 400, code: "VALIDATION_ERROR", message: "Value violates a data rule", details: { constraint: error.constraint } };
    if (error.code === "22P02") return { statusCode: 400, code: "INVALID_ID", message: "Invalid identifier or value format" };
  }
  if (error instanceof SyntaxError && (error as SyntaxError & { status?: number }).status === 400 && "body" in error) {
    return { statusCode: 400, code: "BAD_REQUEST", message: "Invalid JSON body" };
  }
  return {
    statusCode: 500,
    code: "INTERNAL_ERROR",
    message: env.isProduction ? "Unexpected error" : error instanceof Error ? error.message : "Unexpected error"
  };
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const { statusCode, code, message, details } = classify(error);

  const meta = {
    reqId: req.id,
    statusCode,
    code,
    userId: req.user?.id,
    stack: statusCode >= 500 && error instanceof Error ? error.stack : undefined
  };
  if (statusCode >= 500) logger.api.error(req.method, req.originalUrl, error instanceof Error ? error.message : message, meta);
  else logger.warnWithEmoji("⚠️", `${req.method} ${req.originalUrl} - ${message}`, "API", meta);

  sendError(res, code, message, statusCode, details, req.id);
}

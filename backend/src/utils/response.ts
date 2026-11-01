import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta: Record<string, unknown> = {}) {
  res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown,
  reqId?: string
) {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(reqId ? { reqId } : {})
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}

import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types/express.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import { verifyAccessToken } from "../utils/tokens.js";

function readBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

function attachUser(req: Request, token: string): boolean {
  try {
    const { userId, role } = verifyAccessToken(token);
    req.user = { id: userId, role };
    return true;
  } catch {
    logger.auth.unauthorized("Invalid or expired access token", { path: req.originalUrl, reqId: req.id });
    return false;
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }
  next(attachUser(req, token) ? undefined : new UnauthorizedError("Invalid or expired access token"));
}

/** Attaches req.user when a valid token is present; anonymous requests pass through (e.g. analytics). */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) {
    next();
    return;
  }
  next(attachUser(req, token) ? undefined : new UnauthorizedError("Invalid or expired access token"));
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Requires role: ${roles.join(" or ")}`));
      return;
    }
    next();
  };
}

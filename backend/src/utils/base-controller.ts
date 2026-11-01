import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AppCode } from "../config/app-catalog.js";
import { UnauthorizedError, ValidationError } from "./errors.js";

type Handler = (req: Request, res: Response) => Promise<void>;

/**
 * Shared controller plumbing (pattern from TalentBaby's BaseController): `handle` forwards every
 * thrown error to the global error handler, so controller bodies stay free of try/catch noise.
 */
export abstract class BaseController {
  protected handle(fn: Handler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await fn(req, res);
      } catch (error) {
        next(error);
      }
    };
  }

  protected userId(req: Request): string {
    const id = req.user?.id;
    if (!id) throw new UnauthorizedError();
    return id;
  }

  protected appCode(req: Request): AppCode {
    if (!req.appCode) throw new ValidationError("X-App-Code header is required");
    return req.appCode;
  }

  protected param(req: Request, name: string): string {
    return String(req.params[name]);
  }

  protected query(req: Request, name: string): string | undefined {
    const value = req.query[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  }
}

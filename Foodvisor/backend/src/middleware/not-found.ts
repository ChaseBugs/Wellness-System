import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError(`${req.method} ${req.path}`));
}

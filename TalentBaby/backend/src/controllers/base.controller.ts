import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ok, created } from '../utils/response';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export abstract class BaseController {
  /** Wraps an async handler — catches errors and forwards to express error middleware */
  protected handle(fn: Handler) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await fn(req, res, next);
      } catch (err: unknown) {
        if (err instanceof AppError) {
          next(err);
        } else if (err && typeof err === 'object' && 'status' in err) {
          // Legacy pattern: { status, message }
          const e = err as { status: number; message: string };
          next(new AppError(e.message, e.status));
        } else {
          next(err);
        }
      }
    };
  }

  protected ok      = ok;
  protected created = created;
  protected AppError = AppError;

  protected userId(req: Request): number {
    const id = req.user?.id;
    if (!id) throw AppError.unauthorized();
    return id;
  }

  protected intParam(req: Request, name: string): number {
    const val = parseInt(req.params[name], 10);
    if (isNaN(val)) throw AppError.badRequest(`Invalid parameter: ${name}`);
    return val;
  }

  protected intQuery(req: Request, name: string, fallback?: number): number | undefined {
    const raw = req.query[name];
    if (raw === undefined) return fallback;
    const val = parseInt(raw as string, 10);
    return isNaN(val) ? fallback : val;
  }
}

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: AppError = new Error('Validation failed');
    error.statusCode = 400;
    error.isOperational = true;
    return next(error);
  }
  next();
};

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(msg: string)  { return new AppError(msg, 400); }
  static unauthorized(msg = 'Authentication required.')   { return new AppError(msg, 401); }
  static forbidden(msg = 'Access denied.')                { return new AppError(msg, 403); }
  static notFound(msg = 'Resource not found.')            { return new AppError(msg, 404); }
  static conflict(msg: string)                            { return new AppError(msg, 409); }
  static internal(msg = 'Internal server error.')         { return new AppError(msg, 500); }
}

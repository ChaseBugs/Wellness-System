export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = "INTERNAL_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT", details?: unknown) {
    super(message, 409, code, details);
  }
}

/** Thrown when a premium feature is requested without an App Pro or Wellness Pass entitlement. */
export class EntitlementRequiredError extends AppError {
  constructor(appCode: string) {
    super(`An active subscription for ${appCode} is required`, 403, "ENTITLEMENT_REQUIRED", { appCode });
  }
}

/** Thrown when consent for a cross-app data exchange has not been granted. */
export class ConsentRequiredError extends AppError {
  constructor(sourceApp: string, targetApp: string, scope: string) {
    super("Data-sharing consent has not been granted", 403, "CONSENT_REQUIRED", { sourceApp, targetApp, scope });
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string) {
    super(message, 501, "NOT_IMPLEMENTED");
  }
}

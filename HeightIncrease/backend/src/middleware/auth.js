const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const HttpError = require("../utils/httpError");
const asyncHandler = require("./asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new HttpError(401, "Authentication token required");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("+passwordHash");

    if (!user || user.status !== "active") {
      throw new HttpError(401, "Invalid or inactive user");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Invalid authentication token");
  }
});

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new HttpError(403, "Admin access required"));
  }

  next();
}

module.exports = { authenticate, requireAdmin };

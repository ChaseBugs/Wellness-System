import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getPool } from "../../../../config/database.js";
import { env } from "../../../../config/env.js";
import { optionalAppContext } from "../../../../middleware/app-context.js";
import { validate } from "../../../../middleware/validate.js";
import { AuthController } from "../controllers/auth-controller.js";
import { AppInstallRepository } from "../repositories/app-install-repository.js";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository.js";
import { UserRepository } from "../repositories/user-repository.js";
import { AuthService } from "../services/auth-service.js";
import { loginValidation, refreshValidation, registerValidation } from "../validators/auth-validator.js";

const pool = getPool();
const authService = new AuthService(new UserRepository(pool), new RefreshTokenRepository(pool), new AppInstallRepository(pool));
const authController = new AuthController(authService);

// Slows credential stuffing; generous enough that shared mobile carrier IPs are not locked out.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProduction ? 20 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many attempts, try again later" } }
});

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Identity]
 *     summary: Create one Wellness account usable in every app
 *     parameters: [{ $ref: "#/components/parameters/AppCodeOptional" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               displayName: { type: string }
 *               locale: { type: string, example: en }
 *               country: { type: string, example: US }
 *               timezone: { type: string, example: Asia/Seoul }
 *     responses:
 *       201: { description: Account and tokens }
 *       409: { description: Email already registered }
 * /auth/login:
 *   post:
 *     tags: [Identity]
 *     summary: Sign in and receive an access + refresh token pair
 *     parameters: [{ $ref: "#/components/parameters/AppCodeOptional" }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties: { email: { type: string }, password: { type: string } }
 *     responses:
 *       200: { description: Account and tokens }
 *       401: { description: Invalid credentials }
 * /auth/refresh:
 *   post:
 *     tags: [Identity]
 *     summary: Rotate the refresh token and get a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [refreshToken], properties: { refreshToken: { type: string } } }
 *     responses:
 *       200: { description: New token pair }
 * /auth/logout:
 *   post:
 *     tags: [Identity]
 *     summary: Revoke a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [refreshToken], properties: { refreshToken: { type: string } } }
 *     responses:
 *       204: { description: Revoked }
 */
authRouter.post("/register", credentialLimiter, optionalAppContext, validate(registerValidation), authController.register);
authRouter.post("/login", credentialLimiter, optionalAppContext, validate(loginValidation), authController.login);
authRouter.post("/refresh", optionalAppContext, validate(refreshValidation), authController.refresh);
authRouter.post("/logout", validate(refreshValidation), authController.logout);

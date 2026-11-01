import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../types/express.js";
import { UnauthorizedError } from "./errors.js";

interface AccessTokenClaims {
  sub: string;
  role: UserRole;
  typ: "access";
}

export function signAccessToken(userId: string, role: UserRole): string {
  const claims: AccessTokenClaims = { sub: userId, role, typ: "access" };
  return jwt.sign(claims, env.jwtSecret, { expiresIn: env.jwtAccessTtlSeconds });
}

export function verifyAccessToken(token: string): { userId: string; role: UserRole } {
  const claims = jwt.verify(token, env.jwtSecret) as Partial<AccessTokenClaims>;
  if (claims.typ !== "access" || typeof claims.sub !== "string" || !claims.role) {
    throw new UnauthorizedError("Invalid access token");
  }
  return { userId: claims.sub, role: claims.role };
}

/** Opaque refresh token; only its SHA-256 hash is persisted. */
export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

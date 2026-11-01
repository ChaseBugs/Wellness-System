import type { AppCode } from "../../../../config/app-catalog.js";
import type { UserResponse } from "./user.js";

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  appCode: AppCode | null;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBy: string | null;
  createdAt: Date;
}

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  appCode: AppCode | null;
  expiresAt: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
  locale?: string;
  country?: string;
  timezone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  tokenType: "Bearer";
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

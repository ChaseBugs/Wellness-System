import type { AppCode } from "../../../../config/app-catalog.js";
import type { UserRole } from "../../../../types/express.js";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  locale: string;
  country: string | null;
  timezone: string;
  role: UserRole;
  marketingOptIn: boolean;
  crossAppRecommendations: boolean;
  signupApp: AppCode | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName?: string;
  locale?: string;
  country?: string;
  timezone?: string;
  signupApp?: AppCode;
}

export interface UpdateUserInput {
  displayName?: string | null;
  locale?: string;
  country?: string | null;
  timezone?: string;
  marketingOptIn?: boolean;
  crossAppRecommendations?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  country: string | null;
  timezone: string;
  role: UserRole;
  marketingOptIn: boolean;
  crossAppRecommendations: boolean;
  createdAt: Date;
}

import type { AppCode } from "../config/app-catalog.js";

export type UserRole = "user" | "editor" | "admin";

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: AuthUser;
      appCode?: AppCode;
    }
  }
}

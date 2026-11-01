import type { CreateRefreshTokenInput, RefreshToken } from "../models/auth.js";

export interface IRefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<RefreshToken>;
  findByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string, replacedBy?: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

import bcrypt from "bcryptjs";
import type { AppCode } from "../../../../config/app-catalog.js";
import { env } from "../../../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../../../utils/errors.js";
import logger from "../../../../utils/logger.js";
import { generateRefreshToken, hashToken, signAccessToken } from "../../../../utils/tokens.js";
import type { IAppInstallRepository } from "../domain/IAppInstallRepository.js";
import type { IRefreshTokenRepository } from "../domain/IRefreshTokenRepository.js";
import type { IUserRepository } from "../domain/IUserRepository.js";
import type { AuthResponse, AuthTokens, LoginInput, RegisterInput } from "../models/auth.js";
import type { User } from "../models/user.js";
import { toUserResponse } from "./user-service.js";

// Compared against when the email is unknown so response time doesn't reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync("wellness-timing-guard", 10);

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private appInstallRepository: IAppInstallRepository
  ) {}

  async register(input: RegisterInput, appCode?: AppCode): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      logger.auth.signup(input.email, false, { reason: "email_taken" });
      throw new ConflictError("An account with this email already exists", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);
    const user = await this.userRepository.create({
      email: input.email.trim(),
      passwordHash,
      displayName: input.displayName,
      locale: input.locale,
      country: input.country,
      timezone: input.timezone,
      signupApp: appCode
    });
    if (appCode) await this.appInstallRepository.touch(user.id, appCode);

    logger.auth.signup(user.email, true, { userId: user.id, appCode });
    return { user: toUserResponse(user), tokens: await this.issueTokens(user, appCode) };
  }

  async login(input: LoginInput, appCode?: AppCode): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) {
      logger.auth.login(input.email, false, { appCode });
      throw new UnauthorizedError("Invalid email or password");
    }

    await this.userRepository.recordLogin(user.id);
    if (appCode) await this.appInstallRepository.touch(user.id, appCode);

    logger.auth.login(user.email, true, { userId: user.id, appCode });
    return { user: toUserResponse(user), tokens: await this.issueTokens(user, appCode) };
  }

  /** Rotates the refresh token. Presenting an already-rotated token revokes the whole family (theft signal). */
  async refresh(refreshToken: string, appCode?: AppCode): Promise<AuthTokens> {
    const stored = await this.refreshTokenRepository.findByHash(hashToken(refreshToken));
    if (!stored) throw new UnauthorizedError("Invalid refresh token");

    if (stored.revokedAt) {
      await this.refreshTokenRepository.revokeAllForUser(stored.userId);
      logger.auth.unauthorized("Refresh token reuse detected; all sessions revoked", { userId: stored.userId });
      throw new UnauthorizedError("Refresh token has been revoked");
    }
    if (stored.expiresAt.getTime() <= Date.now()) throw new UnauthorizedError("Refresh token has expired");

    const user = await this.userRepository.findById(stored.userId);
    if (!user) throw new UnauthorizedError("Account no longer exists");

    const tokens = await this.issueTokens(user, appCode ?? stored.appCode ?? undefined, stored.id);
    logger.auth.token("refreshed", { userId: user.id });
    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const stored = await this.refreshTokenRepository.findByHash(hashToken(refreshToken));
    if (stored) await this.refreshTokenRepository.revoke(stored.id);
    logger.auth.logout(stored?.userId ?? "unknown");
  }

  private async issueTokens(user: User, appCode?: AppCode, rotatedFrom?: string): Promise<AuthTokens> {
    const refreshToken = generateRefreshToken();
    const created = await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      appCode: appCode ?? null,
      expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000)
    });
    if (rotatedFrom) await this.refreshTokenRepository.revoke(rotatedFrom, created.id);

    return {
      tokenType: "Bearer",
      accessToken: signAccessToken(user.id, user.role),
      expiresIn: env.jwtAccessTtlSeconds,
      refreshToken
    };
  }
}

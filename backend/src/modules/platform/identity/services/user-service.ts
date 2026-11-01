import { getAppDefinition } from "../../../../config/app-catalog.js";
import { NotFoundError } from "../../../../utils/errors.js";
import logger from "../../../../utils/logger.js";
import type { IAppInstallRepository } from "../domain/IAppInstallRepository.js";
import type { IRefreshTokenRepository } from "../domain/IRefreshTokenRepository.js";
import type { IUserRepository } from "../domain/IUserRepository.js";
import type { AppInstallResponse } from "../models/app.js";
import type { UpdateUserInput, User, UserResponse } from "../models/user.js";

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    locale: user.locale,
    country: user.country,
    timezone: user.timezone,
    role: user.role,
    marketingOptIn: user.marketingOptIn,
    crossAppRecommendations: user.crossAppRecommendations,
    createdAt: user.createdAt
  };
}

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private appInstallRepository: IAppInstallRepository,
    private refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User");
    return toUserResponse(user);
  }

  async updateMe(userId: string, input: UpdateUserInput): Promise<UserResponse> {
    const user = await this.userRepository.update(userId, input);
    if (!user) throw new NotFoundError("User");
    logger.user.update(userId, undefined, { fields: Object.keys(input) });
    return toUserResponse(user);
  }

  /** Account deletion is required by both app stores and erases the user's data in every app. */
  async deleteMe(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId);
    const deleted = await this.userRepository.delete(userId);
    if (!deleted) throw new NotFoundError("User");
    logger.user.profile(userId, "deleted");
  }

  async listApps(userId: string): Promise<AppInstallResponse[]> {
    const installs = await this.appInstallRepository.listForUser(userId);
    return installs.map((install) => ({
      appCode: install.appCode,
      name: getAppDefinition(install.appCode).name,
      firstSeenAt: install.firstSeenAt,
      lastSeenAt: install.lastSeenAt
    }));
  }
}

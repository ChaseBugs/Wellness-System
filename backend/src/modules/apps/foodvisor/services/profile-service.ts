import type { IProfileRepository } from "../domain/IProfileRepository.js";
import type { FoodvisorProfile, ProfileResponse, UpsertProfileInput } from "../models/profile.js";

export class ProfileService {
  constructor(private profileRepository: IProfileRepository) {}

  /** Returns null until the user completes onboarding. */
  async get(userId: string): Promise<ProfileResponse | null> {
    const profile = await this.profileRepository.findByUser(userId);
    return profile ? this.toResponse(profile) : null;
  }

  async upsert(userId: string, input: UpsertProfileInput): Promise<ProfileResponse> {
    return this.toResponse(await this.profileRepository.upsert(userId, input));
  }

  private toResponse(profile: FoodvisorProfile): ProfileResponse {
    const { userId: _userId, createdAt: _createdAt, ...response } = profile;
    return response;
  }
}

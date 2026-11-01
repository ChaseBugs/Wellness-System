import { NotFoundError } from "../../../../utils/errors.js";
import type { AccountStore } from "../domain/babygrow-ports.js";
import type { IParentProfileRepository } from "../domain/IParentProfileRepository.js";
import type { ParentProfileResponse, UpdateParentProfileInput } from "../models/parent-profile.js";

/** The caregiver's profile screen: account name/language from identity plus BabyGrow details. */
export class ParentProfileService {
  constructor(
    private parentProfiles: IParentProfileRepository,
    private accounts: AccountStore
  ) {}

  async get(userId: string): Promise<ParentProfileResponse> {
    const [account, profile] = await Promise.all([this.accounts.findById(userId), this.parentProfiles.findByUser(userId)]);
    if (!account) throw new NotFoundError("Account");
    return {
      id: account.id,
      email: account.email,
      fullName: account.displayName,
      languagePreference: account.locale,
      phoneNumber: profile?.phoneNumber ?? null,
      gender: profile?.gender ?? null,
      birthdate: profile?.birthdate ?? null,
      profilePictureUrl: profile?.avatarUrl ?? null,
      relationToBaby: profile?.relationToBaby ?? null,
      activeChildId: profile?.activeChildId ?? null
    };
  }

  async update(userId: string, input: UpdateParentProfileInput): Promise<ParentProfileResponse> {
    const { fullName, languagePreference, ...details } = input;
    if (fullName !== undefined || languagePreference !== undefined) {
      await this.accounts.update(userId, { displayName: fullName, locale: languagePreference });
    }
    if (Object.values(details).some((value) => value !== undefined)) await this.parentProfiles.upsert(userId, details);
    return this.get(userId);
  }
}

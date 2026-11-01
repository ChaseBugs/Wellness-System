import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../../../../utils/errors.js";
import type { UserLookup } from "../domain/babygrow-ports.js";
import type { IChildRepository } from "../domain/IChildRepository.js";
import type { IParentProfileRepository } from "../domain/IParentProfileRepository.js";
import type {
  AddCaregiverInput,
  Caregiver,
  CaregiverResponse,
  CaregiverRole,
  ChildResponse,
  ChildWithRole,
  CreateChildInput,
  UpdateChildInput
} from "../models/child.js";

const ROLE_RANK: Record<CaregiverRole, number> = { viewer: 0, editor: 1, owner: 2 };

export function ageInMonths(birthDate: string, on = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  let months = (on.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (on.getUTCMonth() - birth.getUTCMonth());
  if (on.getUTCDate() < birth.getUTCDate()) months--;
  return Math.max(0, months);
}

/**
 * Children are shared between caregivers (parents, grandparents, nannies). Every read and write
 * in this module goes through `requireAccess`, and unknown or unshared children are reported as
 * not found so their existence is never revealed.
 */
export class ChildService {
  constructor(
    private childRepository: IChildRepository,
    private userLookup: UserLookup,
    private parentProfiles: IParentProfileRepository
  ) {}

  async requireAccess(userId: string, childId: string, minimum: CaregiverRole): Promise<ChildWithRole> {
    const child = await this.childRepository.findForUser(childId, userId);
    if (!child) throw new NotFoundError("Child");
    if (ROLE_RANK[child.role] < ROLE_RANK[minimum]) throw new ForbiddenError(`Requires caregiver role: ${minimum}`);
    return child;
  }

  async list(userId: string): Promise<ChildResponse[]> {
    const [children, activeId] = await Promise.all([this.childRepository.listForUser(userId), this.activeChildId(userId)]);
    return children.map((child) => this.toResponse(child, activeId));
  }

  async get(userId: string, childId: string): Promise<ChildResponse> {
    return this.toResponse(await this.requireAccess(userId, childId, "viewer"), await this.activeChildId(userId));
  }

  async create(userId: string, input: CreateChildInput): Promise<ChildResponse> {
    this.assertBirthDate(input.birthDate);
    const child = await this.childRepository.create(userId, input);
    // The first child a caregiver adds becomes the one the app shows by default.
    let activeId = await this.activeChildId(userId);
    if (!activeId) {
      await this.parentProfiles.setActiveChild(userId, child.id);
      activeId = child.id;
    }
    return this.toResponse(child, activeId);
  }

  /** The child the app opens on: the saved choice, or the most recently born child as a fallback. */
  async getActive(userId: string): Promise<ChildResponse | null> {
    const activeId = await this.activeChildId(userId);
    if (activeId) {
      const child = await this.childRepository.findForUser(activeId, userId);
      if (child) return this.toResponse(child, activeId);
    }
    const [first] = await this.childRepository.listForUser(userId);
    return first ? this.toResponse(first, first.id) : null;
  }

  async setActive(userId: string, childId: string): Promise<ChildResponse> {
    const child = await this.requireAccess(userId, childId, "viewer");
    await this.parentProfiles.setActiveChild(userId, childId);
    return this.toResponse(child, childId);
  }

  private async activeChildId(userId: string): Promise<string | null> {
    return (await this.parentProfiles.findByUser(userId))?.activeChildId ?? null;
  }

  async update(userId: string, childId: string, input: UpdateChildInput): Promise<ChildResponse> {
    await this.requireAccess(userId, childId, "editor");
    if (input.birthDate) this.assertBirthDate(input.birthDate);
    await this.childRepository.update(childId, input);
    return this.get(userId, childId);
  }

  async delete(userId: string, childId: string): Promise<void> {
    await this.requireAccess(userId, childId, "owner");
    await this.childRepository.delete(childId);
  }

  async listCaregivers(userId: string, childId: string): Promise<CaregiverResponse[]> {
    await this.requireAccess(userId, childId, "viewer");
    return (await this.childRepository.listCaregivers(childId)).map((caregiver) => this.toCaregiverResponse(caregiver));
  }

  /** Caregiver sharing: the invitee must already have a Wellness account. */
  async addCaregiver(userId: string, childId: string, input: AddCaregiverInput): Promise<CaregiverResponse[]> {
    await this.requireAccess(userId, childId, "owner");
    const invitee = await this.userLookup.findByEmail(input.email);
    if (!invitee) throw new NotFoundError("Account with that email");
    if (invitee.id === userId) throw new ConflictError("You already own this child profile", "ALREADY_CAREGIVER");
    await this.childRepository.upsertCaregiver(childId, invitee.id, input.role, userId);
    return this.listCaregivers(userId, childId);
  }

  async removeCaregiver(userId: string, childId: string, caregiverUserId: string): Promise<void> {
    // Owners can remove anyone; any caregiver can remove themselves.
    await this.requireAccess(userId, childId, caregiverUserId === userId ? "viewer" : "owner");
    const removed = await this.childRepository.removeCaregiver(childId, caregiverUserId);
    if (!removed) throw new NotFoundError("Caregiver (owners cannot be removed)");
  }

  private assertBirthDate(birthDate: string): void {
    const date = new Date(`${birthDate}T00:00:00Z`);
    const today = new Date();
    if (Number.isNaN(date.getTime()) || date.getTime() > today.getTime()) {
      throw new ValidationError("birthDate must be a valid date that is not in the future");
    }
    if (today.getUTCFullYear() - date.getUTCFullYear() > 18) throw new ValidationError("BabyGrow tracks children up to 18 years");
  }

  private toResponse(child: ChildWithRole, activeChildId: string | null): ChildResponse {
    return {
      id: child.id,
      name: child.name,
      birthDate: child.birthDate,
      sex: child.sex,
      birthWeightKg: child.birthWeightKg === null ? null : Number(child.birthWeightKg),
      birthHeightCm: child.birthHeightCm === null ? null : Number(child.birthHeightCm),
      avatarUrl: child.avatarUrl,
      ageMonths: ageInMonths(child.birthDate),
      myRole: child.role,
      isActive: child.id === activeChildId
    };
  }

  private toCaregiverResponse(caregiver: Caregiver): CaregiverResponse {
    return {
      userId: caregiver.userId,
      email: caregiver.email,
      displayName: caregiver.displayName,
      role: caregiver.role,
      addedAt: caregiver.createdAt
    };
  }
}

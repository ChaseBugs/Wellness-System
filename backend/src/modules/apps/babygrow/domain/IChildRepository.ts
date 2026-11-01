import type {
  Caregiver,
  CaregiverRole,
  ChildWithRole,
  CreateChildInput,
  UpdateChildInput
} from "../models/child.js";

export interface IChildRepository {
  listForUser(userId: string): Promise<ChildWithRole[]>;
  /** Returns the child only when `userId` is one of its caregivers. */
  findForUser(childId: string, userId: string): Promise<ChildWithRole | null>;
  /** Creates the child and its owner caregiver row in one transaction. */
  create(userId: string, input: CreateChildInput): Promise<ChildWithRole>;
  update(childId: string, input: UpdateChildInput): Promise<void>;
  delete(childId: string): Promise<void>;
  listCaregivers(childId: string): Promise<Caregiver[]>;
  upsertCaregiver(childId: string, userId: string, role: CaregiverRole, addedBy: string): Promise<void>;
  removeCaregiver(childId: string, userId: string): Promise<boolean>;
}

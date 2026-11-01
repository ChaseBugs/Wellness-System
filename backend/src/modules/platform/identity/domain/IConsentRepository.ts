import type { AppCode } from "../../../../config/app-catalog.js";
import type { Consent, CreateConsentInput } from "../models/consent.js";

export interface IConsentRepository {
  listActive(userId: string): Promise<Consent[]>;
  findActive(userId: string, input: CreateConsentInput): Promise<Consent | null>;
  create(userId: string, input: CreateConsentInput): Promise<Consent>;
  revoke(id: string, userId: string): Promise<Consent | null>;
  hasActive(userId: string, sourceApp: AppCode, targetApp: AppCode, scope: string): Promise<boolean>;
}

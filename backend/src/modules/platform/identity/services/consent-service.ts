import type { AppCode } from "../../../../config/app-catalog.js";
import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import logger from "../../../../utils/logger.js";
import type { IConsentRepository } from "../domain/IConsentRepository.js";
import type { Consent, ConsentResponse, ConsentScope, CreateConsentInput } from "../models/consent.js";

export class ConsentService {
  constructor(private consentRepository: IConsentRepository) {}

  async list(userId: string): Promise<ConsentResponse[]> {
    const consents = await this.consentRepository.listActive(userId);
    return consents.map((consent) => this.toResponse(consent));
  }

  /** Idempotent: granting an already-active consent returns the existing record. */
  async grant(userId: string, input: CreateConsentInput): Promise<ConsentResponse> {
    if (input.sourceApp === input.targetApp) throw new ValidationError("sourceApp and targetApp must differ");
    const existing = await this.consentRepository.findActive(userId, input);
    if (existing) return this.toResponse(existing);

    const consent = await this.consentRepository.create(userId, input);
    logger.consent.grant(userId, { sourceApp: input.sourceApp, targetApp: input.targetApp, scope: input.scope });
    return this.toResponse(consent);
  }

  async revoke(userId: string, consentId: string): Promise<void> {
    const revoked = await this.consentRepository.revoke(consentId, userId);
    if (!revoked) throw new NotFoundError("Consent");
    logger.consent.revoke(userId, { consentId, sourceApp: revoked.sourceApp, targetApp: revoked.targetApp });
  }

  async hasConsent(userId: string, sourceApp: AppCode, targetApp: AppCode, scope: ConsentScope): Promise<boolean> {
    return this.consentRepository.hasActive(userId, sourceApp, targetApp, scope);
  }

  private toResponse(consent: Consent): ConsentResponse {
    return {
      id: consent.id,
      sourceApp: consent.sourceApp,
      targetApp: consent.targetApp,
      scope: consent.scope,
      grantedAt: consent.grantedAt
    };
  }
}

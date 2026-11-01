import type { IncomingHttpHeaders } from "http";
import type { AppCode } from "../../../../config/app-catalog.js";
import { AppError, ConflictError, NotFoundError, ValidationError } from "../../../../utils/errors.js";
import logger from "../../../../utils/logger.js";
import type { IPlanRepository } from "../domain/IPlanRepository.js";
import type { IPurchaseRepository } from "../domain/IPurchaseRepository.js";
import type { IStoreVerifier } from "../domain/IStoreVerifier.js";
import type { Store } from "../models/plan.js";
import type {
  Purchase,
  PurchaseResponse,
  RestoreResult,
  VerifyPurchaseInput,
  VerifyPurchaseResponse
} from "../models/purchase.js";
import type { EntitlementService } from "./entitlement-service.js";

export class PurchaseService {
  constructor(
    private planRepository: IPlanRepository,
    private purchaseRepository: IPurchaseRepository,
    private verifiers: Map<Store, IStoreVerifier>,
    private entitlementService: EntitlementService
  ) {}

  /**
   * Verifies a store purchase server-side and links it to the account. A purchase made in any app
   * unlocks every app its plan covers, and can later be restored from another app on the same account.
   */
  async verify(userId: string, input: VerifyPurchaseInput, appCode?: AppCode): Promise<VerifyPurchaseResponse> {
    const { purchase, duplicate } = await this.verifyOne(userId, input, appCode, "verified");
    return { purchase: this.toResponse(purchase), duplicate, entitlements: await this.entitlementService.summary(userId) };
  }

  async restore(userId: string, inputs: VerifyPurchaseInput[], appCode?: AppCode): Promise<RestoreResult> {
    const restored: PurchaseResponse[] = [];
    const failed: RestoreResult["failed"] = [];
    for (const input of inputs) {
      try {
        const { purchase } = await this.verifyOne(userId, input, appCode, "restored");
        restored.push(this.toResponse(purchase));
      } catch (error) {
        // One bad receipt must not block restoring the others.
        if (!(error instanceof AppError)) throw error;
        failed.push({ productId: input.productId, code: error.code, message: error.message });
      }
    }
    return { restored, failed, entitlements: await this.entitlementService.summary(userId) };
  }

  async listForUser(userId: string): Promise<PurchaseResponse[]> {
    const purchases = await this.purchaseRepository.listForUser(userId);
    return purchases.map((purchase) => this.toResponse(purchase));
  }

  /** Server-to-server store notifications keep renewals, refunds and expirations in sync with entitlements. */
  async handleNotification(store: Store, body: unknown, headers: IncomingHttpHeaders): Promise<{ handled: boolean }> {
    const verifier = this.verifierFor(store);
    const notification = await verifier.parseNotification(body, headers);
    logger.billing.webhook(store, { eventType: notification.eventType });

    const purchase = await this.purchaseRepository.findByStoreTransaction(store, notification.originalTransactionId);
    // Acknowledge unknown transactions so the store stops retrying; the client's verify call will create them.
    if (!purchase) return { handled: false };

    await this.purchaseRepository.applyStatus(
      purchase.id,
      notification.status,
      { expiresAt: notification.expiresAt, autoRenew: notification.autoRenew },
      `notification:${notification.eventType}`,
      { store }
    );
    logger.billing.statusChange(notification.status, { purchaseId: purchase.id, eventType: notification.eventType });
    return { handled: true };
  }

  private async verifyOne(
    userId: string,
    input: VerifyPurchaseInput,
    appCode: AppCode | undefined,
    eventType: string
  ): Promise<{ purchase: Purchase; duplicate: boolean }> {
    const verifier = this.verifierFor(input.store);
    const plan = await this.planRepository.findByStoreProduct(input.store, input.productId);
    if (!plan) throw new NotFoundError(`Plan for ${input.store} product ${input.productId}`);

    const verification = await verifier.verify(input, plan);
    const existing = await this.purchaseRepository.findByStoreTransaction(input.store, verification.originalTransactionId);
    if (existing && existing.userId !== userId) throw this.ownedByOtherAccount(userId);

    // Detect a second subscription for apps the account already has (e.g. App Pro bought on top of Wellness Pass).
    const grants = existing ? [] : await this.purchaseRepository.findActiveGrants(userId);
    const covered = new Set(grants.map((grant) => grant.appCode));
    const duplicate = !existing && plan.apps.length > 0 && plan.apps.every((app) => covered.has(app));

    const purchase = await this.purchaseRepository.saveVerification(
      {
        userId,
        planId: plan.id,
        store: input.store,
        productId: verification.productId,
        originalTransactionId: verification.originalTransactionId,
        latestTransactionId: verification.latestTransactionId,
        purchasedInApp: appCode ?? null,
        status: verification.status,
        autoRenew: verification.autoRenew,
        startedAt: verification.startedAt,
        expiresAt: verification.expiresAt
      },
      existing ? `re-${eventType}` : eventType,
      { appCode: appCode ?? null, duplicate }
    );
    if (!purchase) throw this.ownedByOtherAccount(userId);

    logger.billing.purchase(true, { userId, planCode: plan.code, store: input.store, duplicate, eventType });
    return { purchase, duplicate };
  }

  private verifierFor(store: Store): IStoreVerifier {
    const verifier = this.verifiers.get(store);
    if (!verifier) throw new ValidationError(`Store "${store}" is not enabled`);
    return verifier;
  }

  private ownedByOtherAccount(userId: string): ConflictError {
    logger.billing.purchase(false, { userId, reason: "owned_by_other_account" });
    return new ConflictError("This purchase is linked to another account", "PURCHASE_OWNED_BY_OTHER_ACCOUNT");
  }

  private toResponse(purchase: Purchase): PurchaseResponse {
    return {
      id: purchase.id,
      planId: purchase.planId,
      store: purchase.store,
      productId: purchase.productId,
      purchasedInApp: purchase.purchasedInApp,
      status: purchase.status,
      autoRenew: purchase.autoRenew,
      startedAt: purchase.startedAt,
      expiresAt: purchase.expiresAt
    };
  }
}

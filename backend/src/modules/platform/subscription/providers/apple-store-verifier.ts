import { NotImplementedError } from "../../../../utils/errors.js";
import type { IStoreVerifier } from "../domain/IStoreVerifier.js";
import type { StoreNotification, StoreVerification } from "../models/purchase.js";

/**
 * Placeholder for the App Store Server API integration. To implement:
 * - verify(): look up the transaction with GET /inApps/v1/transactions/{transactionId} using an
 *   App Store Connect API key, and verify the returned JWS signature against Apple's root certificate.
 * - parseNotification(): verify the signedPayload of App Store Server Notifications V2 and map
 *   DID_RENEW / EXPIRED / REFUND / REVOKE / DID_FAIL_TO_RENEW (grace period) to PurchaseStatus.
 * Until then Apple purchases are rejected with 501 rather than trusted unverified.
 */
export class AppleStoreVerifier implements IStoreVerifier {
  readonly store = "apple" as const;

  async verify(): Promise<StoreVerification> {
    throw new NotImplementedError("Apple App Store verification is not configured yet");
  }

  async parseNotification(): Promise<StoreNotification> {
    throw new NotImplementedError("Apple App Store Server Notifications are not configured yet");
  }
}

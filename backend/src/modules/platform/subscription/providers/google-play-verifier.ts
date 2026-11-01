import { NotImplementedError } from "../../../../utils/errors.js";
import type { IStoreVerifier } from "../domain/IStoreVerifier.js";
import type { StoreNotification, StoreVerification } from "../models/purchase.js";

/**
 * Placeholder for the Google Play Developer API integration. To implement:
 * - verify(): call purchases.subscriptionsv2.get with a service account, then acknowledge the purchase.
 * - parseNotification(): authenticate the Pub/Sub push (Real-time Developer Notifications), then
 *   re-fetch the subscription state rather than trusting the notification body.
 * Until then Google purchases are rejected with 501 rather than trusted unverified.
 */
export class GooglePlayVerifier implements IStoreVerifier {
  readonly store = "google" as const;

  async verify(): Promise<StoreVerification> {
    throw new NotImplementedError("Google Play verification is not configured yet");
  }

  async parseNotification(): Promise<StoreNotification> {
    throw new NotImplementedError("Google Play Real-time Developer Notifications are not configured yet");
  }
}

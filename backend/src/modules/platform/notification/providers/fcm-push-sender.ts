import { NotImplementedError } from "../../../../utils/errors.js";
import type { IPushSender } from "../domain/IPushSender.js";
import type { PushResult } from "../models/push.js";

/**
 * Placeholder for Firebase Cloud Messaging (Android, and iOS through APNs). To implement:
 * - authenticate with a service account and call the HTTP v1 API (projects/<id>/messages:send) per token;
 * - map UNREGISTERED / INVALID_ARGUMENT token errors to `invalidTokens`;
 * - put `deepLink` in the data payload so the apps can route the tap.
 * Until then every send fails, and the delivery rows record the error instead of pretending success.
 */
export class FcmPushSender implements IPushSender {
  readonly name = "fcm";

  async send(): Promise<PushResult> {
    throw new NotImplementedError("FCM push delivery is not configured yet");
  }
}

import type { IPushSender } from "../domain/IPushSender.js";
import type { DeviceTarget, PushMessage, PushResult } from "../models/push.js";
import logger, { EMOJIS } from "../../../../utils/logger.js";

/**
 * Development provider: logs each push instead of sending it and reports every device as delivered.
 * env.ts refuses it in production. Tokens starting with "invalid-" are reported as gone, so the
 * token-cleanup path can be exercised without a real provider.
 */
export class LogPushSender implements IPushSender {
  readonly name = "log";

  async send(message: PushMessage, devices: DeviceTarget[]): Promise<PushResult> {
    const invalidTokens = devices.filter((device) => device.pushToken.startsWith("invalid-")).map((device) => device.pushToken);
    logger.infoWithEmoji(EMOJIS.NOTIFICATION, `Push (log provider): ${message.title}`, "PUSH", {
      userId: devices[0]?.userId,
      devices: devices.length,
      deepLink: message.deepLink
    });
    return { delivered: devices.length - invalidTokens.length, invalidTokens };
  }
}

import type { DeviceTarget, PushMessage, PushResult } from "../models/push.js";

/** A push provider (FCM/APNs, or the development log provider). */
export interface IPushSender {
  readonly name: string;
  /** Sends one message to one user's devices. Throws when the provider can't send at all. */
  send(message: PushMessage, devices: DeviceTarget[]): Promise<PushResult>;
}

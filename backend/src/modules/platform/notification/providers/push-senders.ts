import { env } from "../../../../config/env.js";
import type { IPushSender } from "../domain/IPushSender.js";
import { FcmPushSender } from "./fcm-push-sender.js";
import { LogPushSender } from "./log-push-sender.js";

export function createPushSender(): IPushSender {
  return env.push.provider === "log" ? new LogPushSender() : new FcmPushSender();
}

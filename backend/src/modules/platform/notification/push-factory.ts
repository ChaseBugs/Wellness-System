import { getPool } from "../../../config/database.js";
import { env } from "../../../config/env.js";
import type { PushService } from "./domain/push-ports.js";
import { createPushSender } from "./providers/push-senders.js";
import { DeliveryRepository } from "./repositories/delivery-repository.js";
import { PushDispatchService } from "./services/push-dispatch-service.js";

export function createPushDispatchService(): PushDispatchService {
  return new PushDispatchService(new DeliveryRepository(getPool()), createPushSender(), env.push.reminderGraceMinutes);
}

/** The one supported way for app modules to send campaigns (they depend on the port only). */
export function createPushService(): PushService {
  return createPushDispatchService();
}

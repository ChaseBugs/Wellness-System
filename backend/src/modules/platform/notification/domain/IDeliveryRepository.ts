import type { AppCode } from "../../../../config/app-catalog.js";
import type { Delivery, DeliveryClaim, DeliveryStatus, DeviceTarget, DueReminder, ListDeliveriesQuery } from "../models/push.js";

export interface IDeliveryRepository {
  /** Inserts a pending delivery; null when this occurrence was already claimed. */
  claim(claim: DeliveryClaim): Promise<string | null>;
  complete(id: string, status: Exclude<DeliveryStatus, "pending">, deviceCount: number, error: string | null): Promise<void>;
  /** Reminders due at `now` in their own timezone, within `graceMinutes` after their time of day. */
  dueReminders(now: Date, graceMinutes: number): Promise<DueReminder[]>;
  devicesFor(userId: string, appCode: AppCode): Promise<DeviceTarget[]>;
  removeTokens(tokens: string[]): Promise<void>;
  /** The subset of userIds that opted into marketing. */
  marketingOptedIn(userIds: string[]): Promise<string[]>;
  list(query: ListDeliveriesQuery): Promise<Delivery[]>;
}

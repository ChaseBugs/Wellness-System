import type { AppCode } from "../../../../config/app-catalog.js";
import type { Device } from "./device.js";

export const DELIVERY_SOURCES = ["reminder", "campaign"] as const;
export const DELIVERY_STATUSES = ["pending", "sent", "no_device", "failed"] as const;

export type DeliverySource = (typeof DELIVERY_SOURCES)[number];
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface PushMessage {
  title: string;
  body: string | null;
  deepLink: string | null;
}

/** What a provider reports for one message sent to one user's devices. */
export interface PushResult {
  delivered: number;
  /** Tokens the provider says are gone (app uninstalled); they are removed from notify.devices. */
  invalidTokens: string[];
}

export interface Delivery {
  id: string;
  userId: string;
  appCode: AppCode;
  source: DeliverySource;
  sourceId: string;
  occurrence: string;
  title: string;
  body: string | null;
  deepLink: string | null;
  status: DeliveryStatus;
  deviceCount: number;
  error: string | null;
  createdAt: Date;
}

/** A send to claim: the unique (source, sourceId, userId, occurrence) makes it happen at most once. */
export interface DeliveryClaim extends PushMessage {
  userId: string;
  appCode: AppCode;
  source: DeliverySource;
  sourceId: string;
  occurrence: string;
}

/** An active reminder whose local time has come today and that has no delivery for that local date. */
export interface DueReminder {
  id: string;
  userId: string;
  appCode: AppCode;
  title: string;
  body: string | null;
  deepLink: string | null;
  localDate: string;
}

export interface DispatchSummary {
  /** Sends claimed in this run (already-sent occurrences are not counted). */
  claimed: number;
  sent: number;
  noDevice: number;
  failed: number;
}

export interface CampaignSendInput {
  appCode: AppCode;
  campaignId: string;
  message: PushMessage;
  userIds: string[];
  /** Promotional sends go only to accounts that opted into marketing. */
  marketing: boolean;
}

export interface ListDeliveriesQuery {
  appCode?: AppCode;
  source?: DeliverySource;
  status?: DeliveryStatus;
  limit: number;
}

export type DeviceTarget = Pick<Device, "userId" | "platform" | "pushToken">;

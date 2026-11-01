import type { AppCode } from "../../../../config/app-catalog.js";
import type { ClientPlatform } from "../../analytics/models/event.js";

export interface Device {
  id: string;
  userId: string;
  appCode: AppCode;
  platform: ClientPlatform;
  pushToken: string;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDeviceInput {
  platform: ClientPlatform;
  pushToken: string;
}

export interface DeviceResponse {
  id: string;
  appCode: AppCode;
  platform: ClientPlatform;
  lastSeenAt: Date;
}

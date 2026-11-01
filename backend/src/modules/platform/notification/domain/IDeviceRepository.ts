import type { AppCode } from "../../../../config/app-catalog.js";
import type { Device, RegisterDeviceInput } from "../models/device.js";

export interface IDeviceRepository {
  /** A push token belongs to whoever registered it last (devices change accounts). */
  upsert(userId: string, appCode: AppCode, input: RegisterDeviceInput): Promise<Device>;
  listForUser(userId: string, appCode: AppCode): Promise<Device[]>;
  delete(id: string, userId: string): Promise<boolean>;
}

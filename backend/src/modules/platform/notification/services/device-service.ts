import type { AppCode } from "../../../../config/app-catalog.js";
import { NotFoundError } from "../../../../utils/errors.js";
import type { IDeviceRepository } from "../domain/IDeviceRepository.js";
import type { Device, DeviceResponse, RegisterDeviceInput } from "../models/device.js";

export class DeviceService {
  constructor(private deviceRepository: IDeviceRepository) {}

  async register(userId: string, appCode: AppCode, input: RegisterDeviceInput): Promise<DeviceResponse> {
    return this.toResponse(await this.deviceRepository.upsert(userId, appCode, input));
  }

  async list(userId: string, appCode: AppCode): Promise<DeviceResponse[]> {
    const devices = await this.deviceRepository.listForUser(userId, appCode);
    return devices.map((device) => this.toResponse(device));
  }

  async unregister(userId: string, id: string): Promise<void> {
    if (!(await this.deviceRepository.delete(id, userId))) throw new NotFoundError("Device");
  }

  // The push token itself is never echoed back.
  private toResponse(device: Device): DeviceResponse {
    return { id: device.id, appCode: device.appCode, platform: device.platform, lastSeenAt: device.lastSeenAt };
  }
}

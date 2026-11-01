import type { CampaignSendInput, DispatchSummary } from "../models/push.js";

/** Narrow port app modules use to push a campaign to their own users (obtain it from createPushService). */
export interface PushService {
  sendCampaign(input: CampaignSendInput): Promise<DispatchSummary>;
}

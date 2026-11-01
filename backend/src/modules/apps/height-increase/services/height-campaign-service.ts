import type { PushService } from "../../../platform/notification/domain/push-ports.js";
import type { EntitlementChecker } from "../../../platform/subscription/domain/entitlement-checker.js";
import { ConflictError, NotFoundError } from "../../../../utils/errors.js";
import type { ICampaignRepository } from "../domain/height-ports.js";
import type { CampaignSendResult, HeightCampaign } from "../models/height-campaign.js";

/** A scheduled campaign more than this late (server down) is not sent. */
const MAX_LATE_HOURS = 24;

/**
 * Sends HeightIncrease push campaigns through the platform push service, to users who allow
 * HeightIncrease notifications. Promotions go only to accounts that opted into marketing.
 */
export class HeightCampaignService {
  constructor(
    private campaigns: ICampaignRepository,
    private push: PushService,
    private entitlements: EntitlementChecker
  ) {}

  /** Scheduler job: sends campaigns whose scheduled time has come. */
  async sendDue(now: Date): Promise<CampaignSendResult[]> {
    const due = await this.campaigns.claimDue(now, MAX_LATE_HOURS);
    const results: CampaignSendResult[] = [];
    for (const campaign of due) results.push(await this.send(campaign));
    return results;
  }

  /** Admin "send now". A campaign is sent once; editing it afterwards doesn't resend it. */
  async sendNow(id: string): Promise<CampaignSendResult> {
    const campaign = await this.campaigns.claim(id);
    if (campaign) return this.send(campaign);
    const existing = await this.campaigns.find(id);
    if (!existing) throw new NotFoundError("Campaign not found");
    throw new ConflictError(existing.sentAt ? "This campaign was already sent" : "Activate the campaign before sending it");
  }

  private async send(campaign: HeightCampaign): Promise<CampaignSendResult> {
    const userIds = await this.recipients(campaign.audience);
    const summary = await this.push.sendCampaign({
      appCode: "height-increase",
      campaignId: campaign.id,
      message: { title: campaign.title, body: campaign.message, deepLink: null },
      userIds,
      marketing: campaign.notificationType === "promotion"
    });
    return { campaignId: campaign.id, audience: campaign.audience, recipients: userIds.length, ...summary };
  }

  private async recipients(audience: HeightCampaign["audience"]): Promise<string[]> {
    const userIds = await this.campaigns.audienceUserIds(audience);
    if (audience !== "free" && audience !== "premium") return userIds;
    const wantPremium = audience === "premium";
    const matches: string[] = [];
    for (const userId of userIds) {
      if ((await this.entitlements.hasAccess(userId, "height-increase")) === wantPremium) matches.push(userId);
    }
    return matches;
  }
}

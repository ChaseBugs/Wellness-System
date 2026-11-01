import type { IDeliveryRepository } from "../domain/IDeliveryRepository.js";
import type { IPushSender } from "../domain/IPushSender.js";
import type { PushService } from "../domain/push-ports.js";
import type { CampaignSendInput, Delivery, DeliveryClaim, DispatchSummary, ListDeliveriesQuery } from "../models/push.js";
import logger, { EMOJIS } from "../../../../utils/logger.js";

export type DeliveryResponse = Omit<Delivery, "userId"> & { userId: string };

/**
 * Sends reminders and campaigns. Each send is claimed in notify.deliveries before the provider is
 * called, so overlapping runs or a restart never send the same occurrence twice. A provider failure is
 * recorded on the delivery and not retried automatically.
 */
export class PushDispatchService implements PushService {
  constructor(
    private deliveries: IDeliveryRepository,
    private sender: IPushSender,
    private reminderGraceMinutes: number
  ) {}

  async dispatchDueReminders(now: Date): Promise<DispatchSummary> {
    const summary = emptySummary();
    for (const reminder of await this.deliveries.dueReminders(now, this.reminderGraceMinutes)) {
      await this.deliver(
        {
          userId: reminder.userId,
          appCode: reminder.appCode,
          source: "reminder",
          sourceId: reminder.id,
          occurrence: reminder.localDate,
          title: reminder.title,
          body: reminder.body,
          deepLink: reminder.deepLink
        },
        summary
      );
    }
    this.log("Reminders dispatched", summary);
    return summary;
  }

  async sendCampaign(input: CampaignSendInput): Promise<DispatchSummary> {
    const unique = [...new Set(input.userIds)];
    const recipients = input.marketing ? await this.deliveries.marketingOptedIn(unique) : unique;
    const summary = emptySummary();
    for (const userId of recipients) {
      await this.deliver(
        { userId, appCode: input.appCode, source: "campaign", sourceId: input.campaignId, occurrence: "once", ...input.message },
        summary
      );
    }
    this.log("Campaign dispatched", summary, { appCode: input.appCode, campaignId: input.campaignId, audience: unique.length });
    return summary;
  }

  async listDeliveries(query: ListDeliveriesQuery): Promise<Delivery[]> {
    return this.deliveries.list(query);
  }

  private async deliver(claim: DeliveryClaim, summary: DispatchSummary): Promise<void> {
    const id = await this.deliveries.claim(claim);
    if (!id) return;
    summary.claimed++;

    const devices = await this.deliveries.devicesFor(claim.userId, claim.appCode);
    if (devices.length === 0) {
      await this.deliveries.complete(id, "no_device", 0, null);
      summary.noDevice++;
      return;
    }

    try {
      const result = await this.sender.send({ title: claim.title, body: claim.body, deepLink: claim.deepLink }, devices);
      await this.deliveries.removeTokens(result.invalidTokens);
      if (result.delivered > 0) {
        await this.deliveries.complete(id, "sent", result.delivered, null);
        summary.sent++;
      } else {
        await this.deliveries.complete(id, "failed", 0, "Every device token was rejected");
        summary.failed++;
      }
    } catch (error) {
      await this.deliveries.complete(id, "failed", 0, error instanceof Error ? error.message : String(error));
      summary.failed++;
    }
  }

  private log(message: string, summary: DispatchSummary, meta: Record<string, unknown> = {}) {
    if (summary.claimed === 0) return;
    logger.infoWithEmoji(EMOJIS.NOTIFICATION, message, "PUSH", { provider: this.sender.name, ...summary, ...meta });
  }
}

function emptySummary(): DispatchSummary {
  return { claimed: 0, sent: 0, noDevice: 0, failed: 0 };
}

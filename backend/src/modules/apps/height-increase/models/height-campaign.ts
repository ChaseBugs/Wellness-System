export const CAMPAIGN_AUDIENCES = ["all", "free", "premium", "inactive"] as const;

/** An admin push campaign (height.notifications). */
export interface HeightCampaign {
  id: string;
  title: string;
  message: string;
  audience: (typeof CAMPAIGN_AUDIENCES)[number];
  notificationType: "motivation" | "reminder" | "update" | "promotion";
  scheduledAt: Date | null;
  sentAt: Date | null;
  isActive: boolean;
}

export interface CampaignSendResult {
  campaignId: string;
  audience: HeightCampaign["audience"];
  /** Users in the audience who allow HeightIncrease notifications. */
  recipients: number;
  claimed: number;
  sent: number;
  noDevice: number;
  failed: number;
}

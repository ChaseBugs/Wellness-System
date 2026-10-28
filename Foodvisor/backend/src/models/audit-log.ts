import mongoose, { Schema, type Model } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true, index: true },
    resource: { type: String, required: true, trim: true, index: true },
    ids: [{ type: String }],
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    by: { type: String, trim: true, index: true },
    reqId: { type: String, trim: true, index: true },
    at: { type: Date, default: () => new Date(), index: true }
  },
  {
    timestamps: false,
    collection: "auditLogs",
    capped: { size: 256 * 1024 * 1024, max: 250_000 }
  }
);

export const AuditLog =
  (mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema)) as Model<any>;

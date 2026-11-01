import type { AdminOverviewResponse } from "../models/admin-overview.js";

export interface IAdminOverviewRepository {
  overview(): Promise<AdminOverviewResponse>;
}

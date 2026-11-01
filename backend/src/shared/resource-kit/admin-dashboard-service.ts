import type { ResourceDefinition } from "./resource-definition.js";
import type { ResourceService } from "./resource-service.js";

export interface AdminDashboardResponse {
  totals: Record<string, number>;
  unverified: Record<string, number>;
  recentAdditions: Array<{ resource: string; id: string; label: string; createdAt: Date }>;
  trend: { last30Days: Array<{ date: string; total: number }> };
}

const TREND_DAYS = 30;

function camelKey(resourceName: string): string {
  return resourceName.replace(/-([a-z])/g, (_match, char: string) => char.toUpperCase());
}

/** Same payload as the legacy `/dashboard` endpoint: counts, unverified counts, recent rows, 30-day trend. */
export class AdminDashboardService {
  constructor(
    private resourceService: ResourceService,
    private resources: ResourceDefinition[]
  ) {}

  async summary(): Promise<AdminDashboardResponse> {
    const stats = await Promise.all(this.resources.map((resource) => this.resourceService.stats(resource, 2, TREND_DAYS)));

    const totals: Record<string, number> = {};
    const unverified: Record<string, number> = {};
    const recentAdditions: AdminDashboardResponse["recentAdditions"] = [];
    const perDay = new Map<string, number>();

    this.resources.forEach((resource, index) => {
      const key = camelKey(resource.name);
      totals[key] = stats[index].total;
      unverified[key] = stats[index].unverified;
      for (const row of stats[index].recent) recentAdditions.push({ resource: key, ...row });
      for (const day of stats[index].createdPerDay) perDay.set(day.date, (perDay.get(day.date) ?? 0) + day.count);
    });

    const last30Days: Array<{ date: string; total: number }> = [];
    for (let offset = TREND_DAYS - 1; offset >= 0; offset--) {
      const date = new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
      last30Days.push({ date, total: perDay.get(date) ?? 0 });
    }

    return {
      totals,
      unverified,
      recentAdditions: recentAdditions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12),
      trend: { last30Days }
    };
  }
}

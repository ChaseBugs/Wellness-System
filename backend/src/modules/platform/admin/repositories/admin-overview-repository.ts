import type pg from "pg";
import type { IAdminOverviewRepository } from "../domain/IAdminOverviewRepository.js";
import type { AdminOverviewResponse } from "../models/admin-overview.js";

export class AdminOverviewRepository implements IAdminOverviewRepository {
  constructor(private pool: pg.Pool) {}

  async overview(): Promise<AdminOverviewResponse> {
    const [counts, apps] = await Promise.all([
      this.pool.query(
        `SELECT
           (SELECT count(*)::int FROM identity.users) AS "accountsTotal",
           (SELECT count(*)::int FROM identity.users WHERE role = 'editor') AS editors,
           (SELECT count(*)::int FROM identity.users WHERE role = 'admin') AS admins,
           (SELECT count(*)::int FROM identity.users WHERE created_at >= now() - interval '7 days') AS "newLast7Days",
           (SELECT count(*)::int FROM billing.purchases WHERE status IN ('active', 'grace_period')) AS "activePurchases",
           (SELECT count(*)::int FROM billing.purchases p JOIN billing.plans pl ON pl.id = p.plan_id
              WHERE p.status IN ('active', 'grace_period') AND pl.tier = 'app_pro') AS "appPro",
           (SELECT count(*)::int FROM billing.purchases p JOIN billing.plans pl ON pl.id = p.plan_id
              WHERE p.status IN ('active', 'grace_period') AND pl.tier = 'wellness_pass') AS "wellnessPass",
           (SELECT count(*)::int FROM content.items WHERE review_status = 'in_review') AS "contentInReview",
           (SELECT count(*)::int FROM content.items WHERE review_status = 'draft') AS "contentDrafts",
           (SELECT count(*)::int FROM routine.exercises WHERE status = 'draft' AND NOT expert_reviewed) AS "exercisesAwaitingReview",
           (SELECT count(*)::int FROM routine.routines WHERE status = 'draft' AND NOT expert_reviewed) AS "routinesAwaitingReview"`
      ),
      this.pool.query<{ code: string; name: string; installs: number }>(
        `SELECT a.code, a.name, (SELECT count(*)::int FROM identity.app_installs i WHERE i.app_code = a.code) AS installs
         FROM identity.apps a WHERE a.backend_module ORDER BY a.name`
      )
    ]);
    const c = counts.rows[0];
    return {
      accounts: { total: c.accountsTotal, editors: c.editors, admins: c.admins, newLast7Days: c.newLast7Days },
      subscriptions: { active: c.activePurchases, appPro: c.appPro, wellnessPass: c.wellnessPass },
      review: {
        contentInReview: c.contentInReview,
        contentDrafts: c.contentDrafts,
        exercisesAwaitingReview: c.exercisesAwaitingReview,
        routinesAwaitingReview: c.routinesAwaitingReview
      },
      apps: apps.rows
    };
  }
}

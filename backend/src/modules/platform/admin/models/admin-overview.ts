/** GET /admin/overview: the unified admin's home screen. */
export interface AdminOverviewResponse {
  accounts: { total: number; editors: number; admins: number; newLast7Days: number };
  subscriptions: { active: number; appPro: number; wellnessPass: number };
  review: {
    /** Content Factory items waiting for an expert decision. */
    contentInReview: number;
    contentDrafts: number;
    /** Routine Engine drafts that no expert has signed off yet. */
    exercisesAwaitingReview: number;
    routinesAwaitingReview: number;
  };
  /** Apps that have a backend module, with how many accounts use each. */
  apps: Array<{ code: string; name: string; installs: number }>;
}

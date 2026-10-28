type Item = { resource: string; id: string; label: string; createdAt: string };

const RESOURCE_HREF: Record<string, string> = {
  foods: "/foods", recipes: "/recipes", activities: "/activities", users: "/users",
  mealLogs: "/meal-logs", weightEntries: "/weight-entries",
  referenceSources: "/reference-sources", nutrientIntakeRules: "/nutrient-intake-rules",
  conditionDietRules: "/condition-diet-rules", riskAssessmentRules: "/risk-assessment-rules",
  nutritionTerminology: "/nutrition-terminology", dataValidationRules: "/data-validation-rules",
  programs: "/programs"
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function RecentFeedCard({ items }: { items: Item[] }) {
  return (
    <section className="dashboard-card">
      <h3>Recent additions</h3>
      {items.length === 0 ? (
        <p className="dashboard-empty">No recent activity.</p>
      ) : (
        <ul className="recent-list">
          {items.map((it) => (
            <li key={`${it.resource}-${it.id}`}>
              <a href={RESOURCE_HREF[it.resource] ?? "/"}>
                <span className="recent-resource">{it.resource}</span>
                <span className="recent-label">{it.label}</span>
                <span className="recent-time">{relativeTime(it.createdAt)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

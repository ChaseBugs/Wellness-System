type Row = { resource: string; label: string; count: number; href: string };

export default function VerificationQueueCard({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => b.count - a.count).filter((r) => r.count > 0);
  return (
    <section className="dashboard-card">
      <h3>Verification queue</h3>
      {sorted.length === 0 ? (
        <p className="dashboard-empty">All clear — nothing pending review.</p>
      ) : (
        <ul className="queue-list">
          {sorted.map((r) => (
            <li key={r.resource}>
              <a href={r.href}>
                <span>{r.label}</span>
                <strong>{r.count.toLocaleString()}</strong>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

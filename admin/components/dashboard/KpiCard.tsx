import type { ComponentType } from "react";

type IconType = ComponentType<{ size?: number }>;

export default function KpiCard({
  label, value, icon: Icon, sub, accent = false
}: { label: string; value: string | number; icon?: IconType; sub?: string; accent?: boolean }) {
  return (
    <article className={`kpi-card ${accent ? "kpi-accent" : ""}`}>
      {Icon ? <span className="kpi-icon"><Icon size={20} /></span> : null}
      <strong className="kpi-value">{typeof value === "number" ? value.toLocaleString() : value}</strong>
      <span className="kpi-label">{label}</span>
      {sub ? <span className="kpi-sub">{sub}</span> : null}
    </article>
  );
}

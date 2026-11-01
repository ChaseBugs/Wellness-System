export default function Sparkline({ points, height = 32, stroke = "var(--accent)" }: { points: number[]; height?: number; stroke?: string }) {
  if (!points.length) return null;
  const w = Math.max(60, points.length * 4);
  const max = Math.max(1, ...points);
  const min = Math.min(0, ...points);
  const range = max - min || 1;
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1 || 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="sparkline" width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}

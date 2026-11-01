export default function Ring({ value, total, size = 56 }: { value: number; total: number; size?: number }) {
  const safeTotal = Math.max(1, total);
  const pct = Math.min(1, value / safeTotal);
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${Math.round(pct * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={4}
              strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      <text x="50%" y="54%" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">{Math.round(pct * 100)}%</text>
    </svg>
  );
}

type Item = { label: string; value: number; href?: string };

export default function BarMini({ items, max }: { items: Item[]; max?: number }) {
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="bar-mini">
      {items.map((it) => {
        const pct = Math.max(2, (it.value / m) * 100);
        const inner = (
          <>
            <span className="bar-mini-label">{it.label}</span>
            <span className="bar-mini-track"><span className="bar-mini-fill" style={{ width: `${pct}%` }} /></span>
            <span className="bar-mini-value">{it.value.toLocaleString()}</span>
          </>
        );
        return (
          <li key={it.label} className="bar-mini-row">
            {it.href ? <a href={it.href}>{inner}</a> : inner}
          </li>
        );
      })}
    </ul>
  );
}

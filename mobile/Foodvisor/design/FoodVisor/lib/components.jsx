// FoodVisor — Shared display components
// CalorieRing, MacroBar, Sparkline, Distribution column, etc.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Calorie ring — large dial with consumed / target / burned
// ─────────────────────────────────────────────────────────────
function CalorieRing({ consumed = 1420, target = 2287, burned = 320, size = 200 }) {
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, consumed / target);
  const remaining = Math.max(0, target - consumed + burned);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        {/* tick marks every 10% */}
        {Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + Math.cos(a) * (r + 6);
          const y1 = cy + Math.sin(a) * (r + 6);
          const x2 = cx + Math.cos(a) * (r + (i % 4 === 0 ? 11 : 9));
          const y2 = cy + Math.sin(a) * (r + (i % 4 === 0 ? 11 : 9));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-4)" strokeWidth={i % 4 === 0 ? 1.2 : 0.6} />;
        })}
        {/* track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--paper-deep)" strokeWidth="10" />
        {/* progress */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--persimmon)" strokeWidth="10"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
      }}>
        <div className="fv-cap" style={{ marginBottom: 4 }}>Remaining</div>
        <div className="fv-num" style={{ fontSize: 56, lineHeight: 1, color: "var(--ink)" }}>
          {remaining.toLocaleString()}
        </div>
        <div className="fv-mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
          {consumed} <span style={{ color: "var(--ink-4)" }}>of</span> {target} kcal
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Macro bar — horizontal segmented bar (P / C / F)
// ─────────────────────────────────────────────────────────────
function MacroRow({ label, value, target, unit = "g", color, sub }) {
  const pct = Math.min(1, value / target);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            display: "inline-block", width: 8, height: 8, borderRadius: 1,
            background: color, transform: "translateY(-1px)"
          }} />
          <span className="fv-cap" style={{ color: "var(--ink-2)" }}>{label}</span>
        </div>
        <div className="fv-mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{value}</span>
          <span style={{ color: "var(--ink-4)" }}> / {target}{unit}</span>
        </div>
      </div>
      <div className="fv-macro-bar">
        <span style={{ width: `${pct * 100}%`, background: color }} />
      </div>
      {sub && <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sparkline (sized by parent)
// ─────────────────────────────────────────────────────────────
function Sparkline({ data, width = 280, height = 60, color = "var(--ink)", fill = "none", showDots = false, target }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 8) - 4]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height}>
      {target != null && (
        <line x1="0" x2={width}
          y1={height - ((target - min) / range) * (height - 8) - 4}
          y2={height - ((target - min) / range) * (height - 8) - 4}
          stroke="var(--ink-4)" strokeDasharray="2 3" strokeWidth="1" />
      )}
      {fill !== "none" && <path d={area} fill={fill} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 0} fill={color} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Bar column chart
// ─────────────────────────────────────────────────────────────
function BarChart({ data, width = 280, height = 100, target, labels }) {
  const max = Math.max(...data, target || 0);
  const bw = (width - (data.length - 1) * 4) / data.length;
  return (
    <svg width={width} height={height + 18}>
      {target && (
        <line x1="0" x2={width}
          y1={height - (target / max) * height} y2={height - (target / max) * height}
          stroke="var(--persimmon)" strokeDasharray="3 3" strokeWidth="1" />
      )}
      {data.map((v, i) => {
        const h = (v / max) * height;
        const x = i * (bw + 4);
        const y = height - h;
        const over = target && v > target;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx="2"
              fill={over ? "var(--persimmon)" : "var(--ink)"} opacity={i === data.length - 1 ? 1 : 0.85} />
            {labels && (
              <text x={x + bw / 2} y={height + 14} textAnchor="middle"
                fontSize="9" fontFamily="var(--mono)" fill="var(--ink-4)" letterSpacing="0.1em">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Status bar (custom — replaces the M3 one with our type)
// ─────────────────────────────────────────────────────────────
function FvStatusBar({ dark = false }) {
  const c = dark ? "#fff" : "var(--ink)";
  return (
    <div style={{
      height: 36, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 18px",
      position: "relative", flexShrink: 0,
      fontFamily: "var(--mono)", fontSize: 12, fontWeight: 500, color: c,
      background: dark ? "transparent" : "transparent",
    }}>
      <span>9:41</span>
      <div style={{
        position: "absolute", left: "50%", top: 8, transform: "translateX(-50%)",
        width: 18, height: 18, borderRadius: 100, background: "#1a1a1a"
      }} />
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M7 10 0 3a9 9 0 0 1 14 0L7 10z" fill={c}/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M13 9V1L1 9z" fill={c}/></svg>
        <svg width="22" height="10" viewBox="0 0 22 10">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" fill="none" stroke={c}/>
          <rect x="2" y="2" width="14" height="6" rx="1" fill={c}/>
          <rect x="19" y="3" width="2" height="4" rx="0.5" fill={c}/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Gesture nav
// ─────────────────────────────────────────────────────────────
function FvNavBar({ dark = false }) {
  return (
    <div style={{ height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{
        width: 110, height: 4, borderRadius: 2,
        background: dark ? "#fff" : "var(--ink)", opacity: 0.6
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phone — bare frame; we control all content
// ─────────────────────────────────────────────────────────────
function Phone({ children, dark = false, width = 360, height = 740 }) {
  return (
    <div style={{
      width, height, borderRadius: 38,
      background: dark ? "#0e0c09" : "var(--paper)",
      border: "9px solid #1a1612",
      boxShadow:
        "0 1px 0 #2c241a inset, 0 0 0 1px #3a2f24 inset, " +
        "0 30px 60px -20px rgba(28,22,17,0.45), 0 8px 20px -8px rgba(28,22,17,0.3)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--sans)",
      position: "relative",
    }} className="fv">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section title
// ─────────────────────────────────────────────────────────────
function SectionTitle({ overline, title, action, style }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end",
      justifyContent: "space-between", padding: "20px 18px 10px",
      ...style,
    }}>
      <div>
        {overline && <div className="fv-cap" style={{ marginBottom: 4 }}>{overline}</div>}
        <h2 style={{ fontSize: 26, lineHeight: 1.05 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Food image placeholder (striped)
// ─────────────────────────────────────────────────────────────
function FoodGlyph({ kind = "rice", size = 44, tone = "var(--paper-deep)" }) {
  const Glyph = {
    rice:   I.rice,
    apple:  I.apple,
    egg:    I.egg,
    leaf:   I.leaf,
    fish:   I.fish,
    mug:    I.mug,
    flame:  I.flame,
  }[kind] || I.apple;
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: 10, background: tone,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--ink-2)", border: "1px solid var(--rule-soft)",
    }}>
      <Glyph size={size * 0.55} stroke={1.4} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom nav
// ─────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  const items = [
    { id: "today",   label: "Today",    Icon: I.today },
    { id: "diary",   label: "Diary",    Icon: I.diary },
    { id: "scan",    label: "Capture",  Icon: I.scan, primary: true },
    { id: "insights",label: "Trends",   Icon: I.insights },
    { id: "profile", label: "You",      Icon: I.profile },
  ];
  return (
    <div className="fv-nav">
      {items.map(it => (
        <div key={it.id}
          className="fv-nav-item"
          data-on={active === it.id}
          onClick={() => onChange?.(it.id)}>
          {it.primary ? (
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--persimmon)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 2, marginTop: -8,
              boxShadow: "0 6px 14px -4px rgba(214,90,49,0.5)",
            }}>
              <it.Icon size={18} stroke={2} />
            </div>
          ) : <it.Icon size={20} stroke={1.6} />}
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Code highlighter (very simple)
// ─────────────────────────────────────────────────────────────
function CodeBlock({ children }) {
  // Accept React tree directly
  return <pre className="fv-code">{children}</pre>;
}

Object.assign(window, {
  CalorieRing, MacroRow, Sparkline, BarChart,
  FvStatusBar, FvNavBar, Phone,
  SectionTitle, FoodGlyph, BottomNav, CodeBlock,
});

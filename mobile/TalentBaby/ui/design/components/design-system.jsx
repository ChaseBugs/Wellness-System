// Design tokens — warm coral/peach palette (original)
const T = {
  // backgrounds
  cream: '#FDF6EE',
  creamDeep: '#F7EBDC',
  blush: '#FCE4D6',
  peach: '#F9D0B8',
  coral: '#F08B6B',
  coralDeep: '#D96E4B',
  terracotta: '#C75A3C',

  // accents
  mustard: '#E8B14A',
  sage: '#8BA888',
  plum: '#6B4E71',
  sky: '#A8C5D6',

  // neutrals
  ink: '#2B1F1A',
  ink70: '#5C4A42',
  ink40: '#9A8A80',
  line: '#E8DCCF',
  card: '#FFFFFF',
};

window.T = T;

// Simple placeholder tile for baby illustrations
function IllusTile({ label, w = 84, h = 84, hue = 'peach' }) {
  const bgs = {
    peach: 'linear-gradient(135deg, #FCE4D6, #F9D0B8)',
    blush: 'linear-gradient(135deg, #FFE8DC, #FCD4C0)',
    cream: 'linear-gradient(135deg, #F7EBDC, #F0DCC4)',
    mustard: 'linear-gradient(135deg, #FCE9C5, #F5D79A)',
    sage: 'linear-gradient(135deg, #D8E4D4, #B8CDB2)',
    sky: 'linear-gradient(135deg, #D7E4EC, #B4CADB)',
    plum: 'linear-gradient(135deg, #D8CADD, #B79FC0)',
  };
  return (
    <div style={{
      width: w, height: h, borderRadius: 12,
      background: bgs[hue] || bgs.peach,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'ui-monospace, Menlo, monospace',
      fontSize: 9, color: T.ink70, textAlign: 'center', padding: 6,
      lineHeight: 1.2, flexShrink: 0,
      backgroundImage: `${bgs[hue] || bgs.peach}, repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.25) 6px 7px)`,
    }}>
      {label}
    </div>
  );
}

// Laurel wreath decoration
function Laurel({ size = 40, color = T.mustard }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none">
      <path d="M20 4 Q8 12 8 28 Q8 40 20 44" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {[10, 16, 22, 28, 34].map((y, i) => (
        <ellipse key={i} cx={8 + (i % 2 === 0 ? -3 : 3)} cy={y} rx="4" ry="2"
          transform={`rotate(${i % 2 === 0 ? -30 : 30} ${8 + (i % 2 === 0 ? -3 : 3)} ${y})`}
          fill={color}/>
      ))}
    </svg>
  );
}

// Minimal line icons
const Icon = {
  menu: (s = 24, c = T.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>
    </svg>
  ),
  chat: (s = 18, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 01-11.5 7.2L4 20l1-4.7A8 8 0 1121 12z"/>
    </svg>
  ),
  back: (s = 24, c = T.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  home: (s = 22, c = T.ink70, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"/>
    </svg>
  ),
  blocks: (s = 22, c = T.ink70, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
      <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
    </svg>
  ),
  flag: (s = 22, c = T.ink70, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 21V4h10l1 3h5v9h-6l-1-3H6v8"/>
    </svg>
  ),
  bulb: (s = 22, c = T.ink70, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0012 3z"/>
    </svg>
  ),
  bookmark: (s = 18, c = T.coral, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinejoin="round">
      <path d="M6 3h12v18l-6-4-6 4V3z"/>
    </svg>
  ),
  check: (s = 18, c = T.coral) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 10 18 20 6"/>
    </svg>
  ),
  lock: (s = 14, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7a4 4 0 018 0v4"/>
    </svg>
  ),
  heart: (s = 18, c = T.coral, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinejoin="round">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/>
    </svg>
  ),
  share: (s = 18, c = T.coral) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.5" y1="10.5" x2="15.5" y2="6.5"/><line x1="8.5" y1="13.5" x2="15.5" y2="17.5"/>
    </svg>
  ),
  star: (s = 22, c = T.coral, filled = false) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.8" strokeLinejoin="round">
      <polygon points="12 3 15 9.5 22 10.5 17 15.5 18.5 22.5 12 19 5.5 22.5 7 15.5 2 10.5 9 9.5"/>
    </svg>
  ),
  gift: (s = 22, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" fill={T.mustard} stroke={T.mustard}/>
      <rect x="5" y="12" width="14" height="9" rx="1" fill={T.mustard} stroke={T.mustard}/>
      <line x1="12" y1="8" x2="12" y2="21" stroke="#fff" strokeWidth="1.5"/>
      <path d="M12 8s-3-5-5-3 2 3 5 3zM12 8s3-5 5-3-2 3-5 3z" fill="#fff" stroke="#fff" strokeWidth="1"/>
    </svg>
  ),
  plus: (s = 14, c = T.coral) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  chevronDown: (s = 16, c = T.ink70) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  chevronRight: (s = 16, c = T.ink70) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  play: (s = 22, c = T.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <polygon points="7 4 21 12 7 20"/>
    </svg>
  ),
  calendar: (s = 18, c = T.ink70) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>
    </svg>
  ),
  search: (s = 18, c = T.ink40) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/>
    </svg>
  ),
  google: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24">
      <path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 01-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6z" fill="#4285F4"/>
      <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0012 22z" fill="#34A853"/>
      <path d="M6.4 13.8a6 6 0 010-3.8V7.4H3a10 10 0 000 9l3.4-2.6z" fill="#FBBC05"/>
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003 7.4l3.4 2.6C7.2 7.7 9.4 5.9 12 5.9z" fill="#EA4335"/>
    </svg>
  ),
  mail: (s = 20, c = T.coral) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
    </svg>
  ),
  edit: (s = 18, c = T.ink70) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 20h4l11-11-4-4L4 16v4z"/>
    </svg>
  ),
  crown: (s = 20, c = T.mustard) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M3 18h18l-1-10-5 4-3-6-3 6-5-4-1 10z"/>
    </svg>
  ),
  users: (s = 20, c = T.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 3-6 6-6s6 2.5 6 6"/>
      <circle cx="17" cy="7" r="2.5"/><path d="M15 14c3 0 6 2 6 6"/>
    </svg>
  ),
  x: (s = 22, c = T.ink) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  ),
};

window.IllusTile = IllusTile;
window.Laurel = Laurel;
window.Icon = Icon;

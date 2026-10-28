// FoodVisor — Icon set (custom, hand-tuned strokes; not from a standard pack)
// All icons inherit currentColor; default size 20

const Icon = ({ children, size = 20, stroke = 1.5, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ flexShrink: 0, ...style }}>
    {children}
  </svg>
);

const I = {
  // Bottom nav
  today:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  diary:    (p) => <Icon {...p}><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></Icon>,
  scan:     (p) => <Icon {...p}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M7 12h10"/></Icon>,
  insights: (p) => <Icon {...p}><path d="M4 19V5M4 19h16"/><path d="M8 15l3-4 3 2 4-7"/></Icon>,
  profile:  (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></Icon>,

  // Actions
  plus:     (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  search:   (p) => <Icon {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></Icon>,
  camera:   (p) => <Icon {...p}><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></Icon>,
  barcode:  (p) => <Icon {...p}><path d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M19 6v12" /></Icon>,
  flame:    (p) => <Icon {...p}><path d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-4 1-6-1-9z"/></Icon>,
  drop:     (p) => <Icon {...p}><path d="M12 3c-3 5-6 7-6 11a6 6 0 0 0 12 0c0-4-3-6-6-11z"/></Icon>,
  heart:    (p) => <Icon {...p}><path d="M12 20s-7-4-9-9a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c-1 5-7 9-7 9z"/></Icon>,
  bell:     (p) => <Icon {...p}><path d="M6 9a6 6 0 1 1 12 0c0 4 2 6 2 6H4s2-2 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></Icon>,
  settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.9c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></Icon>,
  arrow_l:  (p) => <Icon {...p}><path d="M19 12H5M12 5l-7 7 7 7"/></Icon>,
  arrow_r:  (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>,
  chevron:  (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  chevron_d:(p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  close:    (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  check:    (p) => <Icon {...p}><path d="m4 12 5 5L20 6"/></Icon>,
  bookmark: (p) => <Icon {...p}><path d="M6 4h12v16l-6-4-6 4z"/></Icon>,
  edit:     (p) => <Icon {...p}><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></Icon>,
  trash:    (p) => <Icon {...p}><path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></Icon>,
  flask:    (p) => <Icon {...p}><path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 19l-5-10V3"/></Icon>,
  scale:    (p) => <Icon {...p}><path d="M5 21h14M7 21V9l5-5 5 5v12"/><path d="M9 13h6"/></Icon>,
  spark:    (p) => <Icon {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></Icon>,
  flag:     (p) => <Icon {...p}><path d="M5 21V4h11l-2 4 2 4H5"/></Icon>,
  apple:    (p) => <Icon {...p}><path d="M12 7c0-2 2-3 4-3-0 2-2 3-4 3zM7 9c-2 0-4 2-4 5s2 7 5 7c1 0 2-1 4-1s3 1 4 1c3 0 5-4 5-7s-2-5-4-5c-2 0-3 1-5 1s-3-1-5-1z"/></Icon>,
  rice:     (p) => <Icon {...p}><path d="M5 12c0-4 3-7 7-7s7 3 7 7v2H5z"/><path d="M5 14h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/></Icon>,
  egg:      (p) => <Icon {...p}><path d="M12 4c-4 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3-11-7-11z"/></Icon>,
  leaf:     (p) => <Icon {...p}><path d="M5 19c0-9 7-14 15-14-1 9-6 15-15 14z"/><path d="M5 19l8-8"/></Icon>,
  fish:     (p) => <Icon {...p}><path d="M3 12c4-6 11-6 15 0-4 6-11 6-15 0z"/><path d="m18 9 3-2v10l-3-2M7 12h.01"/></Icon>,
  mug:      (p) => <Icon {...p}><path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 4v2M11 4v2"/></Icon>,
  key:      (p) => <Icon {...p}><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/></Icon>,
  zap:      (p) => <Icon {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7z"/></Icon>,
  globe:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></Icon>,
  clock:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  trend_up: (p) => <Icon {...p}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></Icon>,
  copy:     (p) => <Icon {...p}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></Icon>,
  filter:   (p) => <Icon {...p}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></Icon>,
  more:     (p) => <Icon {...p}><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></Icon>,
  qr:       (p) => <Icon {...p}><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2h-2zM18 18v2h2"/></Icon>,
  bolt_fill:(p) => <Icon {...p} stroke={null}><path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor"/></Icon>,
};

window.I = I;
window.FvIcon = Icon;

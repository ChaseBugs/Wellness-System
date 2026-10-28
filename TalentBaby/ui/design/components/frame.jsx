// Phone frame — matches Android spec from reference but with our palette
function Phone({ children, showStatusBar = true, statusDark = false, bgColor = T.cream }) {
  return (
    <div style={{
      width: 390, height: 820, borderRadius: 36,
      background: bgColor,
      border: '10px solid #1a1510',
      boxShadow: '0 30px 80px rgba(139, 75, 45, 0.25), 0 0 0 2px rgba(0,0,0,0.15)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {showStatusBar && <StatusBar dark={statusDark} />}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function StatusBar({ dark = false }) {
  const c = dark ? '#fff' : T.ink;
  return (
    <div style={{
      height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px 0 22px', flexShrink: 0, position: 'relative',
      fontFamily: "'Inter', system-ui", fontSize: 13, fontWeight: 600, color: c,
      zIndex: 10,
    }}>
      <span>9:41</span>
      <div style={{
        position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)',
        width: 90, height: 22, borderRadius: 14, background: '#1a1510',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 10.5L.5 3.5a9.9 9.9 0 0114 0L7.5 10.5z" fill={c}/></svg>
        <svg width="14" height="11" viewBox="0 0 14 11"><rect x="1" y="1" width="12" height="9" rx="2" fill="none" stroke={c} strokeWidth="1"/><rect x="3" y="3" width="8" height="5" rx="0.5" fill={c}/></svg>
      </div>
    </div>
  );
}

// Bottom nav (4 tabs)
function BottomNav({ active, onTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Icon.home },
    { id: 'activities', label: 'Activities', icon: Icon.blocks },
    { id: 'milestones', label: 'Milestones', icon: Icon.flag },
    { id: 'library', label: 'Library', icon: Icon.bulb },
  ];
  return (
    <div style={{
      display: 'flex', background: '#fff',
      borderTop: `1px solid ${T.line}`,
      padding: '8px 0 10px',
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const color = isActive ? T.coralDeep : T.ink40;
        return (
          <button key={t.id} onClick={() => onTab && onTab(t.id)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 0', fontFamily: 'inherit',
            }}>
            {t.icon(22, color, isActive)}
            <span style={{
              fontSize: 11, fontWeight: isActive ? 700 : 500, color,
              letterSpacing: 0.2,
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Top bar shared across main app screens
function AppTopBar({ onMenu, title, children, curveColor = T.blush }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${T.blush} 0%, ${curveColor} 100%)`,
      padding: '12px 18px 28px',
      borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onMenu} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
          {Icon.menu(24, T.ink)}
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.coral, color: '#fff',
          padding: '8px 14px 8px 16px', borderRadius: 100,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(240, 139, 107, 0.35)',
        }}>
          Parenting Support
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.chat(14, T.coral)}</div>
        </div>
      </div>
      {children}
      {/* decorative cloud */}
      <svg style={{ position: 'absolute', right: -20, bottom: 20, opacity: 0.4 }} width="120" height="50" viewBox="0 0 120 50">
        <path d="M10 40 Q20 20 40 28 Q50 15 70 22 Q90 10 110 30 L110 50 L10 50 Z" fill="#fff"/>
      </svg>
    </div>
  );
}

// Shared curved header for non-main screens
function CurvedHeader({ children, height = 140, onBack }) {
  return (
    <div style={{ position: 'relative', paddingBottom: 28 }}>
      <div style={{
        background: `linear-gradient(180deg, ${T.blush}, ${T.peach})`,
        paddingTop: 10, paddingBottom: 40, padding: '10px 18px 40px',
      }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', marginBottom: 6 }}>
            {Icon.back(22, T.ink)}
          </button>
        )}
        {children}
      </div>
      {/* curved bottom */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'block' }}
        width="100%" height="30" viewBox="0 0 390 30" preserveAspectRatio="none">
        <path d="M0 0 Q195 40 390 0 L390 30 L0 30 Z" fill={T.cream}/>
      </svg>
    </div>
  );
}

// Gift FAB
function GiftFab({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 14, bottom: 14,
      width: 54, height: 54, borderRadius: 14,
      background: T.coral, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 18px rgba(240, 139, 107, 0.5)',
    }}>
      {Icon.gift(26, '#fff')}
    </button>
  );
}

window.Phone = Phone;
window.StatusBar = StatusBar;
window.BottomNav = BottomNav;
window.AppTopBar = AppTopBar;
window.CurvedHeader = CurvedHeader;
window.GiftFab = GiftFab;

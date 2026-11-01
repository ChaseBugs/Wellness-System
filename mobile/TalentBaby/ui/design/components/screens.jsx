// Other main screens: Activities tab, Milestones, Library, Sidebar, Activity Detail, Growth Tracker

function ActivitiesTab({ onMenu, onActivity, onTab, onGift }) {
  const [month, setMonth] = React.useState(4);
  const [cat, setCat] = React.useState('All');
  const cats = ['All', 'Physical', 'Cognitive', 'Communication'];
  const list = [
    { id: 's1', title: 'Source Of Sound', cat: 'Memory and Attention', catColor: T.plum, done: 10328, hue: 'cream', time: '5 min.', locked: false },
    { id: 'touch', title: 'The Touch', cat: 'Sensory Play', catColor: T.coral, done: 5457, hue: 'blush', locked: true },
    { id: 'creep', title: 'Creeping L1', cat: 'Gross Motor', catColor: T.sage, done: 8273, hue: 'sage', locked: true },
    { id: 'toy', title: 'Bring The Toy Closer', cat: 'Concept Learning', catColor: T.mustard, done: 5682, hue: 'plum', locked: true },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.cream }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: `linear-gradient(180deg, ${T.blush}, ${T.peach})`, padding: '12px 18px 36px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onMenu} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
              {Icon.menu(24, T.ink)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
              background: T.coral, color: '#fff', padding: '8px 14px 8px 16px', borderRadius: 100,
              fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(240,139,107,0.35)' }}>
              Parenting Support
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.chat(14, T.coral)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: 16 }}>
            {[-1, 0, 1].map(off => {
              const m = month + off;
              if (m < 1) return <div key={off} style={{ width: 90 }}/>;
              return (
                <button key={off} onClick={() => setMonth(m)} style={{
                  background: off === 0 ? T.ink70 : 'transparent', border: 'none',
                  padding: off === 0 ? '8px 18px' : '6px 0', borderRadius: 100,
                  color: off === 0 ? '#fff' : T.ink70,
                  fontSize: 14, fontWeight: off === 0 ? 700 : 500,
                  fontFamily: 'inherit', cursor: 'pointer',
                }}>{m}{ordinal(m)} Month</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18, overflow: 'auto', paddingBottom: 4 }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '9px 18px', borderRadius: 100,
                background: cat === c ? '#fff' : 'transparent',
                border: `1.5px solid ${cat === c ? '#fff' : 'rgba(43,31,26,0.3)'}`,
                color: cat === c ? T.ink : T.ink70,
                fontSize: 13, fontWeight: 600, flexShrink: 0, cursor: 'pointer',
                fontFamily: 'inherit',
              }}>{c}</button>
            ))}
          </div>
        </div>
        <svg style={{ display: 'block', marginTop: -28 }} width="100%" height="30" viewBox="0 0 390 30" preserveAspectRatio="none">
          <path d="M0 0 Q195 40 390 0 L390 30 L0 30 Z" fill={T.cream}/>
        </svg>
        <div style={{ padding: '0 14px', marginTop: -4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <button style={{
              padding: '8px 16px', borderRadius: 100, background: '#fff',
              border: `1.5px solid ${T.coral}`, color: T.coralDeep,
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            }}>Sub Category {Icon.chevronDown(14, T.coralDeep)}</button>
            <div style={{ width: 34, height: 34, borderRadius: '50%',
              border: `1.5px solid ${T.coral}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>{Icon.bookmark(16, T.coral)}</div>
          </div>
          {list.map((a, i) => (
            <ActivityRow key={a.id} a={a} onClick={() => onActivity && onActivity(a)}
              isLast={i === list.length - 1}/>
          ))}
        </div>
        <div style={{ height: 30 }}/>
      </div>
      <BottomNav active="activities" onTab={onTab}/>
    </div>
  );
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function ActivityDetail({ onBack, activity }) {
  const a = activity || { title: 'Source Of Sound', cat: 'Memory and Attention', catColor: T.plum, done: 10328, hue: 'cream' };
  return (
    <div style={{ height: '100%', background: '#fff', overflow: 'auto' }}>
      <div style={{ position: 'relative', height: 280, background: T.creamDeep,
        backgroundImage: `repeating-linear-gradient(45deg, ${T.creamDeep} 0 10px, ${T.peach} 10px 11px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 16, left: 16, width: 40, height: 40,
          borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>{Icon.back(22, T.ink)}</button>
        <div style={{ background: 'rgba(255,255,255,0.85)', padding: '8px 14px', borderRadius: 6,
          fontFamily: 'ui-monospace', fontSize: 11, color: T.ink70 }}>[ {a.title} illustration ]</div>
        <div style={{ position: 'absolute', bottom: '40%', left: '50%', transform: 'translate(-50%, 50%)',
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.play(26, T.ink)}
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(i => Icon.star(24, T.coral, false))}
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {Icon.bookmark(22, T.coral)}
            {Icon.share(22, T.coral)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14,
          borderBottom: `1px solid ${T.line}`, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: T.ink70 }}>Done by<br/><b style={{ color: T.ink }}>{a.done.toLocaleString()} Babies</b></div>
          <div style={{ width: 1, height: 36, background: T.line }}/>
          <button style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${T.coral}`,
            background: '#fff', color: T.coralDeep, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Too Easy</button>
          <button style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${T.coral}`,
            background: '#fff', color: T.coralDeep, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Too Hard</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🧠</span>
          <span style={{ color: a.catColor, fontSize: 13 }}>{a.cat}</span>
        </div>
        <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 24,
          color: T.coralDeep, margin: '0 0 10px' }}>{a.title}</h2>
        <p style={{ fontSize: 14, color: T.ink70, lineHeight: 1.55, margin: '0 0 18px' }}>
          Take a rattle or a toy that makes noise and move it up and down, shaking it 3-4 inches away from the baby's ear.
          Take a pause and observe the baby as she looks around, smiling, turning her head. After a pause, repeat again and observe.
          Keep increasing the distance and change directions. This helps the baby to stimulate her sense of audition and ability
          to locate the source of the sound.
        </p>
        <Detail title="Frequency" body="Once a day for a week"/>
        <Detail title="Benefits" list={['Enhance sound source tracking']}/>
        <Detail title="Material Required" body="Nothing, just you and your little one"/>
      </div>
    </div>
  );
}

function Detail({ title, body, list }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 4,
        fontFamily: "'Nunito', system-ui" }}>{title}</div>
      {body && <div style={{ fontSize: 14, color: T.ink70, lineHeight: 1.5 }}>{body}</div>}
      {list && list.map((l, i) => (
        <div key={i} style={{ fontSize: 14, color: T.ink70, lineHeight: 1.5,
          display: 'flex', gap: 8 }}>
          <span style={{ color: T.coral }}>•</span><span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function MilestonesTab({ onMenu, onTab }) {
  const [month, setMonth] = React.useState(3);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.cream }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: `linear-gradient(180deg, ${T.blush}, ${T.peach})`, padding: '12px 18px 36px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onMenu} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
              {Icon.menu(24, T.ink)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.coral, color: '#fff',
              padding: '8px 14px 8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 12px rgba(240,139,107,0.35)' }}>
              Parenting Support
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.chat(14, T.coral)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: 16 }}>
            {[-1, 0, 1].map(off => {
              const m = month + off;
              if (m < 1) return <div key={off} style={{ width: 90 }}/>;
              return (
                <button key={off} onClick={() => setMonth(m)} style={{
                  background: off === 0 ? T.ink70 : 'transparent', border: 'none',
                  padding: off === 0 ? '8px 18px' : '6px 0', borderRadius: 100,
                  color: off === 0 ? '#fff' : T.ink70,
                  fontSize: 14, fontWeight: off === 0 ? 700 : 500,
                  fontFamily: 'inherit', cursor: 'pointer',
                }}>{m}{ordinal(m)} Month</button>
              );
            })}
          </div>
        </div>
        <svg style={{ display: 'block', marginTop: -28 }} width="100%" height="30" viewBox="0 0 390 30" preserveAspectRatio="none">
          <path d="M0 0 Q195 40 390 0 L390 30 L0 30 Z" fill={T.cream}/>
        </svg>
        <div style={{ padding: '10px 18px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
            color: T.coralDeep, margin: '0 0 6px' }}>Check Milestone Progress ⓘ</h2>
          <p style={{ fontSize: 12, color: T.ink70, margin: 0 }}>Gain insights into your baby's progress by benchmarking<br/>with data of <b style={{ color: T.coralDeep }}>46100 babies</b></p>
        </div>
        <div style={{ margin: '16px 14px', background: '#fff', borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 6px 20px rgba(139,75,45,0.08)' }}>
          <div style={{ padding: '14px 16px', background: T.sage, color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>Physical</span>
            {Icon.chevronDown(18, '#fff')}
          </div>
          {[
            'Begins to take weight on hands during tummy time for a few seconds.',
            'Looks closely at objects and tries to grab them if held close to their face and hand.',
          ].map((q, i) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: i === 0 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 14, color: T.ink70, lineHeight: 1.5 }}>
                <span>{i+1}.</span><span>{q}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {['Yes', 'No', 'Almost'].map(o => (
                  <button key={o} style={{ padding: '7px 18px', borderRadius: 100,
                    border: `1.5px solid ${T.line}`, background: '#fff',
                    fontSize: 13, color: T.ink70, fontFamily: 'inherit', cursor: 'pointer' }}>{o}</button>
                ))}
              </div>
              <button style={{ marginTop: 12, width: '100%', padding: '10px',
                borderRadius: 8, background: T.creamDeep, border: 'none',
                color: T.ink70, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', padding: '10px 14px',
              }}>Related Activities {Icon.chevronDown(14, T.ink70)}</button>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px 24px' }}>
          <button style={{ width: '100%', padding: '14px', borderRadius: 100,
            background: '#D8CFC5', border: 'none', color: T.ink40,
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Create Report</button>
        </div>
      </div>
      <BottomNav active="milestones" onTab={onTab}/>
    </div>
  );
}

function LibraryTab({ onMenu, onTab, onGrowth }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.cream }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: `linear-gradient(180deg, ${T.blush}, ${T.peach})`, padding: '12px 18px 50px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onMenu} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
              {Icon.menu(24, T.ink)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.coral, color: '#fff',
              padding: '8px 14px 8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 12px rgba(240,139,107,0.35)' }}>
              Parenting Support
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.chat(14, T.coral)}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, position: 'relative' }}>
            <div style={{ fontSize: 24 }}>☁️</div>
            <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
              color: T.ink, margin: '4px 0 4px' }}>Parenting Library</h2>
            <p style={{ fontSize: 13, color: T.ink70, margin: 0 }}>The one stop space for all your needs!</p>
          </div>
        </div>
        <svg style={{ display: 'block', marginTop: -32 }} width="100%" height="30" viewBox="0 0 390 30" preserveAspectRatio="none">
          <path d="M0 0 Q195 40 390 0 L390 30 L0 30 Z" fill={T.cream}/>
        </svg>

        <div style={{ padding: '10px 14px 20px' }}>
          <LibraryCard title="Wisdom & Insights" hue="sky" big label="[ family reading together ]"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <LibraryCard title="Nutrition & Recipes" hue="mustard" label="[ baby eating ]"/>
            <LibraryCard title="Story Time" hue="plum" label="[ kid imagination ]"/>
          </div>
          <div style={{ marginTop: 12 }}>
            <LibraryCard title="Growth Tracker" hue="sage" label="[ chart preview ]" onClick={onGrowth}/>
          </div>
        </div>
      </div>
      <BottomNav active="library" onTab={onTab}/>
    </div>
  );
}

function LibraryCard({ title, hue, big, label, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(139,75,45,0.06)',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ height: big ? 180 : 140 }}>
        <IllusTile label={label} hue={hue} w="100%" h="100%"/>
      </div>
      <div style={{ padding: '12px 14px', fontSize: 15, fontWeight: 800,
        fontFamily: "'Nunito', system-ui", color: T.ink }}>{title}</div>
    </div>
  );
}

function Sidebar({ open, onClose, onGrowth }) {
  if (!open) return null;
  const items = [
    { label: 'Upgrade to Premium', icon: Icon.crown(20, T.mustard), color: T.coralDeep, bold: true },
    { label: 'Add Partner', icon: <span style={{ fontSize: 18 }}>💞</span> },
    { label: 'Invite a Friend', icon: Icon.users(18, T.ink) },
    { label: 'Parenting Support', icon: Icon.chat(18, T.ink) },
    { label: 'Rate Us', icon: Icon.star(18, T.ink, false) },
  ];
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
      zIndex: 100, animation: 'fadeIn 0.2s',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 300, height: '100%', background: '#fff',
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.25s',
      }}>
        <div style={{ background: T.coral, padding: '28px 18px 20px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 26 }}>
              👶
              <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20,
                borderRadius: '50%', background: T.sage, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.check(12, '#fff')}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.terracotta }}>Super</div>
            <div style={{ flex: 1 }}/>
            {Icon.edit(18, '#fff')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👶</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>Add Baby</div>
          </div>
          <div style={{ marginTop: 18, fontSize: 11, opacity: 0.85 }}>Logged in as:</div>
          <div style={{ fontSize: 13 }}>parent@example.com</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: `1px solid ${T.line}`,
              color: it.color || T.ink, fontWeight: it.bold ? 700 : 500, fontSize: 14,
              cursor: 'pointer',
            }}>{it.icon}<span>{it.label}</span></div>
          ))}
          <div onClick={onGrowth} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            borderBottom: `1px solid ${T.line}`, color: T.ink, fontSize: 14,
            fontWeight: 700, cursor: 'pointer',
          }}>{Icon.menu(18, T.ink)}<span>More Options</span></div>
        </div>
        <button style={{ padding: 18, textAlign: 'left', background: 'none',
          border: 'none', color: T.coralDeep, fontSize: 15, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer' }}>Logout</button>
      </div>
    </div>
  );
}

function GrowthTracker({ onBack }) {
  const [tab, setTab] = React.useState('Weight');
  const [ageRange, setAgeRange] = React.useState(0);
  const ranges = ['0 Month - 6 Month', '6 Month - 12 Month', '12 Month - 18 Month'];
  return (
    <div style={{ height: '100%', background: '#fff', overflow: 'auto' }}>
      <div style={{ background: `linear-gradient(180deg, ${T.peach}, ${T.coral})`,
        padding: '12px 18px 40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer' }}>
            {Icon.back(24, T.ink)}
          </button>
          <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
            color: T.ink, margin: 0 }}>Growth Tracker</h2>
        </div>
        <div style={{ display: 'flex', borderRadius: 100, background: 'rgba(255,255,255,0.35)',
          padding: 4, marginTop: 20, border: `1.5px solid #fff` }}>
          {['Weight', 'Height'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', borderRadius: 100, border: 'none',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? T.coralDeep : '#fff',
              fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </div>
      <svg style={{ display: 'block', marginTop: -28 }} width="100%" height="30" viewBox="0 0 390 30" preserveAspectRatio="none">
        <path d="M0 0 Q195 40 390 0 L390 30 L0 30 Z" fill={T.cream}/>
      </svg>
      <div style={{ padding: '0 14px 20px', background: T.cream, minHeight: 400 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 18,
          boxShadow: '0 6px 20px rgba(139,75,45,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink,
              fontFamily: "'Nunito', system-ui", display: 'flex', alignItems: 'center', gap: 8 }}>
              {tab} Chart <span style={{ width: 18, height: 18, borderRadius: '50%',
                border: `1.5px solid ${T.ink40}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, color: T.ink40 }}>i</span>
            </div>
            <div style={{ display: 'flex', background: T.creamDeep, borderRadius: 100, padding: 3 }}>
              <span style={{ padding: '4px 12px', background: T.coral, color: '#fff',
                borderRadius: 100, fontSize: 11, fontWeight: 700 }}>SI</span>
              <span style={{ padding: '4px 12px', fontSize: 11, color: T.ink70, fontWeight: 600 }}>IMP</span>
            </div>
          </div>
          <GrowthChart tab={tab} ageRange={ageRange}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12,
            color: T.coralDeep, fontSize: 13 }}>
            <button onClick={() => setAgeRange(Math.max(0, ageRange - 1))} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <div style={{ transform: 'scaleX(-1)' }}>{Icon.chevronRight(16, T.coralDeep)}</div>
            </button>
            <u>{ranges[ageRange]}</u>
            <button onClick={() => setAgeRange(Math.min(2, ageRange + 1))} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {Icon.chevronRight(16, T.coralDeep)}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 18, padding: '30px 18px',
          boxShadow: '0 6px 20px rgba(139,75,45,0.08)', textAlign: 'center' }}>
          <div style={{ color: T.ink70, fontSize: 14 }}>Your Data Comes Here</div>
        </div>
        <button style={{ width: '100%', marginTop: 16, padding: '15px', borderRadius: 100,
          background: T.coral, border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(240,139,107,0.4)',
        }}>{Icon.plus(16, '#fff')} Add Data</button>
      </div>
    </div>
  );
}

function GrowthChart({ tab, ageRange }) {
  // simple SVG bands
  const base = tab === 'Weight' ? 4 : 50;
  const max = tab === 'Weight' ? 12 : 75;
  const label = tab === 'Weight' ? 'Weight (kg)' : 'Height (cm)';
  const unit = tab === 'Weight' ? [3, 6, 9, 12] : [50, 58, 67, 75];
  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height="180" viewBox="0 0 320 180">
        {/* y axis labels */}
        {unit.map((u, i) => (
          <text key={i} x="0" y={160 - i * 40} fontSize="10" fill={T.ink70}>{u}</text>
        ))}
        <text x="-80" y="10" fontSize="10" fill={T.ink70} transform="rotate(-90 20 90)">{label}</text>
        {/* bands */}
        <path d="M30 130 Q100 80 200 60 L290 45 L290 85 Q200 100 100 115 L30 160 Z" fill={T.blush} opacity="0.5"/>
        <path d="M30 125 Q100 85 200 65 L290 55 L290 75 Q200 90 100 110 L30 145 Z" fill={T.peach} opacity="0.7"/>
        <path d="M30 120 Q100 90 200 70 L290 65 Q200 80 100 100 L30 135 Z" fill={T.coral} opacity="0.6"/>
        {/* x axis */}
        <line x1="30" y1="160" x2="290" y2="160" stroke={T.line} strokeWidth="1"/>
        {[0,1,2,3,4,5,6].map(i => (
          <text key={i} x={30 + i * 43} y="175" fontSize="10" fill={T.ink70} textAnchor="middle">{i + ageRange * 6}</text>
        ))}
        <text x="160" y="195" fontSize="10" fill={T.ink70} textAnchor="middle">Months</text>
      </svg>
    </div>
  );
}

Object.assign(window, {
  ActivitiesTab, ActivityDetail, MilestonesTab, LibraryTab, Sidebar, GrowthTracker,
});

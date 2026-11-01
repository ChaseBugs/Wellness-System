// Home & main app screens

const ACTIVITIES = [
  { id: 'eye', title: 'Eye Movement', cat: 'Hand-Eye-Spatial', catColor: T.sage, done: 6245, hue: 'peach', time: '5 min.', locked: false, bookmarked: false },
  { id: 'hands', title: 'Recognizing Hands', cat: 'Self Awareness', catColor: T.coral, done: 3820, hue: 'blush', locked: true },
  { id: 'cycle', title: 'Cycle Movement', cat: 'Muscle development', catColor: T.sage, done: 3428, hue: 'mustard', locked: true },
  { id: 'sound', title: 'Distinguish Sounds', cat: 'Early Exploration', catColor: T.sky, done: 1469, hue: 'plum', locked: true },
];

const ACTIVITIES_25 = [
  { id: 'touch', title: 'The Touch', cat: 'Sensory Play', catColor: T.coral, done: 5457, hue: 'blush', time: '5 min.', locked: false },
  { id: 'track', title: 'Tracking Sound', cat: 'Sound', catColor: T.mustard, done: 3623, hue: 'peach', locked: true },
  { id: 'speak', title: 'Speaking Differently', cat: 'Speech Development', catColor: T.mustard, done: 4167, hue: 'cream', locked: true },
  { id: 'head', title: 'Head Lift L2', cat: 'Gross Motor', catColor: T.sage, done: 3486, hue: 'sage', locked: true },
];

const ACTIVITIES_26 = [
  { id: 'tactile', title: 'Tactile Sense 2', cat: 'Sensory Play', catColor: T.coral, done: 5340, hue: 'blush', time: '5 min.', locked: false },
  { id: 'push', title: 'Pushing Legs', cat: 'Gross Motor', catColor: T.sage, done: 3741, hue: 'plum', locked: true },
  { id: 'lang', title: 'Language L1', cat: 'Language Comprehe…', catColor: T.mustard, done: 2076, hue: 'cream', locked: true },
  { id: 'object', title: 'Object Feeling', cat: 'Hand Coordination', catColor: T.sage, done: 1717, hue: 'peach', locked: true },
];

function HomeScreen({ onMenu, onActivity, onGrowth, onTab, onGift }) {
  const [dateIdx, setDateIdx] = React.useState(1);
  const dates = ['23rd Apr', '24th Apr', '25th Apr', '26th Apr'];
  const activitiesByDate = [ACTIVITIES, ACTIVITIES, ACTIVITIES_25, ACTIVITIES_26];
  const list = activitiesByDate[dateIdx];

  const categories = [
    { label: 'ACTIVITIES', sub: "Boost your baby's growth", bg: '#F8A89A', emoji: '🧩' },
    { label: 'MILESTONES', sub: 'Create growth reports for baby', bg: '#F2B279', emoji: '🚩' },
    { label: 'WEIGHT', sub: 'Track height & weight', bg: '#A8C5D6', emoji: '⚖️' },
    { label: 'NUTRITION', sub: 'Recipes for baby & mom', bg: '#C9A9D1', emoji: '🍎' },
    { label: 'STORIES', sub: 'Boost creativity and imagination', bg: '#9CBF93', emoji: '📖' },
    { label: 'ARTICLES', sub: 'Daily dose of wisdom for you', bg: '#8B7BAE', emoji: '📝' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      background: T.cream, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', overflowX: 'hidden' }}>
        <AppTopBar onMenu={onMenu}>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {categories.map((c, i) => (
              <button key={i} onClick={() => {
                if (c.label === 'WEIGHT') onGrowth && onGrowth();
                else if (c.label === 'ACTIVITIES') onTab && onTab('activities');
                else if (c.label === 'MILESTONES') onTab && onTab('milestones');
                else if (c.label === 'STORIES' || c.label === 'ARTICLES' || c.label === 'NUTRITION') onTab && onTab('library');
              }} style={{
                background: c.bg, borderRadius: 14, border: 'none',
                padding: '14px 12px', textAlign: 'left', cursor: 'pointer',
                color: '#fff', fontFamily: 'inherit', minHeight: 90,
                boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>{c.label}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.95, lineHeight: 1.25 }}>{c.sub}</div>
              </button>
            ))}
          </div>
        </AppTopBar>

        <div style={{ padding: '20px 18px 10px' }}>
          <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
            color: T.ink, margin: 0 }}>Today's Development Plan</h2>
        </div>

        <div style={{ margin: '8px 14px', background: '#fff', borderRadius: 18,
          boxShadow: '0 6px 20px rgba(139, 75, 45, 0.08)', padding: '18px 14px 12px' }}>
          <div style={{ textAlign: 'center', fontFamily: "'Nunito', system-ui",
            fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 14 }}>Activities</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 }}>
            {[-1, 0, 1].map(off => {
              const di = dateIdx + off;
              if (di < 0 || di >= dates.length) return <div key={off} style={{ width: 90 }}/>;
              const isActive = off === 0;
              return (
                <button key={off} onClick={() => setDateIdx(di)} style={{
                  background: isActive ? T.ink70 : 'transparent', border: 'none',
                  padding: isActive ? '8px 20px' : '6px 0', borderRadius: 100,
                  color: isActive ? '#fff' : T.ink70,
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  fontFamily: 'inherit', cursor: 'pointer',
                }}>{dates[di]}</button>
              );
            })}
          </div>
          {list.map((a, i) => (
            <ActivityRow key={a.id} a={a} onClick={() => onActivity && onActivity(a)}
              isLast={i === list.length - 1}/>
          ))}
        </div>

        <div style={{ padding: '20px 18px 10px' }}>
          <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
            color: T.ink, margin: 0 }}>What to expect this month?</h2>
        </div>
        <MilestoneExpect/>

        <div style={{ padding: '18px 18px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
            color: T.ink, margin: 0 }}>Daily Tracker</h2>
          {Icon.calendar(18, T.ink70)}
          <div style={{ flex: 1 }}/>
          {Icon.heart(18, T.coral)}
        </div>
        <DailyTracker/>

        <div style={{ padding: '20px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 22,
            color: T.ink, margin: 0 }}>Tips For Today</h2>
          <button style={{ background: 'none', border: 'none', color: T.ink70, fontSize: 13, cursor: 'pointer' }}>See more</button>
        </div>
        <div style={{ margin: '0 18px 20px', background: T.plum, borderRadius: 16,
          padding: 18, color: '#fff', position: 'relative', minHeight: 140, overflow: 'hidden' }}>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Nunito', system-ui" }}>Physical Development</div>
          <div style={{ fontSize: 13, marginTop: 12, lineHeight: 1.4, maxWidth: 200 }}>
            Median weight (good weight) for a baby at 3 Months should be around 6.4 Kg (boy) or 5.8 Kg (girl)
          </div>
          <div style={{ position: 'absolute', right: 10, top: 10, fontFamily: 'ui-monospace',
            fontSize: 10, background: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: 4 }}>
            [ parent illustration ]
          </div>
          <div style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 12, opacity: 0.8,
            fontFamily: "'Nunito'", fontWeight: 700 }}>LittleBloom</div>
          <div style={{ position: 'absolute', bottom: 30, right: 16, left: 120, height: 1, background: 'rgba(255,255,255,0.35)' }}/>
        </div>
      </div>
      <BottomNav active="home" onTab={onTab}/>
      <GiftFab onClick={onGift}/>
    </div>
  );
}

function ActivityRow({ a, onClick, isLast }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', gap: 12, padding: '12px 4px', cursor: 'pointer', alignItems: 'center',
      borderBottom: isLast ? 'none' : `1px solid ${T.line}`, minWidth: 0,
    }}>
      <IllusTile label={`[ ${a.title} ]`} hue={a.hue} w={80} h={80}/>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.ink,
          fontFamily: "'Nunito', system-ui", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 12, color: a.catColor }}>●</span>
          <span style={{ fontSize: 13, color: a.catColor, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.cat}</span>
        </div>
        <div style={{ fontSize: 11, color: T.ink40, marginTop: 6 }}>Done by: {a.done.toLocaleString()} Babies</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        {a.time && <div style={{ fontSize: 11, color: T.ink40 }}>{a.time}</div>}
        {a.locked ? (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#D8CFC5',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.lock(14, '#fff')}</div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${T.coral}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.bookmark(14, T.coral)}</div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${T.coral}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.check(14, T.coral)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MilestoneExpect() {
  const [tab, setTab] = React.useState('Physical');
  const tabs = ['Physical', 'Cognitive', 'Speech', 'Social'];
  const content = {
    Physical: 'Able to support upper body with their hands on the floor during tummy time.',
    Cognitive: 'Shows interest in watching objects that move across their field of view.',
    Speech: 'Begins to coo, making vowel-like sounds when content or happy.',
    Social: 'Smiles in response to familiar faces and engages in social interaction.',
  };
  return (
    <div style={{ margin: '8px 14px', background: '#fff', borderRadius: 18,
      padding: 16, boxShadow: '0 6px 20px rgba(139,75,45,0.08)' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflow: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 100,
            background: tab === t ? T.coral : T.creamDeep,
            color: tab === t ? '#fff' : T.ink70,
            border: 'none', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
        <div style={{ display: 'flex', gap: 10, fontSize: 14, color: T.ink70, lineHeight: 1.5 }}>
          <span>1.</span><span>{content[tab]}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <button style={{
            background: T.coral, color: '#fff', padding: '10px 22px',
            borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>Milestone Achieved</button>
        </div>
      </div>
    </div>
  );
}

function DailyTracker() {
  return (
    <div style={{ margin: '8px 14px' }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '18px 14px 14px',
        boxShadow: '0 6px 20px rgba(139,75,45,0.08)', display: 'flex', justifyContent: 'space-around' }}>
        {[
          { label: 'Feeding', sub: 'Record Baby Feeds', emoji: '🍼' },
          { label: 'Poop & Pee', sub: 'Record Body Waste', emoji: '💩' },
          { label: 'Sleep', sub: 'Record Baby Sleep', emoji: '🌙' },
        ].map((x, i, arr) => (
          <React.Fragment key={x.label}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 54, height: 54, margin: '0 auto', borderRadius: '50%',
                background: T.creamDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {x.emoji}
                <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', border: `1.5px solid ${T.coral}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Icon.plus(10, T.coral)}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginTop: 8 }}>{x.label}</div>
              <div style={{ fontSize: 10, color: T.ink40, marginTop: 2 }}>{x.sub}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, background: T.line }}/>}
          </React.Fragment>
        ))}
      </div>
      <button style={{
        width: '100%', padding: '13px', marginTop: -1,
        background: T.coral, border: 'none', color: '#fff',
        borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
        fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
      }}>Click to View Analysis</button>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.ActivityRow = ActivityRow;

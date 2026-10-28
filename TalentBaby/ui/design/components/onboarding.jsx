// Onboarding flow screens

function SplashScreen({ onContinue }) {
  React.useEffect(() => {
    const t = setTimeout(() => onContinue && onContinue(), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(160deg, ${T.peach} 0%, ${T.coral} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '80px 0 90px',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {/* baby head glyph */}
        <svg width="110" height="95" viewBox="0 0 110 95" fill="none">
          <path d="M55 8 L55 22" stroke={T.terracotta} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M38 14 L44 26" stroke={T.terracotta} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M72 14 L66 26" stroke={T.terracotta} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M25 20 L34 29" stroke={T.terracotta} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M85 20 L76 29" stroke={T.terracotta} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M22 70 Q20 50 35 38 Q55 28 75 38 Q90 50 88 70" stroke={T.terracotta} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M55 38 Q58 42 55 46 Q52 50 55 54" stroke={T.terracotta} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <circle cx="42" cy="56" r="2.5" fill={T.terracotta}/>
          <circle cx="68" cy="56" r="2.5" fill={T.terracotta}/>
        </svg>
        <div style={{
          fontFamily: "'Nunito', system-ui", fontWeight: 900, fontSize: 58,
          color: T.terracotta, letterSpacing: -1,
        }}>LittleBloom</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Laurel size={44} color={T.terracotta}/>
        <div style={{ textAlign: 'center', color: T.terracotta,
          fontFamily: "'Nunito', system-ui" }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Parents' Choice</div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5 }}>BEST OF 2026</div>
        </div>
        <div style={{ transform: 'scaleX(-1)' }}><Laurel size={44} color={T.terracotta}/></div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart, onLogin }) {
  return (
    <div style={{ padding: '32px 24px 20px', display: 'flex',
      flexDirection: 'column', height: '100%', boxSizing: 'border-box',
      background: T.cream, position: 'relative' }}>
      <BlobDecor />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 14, zIndex: 1 }}>
        <Laurel size={40} color={T.mustard}/>
        <div style={{ textAlign: 'center', fontFamily: "'Nunito', system-ui", color: T.ink70, lineHeight: 1.25 }}>
          <div style={{ fontSize: 11 }}>Award‑Winning</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Development App</div>
          <div style={{ fontSize: 11 }}>Parents' Choice 2026</div>
        </div>
        <div style={{ transform: 'scaleX(-1)' }}><Laurel size={40} color={T.mustard}/></div>
      </div>
      <h1 style={{
        fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 40,
        color: T.terracotta, margin: '28px 0 18px', lineHeight: 1.1, letterSpacing: -0.5, zIndex: 1,
      }}>Raise a Curious<br/>& Happy Baby!</h1>
      <div style={{
        flex: 1, borderRadius: 24, overflow: 'hidden',
        background: `linear-gradient(135deg, ${T.blush}, ${T.peach})`,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        fontFamily: 'ui-monospace, monospace', fontSize: 11, color: T.ink70,
        padding: 14, position: 'relative',
        backgroundImage: `repeating-linear-gradient(135deg, ${T.blush} 0 10px, ${T.peach} 10px 11px)`,
        zIndex: 1,
      }}>
        <span style={{ background: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: 4 }}>
          [ parent + baby hero photo ]
        </span>
      </div>
      <button onClick={onStart} style={{
        marginTop: 18, padding: '17px', borderRadius: 100, border: 'none',
        background: T.coral, color: '#fff', fontSize: 16, fontWeight: 700,
        fontFamily: 'inherit', cursor: 'pointer', zIndex: 1,
        boxShadow: '0 6px 18px rgba(240,139,107,0.45)',
      }}>Let's Get Started</button>
      <button onClick={onLogin} style={{
        marginTop: 12, background: 'none', border: 'none',
        color: T.terracotta, fontSize: 13, fontFamily: 'inherit',
        textDecoration: 'underline', cursor: 'pointer', zIndex: 1,
      }}>I am already a user?</button>
    </div>
  );
}

function BlobDecor() {
  return (
    <>
      <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200,
        borderRadius: '50%', background: T.creamDeep, opacity: 0.7, zIndex: 0 }}/>
      <div style={{ position: 'absolute', bottom: -40, right: -50, width: 160, height: 160,
        borderRadius: '50%', background: T.blush, opacity: 0.6, zIndex: 0 }}/>
    </>
  );
}

function SciencePitch({ onBack, onContinue }) {
  const items = [
    { e: '🧠', text: <><b style={{ color: T.coralDeep }}>85%</b> of brain development happens in the <b style={{ color: T.coralDeep }}>first 1000 days</b> of life.</> },
    { e: '🗝️', text: <>Key to unlock curiosity is the <b style={{ color: T.coralDeep }}>right stimulation</b> at the <b style={{ color: T.coralDeep }}>right time</b>.</> },
    { e: '🚀', text: <><b style={{ color: T.coralDeep }}>Playtime activities</b> stimulate baby's growth and maximise their potential.</> },
  ];
  return (
    <div style={{ padding: '20px 24px', background: T.cream, height: '100%',
      boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <BlobDecor/>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', padding: 6, zIndex: 1 }}>
        {Icon.back(24, T.ink)}
      </button>
      <div style={{ marginTop: 24, zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 28,
          color: T.terracotta, margin: 0 }}>Raising a Curious Baby!</h2>
        <p style={{ color: T.coralDeep, fontSize: 14, margin: '4px 0 28px' }}>the science of baby development.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{it.e}</div>
              <div style={{ fontSize: 16, color: T.ink70, lineHeight: 1.45, paddingTop: 2 }}>{it.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <button onClick={onContinue} style={{
        padding: '17px', borderRadius: 100, border: 'none',
        background: T.coral, color: '#fff', fontSize: 16, fontWeight: 700,
        fontFamily: 'inherit', cursor: 'pointer', zIndex: 1,
        boxShadow: '0 6px 18px rgba(240,139,107,0.45)',
      }}>Set Parenting Goals</button>
    </div>
  );
}

function GoalsScreen({ onBack, onContinue }) {
  const [selected, setSelected] = React.useState(new Set());
  const goals = [
    { id: 'dev', label: 'Boost Development with Activities', icon: '🧩' },
    { id: 'mile', label: 'Measure Progress with Milestones', icon: '🚩' },
    { id: 'story', label: 'Spark Imagination with Stories', icon: '🎧' },
    { id: 'meal', label: 'Get Meal Plan & Recipe Ideas', icon: '🍕' },
    { id: 'sleep', label: 'Analyse Sleep & Feeding Patterns', icon: '📋' },
  ];
  const toggle = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const canContinue = selected.size > 0;
  return (
    <div style={{ padding: '20px 24px', background: T.cream, height: '100%',
      boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <BlobDecor/>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
        alignSelf: 'flex-start', padding: 6, zIndex: 1 }}>{Icon.back(24, T.ink)}</button>
      <div style={{ marginTop: 24, zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 28,
          color: T.terracotta, margin: 0 }}>Set your parenting goals…</h2>
        <p style={{ color: T.coralDeep, fontSize: 14, margin: '4px 0 24px' }}>we'll personalise the program based on it.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map(g => {
            const isSel = selected.has(g.id);
            return (
              <button key={g.id} onClick={() => toggle(g.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 100,
                  background: isSel ? 'rgba(240,139,107,0.1)' : '#fff',
                  border: `1.5px solid ${isSel ? T.coral : T.line}`,
                  color: isSel ? T.coralDeep : T.ink70,
                  fontSize: 15, fontFamily: 'inherit', fontWeight: isSel ? 600 : 500,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <span style={{ fontSize: 20 }}>{g.icon}</span>{g.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <button onClick={() => canContinue && onContinue()} disabled={!canContinue} style={{
        padding: '17px', borderRadius: 100, border: 'none',
        background: canContinue ? T.coral : '#D8CFC5',
        color: canContinue ? '#fff' : T.ink40,
        fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
        cursor: canContinue ? 'pointer' : 'default', zIndex: 1,
      }}>Continue</button>
    </div>
  );
}

function AccountScreen({ onBack, onEmail, onGoogle }) {
  return (
    <div style={{ padding: '20px 24px', background: T.cream, height: '100%',
      boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <BlobDecor/>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
        alignSelf: 'flex-start', padding: 6, zIndex: 1 }}>{Icon.back(24, T.ink)}</button>
      <div style={{ marginTop: 24, zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 28,
          color: T.terracotta, margin: 0 }}>Create your account</h2>
        <p style={{ color: T.coralDeep, fontSize: 14, margin: '4px 0 28px' }}>to save your progress.</p>
        <button onClick={onGoogle} style={{
          width: '100%', padding: '14px 18px', borderRadius: 100,
          background: '#fff', border: `1.5px solid ${T.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 15, color: T.ink70, fontFamily: 'inherit',
          cursor: 'pointer', marginBottom: 12,
        }}>
          {Icon.google(22)}<span>Continue with Google</span>
        </button>
        <button onClick={onEmail} style={{
          width: '100%', padding: '14px 18px', borderRadius: 100,
          background: '#fff', border: `1.5px solid ${T.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 15, color: T.ink70, fontFamily: 'inherit', cursor: 'pointer',
        }}>
          {Icon.mail(22, T.coral)}<span>Continue with Email</span>
        </button>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ textAlign: 'center', zIndex: 1, paddingBottom: 30 }}>
        <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 6 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={T.mustard}>
              <polygon points="12 3 15 9.5 22 10.5 17 15.5 18.5 22.5 12 19 5.5 22.5 7 15.5 2 10.5 9 9.5"/>
            </svg>
          ))}
        </div>
        <div style={{ color: T.ink70, fontSize: 14 }}>Loved by 500k+ Parents</div>
      </div>
    </div>
  );
}

function BabyProfileScreen({ onBack, onContinue }) {
  const [name, setName] = React.useState('');
  const [gender, setGender] = React.useState(null);
  const [dob, setDob] = React.useState('');
  const [premature, setPremature] = React.useState(false);
  const canContinue = name && gender && dob;
  return (
    <div style={{ padding: '20px 24px', background: T.cream, height: '100%',
      boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <BlobDecor/>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
        alignSelf: 'flex-start', padding: 6, zIndex: 1 }}>{Icon.back(24, T.ink)}</button>
      <div style={{ marginTop: 24, zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 28,
          color: T.terracotta, margin: 0 }}>Let's personalise your plan</h2>
        <p style={{ color: T.coralDeep, fontSize: 14, margin: '4px 0 24px' }}>we'll save your progress.</p>

        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Baby's Name"
          style={pillInput}/>

        <div style={{ display: 'flex', borderRadius: 100, marginTop: 12,
          background: '#fff', border: `1.5px solid ${T.line}`, overflow: 'hidden' }}>
          {['Girl', 'Boy'].map(g => (
            <button key={g} onClick={() => setGender(g)}
              style={{
                flex: 1, padding: '13px', border: 'none',
                background: gender === g ? T.coral : 'transparent',
                color: gender === g ? '#fff' : T.ink70,
                fontSize: 15, fontFamily: 'inherit',
                fontWeight: gender === g ? 700 : 500,
                cursor: 'pointer',
              }}>{g}</button>
          ))}
        </div>

        <input type="text" value={dob} onChange={e => setDob(e.target.value)}
          placeholder="Baby's DOB" onFocus={e => e.target.type = 'date'}
          style={{ ...pillInput, marginTop: 12 }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Is the baby premature?</span>
          <button onClick={() => setPremature(!premature)} style={{
            width: 22, height: 22, borderRadius: 4, cursor: 'pointer',
            background: premature ? T.coral : '#fff',
            border: `1.5px solid ${premature ? T.coral : T.ink40}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{premature && Icon.check(14, '#fff')}</button>
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <button onClick={() => canContinue && onContinue()} disabled={!canContinue} style={{
        padding: '17px', borderRadius: 100, border: 'none',
        background: canContinue ? T.coral : '#D8CFC5',
        color: canContinue ? '#fff' : T.ink40,
        fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
        cursor: canContinue ? 'pointer' : 'default', zIndex: 1,
      }}>Continue</button>
    </div>
  );
}

const pillInput = {
  width: '100%', padding: '14px 18px', borderRadius: 100,
  background: '#fff', border: `1.5px solid ${T.line}`,
  fontSize: 15, color: T.ink, fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
};

function TrialScreen({ onStart, onClose }) {
  const steps = [
    { icon: Icon.check(14, '#fff'), bg: T.sage, title: 'Personalise Your Plan', sub: 'You successfully created your profile', strike: true },
    { icon: Icon.lock(14, T.ink70), bg: T.creamDeep, title: 'Today: Get Instant Access', sub: 'All features are unlocked' },
    { icon: <span style={{ fontSize: 12 }}>🔔</span>, bg: T.creamDeep, title: 'Day 5: Trial Reminder', sub: "We'll send you a notification. Cancel anytime in 7 days" },
    { icon: <span style={{ fontSize: 12 }}>⭐</span>, bg: T.creamDeep, title: 'Day 7: Trial Ends', sub: 'Your paid subscription will start on May 25' },
  ];
  return (
    <div style={{ padding: '20px 24px', background: T.cream, height: '100%',
      boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <BlobDecor/>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
        alignSelf: 'flex-end', padding: 6, zIndex: 1 }}>{Icon.x(22, T.ink)}</button>
      <div style={{ textAlign: 'center', zIndex: 1, marginBottom: 30 }}>
        <h2 style={{ fontFamily: "'Nunito', system-ui", fontWeight: 800, fontSize: 30,
          color: T.terracotta, margin: 0 }}>Start your free trial</h2>
        <p style={{ color: T.coralDeep, fontSize: 14, margin: '4px 0 0' }}>here's how it works</p>
      </div>
      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 13, top: 14, bottom: 14, width: 2, background: T.line }}/>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 18, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: s.strike ? T.sage : T.ink,
                textDecoration: s.strike ? 'line-through' : 'none',
              }}>{s.title}</div>
              <div style={{ fontSize: 13, color: s.strike ? T.sage : T.ink70, marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ textAlign: 'center', zIndex: 1, marginBottom: 12 }}>
        <div style={{ color: T.ink, fontSize: 14 }}>Unlimited free access for 7 days, then</div>
        <div style={{ color: T.mustard, fontWeight: 800, fontSize: 15 }}>$39.99 per year ($3.33/month)</div>
        <button style={{ background: 'none', border: 'none', color: T.coralDeep, fontSize: 13,
          marginTop: 8, cursor: 'pointer', fontFamily: 'inherit' }}>View all plans</button>
      </div>
      <button onClick={onStart} style={{
        padding: '17px', borderRadius: 100, border: 'none',
        background: T.coral, color: '#fff', fontSize: 16, fontWeight: 700,
        fontFamily: 'inherit', cursor: 'pointer', zIndex: 1,
        boxShadow: '0 6px 18px rgba(240,139,107,0.45)',
      }}>Start 7 day free trial</button>
    </div>
  );
}

Object.assign(window, {
  SplashScreen, WelcomeScreen, SciencePitch, GoalsScreen,
  AccountScreen, BabyProfileScreen, TrialScreen,
});

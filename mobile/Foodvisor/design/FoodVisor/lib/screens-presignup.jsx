// FoodVisor — Pre-signup flow: Splash, Welcome, Sign-in, Permissions

const { useState: useS3 } = React;

// 00 · SPLASH
function ScreenSplash() {
  return (
    <div className="fv-screen" style={{ background: "var(--ink)", color: "var(--paper)" }}>
      <FvStatusBar dark />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            {/* Wordmark */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="none" stroke="var(--persimmon-l)" strokeWidth="1" />
                <circle cx="22" cy="22" r="14" fill="none" stroke="var(--persimmon-l)" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx="22" cy="22" r="6"  fill="var(--persimmon)" />
              </svg>
            </div>
            <h1 style={{
              fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1, marginTop: 14,
              color: "var(--paper)", fontWeight: 500, letterSpacing: "-0.02em",
            }}>FoodVisor</h1>
            <div className="fv-mono" style={{ fontSize: 10, color: "var(--persimmon-l)", letterSpacing: "0.28em", marginTop: 12 }}>
              CAROLI · ANALYZE
            </div>
          </div>
        </div>
        <div style={{ paddingBottom: 60, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", border: "1px solid rgba(207,244,252,0.2)", borderRadius: 100 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--persimmon)" }} />
            <span className="fv-mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--persimmon-l)" }}>
              LOADING YOUR ALMANAC
            </span>
          </div>
        </div>
      </div>
      <FvNavBar dark />
    </div>
  );
}

// 01 · WELCOME / VALUE PROP CAROUSEL
function ScreenWelcome() {
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div className="fv-body" style={{ padding: "12px 22px 24px", display: "flex", flexDirection: "column" }}>
        {/* skip */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span className="fv-cap" style={{ color: "var(--ink-3)" }}>SKIP</span>
        </div>

        {/* Hero illustration — abstract dial */}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            {/* outer ring with ticks */}
            <circle cx="110" cy="110" r="92" fill="none" stroke="var(--rule)" strokeWidth="1" />
            <circle cx="110" cy="110" r="92" fill="none" stroke="var(--persimmon)" strokeWidth="6"
              strokeDasharray="380 580" transform="rotate(-90 110 110)" strokeLinecap="butt" />
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const x1 = 110 + Math.cos(a) * 100, y1 = 110 + Math.sin(a) * 100;
              const x2 = 110 + Math.cos(a) * (i % 5 === 0 ? 108 : 105);
              const y2 = 110 + Math.sin(a) * (i % 5 === 0 ? 108 : 105);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-4)" strokeWidth={i % 5 === 0 ? 1 : 0.5} />;
            })}
            {/* middle */}
            <circle cx="110" cy="110" r="74" fill="var(--card)" stroke="var(--rule-soft)" />
            <text x="110" y="98" textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--ink-3)" letterSpacing="2">REMAINING</text>
            <text x="110" y="132" textAnchor="middle" fontFamily="var(--serif)" fontSize="42" fill="var(--ink)">1,031</text>
            <text x="110" y="148" textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--ink-4)" letterSpacing="2">KCAL · TODAY</text>
            {/* satellite chips */}
            <g transform="translate(28, 30)">
              <rect width="58" height="22" rx="11" fill="var(--ink)" />
              <text x="29" y="15" textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--paper)" letterSpacing="1">+412 KCAL</text>
            </g>
            <g transform="translate(140, 168)">
              <rect width="56" height="22" rx="11" fill="none" stroke="var(--persimmon)" strokeWidth="1.2" />
              <text x="28" y="15" textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--persimmon)" letterSpacing="1">P · 78G</text>
            </g>
          </svg>
        </div>

        <div className="fv-cap" style={{ textAlign: "center", marginTop: 4 }}>FOR PEOPLE WHO LIKE NUMBERS</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, lineHeight: 1.05, textAlign: "center", marginTop: 10, fontWeight: 500 }}>
          A nutrition <span style={{ color: "var(--persimmon)", fontWeight: 600 }}>almanac</span><br/>for everyday eating.
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-3)", textAlign: "center", marginTop: 12, lineHeight: 1.55 }}>
          Track every meal, scan barcodes, snap photos. Caroli's engine handles the math — you handle the chewing.
        </p>

        {/* Dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20 }}>
          <span style={{ width: 18, height: 4, borderRadius: 2, background: "var(--ink)" }} />
          <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--ink-4)" }} />
          <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--ink-4)" }} />
          <span style={{ width: 4, height: 4, borderRadius: 2, background: "var(--ink-4)" }} />
        </div>

        <div style={{ flex: 1 }} />

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 24 }}>
          Get started <I.arrow_r size={14} stroke={2.2} />
        </button>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--ink-3)" }}>
          Have an account? <span style={{ fontWeight: 600, color: "var(--ink)" }}>Sign in</span>
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

// 02 · SIGN IN / SIGN UP
function ScreenSignIn() {
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div className="fv-body" style={{ padding: "12px 22px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="fv-chip" style={{ padding: 6, width: 30, justifyContent: "center" }}><I.arrow_l size={14} /></button>
          <span className="fv-cap">CREATE ACCOUNT</span>
          <span style={{ width: 30 }} />
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1.05, marginTop: 28, fontWeight: 500 }}>
          Open your<br/><span style={{ color: "var(--persimmon)", fontWeight: 600 }}>almanac.</span>
        </h1>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>
          We'll keep your food log, weight history, and goals in sync across your devices.
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="fv-btn" style={{ width: "100%", background: "var(--ink)", color: "var(--paper)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15H8v-3h2.4V9.7c0-2.4 1.4-3.7 3.6-3.7l2 .2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12H16l-.4 3h-2.6v6.9A10 10 0 0 0 22 12z"/></svg>
            Continue with Facebook
          </button>
          <button className="fv-btn" style={{ width: "100%", background: "#fff", color: "var(--ink)", border: "1px solid var(--rule)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12.2c0-.8-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2 3.2v2.6h3.4c2-1.8 3-4.5 3-7.6z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.4l-3.4-2.6c-1 .6-2 1-3.2 1a5.6 5.6 0 0 1-5.2-3.8H3.2v2.4A10 10 0 0 0 12 22z"/><path fill="#FBBC04" d="M6.8 14.2A5.6 5.6 0 0 1 6.5 12c0-.8.2-1.5.4-2.2V7.4H3.2A10 10 0 0 0 2 12c0 1.6.4 3.2 1.2 4.6l3.6-2.4z"/><path fill="#EA4335" d="M12 6.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.2 7.4l3.6 2.4A5.6 5.6 0 0 1 12 6.4z"/></svg>
            Continue with Google
          </button>
          <button className="fv-btn fv-btn-ghost" style={{ width: "100%" }}>
            <I.apple size={14} stroke={1.6} />
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0 14px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
          <span className="fv-cap">OR EMAIL</span>
          <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
        </div>

        <div className="fv-field">
          <span className="fv-cap">EMAIL</span>
          <input className="fv-input" defaultValue="maya.singh@hey.com" />
        </div>
        <div className="fv-field" style={{ marginTop: 8 }}>
          <span className="fv-cap">PASSWORD</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input className="fv-input" type="password" defaultValue="••••••••••" />
            <span className="fv-mono" style={{ fontSize: 10, color: "var(--persimmon)", fontWeight: 600 }}>SHOW</span>
          </div>
        </div>

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 16 }}>
          Create account
          <I.arrow_r size={14} stroke={2.4} />
        </button>

        <div style={{ flex: 1 }} />

        <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", textAlign: "center", marginTop: 24, letterSpacing: "0.14em", lineHeight: 1.7 }}>
          BY CONTINUING YOU AGREE TO THE<br/>TERMS · PRIVACY POLICY
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

// 03 · BASIC PROFILE — height/weight/age etc
function ScreenBasicProfile() {
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div className="fv-body" style={{ padding: "12px 22px" }}>
        <div className="fv-cap">STEP 03 OF 06</div>
        <div style={{ height: 2, background: "var(--paper-deep)", marginTop: 6, borderRadius: 1 }}>
          <div style={{ width: "50%", height: "100%", background: "var(--persimmon)", borderRadius: 1 }} />
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 34, lineHeight: 1.05, marginTop: 26, fontWeight: 500 }}>
          The <span style={{ color: "var(--persimmon)", fontWeight: 600 }}>baseline.</span>
        </h1>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>
          Used once to calculate BMR, TDEE, and macros. Edit any time from Settings.
        </div>

        {/* Sex */}
        <div className="fv-cap" style={{ margin: "26px 0 8px" }}>SEX AT BIRTH</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ padding: 14, background: "var(--card)", borderRadius: 10, border: "1px solid var(--rule-soft)", textAlign: "center", fontSize: 14 }}>Male</div>
          <div style={{ padding: 14, background: "var(--ink)", color: "var(--paper)", borderRadius: 10, textAlign: "center", fontSize: 14, fontWeight: 600 }}>Female</div>
        </div>

        {/* Age + Height + Weight */}
        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>AGE</div>
        <div className="fv-card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="fv-num" style={{ fontSize: 36, lineHeight: 1 }}>28</div>
          <div className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>YEARS</div>
        </div>
        {/* Wheel scale visual */}
        <div style={{ marginTop: 8, height: 28, position: "relative", overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: "100%" }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{
                width: 2, height: i === 18 ? 22 : (i % 5 === 0 ? 16 : 9),
                background: i === 18 ? "var(--persimmon)" : "var(--ink-4)",
              }} />
            ))}
          </div>
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 1, height: 28, background: "var(--persimmon)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
          <div>
            <div className="fv-cap" style={{ marginBottom: 8 }}>HEIGHT</div>
            <div className="fv-card" style={{ padding: "14px 16px" }}>
              <div className="fv-num" style={{ fontSize: 28 }}>172<span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 4 }}>CM</span></div>
            </div>
          </div>
          <div>
            <div className="fv-cap" style={{ marginBottom: 8 }}>WEIGHT</div>
            <div className="fv-card" style={{ padding: "14px 16px" }}>
              <div className="fv-num" style={{ fontSize: 28 }}>73.4<span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 4 }}>KG</span></div>
            </div>
          </div>
        </div>

        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>UNITS</div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className="fv-chip" data-on>Metric · kg / cm</span>
          <span className="fv-chip">Imperial · lb / ft</span>
        </div>

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 32 }}>
          Continue <I.arrow_r size={14} stroke={2.4} />
        </button>
      </div>
      <FvNavBar />
    </div>
  );
}

// 04 · PERMISSIONS — camera/health/notif
function ScreenPermissions() {
  const items = [
    { icon: I.camera, title: "Camera", sub: "Snap meals · scan barcodes", on: true,  required: true },
    { icon: I.heart,  title: "Health Connect", sub: "Sync activity & weight from your phone", on: true },
    { icon: I.bell,   title: "Reminders", sub: "Meal & water nudges, no spam — promise.", on: false },
    { icon: I.globe,  title: "Location",  sub: "Restaurants nearby with nutrition info",   on: false },
  ];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div className="fv-body" style={{ padding: "12px 22px" }}>
        <div className="fv-cap">STEP 05 OF 06</div>
        <div style={{ height: 2, background: "var(--paper-deep)", marginTop: 6, borderRadius: 1 }}>
          <div style={{ width: "83%", height: "100%", background: "var(--persimmon)", borderRadius: 1 }} />
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 34, lineHeight: 1.05, marginTop: 26, fontWeight: 500 }}>
          A few <span style={{ color: "var(--persimmon)", fontWeight: 600 }}>permissions.</span>
        </h1>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>
          Grant what you're comfortable with. You can change any of these later.
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((it) => (
            <div key={it.title} className="fv-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: it.on ? "var(--ink)" : "var(--paper-deep)",
                color: it.on ? "var(--paper)" : "var(--ink-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <it.icon size={18} stroke={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{it.title}</span>
                  {it.required && <span className="fv-mono" style={{ fontSize: 9, color: "var(--persimmon)", letterSpacing: "0.14em" }}>REQUIRED</span>}
                </div>
                <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 3 }}>{it.sub}</div>
              </div>
              <div style={{
                width: 36, height: 20, borderRadius: 10,
                background: it.on ? "var(--persimmon)" : "var(--rule)",
                position: "relative", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: 2, left: it.on ? 18 : 2,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left .15s",
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26, padding: 14, background: "var(--card-soft)", borderRadius: 10, border: "1px dashed var(--rule)" }}>
          <div className="fv-cap" style={{ color: "var(--ink-2)", marginBottom: 4 }}>YOUR DATA, YOUR ALMANAC</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
            Food logs and weight history are encrypted and never sold. We use only aggregated, de-identified
            stats to improve the food database.
          </div>
        </div>

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 24 }}>
          Continue <I.arrow_r size={14} stroke={2.4} />
        </button>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span className="fv-cap">SKIP FOR NOW</span>
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

// 05 · GOAL SUMMARY (right after onboarding) — reveals their target
function ScreenGoalReveal() {
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div className="fv-body" style={{ padding: "16px 22px 24px", display: "flex", flexDirection: "column" }}>
        <div className="fv-cap">STEP 06 OF 06 · CALCULATED</div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1.05, marginTop: 14, fontWeight: 500 }}>
          Here's your<br/><span style={{ color: "var(--persimmon)", fontWeight: 600 }}>plan.</span>
        </h1>

        <div className="fv-card" style={{ padding: 18, marginTop: 22, background: "var(--ink)", color: "var(--paper)", border: 0 }}>
          <div className="fv-cap" style={{ color: "var(--persimmon-l)" }}>DAILY TARGET</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 6 }}>
            <div className="fv-num" style={{ fontSize: 56, lineHeight: 1, color: "var(--paper)" }}>2,287</div>
            <div className="fv-mono" style={{ fontSize: 11, color: "var(--persimmon-l)" }}>KCAL · DAY</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(207,244,252,0.15)" }}>
            <DarkStat label="BMR"     v="1,798" />
            <div style={{ width: 1, background: "rgba(207,244,252,0.15)" }} />
            <DarkStat label="TDEE"    v="2,787" />
            <div style={{ width: 1, background: "rgba(207,244,252,0.15)" }} />
            <DarkStat label="DEFICIT" v="−500" />
          </div>
        </div>

        {/* Projected curve */}
        <div className="fv-card" style={{ padding: 14, marginTop: 12 }}>
          <div className="fv-cap" style={{ marginBottom: 8 }}>PROJECTED · 12 WEEKS</div>
          <Sparkline
            data={[73.4, 73.0, 72.6, 72.2, 71.8, 71.5, 71.1, 70.7, 70.3, 70.0, 69.6, 69.2, 68.8, 68.5]}
            width={280} height={68}
            color="var(--persimmon)"
            fill="rgba(10,110,131,0.10)"
            target={68}
            showDots
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>TODAY · 73.4 KG</span>
            <span className="fv-mono" style={{ fontSize: 9, color: "var(--persimmon)", fontWeight: 600 }}>AUG 2 · 68.5 KG</span>
          </div>
        </div>

        {/* Macros */}
        <div className="fv-card" style={{ padding: 14, marginTop: 12, display: "flex", gap: 8 }}>
          {[
            { name: "PROTEIN", g: 150, c: "var(--berry)" },
            { name: "CARBS",   g: 258, c: "var(--ochre)" },
            { name: "FAT",     g: 76,  c: "var(--persimmon)" },
          ].map((m, i) => (
            <div key={m.name} style={{ flex: 1, padding: "0 8px", borderRight: i < 2 ? "1px solid var(--rule-soft)" : "0" }}>
              <div className="fv-cap" style={{ color: m.c }}>{m.name}</div>
              <div className="fv-num" style={{ fontSize: 22, marginTop: 4 }}>{m.g}<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>G</span></div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 22 }}>
          Open my almanac <I.arrow_r size={14} stroke={2.4} />
        </button>
        <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", textAlign: "center", marginTop: 14, letterSpacing: "0.14em" }}>
          MIFFLIN-ST JEOR · MODERATE ACTIVITY · −0.5 KG/WEEK
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

Object.assign(window, {
  ScreenSplash, ScreenWelcome, ScreenSignIn,
  ScreenBasicProfile, ScreenPermissions, ScreenGoalReveal,
});

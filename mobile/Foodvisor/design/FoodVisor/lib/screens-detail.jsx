// FoodVisor — Detail / overlay / dev portal screens

const { useState: useS2 } = React;

// ─────────────────────────────────────────────────────────────
// 05 · BARCODE SCANNER (camera overlay)
// ─────────────────────────────────────────────────────────────
function ScreenBarcode() {
  return (
    <div className="fv-screen" style={{ background: "#0a0805", color: "#fff" }}>
      <FvStatusBar dark />
      {/* Header */}
      <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.close size={16} />
          </div>
          <div>
            <div className="fv-cap" style={{ color: "rgba(255,255,255,0.5)" }}>Capture</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Barcode scanner</div>
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <I.zap size={16} />
        </div>
      </div>

      {/* Camera preview */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Dark gradient floor */}
        <div style={{ position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, #2a2218 0%, #100c08 70%, #050402 100%)" }} />
        {/* Faint barcode shape on floor */}
        <div style={{
          position: "absolute", left: "50%", top: "42%", transform: "translate(-50%, -50%) rotate(-2deg)",
          width: 220, height: 100, opacity: 0.55,
          background: "repeating-linear-gradient(90deg, #f4efe6 0 3px, transparent 3px 6px, #f4efe6 6px 8px, transparent 8px 12px, #f4efe6 12px 16px, transparent 16px 22px)",
        }} />

        {/* Scan window */}
        <div style={{
          position: "absolute", left: "50%", top: "42%", transform: "translate(-50%, -50%)",
          width: 260, height: 140, borderRadius: 14,
          boxShadow: "0 0 0 9999px rgba(8,6,4,0.55)",
        }}>
          {/* Corners */}
          {[
            { top: -2, left: -2, r: "0 8px 0 0", border: "2px 0 0 2px" },
            { top: -2, right: -2, r: "8px 0 0 0", border: "2px 2px 0 0" },
            { bottom: -2, left: -2, r: "0 0 0 8px", border: "0 0 2px 2px" },
            { bottom: -2, right: -2, r: "0 0 8px 0", border: "0 2px 2px 0" },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute", width: 22, height: 22,
              borderStyle: "solid", borderColor: "var(--persimmon)",
              borderWidth: c.border, borderRadius: c.r,
              top: c.top, left: c.left, right: c.right, bottom: c.bottom,
            }} />
          ))}
          {/* Scan line */}
          <div style={{
            position: "absolute", left: 12, right: 12, top: "50%",
            height: 2, background: "var(--persimmon)",
            boxShadow: "0 0 12px var(--persimmon)",
          }} />
        </div>

        {/* Helper */}
        <div style={{
          position: "absolute", bottom: 200, left: 0, right: 0, textAlign: "center",
          color: "rgba(255,255,255,0.7)",
        }}>
          <div className="fv-cap" style={{ color: "var(--persimmon)" }}>Scanning</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Centre the product barcode in the frame</div>
        </div>

        {/* Detected card (slides up) */}
        <div style={{
          position: "absolute", left: 16, right: 16, bottom: 16,
          background: "var(--paper)", color: "var(--ink)",
          borderRadius: 16, padding: 14,
          border: "1px solid var(--rule)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div className="fv-stamp">match · 98%</div>
            <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>EAN · 8850002102308</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <FoodGlyph kind="rice" size={56} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>Thai Jasmine Rice</div>
              <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>Golden Phenix · 45 g serving</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <span className="fv-num" style={{ fontSize: 18 }}>158<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginLeft: 3 }}>kcal</span></span>
                <span className="fv-num" style={{ fontSize: 14, color: "var(--ink-3)" }}>3.2g<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginLeft: 3 }}>protein</span></span>
                <span className="fv-num" style={{ fontSize: 14, color: "var(--ink-3)" }}>34g<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginLeft: 3 }}>carbs</span></span>
              </div>
            </div>
          </div>
          <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 12 }}>
            <I.plus size={14} stroke={2.4} /> Add to lunch
          </button>
        </div>
      </div>

      <FvNavBar dark />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 06 · PHOTO AI (results)
// ─────────────────────────────────────────────────────────────
function ScreenPhotoAI() {
  const items = [
    { name: "Steamed white rice", g: 180, k: 234, p: 4.3, c: 51.2, f: 0.4, conf: "high",   x: "30%", y: "55%" },
    { name: "Stir-fried vegetables", g: 120, k: 85, p: 3.1, c: 9.4, f: 3.8, conf: "medium", x: "62%", y: "44%" },
    { name: "Soy-glazed tofu",   g: 95, k: 142, p: 11.6, c: 4.2, f: 8.5, conf: "high", x: "55%", y: "70%" },
  ];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="fv-chip" style={{ padding: 6, width: 30, justifyContent: "center" }}><I.arrow_l size={14} /></button>
          <div>
            <div className="fv-cap">Photo AI · v3.2</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Detected 3 items</div>
          </div>
        </div>
        <I.spark size={18} />
      </div>

      {/* Photo with detection overlay */}
      <div style={{ position: "relative", margin: "10px 18px 0", borderRadius: 14, overflow: "hidden", border: "1px solid var(--rule)" }}>
        <div className="fv-image-slot" style={{ height: 220, position: "relative" }}>
          <span>your meal photo · 1280 × 960</span>
        </div>
        {/* Bounding boxes */}
        {items.map((it, i) => (
          <div key={i} style={{
            position: "absolute",
            left: it.x, top: it.y, transform: "translate(-50%, -50%)",
            border: "1.5px solid var(--persimmon)",
            background: "rgba(214,90,49,0.06)",
            width: i === 0 ? 90 : i === 1 ? 80 : 70,
            height: i === 0 ? 50 : 40,
            borderRadius: 4,
          }}>
            <span style={{
              position: "absolute", top: -16, left: -1,
              background: "var(--persimmon)", color: "#fff",
              fontFamily: "var(--mono)", fontSize: 9,
              padding: "2px 5px", borderRadius: "3px 3px 3px 0",
              letterSpacing: "0.06em",
            }}>
              {String.fromCharCode(65 + i)} · {it.name.split(" ")[0]}
            </span>
          </div>
        ))}
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(28,22,17,0.85)", color: "#fff",
          padding: "4px 8px", borderRadius: 100,
          fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em",
        }}>
          confidence · medium
        </div>
      </div>

      <div className="fv-body" style={{ padding: "16px 18px 16px" }}>
        {/* Total */}
        <div className="fv-card" style={{ padding: 16 }}>
          <div className="fv-cap" style={{ marginBottom: 4 }}>Estimated total</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 36, lineHeight: 1 }}>461 <span className="fv-mono" style={{ fontSize: 12, color: "var(--ink-4)" }}>kcal</span></h2>
            <button className="fv-chip"><I.edit size={11} /> Adjust</button>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
            <Macro mini name="P" v={19} c="var(--berry)" />
            <Macro mini name="C" v={64.8} c="var(--ochre)" />
            <Macro mini name="F" v={12.7} c="var(--persimmon)" />
          </div>
        </div>

        <div className="fv-cap" style={{ margin: "18px 0 8px" }}>Items detected</div>
        <div className="fv-card" style={{ padding: 0 }}>
          {items.map((it, i) => (
            <div key={i} className="fv-row" style={{ padding: "12px 14px" }}>
              <div style={{
                width: 24, height: 24, borderRadius: 4,
                background: "var(--ink)", color: "var(--paper)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600,
                flexShrink: 0,
              }}>{String.fromCharCode(65 + i)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.name}</div>
                <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>
                  ~{it.g}g · conf {it.conf}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="fv-num" style={{ fontSize: 16 }}>{it.k}</div>
                <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>kcal</div>
              </div>
            </div>
          ))}
        </div>

        <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
          Estimated values — portion sizes may vary.<br/>Adjust quantities for the most accurate log.
        </div>

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 16 }}>
          Confirm &amp; log to lunch
          <I.check size={14} stroke={2.4} />
        </button>
      </div>

      <FvNavBar />
    </div>
  );
}

function Macro({ name, v, c, mini }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="fv-cap">{mini ? name : name}</span>
        <span className="fv-num" style={{ fontSize: 16 }}>{v}<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginLeft: 2 }}>g</span></span>
      </div>
      <div style={{ height: 3, background: "var(--paper-deep)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: "60%", background: c, borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07 · GOALS / TDEE
// ─────────────────────────────────────────────────────────────
function ScreenGoals() {
  const [activity, setActivity] = useS2("moderate");
  const [goal, setGoal] = useS2("lose");
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px" }}>
        <div className="fv-cap">Goals</div>
        <h1 style={{ fontSize: 28, marginTop: 4 }}>Calorie target</h1>
      </div>

      <div className="fv-body" style={{ padding: "10px 18px 16px" }}>
        {/* Result card */}
        <div className="fv-card" style={{ padding: 18, background: "var(--ink)", color: "var(--paper)", border: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="fv-cap" style={{ color: "var(--persimmon-l)" }}>Recommended target</div>
              <div className="fv-num" style={{ fontSize: 56, lineHeight: 1, marginTop: 6, color: "var(--paper)" }}>
                2,287
              </div>
              <div className="fv-mono" style={{ fontSize: 10, color: "rgba(244,239,230,0.6)", marginTop: 2 }}>kcal / day</div>
            </div>
            <div className="fv-num" style={{ fontSize: 28, color: "var(--persimmon)", lineHeight: 1 }}>
              −0.5<span className="fv-mono" style={{ fontSize: 10, color: "var(--persimmon-l)", marginLeft: 4 }}>kg/wk</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", gap: 0, alignItems: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(244,239,230,0.15)" }}>
            <DarkStat label="BMR" v="1,798" />
            <div style={{ width: 1, background: "rgba(244,239,230,0.15)", alignSelf: "stretch" }} />
            <DarkStat label="TDEE" v="2,787" />
            <div style={{ width: 1, background: "rgba(244,239,230,0.15)", alignSelf: "stretch" }} />
            <DarkStat label="Deficit" v="−500" />
          </div>
        </div>

        {/* Macro split */}
        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>Recommended macros</div>
        <div className="fv-card" style={{ padding: 14, display: "flex", gap: 8 }}>
          {[
            { name: "Protein", g: 150, k: 600, c: "var(--berry)" },
            { name: "Carbs",   g: 258, k: 1032, c: "var(--ochre)" },
            { name: "Fat",     g: 76,  k: 684, c: "var(--persimmon)" },
          ].map(m => (
            <div key={m.name} style={{ flex: 1, padding: "8px 10px", borderRight: m.name !== "Fat" ? "1px solid var(--rule-soft)" : "0" }}>
              <div className="fv-cap" style={{ color: m.c, fontWeight: 600 }}>{m.name}</div>
              <div className="fv-num" style={{ fontSize: 22, marginTop: 4 }}>{m.g}<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>g</span></div>
              <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>{m.k} kcal</div>
            </div>
          ))}
        </div>

        {/* Inputs */}
        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>Your details</div>
        <div className="fv-card" style={{ padding: 0 }}>
          <RowInput label="Sex"          v="Female" />
          <RowInput label="Age"          v="28 years" />
          <RowInput label="Height"       v="172 cm" />
          <RowInput label="Weight"       v="73.4 kg" stamp="−1.8 kg" />
          <RowInput label="Target weight" v="68.0 kg" />
        </div>

        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>Activity level</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            ["sedentary", "Sedentary"],
            ["light", "Light"],
            ["moderate", "Moderate"],
            ["active", "Active"],
            ["very_active", "Very active"],
          ].map(([id, l]) => (
            <span key={id} className="fv-chip" data-on={activity === id} onClick={() => setActivity(id)}>{l}</span>
          ))}
        </div>

        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>Goal</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            ["lose", "Lose", "−0.5 kg/wk"],
            ["maintain", "Maintain", "± 0"],
            ["gain", "Gain", "+0.25 kg/wk"],
          ].map(([id, l, sub]) => (
            <div key={id} onClick={() => setGoal(id)} style={{
              padding: 12, textAlign: "center",
              background: goal === id ? "var(--ink)" : "var(--card)",
              color: goal === id ? "var(--paper)" : "var(--ink)",
              border: "1px solid " + (goal === id ? "var(--ink)" : "var(--rule-soft)"),
              borderRadius: 10,
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{l}</div>
              <div className="fv-mono" style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 16, textAlign: "center", lineHeight: 1.6 }}>
          Calculated using the Mifflin-St Jeor formula.
        </div>
      </div>

      <FvNavBar />
    </div>
  );
}

function DarkStat({ label, v }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="fv-cap" style={{ color: "rgba(244,239,230,0.5)" }}>{label}</div>
      <div className="fv-num" style={{ fontSize: 18, color: "var(--paper)", marginTop: 4 }}>{v}</div>
    </div>
  );
}

function RowInput({ label, v, stamp }) {
  return (
    <div className="fv-row" style={{ padding: "12px 14px" }}>
      <span style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>{label}</span>
      {stamp && <span className="fv-mono" style={{ fontSize: 9, color: "var(--moss)" }}>{stamp}</span>}
      <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
      <I.chevron size={14} style={{ color: "var(--ink-4)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 08 · PROFILE
// ─────────────────────────────────────────────────────────────
function ScreenProfile({ onTab }) {
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div className="fv-body" style={{ padding: 0 }}>
        <div style={{ padding: "12px 18px 18px", borderBottom: "1px solid var(--rule)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "var(--ink)", color: "var(--paper)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--serif)", fontSize: 28,
              flexShrink: 0,
            }}>M</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, lineHeight: 1.1 }}>Maya Singh</h1>
              <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>maya.singh@hey.com · since Apr 2024</div>
            </div>
            <I.settings size={20} stroke={1.4} style={{ color: "var(--ink-3)" }} />
          </div>

          <div className="fv-grid-3" style={{ marginTop: 18 }}>
            <Stat label="Streak" value="14" unit="days" tone="persimmon" />
            <div className="fv-vrule" />
            <Stat label="Logged" value="346" unit="meals" />
            <div className="fv-vrule" />
            <Stat label="Down" value="1.8" unit="kg this mo" tone="moss" />
          </div>
        </div>

        <Group title="Plan & data">
          <Row icon={I.flag}     title="Goals & calorie target" sub="Cut · 2,287 kcal/day" />
          <Row icon={I.scale}    title="Weight & measurements" sub="Logged 12 entries this month" />
          <Row icon={I.heart}    title="Health Connect"        sub="Synced · last 14 min ago" stamp="ON" />
          <Row icon={I.bell}     title="Reminders"              sub="Breakfast 8:00 · Water every 2h" />
        </Group>

        <Group title="Library">
          <Row icon={I.bookmark} title="Custom foods" sub="38 items" />
          <Row icon={I.flask}    title="Recipes"      sub="12 saved · 4 shared" />
          <Row icon={I.globe}    title="Restaurants nearby" sub="Surrey, BC · 240 menus" />
        </Group>

        <Group title="Developers">
          <Row icon={I.key}      title="API for developers" sub="Build with Caroli's nutrition engine" stamp="NEW" tone="persimmon" />
        </Group>

        <div style={{ padding: "20px 18px 24px", textAlign: "center" }}>
          <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.16em" }}>
            FOODVISOR · v 4.2.1 · BUILD 2087
          </div>
        </div>
      </div>

      <BottomNav active="profile" onChange={onTab} />
      <FvNavBar />
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div style={{ padding: "20px 0 0" }}>
      <div className="fv-cap" style={{ padding: "0 18px 8px" }}>{title}</div>
      <div style={{ borderTop: "1px solid var(--rule-soft)", borderBottom: "1px solid var(--rule-soft)", background: "var(--card-soft)" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon: IcEl, title, sub, stamp, tone = "ink" }) {
  const tones = { ink: "var(--ink)", moss: "var(--moss)", persimmon: "var(--persimmon)" };
  return (
    <div className="fv-row" style={{ padding: "14px 18px" }}>
      <IcEl size={18} stroke={1.4} style={{ color: "var(--ink-2)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
        {sub && <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>{sub}</div>}
      </div>
      {stamp && <span className="fv-stamp" style={{ borderColor: tones[tone], color: tones[tone] }}>{stamp}</span>}
      <I.chevron size={14} style={{ color: "var(--ink-4)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 09 · ONBOARDING (single welcome screen)
// ─────────────────────────────────────────────────────────────
function ScreenOnboarding() {
  return (
    <div className="fv-screen" style={{ background: "var(--paper)" }}>
      <FvStatusBar />
      <div className="fv-body" style={{ padding: "20px 22px", display: "flex", flexDirection: "column" }}>
        <div className="fv-cap">Step 02 of 06</div>
        <div style={{ height: 2, background: "var(--paper-deep)", marginTop: 6, borderRadius: 1 }}>
          <div style={{ width: "33%", height: "100%", background: "var(--persimmon)", borderRadius: 1 }} />
        </div>

        <h1 style={{ fontSize: 40, lineHeight: 1.05, marginTop: 28 }}>
          What brings you<br/>
          <span style={{ color: "var(--persimmon)", fontWeight: 600 }}>to Foodvisor?</span>
        </h1>
        <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.5 }}>
          Pick your primary goal. We'll tune calorie targets and macro splits accordingly.
        </div>

        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: "lose",     title: "Lose weight",     sub: "Sustainable deficit · 0.25–0.75 kg / wk", on: true },
            { id: "maintain", title: "Maintain & feel better", sub: "Eat in balance, hit micros" },
            { id: "build",    title: "Build muscle",    sub: "Surplus + protein-led split" },
            { id: "track",    title: "Just track",      sub: "No goal — full visibility" },
          ].map(o => (
            <div key={o.id} style={{
              padding: "16px 16px",
              background: o.on ? "var(--ink)" : "var(--card)",
              color: o.on ? "var(--paper)" : "var(--ink)",
              border: "1px solid " + (o.on ? "var(--ink)" : "var(--rule-soft)"),
              borderRadius: 14,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: "1.5px solid " + (o.on ? "var(--persimmon)" : "var(--rule)"),
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {o.on && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--persimmon)" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{o.title}</div>
                <div className="fv-mono" style={{ fontSize: 10, opacity: 0.65, marginTop: 4 }}>{o.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 24 }}>
          Continue <I.arrow_r size={14} stroke={2.2} />
        </button>
        <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", textAlign: "center", marginTop: 12, letterSpacing: "0.14em" }}>
          AVERAGE SETUP · 90 SECONDS
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 10 · RECIPE DETAIL
// ─────────────────────────────────────────────────────────────
function ScreenRecipe() {
  const ing = [
    { f: "Brown rice, cooked",   g: 200, k: 220 },
    { f: "Egg, large",            g: 100, k: 143 },
    { f: "Sesame oil",            g: 15,  k: 132 },
    { f: "Spring onion",          g: 30,  k: 10  },
    { f: "Soy sauce",             g: 15,  k: 8   },
    { f: "Frozen mixed vegetables", g: 120, k: 78 },
    { f: "Garlic",                g: 6,   k: 9   },
    { f: "Chicken breast, diced", g: 150, k: 247 },
  ];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="fv-chip" style={{ padding: 6, width: 30, justifyContent: "center" }}><I.arrow_l size={14} /></button>
        <div className="fv-cap">Recipe</div>
        <button className="fv-chip" style={{ padding: 6, width: 30, justifyContent: "center" }}><I.bookmark size={14} /></button>
      </div>

      <div className="fv-body">
        <div style={{ padding: "0 18px" }}>
          <div className="fv-image-slot" style={{ height: 180, borderRadius: 14, marginBottom: 16 }}>
            <span>recipe hero · 1280 × 720</span>
          </div>
          <h1 style={{ fontSize: 30, lineHeight: 1.05 }}>House <span style={{ color: "var(--persimmon)", fontWeight: 600 }}>fried rice</span></h1>
          <div className="fv-mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
            saved by maya · 8 ingredients · serves 2
          </div>
        </div>

        <div style={{ padding: "16px 18px 0" }}>
          <div className="fv-card" style={{ padding: 14 }}>
            <div className="fv-cap" style={{ marginBottom: 6 }}>Per serving</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 32 }}>424<span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 4 }}>kcal</span></h2>
              <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>848 kcal · whole recipe</div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <Macro mini name="P" v={29.6} c="var(--berry)" />
              <Macro mini name="C" v={49.1} c="var(--ochre)" />
              <Macro mini name="F" v={14.0} c="var(--persimmon)" />
            </div>
          </div>
        </div>

        {/* Vitamin & mineral analysis */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 18px 8px" }}>
          <div className="fv-cap">Vitamins &amp; minerals</div>
          <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.1em" }}>% DAILY VALUE</div>
        </div>
        <div className="fv-card" style={{ margin: "0 18px", padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 18, rowGap: 14 }}>
            {[
              { code: "A",   name: "Vitamin A",   amt: "720",  unit: "μg",  pct: 80, c: "var(--berry)" },
              { code: "B₆",  name: "Vitamin B6",  amt: "0.94", unit: "mg",  pct: 55, c: "var(--persimmon)" },
              { code: "B₁₂", name: "Vitamin B12", amt: "1.2",  unit: "μg",  pct: 50, c: "var(--berry)" },
              { code: "C",   name: "Vitamin C",   amt: "32",   unit: "mg",  pct: 36, c: "var(--ochre)" },
              { code: "D",   name: "Vitamin D",   amt: "1.1",  unit: "μg",  pct: 7,  c: "var(--ink-3)", low: true },
              { code: "E",   name: "Vitamin E",   amt: "3.4",  unit: "mg",  pct: 23, c: "var(--ochre)" },
              { code: "K",   name: "Vitamin K",   amt: "84",   unit: "μg",  pct: 70, c: "var(--moss)" },
              { code: "Fe",  name: "Iron",        amt: "3.6",  unit: "mg",  pct: 20, c: "var(--persimmon)" },
              { code: "Mg",  name: "Magnesium",   amt: "78",   unit: "mg",  pct: 19, c: "var(--persimmon)" },
              { code: "Na",  name: "Sodium",      amt: "612",  unit: "mg",  pct: 27, c: "var(--ink-2)" },
            ].map((v) => (
              <div key={v.code} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: "1px solid var(--rule)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600,
                    color: "var(--ink-2)", background: "var(--card-soft)",
                    flexShrink: 0,
                  }}>{v.code}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-2)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                    <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>{v.amt} {v.unit}</div>
                  </div>
                  <div className="fv-num" style={{ fontSize: 14, color: v.low ? "var(--ink-4)" : "var(--ink)" }}>
                    {v.pct}<span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginLeft: 1 }}>%</span>
                  </div>
                </div>
                <div style={{ height: 3, background: "var(--paper-deep)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(100, v.pct) + "%", background: v.c, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--rule-soft)" }}>
            <span className="fv-stamp" style={{ borderColor: "var(--moss)", color: "var(--moss)" }}>RICH</span>
            <span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>Vit A · K — </span>
            <span className="fv-stamp" style={{ borderColor: "var(--berry)", color: "var(--berry)" }}>LOW</span>
            <span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>Vit D</span>
          </div>
        </div>

        <div className="fv-cap" style={{ padding: "20px 18px 8px" }}>Ingredients</div>
        <div className="fv-card" style={{ padding: 0, margin: "0 18px" }}>
          {ing.map((it, i) => (
            <div key={i} className="fv-row" style={{ padding: "10px 14px" }}>
              <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", width: 22 }}>{(i + 1).toString().padStart(2, "0")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{it.f}</div>
              </div>
              <div className="fv-mono" style={{ fontSize: 11, color: "var(--ink-3)", marginRight: 10 }}>{it.g} g</div>
              <div className="fv-num" style={{ fontSize: 14, color: "var(--ink-2)" }}>{it.k}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 18px 30px", display: "flex", gap: 8 }}>
          <button className="fv-btn" style={{ flex: 1 }}>Log 1 serving</button>
          <button className="fv-btn fv-btn-ghost" style={{ flex: 1 }}>
            <I.edit size={14} stroke={1.6} /> Edit
          </button>
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 11 · DEV PORTAL — API DASHBOARD
// ─────────────────────────────────────────────────────────────
function ScreenDevDash() {
  const usage = [42, 65, 88, 71, 95, 124, 156, 142, 188, 210, 178, 230, 245, 268];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="fv-cap">Caroli · developers</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
            <h1 style={{ fontSize: 24 }}>Console</h1>
            <span className="fv-stamp">PRO</span>
          </div>
        </div>
        <I.more size={20} />
      </div>

      <div className="fv-body" style={{ padding: "10px 18px 16px" }}>
        {/* Top stat */}
        <div className="fv-card" style={{ padding: 18, background: "var(--ink)", color: "var(--paper)", border: 0 }}>
          <div className="fv-cap" style={{ color: "var(--persimmon-l)" }}>Requests today</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
            <h1 className="fv-num" style={{ fontSize: 48, color: "var(--paper)" }}>6,841</h1>
            <span className="fv-mono" style={{ fontSize: 12, color: "var(--moss-l)" }}>↑ 12.4%</span>
          </div>
          <div className="fv-mono" style={{ fontSize: 10, color: "rgba(244,239,230,0.5)", marginTop: 2 }}>
            Resets in 7h 19m · plan limit 10,000
          </div>
          {/* Plan ring */}
          <div style={{ marginTop: 14, height: 6, background: "rgba(244,239,230,0.15)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "68%", height: "100%", background: "var(--persimmon)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span className="fv-mono" style={{ fontSize: 9, color: "rgba(244,239,230,0.5)" }}>0</span>
            <span className="fv-mono" style={{ fontSize: 9, color: "var(--persimmon-l)" }}>68%</span>
            <span className="fv-mono" style={{ fontSize: 9, color: "rgba(244,239,230,0.5)" }}>10k</span>
          </div>
        </div>

        {/* Hourly chart */}
        <div className="fv-card" style={{ padding: 14, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div className="fv-cap">Last 14 hours</div>
            <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>req / hour</div>
          </div>
          <BarChart data={usage} width={300} height={70} />
        </div>

        {/* Endpoint table */}
        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>By endpoint</div>
        <div className="fv-card" style={{ padding: 0 }}>
          {[
            { e: "/food/search",            req: "3,140",  ms: "42",  st: "200" },
            { e: "/food/barcode/{ean}",     req: "1,820",  ms: "28",  st: "200" },
            { e: "/nutrition/calculate",    req: "1,201",  ms: "11",  st: "200" },
            { e: "/analyze/photo",          req: "412",    ms: "1,840", st: "200", flag: "AI" },
            { e: "/calculator/tdee",        req: "180",    ms: "9",   st: "200" },
            { e: "/food/{food_id}",         req: "88",     ms: "—",   st: "404", err: true },
          ].map((r, i) => (
            <div key={i} className="fv-row" style={{ padding: "10px 14px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fv-mono" style={{ fontSize: 11, fontWeight: 500, color: r.err ? "var(--berry)" : "var(--ink)" }}>{r.e}</div>
                <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 3 }}>
                  p50 {r.ms}ms · {r.st}
                  {r.flag && <> · {r.flag}</>}
                </div>
              </div>
              <div className="fv-num" style={{ fontSize: 16, color: "var(--ink-2)" }}>{r.req}</div>
            </div>
          ))}
        </div>

        {/* API keys */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 0 8px" }}>
          <div className="fv-cap">API keys</div>
          <div className="fv-cap" style={{ color: "var(--persimmon)" }}>+ NEW</div>
        </div>
        <div className="fv-card" style={{ padding: 0 }}>
          {[
            { name: "Production · iOS",    key: "sk_live_•••••••••••••3a8f", scope: "all", on: true },
            { name: "Staging · Android",   key: "sk_test_•••••••••••••8e21", scope: "read", on: true },
            { name: "Hospital pilot",      key: "sk_live_•••••••••••••0c44", scope: "search · barcode", on: false },
          ].map((k, i) => (
            <div key={i} className="fv-row" style={{ padding: "12px 14px" }}>
              <I.key size={16} stroke={1.4} style={{ color: "var(--ink-3)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{k.name}</div>
                <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>{k.key} · {k.scope}</div>
              </div>
              <div style={{
                width: 30, height: 16, borderRadius: 8,
                background: k.on ? "var(--persimmon)" : "var(--rule)",
                position: "relative", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: 1, left: k.on ? 14 : 1,
                  width: 14, height: 14, borderRadius: "50%", background: "#fff",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <FvNavBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 12 · DEV PORTAL — PLAYGROUND
// ─────────────────────────────────────────────────────────────
function ScreenDevPlayground() {
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="fv-cap">Caroli · developers</div>
          <h1 style={{ fontSize: 22, marginTop: 2 }}>Playground</h1>
        </div>
        <span className="fv-stamp">v1</span>
      </div>

      <div className="fv-body" style={{ padding: "10px 18px 16px" }}>
        {/* Endpoint pill */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 12px", background: "var(--card)", border: "1px solid var(--rule-soft)", borderRadius: 10 }}>
          <span style={{ background: "var(--moss)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em" }}>GET</span>
          <span className="fv-mono" style={{ fontSize: 11, flex: 1, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            /api/v1/food/barcode/8850002102308
          </span>
          <I.copy size={14} stroke={1.4} style={{ color: "var(--ink-3)" }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 14, padding: 3, background: "var(--paper-deep)", borderRadius: 10 }}>
          {["Request", "Response", "cURL", "JS"].map((t, i) => (
            <div key={t} style={{
              flex: 1, textAlign: "center", padding: "8px 0",
              background: i === 1 ? "var(--paper)" : "transparent",
              borderRadius: 7,
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: i === 1 ? "var(--ink)" : "var(--ink-3)",
              fontWeight: i === 1 ? 600 : 400,
            }}>{t}</div>
          ))}
        </div>

        {/* Status line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 8 }}>
          <div className="fv-cap">Response</div>
          <div className="fv-mono" style={{ fontSize: 10, color: "var(--moss)" }}>
            200 OK · 142 ms · 1.4 KB
          </div>
        </div>

        <CodeBlock>
          <span className="c">{`// Cached · 12s ago\n`}</span>
          {`{\n`}
          {`  `}<span className="k">"status"</span>: <span className="s">"success"</span>,{`\n`}
          {`  `}<span className="k">"data"</span>: {`{\n`}
          {`    `}<span className="k">"food_id"</span>: <span className="s">"f_009821"</span>,{`\n`}
          {`    `}<span className="k">"name"</span>: <span className="s">"Thai Jasmine Rice"</span>,{`\n`}
          {`    `}<span className="k">"brand"</span>: <span className="s">"Golden Phenix"</span>,{`\n`}
          {`    `}<span className="k">"barcode"</span>: <span className="s">"8850002102308"</span>,{`\n`}
          {`    `}<span className="k">"serving_size"</span>: <span className="n">45</span>,{`\n`}
          {`    `}<span className="k">"serving_unit"</span>: <span className="s">"g"</span>,{`\n`}
          {`    `}<span className="k">"nutrition"</span>: {`{\n`}
          {`      `}<span className="k">"calories"</span>:    <span className="n">158</span>,{`\n`}
          {`      `}<span className="k">"protein_g"</span>:   <span className="n">3.2</span>,{`\n`}
          {`      `}<span className="k">"carbs_g"</span>:     <span className="n">34.0</span>,{`\n`}
          {`      `}<span className="k">"fat_g"</span>:       <span className="n">0.4</span>{`\n`}
          {`    `}{`}\n`}
          {`  `}{`}\n`}
          {`}`}
        </CodeBlock>

        {/* Headers */}
        <div className="fv-cap" style={{ margin: "16px 0 8px" }}>Response headers</div>
        <div className="fv-card" style={{ padding: 0 }}>
          {[
            ["X-RateLimit-Limit",     "10000"],
            ["X-RateLimit-Remaining", "3,159"],
            ["X-RateLimit-Reset",     "26,340"],
            ["Cache-Control",         "max-age=86400"],
            ["x-caroli-region",       "sea-1"],
          ].map(([k, v]) => (
            <div key={k} className="fv-row" style={{ padding: "8px 14px" }}>
              <span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-3)", flex: 1 }}>{k}</span>
              <span className="fv-mono" style={{ fontSize: 10, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        <button className="fv-btn fv-btn-accent" style={{ width: "100%", marginTop: 18 }}>
          <I.bolt_fill size={14} /> Run again
        </button>
      </div>
      <FvNavBar />
    </div>
  );
}

Object.assign(window, {
  ScreenBarcode, ScreenPhotoAI, ScreenGoals, ScreenProfile,
  ScreenOnboarding, ScreenRecipe, ScreenDevDash, ScreenDevPlayground,
  Macro, Group, Row, RowInput, DarkStat,
});

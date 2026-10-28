// FoodVisor — Consumer app screens

const { useState: useS1 } = React;

// ─────────────────────────────────────────────────────────────
// 01 · TODAY (home dashboard)
// ─────────────────────────────────────────────────────────────
function ScreenToday({ onTab }) {
  const macros = [
    { label: "Protein",  value: 78,  target: 150, color: "var(--berry)" },
    { label: "Carbs",    value: 162, target: 258, color: "var(--ochre)" },
    { label: "Fat",      value: 41,  target: 76,  color: "var(--persimmon)" },
  ];
  const meals = [
    { id: "b", time: "08·12", name: "Breakfast", kcal: 412, items: "Oats · banana · almonds", glyph: "apple" },
    { id: "l", time: "13·30", name: "Lunch",     kcal: 686, items: "Grilled salmon bowl",     glyph: "fish" },
    { id: "s", time: "16·15", name: "Snack",     kcal: 158, items: "Greek yoghurt",           glyph: "mug" },
    { id: "d", time: "—",     name: "Dinner",    kcal: 0,   items: "Not logged",              glyph: "leaf",  empty: true },
  ];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      {/* Header */}
      <div style={{ padding: "8px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="fv-cap">Friday · May 9</div>
          <h1 style={{ fontSize: 32, lineHeight: 1, marginTop: 4 }}>Good morning, <span style={{ color: "var(--persimmon)", fontWeight: 600 }}>Maya</span></h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="fv-chip" style={{ padding: 8, width: 36, justifyContent: "center" }}><I.bell size={16} /></button>
        </div>
      </div>

      <div className="fv-body" style={{ padding: "18px 18px 20px" }}>
        {/* Calorie panel */}
        <div className="fv-card" style={{ padding: 18, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div className="fv-cap">Daily Budget</div>
              <div className="fv-mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                Cycle 14 of 28 · cut phase
              </div>
            </div>
            <div className="fv-stamp">on track</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <CalorieRing consumed={1256} target={2287} burned={320} size={196} />
          </div>

          <div className="fv-grid-3" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--rule-soft)" }}>
            <Stat label="Eaten"   value="1,256"  unit="kcal" />
            <div className="fv-vrule" />
            <Stat label="Burned"  value="320"   unit="kcal" tone="moss" />
            <div className="fv-vrule" />
            <Stat label="Left"    value="1,351" unit="kcal" tone="ink" />
          </div>
        </div>

        {/* Macros */}
        <div style={{ marginTop: 18, padding: "0 2px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <div className="fv-cap">Macronutrients</div>
            <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>40 / 45 / 15</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {macros.map(m => <MacroRow key={m.label} {...m} />)}
          </div>
        </div>

        {/* Meals */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 2px 10px" }}>
            <div className="fv-cap">Meals</div>
            <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>3 logged · 1 pending</div>
          </div>
          <div className="fv-card" style={{ padding: 0 }}>
            {meals.map(m => (
              <div key={m.id} className="fv-row">
                <FoodGlyph kind={m.glyph} size={38} tone={m.empty ? "transparent" : "var(--paper-deep)"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: m.empty ? "var(--ink-4)" : "var(--ink)" }}>{m.name}</span>
                    <span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.items}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 70 }}>
                  {m.empty ? (
                    <button className="fv-chip" onClick={() => onTab?.("scan")}><I.plus size={12} stroke={2} />Log</button>
                  ) : (
                    <>
                      <div className="fv-num" style={{ fontSize: 20, lineHeight: 1 }}>{m.kcal}</div>
                      <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>kcal</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration + steps split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
          <div className="fv-card" style={{ padding: 14 }}>
            <div className="fv-cap" style={{ marginBottom: 8 }}>Water</div>
            <div className="fv-num" style={{ fontSize: 28, lineHeight: 1 }}>1.4<span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 4 }}>L</span></div>
            <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 14, borderRadius: 2,
                  background: i < 6 ? "var(--ink)" : "var(--paper-deep)",
                  border: "1px solid var(--rule)",
                }} />
              ))}
            </div>
            <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 6 }}>6 / 8 glasses</div>
          </div>
          <div className="fv-card" style={{ padding: 14 }}>
            <div className="fv-cap" style={{ marginBottom: 8 }}>Activity</div>
            <div className="fv-num" style={{ fontSize: 28, lineHeight: 1 }}>7,842<span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 4 }}>steps</span></div>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={[42,55,38,62,48,55,78]} width={130} height={30} color="var(--moss)" fill="rgba(107,142,90,0.18)" />
            </div>
            <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>Mon → today</div>
          </div>
        </div>
      </div>

      <BottomNav active="today" onChange={onTab} />
      <FvNavBar />
    </div>
  );
}

function Stat({ label, value, unit, tone = "ink" }) {
  const colors = { ink: "var(--ink)", moss: "var(--moss)", persimmon: "var(--persimmon)" };
  return (
    <div style={{ textAlign: "center", padding: "0 4px" }}>
      <div className="fv-cap">{label}</div>
      <div className="fv-num" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 4, color: colors[tone] }}>{value}</div>
      <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>{unit}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 · DIARY (full day, expanded)
// ─────────────────────────────────────────────────────────────
function ScreenDiary({ onTab }) {
  const days = ["M","T","W","T","F","S","S"];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px 12px" }}>
        <div className="fv-cap">Diary</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
          <h1 style={{ fontSize: 28 }}>May 09 · Friday</h1>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="fv-chip" style={{ padding: 6, width: 28, justifyContent: "center" }}><I.arrow_l size={14} /></button>
            <button className="fv-chip" style={{ padding: 6, width: 28, justifyContent: "center" }}><I.arrow_r size={14} /></button>
          </div>
        </div>
        {/* Week strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 14 }}>
          {days.map((d, i) => {
            const active = i === 4;
            const logged = i <= 4;
            return (
              <div key={i} style={{
                padding: "8px 0 6px",
                textAlign: "center",
                borderRadius: 8,
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper)" : "var(--ink)",
                border: active ? "0" : "1px solid var(--rule-soft)",
              }}>
                <div className="fv-mono" style={{ fontSize: 9, opacity: 0.6 }}>{d}</div>
                <div className="fv-num" style={{ fontSize: 16, marginTop: 2 }}>{3 + i}</div>
                <div style={{
                  width: 4, height: 4, borderRadius: 4, margin: "4px auto 0",
                  background: logged ? (active ? "var(--persimmon-l)" : "var(--persimmon)") : "transparent",
                }} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="fv-body" style={{ padding: "0 18px 16px" }}>
        {/* Day totals */}
        <div className="fv-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div className="fv-cap">Day total</div>
            <div className="fv-stamp" style={{ borderColor: "var(--moss)", color: "var(--moss)" }}>− 1,031 kcal</div>
          </div>
          <div className="fv-grid-3" style={{ marginTop: 10 }}>
            <Stat label="Eaten" value="1,256" unit="kcal" />
            <div className="fv-vrule" />
            <Stat label="Burned" value="320" unit="kcal" tone="moss" />
            <div className="fv-vrule" />
            <Stat label="Goal" value="2,287" unit="kcal" />
          </div>
        </div>

        {/* Detailed meal blocks */}
        {[
          { name: "Breakfast", time: "08:12", kcal: 412, items: [
            { f: "Steel-cut oats, cooked", g: 240, k: 158 },
            { f: "Banana, raw", g: 118, k: 105 },
            { f: "Almonds", g: 20, k: 116 },
            { f: "Honey", g: 10, k: 33 },
          ]},
          { name: "Lunch", time: "13:30", kcal: 686, items: [
            { f: "Atlantic salmon, grilled", g: 165, k: 358 },
            { f: "Brown rice, cooked", g: 150, k: 165 },
            { f: "Avocado", g: 60, k: 96 },
            { f: "Mixed greens, dressing", g: 90, k: 67 },
          ]},
          { name: "Snack", time: "16:15", kcal: 158, items: [
            { f: "Greek yoghurt, plain", g: 170, k: 102 },
            { f: "Blueberries", g: 80, k: 46 },
            { f: "Honey", g: 5, k: 10 },
          ]},
        ].map(meal => (
          <div key={meal.name} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h3 style={{ fontSize: 18 }}>{meal.name}</h3>
                <span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{meal.time}</span>
              </div>
              <div className="fv-num" style={{ fontSize: 18 }}>{meal.kcal}<span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginLeft: 4 }}>kcal</span></div>
            </div>
            <div className="fv-card" style={{ padding: 0 }}>
              {meal.items.map((it, idx) => (
                <div key={idx} className="fv-row" style={{ padding: "10px 14px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--ink)" }}>{it.f}</div>
                    <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>{it.g} g</div>
                  </div>
                  <div className="fv-num" style={{ fontSize: 16, color: "var(--ink-2)" }}>{it.k}</div>
                </div>
              ))}
              <div className="fv-row" style={{ padding: "10px 14px", color: "var(--persimmon)", justifyContent: "center" }}>
                <I.plus size={14} stroke={2} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Add to {meal.name.toLowerCase()}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty dinner */}
        <div className="fv-card" style={{ padding: 18, marginBottom: 8, borderStyle: "dashed" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <h3 style={{ fontSize: 18, color: "var(--ink-3)" }}>Dinner</h3>
            <span className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>— · — kcal left of 600</span>
          </div>
          <button className="fv-btn fv-btn-ghost" style={{ width: "100%" }} onClick={() => onTab?.("scan")}>
            <I.plus size={14} stroke={2} /> Log dinner
          </button>
        </div>
      </div>

      <BottomNav active="diary" onChange={onTab} />
      <FvNavBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 · CAPTURE / ADD (search + scan + photo)
// ─────────────────────────────────────────────────────────────
function ScreenCapture({ onTab }) {
  const [tab, setTab] = useS1("search");
  const recents = [
    { name: "Banana, raw",            sub: "1 medium · 118 g",      k: 105, glyph: "apple" },
    { name: "Greek yoghurt, plain",   sub: "Fage 0% · 170 g",        k: 102, glyph: "mug"   },
    { name: "Brown rice, cooked",     sub: "1 cup · 195 g",          k: 215, glyph: "rice"  },
    { name: "Atlantic salmon",        sub: "Fillet · 165 g",         k: 358, glyph: "fish"  },
    { name: "Almonds",                sub: "1 oz · 28 g",            k: 164, glyph: "leaf"  },
  ];
  const trending = ["High-protein bowls", "Spring greens", "Iced matcha", "Sourdough"];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 26, fontFamily: "var(--sans)", fontWeight: 700, letterSpacing: "-0.01em" }}>Add to <span style={{ color: "var(--persimmon)", fontWeight: 700 }}>Lunch</span></h1>
        <button className="fv-chip" style={{ padding: 8 }} onClick={() => onTab?.("today")}><I.close size={14} /></button>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 18px 0" }}>
        <div className="fv-field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <I.search size={16} stroke={1.6} />
          <input className="fv-input" placeholder="Search 2.4M foods" defaultValue="" />
          <I.flask size={16} stroke={1.6} style={{ color: "var(--ink-3)" }} />
        </div>
      </div>

      {/* Capture modes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 18px 0" }}>
        {[
          { id: "barcode", label: "Barcode", sub: "Scan EAN / UPC", Icon: I.barcode, primary: true },
          { id: "photo",   label: "Photo AI", sub: "Snap a meal",     Icon: I.camera },
          { id: "voice",   label: "Voice",    sub: "Just speak",      Icon: I.mug },
        ].map(m => (
          <div key={m.id} style={{
            padding: 12,
            background: m.primary ? "var(--ink)" : "var(--card)",
            color: m.primary ? "var(--paper)" : "var(--ink)",
            border: "1px solid " + (m.primary ? "var(--ink)" : "var(--rule-soft)"),
            borderRadius: 12,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <m.Icon size={18} stroke={1.6} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              <div className="fv-mono" style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="fv-tabs" style={{ marginTop: 14 }}>
        {["search","recent","custom","meals"].map(t => (
          <div key={t} className="fv-tab" data-on={tab === t} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      <div className="fv-body" style={{ padding: "12px 18px 16px" }}>
        <div className="fv-cap" style={{ marginBottom: 8 }}>Recently logged</div>
        <div className="fv-card" style={{ padding: 0 }}>
          {recents.map(r => (
            <div key={r.name} className="fv-row" style={{ padding: "10px 14px" }}>
              <FoodGlyph kind={r.glyph} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                <div className="fv-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>{r.sub}</div>
              </div>
              <div style={{ textAlign: "right", marginRight: 4 }}>
                <div className="fv-num" style={{ fontSize: 16 }}>{r.k}</div>
                <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>kcal</div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--persimmon)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <I.plus size={14} stroke={2.2} />
              </div>
            </div>
          ))}
        </div>

        <div className="fv-cap" style={{ margin: "20px 0 8px" }}>Trending now</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {trending.map(t => (
            <span key={t} className="fv-chip">{t}</span>
          ))}
        </div>
      </div>

      <BottomNav active="scan" onChange={onTab} />
      <FvNavBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04 · INSIGHTS
// ─────────────────────────────────────────────────────────────
function ScreenInsights({ onTab }) {
  const week = [1820, 2210, 1980, 2450, 1256, 0, 0];
  const labels = ["M","T","W","T","F","S","S"];
  return (
    <div className="fv-screen">
      <FvStatusBar />
      <div style={{ padding: "8px 18px 4px" }}>
        <div className="fv-cap">Trends</div>
        <h1 style={{ fontSize: 28, marginTop: 4 }}>This week</h1>
      </div>

      <div className="fv-body" style={{ padding: "8px 18px 16px" }}>
        {/* Weekly intake */}
        <div className="fv-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="fv-cap">Calorie intake</div>
              <div className="fv-num" style={{ fontSize: 28, marginTop: 4 }}>
                1,943 <span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>avg / day</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)", marginBottom: 2 }}>vs goal</div>
              <div className="fv-num" style={{ fontSize: 18, color: "var(--moss)" }}>−344</div>
            </div>
          </div>
          <BarChart data={week.map(v => v || 1)} target={2287} labels={labels} width={300} height={100} />
        </div>

        {/* Macros breakdown */}
        <div className="fv-card" style={{ padding: 16, marginTop: 14 }}>
          <div className="fv-cap" style={{ marginBottom: 12 }}>Average macros</div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <DonutMacro p={132} c={245} f={68} size={108} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <Legend dot="var(--berry)" name="Protein" v="132g" pct="27%" />
              <Legend dot="var(--ochre)" name="Carbs"   v="245g" pct="50%" />
              <Legend dot="var(--persimmon)" name="Fat" v="68g"  pct="23%" />
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="fv-card" style={{ padding: 16, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div className="fv-cap">Weight</div>
              <div className="fv-num" style={{ fontSize: 28, marginTop: 4 }}>
                73.4 <span className="fv-mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>kg</span>
              </div>
              <div className="fv-mono" style={{ fontSize: 10, color: "var(--moss)", marginTop: 2 }}>↓ 1.8 kg in 30 days</div>
            </div>
            <div className="fv-stamp">on pace</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Sparkline
              data={[75.2,74.9,75.0,74.6,74.4,74.1,73.9,73.8,74.0,73.6,73.5,73.4]}
              width={300} height={70}
              color="var(--persimmon)"
              fill="rgba(214,90,49,0.10)"
              showDots
              target={72.5}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>30 d ago</span>
            <span className="fv-mono" style={{ fontSize: 9, color: "var(--ink-4)" }}>target 72.5 kg</span>
          </div>
        </div>

        {/* Insight cards */}
        <div className="fv-cap" style={{ margin: "22px 0 10px" }}>Patterns we noticed</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InsightCard
            tag="HABIT"
            title="Protein dips on Sundays"
            body="Average Sunday intake is 84g — 35% below target. Try a yoghurt parfait the night before."
          />
          <InsightCard
            tag="WIN"
            title="14-day logging streak"
            body="Longest streak this quarter. Users who hit 21 days reach goal weight 2.4× more often."
            tone="moss"
          />
          <InsightCard
            tag="WATCH"
            title="Sodium running high"
            body="Average 2,940 mg — 28% above target. Mostly from restaurant lunches Wed & Thu."
            tone="berry"
          />
        </div>
      </div>

      <BottomNav active="insights" onChange={onTab} />
      <FvNavBar />
    </div>
  );
}

function Legend({ dot, name, v, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: dot, display: "inline-block" }} />
        <span className="fv-cap" style={{ color: "var(--ink-2)" }}>{name}</span>
      </div>
      <div className="fv-mono" style={{ fontSize: 11 }}>
        <span style={{ color: "var(--ink)" }}>{v}</span>
        <span style={{ color: "var(--ink-4)" }}> · {pct}</span>
      </div>
    </div>
  );
}

function DonutMacro({ p, c, f, size = 100 }) {
  const total = p * 4 + c * 4 + f * 9;
  const segs = [
    { v: (p * 4) / total, color: "var(--berry)" },
    { v: (c * 4) / total, color: "var(--ochre)" },
    { v: (f * 9) / total, color: "var(--persimmon)" },
  ];
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--paper-deep)" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = s.v * C;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${len - 2} ${C - len + 2}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
        off += len;
        return el;
      })}
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14" fontFamily="var(--serif)" fill="var(--ink)">
        {Math.round(total)}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="8" fontFamily="var(--mono)" fill="var(--ink-4)" letterSpacing="0.14em">
        KCAL
      </text>
    </svg>
  );
}

function InsightCard({ tag, title, body, tone = "ink" }) {
  const tones = {
    ink: "var(--ink)",
    moss: "var(--moss)",
    berry: "var(--berry)",
    persimmon: "var(--persimmon)",
  };
  return (
    <div className="fv-card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        flexShrink: 0, width: 4, alignSelf: "stretch",
        background: tones[tone], borderRadius: 2,
      }} />
      <div style={{ flex: 1 }}>
        <div className="fv-mono" style={{ fontSize: 9, letterSpacing: "0.16em", color: tones[tone], fontWeight: 600 }}>{tag}</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenToday, ScreenDiary, ScreenCapture, ScreenInsights,
  Stat, Legend, DonutMacro, InsightCard,
});

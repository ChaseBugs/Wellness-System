// FoodVisor — App entry: design canvas wiring + tweaks

const { useState: useAppS, useEffect: useAppE } = React;

// ─────────────────────────────────────────────────────────────
// Interactive shell — bottom-nav-driven prototype
// ─────────────────────────────────────────────────────────────
function InteractiveApp() {
  const [tab, setTab] = useAppS("today");
  const screens = {
    today:    <ScreenToday    onTab={setTab} />,
    diary:    <ScreenDiary    onTab={setTab} />,
    scan:     <ScreenCapture  onTab={setTab} />,
    insights: <ScreenInsights onTab={setTab} />,
    profile:  <ScreenProfile  onTab={setTab} />,
  };
  return screens[tab] || screens.today;
}

// ─────────────────────────────────────────────────────────────
// Defaults for tweaks
// ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#405ff2",
  "paper":  "#ffffff",
  "ink":    "#212121",
  "serifDisplay": false,
  "deviceWidth": 360
}/*EDITMODE-END*/;

function FvTweaks() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme tokens live to root
  useAppE(() => {
    const r = document.documentElement;
    r.style.setProperty("--persimmon", t.accent);
    r.style.setProperty("--paper", t.paper);
    r.style.setProperty("--ink", t.ink);
  }, [t.accent, t.paper, t.ink]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Palette">
        <TweakColor
          label="Accent"
          value={t.accent}
          onChange={(v) => setT("accent", v)}
          options={["#405ff2", "#246bfd", "#7e6dfc", "#1a998e", "#12d18e", "#ff6347", "#f75555", "#ffd300"]}
        />
        <TweakColor
          label="Paper"
          value={t.paper}
          onChange={(v) => setT("paper", v)}
          options={["#ffffff", "#cff4fc", "#e3f7fb", "#dcefe6", "#f4efe6", "#0c2733"]}
        />
      </TweakSection>
      <TweakSection title="Frame">
        <TweakSlider label="Device width" min={320} max={420} step={4}
          value={t.deviceWidth} onChange={(v) => setT("deviceWidth", v)} />
      </TweakSection>
      <TweakSection title="Type">
        <TweakToggle label="Serif display headlines"
          value={t.serifDisplay} onChange={(v) => setT("serifDisplay", v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

// ─────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────
function App() {
  // Read live device width from tweaks, fallback to default
  const w = TWEAK_DEFAULTS.deviceWidth;

  const board = (label, w_, h_, content) => (
    <DCArtboard id={label.toLowerCase().replace(/\s+/g, "-")} label={label} width={w_} height={h_}>
      {content}
    </DCArtboard>
  );

  return (
    <>
      <FvTweaks />
      <DesignCanvas>
        <DCSection id="presignup" title="Pre-signup · First-run flow"
          subtitle="From cold start through onboarding to the first dashboard.">
          {board("00 · Splash", w, 740, <Phone width={w} height={740}><ScreenSplash /></Phone>)}
          {board("01 · Welcome", w, 740, <Phone width={w} height={740}><ScreenWelcome /></Phone>)}
          {board("02 · Sign in", w, 740, <Phone width={w} height={740}><ScreenSignIn /></Phone>)}
          {board("03 · Goal", w, 740, <Phone width={w} height={740}><ScreenOnboarding /></Phone>)}
          {board("04 · Baseline", w, 740, <Phone width={w} height={740}><ScreenBasicProfile /></Phone>)}
          {board("05 · Permissions", w, 740, <Phone width={w} height={740}><ScreenPermissions /></Phone>)}
          {board("06 · Plan reveal", w, 740, <Phone width={w} height={740}><ScreenGoalReveal /></Phone>)}
        </DCSection>

        <DCSection id="hero" title="FoodVisor · Caroli Analyze"
          subtitle="An almanac for what you eat. Click through the prototype on the left.">
          {board("Interactive prototype", w, 740, <Phone width={w} height={740}><InteractiveApp /></Phone>)}
          {board("01 · Today", w, 740, <Phone width={w} height={740}><ScreenToday /></Phone>)}
          {board("02 · Diary", w, 740, <Phone width={w} height={740}><ScreenDiary /></Phone>)}
          {board("03 · Trends", w, 740, <Phone width={w} height={740}><ScreenInsights /></Phone>)}
        </DCSection>

        <DCSection id="capture" title="Capture flows"
          subtitle="Three ways to log a meal — search, barcode, photo AI.">
          {board("04 · Add to meal", w, 740, <Phone width={w} height={740}><ScreenCapture /></Phone>)}
          {board("05 · Barcode scan", w, 740, <Phone width={w} height={740}><ScreenBarcode /></Phone>)}
          {board("06 · Photo AI · result", w, 740, <Phone width={w} height={740}><ScreenPhotoAI /></Phone>)}
          {board("07 · Recipe detail", w, 740, <Phone width={w} height={740}><ScreenRecipe /></Phone>)}
        </DCSection>

        <DCSection id="setup" title="In-app setup"
          subtitle="The legacy onboarding step kept for reference, profile, and the Mifflin-St Jeor calculator.">
          {board("Onboarding (in-app)", w, 740, <Phone width={w} height={740}><ScreenOnboarding /></Phone>)}
          {board("Calorie goal", w, 740, <Phone width={w} height={740}><ScreenGoals /></Phone>)}
          {board("You", w, 740, <Phone width={w} height={740}><ScreenProfile /></Phone>)}
        </DCSection>

        <DCSection id="dev" title="Developer Console · Caroli API"
          subtitle="Third-party developers consume the same nutrition engine via /api/v1.">
          {board("11 · API console", w, 740, <Phone width={w} height={740}><ScreenDevDash /></Phone>)}
          {board("12 · API playground", w, 740, <Phone width={w} height={740}><ScreenDevPlayground /></Phone>)}
        </DCSection>
      </DesignCanvas>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

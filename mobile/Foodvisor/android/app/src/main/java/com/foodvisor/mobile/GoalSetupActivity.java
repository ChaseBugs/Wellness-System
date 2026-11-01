package com.foodvisor.mobile;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

import java.util.HashSet;
import java.util.Set;

public class GoalSetupActivity extends Activity {

    // ── Step definitions ──────────────────────────────────────────────────────
    // Each step: { section (0-3), question, type (0=single, 1=multi, 2=input) }
    private static final int SECTION_PROFILE = 0;
    private static final int SECTION_ENV     = 1;
    private static final int SECTION_HABITS  = 2;
    private static final int SECTION_NEEDS   = 3;

    private static final String[] SECTION_LABELS  = {"Goal & profile", "Your environment", "Your habits & behaviour", "Your needs"};
    private static final int[]    SECTION_COLORS   = {
            Color.rgb(240, 150, 80),   // orange
            Color.rgb(46,  156, 110),  // green
            Color.rgb(100, 180, 190),  // teal
            Color.rgb(27,  43,  58),   // dark navy
    };
    // Total sections for progress bar
    private static final int TOTAL_SECTIONS = 4;

    private static final int TYPE_SINGLE = 0;
    private static final int TYPE_MULTI  = 1;
    private static final int TYPE_INPUT  = 2;

    private static class Step {
        int section, type;
        String question;
        String[] options;
        String inputHint, unit, prefKey;
        Step(int section, String question, int type, String[] options, String pref) {
            this.section = section; this.question = question;
            this.type = type; this.options = options; this.prefKey = pref;
        }
        Step input(String hint, String unit) {
            this.inputHint = hint; this.unit = unit; return this;
        }
    }

    private static final Step[] STEPS = {
        new Step(SECTION_PROFILE, "What is your gender?", TYPE_SINGLE,
                new String[]{"Male", "Female", "Non binary"}, "gender"),
        new Step(SECTION_PROFILE, "How old are you?", TYPE_INPUT, null, "age")
                .input("Enter your age", ""),
        new Step(SECTION_PROFILE, "What is your main goal?", TYPE_SINGLE,
                new String[]{"Lose weight", "Maintain weight", "Gain muscle"}, "goal"),
        new Step(SECTION_PROFILE, "What is your current weight?", TYPE_INPUT, null, "weight_current")
                .input("e.g. 70", "kg"),
        new Step(SECTION_PROFILE, "What is your goal weight?", TYPE_INPUT, null, "weight_target")
                .input("e.g. 65", "kg"),
        new Step(SECTION_PROFILE, "What is your height?", TYPE_INPUT, null, "height")
                .input("e.g. 170", "cm"),
        new Step(SECTION_PROFILE, "How active are you?", TYPE_SINGLE,
                new String[]{"Sedentary", "Lightly active", "Moderately active", "Very active"}, "activity"),
        new Step(SECTION_ENV, "Where do you live?", TYPE_SINGLE,
                new String[]{"In the city", "In the suburbs", "The country", "Other"}, "location"),
        new Step(SECTION_HABITS, "How often do you exercise?", TYPE_SINGLE,
                new String[]{"Never", "1–2 times/week", "3–4 times/week", "Daily"}, "exercise_freq"),
        new Step(SECTION_HABITS, "Usually what triggers you to get a snack?", TYPE_MULTI,
                new String[]{"Boredom", "Hunger", "Seeing food", "Stress", "Strong emotion", "Other"}, "snack_trigger"),
        new Step(SECTION_NEEDS, "What would you be interested in learning about?", TYPE_MULTI,
                new String[]{"Nutrition", "Habit creation", "Stress management", "Motivation helpers", "Behavior change", "Sleep", "Other"}, "interests"),
    };

    private int step = 0;
    private final String[] singleSelections = new String[STEPS.length];
    private final Set<String>[] multiSelections;
    private final String[] inputValues = new String[STEPS.length];
    private SharedPreferences prefs;

    @SuppressWarnings("unchecked")
    public GoalSetupActivity() {
        multiSelections = new Set[STEPS.length];
        for (int i = 0; i < STEPS.length; i++) multiSelections[i] = new HashSet<>();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("foodvisor_profile", MODE_PRIVATE);
        showStep(0);
    }

    @Override
    public void onBackPressed() {
        if (step > 0) { showStep(step - 1); } else { super.onBackPressed(); }
    }

    private void showStep(int next) {
        step = next;
        Step s = STEPS[step];
        Ui.styleBars(this, Ui.PAPER, true);

        LinearLayout root = Ui.screen(this, Ui.PAPER);
        root.setPadding(Ui.dp(this, 20), Ui.dp(this, 22), Ui.dp(this, 20), Ui.dp(this, 20));

        // Section badge
        int sc = SECTION_COLORS[s.section];
        int scText = s.section == SECTION_NEEDS ? Ui.PAPER : Ui.NAVY;
        root.addView(Ui.pillBadge(this, SECTION_LABELS[s.section], sc, scText));

        // Progress bar: fill = sections completed so far
        int filled = s.section + 1;
        root.addView(Ui.segmentedProgress(this, TOTAL_SECTIONS, filled),
                Ui.lpm(this, -1, -2, 0, 12, 0, 0));

        // Question
        TextView question = Ui.text(this, s.question, 24, Ui.NAVY, Typeface.BOLD);
        question.setLineSpacing(Ui.dp(this, 3), 1f);
        root.addView(question, Ui.lpm(this, -1, -2, 0, 28, 0, 0));

        // Options or input
        ScrollView scroll = Ui.scroll(this, buildOptions(s));
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));

        // Bottom nav
        LinearLayout nav = Ui.h(this);
        nav.setGravity(Gravity.CENTER_VERTICAL);
        nav.setPadding(0, Ui.dp(this, 12), 0, 0);

        if (step > 0) {
            TextView back = Ui.backCircle(this);
            back.setOnClickListener(v -> showStep(step - 1));
            nav.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 52), Ui.dp(this, 52)));
            nav.addView(Ui.spacer(this, 0), Ui.weight(this, -1, 1, 12, 0, 0, 0));
        } else {
            nav.addView(Ui.spacer(this, 0), new LinearLayout.LayoutParams(0, 1, 1));
        }

        String btnLabel = step == STEPS.length - 1 ? "Finish" : "Next";
        TextView nextBtn = Ui.bigButton(this, btnLabel);
        nextBtn.setOnClickListener(v -> advance(s));
        nav.addView(nextBtn, new LinearLayout.LayoutParams(step > 0 ? Ui.dp(this, 200) : -1, Ui.dp(this, 56)));
        root.addView(nav, new LinearLayout.LayoutParams(-1, Ui.dp(this, 68)));

        setContentView(root);
    }

    private LinearLayout buildOptions(Step s) {
        LinearLayout col = Ui.v(this);
        col.setPadding(0, Ui.dp(this, 8), 0, 0);

        if (s.type == TYPE_INPUT) {
            EditText input = Ui.numInput(this, s.inputHint != null ? s.inputHint : "");
            if (inputValues[step] != null) input.setText(inputValues[step]);
            input.addTextChangedListener(new android.text.TextWatcher() {
                public void beforeTextChanged(CharSequence c, int st, int cnt, int a) {}
                public void onTextChanged(CharSequence c, int st, int b, int cnt) {
                    inputValues[step] = c.toString();
                }
                public void afterTextChanged(android.text.Editable e) {}
            });
            if (s.unit != null && !s.unit.isEmpty()) {
                LinearLayout row = Ui.h(this);
                row.addView(input, new LinearLayout.LayoutParams(0, Ui.dp(this, 68), 1));
                TextView unitPill = Ui.text(this, s.unit, 14, Ui.PINE, Typeface.BOLD);
                unitPill.setGravity(Gravity.CENTER);
                unitPill.setPadding(Ui.dp(this, 14), 0, Ui.dp(this, 14), 0);
                unitPill.setBackground(Ui.round(Ui.PAPER, Ui.dp(this, 20), Ui.dp(this, 1), Ui.PINE));
                row.addView(unitPill, Ui.lpm(this, -2, Ui.dp(this, 44), 12, 0, 0, 0));
                col.addView(row, Ui.lpm(this, -1, -2, 0, 0, 0, 0));
            } else {
                col.addView(input, new LinearLayout.LayoutParams(-1, Ui.dp(this, 68)));
            }
            return col;
        }

        if (s.type == TYPE_SINGLE) {
            for (String opt : s.options) {
                boolean active = opt.equals(singleSelections[step]);
                LinearLayout pill = Ui.optionPill(this, opt, active);
                pill.setOnClickListener(v -> {
                    singleSelections[step] = opt;
                    showStep(step); // refresh
                });
                col.addView(pill, Ui.lpm(this, -1, -2, 0, 0, 0, 10));
            }
            return col;
        }

        // TYPE_MULTI
        for (String opt : s.options) {
            boolean checked = multiSelections[step].contains(opt);
            LinearLayout row = Ui.checkRow(this, opt, checked);
            row.setOnClickListener(v -> {
                if (multiSelections[step].contains(opt)) multiSelections[step].remove(opt);
                else multiSelections[step].add(opt);
                showStep(step); // refresh
            });
            col.addView(row, Ui.lpm(this, -1, -2, 0, 0, 0, 10));
        }
        return col;
    }

    private void advance(Step s) {
        // Persist selection
        SharedPreferences.Editor ed = prefs.edit();
        if (s.type == TYPE_INPUT && inputValues[step] != null) {
            ed.putString(s.prefKey, inputValues[step]);
        } else if (s.type == TYPE_SINGLE && singleSelections[step] != null) {
            ed.putString(s.prefKey, singleSelections[step]);
        } else if (s.type == TYPE_MULTI) {
            ed.putStringSet(s.prefKey, new HashSet<>(multiSelections[step]));
        }
        ed.apply();

        if (step < STEPS.length - 1) {
            showStep(step + 1);
        } else {
            Ui.go(this, PlanRevealActivity.class);
            finish();
        }
    }
}

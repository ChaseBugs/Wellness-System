package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.Arrays;
import java.util.Collections;

import com.heightincrease.app.model.ReportMetric;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.repository.SettingsStore;
import com.heightincrease.app.ui.Dialogs;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.ReportsViewModel;

public class ReportsActivity extends BaseActivity {
    private static final int SLEEP_PURPLE = android.graphics.Color.rgb(128, 124, 232);
    private ReportsViewModel viewModel;
    private LinearLayout content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Palette.BLUE);
        viewModel = new ReportsViewModel(repository, remote, profiles);

        content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 16), Ui.dp(this, 70), Ui.dp(this, 16), Ui.dp(this, 24));
        content.setBackgroundColor(Palette.BG);
        // The header uses negative margins to reach the screen edges; padding must not clip it.
        content.setClipToPadding(false);
        setTabPage(BottomNav.REPORTS, Ui.scroll(this, content));
        lightStatusIcons();
        render();
    }

    @Override
    protected void onResume() {
        super.onResume();
        viewModel.load(() -> {
            if (alive()) {
                render();
            }
        });
    }

    private void render() {
        content.removeAllViews();
        LinearLayout hero = Ui.vertical(this);
        hero.setBackgroundColor(Palette.BLUE);
        // The blue header runs under the status bar (edge-to-edge), so its own padding clears it.
        hero.setPadding(Ui.dp(this, 14), Ui.dp(this, 76), Ui.dp(this, 14), Ui.dp(this, 70));
        TextView title = Ui.heading(this, "REPORTS", 36, android.graphics.Color.WHITE);
        hero.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 18, 0, 0, 22));
        hero.addView(encouragement());
        content.addView(hero, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, -16, -70, -16, 0));

        // The tiles overlap the bottom of the blue header, as in the design.
        content.addView(metricCard());
        if (!viewModel.isSignedIn()) {
            content.addView(signInCard());
        } else if (viewModel.getError() != null) {
            TextView error = Ui.text(this, viewModel.getError(), 17, Palette.MUTED, Typeface.NORMAL);
            error.setGravity(Gravity.CENTER);
            content.addView(error, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        }
        content.addView(weekCard());
        content.addView(heightCard());
        content.addView(sleepCard());
        content.addView(bmiCard());
        content.addView(weightCard());
    }

    private LinearLayout signInCard() {
        LinearLayout card = Ui.card(this, 22);
        card.addView(Ui.heading(this, "Keep your progress", 24, Palette.TEXT));
        TextView copy = Ui.text(this, "Sign in to save workouts, sleep and height records to your account.",
                18, Palette.MUTED, Typeface.NORMAL);
        card.addView(copy, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 16));
        TextView button = Ui.button(this, "SIGN IN");
        button.setOnClickListener(v -> open(SignInActivity.class));
        card.addView(button);
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private LinearLayout encouragement() {
        LinearLayout card = Ui.card(this, 22);
        card.setBackground(Ui.bg(android.graphics.Color.argb(70, 255, 255, 255), 22, this));
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(Ui.text(this, "👍", 46, android.graphics.Color.WHITE, Typeface.NORMAL),
                Ui.mlp(this, Ui.dp(this, 74), Ui.dp(this, 74), 0, 0, 14, 0));
        TextView copy = Ui.text(this, "Every stretch mastered, every jump perfected - consistent effort builds lasting habits!",
                19, android.graphics.Color.WHITE, Typeface.NORMAL);
        card.addView(copy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        return card;
    }

    private LinearLayout metricCard() {
        LinearLayout card = Ui.card(this, 26);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER);
        for (int i = 0; i < viewModel.getState().size(); i++) {
            card.addView(metric(viewModel.getState().get(i)), new LinearLayout.LayoutParams(0,
                    ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            if (i < viewModel.getState().size() - 1) {
                android.view.View divider = new android.view.View(this);
                divider.setBackgroundColor(Palette.DIVIDER);
                card.addView(divider, new LinearLayout.LayoutParams(Ui.dp(this, 1), Ui.dp(this, 42)));
            }
        }
        card.setPadding(Ui.dp(this, 12), Ui.dp(this, 22), Ui.dp(this, 12), Ui.dp(this, 22));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, -6, -52, -6, 14));
        return card;
    }

    private LinearLayout metric(ReportMetric metric) {
        LinearLayout item = Ui.vertical(this);
        item.setGravity(Gravity.CENTER);
        TextView value = Ui.heading(this, metric.value, 32, Palette.TEXT);
        value.setGravity(Gravity.CENTER);
        TextView label = Ui.text(this, metric.label, 15, Palette.MUTED, Typeface.NORMAL);
        label.setGravity(Gravity.CENTER);
        item.addView(value);
        item.addView(label);
        return item;
    }

    private LinearLayout weekCard() {
        LinearLayout card = Ui.card(this, 22);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.heading(this, "This week", 25, Palette.TEXT),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView history = Ui.text(this, "HISTORY  ›", 17, Palette.MUTED, Typeface.NORMAL);
        history.setOnClickListener(v -> requireSignIn(() -> open(HistoryActivity.class)));
        header.addView(history);
        card.addView(header);

        // Design: weekday initials in one row, date circles in the row below.
        LinearLayout initialsRow = Ui.horizontal(this);
        LinearLayout days = Ui.horizontal(this);
        days.setGravity(Gravity.CENTER);
        // The current week, Sunday first, with today highlighted.
        java.util.Calendar calendar = java.util.Calendar.getInstance();
        int today = calendar.get(java.util.Calendar.DAY_OF_MONTH);
        calendar.add(java.util.Calendar.DAY_OF_MONTH, java.util.Calendar.SUNDAY - calendar.get(java.util.Calendar.DAY_OF_WEEK));
        String initials = "SMTWTFS";
        java.text.SimpleDateFormat iso = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US);
        for (int i = 0; i < 7; i++) {
            int dayOfMonth = calendar.get(java.util.Calendar.DAY_OF_MONTH);
            boolean isToday = dayOfMonth == today;
            // Days with a logged workout are filled blue.
            boolean worked = viewModel.workedOutOn(iso.format(calendar.getTime()));
            calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
            TextView initial = Ui.text(this, String.valueOf(initials.charAt(i)), 17, Palette.MUTED, Typeface.NORMAL);
            initial.setGravity(Gravity.CENTER);
            initialsRow.addView(initial, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));

            android.widget.FrameLayout cell = new android.widget.FrameLayout(this);
            TextView day = Ui.heading(this, String.valueOf(dayOfMonth), 18, isToday || worked ? android.graphics.Color.WHITE : Palette.MUTED);
            day.setGravity(Gravity.CENTER);
            day.setBackground(Ui.bg(worked ? Palette.BLUE : isToday ? Palette.TEXT : Palette.SOFT_GRAY, 23, this));
            cell.addView(day, new android.widget.FrameLayout.LayoutParams(Ui.dp(this, 46), Ui.dp(this, 46), Gravity.CENTER));
            days.addView(cell, new LinearLayout.LayoutParams(0, Ui.dp(this, 50), 1));
        }
        card.addView(initialsRow, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 26, 0, 10));
        card.addView(days);
        int streakDays = viewModel.streakDays();
        android.text.SpannableString streakText = new android.text.SpannableString(
                streakDays + (streakDays == 1 ? " DAY" : " DAYS") + " IN A ROW");
        int digits = String.valueOf(streakDays).length();
        streakText.setSpan(new android.text.style.ForegroundColorSpan(Palette.BLUE), 0, digits, 0);
        streakText.setSpan(new android.text.style.StyleSpan(Typeface.BOLD), 0, digits, 0);
        TextView streak = Ui.text(this, "", 17, Palette.MUTED, Typeface.NORMAL);
        streak.setText(streakText);
        streak.setGravity(Gravity.CENTER);
        card.addView(streak, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 26, 0, 8));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private LinearLayout heightCard() {
        LinearLayout card = Ui.card(this, 22);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.heading(this, "Height", 24, Palette.TEXT),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView edit = Ui.text(this, "Edit ✎", 18, Palette.MUTED, Typeface.NORMAL);
        edit.setOnClickListener(v -> requireSignIn(this::editHeight));
        header.addView(edit);
        card.addView(header);
        LinearLayout row = Ui.horizontal(this);
        row.addView(Ui.heading(this, "Current:", 23, Palette.MUTED),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        Double current = viewModel.currentHeightCm();
        // The value is underlined in blue, as in the design.
        LinearLayout value = Ui.vertical(this);
        value.addView(Ui.heading(this, current == null ? "--" : String.format(java.util.Locale.US, "%.1f CM", current), 25, Palette.BLUE));
        android.view.View underline = new android.view.View(this);
        underline.setBackgroundColor(Palette.BLUE);
        value.addView(underline, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 2), 0, 4, 0, 0));
        row.addView(value);
        card.addView(row, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 34, 0, 16));
        return card;
    }

    private LinearLayout sleepCard() {
        LinearLayout card = Ui.card(this, 22);
        card.addView(Ui.heading(this, "Sleep tracker", 24, Palette.TEXT));
        TextView illustration = Ui.text(this, "🛏", 62, Palette.BLUE, Typeface.NORMAL);
        illustration.setGravity(Gravity.CENTER);
        card.addView(illustration);
        Double lastSleep = viewModel.latestSleepHours();
        TextView copy = Ui.text(this, lastSleep != null ? "Last recorded sleep: " + SleepActivity.duration(lastSleep) + "."
                        : "Regular, sufficient sleep supports recovery and a steady routine. Turn on the sleep tracker to see your patterns.",
                18, Palette.MUTED, Typeface.NORMAL);
        card.addView(copy, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 18, 12, 18, 18));
        TextView button = Ui.button(this, lastSleep != null ? "RECORD SLEEP" : "TURN ON");
        button.setBackground(Ui.bg(SLEEP_PURPLE, 34, this));
        button.setOnClickListener(v -> open(SleepActivity.class));
        card.addView(button, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 32, 8, 32, 6));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    /** WHO adult BMI bands (design: 12_bmi_00), with the user's value marked. */
    private LinearLayout bmiCard() {
        LinearLayout card = Ui.card(this, 22);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.heading(this, "BMI(kg/m²)", 24, Palette.TEXT), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        Double bmi = viewModel.bmi();
        if (bmi != null) {
            TextView edit = Ui.text(this, "Edit ✎", 18, Palette.MUTED, Typeface.NORMAL);
            edit.setOnClickListener(v -> requireSignIn(this::editBody));
            header.addView(edit);
        }
        card.addView(header);
        TextView source = Ui.text(this, "BMI = weight (kg) / height (m)². Categories are the WHO adult ranges.", 15, Palette.MUTED, Typeface.NORMAL);
        card.addView(source, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 12, 0, 14));
        if (bmi == null) {
            TextView input = Ui.button(this, "INPUT YOUR DATA");
            input.setTextSize(18);
            input.setOnClickListener(v -> requireSignIn(this::editBody));
            card.addView(input, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 42, 0, 42, 0));
        } else {
            TextView value = Ui.text(this, String.format(java.util.Locale.US, "%.2f", bmi), 18, android.graphics.Color.WHITE, Typeface.NORMAL);
            value.setBackground(Ui.bg(Palette.TEXT, 14, this));
            value.setPadding(Ui.dp(this, 12), Ui.dp(this, 2), Ui.dp(this, 12), Ui.dp(this, 2));
            LinearLayout.LayoutParams valueParams = Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 6);
            // Place the label above its position on the 15-40 scale.
            float position = (float) Math.max(0, Math.min(1, (bmi - 15) / 25));
            valueParams.leftMargin = (int) (position * (getResources().getDisplayMetrics().widthPixels - Ui.dp(this, 140)));
            card.addView(value, valueParams);
            card.addView(bmiScale());
            if (viewModel.isAdult()) {
                card.addView(Ui.text(this, "● " + ReportsViewModel.bmiCategory(bmi), 18, Palette.TEXT, Typeface.NORMAL),
                        Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 14, 0, 0));
            } else {
                card.addView(Ui.text(this, "Adult categories don't apply under 18; children's BMI is read against age charts. Ask a health professional.",
                        15, Palette.MUTED, Typeface.NORMAL), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 14, 0, 0));
            }
        }
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private LinearLayout bmiScale() {
        LinearLayout wrap = Ui.vertical(this);
        LinearLayout bands = Ui.horizontal(this);
        int[] colors = {android.graphics.Color.rgb(60, 80, 220), android.graphics.Color.rgb(80, 150, 240), android.graphics.Color.rgb(40, 210, 200),
                android.graphics.Color.rgb(250, 210, 60), android.graphics.Color.rgb(250, 160, 60), android.graphics.Color.rgb(240, 60, 90)};
        float[] widths = {1, 2.5f, 6.5f, 5, 5, 5};
        for (int i = 0; i < colors.length; i++) {
            android.view.View band = new android.view.View(this);
            band.setBackground(Ui.bg(colors[i], 6, this));
            LinearLayout.LayoutParams params = Ui.mlp(this, 0, Ui.dp(this, 12), i == 0 ? 0 : 3, 0, 0, 0);
            params.weight = widths[i];
            bands.addView(band, params);
        }
        wrap.addView(bands);
        // Each label starts where its band starts (15 / 18.5 / 25 / 30 / 35, then 40 at the end).
        LinearLayout labels = Ui.horizontal(this);
        String[] marks = {"15", "18.5", "25", "30", "35"};
        float[] spans = {3.5f, 6.5f, 5, 5, 5};
        for (int i = 0; i < marks.length; i++) {
            labels.addView(Ui.text(this, marks[i], 14, Palette.MUTED, Typeface.NORMAL), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, spans[i]));
        }
        labels.addView(Ui.text(this, "40", 14, Palette.MUTED, Typeface.NORMAL));
        wrap.addView(labels, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 0));
        return wrap;
    }

    /** Weight (design: 12_bmi_01): current value and the change over the report window. */
    private LinearLayout weightCard() {
        LinearLayout card = Ui.card(this, 22);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.heading(this, "Weight(kg)", 24, Palette.TEXT), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView plus = Ui.text(this, "+", 32, Palette.BLUE, Typeface.NORMAL);
        plus.setOnClickListener(v -> requireSignIn(this::recordWeight));
        header.addView(plus);
        card.addView(header);
        Double weight = viewModel.latestWeightKg();
        if (weight == null) {
            TextView record = Ui.button(this, "RECORD TODAY WEIGHT");
            record.setTextSize(18);
            record.setOnClickListener(v -> requireSignIn(this::recordWeight));
            card.addView(record, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 42, 18, 42, 0));
        } else {
            Double change = viewModel.weightChangeKg();
            LinearLayout stats = Ui.horizontal(this);
            stats.addView(weightStat("Current:", Dialogs.format(weight)), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            stats.addView(weightStat("Last 30 days", change == null ? "0.0" : (change > 0 ? "+" : "") + Dialogs.format(change)),
                    new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            card.addView(stats, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 18, 0, 6));
        }
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private LinearLayout weightStat(String label, String value) {
        LinearLayout item = Ui.vertical(this);
        item.setGravity(Gravity.CENTER);
        item.addView(Ui.text(this, label, 16, Palette.MUTED, Typeface.NORMAL));
        item.addView(Ui.heading(this, value, 30, Palette.TEXT));
        return item;
    }

    // ---- Record dialogs ----

    private void editHeight() {
        boolean imperial = new SettingsStore(this).imperial();
        Dialogs.measures(this, null, Collections.singletonList(Dialogs.Measure.height(viewModel.currentHeightCm(), imperial)), values -> {
            remote.recordHeight(values[0], saved("Height saved."));
            return null;
        });
    }

    private void editBody() {
        boolean imperial = new SettingsStore(this).imperial();
        Dialogs.measures(this, null, Arrays.asList(
                Dialogs.Measure.weight(viewModel.latestWeightKg(), imperial),
                Dialogs.Measure.height(viewModel.currentHeightCm(), imperial)), values -> {
            remote.recordBody(values[0], values[1], saved("Saved."));
            return null;
        });
    }

    private void recordWeight() {
        boolean imperial = new SettingsStore(this).imperial();
        Dialogs.measures(this, "Today", Collections.singletonList(Dialogs.Measure.weight(viewModel.latestWeightKg(), imperial)), values -> {
            remote.recordBody(values[0], null, saved("Weight saved."));
            return null;
        });
    }

    private RemoteRepository.Callback<Void> saved(String message) {
        return new RemoteRepository.Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                if (!alive()) {
                    return;
                }
                toast(message);
                viewModel.load(() -> {
                    if (alive()) {
                        render();
                    }
                });
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    toast(message);
                }
            }
        };
    }
}

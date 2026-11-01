package com.heightincrease.app.activities;

import android.app.TimePickerDialog;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.DayLog;
import com.heightincrease.app.model.ReportData;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.ui.Ui;

import java.util.Locale;

/**
 * Sleep tracker (design: 10_sleep_record). Last night's sleep is recorded from the bedtime and wake-up
 * time and stored as sleep hours on today's log.
 */
public class SleepActivity extends BaseActivity {
    private static final int TARGET_HOURS = 8;
    private static final int NIGHT_TOP = android.graphics.Color.rgb(60, 26, 140);
    private static final int NIGHT_BOTTOM = android.graphics.Color.rgb(52, 62, 180);
    private static final int MUTED_LIGHT = android.graphics.Color.argb(170, 255, 255, 255);

    private LinearLayout root;
    private Double todayHours;
    private boolean saving;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setNavigationBarColor(NIGHT_BOTTOM);
        root = Ui.vertical(this);
        root.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[]{NIGHT_TOP, NIGHT_BOTTOM}));
        root.setPadding(Ui.dp(this, 16), Ui.dp(this, 44), Ui.dp(this, 16), Ui.dp(this, 30));
        setContentView(root);
        lightStatusIcons();
        render();
        load();
    }

    private void load() {
        if (!remote.isSignedIn()) {
            return;
        }
        remote.report(new RemoteRepository.Callback<ReportData>() {
            @Override
            public void onSuccess(ReportData value) {
                if (!alive()) {
                    return;
                }
                DayLog today = value.day(RemoteRepository.today());
                todayHours = today == null ? null : today.sleepHours;
                render();
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    toast(message);
                }
            }
        });
    }

    private void render() {
        root.removeAllViews();
        LinearLayout header = Ui.horizontal(this);
        TextView back = Ui.text(this, "←", 28, android.graphics.Color.WHITE, Typeface.NORMAL);
        back.setOnClickListener(v -> finish());
        header.addView(back, Ui.mlp(this, Ui.dp(this, 48), ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 12, 0));
        header.addView(Ui.text(this, "Today", 26, android.graphics.Color.WHITE, Typeface.NORMAL),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView add = Ui.text(this, "+", 32, android.graphics.Color.WHITE, Typeface.NORMAL);
        add.setOnClickListener(v -> record());
        header.addView(add);
        root.addView(header);

        LinearLayout circle = Ui.vertical(this);
        circle.setGravity(Gravity.CENTER);
        circle.setBackground(Ui.bg(android.graphics.Color.argb(40, 255, 255, 255), 150, this));
        TextView moon = Ui.text(this, "🌙", 54, android.graphics.Color.WHITE, Typeface.NORMAL);
        moon.setGravity(Gravity.CENTER);
        circle.addView(moon);
        double hours = todayHours == null ? 0 : todayHours;
        TextView duration = Ui.heading(this, duration(hours), 46, android.graphics.Color.WHITE);
        duration.setGravity(Gravity.CENTER);
        circle.addView(duration, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 10, 0, 0));
        TextView target = Ui.text(this, "Target: " + TARGET_HOURS + " Hours", 17, MUTED_LIGHT, Typeface.BOLD);
        target.setGravity(Gravity.CENTER);
        circle.addView(target, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 10, 0, 0));
        LinearLayout.LayoutParams circleParams = Ui.mlp(this, Ui.dp(this, 280), Ui.dp(this, 280), 0, 40, 0, 0);
        circleParams.gravity = Gravity.CENTER_HORIZONTAL;
        root.addView(circle, circleParams);

        TextView hint = Ui.text(this, !remote.isSignedIn() ? "Sign in to keep your sleep records."
                : todayHours == null ? "Record last night's sleep." : "Recorded for today. Tap + to change it.", 16, MUTED_LIGHT, Typeface.NORMAL);
        hint.setGravity(Gravity.CENTER);
        root.addView(hint, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, 0, 0, 24, 0, 0));
        ((LinearLayout.LayoutParams) hint.getLayoutParams()).weight = 1;

        TextView button = Ui.text(this, saving ? "…" : "+", 40, android.graphics.Color.WHITE, Typeface.NORMAL);
        button.setGravity(Gravity.CENTER);
        button.setBackground(new GradientDrawable(GradientDrawable.Orientation.TL_BR,
                new int[]{android.graphics.Color.rgb(90, 190, 250), android.graphics.Color.rgb(120, 120, 250)}));
        ((GradientDrawable) button.getBackground()).setCornerRadius(Ui.dp(this, 46));
        button.setOnClickListener(v -> record());
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(Ui.dp(this, 92), Ui.dp(this, 92));
        buttonParams.gravity = Gravity.CENTER_HORIZONTAL;
        root.addView(button, buttonParams);
        TextView label = Ui.text(this, "Sleep record", 20, android.graphics.Color.WHITE, Typeface.NORMAL);
        label.setGravity(Gravity.CENTER);
        label.setOnClickListener(v -> record());
        root.addView(label, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 14, 0, 30));
    }

    /** Asks for the bedtime (yesterday) and the wake-up time (today), then saves the duration. */
    private void record() {
        if (saving) {
            return;
        }
        requireSignIn(() -> new TimePickerDialog(this, (picker, sleepHour, sleepMinute) ->
                new TimePickerDialog(this, (picker2, wakeHour, wakeMinute) -> {
                    int asleep = sleepHour * 60 + sleepMinute;
                    int awake = wakeHour * 60 + wakeMinute;
                    int minutes = awake > asleep ? awake - asleep : 24 * 60 - asleep + awake;
                    save(minutes / 60.0);
                }, 6, 0, false).show(), 22, 0, false).show());
        toastOnce();
    }

    private boolean hinted;

    private void toastOnce() {
        if (!hinted && remote.isSignedIn()) {
            hinted = true;
            toast("Choose when you fell asleep, then when you woke up.");
        }
    }

    private void save(double hours) {
        saving = true;
        render();
        remote.recordSleep(hours, new RemoteRepository.Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                if (!alive()) {
                    return;
                }
                saving = false;
                todayHours = Math.round(hours * 100) / 100.0;
                toast("Sleep saved: " + duration(hours));
                render();
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    saving = false;
                    toast(message);
                    render();
                }
            }
        });
    }

    static String duration(double hours) {
        int minutes = (int) Math.round(hours * 60);
        return String.format(Locale.US, "%d h %d m", minutes / 60, minutes % 60);
    }
}

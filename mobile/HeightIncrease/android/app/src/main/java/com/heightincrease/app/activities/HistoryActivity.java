package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.DayLog;
import com.heightincrease.app.model.ReportData;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** The last 30 days of logs: workouts, sleep, weight and height. */
public class HistoryActivity extends BaseActivity {
    private LinearLayout list;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout root = page(Palette.BG);
        root.addView(topBar("HISTORY", null, null));
        list = Ui.vertical(this);
        list.setPadding(Ui.dp(this, 16), Ui.dp(this, 4), Ui.dp(this, 16), Ui.dp(this, 24));
        root.addView(Ui.scroll(this, list), new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        setContentView(root);
        status("Loading...");
        remote.report(new RemoteRepository.Callback<ReportData>() {
            @Override
            public void onSuccess(ReportData value) {
                if (alive()) {
                    render(value.logs);
                }
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    status(message);
                }
            }
        });
    }

    private void render(List<DayLog> logs) {
        list.removeAllViews();
        if (logs.isEmpty()) {
            status("Nothing recorded yet. Finish a workout or record your sleep to see it here.");
            return;
        }
        for (DayLog log : logs) {
            LinearLayout card = Ui.card(this, 20);
            card.addView(Ui.heading(this, pretty(log.date), 20, Palette.TEXT));
            List<String> parts = new ArrayList<>();
            if (log.workoutMinutes > 0) {
                parts.add("🏃 " + log.workoutMinutes + " min workout");
            }
            if (log.sleepHours != null) {
                parts.add("🌙 " + SleepActivity.duration(log.sleepHours) + " sleep");
            }
            if (log.weightKg != null) {
                parts.add(String.format(Locale.US, "⚖ %.1f kg", log.weightKg));
            }
            if (log.heightCm != null) {
                parts.add(String.format(Locale.US, "📏 %.1f cm", log.heightCm));
            }
            card.addView(Ui.text(this, parts.isEmpty() ? "No details" : android.text.TextUtils.join("\n", parts), 17, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 6, 0, 0));
            card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 12));
            list.addView(card);
        }
    }

    private void status(String message) {
        list.removeAllViews();
        TextView view = Ui.text(this, message, 17, Palette.MUTED, Typeface.NORMAL);
        view.setGravity(Gravity.CENTER);
        list.addView(view, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 40, 0, 0));
    }

    private static String pretty(String date) {
        try {
            return new SimpleDateFormat("EEE, MMM d", Locale.US).format(new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(date));
        } catch (ParseException error) {
            return date;
        }
    }
}

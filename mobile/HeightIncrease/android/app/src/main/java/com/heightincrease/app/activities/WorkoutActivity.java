package com.heightincrease.app.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Typeface;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.window.OnBackInvokedDispatcher;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.heightincrease.app.model.Workout;
import com.heightincrease.app.model.WorkoutStep;
import com.heightincrease.app.repository.MyTrainingStore;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.repository.SettingsStore;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Plays a workout: a "get ready" countdown, then each exercise on a timer with rest in between.
 * Finishing completes the plan's Routine Engine session and adds the minutes to today's log.
 */
public class WorkoutActivity extends BaseActivity {
    private static final String EXTRA_ROUTINE_ID = "routineId";
    private static final String EXTRA_CUSTOM = "custom";

    private enum Phase { LOADING, READY, EXERCISE, REST, SAVING, DONE, ERROR }

    private final Handler handler = new Handler(Looper.getMainLooper());
    private SettingsStore settings;
    private ToneGenerator tone;
    private LinearLayout root;
    /** The countdown text; a tick updates only this view instead of rebuilding the screen. */
    private TextView timerView;

    private Workout workout;
    private Phase phase = Phase.LOADING;
    private int index;
    private int remaining;
    private boolean paused;
    private int activeSeconds;
    private int completedSteps;
    private final List<String> doneNames = new ArrayList<>();
    private String sessionId;
    private String error;

    public static Intent forPlan(Context context, String routineId) {
        return new Intent(context, WorkoutActivity.class).putExtra(EXTRA_ROUTINE_ID, routineId);
    }

    public static Intent forMyTraining(Context context) {
        return new Intent(context, WorkoutActivity.class).putExtra(EXTRA_CUSTOM, true);
    }

    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            if (!paused && (phase == Phase.READY || phase == Phase.EXERCISE || phase == Phase.REST)) {
                if (phase == Phase.EXERCISE) {
                    activeSeconds++;
                }
                remaining--;
                if (remaining > 0 && remaining <= 3) {
                    beep(ToneGenerator.TONE_PROP_BEEP, 120);
                }
                if (remaining <= 0) {
                    advance();
                } else if (timerView != null) {
                    timerView.setText(clock(remaining));
                } else {
                    render();
                }
            }
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        settings = new SettingsStore(this);
        try {
            tone = new ToneGenerator(AudioManager.STREAM_MUSIC, 70);
        } catch (RuntimeException unavailable) {
            tone = null;
        }
        root = page(android.graphics.Color.WHITE);
        setContentView(root);
        // Android 13+ (and predictive back, default from target SDK 36) doesn't call onBackPressed().
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::confirmQuit);
        }
        render();
        load();
        handler.postDelayed(tick, 1000);
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (tone != null) {
            tone.release();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        confirmQuit();
    }

    private void load() {
        if (getIntent().getBooleanExtra(EXTRA_CUSTOM, false)) {
            List<WorkoutStep> steps = new MyTrainingStore(this).load();
            if (steps.isEmpty()) {
                fail("Add exercises to My training first.");
                return;
            }
            begin(new Workout(null, "My training", steps));
            return;
        }
        remote.workout(getIntent().getStringExtra(EXTRA_ROUTINE_ID), new RemoteRepository.Callback<Workout>() {
            @Override
            public void onSuccess(Workout value) {
                if (!alive()) {
                    return;
                }
                if (value.steps.isEmpty()) {
                    fail("This plan has no exercises yet.");
                    return;
                }
                begin(value);
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    fail(message);
                }
            }
        });
    }

    private void begin(Workout value) {
        workout = value;
        index = 0;
        phase = Phase.READY;
        remaining = Math.max(1, settings.countdownSeconds());
        render();
        if (workout.routineId != null) {
            remote.startSession(workout.routineId, new RemoteRepository.Callback<String>() {
                @Override
                public void onSuccess(String id) {
                    sessionId = id;
                }

                @Override
                public void onError(String message) {
                    // The workout still counts in today's log; only the plan session is missing.
                }
            });
        }
    }

    /** Moves to the next phase when a timer ends or the user skips. */
    private void advance() {
        if (phase == Phase.READY) {
            startExercise(index);
        } else if (phase == Phase.EXERCISE) {
            completedSteps++;
            doneNames.add(step().name);
            beep(ToneGenerator.TONE_PROP_ACK, 300);
            if (index >= workout.steps.size() - 1) {
                finishWorkout();
            } else if (step().restSeconds > 0) {
                phase = Phase.REST;
                remaining = step().restSeconds;
                render();
            } else {
                startExercise(index + 1);
            }
        } else if (phase == Phase.REST) {
            startExercise(index + 1);
        }
    }

    private void startExercise(int position) {
        index = position;
        phase = Phase.EXERCISE;
        remaining = Math.max(5, step().durationSeconds);
        paused = false;
        beep(ToneGenerator.TONE_PROP_BEEP2, 250);
        render();
    }

    private void previous() {
        if (phase == Phase.REST) {
            startExercise(index);
        } else if (index > 0) {
            startExercise(index - 1);
        } else {
            startExercise(0);
        }
    }

    private void finishWorkout() {
        phase = Phase.SAVING;
        render();
        remote.finishWorkout(sessionId, completedSteps, Math.max(activeSeconds, 1), doneNames, new RemoteRepository.Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                if (alive()) {
                    phase = Phase.DONE;
                    render();
                }
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    error = message;
                    phase = Phase.ERROR;
                    render();
                }
            }
        });
    }

    private void fail(String message) {
        error = message;
        phase = Phase.ERROR;
        render();
    }

    private void confirmQuit() {
        if (phase == Phase.DONE || phase == Phase.ERROR || phase == Phase.LOADING) {
            finish();
            return;
        }
        boolean wasPaused = paused;
        paused = true;
        new AlertDialog.Builder(this)
                .setMessage("Quit this workout? Progress from this session won't be saved.")
                .setNegativeButton("Keep going", (dialog, which) -> paused = wasPaused)
                .setOnCancelListener(dialog -> paused = wasPaused)
                .setPositiveButton("Quit", (dialog, which) -> {
                    if (sessionId != null) {
                        remote.abandonSession(sessionId);
                    }
                    finish();
                })
                .show();
    }

    private WorkoutStep step() {
        return workout.steps.get(index);
    }

    private void beep(int toneType, int durationMs) {
        if (tone != null && settings.soundOn()) {
            tone.startTone(toneType, durationMs);
        }
    }

    // ---- Rendering ----

    private void render() {
        root.removeAllViews();
        timerView = null;
        boolean rest = phase == Phase.REST;
        root.setBackgroundColor(rest ? Palette.BLUE : android.graphics.Color.WHITE);
        root.setPadding(Ui.dp(this, 22), Ui.dp(this, 44), Ui.dp(this, 22), Ui.dp(this, 26));
        int ink = rest ? android.graphics.Color.WHITE : Palette.TEXT;

        LinearLayout header = Ui.horizontal(this);
        TextView close = Ui.text(this, "✕", 26, rest ? android.graphics.Color.WHITE : Palette.MUTED, Typeface.NORMAL);
        close.setOnClickListener(v -> confirmQuit());
        header.addView(close, Ui.mlp(this, Ui.dp(this, 44), ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 8, 0));
        header.addView(Ui.heading(this, workout == null ? "Workout" : workout.title, 20, ink),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        if (workout != null && phase != Phase.DONE && phase != Phase.ERROR) {
            header.addView(Ui.text(this, (index + 1) + "/" + workout.steps.size(), 18, rest ? android.graphics.Color.WHITE : Palette.MUTED, Typeface.BOLD));
        }
        root.addView(header);

        switch (phase) {
            case LOADING:
            case SAVING:
                centered(phase == Phase.LOADING ? "Loading workout..." : "Saving your workout...", Palette.MUTED);
                return;
            case ERROR:
                renderError();
                return;
            case DONE:
                renderDone();
                return;
            default:
                break;
        }

        if (workout != null) {
            ProgressBar progress = Ui.progress(this, (int) ((index + (phase == Phase.REST ? 1 : 0)) * 100f / workout.steps.size()));
            root.addView(progress, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 8), 0, 18, 0, 0));
        }

        String label = phase == Phase.READY ? "GET READY" : rest ? "REST" : "";
        String name = phase == Phase.REST ? "Next: " + workout.steps.get(index + 1).name : step().name;
        if (!label.isEmpty()) {
            TextView labelView = Ui.heading(this, label, 22, rest ? android.graphics.Color.WHITE : Palette.BLUE);
            labelView.setGravity(Gravity.CENTER);
            root.addView(labelView, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 34, 0, 0));
        }
        TextView title = Ui.heading(this, name.toUpperCase(Locale.US), 30, ink);
        title.setGravity(Gravity.CENTER);
        root.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, label.isEmpty() ? 40 : 6, 0, 0));

        TextView timer = Ui.heading(this, clock(remaining), 64, rest ? android.graphics.Color.WHITE : Palette.BLUE);
        timerView = timer;
        timer.setGravity(Gravity.CENTER);
        timer.setBackground(Ui.bg(rest ? android.graphics.Color.argb(60, 255, 255, 255) : Palette.SOFT_BLUE, 110, this));
        LinearLayout.LayoutParams timerParams = Ui.mlp(this, Ui.dp(this, 220), Ui.dp(this, 220), 0, 28, 0, 0);
        timerParams.gravity = Gravity.CENTER_HORIZONTAL;
        root.addView(timer, timerParams);

        LinearLayout notes = Ui.vertical(this);
        if (phase == Phase.EXERCISE) {
            for (String line : step().instructions) {
                notes.addView(Ui.text(this, line, 17, Palette.TEXT, Typeface.NORMAL));
            }
            for (String line : step().safetyNotes) {
                notes.addView(Ui.text(this, "⚠ " + line, 15, Palette.MUTED, Typeface.NORMAL),
                        Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 6, 0, 0));
            }
        }
        root.addView(Ui.scroll(this, notes), new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        LinearLayout controls = Ui.horizontal(this);
        controls.setGravity(Gravity.CENTER);
        TextView prev = control("‹ PREV", rest);
        prev.setOnClickListener(v -> previous());
        TextView pause = Ui.button(this, paused ? "RESUME" : "PAUSE");
        if (rest) {
            pause.setBackground(Ui.bg(android.graphics.Color.WHITE, 34, this));
            pause.setTextColor(Palette.BLUE);
            pause.setText("+20s");
            pause.setOnClickListener(v -> {
                remaining += 20;
                timerView.setText(clock(remaining));
            });
        } else {
            pause.setOnClickListener(v -> {
                paused = !paused;
                render();
            });
        }
        TextView skip = control("SKIP ›", rest);
        skip.setOnClickListener(v -> advance());
        controls.addView(prev, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        controls.addView(pause, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1.4f));
        controls.addView(skip, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        root.addView(controls);
    }

    private TextView control(String label, boolean rest) {
        TextView view = Ui.heading(this, label, 18, rest ? android.graphics.Color.WHITE : Palette.MUTED);
        view.setGravity(Gravity.CENTER);
        view.setPadding(0, Ui.dp(this, 14), 0, Ui.dp(this, 14));
        return view;
    }

    private void renderDone() {
        TextView emoji = Ui.text(this, "🎉", 72, Palette.TEXT, Typeface.NORMAL);
        emoji.setGravity(Gravity.CENTER);
        root.addView(emoji, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 80, 0, 0));
        TextView title = Ui.heading(this, "WORKOUT COMPLETE!", 32, Palette.TEXT);
        title.setGravity(Gravity.CENTER);
        root.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 16, 0, 0));

        LinearLayout stats = Ui.card(this, 24);
        stats.setBackground(Ui.bg(Palette.BG, 24, this));
        stats.setOrientation(LinearLayout.HORIZONTAL);
        stats.addView(stat(String.valueOf(completedSteps), "EXERCISES"), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        stats.addView(stat(clock(activeSeconds), "DURATION"), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        root.addView(stats, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 32, 0, 0));
        TextView note = Ui.text(this, "Saved to your reports. Consistency builds the habit.", 17, Palette.MUTED, Typeface.NORMAL);
        note.setGravity(Gravity.CENTER);
        root.addView(note, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, 0, 0, 20, 0, 0));
        ((LinearLayout.LayoutParams) note.getLayoutParams()).weight = 1;
        TextView done = Ui.button(this, "DONE");
        done.setOnClickListener(v -> finish());
        root.addView(done);
    }

    private void renderError() {
        centered(error == null ? "Something went wrong." : error, Palette.MUTED);
        if (workout != null && completedSteps > 0) {
            TextView retry = Ui.button(this, "RETRY SAVING");
            retry.setOnClickListener(v -> finishWorkout());
            root.addView(retry, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 12));
        }
        TextView close = Ui.button(this, "CLOSE");
        close.setOnClickListener(v -> finish());
        root.addView(close);
    }

    private void centered(String message, int color) {
        TextView view = Ui.text(this, message, 18, color, Typeface.NORMAL);
        view.setGravity(Gravity.CENTER);
        root.addView(view, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
    }

    private LinearLayout stat(String value, String label) {
        LinearLayout item = Ui.vertical(this);
        item.setGravity(Gravity.CENTER);
        TextView v = Ui.heading(this, value, 32, Palette.TEXT);
        v.setGravity(Gravity.CENTER);
        TextView l = Ui.text(this, label, 14, Palette.MUTED, Typeface.NORMAL);
        l.setGravity(Gravity.CENTER);
        item.addView(v);
        item.addView(l);
        return item;
    }

    private static String clock(int seconds) {
        return String.format(Locale.US, "%02d:%02d", Math.max(0, seconds) / 60, Math.max(0, seconds) % 60);
    }
}

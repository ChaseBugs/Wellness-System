package com.heightincrease.app.activities;

import android.app.AlertDialog;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.Exercise;
import com.heightincrease.app.model.WorkoutStep;
import com.heightincrease.app.repository.MyTrainingStore;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Published exercises to add to My training (design: 09_add_exerice_00 and _detail). */
public class AddExerciseActivity extends BaseActivity {
    private static final int STEP_SECONDS = 5;

    private LinearLayout list;
    private List<Exercise> exercises = new ArrayList<>();
    private String status = "Loading exercises...";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout root = page(Palette.BG);
        root.addView(topBar("ADD EXERCISE", null, null));
        list = Ui.vertical(this);
        list.setPadding(Ui.dp(this, 16), Ui.dp(this, 6), Ui.dp(this, 20), Ui.dp(this, 24));
        root.addView(Ui.scroll(this, list), new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        setContentView(root);
        render();
        remote.exercises(new RemoteRepository.Callback<List<Exercise>>() {
            @Override
            public void onSuccess(List<Exercise> value) {
                if (!alive()) {
                    return;
                }
                exercises = value;
                status = value.isEmpty() ? "No exercises are published yet." : null;
                render();
            }

            @Override
            public void onError(String message) {
                if (alive()) {
                    status = message;
                    render();
                }
            }
        });
    }

    private void render() {
        list.removeAllViews();
        if (status != null) {
            TextView view = Ui.text(this, status, 17, Palette.MUTED, Typeface.NORMAL);
            view.setGravity(Gravity.CENTER);
            list.addView(view, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 40, 0, 0));
            return;
        }
        for (Exercise exercise : exercises) {
            list.addView(row(exercise));
        }
    }

    private LinearLayout row(Exercise exercise) {
        LinearLayout row = Ui.horizontal(this);
        row.setPadding(0, Ui.dp(this, 12), 0, Ui.dp(this, 12));
        TextView plus = Ui.text(this, "⊕", 30, Palette.BLUE, Typeface.NORMAL);
        plus.setOnClickListener(v -> add(exercise, exercise.durationSeconds));
        row.addView(plus, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 6, 0, 18, 0));
        row.addView(Ui.imagePanel(this, android.graphics.Color.WHITE, "🤸"), Ui.mlp(this, Ui.dp(this, 92), Ui.dp(this, 92), 0, 0, 18, 0));
        LinearLayout text = Ui.vertical(this);
        text.addView(Ui.text(this, exercise.title.toUpperCase(Locale.US), 18, Palette.TEXT, Typeface.NORMAL));
        text.addView(Ui.heading(this, MyTrainingActivity.clock(exercise.durationSeconds), 18, Palette.BLUE),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 0));
        row.addView(text, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        row.setOnClickListener(v -> showDetail(exercise));
        return row;
    }

    /** Bottom sheet with the description, steps, safety notes and an adjustable duration. */
    private void showDetail(Exercise exercise) {
        int[] duration = {exercise.durationSeconds};
        LinearLayout body = Ui.vertical(this);
        body.setPadding(Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 22), 0);
        body.addView(Ui.imagePanel(this, Palette.BG, "🤸"), new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 170)));
        body.addView(Ui.heading(this, exercise.title.toUpperCase(Locale.US), 24, Palette.TEXT),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 16, 0, 0));

        LinearLayout durationRow = Ui.horizontal(this);
        durationRow.addView(Ui.text(this, "Duration", 18, Palette.TEXT, Typeface.NORMAL), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView minus = stepper("−");
        TextView value = Ui.heading(this, MyTrainingActivity.clock(duration[0]), 20, Palette.TEXT);
        TextView plus = stepper("+");
        minus.setOnClickListener(v -> {
            duration[0] = Math.max(STEP_SECONDS * 2, duration[0] - STEP_SECONDS);
            value.setText(MyTrainingActivity.clock(duration[0]));
        });
        plus.setOnClickListener(v -> {
            duration[0] = Math.min(600, duration[0] + STEP_SECONDS);
            value.setText(MyTrainingActivity.clock(duration[0]));
        });
        durationRow.addView(minus, new LinearLayout.LayoutParams(Ui.dp(this, 42), Ui.dp(this, 42)));
        durationRow.addView(value, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 12, 0, 12, 0));
        durationRow.addView(plus, new LinearLayout.LayoutParams(Ui.dp(this, 42), Ui.dp(this, 42)));
        body.addView(durationRow, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 12, 0, 8));

        List<String> lines = new ArrayList<>();
        if (!exercise.description.isEmpty()) {
            lines.add(exercise.description);
        }
        lines.addAll(exercise.steps);
        for (String line : lines) {
            body.addView(Ui.text(this, line, 16, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 10, 0, 0));
        }
        for (String note : exercise.safetyNotes) {
            body.addView(Ui.text(this, "⚠ " + note, 15, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 0));
        }
        if (!exercise.expertReviewed) {
            body.addView(Ui.text(this, "Not expert reviewed yet", 13, Palette.MUTED, Typeface.BOLD),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 10, 0, 0));
        }

        android.widget.ScrollView scroll = new android.widget.ScrollView(this);
        scroll.addView(body);
        new AlertDialog.Builder(this)
                .setView(scroll)
                .setNegativeButton("CANCEL", null)
                .setPositiveButton("ADD", (dialog, which) -> add(exercise, duration[0]))
                .show();
    }

    private TextView stepper(String label) {
        TextView view = Ui.text(this, label, 22, Palette.BLUE, Typeface.NORMAL);
        view.setGravity(Gravity.CENTER);
        view.setBackground(Ui.strokeBg(android.graphics.Color.WHITE, Palette.BLUE, 1, 4, this));
        return view;
    }

    private void add(Exercise exercise, int durationSeconds) {
        MyTrainingStore store = new MyTrainingStore(this);
        List<WorkoutStep> steps = store.load();
        List<String> instructions = new ArrayList<>();
        if (!exercise.description.isEmpty()) {
            instructions.add(exercise.description);
        }
        instructions.addAll(exercise.steps);
        steps.add(new WorkoutStep(exercise.id, exercise.title, durationSeconds, MyTrainingStore.REST_SECONDS,
                instructions, exercise.safetyNotes));
        store.save(steps);
        toast(exercise.title + " added to My training.");
    }
}

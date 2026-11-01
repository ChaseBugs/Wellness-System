package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.WorkoutStep;
import com.heightincrease.app.repository.MyTrainingStore;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** The user's own exercise list (design: 08_mytraining_list). Kept on the device; START plays it. */
public class MyTrainingActivity extends BaseActivity {
    private MyTrainingStore store;
    private List<WorkoutStep> steps = new ArrayList<>();
    private LinearLayout list;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        store = new MyTrainingStore(this);

        LinearLayout root = page(Palette.BG);
        // Every change is saved as it happens; SAVE confirms and closes, as in the design.
        root.addView(topBar("MY TRAINING", "SAVE", v -> {
            store.save(steps);
            toast("My training saved.");
            finish();
        }));

        LinearLayout content = Ui.vertical(this);
        content.setBackgroundColor(android.graphics.Color.WHITE);
        content.setPadding(Ui.dp(this, 20), Ui.dp(this, 18), Ui.dp(this, 20), Ui.dp(this, 18));
        list = Ui.vertical(this);
        content.addView(list);
        root.addView(Ui.scroll(this, content), new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        LinearLayout actions = Ui.horizontal(this);
        actions.setBackgroundColor(android.graphics.Color.WHITE);
        actions.setPadding(Ui.dp(this, 20), Ui.dp(this, 10), Ui.dp(this, 20), Ui.dp(this, 24));
        TextView add = Ui.button(this, "Add");
        add.setOnClickListener(v -> open(AddExerciseActivity.class));
        TextView start = Ui.button(this, "START");
        start.setBackground(Ui.strokeBg(android.graphics.Color.WHITE, Palette.BLUE, 2, 34, this));
        start.setTextColor(Palette.BLUE);
        start.setOnClickListener(v -> {
            if (steps.isEmpty()) {
                toast("Add an exercise first.");
                return;
            }
            requireSignIn(() -> startActivity(WorkoutActivity.forMyTraining(this)));
        });
        actions.addView(start, Ui.mlp(this, 0, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 12, 0));
        ((LinearLayout.LayoutParams) start.getLayoutParams()).weight = 1;
        actions.addView(add, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        root.addView(actions);
        setContentView(root);
    }

    @Override
    protected void onResume() {
        super.onResume();
        steps = store.load();
        render();
    }

    private void render() {
        list.removeAllViews();
        LinearLayout heading = Ui.horizontal(this);
        heading.addView(Ui.heading(this, "Exercises", 24, Palette.TEXT));
        heading.addView(Ui.text(this, "  (" + steps.size() + ")", 18, Palette.MUTED, Typeface.NORMAL));
        list.addView(heading, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 14));
        if (steps.isEmpty()) {
            TextView empty = Ui.text(this, "No exercises yet. Tap Add to build your own stretch list.", 17, Palette.MUTED, Typeface.NORMAL);
            empty.setGravity(Gravity.CENTER);
            list.addView(empty, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 40, 0, 0));
            return;
        }
        for (int i = 0; i < steps.size(); i++) {
            list.addView(row(i));
        }
    }

    private LinearLayout row(int position) {
        WorkoutStep step = steps.get(position);
        LinearLayout row = Ui.horizontal(this);
        row.setPadding(0, Ui.dp(this, 10), 0, Ui.dp(this, 10));

        // Up/down reorder (the design's drag handle).
        LinearLayout order = Ui.vertical(this);
        TextView up = Ui.text(this, "▲", 16, position == 0 ? Palette.DIVIDER : Palette.MUTED, Typeface.NORMAL);
        TextView down = Ui.text(this, "▼", 16, position == steps.size() - 1 ? Palette.DIVIDER : Palette.MUTED, Typeface.NORMAL);
        up.setOnClickListener(v -> move(position, -1));
        down.setOnClickListener(v -> move(position, 1));
        order.addView(up);
        order.addView(down, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 0));
        row.addView(order, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 4, 0, 16, 0));

        row.addView(Ui.imagePanel(this, Palette.SOFT_BLUE, "🤸"), Ui.mlp(this, Ui.dp(this, 76), Ui.dp(this, 76), 0, 0, 16, 0));
        LinearLayout text = Ui.vertical(this);
        text.addView(Ui.text(this, step.name.toUpperCase(Locale.US), 18, Palette.TEXT, Typeface.NORMAL));
        text.addView(Ui.heading(this, clock(step.durationSeconds), 18, Palette.BLUE),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 0));
        row.addView(text, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView delete = Ui.text(this, "🗑", 22, Palette.MUTED, Typeface.NORMAL);
        delete.setPadding(Ui.dp(this, 12), Ui.dp(this, 8), 0, Ui.dp(this, 8));
        delete.setOnClickListener(v -> {
            steps.remove(position);
            store.save(steps);
            render();
        });
        row.addView(delete);
        return row;
    }

    private void move(int position, int delta) {
        int target = position + delta;
        if (target < 0 || target >= steps.size()) {
            return;
        }
        WorkoutStep step = steps.remove(position);
        steps.add(target, step);
        store.save(steps);
        render();
    }

    static String clock(int seconds) {
        return String.format(Locale.US, "%02d:%02d", seconds / 60, seconds % 60);
    }
}

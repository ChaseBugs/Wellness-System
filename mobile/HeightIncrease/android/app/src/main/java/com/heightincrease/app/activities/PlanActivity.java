package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.app.AlertDialog;
import android.os.Bundle;
import android.widget.NumberPicker;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.Goal;
import com.heightincrease.app.model.PlanCard;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.PlanViewModel;

public class PlanActivity extends BaseActivity {
    private PlanViewModel viewModel;
    private LinearLayout content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new PlanViewModel(repository, remote);

        content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 54), Ui.dp(this, 18), Ui.dp(this, 24));
        content.setBackgroundColor(Palette.BG);
        setTabPage(BottomNav.PLAN, Ui.scroll(this, content));
        render();
        viewModel.load(this::refresh);
    }

    private boolean firstResume = true;

    @Override
    protected void onResume() {
        super.onResume();
        // After a workout, a goal change or signing in, reload the week.
        if (!firstResume) {
            viewModel.loadProgress(this::refresh);
            render();
        }
        firstResume = false;
    }

    private void refresh() {
        if (alive()) {
            render();
        }
    }

    private void render() {
        content.removeAllViews();
        LinearLayout header = Ui.horizontal(this);
        TextView title = Ui.title(this, "Increase Height Workout");
        title.setTextSize(23);
        title.setSingleLine(true);
        header.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView fire = Ui.text(this, "🔥", 30, Palette.TEXT, Typeface.NORMAL);
        TextView idea = Ui.text(this, "💡", 30, Palette.TEXT, Typeface.NORMAL);
        fire.setOnClickListener(v -> toast(remote.isSignedIn()
                ? viewModel.streakDays() + (viewModel.streakDays() == 1 ? " day" : " days") + " in a row. Keep it going!"
                : "Sign in to track your streak."));
        idea.setOnClickListener(v -> open(QaActivity.class));
        header.addView(fire, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 6, 0, 10, 0));
        header.addView(idea);
        content.addView(header);

        content.addView(messageCard());
        content.addView(goalCard());
        if (viewModel.noPublishedPlans()) {
            String message = viewModel.isLoading() ? "Loading training plans..."
                    : viewModel.getError() != null ? viewModel.getError() : "No training plans are published yet.";
            TextView status = Ui.text(this, message, 18, Palette.MUTED, Typeface.NORMAL);
            status.setGravity(Gravity.CENTER);
            content.addView(status, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 18));
        }
        for (PlanCard card : viewModel.getState()) {
            content.addView(planCard(card));
        }
        content.addView(moreSection());
    }

    /** "More" (design: 03_main_ui_02): nutrition tips and the sleep tracker. */
    private LinearLayout moreSection() {
        LinearLayout section = Ui.vertical(this);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.heading(this, "More", 26, Palette.TEXT), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView all = Ui.text(this, "All  ›", 18, Palette.BLUE, Typeface.NORMAL);
        all.setOnClickListener(v -> finishOpen(DiscoverActivity.class));
        header.addView(all);
        section.addView(header, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 8, 18, 8, 12));
        LinearLayout row = Ui.horizontal(this);
        LinearLayout nutrition = moreCard("Nutrition", "Suggestions for you", "🥗");
        nutrition.setOnClickListener(v -> finishOpen(DiscoverActivity.class));
        LinearLayout sleep = moreCard("Sleep tracker", "Adequate sleep helps recovery", "🌙");
        sleep.setOnClickListener(v -> open(SleepActivity.class));
        row.addView(nutrition, Ui.mlp(this, 0, Ui.dp(this, 210), 0, 0, 8, 0));
        ((LinearLayout.LayoutParams) nutrition.getLayoutParams()).weight = 1;
        row.addView(sleep, Ui.mlp(this, 0, Ui.dp(this, 210), 8, 0, 0, 0));
        ((LinearLayout.LayoutParams) sleep.getLayoutParams()).weight = 1;
        section.addView(row);
        return section;
    }

    private LinearLayout moreCard(String title, String subtitle, String glyph) {
        LinearLayout card = Ui.card(this, 24);
        card.addView(Ui.heading(this, title, 22, Palette.TEXT));
        card.addView(Ui.text(this, subtitle, 15, Palette.MUTED, Typeface.NORMAL),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 0));
        TextView icon = Ui.text(this, glyph, 54, Palette.TEXT, Typeface.NORMAL);
        icon.setGravity(Gravity.RIGHT | Gravity.BOTTOM);
        card.addView(icon, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        return card;
    }

    /** Weekly workout goal: 1-7 days, stored as a "workout" goal on the account. */
    private void editGoal() {
        NumberPicker picker = new NumberPicker(this);
        picker.setMinValue(1);
        picker.setMaxValue(7);
        Goal goal = viewModel.goal();
        picker.setValue(goal == null ? 3 : goal.daysPerWeek);
        picker.setDisplayedValues(new String[]{"1 day", "2 days", "3 days", "4 days", "5 days", "6 days", "7 days"});
        new AlertDialog.Builder(this)
                .setTitle("Workout days per week")
                .setView(picker)
                .setNegativeButton("CANCEL", null)
                .setPositiveButton("SAVE", (dialog, which) -> viewModel.saveGoal(picker.getValue(), new RemoteRepository.Callback<Goal>() {
                    @Override
                    public void onSuccess(Goal value) {
                        if (alive()) {
                            toast("Weekly goal saved.");
                            render();
                        }
                    }

                    @Override
                    public void onError(String message) {
                        if (alive()) {
                            toast(message);
                        }
                    }
                }))
                .show();
    }

    private LinearLayout messageCard() {
        LinearLayout card = Ui.card(this, 28);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        TextView icon = Ui.text(this, "😉", 42, Palette.TEXT, Typeface.NORMAL);
        card.addView(icon, Ui.mlp(this, Ui.dp(this, 62), Ui.dp(this, 62), 0, 0, 16, 0));
        TextView message = Ui.text(this, "Small daily sessions build posture and flexibility - hit 'start' when you're ready!", 19,
                Palette.TEXT, Typeface.NORMAL);
        card.addView(message, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 22, 0, 14));
        return card;
    }

    private LinearLayout goalCard() {
        LinearLayout card = Ui.card(this, 24);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(Ui.imagePanel(this, Palette.SOFT_BLUE, "⛰"), Ui.mlp(this, Ui.dp(this, 86), Ui.dp(this, 86), 0, 0, 18, 0));
        Goal goal = viewModel.goal();
        LinearLayout copy = Ui.vertical(this);
        copy.addView(Ui.heading(this, goal == null ? "Set weekly goal for your height" : "Weekly goal: " + goal.daysPerWeek
                + (goal.daysPerWeek == 1 ? " day" : " days"), 19, Palette.TEXT));
        if (goal != null) {
            copy.addView(Ui.text(this, "This week: " + viewModel.weekWorkouts() + " / " + goal.daysPerWeek + " days", 15, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 0));
        }
        card.addView(copy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView plus = Ui.icon(this, goal == null ? "+" : "✎", 54, Palette.BLUE, goal == null ? 32 : 24);
        plus.setTextColor(android.graphics.Color.WHITE);
        card.addView(plus);
        card.setOnClickListener(v -> requireSignIn(this::editGoal));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 10, 0, 16));
        return card;
    }

    private FrameLayout planCard(PlanCard item) {
        FrameLayout frame = new FrameLayout(this);
        frame.setBackground(Ui.bg(item.primary ? Palette.BLUE : android.graphics.Color.WHITE, 24, this));
        frame.setPadding(Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18));

        // Design: the primary plan has progress and a white action pill; the others show an icon and a title.
        boolean myTraining = "ADD".equals(item.action);
        LinearLayout text = Ui.vertical(this);
        TextView icon = Ui.icon(this, myTraining ? "+" : "💡", 48, item.primary ? android.graphics.Color.WHITE : Palette.BLUE, 22);
        icon.setTextColor(android.graphics.Color.WHITE);
        text.addView(icon, new LinearLayout.LayoutParams(Ui.dp(this, 48), Ui.dp(this, 48)));
        TextView title = Ui.heading(this, item.title, 30, item.primary ? android.graphics.Color.WHITE : Palette.TEXT);
        text.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 18, 0, 0));
        if (item.primary) {
            int progress = viewModel.weekProgress();
            text.addView(Ui.progress(this, progress), Ui.mlp(this, Ui.dp(this, 210), Ui.dp(this, 10), 0, 30, 0, 0));
            LinearLayout meta = Ui.horizontal(this);
            meta.addView(Ui.text(this, item.subtitle, 17, android.graphics.Color.WHITE, Typeface.NORMAL),
                    new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            meta.addView(Ui.text(this, progress + ".0%", 17, android.graphics.Color.WHITE, Typeface.NORMAL));
            text.addView(meta, Ui.mlp(this, Ui.dp(this, 210), ViewGroup.LayoutParams.WRAP_CONTENT, 0, 14, 0, 0));
            TextView action = Ui.heading(this, item.action, 26, Palette.BLUE_DARK);
            action.setGravity(Gravity.CENTER);
            action.setBackground(Ui.bg(android.graphics.Color.WHITE, 30, this));
            text.addView(action, Ui.mlp(this, Ui.dp(this, 210), Ui.dp(this, 60), 0, 18, 0, 0));
        }
        if (myTraining) {
            frame.setOnClickListener(v -> open(MyTrainingActivity.class));
        } else {
            frame.setOnClickListener(v -> requireSignIn(() -> startActivity(WorkoutActivity.forPlan(this, item.id))));
        }

        frame.addView(text);
        TextView visual = Ui.text(this, item.primary ? "↑" : "↗", 96,
                item.primary ? android.graphics.Color.argb(120, 255, 255, 255) : Palette.SOFT_BLUE, Typeface.BOLD);
        visual.setGravity(Gravity.RIGHT | Gravity.BOTTOM);
        frame.addView(visual, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        frame.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                item.primary ? Ui.dp(this, 300) : Ui.dp(this, 160), 0, 0, 0, 16));
        return frame;
    }
}

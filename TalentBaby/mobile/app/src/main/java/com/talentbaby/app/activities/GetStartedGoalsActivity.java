package com.talentbaby.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.talentbaby.app.GlobalData;
import com.talentbaby.app.R;

import java.util.HashSet;
import java.util.Set;

public class GetStartedGoalsActivity extends GlobalActivity {

    private final Set<Integer> selectedGoals = new HashSet<>();

    private static final int[] GOAL_IDS = {
            R.id.goalActivities, R.id.goalMilestones, R.id.goalStories,
            R.id.goalNutrition, R.id.goalSleep
    };
    private static final int[] ICON_IDS = {
            R.id.iconGoal1, R.id.iconGoal2, R.id.iconGoal3, R.id.iconGoal4, R.id.iconGoal5
    };
    private static final int[] TEXT_IDS = {
            R.id.textGoal1, R.id.textGoal2, R.id.textGoal3, R.id.textGoal4, R.id.textGoal5
    };
    private static final String[] GOAL_KEYS = {
            "activities", "milestones", "stories", "nutrition", "sleep_feeding"
    };

    private TextView buttonContinue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_get_started_goals);

        buttonContinue = findViewById(R.id.btnContinue);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        for (int i = 0; i < GOAL_IDS.length; i++) {
            final int index = i;
            findViewById(GOAL_IDS[i]).setOnClickListener(v -> toggleGoal(index));
        }

        buttonContinue.setOnClickListener(v -> {
            if (selectedGoals.isEmpty()) return;
            startActivity(new Intent(this, GetStartedAuthActivity.class));
        });

        updateContinueState();
    }

    private void toggleGoal(int index) {
        boolean selected;
        if (selectedGoals.contains(index)) {
            selectedGoals.remove(index);
            selected = false;
        } else {
            selectedGoals.add(index);
            selected = true;
        }

        GlobalData.setParentingGoal(GOAL_KEYS[index], selected);
        updateGoalView(index, selected);
        updateContinueState();
    }

    private void updateGoalView(int index, boolean selected) {
        LinearLayout goalView = findViewById(GOAL_IDS[index]);
        ImageView iconView = findViewById(ICON_IDS[index]);
        TextView textView = findViewById(TEXT_IDS[index]);
        int color = getColor(selected ? R.color.article_header : R.color.design_gray);

        goalView.setBackgroundResource(selected ? R.drawable.bg_goal_selected : R.drawable.bg_goal_unselected);
        iconView.setColorFilter(color);
        textView.setTextColor(color);
    }

    private void updateContinueState() {
        boolean ready = !selectedGoals.isEmpty();
        buttonContinue.setEnabled(ready);
        buttonContinue.setBackgroundResource(ready ? R.drawable.bg_teal_button_large : R.drawable.bg_disabled_pill);
        buttonContinue.setTextColor(getColor(ready ? android.R.color.white : R.color.design_gray));
    }
}

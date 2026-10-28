package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.OnboardingProfile;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.OnboardingViewModel;

public class OnboardingActivity extends BaseActivity {
    private final OnboardingViewModel viewModel = new OnboardingViewModel();
    private LinearLayout root;
    private LinearLayout body;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        render();
    }

    private void render() {
        root = page(android.graphics.Color.WHITE);
        root.setPadding(Ui.dp(this, 22), Ui.dp(this, 56), Ui.dp(this, 22), Ui.dp(this, 24));

        LinearLayout top = Ui.horizontal(this);
        TextView back = Ui.text(this, "‹", 42, android.graphics.Color.LTGRAY, Typeface.NORMAL);
        back.setGravity(Gravity.CENTER);
        back.setOnClickListener(v -> {
            if (viewModel.getStep() == 0) {
                finish();
            } else {
                viewModel.previous();
                render();
            }
        });
        top.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 46), Ui.dp(this, 46)));
        root.addView(top);

        body = Ui.vertical(this);
        body.setGravity(Gravity.CENTER_HORIZONTAL);
        root.addView(body, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        renderStep();
        TextView next = Ui.button(this, viewModel.getStep() == 3 ? "LET'S GO" : "NEXT");
        next.setOnClickListener(v -> {
            if (viewModel.next()) {
                finishOpen(PlanActivity.class);
            } else {
                render();
            }
        });
        root.addView(next, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 26, 0, 26, 6));
        setContentView(root);
    }

    private void renderStep() {
        int step = viewModel.getStep();
        OnboardingProfile profile = viewModel.getState();
        String title = step == 0 ? "What's your gender? 🙌" :
                step == 1 ? "How old are you? 🎂" :
                        step == 2 ? "How tall are you? 📏" : "Choose workout time ⏱";
        TextView titleView = Ui.title(this, title);
        titleView.setTextSize(33);
        body.addView(titleView, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 14, 0, 0));

        TextView subtitle = Ui.text(this, "To personalize your plan", 20, android.graphics.Color.DKGRAY, Typeface.NORMAL);
        body.addView(subtitle, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 6, 0, 0));

        body.addView(Ui.spacer(this, step == 0 ? 180 : 240));
        if (step == 0) {
            genderPicker(profile);
        } else {
            numberPicker(profile);
        }
    }

    private void genderPicker(OnboardingProfile profile) {
        LinearLayout row = Ui.horizontal(this);
        row.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams left = Ui.mlp(this, 0, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 22, 0);
        left.weight = 1;
        LinearLayout.LayoutParams right = Ui.mlp(this, 0, ViewGroup.LayoutParams.WRAP_CONTENT, 22, 0, 0, 0);
        right.weight = 1;
        row.addView(gender("♀", "Female", profile.gender.equals("Female")), left);
        row.addView(gender("♂", "Male", profile.gender.equals("Male")), right);
        body.addView(row, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
    }

    private View gender(String icon, String label, boolean selected) {
        LinearLayout item = Ui.vertical(this);
        item.setGravity(Gravity.CENTER);
        TextView circle = Ui.icon(this, icon, 128, selected ? Palette.SOFT_BLUE : android.graphics.Color.rgb(255, 224, 238), 64);
        circle.setTextColor(android.graphics.Color.WHITE);
        TextView text = Ui.text(this, label, 22, selected ? Palette.BLUE : Palette.MUTED, Typeface.NORMAL);
        text.setGravity(Gravity.CENTER);
        item.addView(circle);
        item.addView(text, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 18, 0, 0));
        item.setOnClickListener(v -> {
            viewModel.setGender(label);
            render();
        });
        return item;
    }

    private void numberPicker(OnboardingProfile profile) {
        int value = viewModel.getStep() == 1 ? profile.age : viewModel.getStep() == 2 ? profile.heightCm : profile.minutes;
        String suffix = viewModel.getStep() == 2 ? " cm" : viewModel.getStep() == 3 ? " min" : "";
        LinearLayout picker = Ui.vertical(this);
        picker.setGravity(Gravity.CENTER);
        TextView up = Ui.text(this, "+", 40, Palette.BLUE, Typeface.BOLD);
        up.setGravity(Gravity.CENTER);
        TextView valueView = Ui.text(this, value + suffix, 52, Palette.BLUE, Typeface.BOLD);
        valueView.setGravity(Gravity.CENTER);
        TextView down = Ui.text(this, "−", 44, Palette.MUTED, Typeface.BOLD);
        down.setGravity(Gravity.CENTER);
        up.setOnClickListener(v -> {
            viewModel.increase();
            render();
        });
        down.setOnClickListener(v -> {
            viewModel.decrease();
            render();
        });
        picker.addView(up, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 64)));
        picker.addView(Ui.divider(this), Ui.mlp(this, Ui.dp(this, 240), Ui.dp(this, 1), 0, 0, 0, 0));
        picker.addView(valueView, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 84)));
        picker.addView(Ui.divider(this), Ui.mlp(this, Ui.dp(this, 240), Ui.dp(this, 1), 0, 0, 0, 0));
        picker.addView(down, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 64)));
        body.addView(picker, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
    }
}

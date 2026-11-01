package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

public class SplashActivity extends BaseActivity {
    private boolean navigated;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Palette.BLUE);

        LinearLayout root = page(Palette.BLUE);
        root.setGravity(Gravity.CENTER);
        root.setPadding(Ui.dp(this, 26), Ui.dp(this, 40), Ui.dp(this, 26), Ui.dp(this, 24));

        TextView logo = Ui.text(this, "HE↑GHT\nINCREASE", 52, android.graphics.Color.WHITE, Typeface.BOLD);
        logo.setGravity(Gravity.CENTER);
        logo.setLineSpacing(0, 0.9f);
        root.addView(logo, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView subtitle = Ui.text(this, "Your taller future is loading - hit 'start' to boost your height!", 19,
                android.graphics.Color.WHITE, Typeface.ITALIC);
        subtitle.setGravity(Gravity.CENTER);
        subtitle.setPadding(0, Ui.dp(this, 18), 0, Ui.dp(this, 40));
        root.addView(subtitle);

        TextView illustration = Ui.text(this, "↕", 96, android.graphics.Color.WHITE, Typeface.BOLD);
        illustration.setGravity(Gravity.CENTER);
        root.addView(illustration, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        TextView start = Ui.button(this, "START");
        start.setBackground(Ui.bg(android.graphics.Color.WHITE, 34, this));
        start.setTextColor(Palette.TEXT);
        start.setOnClickListener(v -> goNext());
        root.addView(start, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 8, 0, 8, 22));

        setContentView(root);
        new Handler(Looper.getMainLooper()).postDelayed(this::goNext, 1200);
    }

    private void goNext() {
        if (navigated) {
            return;
        }
        navigated = true;
        finishOpen(OnboardingActivity.class);
    }
}

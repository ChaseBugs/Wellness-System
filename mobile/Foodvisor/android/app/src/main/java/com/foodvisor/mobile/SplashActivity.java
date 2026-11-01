package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class SplashActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.NAVY, false);

        LinearLayout root = Ui.screen(this, Ui.NAVY);
        root.setGravity(Gravity.CENTER);
        root.setPadding(Ui.dp(this, 32), 0, Ui.dp(this, 32), Ui.dp(this, 48));

        LinearLayout center = Ui.v(this);
        center.setGravity(Gravity.CENTER);

        Ui.AvoMascotView avo = new Ui.AvoMascotView(this, 0);
        center.addView(avo, new LinearLayout.LayoutParams(Ui.dp(this, 110), Ui.dp(this, 130)));

        TextView name = Ui.text(this, "Foodvisor", 42, Ui.PAPER, Typeface.BOLD);
        name.setGravity(Gravity.CENTER);
        name.setIncludeFontPadding(false);
        center.addView(name, Ui.lpm(this, -1, -2, 0, 18, 0, 0));

        TextView sub = Ui.text(this, "Your personal nutrition coach", 14, Ui.SLATE, Typeface.NORMAL);
        sub.setGravity(Gravity.CENTER);
        center.addView(sub, Ui.lpm(this, -1, -2, 0, 10, 0, 0));

        root.addView(center, new LinearLayout.LayoutParams(-1, 0, 1));

        new Handler().postDelayed(() -> {
            // TODO: check SharedPreferences for onboarding completion; route to TodayActivity if done
            Ui.go(this, OnboardingActivity.class);
            finish();
        }, 1800);

        setContentView(root);
    }
}

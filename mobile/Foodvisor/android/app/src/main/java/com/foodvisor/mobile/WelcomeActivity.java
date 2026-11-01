package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class WelcomeActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);

        LinearLayout root = Ui.screen(this, Ui.PAPER);
        root.setPadding(Ui.dp(this, 22), Ui.dp(this, 24), Ui.dp(this, 22), Ui.dp(this, 24));

        TextView skip = Ui.cap(this, "Skip");
        skip.setGravity(Gravity.RIGHT);
        skip.setOnClickListener(view -> Ui.go(this, TodayActivity.class));
        root.addView(skip, new LinearLayout.LayoutParams(-1, Ui.dp(this, 34)));

        Ui.WelcomeDialView dial = new Ui.WelcomeDialView(this);
        root.addView(dial, Ui.lpm(this, -1, Ui.dp(this, 228), 0, 12, 0, 0));

        TextView overline = Ui.cap(this, "For people who like numbers");
        overline.setGravity(Gravity.CENTER);
        root.addView(overline, Ui.lpm(this, -1, -2, 0, 10, 0, 0));

        TextView title = Ui.title(this, "A nutrition almanac\nfor everyday eating.", 35);
        title.setGravity(Gravity.CENTER);
        root.addView(title, Ui.lpm(this, -1, -2, 0, 10, 0, 0));

        TextView body = Ui.text(this, "Track every meal, scan barcodes, snap photos. Caroli's engine handles the math.", 14, Ui.INK_3, Typeface.NORMAL);
        body.setGravity(Gravity.CENTER);
        body.setLineSpacing(Ui.dp(this, 3), 1.0f);
        root.addView(body, Ui.lpm(this, -1, -2, 0, 12, 0, 0));

        LinearLayout dots = Ui.h(this);
        dots.setGravity(Gravity.CENTER);
        for (int i = 0; i < 4; i++) {
            TextView dot = Ui.text(this, i == 0 ? "----" : "-", 16, i == 0 ? Ui.INK : Ui.INK_4, Typeface.BOLD);
            dot.setGravity(Gravity.CENTER);
            dots.addView(dot, Ui.lpm(this, -2, -2, 3, 0, 3, 0));
        }
        root.addView(dots, Ui.lpm(this, -1, -2, 0, 16, 0, 0));

        root.addView(Ui.spacer(this, 1), new LinearLayout.LayoutParams(-1, 0, 1));

        TextView start = Ui.button(this, "Get started  >");
        start.setOnClickListener(view -> Ui.go(this, SignInActivity.class));
        root.addView(start, new LinearLayout.LayoutParams(-1, Ui.dp(this, 52)));

        TextView signin = Ui.text(this, "Have an account? Sign in", 12, Ui.INK_3, Typeface.BOLD);
        signin.setGravity(Gravity.CENTER);
        signin.setOnClickListener(view -> Ui.go(this, SignInActivity.class));
        root.addView(signin, Ui.lpm(this, -1, -2, 0, 14, 0, 0));

        setContentView(root);
    }
}

package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class SignInActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);

        LinearLayout root = Ui.screen(this, Ui.PAPER);
        root.setPadding(Ui.dp(this, 22), Ui.dp(this, 24), Ui.dp(this, 22), Ui.dp(this, 20));

        LinearLayout top = Ui.h(this);
        TextView back = Ui.iconButton(this, "<", false);
        back.setOnClickListener(view -> finish());
        top.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 34), Ui.dp(this, 34)));
        TextView cap = Ui.cap(this, "Create account");
        cap.setGravity(Gravity.CENTER);
        top.addView(cap, new LinearLayout.LayoutParams(0, -1, 1));
        top.addView(Ui.spacer(this, 34), new LinearLayout.LayoutParams(Ui.dp(this, 34), 1));
        root.addView(top);

        TextView title = Ui.title(this, "Open your\nalmanac.", 34);
        root.addView(title, Ui.lpm(this, -1, -2, 0, 30, 0, 0));

        TextView body = Ui.text(this, "We'll keep your food log, weight history, and goals in sync across your devices.", 13, Ui.INK_3, Typeface.NORMAL);
        body.setLineSpacing(Ui.dp(this, 3), 1.0f);
        root.addView(body, Ui.lpm(this, -1, -2, 0, 8, 0, 0));

        String[] providers = {"Continue with Facebook", "Continue with Google", "Continue with Apple"};
        for (int i = 0; i < providers.length; i++) {
            TextView button = i == 0 ? Ui.button(this, providers[i]) : Ui.ghostButton(this, providers[i]);
            if (i == 0) {
                button.setBackground(Ui.round(Ui.INK, Ui.dp(this, 12), 0, Ui.INK));
            }
            root.addView(button, Ui.lpm(this, -1, Ui.dp(this, 48), 0, i == 0 ? 24 : 10, 0, 0));
        }

        TextView divider = Ui.cap(this, "Or email");
        divider.setGravity(Gravity.CENTER);
        root.addView(divider, Ui.lpm(this, -1, -2, 0, 22, 0, 14));

        root.addView(field("Email", "maya.singh@hey.com"), Ui.lpm(this, -1, Ui.dp(this, 64), 0, 0, 0, 8));
        root.addView(field("Password", "**********"), Ui.lpm(this, -1, Ui.dp(this, 64), 0, 0, 0, 0));

        TextView create = Ui.button(this, "Create account  >");
        create.setOnClickListener(view -> Ui.go(this, GoalSetupActivity.class));
        root.addView(create, Ui.lpm(this, -1, Ui.dp(this, 52), 0, 18, 0, 0));

        root.addView(Ui.spacer(this, 1), new LinearLayout.LayoutParams(-1, 0, 1));

        TextView terms = Ui.cap(this, "By continuing you agree to the terms - privacy policy");
        terms.setGravity(Gravity.CENTER);
        terms.setTextColor(Ui.INK_4);
        root.addView(terms);

        setContentView(root);
    }

    private LinearLayout field(String label, String value) {
        LinearLayout field = Ui.v(this);
        field.setPadding(Ui.dp(this, 14), Ui.dp(this, 8), Ui.dp(this, 14), Ui.dp(this, 8));
        field.setBackground(Ui.round(Ui.CARD, Ui.dp(this, 12), Ui.dp(this, 1), Ui.RULE_SOFT));
        field.addView(Ui.cap(this, label));
        TextView valueView = Ui.text(this, value, 15, Ui.INK, Typeface.NORMAL);
        field.addView(valueView, Ui.lpm(this, -1, -2, 0, 4, 0, 0));
        return field;
    }
}

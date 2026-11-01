package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class BasicProfileActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 22), Ui.dp(this, 26), Ui.dp(this, 22), Ui.dp(this, 24));

        content.addView(Ui.cap(this, "Step 03 of 06"));
        content.addView(progress(0.50f), Ui.lpm(this, -1, Ui.dp(this, 3), 0, 8, 0, 0));
        content.addView(Ui.title(this, "The baseline.", 34), Ui.lpm(this, -1, -2, 0, 26, 0, 0));
        content.addView(Ui.text(this, "Used once to calculate BMR, TDEE, and macros. Edit any time from Settings.", 13, Ui.INK_3, Typeface.NORMAL));

        content.addView(Ui.cap(this, "Sex at birth"), Ui.lpm(this, -1, -2, 0, 24, 0, 8));
        LinearLayout sex = Ui.h(this);
        sex.addView(segment("Male", false), Ui.weight(this, Ui.dp(this, 48), 1, 0, 0, 5, 0));
        sex.addView(segment("Female", true), Ui.weight(this, Ui.dp(this, 48), 1, 5, 0, 0, 0));
        content.addView(sex);

        content.addView(metric("Age", "28", "YEARS"), Ui.lpm(this, -1, Ui.dp(this, 76), 0, 18, 0, 0));
        content.addView(scale(), Ui.lpm(this, -1, Ui.dp(this, 32), 0, 8, 0, 0));

        LinearLayout split = Ui.h(this);
        split.addView(metric("Height", "172", "CM"), Ui.weight(this, Ui.dp(this, 84), 1, 0, 20, 5, 0));
        split.addView(metric("Weight", "73.4", "KG"), Ui.weight(this, Ui.dp(this, 84), 1, 5, 20, 0, 0));
        content.addView(split);

        content.addView(Ui.cap(this, "Units"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        content.addView(Ui.chipStrip(this, new String[]{"Metric - kg / cm", "Imperial - lb / ft"}, 0));

        TextView next = Ui.button(this, "Continue  >");
        next.setOnClickListener(view -> Ui.go(this, PermissionsActivity.class));
        content.addView(next, Ui.lpm(this, -1, Ui.dp(this, 52), 0, 30, 0, 0));

        setContentView(Ui.scroll(this, content));
    }

    private TextView segment(String text, boolean active) {
        TextView view = Ui.text(this, text, 14, active ? Ui.PAPER : Ui.INK, active ? Typeface.BOLD : Typeface.NORMAL);
        view.setGravity(Gravity.CENTER);
        view.setBackground(Ui.round(active ? Ui.INK : Ui.CARD, Ui.dp(this, 10), active ? 0 : Ui.dp(this, 1), Ui.RULE_SOFT));
        return view;
    }

    private LinearLayout metric(String label, String value, String unit) {
        LinearLayout card = Ui.card(this);
        card.addView(Ui.cap(this, label));
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.BOTTOM);
        row.addView(Ui.number(this, value, 34, Ui.INK), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(Ui.cap(this, unit));
        card.addView(row, Ui.lpm(this, -1, -2, 0, 6, 0, 0));
        return card;
    }

    private android.view.View progress(float pct) {
        LinearLayout outer = Ui.h(this);
        outer.setBackground(Ui.round(Ui.PAPER_DEEP, Ui.dp(this, 2), 0, Ui.PAPER_DEEP));
        android.view.View inner = new android.view.View(this);
        inner.setBackgroundColor(Ui.ACCENT);
        outer.addView(inner, new LinearLayout.LayoutParams(0, -1, pct));
        outer.addView(new android.view.View(this), new LinearLayout.LayoutParams(0, -1, 1 - pct));
        return outer;
    }

    private android.view.View scale() {
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL);
        for (int i = 0; i < 40; i++) {
            android.view.View tick = new android.view.View(this);
            tick.setBackgroundColor(i == 18 ? Ui.ACCENT : Ui.INK_4);
            row.addView(tick, Ui.lpm(this, Ui.dp(this, i == 18 ? 2 : 1), i == 18 ? 26 : (i % 5 == 0 ? 18 : 10), 3, 0, 3, 0));
        }
        return row;
    }
}

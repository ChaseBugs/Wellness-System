package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class OnboardingActivity extends Activity {

    private static final int[][] PAGES = {
            // {bgColor-idx, foodVariant, titleRes}
            {0}, {1}, {2}
    };
    private static final int[] BG = {
            Color.rgb(255, 255, 255),   // page 0: white
            Color.rgb(255, 236, 232),   // page 1: blush
            Color.rgb(210, 237, 228),   // page 2: mint
    };
    private static final String[] HEADLINES = {
            "Congrats\non taking\nthe first step!",
            "When it comes to nutrition, finding what works for you makes all the difference.",
            "There is no\n1-size-fits-all\ndiet.",
    };
    private static final String[] SUBTITLES = {
            "",
            "",
            "Foodvisor finds what works for you to reach your personal goals.",
    };

    private int page = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        show(0);
    }

    @Override
    public void onBackPressed() {
        if (page > 0) { show(page - 1); } else { super.onBackPressed(); }
    }

    private void show(int next) {
        page = next;
        Ui.styleBars(this, BG[page], page < 2);

        LinearLayout root = Ui.screen(this, BG[page]);
        root.setPadding(Ui.dp(this, 24), Ui.dp(this, 24), Ui.dp(this, 24), Ui.dp(this, 28));

        // Illustration card
        Ui.OnboardFoodView art = new Ui.OnboardFoodView(this, page);
        root.addView(art, Ui.lpm(this, -1, 0, 0, 0, 0, 0));
        ((LinearLayout.LayoutParams) art.getLayoutParams()).weight = 1f;

        // Headline
        TextView headline = Ui.text(this, HEADLINES[page], 28, Ui.NAVY, Typeface.BOLD);
        headline.setLineSpacing(Ui.dp(this, 3), 1f);
        headline.setGravity(page == 0 ? Gravity.CENTER : Gravity.START);
        root.addView(headline, Ui.lpm(this, -1, -2, 0, 24, 0, 0));

        if (!SUBTITLES[page].isEmpty()) {
            TextView sub = Ui.text(this, SUBTITLES[page], 14, Ui.SLATE, Typeface.NORMAL);
            sub.setLineSpacing(Ui.dp(this, 3), 1f);
            root.addView(sub, Ui.lpm(this, -1, -2, 0, 12, 0, 0));
        }

        // Spacer
        root.addView(Ui.spacer(this, 1), new LinearLayout.LayoutParams(-1, 0, page == 0 ? 2f : 0.5f));

        // Page dots
        root.addView(dots(page), Ui.lpm(this, -2, Ui.dp(this, 10), 0, 0, 0, 20));

        // Nav row: back circle + Next/Get Started button
        LinearLayout nav = Ui.h(this);
        nav.setGravity(Gravity.CENTER_VERTICAL);

        if (page > 0) {
            TextView back = Ui.backCircle(this);
            back.setOnClickListener(v -> show(page - 1));
            nav.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 52), Ui.dp(this, 52)));
            nav.addView(Ui.spacer(this, 1), Ui.weight(this, -1, 1, 12, 0, 0, 0));
        } else {
            nav.addView(Ui.spacer(this, 1), new LinearLayout.LayoutParams(0, 1, 1));
        }

        String btnLabel = page == HEADLINES.length - 1 ? "Get Started" : "Next";
        TextView btn = Ui.bigButton(this, btnLabel);
        btn.setOnClickListener(v -> {
            if (page < HEADLINES.length - 1) {
                show(page + 1);
            } else {
                Ui.go(this, GoalSetupActivity.class);
                finish();
            }
        });
        int btnW = page > 0 ? Ui.dp(this, 200) : -1;
        nav.addView(btn, new LinearLayout.LayoutParams(btnW, Ui.dp(this, 56)));

        root.addView(nav, new LinearLayout.LayoutParams(-1, Ui.dp(this, 56)));
        setContentView(root);
    }

    private LinearLayout dots(int active) {
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.CENTER);
        for (int i = 0; i < HEADLINES.length; i++) {
            View dot = new View(this);
            boolean on = i == active;
            int w = on ? Ui.dp(this, 20) : Ui.dp(this, 8);
            dot.setBackground(Ui.round(on ? Ui.NAVY : Ui.RULE2, Ui.dp(this, 4), 0, Ui.NAVY));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(w, Ui.dp(this, 8));
            if (i > 0) lp.leftMargin = Ui.dp(this, 6);
            row.addView(dot, lp);
        }
        return row;
    }
}

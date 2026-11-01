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

public class TodayActivity extends Activity {

    private static final int[] CARD_BG = {
            Color.rgb(210, 237, 228),   // mint
            Color.rgb(210, 237, 228),
            Color.rgb(210, 237, 228),
            Color.rgb(225, 240, 255),   // soft blue
            Color.rgb(255, 240, 228),   // peach
            Color.rgb(210, 237, 228),
    };
    private static final int[] AVO_MOOD = {0, 0, 1, 1, 0, 2};
    private static final String[] BADGE_LABELS = {
            "Welcome Back!", "Welcome Back!", "Perfect!", "Health first, always!",
            "You are doing great!", "Keep it up!",
    };
    private static final String[] HEADLINES = {
            "Ready to stay on\ntrack today?",
            "Health first, always!",
            "Perfect!",
            "Keep going strong!",
            "You are doing great!",
            "One step at a time.",
    };
    private static final String[] BODIES = {
            "It's wonderful to hear you're on the mend. As you regain strength, we're here to assist with your nutrition. Remember to take things slow and prioritize your well-being.",
            "Your enthusiasm is inspiring! Every step matters, and we're right here to guide and support your progress.",
            "We improved calorie syncing! Sync with Health connect to reach your goal faster.",
            "Good nutrition is the foundation of great health. Let's make today count.",
            "Every healthy choice adds up. You're building lasting habits one day at a time.",
            "Remember: consistency beats perfection. Log your meals and we'll do the rest.",
    };

    private int card = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        show(0);
    }

    private void show(int idx) {
        card = Math.max(0, Math.min(idx, HEADLINES.length - 1));
        int bg = CARD_BG[card];
        Ui.styleBars(this, bg, true);

        LinearLayout root = Ui.screen(this, Ui.PAPER);

        // Scrollable coach card
        LinearLayout cardView = Ui.v(this);
        cardView.setBackgroundColor(bg);
        cardView.setPadding(Ui.dp(this, 24), Ui.dp(this, 28), Ui.dp(this, 24), Ui.dp(this, 24));
        cardView.setGravity(Gravity.TOP);

        // Badge
        cardView.addView(Ui.pillBadge(this, BADGE_LABELS[card], Ui.PINE, Ui.PAPER));

        // Avocado mascot
        Ui.AvoMascotView avo = new Ui.AvoMascotView(this, AVO_MOOD[card]);
        cardView.addView(avo, Ui.lpm(this, Ui.dp(this, 180), Ui.dp(this, 200), 0, 20, 0, 0));
        ((LinearLayout.LayoutParams) avo.getLayoutParams()).gravity = Gravity.CENTER_HORIZONTAL;

        // Headline
        TextView headline = Ui.text(this, HEADLINES[card], 26, Ui.NAVY, Typeface.BOLD);
        headline.setLineSpacing(Ui.dp(this, 3), 1f);
        cardView.addView(headline, Ui.lpm(this, -1, -2, 0, 20, 0, 0));

        // Body
        TextView body = Ui.text(this, BODIES[card], 15, Ui.NAVY, Typeface.NORMAL);
        body.setLineSpacing(Ui.dp(this, 4), 1f);
        cardView.addView(body, Ui.lpm(this, -1, -2, 0, 12, 0, 0));

        cardView.addView(Ui.spacer(this, 1), new LinearLayout.LayoutParams(-1, 0, 1));

        // Nav row
        LinearLayout nav = Ui.h(this);
        nav.setGravity(Gravity.CENTER_VERTICAL);
        nav.setPadding(0, Ui.dp(this, 16), 0, 0);

        TextView back = Ui.backCircle(this);
        back.setBackgroundTintList(android.content.res.ColorStateList.valueOf(
                android.graphics.Color.argb(80, 255, 255, 255)));
        back.setOnClickListener(v -> show(card - 1));
        back.setVisibility(card > 0 ? View.VISIBLE : View.INVISIBLE);
        nav.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 52), Ui.dp(this, 52)));
        nav.addView(Ui.spacer(this, 0), Ui.weight(this, -1, 1, 12, 0, 0, 0));

        String nextLabel = card == HEADLINES.length - 1 ? "Start Tracking" : "Next";
        TextView nextBtn = Ui.bigButton(this, nextLabel);
        nextBtn.setOnClickListener(v -> {
            if (card < HEADLINES.length - 1) show(card + 1);
            else Ui.go(this, DiaryActivity.class);
        });
        nav.addView(nextBtn, new LinearLayout.LayoutParams(Ui.dp(this, 200), Ui.dp(this, 52)));
        cardView.addView(nav, new LinearLayout.LayoutParams(-1, Ui.dp(this, 68)));

        root.addView(cardView, new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(AppNav.bottom(this, "coach"), new LinearLayout.LayoutParams(-1, Ui.dp(this, 64)));
        setContentView(root);
    }
}

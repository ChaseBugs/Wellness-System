package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class DiaryActivity extends Activity {

    private static final int CALORIE_GOAL = 1869;
    // Meal name, cal-target, icon char
    private static final String[][] MEALS = {
            {"Breakfast", "561", "B"},
            {"Lunch",     "561", "L"},
            {"Dinner",    "561", "D"},
            {"Snacks",    "187", "S"},
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.SURF, true);

        LinearLayout root = Ui.screen(this, Ui.PAPER);

        // Calorie header (fixed height)
        Ui.JournalCalorieHeaderView header = new Ui.JournalCalorieHeaderView(this);
        header.setValues(0, 0, CALORIE_GOAL);
        root.addView(header, new LinearLayout.LayoutParams(-1, Ui.dp(this, 100)));

        // Divider
        root.addView(Ui.spacer(this, 1));
        ((LinearLayout.LayoutParams) root.getChildAt(root.getChildCount() - 1).getLayoutParams())
                .setMargins(0, 0, 0, 0);
        android.view.View divider = new android.view.View(this);
        divider.setBackgroundColor(Ui.RULE2);
        root.addView(divider, new LinearLayout.LayoutParams(-1, Ui.dp(this, 1)));

        // Date navigation
        root.addView(dateNav(), new LinearLayout.LayoutParams(-1, Ui.dp(this, 56)));

        // Scrollable content
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 16), Ui.dp(this, 8), Ui.dp(this, 16), Ui.dp(this, 16));

        // Meal slots
        for (String[] meal : MEALS) {
            content.addView(mealRow(meal[0], Integer.parseInt(meal[1])),
                    Ui.lpm(this, -1, -2, 0, 0, 0, 1));
        }

        // Activities card
        content.addView(activitiesCard(), Ui.lpm(this, -1, -2, 0, 12, 0, 0));

        root.addView(Ui.scroll(this, content), new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(AppNav.bottom(this, "journal"), new LinearLayout.LayoutParams(-1, Ui.dp(this, 64)));
        setContentView(root);
    }

    private LinearLayout dateNav() {
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setBackgroundColor(Ui.PAPER);
        row.setPadding(Ui.dp(this, 12), 0, Ui.dp(this, 12), 0);

        TextView prev = navArrow("←");
        row.addView(prev, new LinearLayout.LayoutParams(Ui.dp(this, 40), Ui.dp(this, 40)));

        LinearLayout center = Ui.h(this);
        center.setGravity(Gravity.CENTER);
        center.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 24), Ui.dp(this, 1), Ui.RULE2));
        center.setPadding(Ui.dp(this, 14), 0, Ui.dp(this, 14), 0);
        TextView dateLabel = Ui.text(this, "Today", 15, Ui.NAVY, Typeface.BOLD);
        center.addView(dateLabel);
        row.addView(center, new LinearLayout.LayoutParams(0, Ui.dp(this, 40), 1));

        TextView next = navArrow("→");
        row.addView(next, Ui.lpm(this, Ui.dp(this, 40), Ui.dp(this, 40), 12, 0, 0, 0));
        return row;
    }

    private TextView navArrow(String ch) {
        TextView t = Ui.text(this, ch, 18, Ui.NAVY, Typeface.BOLD);
        t.setGravity(Gravity.CENTER);
        t.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 20), 0, Ui.SURF));
        return t;
    }

    private LinearLayout mealRow(String name, int targetCal) {
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setBackgroundColor(Ui.PAPER);
        row.setPadding(Ui.dp(this, 16), Ui.dp(this, 14), Ui.dp(this, 16), Ui.dp(this, 14));

        // Icon circle
        LinearLayout icon = Ui.v(this);
        icon.setGravity(Gravity.CENTER);
        icon.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 24), 0, Ui.SURF));
        icon.addView(new Ui.FoodGlyphView(this, iconKind(name)),
                new LinearLayout.LayoutParams(Ui.dp(this, 34), Ui.dp(this, 34)));
        row.addView(icon, new LinearLayout.LayoutParams(Ui.dp(this, 48), Ui.dp(this, 48)));

        // Copy
        LinearLayout copy = Ui.v(this);
        copy.setPadding(Ui.dp(this, 12), 0, 0, 0);
        copy.addView(Ui.text(this, name, 16, Ui.NAVY, Typeface.BOLD));
        copy.addView(Ui.text(this, "0 / " + targetCal + " Cal", 13, Ui.SLATE, Typeface.NORMAL),
                Ui.lpm(this, -1, -2, 0, 2, 0, 0));
        row.addView(copy, new LinearLayout.LayoutParams(0, -2, 1));

        // Add button
        LinearLayout addBtn = Ui.v(this);
        addBtn.setGravity(Gravity.CENTER);
        addBtn.setBackground(Ui.round(Ui.NAVY, Ui.dp(this, 20), 0, Ui.NAVY));
        TextView plus = Ui.text(this, "+", 22, Ui.PAPER, Typeface.BOLD);
        plus.setGravity(Gravity.CENTER);
        addBtn.addView(plus, new LinearLayout.LayoutParams(Ui.dp(this, 40), Ui.dp(this, 40)));
        row.addView(addBtn, new LinearLayout.LayoutParams(Ui.dp(this, 40), Ui.dp(this, 40)));

        // Bottom divider
        LinearLayout wrap = Ui.v(this);
        wrap.addView(row);
        android.view.View div = new android.view.View(this);
        div.setBackgroundColor(Ui.RULE2);
        LinearLayout.LayoutParams dp = new LinearLayout.LayoutParams(-1, Ui.dp(this, 1));
        dp.leftMargin = Ui.dp(this, 76);
        wrap.addView(div, dp);
        return wrap;
    }

    private String iconKind(String meal) {
        switch (meal) {
            case "Breakfast": return "mug";
            case "Lunch":     return "rice";
            case "Dinner":    return "fish";
            default:          return "leaf";
        }
    }

    private LinearLayout activitiesCard() {
        LinearLayout card = Ui.v(this);
        card.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 14), Ui.dp(this, 1), Ui.RULE2));
        card.setPadding(Ui.dp(this, 16), Ui.dp(this, 16), Ui.dp(this, 16), Ui.dp(this, 16));

        LinearLayout head = Ui.h(this);
        head.setGravity(Gravity.CENTER_VERTICAL);
        // trophy icon area
        LinearLayout trophyWrap = Ui.v(this);
        trophyWrap.setGravity(Gravity.CENTER);
        trophyWrap.setBackground(Ui.round(Ui.PEACH_BG, Ui.dp(this, 10), 0, Ui.PEACH_BG));
        TextView trophy = Ui.text(this, "★", 22, Color.rgb(240, 170, 50), Typeface.BOLD);
        trophy.setGravity(Gravity.CENTER);
        trophyWrap.addView(trophy, new LinearLayout.LayoutParams(Ui.dp(this, 44), Ui.dp(this, 44)));
        head.addView(trophyWrap, new LinearLayout.LayoutParams(Ui.dp(this, 44), Ui.dp(this, 44)));

        LinearLayout copy = Ui.v(this);
        copy.setPadding(Ui.dp(this, 12), 0, 0, 0);
        copy.addView(Ui.text(this, "Activities", 15, Ui.NAVY, Typeface.BOLD));
        copy.addView(Ui.text(this, "0 Cal Burned", 12, Ui.SLATE, Typeface.NORMAL),
                Ui.lpm(this, -1, -2, 0, 2, 0, 0));
        head.addView(copy, new LinearLayout.LayoutParams(0, -2, 1));
        card.addView(head);

        TextView info = Ui.text(this,
                "We improved calorie syncing! Sync with Health connect to reach your goal faster.",
                13, Ui.NAVY, Typeface.BOLD);
        info.setLineSpacing(Ui.dp(this, 3), 1f);
        card.addView(info, Ui.lpm(this, -1, -2, 0, 14, 0, 0));

        TextView addBtn = Ui.bigButton(this, "Add an activity");
        addBtn.setOnClickListener(v -> Ui.go(this, InsightsActivity.class));
        card.addView(addBtn, Ui.lpm(this, -1, Ui.dp(this, 48), 0, 14, 0, 0));
        return card;
    }
}

package com.heightincrease.app.ui;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.activities.DiscoverActivity;
import com.heightincrease.app.activities.PlanActivity;
import com.heightincrease.app.activities.ProfileActivity;
import com.heightincrease.app.activities.ReportsActivity;

public final class BottomNav {
    public static final String PLAN = "Plan";
    public static final String DISCOVER = "Discover";
    public static final String REPORTS = "Reports";
    public static final String ME = "Me";

    private BottomNav() {
    }

    public static View create(Activity activity, String selected) {
        LinearLayout bar = new LinearLayout(activity);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER);
        bar.setPadding(0, Ui.dp(activity, 8), 0, Ui.dp(activity, 8));
        bar.setBackgroundColor(android.graphics.Color.WHITE);
        bar.addView(item(activity, "★", PLAN, selected, PlanActivity.class), weight());
        bar.addView(item(activity, "◆", DISCOVER, selected, DiscoverActivity.class), weight());
        bar.addView(item(activity, "▮", REPORTS, selected, ReportsActivity.class), weight());
        bar.addView(item(activity, "●", ME, selected, ProfileActivity.class), weight());
        return bar;
    }

    private static LinearLayout.LayoutParams weight() {
        return new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
    }

    private static View item(Activity activity, String icon, String label, String selected, Class<?> target) {
        boolean active = selected.equals(label);
        LinearLayout item = Ui.vertical(activity);
        item.setGravity(Gravity.CENTER);

        TextView iconView = Ui.text(activity, icon, 25, active ? Palette.BLUE : android.graphics.Color.LTGRAY, Typeface.BOLD);
        iconView.setGravity(Gravity.CENTER);
        TextView labelView = Ui.text(activity, label, 15, active ? Palette.BLUE : Palette.MUTED, Typeface.BOLD);
        labelView.setGravity(Gravity.CENTER);

        item.addView(iconView);
        item.addView(labelView);
        item.setOnClickListener(v -> {
            if (!active) {
                activity.startActivity(new Intent(activity, target));
                activity.overridePendingTransition(0, 0);
            }
        });
        return item;
    }
}

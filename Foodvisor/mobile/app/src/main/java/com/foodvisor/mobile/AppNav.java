package com.foodvisor.mobile;

import android.app.Activity;
import android.view.View;
import android.widget.LinearLayout;

import com.foodvisor.mobile.ui.Ui;

final class AppNav {
    private AppNav() {}

    static LinearLayout bottom(Activity activity, String active) {
        LinearLayout nav = Ui.bottomNav3(activity, active);
        Class<?>[] targets = {
                TodayActivity.class,
                DiaryActivity.class,
                ProfileActivity.class,
        };
        String[] keys = {"coach", "journal", "profile"};
        for (int i = 0; i < nav.getChildCount() && i < targets.length; i++) {
            final Class<?> target = targets[i];
            final String key = keys[i];
            View child = nav.getChildAt(i);
            child.setOnClickListener(v -> {
                if (!activity.getClass().equals(target)) {
                    Ui.go(activity, target);
                }
            });
        }
        return nav;
    }
}

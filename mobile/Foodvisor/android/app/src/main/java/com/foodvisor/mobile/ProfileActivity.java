package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class ProfileActivity extends Activity {

    private int activeTab = 0; // 0=Weight  1=Nutrition

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        showTab(0);
    }

    private void showTab(int tab) {
        activeTab = tab;
        Ui.styleBars(this, Ui.TEAL_HDR, true);

        LinearLayout root = Ui.screen(this, Ui.PAPER);

        // ── Teal header ──────────────────────────────────────────────────────
        LinearLayout header = Ui.v(this);
        header.setBackgroundColor(Ui.TEAL_HDR);
        header.setPadding(Ui.dp(this, 20), Ui.dp(this, 24), Ui.dp(this, 20), 0);

        // Top row: avatar | info | gear
        LinearLayout topRow = Ui.h(this);
        topRow.setGravity(Gravity.CENTER_VERTICAL);

        GradientDrawable avatarBg = new GradientDrawable();
        avatarBg.setShape(GradientDrawable.OVAL);
        avatarBg.setColor(Color.rgb(160, 205, 188));
        LinearLayout avatarWrap = Ui.v(this);
        avatarWrap.setGravity(Gravity.CENTER);
        avatarWrap.setBackground(avatarBg);
        avatarWrap.addView(new Ui.AvoMascotView(this, 0),
                new LinearLayout.LayoutParams(Ui.dp(this, 68), Ui.dp(this, 82)));
        topRow.addView(avatarWrap, new LinearLayout.LayoutParams(Ui.dp(this, 88), Ui.dp(this, 88)));

        String userName = getSharedPreferences("foodvisor_profile", MODE_PRIVATE)
                .getString("name", "Arthur");
        String userGoal = getSharedPreferences("foodvisor_profile", MODE_PRIVATE)
                .getString("goal", "Gain muscle");

        LinearLayout info = Ui.v(this);
        info.setPadding(Ui.dp(this, 14), 0, 0, 0);
        info.addView(Ui.text(this, userName, 22, Ui.NAVY, Typeface.BOLD));
        info.addView(Ui.text(this, userGoal, 13, Ui.SLATE, Typeface.NORMAL),
                Ui.lpm(this, -1, -2, 0, 4, 0, 8));
        TextView calPill = Ui.text(this, "1869 Cal / d", 14, Ui.NAVY, Typeface.BOLD);
        calPill.setGravity(Gravity.CENTER);
        calPill.setPadding(Ui.dp(this, 16), Ui.dp(this, 8), Ui.dp(this, 16), Ui.dp(this, 8));
        calPill.setBackground(Ui.round(Ui.PAPER, Ui.dp(this, 22), 0, Ui.PAPER));
        info.addView(calPill, new LinearLayout.LayoutParams(-2, -2));
        topRow.addView(info, new LinearLayout.LayoutParams(0, -2, 1));

        TextView gear = Ui.text(this, "⚙", 22, Ui.NAVY, Typeface.NORMAL);
        gear.setGravity(Gravity.TOP);
        topRow.addView(gear, new LinearLayout.LayoutParams(Ui.dp(this, 32), Ui.dp(this, 32)));

        header.addView(topRow);

        // Tab underline bar
        LinearLayout tabRow = Ui.h(this);
        tabRow.setPadding(0, Ui.dp(this, 16), 0, 0);
        String[] tabLabels = {"Weight", "Nutrition"};
        for (int i = 0; i < 2; i++) {
            final int idx = i;
            LinearLayout cell = Ui.v(this);
            cell.setGravity(Gravity.CENTER);
            cell.setPadding(0, 0, 0, Ui.dp(this, 10));
            TextView t = Ui.text(this, tabLabels[i], 15,
                    i == activeTab ? Ui.NAVY : Ui.SLATE, Typeface.BOLD);
            t.setGravity(Gravity.CENTER);
            cell.addView(t);
            View underline = new View(this);
            underline.setBackgroundColor(i == activeTab ? Ui.NAVY : Color.TRANSPARENT);
            LinearLayout.LayoutParams ulp = new LinearLayout.LayoutParams(-1, Ui.dp(this, 2));
            ulp.topMargin = Ui.dp(this, 8);
            cell.addView(underline, ulp);
            cell.setOnClickListener(v -> showTab(idx));
            tabRow.addView(cell, new LinearLayout.LayoutParams(0, -2, 1));
        }
        header.addView(tabRow);
        root.addView(header);

        // ── Tab content ──────────────────────────────────────────────────────
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 16), Ui.dp(this, 16), Ui.dp(this, 16), Ui.dp(this, 16));
        if (activeTab == 0) buildWeightTab(content);
        else buildNutritionTab(content);

        root.addView(Ui.scroll(this, content), new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(AppNav.bottom(this, "profile"), new LinearLayout.LayoutParams(-1, Ui.dp(this, 64)));
        setContentView(root);
    }

    // ── Weight tab ───────────────────────────────────────────────────────────

    private void buildWeightTab(LinearLayout parent) {
        // Three stats: start / current / goal
        LinearLayout statsRow = Ui.h(this);
        statsRow.setGravity(Gravity.CENTER);
        addWeightStat(statsRow, "Start weight",   "60kg");
        addWeightStat(statsRow, "Current weight", "60kg");
        addWeightStat(statsRow, "Goal weight",    "65kg");
        parent.addView(statsRow, Ui.lpm(this, -1, -2, 0, 0, 0, 18));

        TextView addBtn = Ui.bigButton(this, "Add a weight entry");
        parent.addView(addBtn, Ui.lpm(this, -1, Ui.dp(this, 52), 0, 0, 0, 22));

        parent.addView(sectionLabel("Weight"), Ui.lpm(this, -1, -2, 0, 0, 0, 12));

        Ui.WeightChartView chart = new Ui.WeightChartView(this);
        chart.setData(new float[]{60f}, 65f);
        chart.setBackgroundColor(Ui.PAPER);
        parent.addView(chart, Ui.lpm(this, -1, Ui.dp(this, 220), 0, 0, 0, 22));

        parent.addView(sectionLabel("Weights saved"), Ui.lpm(this, -1, -2, 0, 0, 0, 12));

        LinearLayout savedCard = Ui.v(this);
        savedCard.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 12), Ui.dp(this, 1), Ui.RULE2));
        savedCard.setPadding(Ui.dp(this, 16), Ui.dp(this, 14), Ui.dp(this, 16), Ui.dp(this, 14));
        savedCard.addView(weightEntryRow("Today — 21/04", "60 kg"));
        parent.addView(savedCard);
    }

    private void addWeightStat(LinearLayout row, String label, String value) {
        LinearLayout col = Ui.v(this);
        col.setGravity(Gravity.CENTER);
        TextView valView = Ui.number(this, value, 24, Ui.NAVY);
        valView.setGravity(Gravity.CENTER);
        col.addView(valView);
        TextView labelView = Ui.text(this, label, 11, Ui.SLATE, Typeface.NORMAL);
        labelView.setGravity(Gravity.CENTER);
        col.addView(labelView, Ui.lpm(this, -1, -2, 0, 4, 0, 0));
        row.addView(col, new LinearLayout.LayoutParams(0, -2, 1));
    }

    private LinearLayout weightEntryRow(String date, String value) {
        LinearLayout row = Ui.h(this);
        row.addView(Ui.text(this, date, 13, Ui.NAVY, Typeface.BOLD),
                new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(Ui.text(this, value, 13, Ui.SLATE, Typeface.NORMAL));
        return row;
    }

    // ── Nutrition tab ────────────────────────────────────────────────────────

    private void buildNutritionTab(LinearLayout parent) {
        // Premium banner
        LinearLayout banner = Ui.v(this);
        banner.setGravity(Gravity.CENTER);
        banner.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 14), Ui.dp(this, 1), Ui.RULE2));
        banner.setPadding(Ui.dp(this, 16), Ui.dp(this, 16), Ui.dp(this, 16), Ui.dp(this, 16));
        banner.addView(Ui.text(this, "Reach your goals faster with Premium", 14, Ui.NAVY, Typeface.BOLD));
        TextView getMore = Ui.text(this, "Get more info", 13, Ui.PINE, Typeface.BOLD);
        getMore.setGravity(Gravity.CENTER);
        getMore.setPadding(Ui.dp(this, 18), Ui.dp(this, 9), Ui.dp(this, 18), Ui.dp(this, 9));
        getMore.setBackground(Ui.round(Ui.PAPER, Ui.dp(this, 20), Ui.dp(this, 1), Ui.PINE));
        banner.addView(getMore, Ui.lpm(this, -2, -2, 0, 10, 0, 0));
        parent.addView(banner, Ui.lpm(this, -1, -2, 0, 0, 0, 22));

        parent.addView(sectionLabel("Goal (Cal)"), Ui.lpm(this, -1, -2, 0, 0, 0, 10));
        parent.addView(Ui.tabToggle(this, new String[]{"7 days", "30 days", "90 days"}, 0),
                Ui.lpm(this, -1, -2, 0, 0, 0, 12));
        parent.addView(emptyState(), Ui.lpm(this, -1, -2, 0, 0, 0, 22));

        parent.addView(sectionLabel("Macronutrient breakdown (%)"), Ui.lpm(this, -1, -2, 0, 0, 0, 10));
        parent.addView(Ui.tabToggle(this, new String[]{"7 days", "30 days", "90 days"}, 0),
                Ui.lpm(this, -1, -2, 0, 0, 0, 12));
        parent.addView(emptyState());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private TextView sectionLabel(String text) {
        return Ui.text(this, text, 18, Ui.NAVY, Typeface.BOLD);
    }

    private LinearLayout emptyState() {
        LinearLayout box = Ui.v(this);
        box.setGravity(Gravity.CENTER);
        box.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 12), Ui.dp(this, 1), Ui.RULE2));
        TextView t = Ui.text(this, "No data available yet", 13, Ui.SLATE, Typeface.NORMAL);
        t.setGravity(Gravity.CENTER);
        box.addView(t, Ui.lpm(this, -1, Ui.dp(this, 100), 0, 0, 0, 0));
        return box;
    }
}

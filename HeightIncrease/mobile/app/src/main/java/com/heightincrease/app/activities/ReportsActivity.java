package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.ReportMetric;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.ReportsViewModel;

public class ReportsActivity extends BaseActivity {
    private ReportsViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Palette.BLUE);
        viewModel = new ReportsViewModel(repository);

        LinearLayout content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 16), Ui.dp(this, 70), Ui.dp(this, 16), Ui.dp(this, 24));
        content.setBackgroundColor(Palette.BG);

        LinearLayout hero = Ui.vertical(this);
        hero.setBackgroundColor(Palette.BLUE);
        hero.setPadding(Ui.dp(this, 10), 0, Ui.dp(this, 10), Ui.dp(this, 28));
        TextView title = Ui.text(this, "REPORTS", 36, android.graphics.Color.WHITE, Typeface.BOLD);
        hero.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 18, 0, 0, 22));
        hero.addView(encouragement());
        content.addView(hero, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, -16, -70, -16, 18));

        content.addView(metricCard());
        content.addView(weekCard());
        content.addView(heightCard());
        content.addView(sleepCard());
        content.addView(bmiCard());
        setTabPage(BottomNav.REPORTS, Ui.scroll(this, content));
    }

    private LinearLayout encouragement() {
        LinearLayout card = Ui.card(this, 22);
        card.setBackground(Ui.bg(android.graphics.Color.argb(70, 255, 255, 255), 22, this));
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(Ui.text(this, "👍", 46, android.graphics.Color.WHITE, Typeface.NORMAL),
                Ui.mlp(this, Ui.dp(this, 74), Ui.dp(this, 74), 0, 0, 14, 0));
        TextView copy = Ui.text(this, "Every stretch mastered, every jump perfected - consistent effort fuels measurable growth!",
                22, android.graphics.Color.WHITE, Typeface.NORMAL);
        card.addView(copy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        return card;
    }

    private LinearLayout metricCard() {
        LinearLayout card = Ui.card(this, 26);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER);
        for (int i = 0; i < viewModel.getState().size(); i++) {
            card.addView(metric(viewModel.getState().get(i)), new LinearLayout.LayoutParams(0,
                    ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            if (i < viewModel.getState().size() - 1) {
                TextView divider = Ui.text(this, "|", 32, Palette.DIVIDER, Typeface.NORMAL);
                card.addView(divider);
            }
        }
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private LinearLayout metric(ReportMetric metric) {
        LinearLayout item = Ui.vertical(this);
        item.setGravity(Gravity.CENTER);
        TextView value = Ui.text(this, metric.value, 30, Palette.TEXT, Typeface.BOLD);
        value.setGravity(Gravity.CENTER);
        TextView label = Ui.text(this, metric.label, 15, Palette.MUTED, Typeface.BOLD);
        label.setGravity(Gravity.CENTER);
        item.addView(value);
        item.addView(label);
        return item;
    }

    private LinearLayout weekCard() {
        LinearLayout card = Ui.card(this, 22);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.text(this, "This week", 25, Palette.TEXT, Typeface.BOLD),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        header.addView(Ui.text(this, "HISTORY  ›", 17, Palette.MUTED, Typeface.BOLD));
        card.addView(header);

        LinearLayout days = Ui.horizontal(this);
        days.setGravity(Gravity.CENTER);
        String[] labels = {"S\n19", "M\n20", "T\n21", "W\n22", "T\n23", "F\n24", "S\n25"};
        for (String label : labels) {
            TextView day = Ui.text(this, label, 18, label.contains("21") ? android.graphics.Color.WHITE : Palette.MUTED, Typeface.BOLD);
            day.setGravity(Gravity.CENTER);
            day.setBackground(Ui.bg(label.contains("21") ? Palette.TEXT : Palette.SOFT_GRAY, 32, this));
            days.addView(day, Ui.mlp(this, 0, Ui.dp(this, 72), 4, 26, 4, 18));
            ((LinearLayout.LayoutParams) day.getLayoutParams()).weight = 1;
        }
        card.addView(days);
        TextView streak = Ui.text(this, "0 DAY IN A ROW", 18, Palette.MUTED, Typeface.NORMAL);
        streak.setGravity(Gravity.CENTER);
        streak.setTextColor(Palette.MUTED);
        card.addView(streak);
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private LinearLayout heightCard() {
        LinearLayout card = Ui.card(this, 22);
        LinearLayout header = Ui.horizontal(this);
        header.addView(Ui.text(this, "Height", 24, Palette.TEXT, Typeface.BOLD),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        header.addView(Ui.text(this, "Edit ✎", 18, Palette.MUTED, Typeface.NORMAL));
        card.addView(header);
        LinearLayout row = Ui.horizontal(this);
        row.addView(Ui.text(this, "Current:", 22, Palette.MUTED, Typeface.BOLD),
                new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView height = Ui.text(this, "165.0 CM", 24, Palette.BLUE, Typeface.BOLD);
        row.addView(height);
        card.addView(row, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 34, 0, 16));
        return card;
    }

    private LinearLayout sleepCard() {
        LinearLayout card = Ui.card(this, 22);
        card.addView(Ui.text(this, "Sleep tracker", 24, Palette.TEXT, Typeface.BOLD));
        TextView illustration = Ui.text(this, "🛏", 62, Palette.BLUE, Typeface.NORMAL);
        illustration.setGravity(Gravity.CENTER);
        card.addView(illustration);
        TextView copy = Ui.text(this, "Studies have shown that getting 8-10 hours sleep per night is beneficial for growth. Turn on sleep tracker to optimize your sleep patterns.",
                18, Palette.MUTED, Typeface.NORMAL);
        card.addView(copy, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 18, 12, 18, 18));
        card.addView(Ui.button(this, "TURN ON"), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 32, 8, 32, 6));
        return card;
    }

    private LinearLayout bmiCard() {
        LinearLayout card = Ui.card(this, 22);
        card.addView(Ui.text(this, "BMI(kg/m²)", 24, Palette.TEXT, Typeface.BOLD));
        TextView copy = Ui.text(this, "BMI range and categories come from Wiki.", 17, Palette.MUTED, Typeface.NORMAL);
        copy.setGravity(Gravity.CENTER);
        card.addView(copy, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 24, 0, 14));
        TextView input = Ui.button(this, "INPUT YOUR DATA");
        input.setTextSize(18);
        card.addView(input, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 42, 0, 42, 0));
        return card;
    }
}

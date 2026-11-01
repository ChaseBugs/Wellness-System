package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.PlanCard;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.PlanViewModel;

public class PlanActivity extends BaseActivity {
    private PlanViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new PlanViewModel(repository);

        LinearLayout content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 54), Ui.dp(this, 18), Ui.dp(this, 24));
        content.setBackgroundColor(Palette.BG);

        LinearLayout header = Ui.horizontal(this);
        TextView title = Ui.title(this, "Increase Height Workout");
        header.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView fire = Ui.text(this, "🔥", 30, Palette.TEXT, Typeface.NORMAL);
        TextView idea = Ui.text(this, "💡", 30, Palette.TEXT, Typeface.NORMAL);
        header.addView(fire, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 6, 0, 10, 0));
        header.addView(idea);
        content.addView(header);

        content.addView(messageCard());
        content.addView(goalCard());
        for (PlanCard card : viewModel.getState()) {
            content.addView(planCard(card));
        }

        setTabPage(BottomNav.PLAN, Ui.scroll(this, content));
    }

    private LinearLayout messageCard() {
        LinearLayout card = Ui.card(this, 28);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        TextView icon = Ui.text(this, "😉", 42, Palette.TEXT, Typeface.NORMAL);
        card.addView(icon, Ui.mlp(this, Ui.dp(this, 62), Ui.dp(this, 62), 0, 0, 16, 0));
        TextView message = Ui.text(this, "Your taller future is loading - hit 'start' to boost your height!", 22,
                Palette.TEXT, Typeface.NORMAL);
        card.addView(message, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 22, 0, 14));
        return card;
    }

    private LinearLayout goalCard() {
        LinearLayout card = Ui.card(this, 24);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(Ui.imagePanel(this, Palette.SOFT_BLUE, "⛰"), Ui.mlp(this, Ui.dp(this, 86), Ui.dp(this, 86), 0, 0, 18, 0));
        TextView label = Ui.text(this, "Set weekly goal for your height", 20, Palette.TEXT, Typeface.BOLD);
        card.addView(label, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView plus = Ui.icon(this, "+", 54, Palette.BLUE, 32);
        plus.setTextColor(android.graphics.Color.WHITE);
        card.addView(plus);
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 10, 0, 16));
        return card;
    }

    private FrameLayout planCard(PlanCard item) {
        FrameLayout frame = new FrameLayout(this);
        frame.setBackground(Ui.bg(item.primary ? Palette.BLUE : android.graphics.Color.WHITE, 24, this));
        frame.setPadding(Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18));

        LinearLayout text = Ui.vertical(this);
        TextView icon = Ui.icon(this, item.primary ? "💡" : "+", 58, item.primary ? android.graphics.Color.WHITE : Palette.BLUE, 24);
        text.addView(icon, new LinearLayout.LayoutParams(Ui.dp(this, 58), Ui.dp(this, 58)));
        TextView title = Ui.text(this, item.title, 30, item.primary ? android.graphics.Color.WHITE : Palette.TEXT, Typeface.BOLD);
        text.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 20, 0, 0));
        if (item.primary) {
            text.addView(Ui.progress(this, item.progress), Ui.mlp(this, Ui.dp(this, 230), Ui.dp(this, 10), 0, 22, 0, 0));
            LinearLayout meta = Ui.horizontal(this);
            meta.addView(Ui.text(this, item.subtitle, 18, android.graphics.Color.WHITE, Typeface.NORMAL),
                    new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            meta.addView(Ui.text(this, item.progress + ".0%", 18, android.graphics.Color.WHITE, Typeface.NORMAL));
            text.addView(meta, Ui.mlp(this, Ui.dp(this, 230), ViewGroup.LayoutParams.WRAP_CONTENT, 0, 16, 0, 0));
        } else {
            text.addView(Ui.text(this, item.subtitle, 17, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 0));
        }
        TextView action = Ui.text(this, item.action, 26, item.primary ? Palette.BLUE_DARK : Palette.BLUE, Typeface.BOLD);
        action.setGravity(Gravity.CENTER);
        action.setBackground(Ui.bg(android.graphics.Color.WHITE, 28, this));
        text.addView(action, Ui.mlp(this, Ui.dp(this, 230), Ui.dp(this, 68), 0, 20, 0, 0));

        frame.addView(text);
        TextView visual = Ui.text(this, item.primary ? "↑" : "↗", 96,
                item.primary ? android.graphics.Color.argb(120, 255, 255, 255) : Palette.SOFT_BLUE, Typeface.BOLD);
        visual.setGravity(Gravity.RIGHT | Gravity.BOTTOM);
        frame.addView(visual, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        frame.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                item.primary ? Ui.dp(this, 360) : Ui.dp(this, 210), 0, 0, 0, 16));
        return frame;
    }
}

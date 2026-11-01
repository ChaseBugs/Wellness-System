package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.Article;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.DiscoverViewModel;

public class DiscoverActivity extends BaseActivity {
    private DiscoverViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new DiscoverViewModel(repository);

        LinearLayout content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 24), Ui.dp(this, 58), Ui.dp(this, 24), Ui.dp(this, 24));
        content.setBackgroundColor(android.graphics.Color.WHITE);
        content.addView(Ui.title(this, "Discover"));
        Article lead = viewModel.getState().get(0);
        content.addView(featured(lead));
        content.addView(exerciseList());
        setTabPage(BottomNav.DISCOVER, Ui.scroll(this, content));
    }

    private LinearLayout featured(Article item) {
        LinearLayout card = Ui.card(this, 6);
        card.setPadding(0, 0, 0, Ui.dp(this, 16));
        card.addView(Ui.imagePanel(this, android.graphics.Color.rgb(210, 198, 178), "👠"),
                new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 150)));
        TextView title = Ui.text(this, item.title, 24, Palette.TEXT, Typeface.BOLD);
        card.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 22, 18, 22, 0));
        TextView subtitle = Ui.text(this, item.subtitle, 18, Palette.MUTED, Typeface.NORMAL);
        card.addView(subtitle, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 22, 4, 22, 0));
        TextView heart = Ui.text(this, "♡", 34, Palette.MUTED, Typeface.NORMAL);
        heart.setGravity(Gravity.RIGHT);
        card.addView(heart, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 22, 8, 24, 0));
        card.setElevation(Ui.dp(this, 4));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 26, 0, 22));
        return card;
    }

    private LinearLayout exerciseList() {
        LinearLayout card = Ui.card(this, 8);
        card.setElevation(Ui.dp(this, 3));
        card.addView(Ui.text(this, "Height increase exercise", 27, Palette.TEXT, Typeface.BOLD));
        card.addView(Ui.text(this, "Height increase tips", 19, Palette.MUTED, Typeface.NORMAL),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 18));

        for (int i = 1; i < viewModel.getState().size(); i++) {
            card.addView(articleRow(viewModel.getState().get(i), i));
            if (i < viewModel.getState().size() - 1) {
                card.addView(Ui.divider(this), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 1), 118, 8, 0, 8));
            }
        }
        return card;
    }

    private LinearLayout articleRow(Article item, int index) {
        LinearLayout row = Ui.horizontal(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        int color = index % 2 == 0 ? android.graphics.Color.rgb(221, 232, 224) : android.graphics.Color.rgb(222, 235, 244);
        row.addView(Ui.imagePanel(this, color, "↕"), Ui.mlp(this, Ui.dp(this, 92), Ui.dp(this, 92), 0, 0, 22, 0));
        TextView title = Ui.text(this, item.title, 23, Palette.TEXT, Typeface.BOLD);
        row.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView heart = Ui.text(this, "♡", 31, Palette.MUTED, Typeface.NORMAL);
        row.addView(heart, Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 12, 0, 0, 0));
        return row;
    }
}

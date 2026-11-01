package com.heightincrease.app.activities;

import android.app.AlertDialog;
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
    private LinearLayout content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new DiscoverViewModel(remote);

        content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 24), Ui.dp(this, 58), Ui.dp(this, 24), Ui.dp(this, 24));
        content.setBackgroundColor(android.graphics.Color.WHITE);
        setTabPage(BottomNav.DISCOVER, Ui.scroll(this, content));
        render();
        viewModel.load(() -> {
            if (alive()) {
                render();
            }
        });
    }

    private void render() {
        content.removeAllViews();
        content.addView(Ui.title(this, "Discover"));
        Article lead = viewModel.lead();
        if (lead == null) {
            content.addView(status(viewModel.isLoading() ? "Loading articles..."
                    : viewModel.getError() != null ? viewModel.getError() : "No articles yet."));
            return;
        }
        content.addView(featured(lead));
        if (viewModel.getState().size() > 1) {
            content.addView(articleList(lead));
        }
    }

    private TextView status(String message) {
        TextView view = Ui.text(this, message, 18, Palette.MUTED, Typeface.NORMAL);
        view.setGravity(Gravity.CENTER);
        view.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 48, 0, 0));
        return view;
    }

    private LinearLayout featured(Article item) {
        LinearLayout card = Ui.card(this, 6);
        card.setPadding(0, 0, 0, Ui.dp(this, 16));
        card.addView(Ui.imagePanel(this, android.graphics.Color.rgb(210, 198, 178), glyph(item)),
                new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 150)));
        TextView title = Ui.heading(this, item.title, 23, Palette.TEXT);
        card.addView(title, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 22, 16, 22, 0));
        TextView subtitle = Ui.text(this, item.subtitle, 16, Palette.MUTED, Typeface.NORMAL);
        subtitle.setMaxLines(2);
        subtitle.setEllipsize(android.text.TextUtils.TruncateAt.END);
        card.addView(subtitle, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 22, 4, 22, 0));
        LinearLayout footer = Ui.horizontal(this);
        // Not in the design: the platform requires apps to show content that no expert has reviewed yet.
        footer.addView(reviewBadge(item), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        footer.addView(Ui.text(this, "♡", 30, Palette.MUTED, Typeface.NORMAL));
        card.addView(footer, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 22, 4, 22, 0));
        card.setElevation(Ui.dp(this, 4));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 26, 0, 22));
        card.setOnClickListener(v -> showArticle(item));
        return card;
    }

    private LinearLayout articleList(Article lead) {
        LinearLayout card = Ui.card(this, 8);
        card.setElevation(Ui.dp(this, 3));
        card.setPadding(Ui.dp(this, 24), Ui.dp(this, 24), Ui.dp(this, 24), Ui.dp(this, 12));
        card.addView(Ui.heading(this, "Height increase exercise", 26, Palette.TEXT));
        card.addView(Ui.text(this, "Height increase tips", 18, Palette.MUTED, Typeface.NORMAL),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 18));

        int index = 0;
        for (Article item : viewModel.getState()) {
            if (item == lead) {
                continue;
            }
            card.addView(articleRow(item, ++index));
            card.addView(Ui.divider(this), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 1), 106, 6, 0, 8));
        }
        return card;
    }

    private LinearLayout articleRow(Article item, int index) {
        LinearLayout row = Ui.horizontal(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        int color = index % 2 == 0 ? android.graphics.Color.rgb(221, 232, 224) : android.graphics.Color.rgb(222, 235, 244);
        row.addView(Ui.imagePanel(this, color, glyph(item)), Ui.mlp(this, Ui.dp(this, 82), Ui.dp(this, 82), 0, 0, 24, 0));
        row.addView(Ui.heading(this, item.title, 21, Palette.TEXT), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        row.addView(Ui.text(this, "♡", 28, Palette.MUTED, Typeface.NORMAL),
                Ui.mlp(this, ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, 12, 0, 0, 0));
        row.setOnClickListener(v -> showArticle(item));
        return row;
    }

    private TextView reviewBadge(Article item) {
        return Ui.text(this, item.expertReviewed ? "✓ Expert reviewed" : "Not expert reviewed yet", 13,
                item.expertReviewed ? Palette.BLUE : Palette.MUTED, Typeface.BOLD);
    }

    private void showArticle(Article item) {
        String body = item.body.isEmpty() ? item.subtitle : item.body;
        String note = item.expertReviewed ? "" : "\n\nThis article hasn't been reviewed by an expert yet.";
        new AlertDialog.Builder(this)
                .setTitle(item.title)
                .setMessage(body + note)
                .setPositiveButton("Close", null)
                .show();
    }

    private static String glyph(Article item) {
        switch (item.category) {
            case "sleep":
                return "🛏";
            case "nutrition":
                return "🥗";
            case "fashion":
                return "👟";
            case "motivation":
                return "💪";
            default:
                return "↕";
        }
    }
}

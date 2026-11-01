package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.ProfileOption;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.ProfileViewModel;

import java.util.List;

public class ProfileActivity extends BaseActivity {
    private ProfileViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new ProfileViewModel(repository);

        LinearLayout content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 58), Ui.dp(this, 18), Ui.dp(this, 24));
        content.setBackgroundColor(Palette.BG);
        content.addView(Ui.title(this, "Me"));
        content.addView(summaryCard());
        content.addView(optionGroup("SETTINGS", viewModel.getState().settings));
        content.addView(optionGroup("SUPPORT US", viewModel.getState().support));
        TextView version = Ui.text(this, "Version 1.1.16", 22, Palette.MUTED, Typeface.NORMAL);
        version.setGravity(Gravity.CENTER);
        content.addView(version, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 22, 0, 10));
        setTabPage(BottomNav.ME, Ui.scroll(this, content));
    }

    private LinearLayout summaryCard() {
        LinearLayout card = Ui.card(this, 24);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setOrientation(LinearLayout.HORIZONTAL);
        TextView avatar = Ui.icon(this, "↑", 76, Palette.BLUE, 34);
        avatar.setTextColor(android.graphics.Color.WHITE);
        card.addView(avatar, Ui.mlp(this, Ui.dp(this, 76), Ui.dp(this, 76), 0, 0, 16, 0));
        LinearLayout copy = Ui.vertical(this);
        copy.addView(Ui.text(this, "Height journey", 22, Palette.TEXT, Typeface.BOLD));
        copy.addView(Ui.text(this, "165.0 CM current height", 17, Palette.MUTED, Typeface.NORMAL));
        card.addView(copy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 22, 0, 18));
        return card;
    }

    private LinearLayout optionGroup(String label, List<ProfileOption> options) {
        LinearLayout card = Ui.card(this, 24);
        TextView heading = Ui.text(this, label, 20, Palette.BLUE, Typeface.BOLD);
        card.addView(heading, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 16));
        for (int i = 0; i < options.size(); i++) {
            ProfileOption option = options.get(i);
            View row = optionRow(option);
            card.addView(row);
            if (i < options.size() - 1) {
                card.addView(Ui.divider(this), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 1), 72, 12, 0, 12));
            }
        }
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 12, 0, 18));
        return card;
    }

    private View optionRow(ProfileOption option) {
        LinearLayout row = Ui.horizontal(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        TextView icon = Ui.icon(this, option.icon, 48, option.color, 24);
        icon.setTextColor(android.graphics.Color.WHITE);
        row.addView(icon, Ui.mlp(this, Ui.dp(this, 48), Ui.dp(this, 48), 0, 0, 18, 0));
        LinearLayout text = Ui.vertical(this);
        text.addView(Ui.text(this, option.title, 22, Palette.TEXT, Typeface.BOLD));
        if (!option.subtitle.isEmpty()) {
            text.addView(Ui.text(this, option.subtitle, 17, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 3, 0, 0));
        }
        row.addView(text, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        if ("Common questions".equals(option.title)) {
            row.setOnClickListener(v -> open(QaActivity.class));
        }
        return row;
    }
}

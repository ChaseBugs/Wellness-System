package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.QaItem;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.QaViewModel;

public class QaActivity extends BaseActivity {
    private QaViewModel viewModel;
    private LinearLayout list;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new QaViewModel(repository);

        LinearLayout content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 14), Ui.dp(this, 52), Ui.dp(this, 14), Ui.dp(this, 26));
        content.setBackgroundColor(android.graphics.Color.WHITE);

        LinearLayout header = Ui.horizontal(this);
        TextView back = Ui.text(this, "<", 36, android.graphics.Color.BLACK, Typeface.NORMAL);
        back.setGravity(Gravity.CENTER);
        back.setOnClickListener(v -> finish());
        header.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 54), Ui.dp(this, 54)));
        header.addView(Ui.title(this, "Common questions"), new LinearLayout.LayoutParams(0,
                ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        content.addView(header);

        LinearLayout tabs = Ui.horizontal(this);
        tabs.setGravity(Gravity.CENTER_VERTICAL);
        tabs.addView(Ui.chip(this, "WORKOUT", true), Ui.mlp(this, 0, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 30, 12, 28));
        ((LinearLayout.LayoutParams) tabs.getChildAt(0).getLayoutParams()).weight = 1;
        tabs.addView(Ui.chip(this, "APP", false), Ui.mlp(this, 0, ViewGroup.LayoutParams.WRAP_CONTENT, 12, 30, 0, 28));
        ((LinearLayout.LayoutParams) tabs.getChildAt(1).getLayoutParams()).weight = 1;
        content.addView(tabs);

        list = Ui.vertical(this);
        content.addView(list);
        addSection("ABOUT WORKOUT", false);
        addSection("ABOUT APP", true);

        TextView feedback = Ui.button(this, "Send feedback");
        content.addView(feedback, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 42, 24, 42, 0));

        setContentView(Ui.scroll(this, content));
    }

    private void addSection(String label, boolean appTopic) {
        list.addView(Ui.section(this, label));
        for (QaItem item : viewModel.getState()) {
            if (item.appTopic == appTopic) {
                list.addView(question(item));
            }
        }
    }

    private View question(QaItem item) {
        LinearLayout card = Ui.vertical(this);
        card.setBackground(Ui.bg(Palette.SOFT_GRAY, 6, this));
        card.setPadding(Ui.dp(this, 18), Ui.dp(this, 14), Ui.dp(this, 18), Ui.dp(this, 14));
        LinearLayout top = Ui.horizontal(this);
        TextView q = Ui.text(this, item.question, 23, Palette.TEXT, Typeface.BOLD);
        top.addView(q, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        TextView arrow = Ui.text(this, "⌄", 28, android.graphics.Color.rgb(155, 160, 174), Typeface.BOLD);
        top.addView(arrow);
        card.addView(top);

        TextView answer = Ui.text(this, item.answer, 16, Palette.MUTED, Typeface.NORMAL);
        answer.setVisibility(View.GONE);
        card.addView(answer, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 8, 0, 0));
        card.setOnClickListener(v -> answer.setVisibility(answer.getVisibility() == View.VISIBLE ? View.GONE : View.VISIBLE));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 5, 0, 5));
        return card;
    }
}

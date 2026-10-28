package com.heightincrease.app.ui;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;

public final class Ui {
    private Ui() {
    }

    public static int dp(Activity activity, int value) {
        return (int) (value * activity.getResources().getDisplayMetrics().density + 0.5f);
    }

    public static TextView text(Activity activity, String value, int sp, int color, int style) {
        TextView view = new TextView(activity);
        view.setText(value);
        view.setTextSize(sp);
        view.setTextColor(color);
        view.setTypeface(Typeface.DEFAULT, style);
        view.setIncludeFontPadding(true);
        return view;
    }

    public static TextView title(Activity activity, String value) {
        TextView view = text(activity, value, 28, Palette.TEXT, Typeface.BOLD);
        view.setLineSpacing(0, 0.96f);
        return view;
    }

    public static TextView section(Activity activity, String value) {
        TextView view = text(activity, value, 24, Palette.TEXT, Typeface.BOLD);
        view.setPadding(0, dp(activity, 18), 0, dp(activity, 8));
        return view;
    }

    public static GradientDrawable bg(int color, float radiusDp, Activity activity) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(dp(activity, (int) radiusDp));
        return drawable;
    }

    public static GradientDrawable strokeBg(int color, int strokeColor, int strokeDp, int radiusDp, Activity activity) {
        GradientDrawable drawable = bg(color, radiusDp, activity);
        drawable.setStroke(dp(activity, strokeDp), strokeColor);
        return drawable;
    }

    public static LinearLayout vertical(Activity activity) {
        LinearLayout layout = new LinearLayout(activity);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    public static LinearLayout horizontal(Activity activity) {
        LinearLayout layout = new LinearLayout(activity);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        layout.setGravity(Gravity.CENTER_VERTICAL);
        return layout;
    }

    public static LinearLayout card(Activity activity, int radiusDp) {
        LinearLayout card = vertical(activity);
        card.setBackground(bg(Palette.CARD, radiusDp, activity));
        card.setPadding(dp(activity, 20), dp(activity, 18), dp(activity, 20), dp(activity, 18));
        return card;
    }

    public static TextView button(Activity activity, String label) {
        TextView button = text(activity, label, 22, ColorCompat.WHITE, Typeface.BOLD);
        button.setGravity(Gravity.CENTER);
        button.setBackground(bg(Palette.BLUE, 34, activity));
        button.setPadding(dp(activity, 20), dp(activity, 16), dp(activity, 20), dp(activity, 16));
        return button;
    }

    public static TextView chip(Activity activity, String label, boolean selected) {
        TextView chip = text(activity, label, 20, selected ? ColorCompat.WHITE : Palette.TEXT, Typeface.BOLD);
        chip.setGravity(Gravity.CENTER);
        chip.setBackground(selected
                ? bg(Palette.BLUE, 26, activity)
                : strokeBg(ColorCompat.WHITE, Color.rgb(196, 196, 196), 1, 26, activity));
        chip.setPadding(dp(activity, 26), dp(activity, 12), dp(activity, 26), dp(activity, 12));
        return chip;
    }

    public static TextView icon(Activity activity, String icon, int sizeDp, int bgColor, int sp) {
        TextView view = text(activity, icon, sp, Palette.TEXT, Typeface.NORMAL);
        view.setGravity(Gravity.CENTER);
        view.setBackground(bg(bgColor, sizeDp / 4, activity));
        view.setMinWidth(dp(activity, sizeDp));
        view.setMinHeight(dp(activity, sizeDp));
        return view;
    }

    public static View spacer(Activity activity, int heightDp) {
        View view = new View(activity);
        view.setLayoutParams(new LinearLayout.LayoutParams(1, dp(activity, heightDp)));
        return view;
    }

    public static View divider(Activity activity) {
        View view = new View(activity);
        view.setBackgroundColor(Palette.DIVIDER);
        view.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(activity, 1)));
        return view;
    }

    public static ScrollView scroll(Activity activity, LinearLayout content) {
        ScrollView scrollView = new ScrollView(activity);
        scrollView.setFillViewport(false);
        scrollView.addView(content, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
        return scrollView;
    }

    public static ProgressBar progress(Activity activity, int value) {
        ProgressBar progressBar = new ProgressBar(activity, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgress(value);
        return progressBar;
    }

    public static FrameLayout imagePanel(Activity activity, int color, String icon) {
        FrameLayout panel = new FrameLayout(activity);
        panel.setBackground(bg(color, 8, activity));
        TextView glyph = text(activity, icon, 42, ColorCompat.WHITE, Typeface.NORMAL);
        glyph.setGravity(Gravity.CENTER);
        panel.addView(glyph, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        return panel;
    }

    public static LinearLayout.LayoutParams lp(int width, int height) {
        return new LinearLayout.LayoutParams(width, height);
    }

    public static LinearLayout.LayoutParams mlp(Activity activity, int width, int height, int l, int t, int r, int b) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(width, height);
        params.setMargins(dp(activity, l), dp(activity, t), dp(activity, r), dp(activity, b));
        return params;
    }

    public static final class ColorCompat {
        public static final int WHITE = android.graphics.Color.WHITE;

        private ColorCompat() {
        }
    }
}

package com.foodvisor.mobile.ui;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.Locale;

public final class Ui {
    private Ui() {}

    public static final int PAPER = Color.rgb(255, 255, 255);
    public static final int PAPER_DEEP = Color.rgb(244, 239, 230);
    public static final int CARD = Color.rgb(250, 248, 244);
    public static final int CARD_SOFT = Color.rgb(253, 251, 247);
    public static final int INK = Color.rgb(28, 22, 17);
    public static final int INK_2 = Color.rgb(78, 69, 60);
    public static final int INK_3 = Color.rgb(126, 116, 105);
    public static final int INK_4 = Color.rgb(178, 168, 157);
    public static final int RULE = Color.rgb(228, 220, 211);
    public static final int RULE_SOFT = Color.rgb(238, 232, 225);
    public static final int ACCENT = Color.rgb(214, 90, 49);
    public static final int ACCENT_LIGHT = Color.rgb(255, 198, 159);
    public static final int MOSS = Color.rgb(107, 142, 90);
    public static final int MOSS_LIGHT = Color.rgb(198, 226, 184);
    public static final int BERRY = Color.rgb(164, 70, 95);
    public static final int OCHRE = Color.rgb(196, 142, 45);
    public static final int DARK = Color.rgb(14, 12, 9);

    // 2025 design palette
    public static final int MINT_BG   = Color.rgb(210, 237, 228);
    public static final int BLUSH_BG  = Color.rgb(255, 236, 232);
    public static final int PEACH_BG  = Color.rgb(250, 240, 228);
    public static final int NAVY      = Color.rgb(27,  43,  58);
    public static final int SLATE     = Color.rgb(128, 148, 168);
    public static final int SURF      = Color.rgb(236, 242, 248);
    public static final int PINE      = Color.rgb(46,  156, 110);
    public static final int RULE2     = Color.rgb(218, 228, 236);
    public static final int TEAL_HDR  = Color.rgb(196, 226, 218);

    public static int dp(Context context, float value) {
        return (int) (value * context.getResources().getDisplayMetrics().density + 0.5f);
    }

    public static float sp(Context context, float value) {
        return value * context.getResources().getDisplayMetrics().scaledDensity;
    }

    public static void styleBars(Activity activity, int color, boolean light) {
        Window window = activity.getWindow();
        window.setStatusBarColor(color);
        window.setNavigationBarColor(color);
        if (light) {
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        } else {
            window.getDecorView().setSystemUiVisibility(0);
        }
    }

    public static LinearLayout screen(Context context, int color) {
        LinearLayout root = v(context);
        root.setBackgroundColor(color);
        root.setLayoutParams(new LinearLayout.LayoutParams(-1, -1));
        return root;
    }

    public static LinearLayout v(Context context) {
        LinearLayout view = new LinearLayout(context);
        view.setOrientation(LinearLayout.VERTICAL);
        return view;
    }

    public static LinearLayout h(Context context) {
        LinearLayout view = new LinearLayout(context);
        view.setOrientation(LinearLayout.HORIZONTAL);
        view.setGravity(Gravity.CENTER_VERTICAL);
        return view;
    }

    public static ScrollView scroll(Context context, LinearLayout content) {
        ScrollView scroll = new ScrollView(context);
        scroll.setFillViewport(false);
        scroll.setOverScrollMode(View.OVER_SCROLL_NEVER);
        scroll.addView(content, new ScrollView.LayoutParams(-1, -2));
        return scroll;
    }

    public static TextView text(Context context, String value, int sp, int color, int style) {
        TextView text = new TextView(context);
        text.setText(value);
        text.setTextSize(sp);
        text.setTextColor(color);
        text.setTypeface(Typeface.DEFAULT, style);
        text.setIncludeFontPadding(true);
        return text;
    }

    public static TextView title(Context context, String value, int sp) {
        TextView title = text(context, value, sp, INK, Typeface.BOLD);
        title.setLineSpacing(dp(context, 1), 1.0f);
        return title;
    }

    public static TextView cap(Context context, String value) {
        TextView cap = text(context, value.toUpperCase(Locale.US), 10, INK_3, Typeface.BOLD);
        cap.setLetterSpacing(0.13f);
        return cap;
    }

    public static TextView number(Context context, String value, int sp, int color) {
        TextView view = text(context, value, sp, color, Typeface.BOLD);
        view.setIncludeFontPadding(false);
        return view;
    }

    public static TextView chip(Context context, String value) {
        TextView chip = text(context, value, 12, INK_2, Typeface.BOLD);
        chip.setGravity(Gravity.CENTER);
        chip.setPadding(dp(context, 10), dp(context, 6), dp(context, 10), dp(context, 6));
        chip.setBackground(round(CARD, dp(context, 18), dp(context, 1), RULE_SOFT));
        return chip;
    }

    public static TextView activeChip(Context context, String value) {
        TextView chip = chip(context, value);
        chip.setTextColor(PAPER);
        chip.setBackground(round(INK, dp(context, 18), 0, INK));
        return chip;
    }

    public static TextView button(Context context, String value) {
        TextView button = text(context, value, 15, PAPER, Typeface.BOLD);
        button.setGravity(Gravity.CENTER);
        button.setPadding(dp(context, 16), 0, dp(context, 16), 0);
        button.setBackground(round(ACCENT, dp(context, 12), 0, ACCENT));
        return button;
    }

    public static TextView ghostButton(Context context, String value) {
        TextView button = text(context, value, 14, INK, Typeface.BOLD);
        button.setGravity(Gravity.CENTER);
        button.setPadding(dp(context, 16), 0, dp(context, 16), 0);
        button.setBackground(round(PAPER, dp(context, 12), dp(context, 1), RULE));
        return button;
    }

    public static LinearLayout card(Context context) {
        LinearLayout card = v(context);
        card.setPadding(dp(context, 14), dp(context, 14), dp(context, 14), dp(context, 14));
        card.setBackground(round(CARD, dp(context, 12), dp(context, 1), RULE_SOFT));
        return card;
    }

    public static LinearLayout darkCard(Context context) {
        LinearLayout card = card(context);
        card.setBackground(round(INK, dp(context, 14), 0, INK));
        return card;
    }

    public static GradientDrawable round(int color, float radius, int strokeWidth, int strokeColor) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(radius);
        if (strokeWidth > 0) {
            drawable.setStroke(strokeWidth, strokeColor);
        }
        return drawable;
    }

    public static LinearLayout.LayoutParams lp(int w, int h) {
        return new LinearLayout.LayoutParams(w, h);
    }

    public static LinearLayout.LayoutParams lpm(Context context, int w, int h, int left, int top, int right, int bottom) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(w, h);
        params.setMargins(dp(context, left), dp(context, top), dp(context, right), dp(context, bottom));
        return params;
    }

    public static LinearLayout.LayoutParams weight(Context context, int height, float weight, int left, int top, int right, int bottom) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, height, weight);
        params.setMargins(dp(context, left), dp(context, top), dp(context, right), dp(context, bottom));
        return params;
    }

    public static View spacer(Context context, int height) {
        View view = new View(context);
        view.setLayoutParams(new LinearLayout.LayoutParams(1, dp(context, height)));
        return view;
    }

    public static void go(Activity activity, Class<?> target) {
        activity.startActivity(new Intent(activity, target));
    }

    public static TextView iconButton(Context context, String value, boolean dark) {
        TextView view = text(context, value, 18, dark ? PAPER : INK, Typeface.BOLD);
        view.setGravity(Gravity.CENTER);
        int bg = dark ? Color.argb(32, 255, 255, 255) : CARD;
        int stroke = dark ? Color.TRANSPARENT : RULE_SOFT;
        view.setBackground(round(bg, dp(context, 18), dark ? 0 : dp(context, 1), stroke));
        return view;
    }

    public static void addStatusSpace(LinearLayout root, int heightDp) {
        root.addView(spacer(root.getContext(), heightDp));
    }

    public static LinearLayout row(Context context, String title, String sub, String value) {
        LinearLayout row = h(context);
        row.setPadding(dp(context, 14), dp(context, 11), dp(context, 14), dp(context, 11));
        LinearLayout copy = v(context);
        copy.addView(text(context, title, 13, INK, Typeface.BOLD));
        if (sub != null && !sub.isEmpty()) {
            TextView subText = text(context, sub, 10, INK_4, Typeface.NORMAL);
            subText.setPadding(0, dp(context, 2), 0, 0);
            copy.addView(subText);
        }
        row.addView(copy, new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(number(context, value, 16, INK_2));
        return row;
    }

    public static LinearLayout tabBar(Context context, String[] labels, int active) {
        LinearLayout tabs = h(context);
        tabs.setPadding(dp(context, 3), dp(context, 3), dp(context, 3), dp(context, 3));
        tabs.setBackground(round(PAPER_DEEP, dp(context, 10), 0, PAPER_DEEP));
        for (int i = 0; i < labels.length; i++) {
            TextView tab = text(context, labels[i].toUpperCase(Locale.US), 10, i == active ? INK : INK_3, Typeface.BOLD);
            tab.setGravity(Gravity.CENTER);
            tab.setLetterSpacing(0.08f);
            if (i == active) {
                tab.setBackground(round(PAPER, dp(context, 7), 0, PAPER));
            }
            tabs.addView(tab, new LinearLayout.LayoutParams(0, dp(context, 34), 1));
        }
        return tabs;
    }

    public static LinearLayout bottomNav(Context context, String active) {
        LinearLayout nav = h(context);
        nav.setGravity(Gravity.CENTER);
        nav.setPadding(dp(context, 8), dp(context, 6), dp(context, 8), dp(context, 6));
        nav.setBackgroundColor(PAPER);
        String[][] items = {
                {"today", "Today", "H"},
                {"diary", "Diary", "D"},
                {"scan", "Capture", "+"},
                {"insights", "Trends", "T"},
                {"profile", "You", "Y"},
        };
        for (String[] item : items) {
            boolean on = item[0].equals(active);
            LinearLayout cell = v(context);
            cell.setGravity(Gravity.CENTER);
            TextView icon = text(context, item[2], item[0].equals("scan") ? 22 : 18, on ? ACCENT : INK_3, Typeface.BOLD);
            icon.setGravity(Gravity.CENTER);
            if (item[0].equals("scan")) {
                icon.setTextColor(PAPER);
                icon.setBackground(round(ACCENT, dp(context, 20), 0, ACCENT));
                cell.addView(icon, new LinearLayout.LayoutParams(dp(context, 40), dp(context, 40)));
            } else {
                cell.addView(icon, new LinearLayout.LayoutParams(-1, dp(context, 24)));
            }
            TextView label = text(context, item[1], 10, on ? INK : INK_4, Typeface.BOLD);
            label.setGravity(Gravity.CENTER);
            cell.addView(label);
            nav.addView(cell, new LinearLayout.LayoutParams(0, -1, 1));
        }
        return nav;
    }

    public static HorizontalScrollView chipStrip(Context context, String[] labels, int active) {
        HorizontalScrollView scroll = new HorizontalScrollView(context);
        scroll.setHorizontalScrollBarEnabled(false);
        LinearLayout row = h(context);
        for (int i = 0; i < labels.length; i++) {
            TextView chip = i == active ? activeChip(context, labels[i]) : chip(context, labels[i]);
            row.addView(chip, lpm(context, -2, dp(context, 34), 0, 0, 7, 0));
        }
        scroll.addView(row);
        return scroll;
    }

    public static final class LogoMarkView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        public LogoMarkView(Context context) {
            super(context);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float r = Math.min(getWidth(), getHeight()) * 0.42f;
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(getContext(), 1));
            paint.setColor(ACCENT_LIGHT);
            canvas.drawCircle(cx, cy, r, paint);
            paint.setPathEffect(new android.graphics.DashPathEffect(new float[]{dp(getContext(), 2), dp(getContext(), 3)}, 0));
            canvas.drawCircle(cx, cy, r * 0.64f, paint);
            paint.setPathEffect(null);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(ACCENT);
            canvas.drawCircle(cx, cy, r * 0.26f, paint);
        }
    }

    public static final class WelcomeDialView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        public WelcomeDialView(Context context) {
            super(context);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float size = Math.min(getWidth(), getHeight());
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float r = size * 0.39f;
            paint.setStyle(Paint.Style.STROKE);
            paint.setColor(RULE);
            paint.setStrokeWidth(dp(getContext(), 1));
            canvas.drawCircle(cx, cy, r, paint);
            paint.setStrokeWidth(dp(getContext(), 6));
            paint.setColor(ACCENT);
            RectF arc = new RectF(cx - r, cy - r, cx + r, cy + r);
            canvas.drawArc(arc, -90, 145, false, paint);
            paint.setStrokeWidth(dp(getContext(), 1));
            paint.setColor(INK_4);
            for (int i = 0; i < 60; i++) {
                double a = (i / 60.0) * Math.PI * 2;
                float inner = r + dp(getContext(), 8);
                float outer = r + dp(getContext(), i % 5 == 0 ? 16 : 12);
                canvas.drawLine(cx + (float) Math.cos(a) * inner, cy + (float) Math.sin(a) * inner,
                        cx + (float) Math.cos(a) * outer, cy + (float) Math.sin(a) * outer, paint);
            }
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(CARD);
            canvas.drawCircle(cx, cy, r * 0.78f, paint);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(getContext(), 9));
            paint.setColor(INK_3);
            canvas.drawText("REMAINING", cx, cy - dp(getContext(), 18), paint);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(getContext(), 42));
            paint.setColor(INK);
            canvas.drawText("1,031", cx, cy + dp(getContext(), 20), paint);
            paint.setTextSize(sp(getContext(), 8));
            paint.setColor(INK_4);
            canvas.drawText("KCAL - TODAY", cx, cy + dp(getContext(), 42), paint);
        }
    }

    public static final class FoodArtView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final int mode;

        public FoodArtView(Context context, int mode) {
            super(context);
            this.mode = mode;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float size = Math.min(getWidth(), getHeight());
            float left = (getWidth() - size) / 2f;
            float top = (getHeight() - size) / 2f;
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(mode == 0 ? Color.rgb(219, 244, 240) : mode == 1 ? Color.rgb(255, 246, 230) : Color.rgb(249, 247, 236));
            canvas.drawRoundRect(new RectF(left, top, left + size, top + size), dp(getContext(), 28), dp(getContext(), 28), paint);
            if (mode == 0) {
                drawFruit(canvas, left + size * 0.32f, top + size * 0.32f, size * 0.13f, ACCENT);
                drawFruit(canvas, left + size * 0.70f, top + size * 0.34f, size * 0.15f, Color.rgb(194, 218, 48));
                drawLeafCluster(canvas, left + size * 0.32f, top + size * 0.70f, size * 0.17f);
                drawFruit(canvas, left + size * 0.70f, top + size * 0.70f, size * 0.15f, Color.rgb(247, 172, 75));
            } else if (mode == 1) {
                drawFruit(canvas, left + size * 0.34f, top + size * 0.34f, size * 0.15f, PAPER);
                paint.setColor(OCHRE);
                canvas.drawCircle(left + size * 0.34f, top + size * 0.34f, size * 0.06f, paint);
                drawFruit(canvas, left + size * 0.34f, top + size * 0.70f, size * 0.15f, Color.rgb(194, 218, 48));
                paint.setColor(Color.rgb(247, 172, 75));
                canvas.drawOval(new RectF(left + size * 0.52f, top + size * 0.25f, left + size * 0.88f, top + size * 0.83f), paint);
            } else {
                paint.setColor(INK);
                canvas.drawRoundRect(new RectF(left + size * 0.20f, top + size * 0.22f, left + size * 0.64f, top + size * 0.82f), dp(getContext(), 4), dp(getContext(), 4), paint);
                paint.setColor(Color.rgb(173, 222, 244));
                canvas.drawRect(left + size * 0.20f, top + size * 0.48f, left + size * 0.64f, top + size * 0.60f, paint);
                drawFruit(canvas, left + size * 0.75f, top + size * 0.62f, size * 0.17f, Color.rgb(194, 218, 48));
            }
        }

        private void drawFruit(Canvas canvas, float cx, float cy, float r, int color) {
            paint.setColor(color);
            canvas.drawCircle(cx, cy, r, paint);
            paint.setColor(MOSS);
            canvas.drawRoundRect(new RectF(cx + r * 0.05f, cy - r * 1.35f, cx + r * 0.55f, cy - r * 0.75f), dp(getContext(), 8), dp(getContext(), 8), paint);
        }

        private void drawLeafCluster(Canvas canvas, float cx, float cy, float r) {
            paint.setColor(MOSS);
            for (int i = 0; i < 9; i++) {
                double a = (Math.PI * 2 * i) / 9;
                canvas.drawCircle(cx + (float) Math.cos(a) * r * 0.45f, cy + (float) Math.sin(a) * r * 0.34f, r * 0.34f, paint);
            }
            canvas.drawCircle(cx, cy, r * 0.46f, paint);
        }
    }

    public static final class FoodGlyphView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final String kind;

        public FoodGlyphView(Context context, String kind) {
            super(context);
            this.kind = kind;
            setBackground(round(PAPER_DEEP, dp(context, 10), dp(context, 1), RULE_SOFT));
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float r = Math.min(getWidth(), getHeight()) * 0.24f;
            paint.setStyle(Paint.Style.FILL);
            if ("fish".equals(kind)) {
                paint.setColor(Color.rgb(96, 154, 180));
                canvas.drawOval(new RectF(cx - r * 1.2f, cy - r * 0.65f, cx + r * 1.2f, cy + r * 0.65f), paint);
                Path tail = new Path();
                tail.moveTo(cx + r, cy);
                tail.lineTo(cx + r * 1.8f, cy - r);
                tail.lineTo(cx + r * 1.8f, cy + r);
                tail.close();
                canvas.drawPath(tail, paint);
            } else if ("mug".equals(kind)) {
                paint.setColor(INK_2);
                canvas.drawRoundRect(new RectF(cx - r, cy - r, cx + r * 0.6f, cy + r), dp(getContext(), 6), dp(getContext(), 6), paint);
                paint.setStyle(Paint.Style.STROKE);
                paint.setStrokeWidth(dp(getContext(), 3));
                canvas.drawCircle(cx + r * 0.85f, cy, r * 0.42f, paint);
            } else if ("rice".equals(kind)) {
                paint.setColor(OCHRE);
                canvas.drawOval(new RectF(cx - r * 1.2f, cy - r * 0.7f, cx + r * 1.2f, cy + r * 0.9f), paint);
                paint.setColor(PAPER);
                canvas.drawCircle(cx - r * 0.35f, cy - r * 0.05f, r * 0.18f, paint);
                canvas.drawCircle(cx + r * 0.25f, cy + r * 0.1f, r * 0.18f, paint);
            } else if ("leaf".equals(kind)) {
                paint.setColor(MOSS);
                canvas.drawOval(new RectF(cx - r, cy - r * 1.2f, cx + r, cy + r * 1.2f), paint);
            } else {
                paint.setColor(ACCENT);
                canvas.drawCircle(cx, cy, r, paint);
                paint.setColor(MOSS);
                canvas.drawRoundRect(new RectF(cx, cy - r * 1.6f, cx + r * 0.55f, cy - r * 0.8f), dp(getContext(), 8), dp(getContext(), 8), paint);
            }
        }
    }

    public static final class CalorieRingView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private int consumed = 1256;
        private int target = 2287;
        private int burned = 320;

        public CalorieRingView(Context context) {
            super(context);
        }

        public void setValues(int consumed, int target, int burned) {
            this.consumed = consumed;
            this.target = target;
            this.burned = burned;
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float size = Math.min(getWidth(), getHeight());
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float r = size / 2f - dp(getContext(), 16);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(getContext(), 1));
            paint.setColor(INK_4);
            for (int i = 0; i < 40; i++) {
                double a = (i / 40.0) * Math.PI * 2 - Math.PI / 2;
                float inner = r + dp(getContext(), 6);
                float outer = r + dp(getContext(), i % 4 == 0 ? 12 : 9);
                canvas.drawLine(cx + (float) Math.cos(a) * inner, cy + (float) Math.sin(a) * inner,
                        cx + (float) Math.cos(a) * outer, cy + (float) Math.sin(a) * outer, paint);
            }
            paint.setStrokeWidth(dp(getContext(), 10));
            paint.setColor(PAPER_DEEP);
            canvas.drawCircle(cx, cy, r, paint);
            paint.setColor(ACCENT);
            RectF arc = new RectF(cx - r, cy - r, cx + r, cy + r);
            canvas.drawArc(arc, -90, Math.min(360, consumed * 360f / Math.max(1, target)), false, paint);
            int remaining = Math.max(0, target - consumed + burned);
            paint.setStyle(Paint.Style.FILL);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(getContext(), 10));
            paint.setColor(INK_3);
            canvas.drawText("REMAINING", cx, cy - dp(getContext(), 26), paint);
            paint.setTextSize(sp(getContext(), 50));
            paint.setColor(INK);
            canvas.drawText(String.format(Locale.US, "%,d", remaining), cx, cy + dp(getContext(), 18), paint);
            paint.setTextSize(sp(getContext(), 11));
            paint.setColor(INK_3);
            canvas.drawText(consumed + " of " + target + " kcal", cx, cy + dp(getContext(), 44), paint);
        }
    }

    public static final class SparklineView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final float[] values;
        private final int color;

        public SparklineView(Context context, float[] values, int color) {
            super(context);
            this.values = values;
            this.color = color;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            if (values.length < 2) return;
            float min = values[0], max = values[0];
            for (float v : values) {
                min = Math.min(min, v);
                max = Math.max(max, v);
            }
            float range = Math.max(1f, max - min);
            Path line = new Path();
            Path area = new Path();
            for (int i = 0; i < values.length; i++) {
                float x = i * (getWidth() / (float) (values.length - 1));
                float y = getHeight() - ((values[i] - min) / range) * (getHeight() - dp(getContext(), 8)) - dp(getContext(), 4);
                if (i == 0) {
                    line.moveTo(x, y);
                    area.moveTo(x, y);
                } else {
                    line.lineTo(x, y);
                    area.lineTo(x, y);
                }
            }
            area.lineTo(getWidth(), getHeight());
            area.lineTo(0, getHeight());
            area.close();
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(28, Color.red(color), Color.green(color), Color.blue(color)));
            canvas.drawPath(area, paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(getContext(), 2));
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeJoin(Paint.Join.ROUND);
            paint.setColor(color);
            canvas.drawPath(line, paint);
            paint.setStyle(Paint.Style.FILL);
            canvas.drawCircle(getWidth() - dp(getContext(), 2), dp(getContext(), 4), dp(getContext(), 3), paint);
        }
    }

    public static final class BarChartView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final float[] values;
        private final String[] labels;
        private final float target;

        public BarChartView(Context context, float[] values, String[] labels, float target) {
            super(context);
            this.values = values;
            this.labels = labels;
            this.target = target;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float chartH = getHeight() - dp(getContext(), labels == null ? 0 : 18);
            float max = Math.max(target, 1);
            for (float value : values) max = Math.max(max, value);
            float gap = dp(getContext(), 4);
            float bw = (getWidth() - gap * (values.length - 1)) / values.length;
            if (target > 0) {
                float y = chartH - (target / max) * chartH;
                paint.setStyle(Paint.Style.STROKE);
                paint.setStrokeWidth(dp(getContext(), 1));
                paint.setColor(ACCENT);
                paint.setPathEffect(new android.graphics.DashPathEffect(new float[]{dp(getContext(), 3), dp(getContext(), 3)}, 0));
                canvas.drawLine(0, y, getWidth(), y, paint);
                paint.setPathEffect(null);
            }
            paint.setStyle(Paint.Style.FILL);
            for (int i = 0; i < values.length; i++) {
                float h = (values[i] / max) * chartH;
                float x = i * (bw + gap);
                paint.setColor(target > 0 && values[i] > target ? ACCENT : INK);
                canvas.drawRoundRect(new RectF(x, chartH - h, x + bw, chartH), dp(getContext(), 2), dp(getContext(), 2), paint);
                if (labels != null) {
                    paint.setTextAlign(Paint.Align.CENTER);
                    paint.setTypeface(Typeface.DEFAULT_BOLD);
                    paint.setTextSize(sp(getContext(), 9));
                    paint.setColor(INK_4);
                    canvas.drawText(labels[i], x + bw / 2f, getHeight() - dp(getContext(), 4), paint);
                }
            }
        }
    }

    public static final class MacroDonutView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        public MacroDonutView(Context context) {
            super(context);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float size = Math.min(getWidth(), getHeight());
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float r = size / 2f - dp(getContext(), 12);
            RectF arc = new RectF(cx - r, cy - r, cx + r, cy + r);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(getContext(), 13));
            paint.setColor(PAPER_DEEP);
            canvas.drawCircle(cx, cy, r, paint);
            int[] colors = {BERRY, OCHRE, ACCENT};
            float[] angles = {95, 170, 82};
            float start = -90;
            for (int i = 0; i < colors.length; i++) {
                paint.setColor(colors[i]);
                canvas.drawArc(arc, start, angles[i], false, paint);
                start += angles[i];
            }
            paint.setStyle(Paint.Style.FILL);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(getContext(), 14));
            paint.setColor(INK);
            canvas.drawText("1,943", cx, cy + dp(getContext(), 1), paint);
            paint.setTextSize(sp(getContext(), 8));
            paint.setColor(INK_4);
            canvas.drawText("KCAL", cx, cy + dp(getContext(), 16), paint);
        }
    }

    public static final class ImageSlotView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final String label;

        public ImageSlotView(Context context, String label) {
            super(context);
            this.label = label;
            setBackground(round(PAPER_DEEP, dp(context, 14), dp(context, 1), RULE));
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            paint.setColor(Color.argb(40, 214, 90, 49));
            paint.setStrokeWidth(dp(getContext(), 10));
            for (int x = -getHeight(); x < getWidth(); x += dp(getContext(), 28)) {
                canvas.drawLine(x, getHeight(), x + getHeight(), 0, paint);
            }
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(getContext(), 11));
            paint.setColor(INK_4);
            canvas.drawText(label, getWidth() / 2f, getHeight() / 2f, paint);
        }
    }

    public static final class BarcodeScannerView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        public BarcodeScannerView(Context context) {
            super(context);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(13, 10, 7));
            canvas.drawRect(0, 0, getWidth(), getHeight(), paint);
            paint.setColor(Color.rgb(44, 34, 23));
            canvas.drawCircle(getWidth() / 2f, getHeight() * 0.38f, getWidth() * 0.45f, paint);
            paint.setColor(Color.argb(160, 244, 239, 230));
            float left = getWidth() * 0.20f;
            float top = getHeight() * 0.26f;
            for (int i = 0; i < 34; i++) {
                float x = left + i * dp(getContext(), 5);
                float w = dp(getContext(), i % 3 == 0 ? 3 : 1);
                canvas.drawRect(x, top, x + w, top + dp(getContext(), 95), paint);
            }
            RectF frame = new RectF(getWidth() * 0.12f, getHeight() * 0.22f, getWidth() * 0.88f, getHeight() * 0.45f);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(getContext(), 2));
            paint.setColor(ACCENT);
            canvas.drawRoundRect(frame, dp(getContext(), 14), dp(getContext(), 14), paint);
            paint.setStrokeWidth(dp(getContext(), 2));
            canvas.drawLine(frame.left + dp(getContext(), 12), frame.centerY(), frame.right - dp(getContext(), 12), frame.centerY(), paint);
        }
    }

    public static final class PhotoDetectionView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        public PhotoDetectionView(Context context) {
            super(context);
            setBackground(round(PAPER_DEEP, dp(context, 14), dp(context, 1), RULE));
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            paint.setColor(Color.argb(45, 107, 142, 90));
            canvas.drawRect(0, 0, getWidth(), getHeight(), paint);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(241, 232, 210));
            canvas.drawOval(new RectF(getWidth() * 0.16f, getHeight() * 0.18f, getWidth() * 0.84f, getHeight() * 0.88f), paint);
            drawBox(canvas, "A - Rice", 0.30f, 0.58f, 92, 52);
            drawBox(canvas, "B - Veg", 0.62f, 0.42f, 82, 42);
            drawBox(canvas, "C - Tofu", 0.55f, 0.72f, 76, 42);
        }

        private void drawBox(Canvas canvas, String label, float px, float py, int wDp, int hDp) {
            float w = dp(getContext(), wDp);
            float h = dp(getContext(), hDp);
            float x = getWidth() * px - w / 2f;
            float y = getHeight() * py - h / 2f;
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(getContext(), 2));
            paint.setColor(ACCENT);
            canvas.drawRoundRect(new RectF(x, y, x + w, y + h), dp(getContext(), 4), dp(getContext(), 4), paint);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(ACCENT);
            RectF labelBg = new RectF(x, y - dp(getContext(), 18), x + dp(getContext(), 72), y);
            canvas.drawRoundRect(labelBg, dp(getContext(), 4), dp(getContext(), 4), paint);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(getContext(), 9));
            paint.setColor(PAPER);
            canvas.drawText(label, x + dp(getContext(), 6), y - dp(getContext(), 5), paint);
        }
    }

    public static FrameLayout overlayRoot(Context context, int color) {
        FrameLayout root = new FrameLayout(context);
        root.setBackgroundColor(color);
        return root;
    }

    // ── 2025 redesign primitives ─────────────────────────────────────────────

    public static TextView pillBadge(Context context, String label, int bg, int fg) {
        TextView t = text(context, label, 12, fg, Typeface.BOLD);
        t.setPadding(dp(context, 14), dp(context, 7), dp(context, 14), dp(context, 7));
        t.setBackground(round(bg, dp(context, 20), 0, bg));
        return t;
    }

    public static TextView bigButton(Context context, String label) {
        TextView t = text(context, label, 16, PAPER, Typeface.BOLD);
        t.setGravity(Gravity.CENTER);
        t.setBackground(round(NAVY, dp(context, 32), 0, NAVY));
        return t;
    }

    public static TextView backCircle(Context context) {
        TextView t = text(context, "←", 18, NAVY, Typeface.BOLD);
        t.setGravity(Gravity.CENTER);
        t.setBackground(round(SURF, dp(context, 26), 0, SURF));
        return t;
    }

    public static LinearLayout optionPill(Context context, String label, boolean active) {
        LinearLayout row = h(context);
        row.setPadding(dp(context, 20), dp(context, 18), dp(context, 20), dp(context, 18));
        int bg = active ? PINE : SURF;
        row.setBackground(round(bg, dp(context, 14), active ? 0 : dp(context, 1), RULE2));
        row.addView(text(context, label, 16, active ? PAPER : NAVY, Typeface.NORMAL),
                new LinearLayout.LayoutParams(0, -2, 1));
        return row;
    }

    public static LinearLayout checkRow(Context context, String label, boolean checked) {
        LinearLayout row = h(context);
        row.setPadding(dp(context, 20), dp(context, 20), dp(context, 20), dp(context, 20));
        row.setBackground(round(SURF, dp(context, 14), dp(context, 1), RULE2));
        row.addView(text(context, label, 16, NAVY, Typeface.NORMAL),
                new LinearLayout.LayoutParams(0, -2, 1));
        int bs = dp(context, 24);
        LinearLayout box = v(context);
        box.setGravity(Gravity.CENTER);
        if (checked) {
            box.setBackground(round(NAVY, dp(context, 6), 0, NAVY));
            box.addView(text(context, "✓", 11, PAPER, Typeface.BOLD), lp(bs, bs));
        } else {
            box.setBackground(round(PAPER, dp(context, 6), dp(context, 1), RULE2));
            box.addView(new View(context), lp(bs, bs));
        }
        row.addView(box, lp(bs, bs));
        return row;
    }

    public static android.widget.EditText numInput(Context context, String hint) {
        android.widget.EditText et = new android.widget.EditText(context);
        et.setHint(hint);
        et.setTextSize(28);
        et.setTextColor(NAVY);
        et.setHintTextColor(SLATE);
        et.setTypeface(Typeface.DEFAULT_BOLD);
        et.setBackground(round(PEACH_BG, dp(context, 14), 0, PEACH_BG));
        et.setPadding(dp(context, 20), dp(context, 18), dp(context, 20), dp(context, 18));
        et.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        et.setSingleLine(true);
        return et;
    }

    public static LinearLayout segmentedProgress(Context context, int sections, int filled) {
        LinearLayout row = h(context);
        for (int i = 0; i < sections; i++) {
            View bar = new View(context);
            bar.setBackground(round(i < filled ? PINE : RULE2, dp(context, 2), 0, PINE));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(context, 4), 1);
            if (i > 0) lp.leftMargin = dp(context, 4);
            row.addView(bar, lp);
        }
        return row;
    }

    public static LinearLayout tabToggle(Context context, String[] labels, int active) {
        LinearLayout row = h(context);
        row.setBackground(round(SURF, dp(context, 24), dp(context, 1), RULE2));
        row.setPadding(dp(context, 3), dp(context, 3), dp(context, 3), dp(context, 3));
        for (int i = 0; i < labels.length; i++) {
            TextView t = text(context, labels[i], 13, i == active ? PAPER : SLATE, Typeface.BOLD);
            t.setGravity(Gravity.CENTER);
            if (i == active) t.setBackground(round(NAVY, dp(context, 22), 0, NAVY));
            row.addView(t, new LinearLayout.LayoutParams(0, dp(context, 36), 1));
        }
        return row;
    }

    public static LinearLayout bottomNav3(Context context, String active) {
        LinearLayout nav = h(context);
        nav.setGravity(Gravity.CENTER);
        nav.setBackgroundColor(PAPER);
        nav.setPadding(0, dp(context, 6), 0, dp(context, 6));
        String[][] items = {{"coach", "Coach"}, {"journal", "Journal"}, {"profile", "Profile"}};
        for (String[] item : items) {
            boolean on = item[0].equals(active);
            LinearLayout cell = v(context);
            cell.setGravity(Gravity.CENTER);
            cell.setPadding(0, dp(context, 4), 0, dp(context, 4));
            cell.addView(new NavIconView(context, item[0], on),
                    new LinearLayout.LayoutParams(dp(context, 26), dp(context, 26)));
            TextView label = text(context, item[1], 10, on ? NAVY : SLATE, Typeface.BOLD);
            label.setGravity(Gravity.CENTER);
            cell.addView(label, lpm(context, -1, -2, 0, 3, 0, 0));
            nav.addView(cell, new LinearLayout.LayoutParams(0, -1, 1));
        }
        return nav;
    }

    public static final class NavIconView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final String kind;
        private final boolean on;

        public NavIconView(Context context, String kind, boolean on) {
            super(context);
            this.kind = kind;
            this.on = on;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float w = getWidth(), h = getHeight();
            float cx = w / 2f, cy = h / 2f;
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeJoin(Paint.Join.ROUND);
            paint.setColor(on ? NAVY : SLATE);
            paint.setStrokeWidth(dp(getContext(), on ? 2.2f : 1.8f));
            if ("coach".equals(kind)) {
                // house icon
                float s = w * 0.38f;
                Path p = new Path();
                p.moveTo(cx - s, cy + s * 0.3f);
                p.lineTo(cx, cy - s);
                p.lineTo(cx + s, cy + s * 0.3f);
                p.lineTo(cx + s, cy + s);
                p.lineTo(cx - s, cy + s);
                p.close();
                canvas.drawPath(p, paint);
            } else if ("journal".equals(kind)) {
                // note/diary icon
                float s = w * 0.36f;
                canvas.drawRoundRect(new RectF(cx - s, cy - s, cx + s, cy + s),
                        dp(getContext(), 3), dp(getContext(), 3), paint);
                paint.setStrokeWidth(dp(getContext(), 1.5f));
                canvas.drawLine(cx - s * 0.5f, cy - s * 0.3f, cx + s * 0.5f, cy - s * 0.3f, paint);
                canvas.drawLine(cx - s * 0.5f, cy + s * 0.05f, cx + s * 0.5f, cy + s * 0.05f, paint);
                canvas.drawLine(cx - s * 0.5f, cy + s * 0.4f, cx + s * 0.2f, cy + s * 0.4f, paint);
            } else {
                // profile icon: circle + body
                float r = w * 0.22f;
                canvas.drawCircle(cx, cy - r * 0.6f, r, paint);
                RectF body = new RectF(cx - w * 0.38f, cy + r * 0.4f, cx + w * 0.38f, cy + h * 0.5f);
                canvas.drawArc(body, 180, 180, false, paint);
            }
        }
    }

    public static final class AvoMascotView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final int mood; // 0=happy 1=excited 2=relax

        public AvoMascotView(Context context, int mood) {
            super(context);
            this.mood = mood;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float w = getWidth(), h = getHeight();
            float cx = w / 2f;
            float bw = w * 0.36f, bh = h * 0.60f;
            float by = h * 0.54f; // body center Y

            // outer body (dark green)
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(58, 140, 82));
            canvas.drawOval(new RectF(cx - bw, by - bh * 0.56f, cx + bw, by + bh * 0.44f), p);

            // head highlight (lighter green)
            p.setColor(Color.rgb(78, 170, 102));
            canvas.drawOval(new RectF(cx - bw * 0.82f, by - bh * 0.62f, cx + bw * 0.82f, by - bh * 0.04f), p);

            // belly (yellow)
            p.setColor(Color.rgb(248, 196, 60));
            canvas.drawOval(new RectF(cx - bw * 0.44f, by - bh * 0.16f, cx + bw * 0.44f, by + bh * 0.30f), p);

            // face
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeCap(Paint.Cap.ROUND);
            p.setColor(Color.rgb(30, 80, 40));
            p.setStrokeWidth(dp(getContext(), 2.2f));
            float ey = by - bh * 0.30f;
            float ex = bw * 0.30f;
            float er = dp(getContext(), 6);
            if (mood == 1) {
                // excited: ^ ^ eyes
                p.setStyle(Paint.Style.FILL);
                canvas.drawCircle(cx - ex, ey, dp(getContext(), 3.5f), p);
                canvas.drawCircle(cx + ex, ey, dp(getContext(), 3.5f), p);
                p.setStyle(Paint.Style.STROKE);
            } else {
                // happy arcs ^^
                canvas.drawArc(new RectF(cx - ex - er, ey - er, cx - ex + er, ey + er), 200, -160, false, p);
                canvas.drawArc(new RectF(cx + ex - er, ey - er, cx + ex + er, ey + er), 200, -160, false, p);
            }
            // smile
            float sy = by - bh * 0.08f;
            float sr = bw * 0.28f;
            canvas.drawArc(new RectF(cx - sr, sy - sr * 0.5f, cx + sr, sy + sr * 0.5f), 20, 140, false, p);

            // arms if excited
            if (mood == 1) {
                p.setStrokeWidth(dp(getContext(), 5f));
                canvas.drawLine(cx - bw, by - bh * 0.18f, cx - bw * 1.6f, by - bh * 0.52f, p);
                canvas.drawLine(cx + bw, by - bh * 0.18f, cx + bw * 1.6f, by - bh * 0.52f, p);
            }
        }
    }

    public static final class OnboardFoodView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final int variant; // 0=fruits, 1=breakfast, 2=chart

        public OnboardFoodView(Context context, int variant) {
            super(context);
            this.variant = variant;
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float w = getWidth(), h = getHeight();
            float pad = dp(getContext(), 18);
            RectF card = new RectF(pad, pad, w - pad, h - pad);
            // card background
            p.setStyle(Paint.Style.FILL);
            p.setColor(variant == 0 ? Color.rgb(212, 240, 232) : variant == 1 ? Color.rgb(255, 235, 230) : PAPER);
            canvas.drawRoundRect(card, dp(getContext(), 22), dp(getContext(), 22), p);

            float cx = w / 2f, cy = h / 2f;
            if (variant == 0) {
                drawApple(canvas, cx - w * 0.18f, cy - h * 0.14f, h * 0.16f, Color.rgb(214, 80, 48));
                drawPear(canvas,  cx + w * 0.18f, cy - h * 0.14f, h * 0.16f);
                drawBroccoli(canvas, cx - w * 0.18f, cy + h * 0.14f, h * 0.16f);
                drawOrange(canvas,  cx + w * 0.18f, cy + h * 0.14f, h * 0.16f);
            } else if (variant == 1) {
                // egg + kiwi + bread
                drawEgg(canvas, cx - w * 0.18f, cy - h * 0.10f, h * 0.17f);
                drawBread(canvas, cx + w * 0.16f, cy, h * 0.22f);
                drawKiwi(canvas, cx - w * 0.18f, cy + h * 0.14f, h * 0.14f);
            } else {
                // simple weight-loss curve chart
                drawChart(canvas, card);
            }
        }

        private void drawApple(Canvas canvas, float x, float y, float r, int color) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            canvas.drawCircle(x, y, r, p);
            p.setColor(Color.rgb(80, 130, 50));
            RectF stem = new RectF(x + r * 0.1f, y - r * 1.4f, x + r * 0.45f, y - r * 0.85f);
            canvas.drawRoundRect(stem, dp(getContext(), 4), dp(getContext(), 4), p);
        }

        private void drawPear(Canvas canvas, float x, float y, float r) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(180, 210, 50));
            canvas.drawOval(new RectF(x - r * 0.7f, y - r * 1.2f, x + r * 0.7f, y + r * 0.6f), p);
            canvas.drawCircle(x, y + r * 0.2f, r * 0.7f, p);
            p.setColor(Color.rgb(100, 80, 40));
            canvas.drawLine(x, y - r * 1.2f, x + r * 0.3f, y - r * 1.6f, p);
        }

        private void drawBroccoli(Canvas canvas, float x, float y, float r) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(50, 100, 40));
            for (int i = 0; i < 7; i++) {
                double a = Math.PI * 2 * i / 7;
                canvas.drawCircle(x + (float) Math.cos(a) * r * 0.5f,
                        y + (float) Math.sin(a) * r * 0.4f, r * 0.4f, p);
            }
            canvas.drawCircle(x, y, r * 0.5f, p);
            p.setColor(Color.rgb(180, 140, 40));
            RectF stem = new RectF(x - r * 0.15f, y + r * 0.4f, x + r * 0.15f, y + r);
            canvas.drawRoundRect(stem, dp(getContext(), 4), dp(getContext(), 4), p);
        }

        private void drawOrange(Canvas canvas, float x, float y, float r) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(240, 160, 50));
            canvas.drawCircle(x, y, r, p);
            p.setColor(Color.rgb(60, 120, 40));
            RectF stem = new RectF(x + r * 0.1f, y - r * 1.3f, x + r * 0.4f, y - r * 0.85f);
            canvas.drawRoundRect(stem, dp(getContext(), 4), dp(getContext(), 4), p);
        }

        private void drawEgg(Canvas canvas, float x, float y, float r) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(PAPER);
            canvas.drawOval(new RectF(x - r, y - r * 1.2f, x + r, y + r), p);
            p.setColor(Color.rgb(240, 160, 50));
            canvas.drawCircle(x, y, r * 0.45f, p);
        }

        private void drawBread(Canvas canvas, float x, float y, float r) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(220, 160, 70));
            canvas.drawOval(new RectF(x - r * 0.55f, y - r * 1.2f, x + r * 0.55f, y + r * 1.2f), p);
            p.setColor(Color.rgb(200, 140, 55));
            for (int i = 0; i < 4; i++) {
                float ey = y - r * 0.7f + i * r * 0.48f;
                canvas.drawOval(new RectF(x - r * 0.28f, ey - r * 0.1f, x + r * 0.28f, ey + r * 0.1f), p);
            }
        }

        private void drawKiwi(Canvas canvas, float x, float y, float r) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(120, 175, 60));
            canvas.drawCircle(x, y, r, p);
            p.setColor(PAPER);
            canvas.drawCircle(x, y, r * 0.2f, p);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(dp(getContext(), 1.2f));
            p.setColor(Color.rgb(80, 120, 40));
            for (int i = 0; i < 8; i++) {
                double a = Math.PI * 2 * i / 8;
                canvas.drawLine(x + (float) Math.cos(a) * r * 0.22f,
                        y + (float) Math.sin(a) * r * 0.22f,
                        x + (float) Math.cos(a) * r * 0.88f,
                        y + (float) Math.sin(a) * r * 0.88f, p);
            }
        }

        private void drawChart(Canvas canvas, RectF card) {
            float l = card.left + dp(getContext(), 18);
            float r = card.right - dp(getContext(), 18);
            float t = card.top + dp(getContext(), 18);
            float b = card.bottom - dp(getContext(), 18);
            // gentle U-shaped curve
            float[] pts = {0f, 0.35f, 0.15f, 0.7f, 0.35f, 0.88f, 0.65f, 0.55f, 0.85f, 0.22f, 1f, 0f};
            Path fill = new Path(), line = new Path();
            for (int i = 0; i < pts.length; i += 2) {
                float px = l + pts[i] * (r - l);
                float py = b - pts[i + 1] * (b - t);
                if (i == 0) { fill.moveTo(px, py); line.moveTo(px, py); }
                else         { fill.lineTo(px, py); line.lineTo(px, py); }
            }
            fill.lineTo(r, b); fill.lineTo(l, b); fill.close();
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.argb(30, 100, 160, 220));
            canvas.drawPath(fill, p);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(dp(getContext(), 2));
            p.setStrokeCap(Paint.Cap.ROUND);
            p.setStrokeJoin(Paint.Join.ROUND);
            p.setColor(Color.rgb(150, 170, 210));
            canvas.drawPath(line, p);
            // endpoints
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(150, 170, 210));
            canvas.drawCircle(l, b - 0.35f * (b - t), dp(getContext(), 5), p);
            canvas.drawCircle(r, b, dp(getContext(), 5), p);
        }
    }

    public static final class JournalCalorieHeaderView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private int eaten = 0, burned = 0, goal = 1869;

        public JournalCalorieHeaderView(Context context) {
            super(context);
            setBackgroundColor(SURF);
        }

        public void setValues(int eaten, int burned, int goal) {
            this.eaten = eaten; this.burned = burned; this.goal = goal;
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float w = getWidth(), h = getHeight();
            int left = Math.max(0, goal - eaten + burned);
            // centre pill
            float ph = h * 0.48f, pw = w * 0.46f;
            float cx = w / 2f, cy = h * 0.40f;
            p.setStyle(Paint.Style.FILL);
            p.setColor(PAPER);
            canvas.drawRoundRect(new RectF(cx - pw, cy - ph / 2f, cx + pw, cy + ph / 2f),
                    ph / 2f, ph / 2f, p);
            p.setTextAlign(Paint.Align.CENTER);
            p.setTypeface(Typeface.DEFAULT_BOLD);
            p.setColor(NAVY);
            p.setTextSize(sp(getContext(), 28));
            canvas.drawText(String.valueOf(left), cx, cy, p);
            p.setTextSize(sp(getContext(), 10));
            p.setColor(SLATE);
            canvas.drawText("Cal left", cx, cy + dp(getContext(), 16), p);
            // eaten
            p.setTextAlign(Paint.Align.CENTER);
            p.setColor(NAVY);
            p.setTextSize(sp(getContext(), 18));
            p.setTypeface(Typeface.DEFAULT_BOLD);
            canvas.drawText(String.valueOf(eaten), w * 0.14f, cy - dp(getContext(), 4), p);
            p.setTextSize(sp(getContext(), 10));
            p.setColor(SLATE);
            canvas.drawText("Eaten", w * 0.14f, cy + dp(getContext(), 14), p);
            // burned
            canvas.drawText(String.valueOf(burned), w * 0.86f, cy - dp(getContext(), 4), p);
            p.setTextSize(sp(getContext(), 10));
            canvas.drawText("Burned", w * 0.86f, cy + dp(getContext(), 14), p);
            // macro bars
            float barY = h * 0.80f, barH = dp(getContext(), 4);
            String[] macros = {"Protein", "Fat", "Carbs", "Fiber"};
            int[] colors = {BERRY, OCHRE, PINE, MOSS};
            float bw = (w - dp(getContext(), 32)) / 4f;
            for (int i = 0; i < 4; i++) {
                float bx = dp(getContext(), 16) + i * bw;
                p.setStyle(Paint.Style.FILL);
                p.setColor(Color.argb(60, Color.red(colors[i]), Color.green(colors[i]), Color.blue(colors[i])));
                canvas.drawRoundRect(new RectF(bx, barY, bx + bw - dp(getContext(), 8), barY + barH),
                        barH / 2f, barH / 2f, p);
                p.setTextAlign(Paint.Align.CENTER);
                p.setTextSize(sp(getContext(), 9));
                p.setColor(SLATE);
                p.setTypeface(Typeface.DEFAULT_BOLD);
                canvas.drawText(macros[i], bx + (bw - dp(getContext(), 8)) / 2f,
                        barY + barH + dp(getContext(), 12), p);
            }
        }
    }

    public static final class CampSceneView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        public CampSceneView(Context context) { super(context); }

        @Override
        protected void onDraw(Canvas canvas) {
            float w = getWidth(), h = getHeight();
            float grassY = h * 0.52f;
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(191, 217, 47));
            canvas.drawRect(0, grassY, w, h * 0.68f, paint);
            drawTree(canvas, w * 0.07f, grassY, 0.75f, h);
            drawTree(canvas, w * 0.15f, grassY - dp(getContext(), 4), 1.08f, h);
            drawTree(canvas, w * 0.25f, grassY, 0.78f, h);
            drawTree(canvas, w * 0.87f, grassY, 1.05f, h);
            drawTree(canvas, w * 0.96f, grassY, 0.74f, h);
            drawTent(canvas, w * 0.65f, grassY, h);
            drawFire(canvas, w * 0.50f, grassY, h);
            // water reflections
            paint.setColor(Color.rgb(200, 236, 252));
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeWidth(dp(getContext(), 10));
            canvas.drawLine(w * 0.10f, h * 0.76f, w * 0.92f, h * 0.76f, paint);
            paint.setStrokeWidth(dp(getContext(), 8));
            canvas.drawLine(w * 0.20f, h * 0.88f, w * 0.82f, h * 0.88f, paint);
        }

        private void drawTree(Canvas canvas, float x, float baseY, float scale, float h) {
            paint.setColor(Color.rgb(82, 123, 39));
            float s = dp(getContext(), 44) * scale;
            drawTriangle(canvas, x, baseY - s, x - s * 0.44f, baseY, x + s * 0.44f, baseY);
            drawTriangle(canvas, x, baseY - s * 0.60f, x - s * 0.58f, baseY + s * 0.25f, x + s * 0.58f, baseY + s * 0.25f);
        }

        private void drawTriangle(Canvas canvas, float x1, float y1, float x2, float y2, float x3, float y3) {
            Path p = new Path();
            p.moveTo(x1, y1); p.lineTo(x2, y2); p.lineTo(x3, y3); p.close();
            canvas.drawPath(p, paint);
        }

        private void drawTent(Canvas canvas, float x, float y, float h) {
            paint.setColor(Color.rgb(244, 173, 75));
            drawTriangle(canvas, x - dp(getContext(), 34), y, x, y - dp(getContext(), 54), x + dp(getContext(), 52), y);
            paint.setColor(Color.rgb(77, 49, 36));
            drawTriangle(canvas, x, y - dp(getContext(), 50), x + dp(getContext(), 16), y, x - dp(getContext(), 6), y);
        }

        private void drawFire(Canvas canvas, float x, float y, float h) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(255, 178, 69));
            canvas.drawOval(new RectF(x - dp(getContext(), 11), y - dp(getContext(), 6), x + dp(getContext(), 12), y + dp(getContext(), 28)), paint);
            paint.setColor(Color.rgb(255, 242, 96));
            canvas.drawOval(new RectF(x - dp(getContext(), 5), y + dp(getContext(), 8), x + dp(getContext(), 8), y + dp(getContext(), 29)), paint);
        }
    }

    public static final class WeightChartView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private float[] weights = {60f};
        private float goal = 65f;

        public WeightChartView(Context context) { super(context); }

        public void setData(float[] weights, float goal) {
            this.weights = weights; this.goal = goal; invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            float w = getWidth(), h = getHeight();
            float lp = dp(getContext(), 42), rp = dp(getContext(), 16);
            float tp = dp(getContext(), 16), bp = dp(getContext(), 16);
            float cw = w - lp - rp, ch = h - tp - bp;
            float minVal = goal, maxVal = goal;
            for (float v : weights) { minVal = Math.min(minVal, v); maxVal = Math.max(maxVal, v); }
            float range = Math.max(maxVal - minVal + 20, 40);
            minVal -= 5; maxVal = minVal + range;
            // Y labels
            p.setTextSize(sp(getContext(), 9));
            p.setColor(SLATE);
            p.setTextAlign(Paint.Align.RIGHT);
            for (int v = (int) (minVal / 10) * 10; v <= maxVal; v += 10) {
                float y = tp + ch - (v - minVal) / range * ch;
                canvas.drawText(String.valueOf(v), lp - dp(getContext(), 6), y + dp(getContext(), 4), p);
            }
            // goal dashed line
            float goalY = tp + ch - (goal - minVal) / range * ch;
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(dp(getContext(), 1));
            p.setColor(SLATE);
            p.setPathEffect(new android.graphics.DashPathEffect(
                    new float[]{dp(getContext(), 4), dp(getContext(), 4)}, 0));
            canvas.drawLine(lp, goalY, lp + cw, goalY, p);
            p.setPathEffect(null);
            p.setTextAlign(Paint.Align.LEFT);
            p.setStyle(Paint.Style.FILL);
            p.setTextSize(sp(getContext(), 9));
            canvas.drawText(goal + "kg", lp + cw - dp(getContext(), 28), goalY - dp(getContext(), 4), p);
            // data line
            if (weights.length == 1) {
                float px = lp, py = tp + ch - (weights[0] - minVal) / range * ch;
                p.setStyle(Paint.Style.FILL);
                p.setColor(NAVY);
                canvas.drawCircle(px, py, dp(getContext(), 5), p);
            } else {
                Path line = new Path();
                for (int i = 0; i < weights.length; i++) {
                    float px = lp + (float) i / (weights.length - 1) * cw;
                    float py = tp + ch - (weights[i] - minVal) / range * ch;
                    if (i == 0) line.moveTo(px, py); else line.lineTo(px, py);
                }
                p.setStyle(Paint.Style.STROKE);
                p.setStrokeWidth(dp(getContext(), 2));
                p.setColor(NAVY);
                canvas.drawPath(line, p);
            }
            // first/last X labels
            p.setStyle(Paint.Style.FILL);
            p.setTextSize(sp(getContext(), 9));
            p.setColor(SLATE);
            p.setTextAlign(Paint.Align.LEFT);
            canvas.drawText("start", lp, h, p);
            p.setTextAlign(Paint.Align.RIGHT);
            canvas.drawText("today", lp + cw, h, p);
        }
    }
}

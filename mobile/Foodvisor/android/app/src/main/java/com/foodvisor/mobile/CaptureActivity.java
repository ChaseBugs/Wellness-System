package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class CaptureActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);
        LinearLayout root = Ui.screen(this, Ui.PAPER);
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 18));
        LinearLayout top = Ui.h(this);
        top.addView(Ui.title(this, "Add to Lunch", 26), new LinearLayout.LayoutParams(0, -2, 1));
        TextView close = Ui.iconButton(this, "x", false);
        close.setOnClickListener(view -> Ui.go(this, TodayActivity.class));
        top.addView(close, new LinearLayout.LayoutParams(Ui.dp(this, 34), Ui.dp(this, 34)));
        content.addView(top);

        LinearLayout search = Ui.h(this);
        search.setPadding(Ui.dp(this, 14), 0, Ui.dp(this, 14), 0);
        search.setBackground(Ui.round(Ui.CARD, Ui.dp(this, 12), Ui.dp(this, 1), Ui.RULE_SOFT));
        search.addView(Ui.text(this, "Search 2.4M foods", 14, Ui.INK_3, Typeface.NORMAL));
        content.addView(search, Ui.lpm(this, -1, Ui.dp(this, 52), 0, 14, 0, 12));

        LinearLayout modes = Ui.h(this);
        modes.addView(mode("Barcode", "Scan EAN / UPC", true, BarcodeActivity.class), new LinearLayout.LayoutParams(0, Ui.dp(this, 92), 1));
        modes.addView(mode("Photo AI", "Snap a meal", false, PhotoAiActivity.class), Ui.weight(this, Ui.dp(this, 92), 1, 8, 0, 0, 0));
        modes.addView(mode("Voice", "Just speak", false, null), Ui.weight(this, Ui.dp(this, 92), 1, 8, 0, 0, 0));
        content.addView(modes);

        content.addView(Ui.tabBar(this, new String[]{"search", "recent", "custom", "meals"}, 0), Ui.lpm(this, -1, -2, 0, 14, 0, 12));
        content.addView(Ui.cap(this, "Recently logged"), Ui.lpm(this, -1, -2, 0, 0, 0, 8));
        LinearLayout list = Ui.card(this);
        list.setPadding(0, 0, 0, 0);
        list.addView(food("Banana, raw", "1 medium - 118 g", "105", "apple"));
        list.addView(food("Greek yoghurt, plain", "Fage 0% - 170 g", "102", "mug"));
        list.addView(food("Brown rice, cooked", "1 cup - 195 g", "215", "rice"));
        list.addView(food("Atlantic salmon", "Fillet - 165 g", "358", "fish"));
        list.addView(food("Almonds", "1 oz - 28 g", "164", "leaf"));
        content.addView(list);
        content.addView(Ui.cap(this, "Trending now"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        content.addView(Ui.chipStrip(this, new String[]{"High-protein bowls", "Spring greens", "Iced matcha", "Sourdough"}, -1));

        root.addView(Ui.scroll(this, content), new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(AppNav.bottom(this, "scan"), new LinearLayout.LayoutParams(-1, Ui.dp(this, 72)));
        setContentView(root);
    }

    private LinearLayout mode(String title, String sub, boolean active, Class<?> target) {
        LinearLayout card = Ui.v(this);
        card.setPadding(Ui.dp(this, 12), Ui.dp(this, 12), Ui.dp(this, 12), Ui.dp(this, 12));
        card.setBackground(Ui.round(active ? Ui.INK : Ui.CARD, Ui.dp(this, 12), active ? 0 : Ui.dp(this, 1), Ui.RULE_SOFT));
        card.addView(Ui.text(this, title, 13, active ? Ui.PAPER : Ui.INK, Typeface.BOLD));
        card.addView(Ui.text(this, sub, 9, active ? Ui.ACCENT_LIGHT : Ui.INK_4, Typeface.BOLD), Ui.lpm(this, -1, -2, 0, 5, 0, 0));
        if (target != null) card.setOnClickListener(view -> Ui.go(this, target));
        return card;
    }

    private LinearLayout food(String name, String sub, String kcal, String glyph) {
        LinearLayout row = Ui.h(this);
        row.setPadding(Ui.dp(this, 14), Ui.dp(this, 10), Ui.dp(this, 14), Ui.dp(this, 10));
        row.addView(new Ui.FoodGlyphView(this, glyph), new LinearLayout.LayoutParams(Ui.dp(this, 36), Ui.dp(this, 36)));
        LinearLayout copy = Ui.v(this);
        copy.addView(Ui.text(this, name, 13, Ui.INK, Typeface.BOLD));
        copy.addView(Ui.text(this, sub, 10, Ui.INK_4, Typeface.NORMAL));
        row.addView(copy, Ui.weight(this, -2, 1, 12, 0, 8, 0));
        row.addView(Ui.number(this, kcal, 16, Ui.INK), new LinearLayout.LayoutParams(Ui.dp(this, 42), -2));
        row.addView(Ui.activeChip(this, "+"));
        return row;
    }
}

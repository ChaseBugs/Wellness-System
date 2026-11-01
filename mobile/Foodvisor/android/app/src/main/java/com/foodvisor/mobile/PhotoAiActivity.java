package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class PhotoAiActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 18));
        LinearLayout top = Ui.h(this);
        TextView back = Ui.iconButton(this, "<", false);
        back.setOnClickListener(view -> finish());
        top.addView(back, new LinearLayout.LayoutParams(Ui.dp(this, 34), Ui.dp(this, 34)));
        LinearLayout title = Ui.v(this);
        title.addView(Ui.cap(this, "Photo AI - v3.2"));
        title.addView(Ui.text(this, "Detected 3 items", 16, Ui.INK, Typeface.BOLD));
        top.addView(title, Ui.weight(this, -2, 1, 10, 0, 0, 0));
        content.addView(top);
        content.addView(new Ui.PhotoDetectionView(this), Ui.lpm(this, -1, Ui.dp(this, 220), 0, 14, 0, 16));

        LinearLayout total = Ui.card(this);
        total.addView(Ui.cap(this, "Estimated total"));
        LinearLayout totalRow = Ui.h(this);
        totalRow.addView(Ui.number(this, "461 kcal", 36, Ui.INK), new LinearLayout.LayoutParams(0, -2, 1));
        totalRow.addView(Ui.chip(this, "Adjust"));
        total.addView(totalRow);
        total.addView(macroStrip(), Ui.lpm(this, -1, -2, 0, 12, 0, 0));
        content.addView(total);

        content.addView(Ui.cap(this, "Items detected"), Ui.lpm(this, -1, -2, 0, 18, 0, 8));
        LinearLayout list = Ui.card(this);
        list.setPadding(0, 0, 0, 0);
        list.addView(Ui.row(this, "A  Steamed white rice", "~180g - conf high", "234"));
        list.addView(Ui.row(this, "B  Stir-fried vegetables", "~120g - conf medium", "85"));
        list.addView(Ui.row(this, "C  Soy-glazed tofu", "~95g - conf high", "142"));
        content.addView(list);
        content.addView(Ui.text(this, "Estimated values - portion sizes may vary.", 10, Ui.INK_4, Typeface.BOLD), Ui.lpm(this, -1, -2, 0, 12, 0, 0));
        content.addView(Ui.button(this, "Confirm and log to lunch"), Ui.lpm(this, -1, Ui.dp(this, 52), 0, 16, 0, 0));
        setContentView(Ui.scroll(this, content));
    }

    private LinearLayout macroStrip() {
        LinearLayout row = Ui.h(this);
        row.addView(macro("P", "19g", Ui.BERRY), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(macro("C", "64.8g", Ui.OCHRE), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(macro("F", "12.7g", Ui.ACCENT), new LinearLayout.LayoutParams(0, -2, 1));
        return row;
    }

    private LinearLayout macro(String label, String value, int color) {
        LinearLayout col = Ui.v(this);
        TextView cap = Ui.cap(this, label);
        cap.setTextColor(color);
        col.addView(cap);
        col.addView(Ui.number(this, value, 16, Ui.INK));
        return col;
    }
}

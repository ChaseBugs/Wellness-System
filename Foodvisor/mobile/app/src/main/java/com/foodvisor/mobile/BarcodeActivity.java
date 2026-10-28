package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class BarcodeActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.DARK, false);
        FrameLayout root = Ui.overlayRoot(this, Ui.DARK);
        root.addView(new Ui.BarcodeScannerView(this), new FrameLayout.LayoutParams(-1, -1));

        LinearLayout header = Ui.h(this);
        header.setPadding(Ui.dp(this, 18), Ui.dp(this, 24), Ui.dp(this, 18), 0);
        TextView close = Ui.iconButton(this, "x", true);
        close.setOnClickListener(view -> finish());
        header.addView(close, new LinearLayout.LayoutParams(Ui.dp(this, 34), Ui.dp(this, 34)));
        LinearLayout title = Ui.v(this);
        TextView cap = Ui.cap(this, "Capture");
        cap.setTextColor(android.graphics.Color.argb(140, 255, 255, 255));
        title.addView(cap);
        title.addView(Ui.text(this, "Barcode scanner", 16, Ui.PAPER, Typeface.BOLD));
        header.addView(title, Ui.weight(this, -2, 1, 10, 0, 0, 0));
        root.addView(header, new FrameLayout.LayoutParams(-1, Ui.dp(this, 72), Gravity.TOP));

        TextView helper = Ui.text(this, "SCANNING\nCentre the product barcode in the frame", 13, Ui.PAPER, Typeface.BOLD);
        helper.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams helperParams = new FrameLayout.LayoutParams(-1, Ui.dp(this, 80), Gravity.CENTER);
        helperParams.topMargin = Ui.dp(this, 80);
        root.addView(helper, helperParams);

        LinearLayout card = Ui.card(this);
        card.setBackground(Ui.round(Ui.PAPER, Ui.dp(this, 16), Ui.dp(this, 1), Ui.RULE));
        card.addView(Ui.activeChip(this, "match - 98%"));
        LinearLayout row = Ui.h(this);
        row.addView(new Ui.FoodGlyphView(this, "rice"), new LinearLayout.LayoutParams(Ui.dp(this, 56), Ui.dp(this, 56)));
        LinearLayout copy = Ui.v(this);
        copy.addView(Ui.text(this, "Thai Jasmine Rice", 16, Ui.INK, Typeface.BOLD));
        copy.addView(Ui.text(this, "Golden Phenix - 45 g serving", 10, Ui.INK_3, Typeface.NORMAL));
        copy.addView(Ui.text(this, "158 kcal - 3.2g protein - 34g carbs", 11, Ui.INK_2, Typeface.BOLD), Ui.lpm(this, -1, -2, 0, 6, 0, 0));
        row.addView(copy, Ui.weight(this, -2, 1, 12, 0, 0, 0));
        card.addView(row, Ui.lpm(this, -1, -2, 0, 12, 0, 0));
        card.addView(Ui.button(this, "+ Add to lunch"), Ui.lpm(this, -1, Ui.dp(this, 48), 0, 12, 0, 0));
        FrameLayout.LayoutParams cardParams = new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM);
        cardParams.setMargins(Ui.dp(this, 16), 0, Ui.dp(this, 16), Ui.dp(this, 16));
        root.addView(card, cardParams);
        setContentView(root);
    }
}

package com.foodvisor.mobile;

import android.app.Activity;
import android.os.Bundle;
import android.widget.LinearLayout;

import com.foodvisor.mobile.ui.Ui;

public class DevConsoleActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 18));
        content.addView(Ui.cap(this, "Caroli - developers"));
        content.addView(Ui.title(this, "Console", 28), Ui.lpm(this, -1, -2, 0, 4, 0, 14));
        LinearLayout hero = Ui.darkCard(this);
        hero.addView(Ui.cap(this, "Requests today"));
        hero.addView(Ui.number(this, "6,841", 48, Ui.PAPER));
        hero.addView(Ui.text(this, "Resets in 7h 19m - plan limit 10,000", 10, Ui.ACCENT_LIGHT, android.graphics.Typeface.BOLD));
        content.addView(hero);
        LinearLayout chart = Ui.card(this);
        chart.addView(Ui.cap(this, "Last 14 hours"));
        chart.addView(new Ui.BarChartView(this, new float[]{42, 65, 88, 71, 95, 124, 156, 142, 188, 210, 178, 230, 245, 268}, null, 0), new LinearLayout.LayoutParams(-1, Ui.dp(this, 86)));
        content.addView(chart, Ui.lpm(this, -1, -2, 0, 12, 0, 0));
        LinearLayout endpoints = Ui.card(this);
        endpoints.setPadding(0, 0, 0, 0);
        endpoints.addView(Ui.row(this, "/food/search", "p50 42ms - 200", "3,140"));
        endpoints.addView(Ui.row(this, "/food/barcode/{ean}", "p50 28ms - 200", "1,820"));
        endpoints.addView(Ui.row(this, "/nutrition/calculate", "p50 11ms - 200", "1,201"));
        endpoints.addView(Ui.row(this, "/analyze/photo", "p50 1840ms - AI", "412"));
        content.addView(Ui.cap(this, "By endpoint"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        content.addView(endpoints);
        content.addView(Ui.button(this, "Open playground"), Ui.lpm(this, -1, Ui.dp(this, 52), 0, 18, 0, 0));
        content.getChildAt(content.getChildCount() - 1).setOnClickListener(view -> Ui.go(this, DevPlaygroundActivity.class));
        setContentView(Ui.scroll(this, content));
    }
}

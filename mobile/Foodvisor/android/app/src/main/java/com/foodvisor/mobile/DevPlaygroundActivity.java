package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class DevPlaygroundActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 18));
        content.addView(Ui.cap(this, "Caroli - developers"));
        content.addView(Ui.title(this, "Playground", 26), Ui.lpm(this, -1, -2, 0, 4, 0, 14));
        content.addView(Ui.chip(this, "GET  /api/v1/food/barcode/8850002102308"), Ui.lpm(this, -1, Ui.dp(this, 42), 0, 0, 0, 14));
        content.addView(Ui.tabBar(this, new String[]{"Request", "Response", "cURL", "JS"}, 1));
        content.addView(Ui.cap(this, "Response"), Ui.lpm(this, -1, -2, 0, 16, 0, 8));
        TextView code = Ui.text(this,
                "{\n" +
                        "  \"status\": \"success\",\n" +
                        "  \"data\": {\n" +
                        "    \"food_id\": \"f_009821\",\n" +
                        "    \"name\": \"Thai Jasmine Rice\",\n" +
                        "    \"brand\": \"Golden Phenix\",\n" +
                        "    \"barcode\": \"8850002102308\",\n" +
                        "    \"calories\": 158,\n" +
                        "    \"protein_g\": 3.2,\n" +
                        "    \"carbs_g\": 34.0,\n" +
                        "    \"fat_g\": 0.4\n" +
                        "  }\n" +
                        "}", 11, Ui.PAPER, Typeface.MONOSPACE.getStyle());
        code.setTypeface(Typeface.MONOSPACE);
        code.setPadding(Ui.dp(this, 14), Ui.dp(this, 14), Ui.dp(this, 14), Ui.dp(this, 14));
        code.setBackground(Ui.round(Ui.INK, Ui.dp(this, 12), 0, Ui.INK));
        content.addView(code);
        LinearLayout headers = Ui.card(this);
        headers.setPadding(0, 0, 0, 0);
        headers.addView(Ui.row(this, "X-RateLimit-Limit", "", "10000"));
        headers.addView(Ui.row(this, "X-RateLimit-Remaining", "", "3,159"));
        headers.addView(Ui.row(this, "Cache-Control", "", "max-age=86400"));
        content.addView(Ui.cap(this, "Response headers"), Ui.lpm(this, -1, -2, 0, 16, 0, 8));
        content.addView(headers);
        content.addView(Ui.button(this, "Run again"), Ui.lpm(this, -1, Ui.dp(this, 52), 0, 18, 0, 0));
        setContentView(Ui.scroll(this, content));
    }
}

package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class RecipeActivity extends Activity {
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
        top.addView(Ui.cap(this, "Recipe detail"), Ui.weight(this, -2, 1, 10, 0, 0, 0));
        content.addView(top);
        content.addView(new Ui.ImageSlotView(this, "recipe hero - 1280 x 720"), Ui.lpm(this, -1, Ui.dp(this, 180), 0, 14, 0, 16));
        content.addView(Ui.title(this, "House fried rice", 30));
        content.addView(Ui.text(this, "saved by maya - 8 ingredients - serves 2", 11, Ui.INK_3, Typeface.BOLD), Ui.lpm(this, -1, -2, 0, 6, 0, 14));
        LinearLayout serving = Ui.card(this);
        serving.addView(Ui.cap(this, "Per serving"));
        serving.addView(Ui.number(this, "424 kcal", 32, Ui.INK));
        serving.addView(Ui.text(this, "P 29.6g   C 49.1g   F 14.0g", 12, Ui.INK_3, Typeface.BOLD), Ui.lpm(this, -1, -2, 0, 10, 0, 0));
        content.addView(serving);
        content.addView(Ui.cap(this, "Vitamins and minerals"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        LinearLayout vitamins = Ui.card(this);
        vitamins.addView(Ui.row(this, "Vitamin A", "720 ug", "80%"));
        vitamins.addView(Ui.row(this, "Vitamin K", "84 ug", "70%"));
        vitamins.addView(Ui.row(this, "Vitamin B6", "0.94 mg", "55%"));
        vitamins.addView(Ui.row(this, "Vitamin D", "1.1 ug", "7%"));
        content.addView(vitamins);
        content.addView(Ui.cap(this, "Ingredients"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        LinearLayout ing = Ui.card(this);
        ing.setPadding(0, 0, 0, 0);
        ing.addView(Ui.row(this, "Jasmine rice", "180 g", "234"));
        ing.addView(Ui.row(this, "Egg", "60 g", "88"));
        ing.addView(Ui.row(this, "Mixed vegetables", "120 g", "85"));
        ing.addView(Ui.row(this, "Soy sauce", "12 g", "9"));
        content.addView(ing);
        LinearLayout actions = Ui.h(this);
        actions.addView(Ui.button(this, "Log 1 serving"), new LinearLayout.LayoutParams(0, Ui.dp(this, 50), 1));
        actions.addView(Ui.ghostButton(this, "Edit"), Ui.weight(this, Ui.dp(this, 50), 1, 8, 0, 0, 0));
        content.addView(actions, Ui.lpm(this, -1, -2, 0, 20, 0, 0));
        setContentView(Ui.scroll(this, content));
    }
}

package com.foodvisor.mobile;

import android.app.Activity;
import android.os.Bundle;
import android.widget.LinearLayout;

import com.foodvisor.mobile.ui.Ui;

public class GoalsActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);
        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 22), Ui.dp(this, 18), Ui.dp(this, 18));
        content.addView(Ui.cap(this, "Goals"));
        content.addView(Ui.title(this, "Calorie target", 28), Ui.lpm(this, -1, -2, 0, 4, 0, 14));
        LinearLayout card = Ui.darkCard(this);
        card.addView(Ui.cap(this, "Recommended target"));
        card.addView(Ui.number(this, "2,287", 56, Ui.PAPER));
        card.addView(Ui.text(this, "kcal / day", 10, Ui.ACCENT_LIGHT, android.graphics.Typeface.BOLD));
        content.addView(card);
        LinearLayout macros = Ui.card(this);
        macros.addView(Ui.row(this, "Protein", "600 kcal", "150g"));
        macros.addView(Ui.row(this, "Carbs", "1032 kcal", "258g"));
        macros.addView(Ui.row(this, "Fat", "684 kcal", "76g"));
        content.addView(macros, Ui.lpm(this, -1, -2, 0, 14, 0, 0));
        LinearLayout details = Ui.card(this);
        details.addView(Ui.row(this, "Sex", "", "Female"));
        details.addView(Ui.row(this, "Age", "", "28 years"));
        details.addView(Ui.row(this, "Height", "", "172 cm"));
        details.addView(Ui.row(this, "Weight", "Down 1.8 kg", "73.4 kg"));
        details.addView(Ui.row(this, "Target weight", "", "68.0 kg"));
        content.addView(details, Ui.lpm(this, -1, -2, 0, 14, 0, 0));
        content.addView(Ui.cap(this, "Activity level"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        content.addView(Ui.chipStrip(this, new String[]{"Sedentary", "Light", "Moderate", "Active", "Very active"}, 2));
        content.addView(Ui.cap(this, "Goal"), Ui.lpm(this, -1, -2, 0, 20, 0, 8));
        content.addView(Ui.chipStrip(this, new String[]{"Lose", "Maintain", "Gain"}, 0));
        setContentView(Ui.scroll(this, content));
    }
}

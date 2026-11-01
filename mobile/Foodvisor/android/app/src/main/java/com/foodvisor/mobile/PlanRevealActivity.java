package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class PlanRevealActivity extends Activity {

    // Values will come from SharedPreferences / API in backend integration phase
    private static final int CALORIE_GOAL  = 1869;
    private static final String PROTEIN    = "131g";
    private static final String FAT        = "42g";
    private static final String CARBS      = "234g";
    private static final String FIBER      = "19g";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Sky-blue gradient background
        GradientDrawable gradient = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{Color.rgb(210, 234, 248), Color.rgb(240, 228, 238), Color.rgb(248, 248, 255)});

        LinearLayout root = Ui.screen(this, Color.TRANSPARENT);
        root.setBackground(gradient);
        Ui.styleBars(this, Color.rgb(210, 234, 248), true);

        LinearLayout content = Ui.v(this);
        content.setGravity(Gravity.CENTER_HORIZONTAL);
        content.setPadding(Ui.dp(this, 24), Ui.dp(this, 32), Ui.dp(this, 24), Ui.dp(this, 24));

        // Title
        TextView title = Ui.text(this, "Here’s your daily\nnutritional goal", 34, Ui.NAVY, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        title.setLineSpacing(Ui.dp(this, 3), 1f);
        content.addView(title);

        // Calorie ring
        Ui.CalorieRingView ring = new Ui.CalorieRingView(this);
        // Pass goal as consumed so the ring displays full and shows the goal number
        ring.setValues(CALORIE_GOAL, CALORIE_GOAL, 0);
        content.addView(ring, Ui.lpm(this, Ui.dp(this, 220), Ui.dp(this, 220), 0, 28, 0, 0));

        // Macro bubbles
        content.addView(macroRow(), Ui.lpm(this, -1, -2, 0, 20, 0, 0));

        // Camp illustration
        content.addView(new Ui.CampSceneView(this), Ui.lpm(this, -1, Ui.dp(this, 160), 0, 8, 0, 0));

        // Continue button (outside scroll so it stays fixed at bottom)
        root.addView(Ui.scroll(this, content), new LinearLayout.LayoutParams(-1, 0, 1));

        LinearLayout footer = Ui.v(this);
        footer.setPadding(Ui.dp(this, 24), Ui.dp(this, 12), Ui.dp(this, 24), Ui.dp(this, 24));
        footer.setBackgroundColor(Color.TRANSPARENT);
        TextView btn = Ui.bigButton(this, "Continue");
        btn.setOnClickListener(v -> {
            Ui.go(this, TodayActivity.class);
            finish();
        });
        footer.addView(btn, new LinearLayout.LayoutParams(-1, Ui.dp(this, 56)));
        root.addView(footer, new LinearLayout.LayoutParams(-1, -2));

        setContentView(root);
    }

    private LinearLayout macroRow() {
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.CENTER);
        String[][] macros = {
                {PROTEIN, "Protein", String.valueOf(Ui.BERRY)},
                {FAT,     "Fat",     String.valueOf(Ui.OCHRE)},
                {CARBS,   "Carbs",   String.valueOf(Ui.PINE)},
                {FIBER,   "Fiber",   String.valueOf(Ui.MOSS)},
        };
        int[] colors = {Ui.BERRY, Ui.OCHRE, Ui.PINE, Ui.MOSS};
        for (int i = 0; i < macros.length; i++) {
            LinearLayout cell = Ui.v(this);
            cell.setGravity(Gravity.CENTER);
            // bubble
            TextView val = Ui.number(this, macros[i][0], 15, Ui.NAVY);
            val.setGravity(Gravity.CENTER);
            val.setPadding(0, 0, 0, 0);
            int ringColor = colors[i];
            // bubble container (circle with ring)
            LinearLayout bubble = new LinearLayout(this);
            bubble.setGravity(Gravity.CENTER);
            bubble.setBackground(circleBorder(ringColor));
            bubble.addView(val, new LinearLayout.LayoutParams(-2, -2));
            cell.addView(bubble, new LinearLayout.LayoutParams(Ui.dp(this, 68), Ui.dp(this, 68)));
            // label
            TextView label = Ui.text(this, macros[i][1], 11, Ui.SLATE, Typeface.BOLD);
            label.setGravity(Gravity.CENTER);
            cell.addView(label, Ui.lpm(this, -1, -2, 0, 6, 0, 0));
            row.addView(cell, new LinearLayout.LayoutParams(0, -2, 1));
        }
        return row;
    }

    private GradientDrawable circleBorder(int ringColor) {
        GradientDrawable d = new GradientDrawable();
        d.setShape(GradientDrawable.OVAL);
        d.setColor(Ui.PAPER);
        d.setStroke(Ui.dp(this, 4), ringColor);
        return d;
    }
}

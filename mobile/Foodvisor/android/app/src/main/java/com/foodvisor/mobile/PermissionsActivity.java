package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class PermissionsActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.PAPER, true);

        LinearLayout content = Ui.v(this);
        content.setPadding(Ui.dp(this, 22), Ui.dp(this, 26), Ui.dp(this, 22), Ui.dp(this, 24));
        content.addView(Ui.cap(this, "Step 05 of 06"));
        content.addView(progress(0.83f), Ui.lpm(this, -1, Ui.dp(this, 3), 0, 8, 0, 0));
        content.addView(Ui.title(this, "A few permissions.", 34), Ui.lpm(this, -1, -2, 0, 26, 0, 0));
        content.addView(Ui.text(this, "Grant what you are comfortable with. You can change any of these later.", 13, Ui.INK_3, Typeface.NORMAL));

        content.addView(permission("Camera", "Snap meals - scan barcodes", true, "REQUIRED"), Ui.lpm(this, -1, Ui.dp(this, 74), 0, 22, 0, 10));
        content.addView(permission("Health Connect", "Sync activity and weight", true, ""), Ui.lpm(this, -1, Ui.dp(this, 74), 0, 0, 0, 10));
        content.addView(permission("Reminders", "Meal and water nudges", false, ""), Ui.lpm(this, -1, Ui.dp(this, 74), 0, 0, 0, 10));
        content.addView(permission("Location", "Restaurants nearby with nutrition info", false, ""), Ui.lpm(this, -1, Ui.dp(this, 74), 0, 0, 0, 10));

        LinearLayout note = Ui.card(this);
        note.setBackground(Ui.round(Ui.CARD_SOFT, Ui.dp(this, 12), Ui.dp(this, 1), Ui.RULE));
        note.addView(Ui.cap(this, "Your data, your almanac"));
        TextView copy = Ui.text(this, "Food logs and weight history are encrypted and never sold.", 12, Ui.INK_3, Typeface.NORMAL);
        copy.setLineSpacing(Ui.dp(this, 3), 1.0f);
        note.addView(copy, Ui.lpm(this, -1, -2, 0, 5, 0, 0));
        content.addView(note, Ui.lpm(this, -1, -2, 0, 16, 0, 0));

        TextView next = Ui.button(this, "Continue  >");
        next.setOnClickListener(view -> Ui.go(this, PlanRevealActivity.class));
        content.addView(next, Ui.lpm(this, -1, Ui.dp(this, 52), 0, 24, 0, 0));

        setContentView(Ui.scroll(this, content));
    }

    private LinearLayout permission(String title, String sub, boolean on, String stamp) {
        LinearLayout card = Ui.h(this);
        card.setPadding(Ui.dp(this, 14), 0, Ui.dp(this, 14), 0);
        card.setBackground(Ui.round(Ui.CARD, Ui.dp(this, 12), Ui.dp(this, 1), Ui.RULE_SOFT));
        TextView icon = Ui.iconButton(this, title.substring(0, 1), false);
        icon.setBackground(Ui.round(on ? Ui.INK : Ui.PAPER_DEEP, Ui.dp(this, 10), 0, Ui.PAPER_DEEP));
        icon.setTextColor(on ? Ui.PAPER : Ui.INK_3);
        card.addView(icon, new LinearLayout.LayoutParams(Ui.dp(this, 40), Ui.dp(this, 40)));
        LinearLayout copy = Ui.v(this);
        TextView name = Ui.text(this, title + (stamp.isEmpty() ? "" : "  " + stamp), 14, Ui.INK, Typeface.BOLD);
        copy.addView(name);
        copy.addView(Ui.text(this, sub, 10, Ui.INK_4, Typeface.NORMAL));
        card.addView(copy, Ui.weight(this, -2, 1, 12, 0, 8, 0));
        TextView toggle = Ui.text(this, on ? "ON" : "OFF", 10, on ? Ui.ACCENT : Ui.INK_4, Typeface.BOLD);
        card.addView(toggle);
        return card;
    }

    private android.view.View progress(float pct) {
        LinearLayout outer = Ui.h(this);
        outer.setBackground(Ui.round(Ui.PAPER_DEEP, Ui.dp(this, 2), 0, Ui.PAPER_DEEP));
        android.view.View inner = new android.view.View(this);
        inner.setBackgroundColor(Ui.ACCENT);
        outer.addView(inner, new LinearLayout.LayoutParams(0, -1, pct));
        outer.addView(new android.view.View(this), new LinearLayout.LayoutParams(0, -1, 1 - pct));
        return outer;
    }
}

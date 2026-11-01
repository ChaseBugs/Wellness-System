package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import com.foodvisor.mobile.ui.Ui;

public class InsightsActivity extends Activity {

    private static final String[] ALL_ACTIVITIES = {
            "Aerobics", "Aikido", "Aquabike", "Aquadynamic", "Archery",
            "Badminton", "Baseball", "Basketball", "Beach volley", "Bicycling",
            "Billiards", "BMX", "Bodyweight training", "Boxing", "Calisthenics",
            "Circuit training", "Climbing", "Cricket", "CrossFit", "Cycling",
            "Dancing", "Elliptical", "Fencing", "Football", "Golf",
            "Gymnastics", "Handball", "Hiking", "Hockey", "Ice skating",
            "Jiu-jitsu", "Jogging", "Judo", "Jump rope", "Kayaking",
            "Kickboxing", "Lacrosse", "Martial arts", "Pilates", "Rock climbing",
            "Rowing", "Rugby", "Running", "Sailing", "Skateboarding",
            "Skiing", "Snowboarding", "Soccer", "Squash", "Surfing",
            "Swimming", "Table tennis", "Tennis", "Volleyball", "Walking",
            "Weight lifting", "Wrestling", "Yoga", "Zumba",
    };

    private int activeFilter = 1;
    private LinearLayout listContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Ui.styleBars(this, Ui.SURF, true);

        LinearLayout root = Ui.screen(this, Ui.SURF);

        // ── Top bar ──────────────────────────────────────────────────────────
        LinearLayout topBar = Ui.h(this);
        topBar.setGravity(Gravity.CENTER_VERTICAL);
        topBar.setPadding(Ui.dp(this, 16), Ui.dp(this, 22), Ui.dp(this, 16), Ui.dp(this, 12));
        topBar.setBackgroundColor(Ui.SURF);
        TextView close = Ui.text(this, "✕", 18, Ui.NAVY, Typeface.BOLD);
        close.setGravity(Gravity.CENTER);
        close.setBackground(Ui.round(Ui.PAPER, Ui.dp(this, 20), 0, Ui.PAPER));
        close.setOnClickListener(v -> finish());
        topBar.addView(close, new LinearLayout.LayoutParams(Ui.dp(this, 40), Ui.dp(this, 40)));
        topBar.addView(Ui.spacer(this, 0), Ui.weight(this, -1, 1, 12, 0, 0, 0));
        topBar.addView(Ui.text(this, "Activity", 17, Ui.NAVY, Typeface.BOLD));
        topBar.addView(Ui.spacer(this, 0), new LinearLayout.LayoutParams(0, 1, 1));
        root.addView(topBar, new LinearLayout.LayoutParams(-1, -2));

        // ── Filter tabs ──────────────────────────────────────────────────────
        LinearLayout filterRow = buildFilterRow();
        root.addView(filterRow, new LinearLayout.LayoutParams(-1, -2));

        // ── Search bar ───────────────────────────────────────────────────────
        LinearLayout searchWrap = Ui.v(this);
        searchWrap.setBackgroundColor(Ui.PAPER);
        searchWrap.setPadding(Ui.dp(this, 16), 0, Ui.dp(this, 16), Ui.dp(this, 12));
        LinearLayout searchBox = Ui.h(this);
        searchBox.setGravity(Gravity.CENTER_VERTICAL);
        searchBox.setBackground(Ui.round(Ui.SURF, Ui.dp(this, 24), Ui.dp(this, 1), Ui.RULE2));
        searchBox.setPadding(Ui.dp(this, 16), 0, Ui.dp(this, 16), 0);
        TextView searchIcon = Ui.text(this, "⌕", 18, Ui.SLATE, Typeface.NORMAL);
        searchBox.addView(searchIcon, new LinearLayout.LayoutParams(Ui.dp(this, 28), -2));
        EditText searchInput = new EditText(this);
        searchInput.setHint("Search for an activity");
        searchInput.setHintTextColor(Ui.SLATE);
        searchInput.setTextColor(Ui.NAVY);
        searchInput.setTextSize(15);
        searchInput.setBackground(null);
        searchInput.setSingleLine(true);
        searchBox.addView(searchInput, new LinearLayout.LayoutParams(0, Ui.dp(this, 48), 1));
        searchWrap.addView(searchBox, new LinearLayout.LayoutParams(-1, Ui.dp(this, 48)));
        root.addView(searchWrap, new LinearLayout.LayoutParams(-1, -2));

        // Divider
        android.view.View div = new android.view.View(this);
        div.setBackgroundColor(Ui.RULE2);
        root.addView(div, new LinearLayout.LayoutParams(-1, Ui.dp(this, 1)));

        // ── Activity list (scrollable, rebuilt on search) ────────────────────
        listContainer = Ui.v(this);
        listContainer.setBackgroundColor(Ui.PAPER);
        populateList("");
        ScrollView scroll = new ScrollView(this);
        scroll.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
        scroll.addView(listContainer, new ScrollView.LayoutParams(-1, -2));
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));

        setContentView(root);

        // Attach watcher AFTER setContentView so it only fires on user input
        searchInput.addTextChangedListener(new TextWatcher() {
            public void beforeTextChanged(CharSequence s, int st, int c, int a) {}
            public void onTextChanged(CharSequence s, int st, int b, int c) {
                populateList(s.toString());
            }
            public void afterTextChanged(Editable e) {}
        });
    }

    private LinearLayout buildFilterRow() {
        LinearLayout row = Ui.h(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(Ui.dp(this, 16), Ui.dp(this, 8), Ui.dp(this, 16), Ui.dp(this, 12));
        row.setBackgroundColor(Ui.PAPER);
        String[] labels = {"Recents", "All activities", "My activities"};
        String[] icons  = {"◷", "↗", "★"};
        for (int i = 0; i < labels.length; i++) {
            final int idx = i;
            boolean on = i == activeFilter;
            LinearLayout pill = Ui.v(this);
            pill.setGravity(Gravity.CENTER);
            pill.setPadding(Ui.dp(this, 14), Ui.dp(this, 9), Ui.dp(this, 14), Ui.dp(this, 9));
            pill.setBackground(Ui.round(on ? Ui.SURF : Ui.PAPER, Ui.dp(this, 22),
                    on ? 0 : Ui.dp(this, 1), on ? Ui.SURF : Ui.RULE2));
            TextView icon = Ui.text(this, icons[i], 16, on ? Ui.NAVY : Ui.SLATE, Typeface.BOLD);
            icon.setGravity(Gravity.CENTER);
            pill.addView(icon, new LinearLayout.LayoutParams(Ui.dp(this, 26), Ui.dp(this, 26)));
            TextView label = Ui.text(this, labels[i], 11, on ? Ui.NAVY : Ui.SLATE, Typeface.BOLD);
            label.setGravity(Gravity.CENTER);
            pill.addView(label, Ui.lpm(this, -1, -2, 0, 3, 0, 0));
            pill.setOnClickListener(v -> {
                activeFilter = idx;
                recreate();
            });
            row.addView(pill, Ui.lpm(this, -2, -2, 0, 0, i < 2 ? 10 : 0, 0));
        }
        return row;
    }

    private void populateList(String query) {
        listContainer.removeAllViews();
        String lq = query.trim().toLowerCase();
        for (String act : ALL_ACTIVITIES) {
            if (!lq.isEmpty() && !act.toLowerCase().contains(lq)) continue;
            listContainer.addView(activityRow(act));
        }
    }

    private LinearLayout activityRow(String name) {
        LinearLayout row = Ui.v(this);
        TextView label = Ui.text(this, name, 16, Ui.NAVY, Typeface.NORMAL);
        label.setPadding(Ui.dp(this, 16), Ui.dp(this, 18), Ui.dp(this, 16), Ui.dp(this, 18));
        row.addView(label);
        android.view.View divider = new android.view.View(this);
        divider.setBackgroundColor(Ui.RULE2);
        row.addView(divider, new LinearLayout.LayoutParams(-1, Ui.dp(this, 1)));
        return row;
    }
}

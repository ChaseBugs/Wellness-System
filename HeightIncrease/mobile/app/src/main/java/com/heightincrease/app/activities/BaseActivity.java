package com.heightincrease.app.activities;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.LinearLayout;

import com.heightincrease.app.repository.AppRepository;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

public abstract class BaseActivity extends Activity {
    protected final AppRepository repository = new AppRepository();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.setStatusBarColor(Palette.BG);
        window.setNavigationBarColor(android.graphics.Color.WHITE);
    }

    protected void open(Class<?> target) {
        startActivity(new Intent(this, target));
    }

    protected void finishOpen(Class<?> target) {
        open(target);
        finish();
    }

    protected LinearLayout page(int background) {
        LinearLayout root = Ui.vertical(this);
        root.setBackgroundColor(background);
        root.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        return root;
    }

    protected void setTabPage(String selected, View content) {
        LinearLayout root = page(Palette.BG);
        root.addView(content, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        root.addView(BottomNav.create(this, selected), new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(root);
    }
}

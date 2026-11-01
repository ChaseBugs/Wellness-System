package com.heightincrease.app.activities;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.heightincrease.app.repository.AppRepository;
import com.heightincrease.app.repository.ProfileStore;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;

public abstract class BaseActivity extends Activity {
    protected final AppRepository repository = new AppRepository();
    protected RemoteRepository remote;
    protected ProfileStore profiles;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        remote = new RemoteRepository(this);
        profiles = new ProfileStore(this);
        Window window = getWindow();
        window.setStatusBarColor(Palette.BG);
        window.setNavigationBarColor(android.graphics.Color.WHITE);
    }

    /** False once the screen is closing; async callbacks check it before touching views. */
    protected boolean alive() {
        return !isFinishing() && !isDestroyed();
    }

    /** Runs the action when signed in; otherwise explains why and opens sign-in. */
    protected void requireSignIn(Runnable action) {
        if (remote.isSignedIn()) {
            action.run();
            return;
        }
        toast("Sign in to save your progress.");
        open(SignInActivity.class);
    }

    /** Light status-bar icons, for screens with a dark or blue top. */
    protected void lightStatusIcons() {
        if (android.os.Build.VERSION.SDK_INT >= 30 && getWindow().getInsetsController() != null) {
            getWindow().getInsetsController().setSystemBarsAppearance(0,
                    android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(0);
        }
    }

    protected void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    /** The design's screen header: back arrow, condensed uppercase title and an optional action on the right. */
    protected LinearLayout topBar(String title, String action, View.OnClickListener onAction) {
        LinearLayout bar = Ui.horizontal(this);
        bar.setBackgroundColor(Palette.BG);
        bar.setPadding(Ui.dp(this, 16), Ui.dp(this, 44), Ui.dp(this, 16), Ui.dp(this, 14));
        TextView back = Ui.text(this, "←", 28, Palette.TEXT, android.graphics.Typeface.NORMAL);
        back.setOnClickListener(v -> finish());
        bar.addView(back, Ui.mlp(this, Ui.dp(this, 48), ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 12, 0));
        bar.addView(Ui.heading(this, title, 24, Palette.TEXT), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        if (action != null) {
            TextView button = Ui.text(this, action, 18, Palette.BLUE, android.graphics.Typeface.NORMAL);
            button.setOnClickListener(onAction);
            bar.addView(button);
        }
        return bar;
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

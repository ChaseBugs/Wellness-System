package com.heightincrease.app.activities;

import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.widget.CheckBox;
import android.widget.NumberPicker;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.model.ProfileOption;
import com.heightincrease.app.repository.RemoteRepository;
import com.heightincrease.app.repository.SettingsStore;
import com.heightincrease.app.ui.BottomNav;
import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.ProfileViewModel;

import java.util.List;

public class ProfileActivity extends BaseActivity {
    private ProfileViewModel viewModel;
    private LinearLayout content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new ProfileViewModel(repository, remote, profiles);

        content = Ui.vertical(this);
        content.setPadding(Ui.dp(this, 18), Ui.dp(this, 58), Ui.dp(this, 18), Ui.dp(this, 24));
        content.setBackgroundColor(Palette.BG);
        setTabPage(BottomNav.ME, Ui.scroll(this, content));
    }

    @Override
    protected void onResume() {
        super.onResume();
        render();
    }

    private void render() {
        content.removeAllViews();
        content.addView(Ui.title(this, "Me"));
        content.addView(summaryCard());
        content.addView(accountCard());
        content.addView(optionGroup("SETTINGS", viewModel.getState().settings));
        content.addView(optionGroup("SUPPORT US", viewModel.getState().support));
        TextView version = Ui.text(this, "Version 1.1.16", 22, Palette.MUTED, Typeface.NORMAL);
        version.setGravity(Gravity.CENTER);
        content.addView(version, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 22, 0, 10));
    }

    private LinearLayout summaryCard() {
        LinearLayout card = Ui.card(this, 24);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setOrientation(LinearLayout.HORIZONTAL);
        TextView avatar = Ui.icon(this, "↑", 76, Palette.BLUE, 34);
        avatar.setTextColor(android.graphics.Color.WHITE);
        card.addView(avatar, Ui.mlp(this, Ui.dp(this, 76), Ui.dp(this, 76), 0, 0, 16, 0));
        LinearLayout copy = Ui.vertical(this);
        copy.addView(Ui.text(this, "Height journey", 22, Palette.TEXT, Typeface.BOLD));
        Integer height = viewModel.onboardingHeightCm();
        copy.addView(Ui.text(this, height == null ? "Add your height in onboarding" : height + ".0 CM starting height",
                17, Palette.MUTED, Typeface.NORMAL));
        card.addView(copy, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 22, 0, 18));
        return card;
    }

    private LinearLayout accountCard() {
        boolean signedIn = viewModel.isSignedIn();
        String email = viewModel.email();
        ProfileOption option = new ProfileOption(signedIn ? "Account" : "Sign in",
                signedIn ? (email == null ? "" : email) : "Sign in to sync your progress", "@", Palette.BLUE);
        LinearLayout card = Ui.card(this, 24);
        LinearLayout row = optionRow(option);
        if (signedIn) {
            TextView signOut = Ui.text(this, "SIGN OUT", 16, Palette.BLUE, Typeface.BOLD);
            signOut.setOnClickListener(v -> confirmSignOut());
            row.addView(signOut);
        } else {
            row.setOnClickListener(v -> open(SignInActivity.class));
        }
        card.addView(row);
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 18));
        return card;
    }

    private void confirmSignOut() {
        new AlertDialog.Builder(this)
                .setMessage("Sign out of this device? Your records stay in your account.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Sign out", (dialog, which) -> viewModel.signOut(() -> {
                    if (alive()) {
                        render();
                    }
                }))
                .show();
    }

    private View.OnClickListener actionFor(String title) {
        switch (title) {
            case "Workout Settings":
                return v -> workoutSettings();
            case "General Settings":
                return v -> generalSettings();
            case "Language Options":
                return v -> new AlertDialog.Builder(this)
                        .setTitle("Language")
                        .setSingleChoiceItems(new String[]{"English (system default)"}, 0, null)
                        .setMessage(null)
                        .setPositiveButton("OK", null)
                        .show();
            case "Rate us":
                return v -> openUri("market://details?id=" + getPackageName(),
                        "https://play.google.com/store/apps/details?id=" + getPackageName());
            case "Share with friends":
                return v -> startActivity(Intent.createChooser(new Intent(Intent.ACTION_SEND)
                        .setType("text/plain")
                        .putExtra(Intent.EXTRA_TEXT, "I'm building a daily posture and stretching habit with Height Increase. "
                                + "https://play.google.com/store/apps/details?id=" + getPackageName()), "Share with friends"));
            case "Common questions":
                return v -> open(QaActivity.class);
            case "Feedback":
                return v -> {
                    Intent email = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:"))
                            .putExtra(Intent.EXTRA_SUBJECT, "Height Increase feedback");
                    try {
                        startActivity(email);
                    } catch (ActivityNotFoundException missing) {
                        toast("No email app is set up on this device.");
                    }
                };
            default:
                return null;
        }
    }

    /** Sound and the "get ready" countdown, stored on the device. */
    private void workoutSettings() {
        SettingsStore settings = new SettingsStore(this);
        LinearLayout body = Ui.vertical(this);
        body.setPadding(Ui.dp(this, 24), Ui.dp(this, 8), Ui.dp(this, 24), 0);
        CheckBox sound = new CheckBox(this);
        sound.setText("Sound (beeps between exercises)");
        sound.setTextSize(17);
        sound.setChecked(settings.soundOn());
        body.addView(sound);
        body.addView(Ui.text(this, "Get-ready countdown (seconds)", 17, Palette.TEXT, android.graphics.Typeface.NORMAL),
                Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 16, 0, 0));
        NumberPicker countdown = new NumberPicker(this);
        countdown.setMinValue(3);
        countdown.setMaxValue(15);
        countdown.setValue(Math.max(3, Math.min(15, settings.countdownSeconds())));
        body.addView(countdown);
        new AlertDialog.Builder(this)
                .setTitle("Workout Settings")
                .setView(body)
                .setNegativeButton("CANCEL", null)
                .setPositiveButton("SAVE", (dialog, which) -> {
                    settings.setSoundOn(sound.isChecked());
                    settings.setCountdownSeconds(countdown.getValue());
                    toast("Workout settings saved.");
                })
                .show();
    }

    /** Units and push notifications; saved on the account when signed in. */
    private void generalSettings() {
        SettingsStore settings = new SettingsStore(this);
        LinearLayout body = Ui.vertical(this);
        body.setPadding(Ui.dp(this, 24), Ui.dp(this, 8), Ui.dp(this, 24), 0);
        CheckBox imperial = new CheckBox(this);
        imperial.setText("Use pounds and inches by default");
        imperial.setTextSize(17);
        imperial.setChecked(settings.imperial());
        CheckBox notifications = new CheckBox(this);
        notifications.setText("Push notifications (reminders and updates)");
        notifications.setTextSize(17);
        notifications.setChecked(settings.notificationsEnabled());
        body.addView(imperial);
        body.addView(notifications);
        new AlertDialog.Builder(this)
                .setTitle("General Settings")
                .setView(body)
                .setNegativeButton("CANCEL", null)
                .setPositiveButton("SAVE", (dialog, which) -> {
                    settings.setImperial(imperial.isChecked());
                    settings.setNotificationsEnabled(notifications.isChecked());
                    if (!remote.isSignedIn()) {
                        toast("Settings saved on this device.");
                        return;
                    }
                    remote.savePreferences(imperial.isChecked(), notifications.isChecked(), new RemoteRepository.Callback<Void>() {
                        @Override
                        public void onSuccess(Void value) {
                            if (alive()) {
                                toast("Settings saved.");
                            }
                        }

                        @Override
                        public void onError(String message) {
                            if (alive()) {
                                toast("Saved on this device. " + message);
                            }
                        }
                    });
                })
                .show();
    }

    private void openUri(String primary, String fallback) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(primary)));
        } catch (ActivityNotFoundException missing) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(fallback)));
            } catch (ActivityNotFoundException none) {
                toast("No app can open this link.");
            }
        }
    }

    private LinearLayout optionGroup(String label, List<ProfileOption> options) {
        LinearLayout card = Ui.card(this, 24);
        TextView heading = Ui.text(this, label, 20, Palette.BLUE, Typeface.BOLD);
        card.addView(heading, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 16));
        for (int i = 0; i < options.size(); i++) {
            ProfileOption option = options.get(i);
            View row = optionRow(option);
            card.addView(row);
            if (i < options.size() - 1) {
                card.addView(Ui.divider(this), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, Ui.dp(this, 1), 72, 12, 0, 12));
            }
        }
        card.setLayoutParams(Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 12, 0, 18));
        return card;
    }

    private LinearLayout optionRow(ProfileOption option) {
        LinearLayout row = Ui.horizontal(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        TextView icon = Ui.icon(this, option.icon, 48, option.color, 24);
        icon.setTextColor(android.graphics.Color.WHITE);
        row.addView(icon, Ui.mlp(this, Ui.dp(this, 48), Ui.dp(this, 48), 0, 0, 18, 0));
        LinearLayout text = Ui.vertical(this);
        text.addView(Ui.text(this, option.title, 22, Palette.TEXT, Typeface.BOLD));
        if (!option.subtitle.isEmpty()) {
            text.addView(Ui.text(this, option.subtitle, 17, Palette.MUTED, Typeface.NORMAL),
                    Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 3, 0, 0));
        }
        row.addView(text, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        View.OnClickListener action = actionFor(option.title);
        if (action != null) {
            row.setOnClickListener(action);
        }
        return row;
    }
}

package com.heightincrease.app.repository;

import android.content.Context;
import android.content.SharedPreferences;

/** Device settings: workout sound and countdown, display units, reminder preference. */
public class SettingsStore {
    private static final String PREFS = "height_settings";

    private final SharedPreferences prefs;

    public SettingsStore(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public boolean soundOn() {
        return prefs.getBoolean("sound_on", true);
    }

    public void setSoundOn(boolean value) {
        prefs.edit().putBoolean("sound_on", value).apply();
    }

    /** Seconds of "get ready" countdown before the first exercise. */
    public int countdownSeconds() {
        return prefs.getInt("countdown_seconds", 5);
    }

    public void setCountdownSeconds(int value) {
        prefs.edit().putInt("countdown_seconds", value).apply();
    }

    public boolean imperial() {
        return prefs.getBoolean("imperial", false);
    }

    public void setImperial(boolean value) {
        prefs.edit().putBoolean("imperial", value).apply();
    }

    public boolean notificationsEnabled() {
        return prefs.getBoolean("notifications", true);
    }

    public void setNotificationsEnabled(boolean value) {
        prefs.edit().putBoolean("notifications", value).apply();
    }
}

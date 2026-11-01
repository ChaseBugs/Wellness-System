package com.heightincrease.app.repository;

import android.content.Context;
import android.content.SharedPreferences;

import com.heightincrease.app.model.OnboardingProfile;

/** The onboarding answers, kept on the device until the user signs in and they are synced. */
public class ProfileStore {
    private static final String PREFS = "height_profile";

    private final SharedPreferences prefs;

    public ProfileStore(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public boolean isOnboarded() {
        return prefs.getBoolean("onboarded", false);
    }

    public OnboardingProfile load() {
        OnboardingProfile profile = new OnboardingProfile();
        profile.gender = prefs.getString("gender", profile.gender);
        profile.age = prefs.getInt("age", profile.age);
        profile.heightCm = prefs.getInt("height_cm", profile.heightCm);
        profile.minutes = prefs.getInt("minutes", profile.minutes);
        return profile;
    }

    public void save(OnboardingProfile profile) {
        prefs.edit()
                .putBoolean("onboarded", true)
                .putString("gender", profile.gender)
                .putInt("age", profile.age)
                .putInt("height_cm", profile.heightCm)
                .putInt("minutes", profile.minutes)
                .putBoolean("synced", false)
                .apply();
    }

    public boolean isSynced() {
        return prefs.getBoolean("synced", false);
    }

    public void markSynced() {
        prefs.edit().putBoolean("synced", true).apply();
    }
}

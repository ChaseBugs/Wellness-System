package com.heightincrease.app.network;

import android.content.Context;
import android.content.SharedPreferences;

/** Platform tokens for the signed-in account. Signed out when there is no refresh token. */
public class Session {
    private static final String PREFS = "height_session";
    private static final String ACCESS = "access_token";
    private static final String REFRESH = "refresh_token";
    private static final String EMAIL = "email";

    private final SharedPreferences prefs;

    public Session(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public boolean isSignedIn() {
        return refreshToken() != null;
    }

    public String accessToken() {
        return prefs.getString(ACCESS, null);
    }

    public String refreshToken() {
        return prefs.getString(REFRESH, null);
    }

    public String email() {
        return prefs.getString(EMAIL, null);
    }

    public void save(String accessToken, String refreshToken) {
        prefs.edit().putString(ACCESS, accessToken).putString(REFRESH, refreshToken).apply();
    }

    public void signedIn(String email, String accessToken, String refreshToken) {
        prefs.edit().putString(EMAIL, email).putString(ACCESS, accessToken).putString(REFRESH, refreshToken).apply();
    }

    public void clear() {
        prefs.edit().clear().apply();
    }
}

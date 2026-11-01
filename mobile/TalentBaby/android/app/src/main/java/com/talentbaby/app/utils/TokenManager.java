package com.talentbaby.app.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static final String PREFS_NAME  = "talent_baby_prefs";
    private static final String KEY_TOKEN   = "auth_token";
    private static final String KEY_REFRESH = "refresh_token";
    private static final String KEY_USER_ID = "user_id";
    // Wellness Platform ids are UUID strings; the old int keys are left unread.
    private static final String KEY_BABY_ID = "active_child_id";

    // Instance wrapper (for callers that prefer new TokenManager(ctx))
    private final Context ctx;

    public TokenManager(Context context) {
        this.ctx = context;
    }

    public void saveActiveBabyId(String babyId) {
        saveBabyId(ctx, babyId);
    }

    public String getActiveBabyId() {
        return getBabyId(ctx);
    }

    // Static helpers

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static void saveToken(Context context, String token) {
        prefs(context).edit().putString(KEY_TOKEN, token).apply();
    }

    public static String getToken(Context context) {
        return prefs(context).getString(KEY_TOKEN, null);
    }

    /** Stores the access + refresh pair returned by sign-up, login and refresh. */
    public static void saveTokens(Context context, String accessToken, String refreshToken) {
        prefs(context).edit().putString(KEY_TOKEN, accessToken).putString(KEY_REFRESH, refreshToken).commit();
    }

    public static String getRefreshToken(Context context) {
        return prefs(context).getString(KEY_REFRESH, null);
    }

    public static void clearToken(Context context) {
        prefs(context)
               .edit()
               .remove(KEY_TOKEN)
               .remove(KEY_REFRESH)
               .remove(KEY_USER_ID)
               .remove(KEY_BABY_ID)
               .commit();
    }

    public static void saveUserId(Context context, String userId) {
        prefs(context).edit().putString(KEY_USER_ID, userId).apply();
    }

    public static String getUserId(Context context) {
        return prefs(context).getString(KEY_USER_ID, null);
    }

    public static void saveBabyId(Context context, String babyId) {
        prefs(context).edit().putString(KEY_BABY_ID, babyId).apply();
    }

    /** The active child's id, or null when none is chosen yet. */
    public static String getBabyId(Context context) {
        return prefs(context).getString(KEY_BABY_ID, null);
    }

    public static boolean isLoggedIn(Context context) {
        String token = getToken(context);
        return token != null && !token.isEmpty();
    }
}

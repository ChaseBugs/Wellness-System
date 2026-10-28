package com.talentbaby.app.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static final String PREFS_NAME  = "talent_baby_prefs";
    private static final String KEY_TOKEN   = "auth_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_BABY_ID = "active_baby_id";

    // Instance wrapper (for callers that prefer new TokenManager(ctx))
    private final Context ctx;

    public TokenManager(Context context) {
        this.ctx = context;
    }

    public void saveActiveBabyId(int babyId) {
        saveBabyId(ctx, babyId);
    }

    public int getActiveBabyId() {
        return getBabyId(ctx);
    }

    // Static helpers

    public static void saveToken(Context context, String token) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
               .edit().putString(KEY_TOKEN, token).apply();
    }

    public static String getToken(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                      .getString(KEY_TOKEN, null);
    }

    public static void clearToken(Context context) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
               .edit()
               .remove(KEY_TOKEN)
               .remove(KEY_USER_ID)
               .remove(KEY_BABY_ID)
               .commit();
    }

    public static void saveUserId(Context context, int userId) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
               .edit().putInt(KEY_USER_ID, userId).apply();
    }

    public static int getUserId(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                      .getInt(KEY_USER_ID, -1);
    }

    public static void saveBabyId(Context context, int babyId) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
               .edit().putInt(KEY_BABY_ID, babyId).apply();
    }

    public static int getBabyId(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                      .getInt(KEY_BABY_ID, -1);
    }

    public static boolean isLoggedIn(Context context) {
        String token = getToken(context);
        return token != null && !token.isEmpty();
    }
}

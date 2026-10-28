package com.talentbaby.app;

import android.app.Application;
import android.content.Context;

import com.talentbaby.app.offline.sync.ContentSyncManager;

import java.util.Set;

public class TalentBabyApplication extends Application {
    private static TalentBabyApplication instance;
    private static Context appContext;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        appContext = getApplicationContext();
        new ContentSyncManager(appContext).syncIfOnlineAsync();
    }

    public static TalentBabyApplication getInstance() {
        return instance;
    }

    public static Context getAppContext() {
        return appContext;
    }

    public static void clearGlobalOnboardingData() {
        GlobalData.clearOnboarding();
    }

    public static Set<String> getGlobalParentingGoals() {
        return GlobalData.getParentingGoals();
    }

    public static void setGlobalParentingGoal(String goal, boolean selected) {
        GlobalData.setParentingGoal(goal, selected);
    }

    public static void setGlobalAuthEntryMethod(String method) {
        GlobalData.setAuthEntryMethod(method);
    }

    public static String getGlobalAuthEntryMethod() {
        return GlobalData.getAuthEntryMethod();
    }

    public static void setGlobalLoginEmail(String email) {
        GlobalData.setLoginEmail(email);
    }

    public static String getGlobalLoginEmail() {
        return GlobalData.getLoginEmail();
    }
}

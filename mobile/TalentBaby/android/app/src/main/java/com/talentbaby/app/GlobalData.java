package com.talentbaby.app;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

public final class GlobalData {
    private static final Set<String> parentingGoals = new LinkedHashSet<>();
    private static String authEntryMethod = "";
    private static String loginEmail = "";

    private GlobalData() {}

    public static void clearOnboarding() {
        parentingGoals.clear();
        authEntryMethod = "";
        loginEmail = "";
    }

    public static void setParentingGoal(String goal, boolean selected) {
        if (goal == null || goal.isEmpty()) return;
        if (selected) {
            parentingGoals.add(goal);
        } else {
            parentingGoals.remove(goal);
        }
    }

    public static Set<String> getParentingGoals() {
        return Collections.unmodifiableSet(parentingGoals);
    }

    public static boolean hasParentingGoals() {
        return !parentingGoals.isEmpty();
    }

    public static void setAuthEntryMethod(String method) {
        authEntryMethod = method != null ? method : "";
    }

    public static String getAuthEntryMethod() {
        return authEntryMethod;
    }

    public static void setLoginEmail(String email) {
        loginEmail = email != null ? email : "";
    }

    public static String getLoginEmail() {
        return loginEmail;
    }
}

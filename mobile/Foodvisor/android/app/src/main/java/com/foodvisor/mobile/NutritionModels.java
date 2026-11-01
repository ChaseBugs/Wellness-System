package com.foodvisor.mobile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

final class NutritionModels {
    private NutritionModels() {
    }

    static final class Profile {
        int age = 54;
        String gender = "male";
        String populationGroup = "adult";
        String lifeStage = "general";
        String physicalActivityLevel = "moderate";

        Profile copy() {
            Profile next = new Profile();
            next.age = age;
            next.gender = gender;
            next.populationGroup = populationGroup;
            next.lifeStage = lifeStage;
            next.physicalActivityLevel = physicalActivityLevel;
            return next;
        }
    }

    static final class DailyTarget {
        String key = "";
        String label = "";
        String unit = "";
        String goalType = "";
        double goal;
        boolean hasGoal;
        Double upperLimit;
        String amdr = "";

        String valueLine() {
            if (!hasGoal) {
                return amdr.isEmpty() ? "-" : amdr;
            }
            return format(goal) + (unit.isEmpty() ? "" : " " + unit);
        }

        String detailLine() {
            List<String> parts = new ArrayList<>();
            if (!goalType.isEmpty()) {
                parts.add(goalType);
            }
            if (upperLimit != null) {
                parts.add("UL " + format(upperLimit) + (unit.isEmpty() ? "" : " " + unit));
            }
            if (!amdr.isEmpty() && hasGoal) {
                parts.add("AMDR " + amdr);
            }
            return join(parts);
        }
    }

    static final class Result {
        Profile profile = new Profile();
        int count;
        List<String> warnings = new ArrayList<>();
        List<DailyTarget> targets = new ArrayList<>();
    }

    static String format(double value) {
        if (Math.abs(value - Math.rint(value)) < 0.0001) {
            return String.format(Locale.US, "%.0f", value);
        }
        return String.format(Locale.US, "%.1f", value);
    }

    static String join(List<String> values) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                builder.append(" · ");
            }
            builder.append(values.get(i));
        }
        return builder.toString();
    }
}

package com.heightincrease.app.repository;

import android.graphics.Color;

import com.heightincrease.app.model.PlanCard;
import com.heightincrease.app.model.ProfileOption;
import com.heightincrease.app.model.QaItem;
import com.heightincrease.app.model.ReportMetric;
import com.heightincrease.app.model.ReportSummary;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class AppRepository {
    /** The user's own plan card, shown after the published training plans. */
    public PlanCard myTrainingCard() {
        return new PlanCard(null, "My training", "Build your own stretch list", "ADD", 0, false);
    }

    /**
     * Report tiles, as in the design (WORKOUT, KCAL, DURATION) except KCAL: there is no validated
     * calorie-burn estimate, so the middle tile shows average sleep. Without an account they stay at zero.
     */
    public List<ReportMetric> reportMetrics(ReportSummary summary) {
        if (summary == null) {
            return Arrays.asList(
                    new ReportMetric("0", "WORKOUT"),
                    new ReportMetric("0.0", "AVG SLEEP H"),
                    new ReportMetric("00:00", "DURATION"));
        }
        return Arrays.asList(
                new ReportMetric(String.valueOf(summary.workoutCount), "WORKOUT"),
                new ReportMetric(String.format(Locale.US, "%.1f", summary.averageSleepHours), "AVG SLEEP H"),
                new ReportMetric(String.format(Locale.US, "%02d:%02d", summary.workoutMinutes / 60, summary.workoutMinutes % 60), "DURATION"));
    }

    public List<ProfileOption> settingsOptions() {
        return Arrays.asList(
                new ProfileOption("Workout Settings", "Music & Sounds & Timer, etc.", "▣", Color.rgb(0, 190, 84)),
                new ProfileOption("General Settings", "", "⚙", Color.rgb(20, 160, 245)),
                new ProfileOption("Language Options", "System default", "◎", Color.rgb(126, 58, 216))
        );
    }

    public List<ProfileOption> supportOptions() {
        return Arrays.asList(
                new ProfileOption("Rate us", "", "★", Color.rgb(110, 130, 175)),
                new ProfileOption("Share with friends", "", "↗", Color.rgb(110, 130, 175)),
                new ProfileOption("Common questions", "", "?", Color.rgb(110, 130, 175)),
                new ProfileOption("Feedback", "", "✎", Color.rgb(110, 130, 175))
        );
    }

    public List<QaItem> qaItems() {
        return Arrays.asList(
                new QaItem("Can’t see the results?", "Growth and posture changes take time. Track workouts, sleep, and height consistently for a clearer view.", false),
                new QaItem("Is exercising to increase height scientifically proven?", "Exercise improves posture, flexibility, and strength. It cannot guarantee bone growth after growth plates close.", false),
                new QaItem("When should I do the workouts?", "Choose a consistent time when your body is warm. Stop if you feel sharp pain.", false),
                new QaItem("What if I feel pain after exercise?", "Rest, lower the intensity, and avoid movements that trigger pain. Consult a professional if pain continues.", false),
                new QaItem("Can I gain/lose weight by the workouts?", "The plans are focused on mobility and posture, not weight management. Nutrition and total activity matter most.", false),
                new QaItem("Can I do these workouts during my period?", "Use lighter sessions if needed and skip anything that feels uncomfortable.", false),
                new QaItem("Target Users", "The app is intended for users who want structured stretching, posture work, and healthy growth habits.", true),
                new QaItem("Exercise frequency and reminders", "Use reminders to build a steady routine. Daily gentle practice is better than occasional overtraining.", true),
                new QaItem("Should I follow the recipes strictly?", "Use nutrition suggestions as general guidance and adjust for allergies, culture, and professional advice.", true)
        );
    }
}

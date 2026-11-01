package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.DayLog;
import com.heightincrease.app.model.ReportData;
import com.heightincrease.app.model.ReportMetric;
import com.heightincrease.app.repository.AppRepository;
import com.heightincrease.app.repository.ProfileStore;
import com.heightincrease.app.repository.RemoteRepository;

import java.util.List;

/** The signed-in user's report; signed out, it shows the height entered during onboarding. */
public class ReportsViewModel extends BaseViewModel<List<ReportMetric>> {
    /** BMI categories are defined for adults; children need BMI-for-age, which the app doesn't compute. */
    public static final int ADULT_AGE = 18;

    private final AppRepository repository;
    private final RemoteRepository remote;
    private final ProfileStore profiles;
    private ReportData report;

    public ReportsViewModel(AppRepository repository, RemoteRepository remote, ProfileStore profiles) {
        this.repository = repository;
        this.remote = remote;
        this.profiles = profiles;
        state = repository.reportMetrics(null);
    }

    public boolean isSignedIn() {
        return remote.isSignedIn();
    }

    public void load(Runnable onChange) {
        if (!remote.isSignedIn()) {
            report = null;
            state = repository.reportMetrics(null);
            onChange.run();
            return;
        }
        remote.report(track(value -> {
            report = value;
            state = repository.reportMetrics(value.summary);
        }, onChange));
    }

    public int streakDays() {
        return report == null ? 0 : report.summary.streakDays;
    }

    /** True when a workout is logged on that date (YYYY-MM-DD). */
    public boolean workedOutOn(String date) {
        DayLog log = report == null ? null : report.day(date);
        return log != null && log.workoutMinutes > 0;
    }

    /** Latest recorded height, or the onboarding answer before anything is synced. */
    public Double currentHeightCm() {
        if (report != null && report.summary.currentHeightCm != null) {
            return report.summary.currentHeightCm;
        }
        return profiles.isOnboarded() ? (double) profiles.load().heightCm : null;
    }

    public Double latestWeightKg() {
        return report == null ? null : report.latestWeightKg();
    }

    public Double latestSleepHours() {
        return report == null ? null : report.latestSleepHours();
    }

    /** Weight change over the report window (newest minus oldest recorded), or null with fewer than two. */
    public Double weightChangeKg() {
        if (report == null) {
            return null;
        }
        Double newest = null;
        Double oldest = null;
        for (DayLog log : report.logs) {
            if (log.weightKg == null) {
                continue;
            }
            if (newest == null) {
                newest = log.weightKg;
            }
            oldest = log.weightKg;
        }
        return newest == null || newest.equals(oldest) && countWeights() < 2 ? null : newest - oldest;
    }

    private int countWeights() {
        int count = 0;
        for (DayLog log : report.logs) {
            if (log.weightKg != null) {
                count++;
            }
        }
        return count;
    }

    /** BMI from the latest weight and height, or null when either is missing. */
    public Double bmi() {
        Double weight = latestWeightKg();
        Double height = currentHeightCm();
        if (weight == null || height == null || height <= 0) {
            return null;
        }
        double meters = height / 100;
        return weight / (meters * meters);
    }

    public boolean isAdult() {
        return !profiles.isOnboarded() || profiles.load().age >= ADULT_AGE;
    }

    /** WHO adult BMI category. */
    public static String bmiCategory(double bmi) {
        if (bmi < 16) {
            return "Severely underweight";
        }
        if (bmi < 18.5) {
            return "Underweight";
        }
        if (bmi < 25) {
            return "Normal";
        }
        if (bmi < 30) {
            return "Overweight";
        }
        if (bmi < 35) {
            return "Obese class I";
        }
        if (bmi < 40) {
            return "Obese class II";
        }
        return "Obese class III";
    }
}

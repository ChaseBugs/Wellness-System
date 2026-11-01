package com.heightincrease.app.model;

/** GET apps/height-increase/reports summary. Heights are observed values only, never projections. */
public class ReportSummary {
    /** Days in the report window with a logged workout. */
    public final int workoutCount;
    public final int workoutMinutes;
    public final double averageSleepHours;
    public final int streakDays;
    public final Double currentHeightCm;
    public final Double targetHeightCm;

    public ReportSummary(int workoutCount, int workoutMinutes, double averageSleepHours, int streakDays,
                         Double currentHeightCm, Double targetHeightCm) {
        this.workoutCount = workoutCount;
        this.workoutMinutes = workoutMinutes;
        this.averageSleepHours = averageSleepHours;
        this.streakDays = streakDays;
        this.currentHeightCm = currentHeightCm;
        this.targetHeightCm = targetHeightCm;
    }
}

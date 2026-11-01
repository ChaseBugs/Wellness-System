package com.heightincrease.app.model;

/** One day of the user's HeightIncrease log. Null fields were not recorded that day. */
public class DayLog {
    public final String date;
    public final int workoutMinutes;
    public final Double sleepHours;
    public final Double weightKg;
    public final Double heightCm;

    public DayLog(String date, int workoutMinutes, Double sleepHours, Double weightKg, Double heightCm) {
        this.date = date;
        this.workoutMinutes = workoutMinutes;
        this.sleepHours = sleepHours;
        this.weightKg = weightKg;
        this.heightCm = heightCm;
    }
}

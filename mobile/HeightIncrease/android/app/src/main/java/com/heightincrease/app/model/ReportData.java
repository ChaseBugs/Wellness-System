package com.heightincrease.app.model;

import java.util.List;

/** The report summary plus the recent daily logs it was built from (newest first). */
public class ReportData {
    public final ReportSummary summary;
    public final List<DayLog> logs;

    public ReportData(ReportSummary summary, List<DayLog> logs) {
        this.summary = summary;
        this.logs = logs;
    }

    public DayLog day(String date) {
        for (DayLog log : logs) {
            if (log.date.equals(date)) {
                return log;
            }
        }
        return null;
    }

    /** The most recent recorded value, or null. */
    public Double latestWeightKg() {
        for (DayLog log : logs) {
            if (log.weightKg != null) {
                return log.weightKg;
            }
        }
        return null;
    }

    public Double latestSleepHours() {
        for (DayLog log : logs) {
            if (log.sleepHours != null) {
                return log.sleepHours;
            }
        }
        return null;
    }
}

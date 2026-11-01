package com.heightincrease.app.model;

/** The user's weekly workout goal (a "workout" goal: target days per week). */
public class Goal {
    public final String id;
    public final int daysPerWeek;

    public Goal(String id, int daysPerWeek) {
        this.id = id;
        this.daysPerWeek = daysPerWeek;
    }
}

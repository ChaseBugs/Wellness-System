package com.heightincrease.app.model;

import java.util.List;

/** A runnable workout: a published training plan (routineId set) or the user's own list (routineId null). */
public class Workout {
    public final String routineId;
    public final String title;
    public final List<WorkoutStep> steps;

    public Workout(String routineId, String title, List<WorkoutStep> steps) {
        this.routineId = routineId;
        this.title = title;
        this.steps = steps;
    }
}

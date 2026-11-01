package com.heightincrease.app.model;

import java.util.List;

/** One exercise in a workout, from a training plan's steps or the user's own list. */
public class WorkoutStep {
    public final String exerciseId;
    public final String name;
    public final int durationSeconds;
    public final int restSeconds;
    public final List<String> instructions;
    public final List<String> safetyNotes;

    public WorkoutStep(String exerciseId, String name, int durationSeconds, int restSeconds,
                       List<String> instructions, List<String> safetyNotes) {
        this.exerciseId = exerciseId;
        this.name = name;
        this.durationSeconds = durationSeconds;
        this.restSeconds = restSeconds;
        this.instructions = instructions;
        this.safetyNotes = safetyNotes;
    }
}

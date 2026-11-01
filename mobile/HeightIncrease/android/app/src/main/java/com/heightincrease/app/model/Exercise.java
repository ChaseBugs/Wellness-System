package com.heightincrease.app.model;

import java.util.List;

/** A published HeightIncrease exercise from GET apps/height-increase/exercises. */
public class Exercise {
    public final String id;
    public final String title;
    public final String description;
    public final int durationSeconds;
    public final List<String> steps;
    public final List<String> tips;
    public final List<String> safetyNotes;
    public final List<String> targetAreas;
    public final boolean expertReviewed;

    public Exercise(String id, String title, String description, int durationSeconds, List<String> steps,
                    List<String> tips, List<String> safetyNotes, List<String> targetAreas, boolean expertReviewed) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationSeconds = durationSeconds;
        this.steps = steps;
        this.tips = tips;
        this.safetyNotes = safetyNotes;
        this.targetAreas = targetAreas;
        this.expertReviewed = expertReviewed;
    }
}

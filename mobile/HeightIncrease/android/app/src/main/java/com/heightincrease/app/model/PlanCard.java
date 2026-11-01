package com.heightincrease.app.model;

public class PlanCard {
    /** The training plan id, or null for the "My training" card. */
    public final String id;
    public final String title;
    public final String subtitle;
    public final String action;
    public final int progress;
    public final boolean primary;

    public PlanCard(String id, String title, String subtitle, String action, int progress, boolean primary) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.action = action;
        this.progress = progress;
        this.primary = primary;
    }
}

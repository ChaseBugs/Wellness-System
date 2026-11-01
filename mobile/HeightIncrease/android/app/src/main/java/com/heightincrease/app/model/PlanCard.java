package com.heightincrease.app.model;

public class PlanCard {
    public final String title;
    public final String subtitle;
    public final String action;
    public final int progress;
    public final boolean primary;

    public PlanCard(String title, String subtitle, String action, int progress, boolean primary) {
        this.title = title;
        this.subtitle = subtitle;
        this.action = action;
        this.progress = progress;
        this.primary = primary;
    }
}

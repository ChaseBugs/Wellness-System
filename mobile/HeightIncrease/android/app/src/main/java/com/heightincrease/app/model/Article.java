package com.heightincrease.app.model;

/** A published HeightIncrease article from GET apps/height-increase/articles. */
public class Article {
    public final String id;
    public final String title;
    public final String subtitle;
    public final String body;
    public final String category;
    public final boolean featured;
    /** False until an expert reviews it in the admin; the app shows that state. */
    public final boolean expertReviewed;

    public Article(String id, String title, String subtitle, String body, String category,
                   boolean featured, boolean expertReviewed) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.body = body;
        this.category = category;
        this.featured = featured;
        this.expertReviewed = expertReviewed;
    }
}

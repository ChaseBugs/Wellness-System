package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class DailyUpdate {
    @SerializedName("id")
    private int id;

    @SerializedName("age_in_months")
    private int ageInMonths;

    /** "tip" | "development" | "activity" | "safety" */
    @SerializedName("content_type")
    private String contentType;

    @SerializedName("title")
    private String title;

    @SerializedName("content")
    private String content;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("video_url")
    private String videoUrl;

    @SerializedName("created_at")
    private String createdAt;

    public int getId() { return id; }
    public int getAgeInMonths() { return ageInMonths; }
    public String getContentType() { return contentType; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getImageUrl() { return imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public String getCreatedAt() { return createdAt; }
}

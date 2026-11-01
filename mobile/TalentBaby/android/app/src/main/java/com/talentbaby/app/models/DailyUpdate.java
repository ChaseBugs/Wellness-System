package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class DailyUpdate {
    @SerializedName("id")
    private String id;

    @SerializedName("ageInMonths")
    private int ageInMonths;

    /** "tip" | "development" | "activity" | "safety" */
    @SerializedName("contentType")
    private String contentType;

    @SerializedName("title")
    private String title;

    @SerializedName("content")
    private String content;

    @SerializedName("imageUrl")
    private String imageUrl;

    @SerializedName("videoUrl")
    private String videoUrl;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public int getAgeInMonths() { return ageInMonths; }
    public String getContentType() { return contentType; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getImageUrl() { return imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public String getCreatedAt() { return createdAt; }
}

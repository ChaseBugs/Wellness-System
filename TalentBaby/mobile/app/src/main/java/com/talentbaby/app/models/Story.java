package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class Story {
    @SerializedName("id")
    private int id;

    @SerializedName("title")
    private String title;

    @SerializedName("content")
    private String content;

    @SerializedName("summary")
    private String summary;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("author")
    private String author;

    @SerializedName("narrator")
    private String narrator;

    @SerializedName("age_group")
    private String ageGroup;

    @SerializedName("view_count")
    private int viewCount;

    @SerializedName("is_bookmarked")
    private boolean bookmarked;

    @SerializedName("is_premium")
    private boolean premium;

    private transient int localImageResId;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getNarrator() { return narrator; }
    public void setNarrator(String narrator) { this.narrator = narrator; }
    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public boolean isBookmarked() { return bookmarked; }
    public void setBookmarked(boolean bookmarked) { this.bookmarked = bookmarked; }
    public boolean isPremium() { return premium; }
    public void setPremium(boolean premium) { this.premium = premium; }
    public int getLocalImageResId() { return localImageResId; }
    public void setLocalImageResId(int localImageResId) { this.localImageResId = localImageResId; }
}

package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class Article {
    @SerializedName("id")
    private String id;

    @SerializedName("title")
    private String title;

    @SerializedName("content")
    private String content;

    @SerializedName("summary")
    private String summary;

    @SerializedName("category")
    private String category;

    @SerializedName("imageUrl")
    private String imageUrl;

    @SerializedName("author")
    private String author;

    @SerializedName(value = "readTimeMinutes", alternate = {"reading_time_minutes"})
    private int readTimeMinutes;

    @SerializedName("isPremium")
    private boolean isPremium;

    @SerializedName("viewCount")
    private int viewCount;

    @SerializedName("doctorName")
    private String doctorName;

    @SerializedName("doctorCredentials")
    private String doctorCredentials;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public int getReadTimeMinutes() { return readTimeMinutes; }
    public void setReadTimeMinutes(int readTimeMinutes) { this.readTimeMinutes = readTimeMinutes; }
    public boolean isPremium() { return isPremium; }
    public void setPremium(boolean premium) { isPremium = premium; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getDoctorCredentials() { return doctorCredentials; }
    public void setDoctorCredentials(String doctorCredentials) { this.doctorCredentials = doctorCredentials; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

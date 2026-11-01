package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class SleepSession {
    @SerializedName("id")
    private String id;

    @SerializedName("childId")
    private String babyId;

    @SerializedName("sleepType")
    private String sleepType; // "nap" | "night" | "bedtime"

    @SerializedName("startTime")
    private String startTime;

    @SerializedName("endTime")
    private String endTime;

    @SerializedName("durationMinutes")
    private Integer durationMinutes;

    @SerializedName("qualityRating")
    private Integer qualityRating; // 1-5

    @SerializedName("notes")
    private String notes;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public String getBabyId() { return babyId; }
    public String getSleepType() { return sleepType; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public Integer getQualityRating() { return qualityRating; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
}

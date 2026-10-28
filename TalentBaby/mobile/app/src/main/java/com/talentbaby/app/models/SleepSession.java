package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class SleepSession {
    @SerializedName("id")
    private int id;

    @SerializedName("baby_id")
    private int babyId;

    @SerializedName("sleep_type")
    private String sleepType; // "nap" | "night" | "bedtime"

    @SerializedName("start_time")
    private String startTime;

    @SerializedName("end_time")
    private String endTime;

    @SerializedName("duration_minutes")
    private Integer durationMinutes;

    @SerializedName("quality_rating")
    private Integer qualityRating; // 1-5

    @SerializedName("notes")
    private String notes;

    @SerializedName("created_at")
    private String createdAt;

    public int getId() { return id; }
    public int getBabyId() { return babyId; }
    public String getSleepType() { return sleepType; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public Integer getQualityRating() { return qualityRating; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
}

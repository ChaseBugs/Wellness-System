package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class FeedingRecord {
    @SerializedName("id")
    private int id;

    @SerializedName("baby_id")
    private int babyId;

    @SerializedName("feeding_type")
    private String feedingType; // "breastfeeding" | "formula" | "solid" | "mixed"

    @SerializedName("feeding_date")
    private String feedingDate;

    @SerializedName("start_time")
    private String startTime;

    @SerializedName("end_time")
    private String endTime;

    @SerializedName("duration_minutes")
    private Integer durationMinutes;

    @SerializedName("amount_ml")
    private Double amountMl;

    @SerializedName("amount_oz")
    private Double amountOz;

    @SerializedName("side")
    private String side; // "left" | "right" | "both"

    @SerializedName("notes")
    private String notes;

    @SerializedName("created_at")
    private String createdAt;

    public int getId() { return id; }
    public int getBabyId() { return babyId; }
    public String getFeedingType() { return feedingType; }
    public String getFeedingDate() { return feedingDate; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public Double getAmountMl() { return amountMl; }
    public Double getAmountOz() { return amountOz; }
    public String getSide() { return side; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
}

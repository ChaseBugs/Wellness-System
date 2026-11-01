package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class FeedingRecord {
    @SerializedName("id")
    private String id;

    @SerializedName("childId")
    private String babyId;

    @SerializedName("feedingType")
    private String feedingType; // "breastfeeding" | "formula" | "solid" | "mixed"

    @SerializedName("feedingDate")
    private String feedingDate;

    @SerializedName("startTime")
    private String startTime;

    @SerializedName("endTime")
    private String endTime;

    @SerializedName("durationMinutes")
    private Integer durationMinutes;

    @SerializedName("amountMl")
    private Double amountMl;

    @SerializedName("amountOz")
    private Double amountOz;

    @SerializedName("side")
    private String side; // "left" | "right" | "both"

    @SerializedName("notes")
    private String notes;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public String getBabyId() { return babyId; }
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

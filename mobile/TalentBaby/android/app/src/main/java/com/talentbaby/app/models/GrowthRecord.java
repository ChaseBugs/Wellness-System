package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class GrowthRecord {
    @SerializedName("id")
    private String id;

    @SerializedName("childId")
    private String babyId;

    @SerializedName("measuredOn")
    private String recordDate;

    @SerializedName("weightKg")
    private Double weightKg;

    @SerializedName("heightCm")
    private Double heightCm;

    @SerializedName("headCircumferenceCm")
    private Double headCircumferenceCm;

    @SerializedName("bmi")
    private Double bmi;

    @SerializedName("percentileWeight")
    private Integer percentileWeight;

    @SerializedName("percentileHeight")
    private Integer percentileHeight;

    @SerializedName("notes")
    private String notes;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public String getBabyId() { return babyId; }
    public String getRecordDate() { return recordDate; }
    public Double getWeightKg() { return weightKg; }
    public Double getHeightCm() { return heightCm; }
    public Double getHeadCircumferenceCm() { return headCircumferenceCm; }
    public Double getBmi() { return bmi; }
    public Integer getPercentileWeight() { return percentileWeight; }
    public Integer getPercentileHeight() { return percentileHeight; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
}

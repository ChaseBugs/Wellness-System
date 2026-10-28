package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class GrowthRecord {
    @SerializedName("id")
    private int id;

    @SerializedName("baby_id")
    private int babyId;

    @SerializedName("record_date")
    private String recordDate;

    @SerializedName("weight_kg")
    private Double weightKg;

    @SerializedName("height_cm")
    private Double heightCm;

    @SerializedName("head_circumference_cm")
    private Double headCircumferenceCm;

    @SerializedName("bmi")
    private Double bmi;

    @SerializedName("percentile_weight")
    private Integer percentileWeight;

    @SerializedName("percentile_height")
    private Integer percentileHeight;

    @SerializedName("notes")
    private String notes;

    @SerializedName("created_at")
    private String createdAt;

    public int getId() { return id; }
    public int getBabyId() { return babyId; }
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

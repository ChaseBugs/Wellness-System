package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class DiaperChange {
    @SerializedName("id")
    private int id;

    @SerializedName("baby_id")
    private int babyId;

    @SerializedName("diaper_type")
    private String diaperType; // "wet" | "dirty" | "both"

    @SerializedName("change_time")
    private String changeTime;

    @SerializedName("notes")
    private String notes;

    @SerializedName("created_at")
    private String createdAt;

    public int getId() { return id; }
    public int getBabyId() { return babyId; }
    public String getDiaperType() { return diaperType; }
    public String getChangeTime() { return changeTime; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
}

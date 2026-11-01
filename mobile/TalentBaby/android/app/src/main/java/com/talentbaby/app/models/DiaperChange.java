package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class DiaperChange {
    @SerializedName("id")
    private String id;

    @SerializedName("childId")
    private String babyId;

    @SerializedName("diaperType")
    private String diaperType; // "wet" | "dirty" | "both"

    @SerializedName("changeTime")
    private String changeTime;

    @SerializedName("notes")
    private String notes;

    @SerializedName("createdAt")
    private String createdAt;

    public String getId() { return id; }
    public String getBabyId() { return babyId; }
    public String getDiaperType() { return diaperType; }
    public String getChangeTime() { return changeTime; }
    public String getNotes() { return notes; }
    public String getCreatedAt() { return createdAt; }
}

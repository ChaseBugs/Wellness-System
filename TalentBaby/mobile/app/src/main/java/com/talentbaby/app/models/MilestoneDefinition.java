package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class MilestoneDefinition {
    @SerializedName("id")
    private int id;

    @SerializedName("month")
    private int month;

    @SerializedName("milestone_type")
    private String milestoneType;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("question")
    private String question;

    @SerializedName("related_activity")
    private String relatedActivity;

    @SerializedName("display_order")
    private int displayOrder;

    @SerializedName("doctor_verified")
    private boolean doctorVerified;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public String getMilestoneType() { return milestoneType; }
    public void setMilestoneType(String milestoneType) { this.milestoneType = milestoneType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getRelatedActivity() { return relatedActivity; }
    public void setRelatedActivity(String relatedActivity) { this.relatedActivity = relatedActivity; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }

    public boolean isDoctorVerified() { return doctorVerified; }
    public void setDoctorVerified(boolean doctorVerified) { this.doctorVerified = doctorVerified; }
}

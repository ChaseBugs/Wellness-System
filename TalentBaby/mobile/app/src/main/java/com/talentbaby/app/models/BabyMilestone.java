package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

/**
 * Represents a baby's milestone record — joined with definition data
 * from GET /baby-milestones/:babyId
 */
public class BabyMilestone {
    @SerializedName("id")
    private int id;

    @SerializedName("baby_id")
    private int babyId;

    @SerializedName("milestone_definition_id")
    private int milestoneDefinitionId;

    /** "yes" | "no" | "almost" */
    @SerializedName("status")
    private String status;

    @SerializedName("achieved_date")
    private String achievedDate;

    @SerializedName("notes")
    private String notes;

    // Joined definition fields
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

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBabyId() { return babyId; }
    public void setBabyId(int babyId) { this.babyId = babyId; }

    public int getMilestoneDefinitionId() { return milestoneDefinitionId; }
    public void setMilestoneDefinitionId(int milestoneDefinitionId) { this.milestoneDefinitionId = milestoneDefinitionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAchievedDate() { return achievedDate; }
    public void setAchievedDate(String achievedDate) { this.achievedDate = achievedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

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
}

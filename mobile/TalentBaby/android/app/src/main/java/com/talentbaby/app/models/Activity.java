package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Activity {
    @SerializedName("id")
    private String id;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("category")
    private String category;

    @SerializedName("monthMin")
    private int minAgeMonths;

    @SerializedName("monthMax")
    private int maxAgeMonths;

    @SerializedName("durationMinutes")
    private int durationMinutes;

    @SerializedName("imageUrl")
    private String imageUrl;

    @SerializedName("materialsNeeded")
    private List<String> materialsNeeded;

    @SerializedName("instructions")
    private String instructions;

    @SerializedName("benefits")
    private List<String> benefits;

    @SerializedName("subCategory")
    private String subCategory;

    @SerializedName("difficultyLevel")
    private String difficultyLevel;

    @SerializedName("expertReviewed")
    private boolean doctorVerified;

    @SerializedName("doneCount")
    private int doneCount;

    @SerializedName("frequency")
    private String frequency;

    @SerializedName("videoUrl")
    private String videoUrl;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getMinAgeMonths() { return minAgeMonths; }
    public void setMinAgeMonths(int minAgeMonths) { this.minAgeMonths = minAgeMonths; }
    public int getMaxAgeMonths() { return maxAgeMonths; }
    public void setMaxAgeMonths(int maxAgeMonths) { this.maxAgeMonths = maxAgeMonths; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    /** The API sends a list; screens show it as bullet lines. */
    public String getMaterialsNeeded() { return bullets(materialsNeeded); }
    public void setMaterialsNeeded(String materialsNeeded) { this.materialsNeeded = single(materialsNeeded); }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getBenefits() { return bullets(benefits); }
    public void setBenefits(String benefits) { this.benefits = single(benefits); }
    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public boolean isDoctorVerified() { return doctorVerified; }
    public void setDoctorVerified(boolean doctorVerified) { this.doctorVerified = doctorVerified; }
    public int getDoneCount() { return doneCount; }
    public void setDoneCount(int doneCount) { this.doneCount = doneCount; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    private static String bullets(List<String> items) {
        if (items == null || items.isEmpty()) return null;
        StringBuilder text = new StringBuilder();
        for (String item : items) {
            if (text.length() > 0) text.append("\n");
            text.append("• ").append(item);
        }
        return text.toString();
    }

    private static List<String> single(String value) {
        return value == null ? new ArrayList<>() : new ArrayList<>(Collections.singletonList(value));
    }
}

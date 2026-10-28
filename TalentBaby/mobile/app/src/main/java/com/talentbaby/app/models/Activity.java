package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class Activity {
    @SerializedName("id")
    private int id;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("category")
    private String category;

    @SerializedName("month_min")
    private int minAgeMonths;

    @SerializedName("month_max")
    private int maxAgeMonths;

    @SerializedName("duration_minutes")
    private int durationMinutes;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("materials_needed")
    private String materialsNeeded;

    @SerializedName("instructions")
    private String instructions;

    @SerializedName("benefits")
    private String benefits;

    @SerializedName("sub_category")
    private String subCategory;

    @SerializedName("difficulty_level")
    private String difficultyLevel;

    @SerializedName("doctor_verified")
    private boolean doctorVerified;

    @SerializedName("done_count")
    private int doneCount;

    @SerializedName("frequency")
    private String frequency;

    @SerializedName("video_url")
    private String videoUrl;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
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
    public String getMaterialsNeeded() { return materialsNeeded; }
    public void setMaterialsNeeded(String materialsNeeded) { this.materialsNeeded = materialsNeeded; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
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
}

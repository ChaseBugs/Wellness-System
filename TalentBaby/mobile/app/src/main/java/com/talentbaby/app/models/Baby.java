package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class Baby {
    @SerializedName("id")
    private int id;

    @SerializedName("user_id")
    private int userId;

    @SerializedName("name")
    private String name;

    @SerializedName("birth_date")
    private String birthDate;

    @SerializedName("gender")
    private String gender;

    @SerializedName("birth_weight_kg")
    private Double birthWeightKg;

    @SerializedName("birth_height_cm")
    private Double birthHeightCm;

    @SerializedName("profile_picture_url")
    private String profilePictureUrl;

    @SerializedName("avatar_url")
    private String avatarUrl;

    public Baby() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getBirthWeightKg() {
        return birthWeightKg;
    }

    public void setBirthWeightKg(Double birthWeightKg) {
        this.birthWeightKg = birthWeightKg;
    }

    public Double getBirthHeightCm() {
        return birthHeightCm;
    }

    public void setBirthHeightCm(Double birthHeightCm) {
        this.birthHeightCm = birthHeightCm;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}

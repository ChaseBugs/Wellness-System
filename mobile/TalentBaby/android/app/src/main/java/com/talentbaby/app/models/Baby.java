package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class Baby {
    @SerializedName("id")
    private String id;

    @SerializedName("userId")
    private String userId;

    @SerializedName("name")
    private String name;

    @SerializedName("birthDate")
    private String birthDate;

    @SerializedName("sex")
    private String gender;

    @SerializedName("birthWeightKg")
    private Double birthWeightKg;

    @SerializedName("birthHeightCm")
    private Double birthHeightCm;

    @SerializedName("profilePictureUrl")
    private String profilePictureUrl;

    @SerializedName("avatarUrl")
    private String avatarUrl;

    public Baby() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
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

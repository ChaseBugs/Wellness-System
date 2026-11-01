package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class User {
    @SerializedName("id")
    private String id;

    @SerializedName("email")
    private String email;

    @SerializedName("fullName")
    private String fullName;

    @SerializedName("phoneNumber")
    private String phoneNumber;

    @SerializedName("gender")
    private String gender;

    @SerializedName("birthdate")
    private String birthdate;

    @SerializedName("profilePictureUrl")
    private String profilePictureUrl;

    @SerializedName("languagePreference")
    private String languagePreference;

    @SerializedName("relationToBaby")
    private String relationToBaby;

    public User() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(String birthdate) {
        this.birthdate = birthdate;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getLanguagePreference() {
        return languagePreference;
    }

    public void setLanguagePreference(String languagePreference) {
        this.languagePreference = languagePreference;
    }

    public String getRelationToBaby() {
        return relationToBaby;
    }

    public void setRelationToBaby(String relationToBaby) {
        this.relationToBaby = relationToBaby;
    }
}

package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class DailyActivity {
    @SerializedName("dailyId")
    private String dailyId;

    @SerializedName("slot")
    private int slot;

    @SerializedName("isCompleted")
    private boolean completed;

    @SerializedName("completedAt")
    private String completedAt;

    @SerializedName("activity")
    private Activity activity;

    public String getDailyId() { return dailyId; }
    public void setDailyId(String dailyId) { this.dailyId = dailyId; }
    public int getSlot() { return slot; }
    public void setSlot(int slot) { this.slot = slot; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }
}

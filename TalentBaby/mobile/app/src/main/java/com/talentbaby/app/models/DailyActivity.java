package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class DailyActivity {
    @SerializedName("daily_id")
    private int dailyId;

    @SerializedName("slot")
    private int slot;

    @SerializedName("is_completed")
    private boolean completed;

    @SerializedName("completed_at")
    private String completedAt;

    @SerializedName("activity")
    private Activity activity;

    public int getDailyId() { return dailyId; }
    public void setDailyId(int dailyId) { this.dailyId = dailyId; }
    public int getSlot() { return slot; }
    public void setSlot(int slot) { this.slot = slot; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }
}

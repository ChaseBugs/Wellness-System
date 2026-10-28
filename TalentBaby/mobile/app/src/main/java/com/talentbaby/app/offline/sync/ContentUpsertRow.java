package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

public class ContentUpsertRow {
    @SerializedName("id")
    private int id;

    @SerializedName("updatedAt")
    private String updatedAt;

    @SerializedName("payload")
    private Map<String, Object> payload;

    public int getId() { return id; }
    public String getUpdatedAt() { return updatedAt; }
    public Map<String, Object> getPayload() { return payload; }
}

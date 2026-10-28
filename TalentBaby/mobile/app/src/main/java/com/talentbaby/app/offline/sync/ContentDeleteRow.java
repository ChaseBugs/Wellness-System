package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

public class ContentDeleteRow {
    @SerializedName("id")
    private int id;

    @SerializedName("deletedAt")
    private String deletedAt;

    @SerializedName("payload")
    private Map<String, Object> payload;

    public int getId() { return id; }
    public String getDeletedAt() { return deletedAt; }
    public Map<String, Object> getPayload() { return payload; }
}

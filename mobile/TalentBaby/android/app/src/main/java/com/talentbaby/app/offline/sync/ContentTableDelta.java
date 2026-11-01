package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class ContentTableDelta {
    @SerializedName("name")
    private String name;

    @SerializedName("upserts")
    private List<ContentUpsertRow> upserts;

    @SerializedName("deletes")
    private List<ContentDeleteRow> deletes;

    public String getName() { return name; }
    public List<ContentUpsertRow> getUpserts() { return upserts; }
    public List<ContentDeleteRow> getDeletes() { return deletes; }
}

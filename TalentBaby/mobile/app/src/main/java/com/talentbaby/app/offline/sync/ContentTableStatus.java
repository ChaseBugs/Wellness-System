package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

public class ContentTableStatus {
    @SerializedName("name")
    private String name;

    @SerializedName("version")
    private String version;

    @SerializedName("rowCount")
    private int rowCount;

    public String getName() { return name; }
    public String getVersion() { return version; }
    public int getRowCount() { return rowCount; }
}

package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class ContentDelta {
    @SerializedName("fromVersion")
    private String fromVersion;

    @SerializedName("fromAssetVersion")
    private String fromAssetVersion;

    @SerializedName("toVersion")
    private String toVersion;

    @SerializedName("toAssetVersion")
    private String toAssetVersion;

    @SerializedName("serverTime")
    private String serverTime;

    @SerializedName("tables")
    private List<ContentTableDelta> tables;

    @SerializedName("assets")
    private List<AssetDelta> assets;

    public String getFromVersion() { return fromVersion; }
    public String getFromAssetVersion() { return fromAssetVersion; }
    public String getToVersion() { return toVersion; }
    public String getToAssetVersion() { return toAssetVersion; }
    public String getServerTime() { return serverTime; }
    public List<ContentTableDelta> getTables() { return tables; }
    public List<AssetDelta> getAssets() { return assets; }
}

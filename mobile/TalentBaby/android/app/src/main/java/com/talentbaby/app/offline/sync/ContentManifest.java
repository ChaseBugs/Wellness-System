package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class ContentManifest {
    @SerializedName("contentVersion")
    private String contentVersion;

    @SerializedName("assetVersion")
    private String assetVersion;

    @SerializedName("serverTime")
    private String serverTime;

    @SerializedName("tables")
    private List<ContentTableStatus> tables;

    public String getContentVersion() { return contentVersion; }
    public String getAssetVersion() { return assetVersion; }
    public String getServerTime() { return serverTime; }
    public List<ContentTableStatus> getTables() { return tables; }
}

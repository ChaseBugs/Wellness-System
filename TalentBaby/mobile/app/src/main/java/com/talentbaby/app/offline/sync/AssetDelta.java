package com.talentbaby.app.offline.sync;

import com.google.gson.annotations.SerializedName;

public class AssetDelta {
    @SerializedName("path")
    private String path;

    @SerializedName("url")
    private String url;

    @SerializedName("checksum")
    private String checksum;

    @SerializedName("size")
    private long size;

    @SerializedName("updatedAt")
    private String updatedAt;

    public String getPath() { return path; }
    public String getUrl() { return url; }
    public String getChecksum() { return checksum; }
    public long getSize() { return size; }
    public String getUpdatedAt() { return updatedAt; }
}

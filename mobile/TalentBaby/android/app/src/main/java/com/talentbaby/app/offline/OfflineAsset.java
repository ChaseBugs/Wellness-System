package com.talentbaby.app.offline;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "offline_assets")
public class OfflineAsset {
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "asset_path")
    private String assetPath;

    @ColumnInfo(name = "local_path")
    private String localPath;

    @ColumnInfo(name = "checksum")
    private String checksum;

    @ColumnInfo(name = "size_bytes")
    private long sizeBytes;

    @ColumnInfo(name = "updated_at")
    private String updatedAt;

    public OfflineAsset(@NonNull String assetPath, String localPath, String checksum,
                        long sizeBytes, String updatedAt) {
        this.assetPath = assetPath;
        this.localPath = localPath;
        this.checksum = checksum;
        this.sizeBytes = sizeBytes;
        this.updatedAt = updatedAt;
    }

    @NonNull
    public String getAssetPath() { return assetPath; }
    public void setAssetPath(@NonNull String assetPath) { this.assetPath = assetPath; }

    public String getLocalPath() { return localPath; }
    public void setLocalPath(String localPath) { this.localPath = localPath; }

    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }

    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

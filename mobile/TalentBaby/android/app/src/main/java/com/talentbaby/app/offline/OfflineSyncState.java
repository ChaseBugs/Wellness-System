package com.talentbaby.app.offline;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "offline_sync_state")
public class OfflineSyncState {
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "state_key")
    private String key;

    @ColumnInfo(name = "state_value")
    private String value;

    @ColumnInfo(name = "updated_at")
    private String updatedAt;

    public OfflineSyncState(@NonNull String key, String value, String updatedAt) {
        this.key = key;
        this.value = value;
        this.updatedAt = updatedAt;
    }

    @NonNull
    public String getKey() { return key; }
    public void setKey(@NonNull String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

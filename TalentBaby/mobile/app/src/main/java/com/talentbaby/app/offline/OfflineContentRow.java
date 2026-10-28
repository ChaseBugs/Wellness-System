package com.talentbaby.app.offline;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;

@Entity(tableName = "offline_content_rows", primaryKeys = {"table_name", "remote_id"})
public class OfflineContentRow {
    @NonNull
    @ColumnInfo(name = "table_name")
    private String tableName;

    @ColumnInfo(name = "remote_id")
    private int remoteId;

    @ColumnInfo(name = "payload_json")
    private String payloadJson;

    @ColumnInfo(name = "updated_at")
    private String updatedAt;

    @ColumnInfo(name = "deleted_at")
    private String deletedAt;

    @ColumnInfo(name = "is_deleted")
    private boolean deleted;

    public OfflineContentRow(@NonNull String tableName, int remoteId, String payloadJson,
                             String updatedAt, String deletedAt, boolean deleted) {
        this.tableName = tableName;
        this.remoteId = remoteId;
        this.payloadJson = payloadJson;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.deleted = deleted;
    }

    @NonNull
    public String getTableName() { return tableName; }
    public void setTableName(@NonNull String tableName) { this.tableName = tableName; }

    public int getRemoteId() { return remoteId; }
    public void setRemoteId(int remoteId) { this.remoteId = remoteId; }

    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getDeletedAt() { return deletedAt; }
    public void setDeletedAt(String deletedAt) { this.deletedAt = deletedAt; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}

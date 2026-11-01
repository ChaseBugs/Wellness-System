package com.talentbaby.app.offline;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

@Dao
public interface OfflineContentDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void upsertRows(List<OfflineContentRow> rows);

    @Query("SELECT * FROM offline_content_rows WHERE table_name = :tableName AND is_deleted = 0 ORDER BY remote_id ASC")
    List<OfflineContentRow> getRows(String tableName);

    @Query("SELECT * FROM offline_content_rows WHERE table_name = :tableName AND remote_id = :remoteId LIMIT 1")
    OfflineContentRow getRow(String tableName, int remoteId);
}

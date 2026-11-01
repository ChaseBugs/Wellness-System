package com.talentbaby.app.offline;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

@Dao
public interface OfflineSyncStateDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void upsert(OfflineSyncState state);

    @Query("SELECT state_value FROM offline_sync_state WHERE state_key = :key LIMIT 1")
    String getValue(String key);
}

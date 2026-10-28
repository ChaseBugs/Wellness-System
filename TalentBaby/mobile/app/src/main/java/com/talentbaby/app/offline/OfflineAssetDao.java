package com.talentbaby.app.offline;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

@Dao
public interface OfflineAssetDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void upsertAssets(List<OfflineAsset> assets);

    @Query("SELECT * FROM offline_assets WHERE asset_path = :assetPath LIMIT 1")
    OfflineAsset getAsset(String assetPath);
}

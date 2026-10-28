package com.talentbaby.app.offline;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(
        entities = {
                OfflineContentRow.class,
                OfflineAsset.class,
                OfflineSyncState.class
        },
        version = 1,
        exportSchema = false
)
public abstract class OfflineDatabase extends RoomDatabase {
    private static volatile OfflineDatabase instance;

    public abstract OfflineContentDao contentDao();
    public abstract OfflineAssetDao assetDao();
    public abstract OfflineSyncStateDao syncStateDao();

    public static OfflineDatabase getInstance(Context context) {
        if (instance == null) {
            synchronized (OfflineDatabase.class) {
                if (instance == null) {
                    instance = Room.databaseBuilder(
                            context.getApplicationContext(),
                            OfflineDatabase.class,
                            "talent_baby_offline.db"
                    ).build();
                }
            }
        }
        return instance;
    }
}

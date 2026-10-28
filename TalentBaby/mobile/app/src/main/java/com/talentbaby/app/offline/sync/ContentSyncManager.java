package com.talentbaby.app.offline.sync;

import android.content.Context;
import android.util.Log;

import com.google.gson.Gson;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.offline.OfflineAsset;
import com.talentbaby.app.offline.OfflineContentRow;
import com.talentbaby.app.offline.OfflineDatabase;
import com.talentbaby.app.offline.OfflineSyncState;
import com.talentbaby.app.utils.ApiClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.ResponseBody;
import retrofit2.Response;

public class ContentSyncManager {
    private static final String TAG = "ContentSyncManager";
    private static final String KEY_CONTENT_VERSION = "content_version";
    private static final String KEY_ASSET_VERSION = "asset_version";
    private static final String KEY_LAST_SYNC_AT = "last_sync_at";

    private final Context context;
    private final OfflineDatabase database;
    private final OfflineModeManager modeManager;
    private final ContentSyncApiService apiService;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final Gson gson = new Gson();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public ContentSyncManager(Context context) {
        this.context = context.getApplicationContext();
        this.database = OfflineDatabase.getInstance(this.context);
        this.modeManager = new OfflineModeManager(this.context);
        this.apiService = ApiClient.getClient().create(ContentSyncApiService.class);
    }

    public void syncIfOnlineAsync() {
        executor.execute(() -> {
            try {
                syncIfOnline();
            } catch (Exception error) {
                Log.w(TAG, "Offline content sync skipped: " + error.getMessage());
            }
        });
    }

    public boolean syncIfOnline() throws IOException {
        if (!modeManager.hasNetwork()) {
            return false;
        }

        String localContentVersion = database.syncStateDao().getValue(KEY_CONTENT_VERSION);
        String localAssetVersion = database.syncStateDao().getValue(KEY_ASSET_VERSION);
        Response<ApiResponse<ContentManifest>> manifestResponse = apiService.getManifest().execute();
        if (!manifestResponse.isSuccessful() || manifestResponse.body() == null || manifestResponse.body().getData() == null) {
            return false;
        }

        ContentManifest manifest = manifestResponse.body().getData();
        boolean contentIsLower = isRemoteVersionNewer(localContentVersion, manifest.getContentVersion());
        boolean assetIsLower = isRemoteVersionNewer(localAssetVersion, manifest.getAssetVersion());

        if (!contentIsLower && !assetIsLower) {
            saveState(KEY_LAST_SYNC_AT, now());
            return false;
        }

        Response<ApiResponse<ContentDelta>> deltaResponse = apiService
                .getDelta(
                        contentIsLower ? localContentVersion : manifest.getContentVersion(),
                        assetIsLower ? localAssetVersion : manifest.getAssetVersion(),
                        assetIsLower
                )
                .execute();
        if (!deltaResponse.isSuccessful() || deltaResponse.body() == null || deltaResponse.body().getData() == null) {
            return false;
        }

        applyDelta(deltaResponse.body().getData());
        if (contentIsLower) {
            saveState(KEY_CONTENT_VERSION, manifest.getContentVersion());
        }
        if (assetIsLower) {
            saveState(KEY_ASSET_VERSION, manifest.getAssetVersion());
        }
        saveState(KEY_LAST_SYNC_AT, now());
        return true;
    }

    private void applyDelta(ContentDelta delta) throws IOException {
        List<OfflineContentRow> contentRows = new ArrayList<>();
        if (delta.getTables() != null) {
            for (ContentTableDelta table : delta.getTables()) {
                if (table.getUpserts() != null) {
                    for (ContentUpsertRow row : table.getUpserts()) {
                        contentRows.add(new OfflineContentRow(
                                table.getName(),
                                row.getId(),
                                gson.toJson(row.getPayload()),
                                row.getUpdatedAt(),
                                null,
                                false
                        ));
                    }
                }

                if (table.getDeletes() != null) {
                    for (ContentDeleteRow row : table.getDeletes()) {
                        contentRows.add(new OfflineContentRow(
                                table.getName(),
                                row.getId(),
                                gson.toJson(row.getPayload()),
                                null,
                                row.getDeletedAt(),
                                true
                        ));
                    }
                }
            }
        }

        if (!contentRows.isEmpty()) {
            database.contentDao().upsertRows(contentRows);
        }

        List<OfflineAsset> savedAssets = new ArrayList<>();
        if (delta.getAssets() != null) {
            for (AssetDelta asset : delta.getAssets()) {
                File localFile = downloadAsset(asset);
                savedAssets.add(new OfflineAsset(
                        asset.getPath(),
                        localFile.getAbsolutePath(),
                        asset.getChecksum(),
                        asset.getSize(),
                        asset.getUpdatedAt()
                ));
            }
        }

        if (!savedAssets.isEmpty()) {
            database.assetDao().upsertAssets(savedAssets);
        }
    }

    private File downloadAsset(AssetDelta asset) throws IOException {
        File root = new File(context.getFilesDir(), "offline_assets/images");
        File target = safeAssetFile(root, asset.getPath());

        if (target.exists() && asset.getChecksum() != null && asset.getChecksum().equals(sha256(target))) {
            return target;
        }

        if (target.getParentFile() != null && !target.getParentFile().exists()) {
            boolean ignored = target.getParentFile().mkdirs();
        }

        String url = asset.getUrl();
        if (url != null && url.startsWith("/")) {
            url = ApiClient.getBaseUrl() + url.substring(1);
        }

        Request request = new Request.Builder().url(url).build();
        try (okhttp3.Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Asset download failed: " + response.code());
            }
            ResponseBody body = response.body();
            if (body == null) throw new IOException("Asset response body is empty");

            try (FileOutputStream output = new FileOutputStream(target)) {
                output.write(body.bytes());
            }
        }

        if (asset.getChecksum() != null && !asset.getChecksum().equals(sha256(target))) {
            boolean ignored = target.delete();
            throw new IOException("Asset checksum mismatch: " + asset.getPath());
        }

        return target;
    }

    private File safeAssetFile(File root, String relativePath) throws IOException {
        File target = new File(root, relativePath == null ? "" : relativePath);
        String rootPath = root.getCanonicalPath();
        String targetPath = target.getCanonicalPath();
        if (!targetPath.startsWith(rootPath + File.separator)) {
            throw new IOException("Invalid asset path: " + relativePath);
        }
        return target;
    }

    private String sha256(File file) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            try (FileInputStream input = new FileInputStream(file)) {
                int read;
                while ((read = input.read(buffer)) != -1) {
                    digest.update(buffer, 0, read);
                }
            }
            byte[] hash = digest.digest();
            StringBuilder builder = new StringBuilder();
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception error) {
            throw new IOException("Unable to hash file", error);
        }
    }

    private void saveState(String key, String value) {
        database.syncStateDao().upsert(new OfflineSyncState(key, value, now()));
    }

    private boolean isRemoteVersionNewer(String localVersion, String remoteVersion) {
        if (remoteVersion == null || remoteVersion.trim().isEmpty()) return false;
        if (localVersion == null || localVersion.trim().isEmpty()) return true;
        return remoteVersion.compareTo(localVersion) > 0;
    }

    private String now() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        return format.format(new Date());
    }
}

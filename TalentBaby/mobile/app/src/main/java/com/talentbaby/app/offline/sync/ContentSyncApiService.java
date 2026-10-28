package com.talentbaby.app.offline.sync;

import com.talentbaby.app.models.ApiResponse;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface ContentSyncApiService {
    @GET("content-sync/manifest")
    Call<ApiResponse<ContentManifest>> getManifest();

    @GET("content-sync/delta")
    Call<ApiResponse<ContentDelta>> getDelta(
            @Query("since") String since,
            @Query("asset_since") String assetSince,
            @Query("include_assets") boolean includeAssets
    );
}

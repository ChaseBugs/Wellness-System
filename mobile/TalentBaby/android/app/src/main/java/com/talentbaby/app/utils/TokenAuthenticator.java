package com.talentbaby.app.utils;

import android.content.Context;

import com.google.gson.JsonObject;
import com.google.gson.Gson;
import com.talentbaby.app.TalentBabyApplication;

import java.io.IOException;

import okhttp3.Authenticator;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.Route;

/**
 * Access tokens last 15 minutes. On a 401 this rotates the refresh token once through
 * POST /auth/refresh and retries the request; if that fails the user has to sign in again.
 */
public class TokenAuthenticator implements Authenticator {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient refreshClient = new OkHttpClient();

    @Override
    public synchronized Request authenticate(Route route, Response response) throws IOException {
        if (response.request().url().encodedPath().endsWith("/auth/refresh") || responseCount(response) > 1) {
            return null;
        }
        Context context = TalentBabyApplication.getAppContext();
        String sentToken = response.request().header("Authorization");
        String currentToken = TokenManager.getToken(context);
        // Another request already refreshed while this one was in flight.
        if (currentToken != null && sentToken != null && !sentToken.equals("Bearer " + currentToken)) {
            return withToken(response.request(), currentToken);
        }

        String refreshToken = TokenManager.getRefreshToken(context);
        if (refreshToken == null) return null;

        JsonObject body = new JsonObject();
        body.addProperty("refreshToken", refreshToken);
        Request refresh = new Request.Builder()
                .url(ApiClient.BASE_URL + "auth/refresh")
                .header("X-App-Code", ApiClient.APP_CODE)
                .post(RequestBody.create(body.toString(), JSON))
                .build();
        try (Response refreshed = refreshClient.newCall(refresh).execute()) {
            if (!refreshed.isSuccessful() || refreshed.body() == null) {
                TokenManager.clearToken(context);
                return null;
            }
            // { data: { tokenType, accessToken, refreshToken, expiresIn } }
            JsonObject tokens = new Gson().fromJson(refreshed.body().string(), JsonObject.class)
                    .getAsJsonObject("data");
            String accessToken = tokens.get("accessToken").getAsString();
            TokenManager.saveTokens(context, accessToken, tokens.get("refreshToken").getAsString());
            return withToken(response.request(), accessToken);
        } catch (RuntimeException parseError) {
            return null;
        }
    }

    private static Request withToken(Request request, String token) {
        return request.newBuilder().header("Authorization", "Bearer " + token).build();
    }

    private static int responseCount(Response response) {
        int count = 1;
        while ((response = response.priorResponse()) != null) count++;
        return count;
    }
}

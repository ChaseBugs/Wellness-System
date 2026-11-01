package com.heightincrease.app.network;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Blocking client for the Wellness Platform backend (repo-root backend/). Call it off the main thread.
 * Responses use the envelope { success, data, meta } or { success: false, error: { code, message } };
 * request() returns the unwrapped data (a JSONObject or JSONArray). A 401 on an authenticated call
 * refreshes the token pair once through auth/refresh and retries.
 */
public class ApiClient {
    /** The emulator reaches the host machine at 10.0.2.2; use the host's LAN IP on a device. */
    public static final String BASE_URL = "http://10.0.2.2:4500/api/v1/";
    public static final String APP_CODE = "height-increase";
    /** HeightIncrease endpoints; auth endpoints sit at the API root. */
    public static final String APP = "apps/height-increase/";

    private static final int TIMEOUT_MS = 15_000;
    private static final Object REFRESH_LOCK = new Object();

    private final Session session;

    public ApiClient(Session session) {
        this.session = session;
    }

    public Object get(String path, boolean auth) throws ApiException {
        return request("GET", path, null, auth);
    }

    public Object request(String method, String path, JSONObject body, boolean auth) throws ApiException {
        String token = auth ? session.accessToken() : null;
        try {
            return execute(method, path, body, token);
        } catch (ApiException error) {
            if (!auth || error.status != 401 || session.refreshToken() == null) {
                throw error;
            }
            return execute(method, path, body, refresh(token));
        }
    }

    /** Rotates the token pair. A rejected refresh token means the session is over. */
    private String refresh(String staleToken) throws ApiException {
        synchronized (REFRESH_LOCK) {
            String current = session.accessToken();
            if (current != null && !current.equals(staleToken)) {
                return current;
            }
            try {
                JSONObject payload = new JSONObject().put("refreshToken", session.refreshToken());
                JSONObject data = (JSONObject) execute("POST", "auth/refresh", payload, null);
                JSONObject tokens = data.optJSONObject("tokens") != null ? data.optJSONObject("tokens") : data;
                session.save(tokens.getString("accessToken"), tokens.getString("refreshToken"));
                return tokens.getString("accessToken");
            } catch (ApiException error) {
                if (error.status == 400 || error.status == 401) {
                    session.clear();
                }
                throw error;
            } catch (JSONException error) {
                throw new ApiException(500, "BAD_RESPONSE", "Unexpected server response.");
            }
        }
    }

    private Object execute(String method, String path, JSONObject body, String token) throws ApiException {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(BASE_URL + path).openConnection();
            connection.setRequestMethod(method);
            connection.setConnectTimeout(TIMEOUT_MS);
            connection.setReadTimeout(TIMEOUT_MS);
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("X-App-Code", APP_CODE);
            if (token != null) {
                connection.setRequestProperty("Authorization", "Bearer " + token);
            }
            if (body != null) {
                byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(bytes);
                }
            }

            int status = connection.getResponseCode();
            InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
            String text = stream == null ? "" : read(stream);
            JSONObject envelope = text.isEmpty() ? new JSONObject() : new JSONObject(text);
            if (status >= 400 || !envelope.optBoolean("success", false)) {
                JSONObject error = envelope.optJSONObject("error");
                String code = error != null ? error.optString("code", "HTTP_" + status) : "HTTP_" + status;
                String message = error != null ? error.optString("message", "Request failed.") : "Request failed.";
                throw new ApiException(status, code, message);
            }
            return envelope.opt("data");
        } catch (IOException error) {
            throw ApiException.offline(error);
        } catch (JSONException error) {
            throw new ApiException(500, "BAD_RESPONSE", "Unexpected server response.");
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String read(InputStream stream) throws IOException {
        try (InputStream in = stream; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = in.read(buffer)) != -1) {
                out.write(buffer, 0, count);
            }
            return out.toString(StandardCharsets.UTF_8.name());
        }
    }
}

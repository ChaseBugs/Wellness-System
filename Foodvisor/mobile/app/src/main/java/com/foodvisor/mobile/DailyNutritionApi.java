package com.foodvisor.mobile;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

final class DailyNutritionApi {
    interface Callback {
        void onSuccess(NutritionModels.Result result);

        void onError(Exception error);
    }

    private final String apiBaseUrl;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    DailyNutritionApi(String apiBaseUrl) {
        this.apiBaseUrl = trimSlash(apiBaseUrl);
    }

    void resolve(NutritionModels.Profile profile, Callback callback) {
        NutritionModels.Profile requestProfile = profile.copy();
        new Thread(() -> {
            try {
                NutritionModels.Result result = requestTargets(requestProfile);
                mainHandler.post(() -> callback.onSuccess(result));
            } catch (Exception error) {
                mainHandler.post(() -> callback.onError(error));
            }
        }).start();
    }

    private NutritionModels.Result requestTargets(NutritionModels.Profile profile) throws Exception {
        URL url = new URL(apiBaseUrl + "/daily-targets/resolve");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(15000);
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        connection.setRequestProperty("Accept", "application/json");
        connection.setDoOutput(true);

        JSONObject body = new JSONObject();
        body.put("age", profile.age);
        body.put("gender", profile.gender);
        body.put("populationGroup", profile.populationGroup);
        body.put("lifeStage", profile.lifeStage);
        body.put("physicalActivityLevel", profile.physicalActivityLevel);

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(connection.getOutputStream(), StandardCharsets.UTF_8))) {
            writer.write(body.toString());
        }

        int statusCode = connection.getResponseCode();
        InputStream stream = statusCode >= 200 && statusCode < 300
                ? connection.getInputStream()
                : connection.getErrorStream();
        String response = readFully(stream);
        connection.disconnect();

        if (statusCode < 200 || statusCode >= 300) {
            throw new IllegalStateException(response.isEmpty() ? "API request failed: " + statusCode : response);
        }

        return parseResult(new JSONObject(response));
    }

    private NutritionModels.Result parseResult(JSONObject root) {
        NutritionModels.Result result = new NutritionModels.Result();
        result.count = root.optInt("count", 0);

        JSONObject profileJson = root.optJSONObject("profile");
        if (profileJson != null) {
            result.profile.age = profileJson.optInt("age", result.profile.age);
            result.profile.gender = profileJson.optString("gender", result.profile.gender);
            result.profile.populationGroup = profileJson.optString("populationGroup", result.profile.populationGroup);
            result.profile.lifeStage = profileJson.optString("lifeStage", result.profile.lifeStage);
            result.profile.physicalActivityLevel = profileJson.optString("physicalActivityLevel", result.profile.physicalActivityLevel);
        }

        JSONArray warningsJson = root.optJSONArray("warnings");
        if (warningsJson != null) {
            for (int i = 0; i < warningsJson.length(); i++) {
                JSONObject warning = warningsJson.optJSONObject(i);
                if (warning != null) {
                    result.warnings.add(warning.optString("message"));
                }
            }
        }

        JSONArray targetsJson = root.optJSONArray("targets");
        if (targetsJson != null) {
            for (int i = 0; i < targetsJson.length(); i++) {
                JSONObject targetJson = targetsJson.optJSONObject(i);
                if (targetJson != null) {
                    result.targets.add(parseTarget(targetJson));
                }
            }
        }

        return result;
    }

    private NutritionModels.DailyTarget parseTarget(JSONObject json) {
        NutritionModels.DailyTarget target = new NutritionModels.DailyTarget();
        target.key = json.optString("nutrientKey");
        target.label = json.optString("nutrientLabel", target.key);
        target.unit = json.optString("unit");
        target.upperLimit = numberOrNull(json, "UL");

        String[] goalTypes = {"RNI", "AI", "EER", "EAR"};
        JSONObject units = json.optJSONObject("units");
        for (String type : goalTypes) {
            Double value = numberOrNull(json, type);
            if (value != null) {
                target.goalType = type;
                target.goal = value;
                target.hasGoal = true;
                if (units != null) {
                    target.unit = units.optString(type, target.unit);
                }
                break;
            }
        }

        JSONObject amdr = json.optJSONObject("AMDR");
        if (amdr != null) {
            String unit = amdr.optString("unit", "");
            Double value = numberOrNull(amdr, "value");
            Double min = numberOrNull(amdr, "min");
            Double max = numberOrNull(amdr, "max");
            if (value != null) {
                target.amdr = NutritionModels.format(value) + unit;
            } else if (min != null && max != null) {
                target.amdr = NutritionModels.format(min) + "-" + NutritionModels.format(max) + unit;
            }
        }

        return target;
    }

    private static Double numberOrNull(JSONObject json, String key) {
        if (!json.has(key) || json.isNull(key)) {
            return null;
        }
        return json.optDouble(key);
    }

    private static String readFully(InputStream stream) throws Exception {
        if (stream == null) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }

    private static String trimSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}

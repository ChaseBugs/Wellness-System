package com.heightincrease.app.repository;

import android.content.Context;
import android.content.SharedPreferences;

import com.heightincrease.app.model.WorkoutStep;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** The user's own exercise list ("My training"), kept on the device. */
public class MyTrainingStore {
    private static final String PREFS = "height_my_training";
    private static final String KEY = "steps";
    /** Rest between exercises in a custom workout. */
    public static final int REST_SECONDS = 10;

    private final SharedPreferences prefs;

    public MyTrainingStore(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public List<WorkoutStep> load() {
        List<WorkoutStep> steps = new ArrayList<>();
        try {
            JSONArray rows = new JSONArray(prefs.getString(KEY, "[]"));
            for (int i = 0; i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                steps.add(new WorkoutStep(row.getString("exerciseId"), row.getString("name"), row.getInt("durationSeconds"),
                        REST_SECONDS, strings(row.optJSONArray("instructions")), strings(row.optJSONArray("safetyNotes"))));
            }
        } catch (JSONException error) {
            return new ArrayList<>();
        }
        return steps;
    }

    public void save(List<WorkoutStep> steps) {
        JSONArray rows = new JSONArray();
        try {
            for (WorkoutStep step : steps) {
                rows.put(new JSONObject()
                        .put("exerciseId", step.exerciseId)
                        .put("name", step.name)
                        .put("durationSeconds", step.durationSeconds)
                        .put("instructions", new JSONArray(step.instructions))
                        .put("safetyNotes", new JSONArray(step.safetyNotes)));
            }
        } catch (JSONException error) {
            return;
        }
        prefs.edit().putString(KEY, rows.toString()).apply();
    }

    private static List<String> strings(JSONArray array) {
        if (array == null) {
            return Collections.emptyList();
        }
        List<String> values = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            values.add(array.optString(i));
        }
        return values;
    }
}

package com.heightincrease.app.repository;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.heightincrease.app.model.Article;
import com.heightincrease.app.model.DayLog;
import com.heightincrease.app.model.Exercise;
import com.heightincrease.app.model.Goal;
import com.heightincrease.app.model.OnboardingProfile;
import com.heightincrease.app.model.PlanCard;
import com.heightincrease.app.model.ReportData;
import com.heightincrease.app.model.ReportSummary;
import com.heightincrease.app.model.Workout;
import com.heightincrease.app.model.WorkoutStep;
import com.heightincrease.app.network.ApiClient;
import com.heightincrease.app.network.ApiException;
import com.heightincrease.app.network.Session;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Platform data for the screens. Calls run on a background thread and report back on the main thread.
 * The catalog (articles, training plans, exercises) is public; workouts, logs, measurements and goals
 * need an account, because height and body data stay in the user's own HeightIncrease records.
 */
public class RemoteRepository {
    public interface Callback<T> {
        void onSuccess(T value);

        void onError(String message);
    }

    private interface Task<T> {
        T run() throws ApiException, JSONException;
    }

    /** Days of logs a report reads: enough for the week strip, the weight trend and the history list. */
    public static final int REPORT_DAYS = 30;
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();

    private final Handler main = new Handler(Looper.getMainLooper());
    private final Session session;
    private final ApiClient api;
    private final ProfileStore profiles;

    public RemoteRepository(Context context) {
        session = new Session(context);
        api = new ApiClient(session);
        profiles = new ProfileStore(context);
    }

    public boolean isSignedIn() {
        return session.isSignedIn();
    }

    public String email() {
        return session.email();
    }

    /** The device's local date (YYYY-MM-DD); logs are dated by it. */
    public static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    // ---- Public catalog ----

    public void articles(Callback<List<Article>> callback) {
        run(() -> {
            JSONArray rows = (JSONArray) api.get(ApiClient.APP + "articles", false);
            List<Article> articles = new ArrayList<>();
            for (int i = 0; i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                articles.add(new Article(
                        row.getString("id"),
                        row.getString("title"),
                        text(row, "excerpt"),
                        text(row, "body"),
                        text(row, "category"),
                        row.optBoolean("isFeatured"),
                        row.optBoolean("expertReviewed")));
            }
            return articles;
        }, callback);
    }

    public void trainingPlans(Callback<List<PlanCard>> callback) {
        run(() -> {
            JSONArray rows = (JSONArray) api.get(ApiClient.APP + "training-plans", false);
            List<PlanCard> plans = new ArrayList<>();
            for (int i = 0; i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                String subtitle = text(row, "subtitle");
                if (subtitle.isEmpty()) {
                    int minutes = row.optInt("estimatedMinutes", 0);
                    subtitle = (minutes > 0 ? minutes + " min · " : "") + row.optString("level", "beginner");
                }
                plans.add(new PlanCard(row.getString("id"), row.getString("title"), subtitle, "START", 0, i == 0));
            }
            return plans;
        }, callback);
    }

    public void exercises(Callback<List<Exercise>> callback) {
        run(() -> {
            JSONArray rows = (JSONArray) api.get(ApiClient.APP + "exercises", false);
            List<Exercise> exercises = new ArrayList<>();
            for (int i = 0; i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                exercises.add(new Exercise(
                        row.getString("id"),
                        row.getString("title"),
                        text(row, "description"),
                        row.isNull("durationSeconds") ? 30 : row.optInt("durationSeconds", 30),
                        strings(row.optJSONArray("steps")),
                        strings(row.optJSONArray("tips")),
                        strings(row.optJSONArray("safetyNotes")),
                        strings(row.optJSONArray("targetAreas")),
                        row.optBoolean("expertReviewed")));
            }
            return exercises;
        }, callback);
    }

    // ---- Workouts ----

    /** A published training plan with its steps (GET routines/:id). */
    public void workout(String routineId, Callback<Workout> callback) {
        run(() -> {
            JSONObject data = (JSONObject) api.get(ApiClient.APP + "routines/" + routineId, true);
            JSONArray rows = data.getJSONArray("steps");
            List<WorkoutStep> steps = new ArrayList<>();
            for (int i = 0; i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                List<String> instructions = new ArrayList<>();
                if (!row.isNull("notes") && !row.optString("notes").isEmpty()) {
                    instructions.add(row.optString("notes"));
                }
                if (!row.isNull("reps")) {
                    instructions.add(0, (row.isNull("sets") ? "" : row.optInt("sets") + " × ") + row.optInt("reps") + " reps");
                }
                steps.add(new WorkoutStep(
                        row.optString("exerciseId"),
                        row.getString("name"),
                        row.isNull("durationSeconds") ? 30 : row.optInt("durationSeconds", 30),
                        row.isNull("restSeconds") ? 10 : row.optInt("restSeconds", 10),
                        instructions,
                        strings(row.optJSONArray("safetyNotes"))));
            }
            return new Workout(routineId, data.getString("title"), steps);
        }, callback);
    }

    /** Starts a Routine Engine session for a plan; returns its id. */
    public void startSession(String routineId, Callback<String> callback) {
        run(() -> {
            JSONObject data = (JSONObject) api.request("POST", ApiClient.APP + "sessions",
                    new JSONObject().put("routineId", routineId), true);
            return data.getString("id");
        }, callback);
    }

    public void abandonSession(String sessionId) {
        run(() -> {
            api.request("POST", ApiClient.APP + "sessions/" + sessionId + "/abandon", null, true);
            return null;
        }, ignore());
    }

    /**
     * Records a finished workout: completes the plan's session (if any) and adds the minutes and
     * exercises to today's log, keeping what earlier workouts today recorded.
     */
    public void finishWorkout(String sessionId, int completedSteps, int durationSeconds,
                              List<String> exerciseNames, Callback<Void> callback) {
        run(() -> {
            if (sessionId != null) {
                api.request("POST", ApiClient.APP + "sessions/" + sessionId + "/complete", new JSONObject()
                        .put("completedSteps", completedSteps)
                        .put("durationSeconds", durationSeconds), true);
            }
            String today = today();
            JSONObject todayLog = todayLog(today);
            int minutes = (todayLog == null ? 0 : todayLog.optInt("workoutMinutes")) + Math.max(1, Math.round(durationSeconds / 60f));
            JSONArray done = todayLog == null || todayLog.optJSONArray("completedExercises") == null
                    ? new JSONArray() : todayLog.getJSONArray("completedExercises");
            for (String name : exerciseNames) {
                done.put(new JSONObject().put("title", name));
            }
            api.request("POST", ApiClient.APP + "logs", new JSONObject()
                    .put("date", today)
                    .put("workoutMinutes", minutes)
                    .put("completedExercises", done), true);
            return null;
        }, callback);
    }

    // ---- Reports and records ----

    public void report(Callback<ReportData> callback) {
        run(() -> {
            String today = today();
            JSONObject data = (JSONObject) api.get(ApiClient.APP + "reports?limit=" + REPORT_DAYS + "&today=" + today, true);
            JSONObject summary = data.getJSONObject("summary");
            JSONArray rows = data.optJSONArray("logs");
            List<DayLog> logs = new ArrayList<>();
            for (int i = 0; rows != null && i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                logs.add(new DayLog(row.getString("date"), row.optInt("workoutMinutes"),
                        number(row, "sleepHours"), number(row, "weightKg"), number(row, "heightCm")));
            }
            // The tiles cover the current week (Sunday to today).
            String weekStart = weekStart();
            int workouts = 0;
            int minutes = 0;
            double sleepTotal = 0;
            int sleepDays = 0;
            for (DayLog log : logs) {
                if (log.date.compareTo(weekStart) < 0) {
                    continue;
                }
                if (log.workoutMinutes > 0) {
                    workouts++;
                    minutes += log.workoutMinutes;
                }
                if (log.sleepHours != null) {
                    sleepTotal += log.sleepHours;
                    sleepDays++;
                }
            }
            ReportSummary week = new ReportSummary(workouts, minutes,
                    sleepDays == 0 ? 0 : Math.round(sleepTotal / sleepDays * 10) / 10.0,
                    summary.optInt("streakDays"), number(summary, "currentHeightCm"), number(summary, "targetHeightCm"));
            return new ReportData(week, logs);
        }, callback);
    }

    /** Records today's height (it becomes the latest measurement). */
    public void recordHeight(double heightCm, Callback<Void> callback) {
        run(() -> {
            api.request("POST", ApiClient.APP + "measurements", new JSONObject()
                    .put("measuredOn", today()).put("heightCm", round1(heightCm)), true);
            return null;
        }, callback);
    }

    /** Records weight (and height, if given) in today's log; a height also updates the measurements. */
    public void recordBody(double weightKg, Double heightCm, Callback<Void> callback) {
        run(() -> {
            JSONObject body = new JSONObject().put("date", today()).put("weightKg", round1(weightKg));
            if (heightCm != null) {
                body.put("heightCm", round1(heightCm));
            }
            api.request("POST", ApiClient.APP + "logs", body, true);
            return null;
        }, callback);
    }

    /** Records last night's sleep on today's log. */
    public void recordSleep(double hours, Callback<Void> callback) {
        run(() -> {
            api.request("POST", ApiClient.APP + "logs", new JSONObject()
                    .put("date", today()).put("sleepHours", Math.round(hours * 100) / 100.0), true);
            return null;
        }, callback);
    }

    // ---- Weekly goal ----

    public void weeklyGoal(Callback<Goal> callback) {
        run(() -> {
            JSONArray rows = (JSONArray) api.get(ApiClient.APP + "goals?status=active", true);
            for (int i = 0; i < rows.length(); i++) {
                JSONObject row = rows.getJSONObject(i);
                if ("workout".equals(row.optString("type")) && !row.isNull("targetValue")) {
                    return new Goal(row.getString("id"), (int) Math.round(row.getDouble("targetValue")));
                }
            }
            return null;
        }, callback);
    }

    public void saveWeeklyGoal(Goal existing, int daysPerWeek, Callback<Goal> callback) {
        run(() -> {
            JSONObject body = new JSONObject()
                    .put("title", "Work out " + daysPerWeek + (daysPerWeek == 1 ? " day" : " days") + " a week")
                    .put("targetValue", daysPerWeek)
                    .put("unit", "days/week");
            JSONObject data;
            if (existing == null) {
                data = (JSONObject) api.request("POST", ApiClient.APP + "goals", body.put("type", "workout"), true);
            } else {
                data = (JSONObject) api.request("PATCH", ApiClient.APP + "goals/" + existing.id, body, true);
            }
            return new Goal(data.getString("id"), daysPerWeek);
        }, callback);
    }

    // ---- Account ----

    /** Signs in, or creates the account first, then syncs the onboarding answers once. */
    public void signIn(String email, String password, boolean create, Callback<Void> callback) {
        run(() -> {
            JSONObject payload = new JSONObject().put("email", email).put("password", password);
            JSONObject data = (JSONObject) api.request("POST", create ? "auth/register" : "auth/login", payload, false);
            JSONObject tokens = data.getJSONObject("tokens");
            session.signedIn(data.getJSONObject("user").getString("email"),
                    tokens.getString("accessToken"), tokens.getString("refreshToken"));
            syncProfile();
            return null;
        }, callback);
    }

    public void syncOnboarding(Callback<Void> callback) {
        run(() -> {
            syncProfile();
            return null;
        }, callback);
    }

    /** Saves the HeightIncrease preferences on the account (units and push notifications). */
    public void savePreferences(boolean imperial, boolean notificationsEnabled, Callback<Void> callback) {
        run(() -> {
            api.request("PATCH", ApiClient.APP + "profile", new JSONObject()
                    .put("units", imperial ? "imperial" : "metric")
                    .put("notificationsEnabled", notificationsEnabled), true);
            return null;
        }, callback);
    }

    public void signOut(Callback<Void> callback) {
        String refreshToken = session.refreshToken();
        session.clear();
        run(() -> {
            if (refreshToken != null) {
                api.request("POST", "auth/logout", new JSONObject().put("refreshToken", refreshToken), false);
            }
            return null;
        }, callback);
    }

    /** Sends the onboarding gender and height as the first measurement. Age stays on the device. */
    private void syncProfile() throws ApiException, JSONException {
        if (!session.isSignedIn() || !profiles.isOnboarded() || profiles.isSynced()) {
            return;
        }
        OnboardingProfile profile = profiles.load();
        api.request("PATCH", ApiClient.APP + "profile",
                new JSONObject().put("gender", profile.gender.toLowerCase(Locale.US)), true);
        api.request("POST", ApiClient.APP + "measurements",
                new JSONObject().put("measuredOn", today()).put("heightCm", profile.heightCm), true);
        profiles.markSynced();
    }

    private JSONObject todayLog(String today) throws ApiException, JSONException {
        JSONObject data = (JSONObject) api.get(ApiClient.APP + "reports?limit=1&today=" + today, true);
        JSONArray logs = data.optJSONArray("logs");
        if (logs != null && logs.length() > 0 && today.equals(logs.getJSONObject(0).optString("date"))) {
            return logs.getJSONObject(0);
        }
        return null;
    }

    private <T> void run(Task<T> task, Callback<T> callback) {
        EXECUTOR.execute(() -> {
            try {
                T value = task.run();
                main.post(() -> callback.onSuccess(value));
            } catch (ApiException error) {
                main.post(() -> callback.onError(error.getMessage()));
            } catch (JSONException | ClassCastException error) {
                main.post(() -> callback.onError("Unexpected server response."));
            }
        });
    }

    private static <T> Callback<T> ignore() {
        return new Callback<T>() {
            @Override
            public void onSuccess(T value) {
            }

            @Override
            public void onError(String message) {
            }
        };
    }

    private static String weekStart() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, Calendar.SUNDAY - calendar.get(Calendar.DAY_OF_WEEK));
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.getTime());
    }

    private static double round1(double value) {
        return Math.round(value * 10) / 10.0;
    }

    private static String text(JSONObject row, String key) {
        return row.isNull(key) ? "" : row.optString(key, "");
    }

    private static Double number(JSONObject row, String key) {
        return row.isNull(key) ? null : row.optDouble(key);
    }

    private static List<String> strings(JSONArray array) {
        if (array == null) {
            return Collections.emptyList();
        }
        List<String> values = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            String value = array.optString(i);
            if (!value.isEmpty()) {
                values.add(value);
            }
        }
        return values;
    }
}

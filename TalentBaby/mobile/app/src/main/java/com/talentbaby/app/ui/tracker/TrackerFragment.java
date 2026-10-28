package com.talentbaby.app.ui.tracker;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.DiaperChange;
import com.talentbaby.app.models.FeedingRecord;
import com.talentbaby.app.models.GrowthRecord;
import com.talentbaby.app.models.SleepSession;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TrackerFragment extends Fragment {

    private TextView btnDateYesterday, btnDateToday, btnDateTomorrow;
    private TextView textFeedingCount, textSleepCount, textDiaperCount, textGrowthSummary;
    private LinearLayout layoutFeedingEntries, layoutSleepEntries, layoutDiaperEntries, layoutGrowthEntries;

    private ApiService apiService;
    private int babyId = -1;
    private int dateOffset = 0; // 0 = today, -1 = yesterday, +1 = tomorrow

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_tracker, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        apiService = ApiClient.getClient().create(ApiService.class);
        babyId = TokenManager.getBabyId(requireContext());
        initViews(view);
        loadAllTrackers();
    }

    private void initViews(View view) {
        btnDateYesterday = view.findViewById(R.id.btnDateYesterday);
        btnDateToday     = view.findViewById(R.id.btnDateToday);
        btnDateTomorrow  = view.findViewById(R.id.btnDateTomorrow);

        textFeedingCount  = view.findViewById(R.id.textFeedingCount);
        textSleepCount    = view.findViewById(R.id.textSleepCount);
        textDiaperCount   = view.findViewById(R.id.textDiaperCount);
        textGrowthSummary = view.findViewById(R.id.textGrowthSummary);

        layoutFeedingEntries = view.findViewById(R.id.layoutFeedingEntries);
        layoutSleepEntries   = view.findViewById(R.id.layoutSleepEntries);
        layoutDiaperEntries  = view.findViewById(R.id.layoutDiaperEntries);
        layoutGrowthEntries  = view.findViewById(R.id.layoutGrowthEntries);

        view.findViewById(R.id.btnMenuTracker).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });
        view.findViewById(R.id.btnParentingSupportTracker).setOnClickListener(v ->
                startActivity(new android.content.Intent(requireContext(), com.talentbaby.app.activities.ParentingSupportActivity.class)));

        btnDateYesterday.setOnClickListener(v -> selectDate(-1));
        btnDateToday.setOnClickListener(v -> selectDate(0));
        btnDateTomorrow.setOnClickListener(v -> selectDate(1));

        view.findViewById(R.id.btnLogFeeding).setOnClickListener(v -> showFeedingDialog());
        view.findViewById(R.id.btnLogSleep).setOnClickListener(v -> showSleepDialog());
        view.findViewById(R.id.btnLogDiaper).setOnClickListener(v -> showDiaperDialog());
        view.findViewById(R.id.btnLogGrowth).setOnClickListener(v -> showGrowthDialog());
    }

    private void selectDate(int offset) {
        dateOffset = offset;
        int selectedBg = R.drawable.bg_date_selected;
        int unselectedBg = R.drawable.bg_date_unselected;
        int selectedColor = android.R.color.white;
        int unselectedColor = R.color.text_secondary;

        btnDateYesterday.setBackgroundResource(offset == -1 ? selectedBg : unselectedBg);
        btnDateYesterday.setTextColor(requireContext().getColor(offset == -1 ? selectedColor : unselectedColor));
        btnDateToday.setBackgroundResource(offset == 0 ? selectedBg : unselectedBg);
        btnDateToday.setTextColor(requireContext().getColor(offset == 0 ? selectedColor : unselectedColor));
        btnDateTomorrow.setBackgroundResource(offset == 1 ? selectedBg : unselectedBg);
        btnDateTomorrow.setTextColor(requireContext().getColor(offset == 1 ? selectedColor : unselectedColor));

        loadAllTrackers();
    }

    private void loadAllTrackers() {
        if (babyId == -1) return;
        String dateStr = getDateForOffset(dateOffset);
        String startDate = dateStr + "T00:00:00.000Z";
        String endDate   = dateStr + "T23:59:59.999Z";

        loadFeedings(startDate, endDate);
        loadSleep(startDate, endDate);
        loadDiapers(startDate, endDate);
        loadGrowth();
    }

    private void loadFeedings(String start, String end) {
        apiService.getFeedings(babyId, start, end).enqueue(new Callback<ApiResponse<List<FeedingRecord>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<FeedingRecord>>> call,
                                   @NonNull Response<ApiResponse<List<FeedingRecord>>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    List<FeedingRecord> records = response.body().getData();
                    textFeedingCount.setText(getContext().getString(R.string.tracker_count, records.size()));
                    showFeedingEntries(records);
                } else {
                    textFeedingCount.setText(R.string.no_records_today);
                    layoutFeedingEntries.setVisibility(View.GONE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<FeedingRecord>>> call, @NonNull Throwable t) {
                if (isAdded()) textFeedingCount.setText(R.string.no_records_today);
            }
        });
    }

    private void loadSleep(String start, String end) {
        apiService.getSleepSessions(babyId, start, end).enqueue(new Callback<ApiResponse<List<SleepSession>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<SleepSession>>> call,
                                   @NonNull Response<ApiResponse<List<SleepSession>>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    List<SleepSession> records = response.body().getData();
                    int totalMin = 0;
                    for (SleepSession s : records) {
                        if (s.getDurationMinutes() != null) totalMin += s.getDurationMinutes();
                    }
                    textSleepCount.setText(getString(R.string.tracker_sleep_summary,
                            totalMin / 60, totalMin % 60));
                    showSleepEntries(records);
                } else {
                    textSleepCount.setText(R.string.no_records_today);
                    layoutSleepEntries.setVisibility(View.GONE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<SleepSession>>> call, @NonNull Throwable t) {
                if (isAdded()) textSleepCount.setText(R.string.no_records_today);
            }
        });
    }

    private void loadDiapers(String start, String end) {
        apiService.getDiaperChanges(babyId, start, end).enqueue(new Callback<ApiResponse<List<DiaperChange>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<DiaperChange>>> call,
                                   @NonNull Response<ApiResponse<List<DiaperChange>>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    List<DiaperChange> records = response.body().getData();
                    textDiaperCount.setText(getContext().getString(R.string.tracker_count, records.size()));
                    showDiaperEntries(records);
                } else {
                    textDiaperCount.setText(R.string.no_records_today);
                    layoutDiaperEntries.setVisibility(View.GONE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<DiaperChange>>> call, @NonNull Throwable t) {
                if (isAdded()) textDiaperCount.setText(R.string.no_records_today);
            }
        });
    }

    private void loadGrowth() {
        apiService.getGrowthRecords(babyId).enqueue(new Callback<ApiResponse<List<GrowthRecord>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<GrowthRecord>>> call,
                                   @NonNull Response<ApiResponse<List<GrowthRecord>>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null
                        && !response.body().getData().isEmpty()) {
                    GrowthRecord latest = response.body().getData().get(0);
                    String summary = "";
                    if (latest.getWeightKg() != null) {
                        summary += String.format(Locale.getDefault(), "%.1f kg", latest.getWeightKg());
                    }
                    if (latest.getHeightCm() != null) {
                        if (!summary.isEmpty()) summary += "  ·  ";
                        summary += String.format(Locale.getDefault(), "%.1f cm", latest.getHeightCm());
                    }
                    textGrowthSummary.setText(summary.isEmpty() ? getString(R.string.no_records_today) : summary);
                    showGrowthEntries(response.body().getData());
                } else {
                    textGrowthSummary.setText(R.string.no_records_today);
                    layoutGrowthEntries.setVisibility(View.GONE);
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<GrowthRecord>>> call, @NonNull Throwable t) {
                if (isAdded()) textGrowthSummary.setText(R.string.no_records_today);
            }
        });
    }

    // ── Entry list renderers ──────────────────────────────────────────────────

    private void showFeedingEntries(List<FeedingRecord> records) {
        layoutFeedingEntries.removeAllViews();
        if (records.isEmpty()) { layoutFeedingEntries.setVisibility(View.GONE); return; }
        layoutFeedingEntries.setVisibility(View.VISIBLE);
        for (FeedingRecord r : records) {
            String line = formatTime(r.getFeedingDate()) + "  ·  " + capitalize(r.getFeedingType());
            if (r.getDurationMinutes() != null) line += "  ·  " + r.getDurationMinutes() + " min";
            if (r.getAmountMl() != null)        line += "  ·  " + r.getAmountMl().intValue() + " ml";
            addEntryRow(layoutFeedingEntries, line);
        }
    }

    private void showSleepEntries(List<SleepSession> records) {
        layoutSleepEntries.removeAllViews();
        if (records.isEmpty()) { layoutSleepEntries.setVisibility(View.GONE); return; }
        layoutSleepEntries.setVisibility(View.VISIBLE);
        for (SleepSession r : records) {
            String line = capitalize(r.getSleepType() != null ? r.getSleepType() : "");
            if (r.getDurationMinutes() != null) {
                int h = r.getDurationMinutes() / 60, m = r.getDurationMinutes() % 60;
                line += "  ·  " + (h > 0 ? h + "h " : "") + m + "m";
            }
            addEntryRow(layoutSleepEntries, line);
        }
    }

    private void showDiaperEntries(List<DiaperChange> records) {
        layoutDiaperEntries.removeAllViews();
        if (records.isEmpty()) { layoutDiaperEntries.setVisibility(View.GONE); return; }
        layoutDiaperEntries.setVisibility(View.VISIBLE);
        for (DiaperChange r : records) {
            String line = formatTime(r.getChangeTime()) + "  ·  " + capitalize(r.getDiaperType());
            addEntryRow(layoutDiaperEntries, line);
        }
    }

    private void showGrowthEntries(List<GrowthRecord> records) {
        layoutGrowthEntries.removeAllViews();
        int limit = Math.min(records.size(), 3);
        if (limit == 0) { layoutGrowthEntries.setVisibility(View.GONE); return; }
        layoutGrowthEntries.setVisibility(View.VISIBLE);
        for (int i = 0; i < limit; i++) {
            GrowthRecord r = records.get(i);
            StringBuilder line = new StringBuilder(r.getRecordDate() != null ? r.getRecordDate().substring(0, 10) : "");
            if (r.getWeightKg() != null) line.append("  ·  ").append(String.format(Locale.getDefault(), "%.2f kg", r.getWeightKg()));
            if (r.getHeightCm() != null) line.append("  ·  ").append(String.format(Locale.getDefault(), "%.1f cm", r.getHeightCm()));
            addEntryRow(layoutGrowthEntries, line.toString());
        }
    }

    private void addEntryRow(LinearLayout parent, String text) {
        TextView tv = new TextView(requireContext());
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.topMargin = (int) (4 * getResources().getDisplayMetrics().density);
        tv.setLayoutParams(params);
        tv.setText(text);
        tv.setTextSize(12f);
        tv.setTextColor(requireContext().getColor(R.color.text_secondary));
        parent.addView(tv);
    }

    // ── Log dialogs ───────────────────────────────────────────────────────────

    private void showFeedingDialog() {
        if (babyId == -1) { showNoBabyToast(); return; }
        View dialogView = LayoutInflater.from(getContext()).inflate(android.R.layout.simple_list_item_1, null);
        String[] types = {"Breastfeeding", "Formula", "Solid food", "Mixed"};
        new AlertDialog.Builder(requireContext())
                .setTitle(getString(R.string.feeding))
                .setItems(types, (dialog, which) -> {
                    String type = types[which].toLowerCase().replace(" food", "").replace(" ", "_");
                    Map<String, Object> body = new HashMap<>();
                    body.put("baby_id", babyId);
                    body.put("feeding_type", type);
                    body.put("feeding_date", nowIso());
                    logFeeding(body);
                })
                .setNegativeButton(getString(R.string.cancel), null)
                .show();
    }

    private void showSleepDialog() {
        if (babyId == -1) { showNoBabyToast(); return; }
        String[] types = {"Nap", "Night sleep", "Bedtime"};
        new AlertDialog.Builder(requireContext())
                .setTitle(getString(R.string.sleep))
                .setItems(types, (dialog, which) -> {
                    String type = types[which].toLowerCase().replace(" sleep", "").replace(" ", "_");
                    showSleepDurationDialog(type);
                })
                .setNegativeButton(getString(R.string.cancel), null)
                .show();
    }

    private void showSleepDurationDialog(String sleepType) {
        EditText input = new EditText(requireContext());
        input.setHint(getString(R.string.duration_minutes_hint));
        input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        new AlertDialog.Builder(requireContext())
                .setTitle(getString(R.string.duration_label))
                .setView(input)
                .setPositiveButton(getString(R.string.save), (d, w) -> {
                    String val = input.getText().toString().trim();
                    Map<String, Object> body = new HashMap<>();
                    body.put("baby_id", babyId);
                    body.put("sleep_type", sleepType);
                    body.put("start_time", nowIso());
                    if (!val.isEmpty()) body.put("duration_minutes", Integer.parseInt(val));
                    logSleep(body);
                })
                .setNegativeButton(getString(R.string.cancel), null)
                .show();
    }

    private void showDiaperDialog() {
        if (babyId == -1) { showNoBabyToast(); return; }
        String[] types = {"Wet (pee)", "Dirty (poop)", "Both"};
        new AlertDialog.Builder(requireContext())
                .setTitle(getString(R.string.poop_pee))
                .setItems(types, (dialog, which) -> {
                    String[] apiTypes = {"wet", "dirty", "both"};
                    Map<String, Object> body = new HashMap<>();
                    body.put("baby_id", babyId);
                    body.put("diaper_type", apiTypes[which]);
                    body.put("change_time", nowIso());
                    logDiaper(body);
                })
                .setNegativeButton(getString(R.string.cancel), null)
                .show();
    }

    private void showGrowthDialog() {
        if (babyId == -1) { showNoBabyToast(); return; }
        View form = LayoutInflater.from(getContext()).inflate(R.layout.dialog_growth_input, null);
        EditText etWeight = form.findViewById(R.id.etWeight);
        EditText etHeight = form.findViewById(R.id.etHeight);
        EditText etHead   = form.findViewById(R.id.etHead);
        new AlertDialog.Builder(requireContext())
                .setTitle(getString(R.string.growth))
                .setView(form)
                .setPositiveButton(getString(R.string.save), (d, w) -> {
                    Map<String, Object> body = new HashMap<>();
                    body.put("baby_id", babyId);
                    body.put("record_date", getDateForOffset(0));
                    String wt = etWeight.getText().toString().trim();
                    String ht = etHeight.getText().toString().trim();
                    String hd = etHead.getText().toString().trim();
                    if (!wt.isEmpty()) body.put("weight_kg", Double.parseDouble(wt));
                    if (!ht.isEmpty()) body.put("height_cm", Double.parseDouble(ht));
                    if (!hd.isEmpty()) body.put("head_circumference_cm", Double.parseDouble(hd));
                    if (body.size() > 2) logGrowth(body);
                })
                .setNegativeButton(getString(R.string.cancel), null)
                .show();
    }

    // ── API calls ─────────────────────────────────────────────────────────────

    private void logFeeding(Map<String, Object> body) {
        apiService.logFeeding(body).enqueue(new Callback<ApiResponse<FeedingRecord>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<FeedingRecord>> call,
                                   @NonNull Response<ApiResponse<FeedingRecord>> response) {
                if (isAdded()) {
                    Toast.makeText(getContext(), getString(R.string.logged_success), Toast.LENGTH_SHORT).show();
                    loadFeedings(getDateForOffset(dateOffset) + "T00:00:00.000Z",
                                 getDateForOffset(dateOffset) + "T23:59:59.999Z");
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<FeedingRecord>> call, @NonNull Throwable t) {
                if (isAdded()) Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void logSleep(Map<String, Object> body) {
        apiService.logSleep(body).enqueue(new Callback<ApiResponse<SleepSession>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<SleepSession>> call,
                                   @NonNull Response<ApiResponse<SleepSession>> response) {
                if (isAdded()) {
                    Toast.makeText(getContext(), getString(R.string.logged_success), Toast.LENGTH_SHORT).show();
                    loadSleep(getDateForOffset(dateOffset) + "T00:00:00.000Z",
                              getDateForOffset(dateOffset) + "T23:59:59.999Z");
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<SleepSession>> call, @NonNull Throwable t) {
                if (isAdded()) Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void logDiaper(Map<String, Object> body) {
        apiService.logDiaper(body).enqueue(new Callback<ApiResponse<DiaperChange>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<DiaperChange>> call,
                                   @NonNull Response<ApiResponse<DiaperChange>> response) {
                if (isAdded()) {
                    Toast.makeText(getContext(), getString(R.string.logged_success), Toast.LENGTH_SHORT).show();
                    loadDiapers(getDateForOffset(dateOffset) + "T00:00:00.000Z",
                                getDateForOffset(dateOffset) + "T23:59:59.999Z");
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<DiaperChange>> call, @NonNull Throwable t) {
                if (isAdded()) Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void logGrowth(Map<String, Object> body) {
        apiService.logGrowth(body).enqueue(new Callback<ApiResponse<GrowthRecord>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<GrowthRecord>> call,
                                   @NonNull Response<ApiResponse<GrowthRecord>> response) {
                if (isAdded()) {
                    Toast.makeText(getContext(), getString(R.string.logged_success), Toast.LENGTH_SHORT).show();
                    loadGrowth();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<GrowthRecord>> call, @NonNull Throwable t) {
                if (isAdded()) Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String getDateForOffset(int offset) {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, offset);
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.getTime());
    }

    private String nowIso() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(new Date());
    }

    private String formatTime(String isoTime) {
        if (isoTime == null) return "";
        try {
            String[] fmts = {"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", "yyyy-MM-dd'T'HH:mm:ss'Z'", "yyyy-MM-dd HH:mm:ss"};
            for (String fmt : fmts) {
                try {
                    Date d = new SimpleDateFormat(fmt, Locale.getDefault()).parse(isoTime);
                    if (d != null) return new SimpleDateFormat("HH:mm", Locale.getDefault()).format(d);
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}
        return isoTime.length() >= 16 ? isoTime.substring(11, 16) : isoTime;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).replace("_", " ");
    }

    private void showNoBabyToast() {
        Toast.makeText(getContext(), getString(R.string.add_baby_first), Toast.LENGTH_SHORT).show();
    }
}

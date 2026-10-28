package com.talentbaby.app.activities;

import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.GrowthRecord;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.ui.growth.GrowthChartView;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class GrowthTrackerActivity extends AppCompatActivity {

    private static final String[] AGE_RANGES = {
            "0 Month - 6 Month",
            "6 Month - 12 Month",
            "12 Month - 18 Month",
            "18 Month - 24 Month",
            "24 Month - 30 Month",
            "30 Month - 36 Month"
    };

    private final List<GrowthRecord> growthRecords = new ArrayList<>();

    private boolean isWeight = true;
    private boolean isMetric = true;
    private int ageRangeIndex = 0;
    private int babyId = -1;

    private ApiService apiService;
    private TextView tabWeight, tabHeight;
    private TextView btnSI, btnIMP;
    private TextView textChartTitle, textAgeRange, textYourDataTitle;
    private LinearLayout layoutGrowthRecords;
    private GrowthChartView growthChart;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_growth_tracker);

        apiService = ApiClient.getClient().create(ApiService.class);
        babyId = TokenManager.getBabyId(this);

        applyHeaderGradient();
        bindViews();
        setupListeners();
        refreshUI();
        loadGrowthRecords();
    }

    private void applyHeaderGradient() {
        GradientDrawable grad = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{
                        ContextCompat.getColor(this, R.color.app_header_start),
                        ContextCompat.getColor(this, R.color.app_header_end)
                });
        findViewById(R.id.headerGrowth).setBackground(grad);
    }

    private void bindViews() {
        tabWeight = findViewById(R.id.tabWeight);
        tabHeight = findViewById(R.id.tabHeight);
        btnSI = findViewById(R.id.btnSI);
        btnIMP = findViewById(R.id.btnIMP);
        textChartTitle = findViewById(R.id.textChartTitle);
        textAgeRange = findViewById(R.id.textAgeRange);
        textYourDataTitle = findViewById(R.id.textYourDataTitle);
        layoutGrowthRecords = findViewById(R.id.layoutGrowthRecords);
        growthChart = findViewById(R.id.growthChart);
    }

    private void setupListeners() {
        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        tabWeight.setOnClickListener(v -> setActiveTab(true));
        tabHeight.setOnClickListener(v -> setActiveTab(false));

        findViewById(R.id.btnRangePrev).setOnClickListener(v -> {
            if (ageRangeIndex > 0) {
                ageRangeIndex--;
                refreshUI();
            }
        });
        findViewById(R.id.btnRangeNext).setOnClickListener(v -> {
            if (ageRangeIndex < AGE_RANGES.length - 1) {
                ageRangeIndex++;
                refreshUI();
            }
        });

        btnSI.setOnClickListener(v -> setMetricUnits(true));
        btnIMP.setOnClickListener(v -> setMetricUnits(false));
        findViewById(R.id.btnAddData).setOnClickListener(v -> showGrowthDialog());
    }

    private void setActiveTab(boolean weight) {
        isWeight = weight;
        int activeColor = ContextCompat.getColor(this, R.color.article_header);
        int white = ContextCompat.getColor(this, android.R.color.white);
        tabWeight.setBackgroundResource(weight ? R.drawable.bg_tab_white_pill : android.R.color.transparent);
        tabWeight.setTextColor(weight ? activeColor : white);
        tabHeight.setBackgroundResource(weight ? android.R.color.transparent : R.drawable.bg_tab_white_pill);
        tabHeight.setTextColor(weight ? white : activeColor);
        refreshUI();
    }

    private void setMetricUnits(boolean metric) {
        isMetric = metric;
        btnSI.setBackgroundResource(metric ? R.drawable.bg_coral_tab : android.R.color.transparent);
        btnIMP.setBackgroundResource(metric ? android.R.color.transparent : R.drawable.bg_coral_tab);
        btnSI.setTextColor(ContextCompat.getColor(this, metric ? android.R.color.white : R.color.article_header));
        btnIMP.setTextColor(ContextCompat.getColor(this, metric ? R.color.article_header : android.R.color.white));
        refreshDataCard();
    }

    private void refreshUI() {
        textChartTitle.setText(isWeight ? getString(R.string.weight_chart) : getString(R.string.height_chart));
        textAgeRange.setText(AGE_RANGES[ageRangeIndex]);
        growthChart.setMode(isWeight, ageRangeIndex);
        refreshDataCard();
    }

    private void loadGrowthRecords() {
        if (babyId == -1) {
            textYourDataTitle.setText(R.string.add_baby_first);
            layoutGrowthRecords.setVisibility(View.GONE);
            return;
        }

        apiService.getGrowthRecords(babyId).enqueue(new Callback<ApiResponse<List<GrowthRecord>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<GrowthRecord>>> call,
                                   @NonNull Response<ApiResponse<List<GrowthRecord>>> response) {
                growthRecords.clear();
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    growthRecords.addAll(response.body().getData());
                }
                refreshDataCard();
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<GrowthRecord>>> call, @NonNull Throwable t) {
                Toast.makeText(GrowthTrackerActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                refreshDataCard();
            }
        });
    }

    private void refreshDataCard() {
        if (textYourDataTitle == null || layoutGrowthRecords == null) return;

        layoutGrowthRecords.removeAllViews();
        if (growthRecords.isEmpty()) {
            textYourDataTitle.setGravity(android.view.Gravity.CENTER);
            textYourDataTitle.setText(R.string.your_data_here);
            layoutGrowthRecords.setVisibility(View.GONE);
            return;
        }

        textYourDataTitle.setGravity(android.view.Gravity.START);
        textYourDataTitle.setText(isWeight ? R.string.weight_chart : R.string.height_chart);
        layoutGrowthRecords.setVisibility(View.VISIBLE);

        int limit = Math.min(growthRecords.size(), 5);
        for (int i = 0; i < limit; i++) {
            GrowthRecord record = growthRecords.get(i);
            String value = isWeight
                    ? formatWeight(record.getWeightKg())
                    : formatHeight(record.getHeightCm());
            if (value.isEmpty()) continue;
            addRecordRow(formatDate(record.getRecordDate()), value);
        }

        if (layoutGrowthRecords.getChildCount() == 0) {
            textYourDataTitle.setGravity(android.view.Gravity.CENTER);
            textYourDataTitle.setText(R.string.your_data_here);
            layoutGrowthRecords.setVisibility(View.GONE);
        }
    }

    private void addRecordRow(String date, String value) {
        TextView row = new TextView(this);
        row.setText(String.format(Locale.getDefault(), "%s    %s", date, value));
        row.setTextColor(ContextCompat.getColor(this, R.color.home_text_dark));
        row.setTextSize(18);
        row.setPadding(0, 10, 0, 10);
        layoutGrowthRecords.addView(row, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
    }

    private void showGrowthDialog() {
        if (babyId == -1) {
            Toast.makeText(this, getString(R.string.add_baby_first), Toast.LENGTH_SHORT).show();
            return;
        }

        View form = LayoutInflater.from(this).inflate(R.layout.dialog_growth_input, null);
        EditText etWeight = form.findViewById(R.id.etWeight);
        EditText etHeight = form.findViewById(R.id.etHeight);
        EditText etHead = form.findViewById(R.id.etHead);

        new AlertDialog.Builder(this)
                .setTitle(getString(R.string.add_data))
                .setView(form)
                .setPositiveButton(getString(R.string.save), (dialog, which) -> saveGrowth(etWeight, etHeight, etHead))
                .setNegativeButton(getString(R.string.cancel), null)
                .show();
    }

    private void saveGrowth(EditText etWeight, EditText etHeight, EditText etHead) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("baby_id", babyId);
            body.put("record_date", today());

            String weight = etWeight.getText().toString().trim();
            String height = etHeight.getText().toString().trim();
            String head = etHead.getText().toString().trim();
            if (!weight.isEmpty()) body.put("weight_kg", Double.parseDouble(weight));
            if (!height.isEmpty()) body.put("height_cm", Double.parseDouble(height));
            if (!head.isEmpty()) body.put("head_circumference_cm", Double.parseDouble(head));

            if (body.size() <= 2) {
                Toast.makeText(this, getString(R.string.no_data), Toast.LENGTH_SHORT).show();
                return;
            }

            apiService.logGrowth(body).enqueue(new Callback<ApiResponse<GrowthRecord>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<GrowthRecord>> call,
                                       @NonNull Response<ApiResponse<GrowthRecord>> response) {
                    Toast.makeText(GrowthTrackerActivity.this, getString(R.string.logged_success), Toast.LENGTH_SHORT).show();
                    loadGrowthRecords();
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<GrowthRecord>> call, @NonNull Throwable t) {
                    Toast.makeText(GrowthTrackerActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            });
        } catch (NumberFormatException ex) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
        }
    }

    private String formatWeight(Double kg) {
        if (kg == null) return "";
        if (isMetric) return String.format(Locale.getDefault(), "%.1f kg", kg);
        return String.format(Locale.getDefault(), "%.1f lb", kg * 2.2046226218);
    }

    private String formatHeight(Double cm) {
        if (cm == null) return "";
        if (isMetric) return String.format(Locale.getDefault(), "%.1f cm", cm);
        return String.format(Locale.getDefault(), "%.1f in", cm / 2.54);
    }

    private String formatDate(String raw) {
        if (raw == null || raw.length() < 10) return "";
        return raw.substring(0, 10);
    }

    private String today() {
        Calendar cal = Calendar.getInstance();
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(cal.getTime());
    }
}

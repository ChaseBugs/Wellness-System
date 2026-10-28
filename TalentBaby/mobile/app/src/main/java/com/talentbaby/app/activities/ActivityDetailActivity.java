package com.talentbaby.app.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.talentbaby.app.R;
import com.talentbaby.app.models.Activity;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ActivityDetailActivity extends AppCompatActivity {

    private ImageView imageDetail;
    private TextView textTitle;
    private TextView textSectionCategory;
    private TextView textDescription;
    private TextView textDoneByBabies;
    private TextView textFrequency;
    private TextView labelBenefits;
    private TextView textBenefits;
    private TextView labelMaterials;
    private TextView textMaterials;
    private LinearLayout layoutVerified;
    private LinearLayout layoutFrequency;
    private View dividerMaterials;
    private ProgressBar progressBar;
    private MaterialButton buttonComplete;

    private ApiService apiService;
    private int activityId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> onBackPressed());

        apiService = ApiClient.getClient().create(ApiService.class);
        activityId = getIntent().getIntExtra("activity_id", -1);

        initViews();

        if (activityId != -1) {
            loadActivityDetail(activityId);
        } else {
            finish();
        }
    }

    private void initViews() {
        imageDetail = findViewById(R.id.imageDetail);
        textTitle = findViewById(R.id.textTitle);
        textSectionCategory = findViewById(R.id.textSectionCategory);
        textDescription = findViewById(R.id.textDescription);
        textDoneByBabies = findViewById(R.id.textDoneByBabies);
        textFrequency = findViewById(R.id.textFrequency);
        labelBenefits = findViewById(R.id.labelBenefits);
        textBenefits = findViewById(R.id.textBenefits);
        labelMaterials = findViewById(R.id.labelMaterials);
        textMaterials = findViewById(R.id.textMaterials);
        layoutVerified = findViewById(R.id.layoutVerified);
        layoutFrequency = findViewById(R.id.layoutFrequency);
        dividerMaterials = findViewById(R.id.dividerMaterials);
        progressBar = findViewById(R.id.progressBar);
        buttonComplete = findViewById(R.id.buttonComplete);

        findViewById(R.id.btnTooEasy).setOnClickListener(v -> sendDifficultyFeedback("too_easy"));
        findViewById(R.id.btnTooHard).setOnClickListener(v -> sendDifficultyFeedback("too_hard"));

        buttonComplete.setOnClickListener(v -> markAsDone());
    }

    private void markAsDone() {
        int babyId = TokenManager.getBabyId(this);
        if (babyId == -1) {
            Toast.makeText(this, getString(R.string.add_baby_first), Toast.LENGTH_SHORT).show();
            return;
        }
        buttonComplete.setEnabled(false);
        Map<String, Object> body = new HashMap<>();
        body.put("baby_id", babyId);
        apiService.completeActivity(activityId, body).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    buttonComplete.setText(getString(R.string.completed));
                } else {
                    buttonComplete.setEnabled(true);
                    Toast.makeText(ActivityDetailActivity.this,
                            getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                buttonComplete.setEnabled(true);
                Toast.makeText(ActivityDetailActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void sendDifficultyFeedback(String feedback) {
        int babyId = TokenManager.getBabyId(this);
        if (babyId == -1) {
            Toast.makeText(this, getString(R.string.add_baby_first), Toast.LENGTH_SHORT).show();
            return;
        }
        Map<String, Object> body = new HashMap<>();
        body.put("baby_id", babyId);
        body.put("feedback", feedback);
        apiService.setDifficultyFeedback(activityId, body).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ActivityDetailActivity.this,
                            getString(R.string.feedback_saved), Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(ActivityDetailActivity.this,
                            getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                Toast.makeText(ActivityDetailActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadActivityDetail(int id) {
        progressBar.setVisibility(View.VISIBLE);

        apiService.getActivity(id).enqueue(new Callback<ApiResponse<Activity>>() {
            @Override
            public void onResponse(Call<ApiResponse<Activity>> call, Response<ApiResponse<Activity>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    bindActivity(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Activity>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ActivityDetailActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void bindActivity(Activity activity) {
        // Image
        if (activity.getImageUrl() != null && !activity.getImageUrl().isEmpty()) {
            String url = activity.getImageUrl().startsWith("/")
                    ? ApiClient.getBaseUrl() + activity.getImageUrl().substring(1)
                    : activity.getImageUrl();
            Glide.with(this).load(url).centerCrop().into(imageDetail);
        }

        // Title / section labels
        textTitle.setText(activity.getTitle() != null ? activity.getTitle() : "");

        if (activity.getSubCategory() != null && !activity.getSubCategory().isEmpty()) {
            textSectionCategory.setText(activity.getSubCategory());
        } else if (activity.getCategory() != null) {
            textSectionCategory.setText(activity.getCategory());
        }

        // Description
        if (activity.getDescription() != null) {
            textDescription.setText(activity.getDescription());
        }

        // Done count
        if (activity.getDoneCount() > 0) {
            textDoneByBabies.setText(getString(R.string.done_by_babies, activity.getDoneCount()));
        }

        // Doctor verified
        if (activity.isDoctorVerified()) {
            layoutVerified.setVisibility(View.VISIBLE);
        }

        // Frequency (show if we have duration)
        if (activity.getDurationMinutes() > 0) {
            layoutFrequency.setVisibility(View.VISIBLE);
            textFrequency.setText(getString(R.string.minutes, activity.getDurationMinutes()));
        }

        // Benefits
        if (activity.getBenefits() != null && !activity.getBenefits().isEmpty()) {
            labelBenefits.setVisibility(View.VISIBLE);
            textBenefits.setVisibility(View.VISIBLE);
            textBenefits.setText(activity.getBenefits());
        }

        // Materials
        if (activity.getMaterialsNeeded() != null && !activity.getMaterialsNeeded().isEmpty()) {
            dividerMaterials.setVisibility(View.VISIBLE);
            labelMaterials.setVisibility(View.VISIBLE);
            textMaterials.setVisibility(View.VISIBLE);
            textMaterials.setText(activity.getMaterialsNeeded());
        }
    }
}

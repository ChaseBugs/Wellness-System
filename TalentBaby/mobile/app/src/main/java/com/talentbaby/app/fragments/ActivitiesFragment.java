package com.talentbaby.app.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.talentbaby.app.R;
import com.talentbaby.app.activities.ActivityDetailActivity;
import com.talentbaby.app.adapters.ActivityAdapter;
import com.talentbaby.app.models.Activity;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ActivitiesFragment extends Fragment {

    private RecyclerView recyclerActivities;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;
    private LinearLayout layoutMonthPills;
    private HorizontalScrollView scrollActivityCategories;
    private ActivityAdapter activityAdapter;
    private List<Activity> activities = new ArrayList<>();
    private ApiService apiService;

    private Integer selectedMonth = null;
    private String selectedCategory = null;
    private TextView activeMonthPill = null;
    private TextView activeCategoryChip = null;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_activities, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        apiService = ApiClient.getClient().create(ApiService.class);
        initViews(view);
        setupRecyclerView();
        loadBabyAndSetupMonths();
    }

    private void initViews(View view) {
        recyclerActivities = view.findViewById(R.id.recyclerActivities);
        progressBar = view.findViewById(R.id.progressBar);
        layoutEmpty = view.findViewById(R.id.layoutEmpty);
        layoutMonthPills = view.findViewById(R.id.layoutMonthPills);
        scrollActivityCategories = view.findViewById(R.id.scrollActivityCategories);

        view.findViewById(R.id.btnParentingSupportAct).setOnClickListener(v ->
                startActivity(new android.content.Intent(requireContext(), com.talentbaby.app.activities.ParentingSupportActivity.class)));

        view.findViewById(R.id.btnMenuActivities).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });

        // Category chips
        TextView chipAll = view.findViewById(R.id.chipAll);
        TextView chipPhysical = view.findViewById(R.id.chipPhysical);
        TextView chipCognitive = view.findViewById(R.id.chipCognitive);
        TextView chipCommunication = view.findViewById(R.id.chipCommunication);
        TextView chipSocial = view.findViewById(R.id.chipSocial);

        activeCategoryChip = chipAll;

        View.OnClickListener chipListener = v -> {
            String category = null;
            if (v == chipPhysical) category = "physical";
            else if (v == chipCognitive) category = "cognitive";
            else if (v == chipCommunication) category = "communication";
            else if (v == chipSocial) category = "social";

            selectCategoryChip((TextView) v);
            selectedCategory = category;
            loadActivities();
        };

        chipAll.setOnClickListener(chipListener);
        chipPhysical.setOnClickListener(chipListener);
        chipCognitive.setOnClickListener(chipListener);
        chipCommunication.setOnClickListener(chipListener);
        chipSocial.setOnClickListener(chipListener);
    }

    private void selectCategoryChip(TextView chip) {
        if (activeCategoryChip != null) {
            activeCategoryChip.setBackgroundResource(R.drawable.bg_teal_outline_pill);
            activeCategoryChip.setTextColor(requireContext().getColor(android.R.color.white));
            activeCategoryChip.animate().cancel();
            activeCategoryChip.setScaleX(1f);
            activeCategoryChip.setScaleY(1f);
        }
        chip.setBackgroundResource(R.drawable.bg_white_pill);
        chip.setTextColor(requireContext().getColor(R.color.home_teal));
        activeCategoryChip = chip;
        animateSelectedChip(chip);
        scrollCategoryIntoView(chip);
    }

    private void selectMonthPill(TextView pill, int month) {
        activeMonthPill = pill;
        selectedMonth = month;
        animateSelectedChip(pill);
    }

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void loadBabyAndSetupMonths() {
        int babyId = -1;
        if (babyId == -1) {
            // No baby — just load all activities
            setupMonthPills(6);
            return;
        }

        apiService.getBaby(babyId).enqueue(new Callback<ApiResponse<Baby>>() {
            @Override
            public void onResponse(Call<ApiResponse<Baby>> call, Response<ApiResponse<Baby>> response) {
                int ageMonths = 6;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Baby baby = response.body().getData();
                    ageMonths = calculateAgeInMonths(baby.getBirthDate());
                }
                setupMonthPills(Math.max(1, ageMonths));
            }

            @Override
            public void onFailure(Call<ApiResponse<Baby>> call, Throwable t) {
                setupMonthPills(6);
            }
        });
    }

    private void setupMonthPills(int currentMonth) {
        if (layoutMonthPills == null || getContext() == null) return;
        selectedMonth = Math.max(1, Math.min(36, currentMonth));
        renderMonthPills(selectedMonth);
        loadActivities();
    }

    private void renderMonthPills(int centerMonth) {
        if (layoutMonthPills == null || getContext() == null) return;
        layoutMonthPills.removeAllViews();
        activeMonthPill = null;

        int startMonth = Math.max(1, centerMonth - 1);
        int endMonth = Math.min(36, centerMonth + 1);
        if (endMonth - startMonth < 2) {
            if (startMonth == 1) {
                endMonth = Math.min(36, startMonth + 2);
            } else {
                startMonth = Math.max(1, endMonth - 2);
            }
        }

        for (int m = startMonth; m <= endMonth; m++) {
            final int month = m;
            TextView pill = new TextView(requireContext());
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, dp(50), 1f);
            params.setMargins(dp(3), 0, dp(3), 0);
            pill.setLayoutParams(params);
            pill.setText(getString(R.string.month_num, m));
            pill.setTextSize(18f);
            pill.setGravity(Gravity.CENTER);
            pill.setClickable(true);
            pill.setFocusable(true);

            if (m == centerMonth) {
                pill.setBackgroundResource(R.drawable.bg_date_selected);
                pill.setTextColor(requireContext().getColor(android.R.color.white));
                selectMonthPill(pill, month);
            } else {
                pill.setBackground(null);
                pill.setTextColor(requireContext().getColor(R.color.home_text_dark));
            }

            pill.setOnClickListener(v -> slideToMonth(month));

            layoutMonthPills.addView(pill);
        }
    }

    private void slideToMonth(int month) {
        if (layoutMonthPills == null || getContext() == null) return;
        final int targetMonth = Math.max(1, Math.min(36, month));
        int previousMonth = selectedMonth == null ? targetMonth : selectedMonth;
        if (previousMonth == targetMonth) {
            if (activeMonthPill != null) animateSelectedChip(activeMonthPill);
            return;
        }

        final int direction = targetMonth > previousMonth ? 1 : -1;
        final float offset = dp(74);
        selectedMonth = targetMonth;

        layoutMonthPills.animate().cancel();
        layoutMonthPills.animate()
                .translationX(-direction * offset)
                .alpha(0.55f)
                .setDuration(140)
                .withEndAction(() -> {
                    if (layoutMonthPills == null || getContext() == null) return;
                    renderMonthPills(targetMonth);
                    layoutMonthPills.setTranslationX(direction * offset);
                    layoutMonthPills.setAlpha(0.55f);
                    layoutMonthPills.animate()
                            .translationX(0f)
                            .alpha(1f)
                            .setDuration(220)
                            .setInterpolator(new DecelerateInterpolator())
                            .start();
                    loadActivities();
                })
                .start();
    }

    private void animateSelectedChip(View chip) {
        chip.animate().cancel();
        chip.setScaleX(0.96f);
        chip.setScaleY(0.96f);
        chip.animate()
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(180)
                .setInterpolator(new DecelerateInterpolator())
                .start();
    }

    private void scrollCategoryIntoView(View chip) {
        if (scrollActivityCategories == null) return;
        scrollActivityCategories.post(() -> {
            int target = chip.getLeft() - dp(24);
            scrollActivityCategories.smoothScrollTo(Math.max(0, target), 0);
        });
    }

    private void setupRecyclerView() {
        activityAdapter = new ActivityAdapter(activities, activity -> {
            Intent intent = new Intent(getActivity(), ActivityDetailActivity.class);
            intent.putExtra("activity_id", activity.getId());
            startActivity(intent);
        });
        recyclerActivities.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerActivities.setAdapter(activityAdapter);
        recyclerActivities.setNestedScrollingEnabled(false);
    }

    private void loadActivities() {
        if (getContext() != null) {
            progressBar.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.GONE);
            recyclerActivities.setVisibility(View.VISIBLE);
            renderActivities(demoActivities());
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        layoutEmpty.setVisibility(View.GONE);
        recyclerActivities.setVisibility(View.GONE);

        apiService.getActivities(selectedCategory, null, selectedMonth, null)
                .enqueue(new Callback<ApiResponse<List<Activity>>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<List<Activity>>> call,
                                           Response<ApiResponse<List<Activity>>> response) {
                        progressBar.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null
                                && response.body().getData() != null) {
                            List<Activity> data = response.body().getData();
                            renderActivities(data.isEmpty() ? demoActivities() : data);
                        } else {
                            renderActivities(demoActivities());
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<List<Activity>>> call, Throwable t) {
                        progressBar.setVisibility(View.GONE);
                        renderActivities(demoActivities());
                    }
                });
    }

    private void renderActivities(List<Activity> data) {
        activities.clear();
        activities.addAll(data);
        activityAdapter.notifyDataSetChanged();
        boolean empty = activities.isEmpty();
        layoutEmpty.setVisibility(empty ? View.VISIBLE : View.GONE);
        recyclerActivities.setVisibility(empty ? View.GONE : View.VISIBLE);
        if (!empty) {
            recyclerActivities.animate().cancel();
            recyclerActivities.setAlpha(0.72f);
            recyclerActivities.setTranslationY(dp(8));
            recyclerActivities.animate()
                    .alpha(1f)
                    .translationY(0f)
                    .setDuration(180)
                    .setInterpolator(new DecelerateInterpolator())
                    .start();
        }
    }

    private List<Activity> demoActivities() {
        List<Activity> demo = new ArrayList<>();
        demo.add(demoActivity(101, "Book Trick", "Articulation & Reasoning", "communication", 5, 7, 5, 10695));
        demo.add(demoActivity(102, "Noise And Sound Together", "Speech Development", "communication", 5, 7, 5, 9886));
        demo.add(demoActivity(103, "Lip Sounds L1", "Speech Development", "communication", 5, 7, 5, 6094));
        demo.add(demoActivity(104, "Tongue Movements", "Acting and Expressions", "social", 5, 7, 5, 6379));
        demo.add(demoActivity(105, "Balancing", "Gross Motor", "physical", 5, 7, 5, 8273));
        demo.add(demoActivity(106, "Bedtime Stories", "Concept Learning", "cognitive", 5, 7, 5, 5682));

        if (selectedCategory == null) return demo;

        List<Activity> filtered = new ArrayList<>();
        for (Activity activity : demo) {
            if (selectedCategory.equals(activity.getCategory())) {
                filtered.add(activity);
            }
        }
        return filtered;
    }

    private Activity demoActivity(int id, String title, String subCategory, String category,
                                  int minMonth, int maxMonth, int duration, int doneCount) {
        Activity activity = new Activity();
        activity.setId(id);
        activity.setTitle(title);
        activity.setDescription(title);
        activity.setSubCategory(subCategory);
        activity.setCategory(category);
        activity.setMinAgeMonths(minMonth);
        activity.setMaxAgeMonths(maxMonth);
        activity.setDurationMinutes(duration);
        activity.setDoneCount(doneCount);
        activity.setDoctorVerified(true);
        return activity;
    }

    private int calculateAgeInMonths(String birthDate) {
        if (birthDate == null) return 6;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date birth = sdf.parse(birthDate);
            if (birth == null) return 6;
            Calendar birthCal = Calendar.getInstance();
            birthCal.setTime(birth);
            Calendar now = Calendar.getInstance();
            int months = (now.get(Calendar.YEAR) - birthCal.get(Calendar.YEAR)) * 12
                    + (now.get(Calendar.MONTH) - birthCal.get(Calendar.MONTH));
            return Math.max(1, months);
        } catch (Exception e) {
            return 6;
        }
    }
}

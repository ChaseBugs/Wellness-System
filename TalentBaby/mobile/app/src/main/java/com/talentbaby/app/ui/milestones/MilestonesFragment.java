package com.talentbaby.app.ui.milestones;

import android.os.Bundle;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;
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
import com.talentbaby.app.adapters.MilestoneAdapter;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.models.BabyMilestone;
import com.talentbaby.app.models.MilestoneDefinition;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MilestonesFragment extends Fragment {

    private RecyclerView recyclerMilestones;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;
    private LinearLayout layoutMonthPills;
    private TextView btnCreateReport;
    private MilestoneAdapter milestoneAdapter;
    private ApiService apiService;

    private int selectedMonth = 4;
    private int babyId = -1;
    private TextView activeMonthPill = null;

    // Loaded definitions grouped by type
    private Map<String, List<MilestoneDefinition>> groupedDefinitions = new HashMap<>();
    // Current status for each definition id
    private Map<Integer, String> statusMap = new HashMap<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_milestones, container, false);
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
        recyclerMilestones = view.findViewById(R.id.recyclerMilestones);
        progressBar        = view.findViewById(R.id.progressBarMilestones);
        layoutEmpty        = view.findViewById(R.id.layoutMilestonesEmpty);
        layoutMonthPills   = view.findViewById(R.id.layoutMonthPillsMilestones);
        btnCreateReport    = view.findViewById(R.id.btnCreateReport);
        TextView subtitle  = view.findViewById(R.id.textMilestoneSubtitle);
        applySubtitleStyle(subtitle);
        updateCreateReportButton();

        view.findViewById(R.id.btnMenuMilestones).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });

        view.findViewById(R.id.btnParentingSupportMs).setOnClickListener(v ->
                startActivity(new android.content.Intent(requireContext(), com.talentbaby.app.activities.ParentingSupportActivity.class)));

        btnCreateReport.setOnClickListener(v -> createMilestoneReport());
    }

    private void setupRecyclerView() {
        milestoneAdapter = new MilestoneAdapter((definitionId, status) -> {
            // Optimistic update
            if (status == null || status.isEmpty()) {
                statusMap.remove(definitionId);
            } else {
                statusMap.put(definitionId, status);
            }
            milestoneAdapter.updateStatus(definitionId, status);
            updateCreateReportButton();

            // Persist to API
            if (babyId != -1 && status != null && !status.isEmpty()) {
                upsertMilestoneStatus(definitionId, status);
            }
        });
        recyclerMilestones.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerMilestones.setAdapter(milestoneAdapter);
        recyclerMilestones.setNestedScrollingEnabled(false);
    }

    private void loadBabyAndSetupMonths() {
        babyId = -1;
        if (babyId == -1) {
            setupMonthPills(4);
            return;
        }

        apiService.getBaby(babyId).enqueue(new Callback<ApiResponse<Baby>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Baby>> call,
                                   @NonNull Response<ApiResponse<Baby>> response) {
                int ageMonths = 4;
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    ageMonths = calculateAgeInMonths(response.body().getData().getBirthDate());
                }
                setupMonthPills(Math.max(1, ageMonths));
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Baby>> call, @NonNull Throwable t) {
                setupMonthPills(4);
            }
        });
    }

    private void applySubtitleStyle(TextView subtitle) {
        if (subtitle == null || getContext() == null) return;
        String count = "38464";
        String text = "Gain insights into your baby's progress by benchmarking\nwith data of " + count + " babies";
        SpannableString styled = new SpannableString(text);
        int start = text.indexOf(count);
        if (start >= 0) {
            styled.setSpan(
                    new ForegroundColorSpan(requireContext().getColor(R.color.article_header)),
                    start,
                    start + count.length(),
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            );
        }
        subtitle.setText(styled);
    }

    private void setupMonthPills(int currentMonth) {
        if (layoutMonthPills == null || getContext() == null) return;
        selectedMonth = Math.max(1, Math.min(36, currentMonth));
        renderMonthPills(selectedMonth);
        loadMilestonesForMonth(selectedMonth);
    }

    private void renderMonthPills(int centerMonth) {
        if (layoutMonthPills == null || getContext() == null) return;
        layoutMonthPills.removeAllViews();
        activeMonthPill = null;

        int startMonth = Math.max(1, centerMonth - 1);
        int endMonth   = Math.min(36, centerMonth + 1);
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

    private void selectMonthPill(TextView pill, int month) {
        activeMonthPill = pill;
        selectedMonth = month;
        animateSelectedChip(pill);
    }

    private void slideToMonth(int month) {
        if (layoutMonthPills == null || getContext() == null) return;
        final int targetMonth = Math.max(1, Math.min(36, month));
        int previousMonth = selectedMonth;
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
                    loadMilestonesForMonth(targetMonth);
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

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void loadMilestonesForMonth(int month) {
        if (getContext() != null) {
            showLoading(false);
            groupedDefinitions = mockDefinitions(month);
            statusMap.clear();
            renderList();
            return;
        }

        showLoading(true);
        groupedDefinitions.clear();
        statusMap.clear();

        // Load definitions for the month
        apiService.getMilestoneDefinitionsByMonth(month)
                .enqueue(new Callback<ApiResponse<Map<String, List<MilestoneDefinition>>>>() {
                    @Override
                    public void onResponse(@NonNull Call<ApiResponse<Map<String, List<MilestoneDefinition>>>> call,
                                           @NonNull Response<ApiResponse<Map<String, List<MilestoneDefinition>>>> response) {
                        if (response.isSuccessful() && response.body() != null
                                && response.body().getData() != null
                                && !response.body().getData().isEmpty()) {
                            groupedDefinitions = response.body().getData();
                        } else {
                            groupedDefinitions = mockDefinitions(month);
                        }
                        // Now load baby statuses
                        if (babyId != -1) {
                            loadBabyStatuses(month);
                        } else {
                            renderList();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<Map<String, List<MilestoneDefinition>>>> call,
                                          @NonNull Throwable t) {
                        groupedDefinitions = mockDefinitions(month);
                        renderList();
                    }
                });
    }

    private void loadBabyStatuses(int month) {
        apiService.getBabyMilestones(babyId, month)
                .enqueue(new Callback<ApiResponse<List<BabyMilestone>>>() {
                    @Override
                    public void onResponse(@NonNull Call<ApiResponse<List<BabyMilestone>>> call,
                                           @NonNull Response<ApiResponse<List<BabyMilestone>>> response) {
                        if (response.isSuccessful() && response.body() != null
                                && response.body().getData() != null) {
                            for (BabyMilestone bm : response.body().getData()) {
                                if (bm.getStatus() != null) {
                                    statusMap.put(bm.getMilestoneDefinitionId(), bm.getStatus());
                                }
                            }
                        }
                        renderList();
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<List<BabyMilestone>>> call,
                                          @NonNull Throwable t) {
                        renderList();
                    }
                });
    }

    private void renderList() {
        showLoading(false);
        if (groupedDefinitions.isEmpty()) {
            layoutEmpty.setVisibility(View.VISIBLE);
            recyclerMilestones.setVisibility(View.GONE);
        } else {
            layoutEmpty.setVisibility(View.GONE);
            recyclerMilestones.setVisibility(View.VISIBLE);
            milestoneAdapter.setData(groupedDefinitions, statusMap);
        }
        updateCreateReportButton();
    }

    private boolean areAllMilestonesAnswered() {
        int totalQuestions = 0;
        for (List<MilestoneDefinition> definitions : groupedDefinitions.values()) {
            if (definitions == null) continue;
            for (MilestoneDefinition definition : definitions) {
                if (definition == null) continue;
                totalQuestions++;
                String status = statusMap.get(definition.getId());
                if (status == null || status.isEmpty()) {
                    return false;
                }
            }
        }
        return totalQuestions > 0;
    }

    private void updateCreateReportButton() {
        if (btnCreateReport == null) return;
        boolean enabled = areAllMilestonesAnswered();
        btnCreateReport.setEnabled(enabled);
        btnCreateReport.setAlpha(enabled ? 1f : 0.45f);
    }

    private void createMilestoneReport() {
        if (!areAllMilestonesAnswered()) return;
        if (babyId == -1) {
            Toast.makeText(getContext(), "Report is ready", Toast.LENGTH_SHORT).show();
            return;
        }

        apiService.getMilestoneReport(babyId, selectedMonth).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Map<String, Object>>> call,
                                   @NonNull Response<ApiResponse<Map<String, Object>>> response) {
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Report is ready", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Map<String, Object>>> call, @NonNull Throwable t) {
                if (getContext() != null) {
                    Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void upsertMilestoneStatus(int definitionId, String status) {
        Map<String, Object> body = new HashMap<>();
        body.put("baby_id", babyId);
        body.put("milestone_definition_id", definitionId);
        body.put("status", status);

        apiService.upsertBabyMilestone(body).enqueue(new Callback<ApiResponse<BabyMilestone>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<BabyMilestone>> call,
                                   @NonNull Response<ApiResponse<BabyMilestone>> response) {
                // Status saved silently
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<BabyMilestone>> call, @NonNull Throwable t) {
                if (getContext() != null) {
                    Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void showLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        if (loading) {
            recyclerMilestones.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.GONE);
        }
    }

    // ── Mock data (shown when API is unreachable) ─────────────────────────────

    private Map<String, List<MilestoneDefinition>> mockDefinitions(int month) {
        Map<String, List<MilestoneDefinition>> map = new HashMap<>();

        String[][] physical = {
                {"Begins to take weight on hands during tummy time for a few seconds.", "Eye Movement, Cycle Movement"},
                {"Looks closely at objects and tries to grab them if held close to their face and hand.", "Recognizing Hands"},
                {"Lifts head briefly when on tummy.", "Tummy Time"},
                {"Moves arms and legs symmetrically.", "Cycle Movement"},
        };
        String[][] cognitive = {
                {"Responds to sudden sounds by startling.", "Sound Explorer"},
                {"Follows moving objects with eyes briefly.", "Eye Movement"},
                {"Prefers looking at high-contrast patterns.", "Contrast Cards"},
                {"Shows preference for faces over objects.", "Face Talk"},
        };
        String[][] communication = {
                {"Differentiates between high and low-pitched voices.", "Sound Explorer"},
                {"Makes small throaty sounds.", "Smile Talk"},
                {"Cries differently for hunger vs discomfort.", "Care Cue Practice"},
                {"Responds to soothing sounds and music.", "Lullaby Time"},
        };
        String[][] social = {
                {"Calms when picked up or held.", "Cuddle Pause"},
                {"Responds positively to caregiver's face and voice.", "Face Talk"},
                {"Shows excitement with arm/leg movement when spoken to.", "Smile Talk"},
                {"Recognises primary caregiver's voice.", "Voice Bonding"},
        };

        map.put("physical",         buildMockList(1, physical));
        map.put("cognitive",        buildMockList(5, cognitive));
        map.put("communication",    buildMockList(9, communication));
        map.put("social_emotional", buildMockList(13, social));
        return map;
    }

    private List<MilestoneDefinition> buildMockList(int startId, String[][] data) {
        List<MilestoneDefinition> list = new ArrayList<>();
        for (int i = 0; i < data.length; i++) {
            MilestoneDefinition def = new MilestoneDefinition();
            def.setId(startId + i);
            def.setTitle(data[i][0]);
            def.setQuestion(data[i][0]);
            def.setRelatedActivity(data[i].length > 1 && data[i][1] != null ? data[i][1] : "");
            def.setDoctorVerified(i == 0);
            list.add(def);
        }
        return list;
    }

    private int calculateAgeInMonths(String birthDate) {
        if (birthDate == null) return 2;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date birth = sdf.parse(birthDate);
            if (birth == null) return 2;
            Calendar birthCal = Calendar.getInstance();
            birthCal.setTime(birth);
            Calendar now = Calendar.getInstance();
            int months = (now.get(Calendar.YEAR) - birthCal.get(Calendar.YEAR)) * 12
                    + (now.get(Calendar.MONTH) - birthCal.get(Calendar.MONTH));
            return Math.max(1, months);
        } catch (Exception e) {
            return 2;
        }
    }
}

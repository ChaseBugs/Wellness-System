package com.talentbaby.app.ui.tips;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.DailyUpdate;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TipsFragment extends Fragment {

    private ProgressBar progressBar;
    private LinearLayout layoutTipsList;
    private LinearLayout layoutEmpty;
    private TextView tabAll, tabTip, tabDevelopment, tabSafety;

    private ApiService apiService;
    private int babyId = -1;
    private List<DailyUpdate> allUpdates = new ArrayList<>();
    private String activeFilter = null; // null = all

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_tips, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        apiService = ApiClient.getClient().create(ApiService.class);
        babyId = TokenManager.getBabyId(requireContext());

        initViews(view);
        loadTips();
    }

    private void initViews(View view) {
        progressBar      = view.findViewById(R.id.progressBarTips);
        layoutTipsList   = view.findViewById(R.id.layoutTipsList);
        layoutEmpty      = view.findViewById(R.id.layoutEmptyTips);
        tabAll           = view.findViewById(R.id.tabAll);
        tabTip           = view.findViewById(R.id.tabTip);
        tabDevelopment   = view.findViewById(R.id.tabDevelopment);
        tabSafety        = view.findViewById(R.id.tabSafety);

        view.findViewById(R.id.btnMenuTips).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });
        view.findViewById(R.id.btnParentingSupportTips).setOnClickListener(v ->
                startActivity(new android.content.Intent(requireContext(), com.talentbaby.app.activities.ParentingSupportActivity.class)));

        tabAll.setOnClickListener(v -> selectTab(null));
        tabTip.setOnClickListener(v -> selectTab("tip"));
        tabDevelopment.setOnClickListener(v -> selectTab("development"));
        tabSafety.setOnClickListener(v -> selectTab("safety"));
    }

    private void selectTab(String filter) {
        activeFilter = filter;
        updateTabAppearance();
        renderList(allUpdates);
    }

    private void updateTabAppearance() {
        setTabActive(tabAll, activeFilter == null);
        setTabActive(tabTip, "tip".equals(activeFilter));
        setTabActive(tabDevelopment, "development".equals(activeFilter));
        setTabActive(tabSafety, "safety".equals(activeFilter));
    }

    private void setTabActive(TextView tab, boolean active) {
        tab.setBackgroundResource(active ? R.drawable.bg_tab_selected : R.drawable.bg_tab_unselected);
        tab.setTextColor(requireContext().getColor(
                active ? R.color.text_on_primary : R.color.text_secondary));
    }

    private void loadTips() {
        if (babyId == -1) {
            loadMockTips();
            return;
        }
        progressBar.setVisibility(View.VISIBLE);
        layoutTipsList.setVisibility(View.GONE);
        layoutEmpty.setVisibility(View.GONE);

        apiService.getTodayUpdates(babyId).enqueue(new Callback<ApiResponse<List<DailyUpdate>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<DailyUpdate>>> call,
                                   @NonNull Response<ApiResponse<List<DailyUpdate>>> response) {
                if (!isAdded()) return;
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null
                        && !response.body().getData().isEmpty()) {
                    allUpdates = response.body().getData();
                    renderList(allUpdates);
                } else {
                    loadByAge();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<DailyUpdate>>> call, @NonNull Throwable t) {
                if (!isAdded()) return;
                progressBar.setVisibility(View.GONE);
                loadMockTips();
            }
        });
    }

    private void loadByAge() {
        // Fall back to loading by age — default 2 months (baby age unknown without API round-trip)
        int ageMonths = 2;

        apiService.getUpdatesByAge(ageMonths).enqueue(new Callback<ApiResponse<List<DailyUpdate>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<DailyUpdate>>> call,
                                   @NonNull Response<ApiResponse<List<DailyUpdate>>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    allUpdates = response.body().getData();
                    renderList(allUpdates);
                } else {
                    loadMockTips();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<DailyUpdate>>> call, @NonNull Throwable t) {
                if (isAdded()) loadMockTips();
            }
        });
    }

    private void renderList(List<DailyUpdate> updates) {
        layoutTipsList.removeAllViews();
        List<DailyUpdate> filtered = new ArrayList<>();
        for (DailyUpdate u : updates) {
            if (activeFilter == null || activeFilter.equals(u.getContentType())) {
                filtered.add(u);
            }
        }

        if (filtered.isEmpty()) {
            layoutTipsList.setVisibility(View.GONE);
            layoutEmpty.setVisibility(View.VISIBLE);
            return;
        }

        layoutEmpty.setVisibility(View.GONE);
        layoutTipsList.setVisibility(View.VISIBLE);

        LayoutInflater inflater = LayoutInflater.from(requireContext());
        for (DailyUpdate tip : filtered) {
            View card = inflater.inflate(R.layout.item_tip, layoutTipsList, false);
            TextView textType    = card.findViewById(R.id.textTipType);
            TextView textTitle   = card.findViewById(R.id.textTipTitle);
            TextView textContent = card.findViewById(R.id.textTipContent);

            textType.setText(typeLabel(tip.getContentType()));
            textTitle.setText(tip.getTitle() != null ? tip.getTitle() : "");
            textContent.setText(tip.getContent() != null ? tip.getContent() : "");

            layoutTipsList.addView(card);
        }
    }

    private String typeLabel(String type) {
        if (type == null) return "Tip";
        switch (type) {
            case "development": return getString(R.string.tip_type_development);
            case "activity":    return getString(R.string.tip_type_activity);
            case "safety":      return getString(R.string.tip_type_safety);
            default:            return getString(R.string.tip_type_tip);
        }
    }

    private void loadMockTips() {
        allUpdates = new ArrayList<>();

        allUpdates.add(mockUpdate("tip",
                "Tummy Time is Essential",
                "Aim for 3-5 short tummy time sessions per day. This builds shoulder, arm, and neck strength needed for rolling and crawling."));
        allUpdates.add(mockUpdate("development",
                "Hand-Eye Coordination",
                "Hold a colourful toy about 8-12 inches from your baby's face and move it slowly side to side. This strengthens visual tracking muscles."));
        allUpdates.add(mockUpdate("safety",
                "Safe Sleep Reminder",
                "Always place baby on their back to sleep on a firm, flat surface. Keep the crib free of pillows, blankets, and bumpers."));
        allUpdates.add(mockUpdate("tip",
                "Talk to Your Baby",
                "Narrate your daily activities — 'Now I'm washing the dishes!' Babies exposed to rich language develop stronger communication skills."));
        allUpdates.add(mockUpdate("development",
                "Sensory Exploration",
                "Let baby touch different textures — soft cloth, a rubber toy, your hair. This stimulates brain pathways for cognitive growth."));

        renderList(allUpdates);
    }

    private DailyUpdate mockUpdate(String type, String title, String content) {
        return new DailyUpdate() {
            @Override public String getContentType() { return type; }
            @Override public String getTitle()       { return title; }
            @Override public String getContent()     { return content; }
        };
    }
}

package com.talentbaby.app.activities;

import android.animation.ValueAnimator;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.talentbaby.app.R;
import com.talentbaby.app.adapters.StoryAdapter;
import com.talentbaby.app.data.StoryDemoData;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Story;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StoryTimeActivity extends AppCompatActivity {
    private static final int[] AGE_QUERY_MONTHS = {5, 18};

    private final List<Story> stories = new ArrayList<>();
    private StoryAdapter adapter;
    private ApiService apiService;
    private RecyclerView recyclerStories;
    private View ageSelectorContainer;
    private View selectedMonthPill;
    private EditText editStorySearch;
    private TextView[] monthTabs;
    private int selectedMonthIndex = 0;
    private String currentSearchQuery = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_story_time);

        apiService = ApiClient.getClient().create(ApiService.class);

        ImageButton back = findViewById(R.id.btnBackStoryTime);
        back.bringToFront();
        back.setOnClickListener(v -> getOnBackPressedDispatcher().onBackPressed());

        recyclerStories = findViewById(R.id.recyclerStories);
        adapter = new StoryAdapter(stories, false, this::openStory);
        recyclerStories.setLayoutManager(new LinearLayoutManager(this));
        recyclerStories.setAdapter(adapter);
        recyclerStories.setNestedScrollingEnabled(false);

        setupMonthSelector();
        setupSearch();
        showStories(filterDemoStories());
        loadStoriesFromApi(selectedMonthIndex);
    }

    private void setupSearch() {
        editStorySearch = findViewById(R.id.editStorySearch);
        ImageButton searchButton = findViewById(R.id.btnStorySearch);
        searchButton.setOnClickListener(v -> performStorySearch());
        editStorySearch.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                performStorySearch();
                return true;
            }
            return false;
        });
    }

    private void performStorySearch() {
        String query = editStorySearch.getText() != null
                ? editStorySearch.getText().toString().trim()
                : "";
        currentSearchQuery = query.isEmpty() ? null : query;
        showStories(filterDemoStories());
        loadStoriesFromApi(selectedMonthIndex);

        InputMethodManager inputMethodManager =
                (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (inputMethodManager != null) {
            inputMethodManager.hideSoftInputFromWindow(editStorySearch.getWindowToken(), 0);
        }
        editStorySearch.clearFocus();
    }

    private void setupMonthSelector() {
        ageSelectorContainer = findViewById(R.id.ageSelectorContainer);
        selectedMonthPill = findViewById(R.id.selectedMonthPill);

        monthTabs = new TextView[] {
                findViewById(R.id.tabMonth0To11),
                findViewById(R.id.tabMonth12To24)
        };

        for (int i = 0; i < monthTabs.length; i++) {
            final int index = i;
            monthTabs[i].setOnClickListener(v -> selectMonth(index));
        }

        ageSelectorContainer.setOnTouchListener((v, event) -> {
            if (event.getAction() != MotionEvent.ACTION_UP) return true;
            int cellWidth = Math.max(1, ageSelectorContainer.getWidth() / monthTabs.length);
            int tappedIndex = Math.min(monthTabs.length - 1, Math.max(0, (int) (event.getX() / cellWidth)));
            selectMonth(tappedIndex);
            return true;
        });

        ageSelectorContainer.post(() -> updateMonthSelector(false));
    }

    private void selectMonth(int index) {
        if (index == selectedMonthIndex) return;

        selectedMonthIndex = index;
        updateMonthSelector(true);
        recyclerStories.animate()
                .alpha(0f)
                .translationY(18f)
                .setDuration(120)
                .setInterpolator(new AccelerateDecelerateInterpolator())
                .withEndAction(() -> {
                    showStories(filterDemoStories());
                    recyclerStories.setTranslationY(-12f);
                    recyclerStories.animate()
                            .alpha(1f)
                            .translationY(0f)
                            .setDuration(180)
                            .setInterpolator(new AccelerateDecelerateInterpolator())
                            .start();
                    loadStoriesFromApi(selectedMonthIndex);
                })
                .start();
    }

    private void updateMonthSelector(boolean animate) {
        int cellWidth = ageSelectorContainer.getWidth() / monthTabs.length;
        if (cellWidth <= 0) return;

        int targetX = selectedMonthIndex * cellWidth;
        ViewGroup.LayoutParams layoutParams = selectedMonthPill.getLayoutParams();

        if (animate) {
            ValueAnimator widthAnimator = ValueAnimator.ofInt(layoutParams.width, cellWidth);
            widthAnimator.setDuration(220);
            widthAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
            widthAnimator.addUpdateListener(animation -> {
                layoutParams.width = (int) animation.getAnimatedValue();
                selectedMonthPill.setLayoutParams(layoutParams);
            });
            widthAnimator.start();

            selectedMonthPill.animate()
                    .translationX(targetX)
                    .setDuration(260)
                    .setInterpolator(new AccelerateDecelerateInterpolator())
                    .start();
        } else {
            layoutParams.width = cellWidth;
            selectedMonthPill.setLayoutParams(layoutParams);
            selectedMonthPill.setTranslationX(targetX);
        }

        int selectedText = Color.WHITE;
        int unselectedText = ContextCompat.getColor(this, R.color.home_text_muted);
        for (int i = 0; i < monthTabs.length; i++) {
            monthTabs[i].setTextColor(i == selectedMonthIndex ? selectedText : unselectedText);
        }
    }

    private void loadStoriesFromApi(int monthIndex) {
        int requestedIndex = monthIndex;
        String requestedSearchQuery = currentSearchQuery;
        apiService.getStories(AGE_QUERY_MONTHS[monthIndex], requestedSearchQuery).enqueue(new Callback<ApiResponse<List<Story>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Story>>> call,
                                   Response<ApiResponse<List<Story>>> response) {
                if (requestedIndex != selectedMonthIndex) return;

                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null
                        && !response.body().getData().isEmpty()) {
                    showStories(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Story>>> call, Throwable t) {
                // Demo stories remain visible until the backend endpoint is available.
            }
        });
    }

    private void showStories(List<Story> newStories) {
        stories.clear();
        stories.addAll(newStories);
        adapter.notifyDataSetChanged();
    }

    private List<Story> filterDemoStories() {
        String selectedAgeGroup = selectedMonthIndex == 0 ? "0-11" : "12-24";
        List<Story> ageFilteredStories = new ArrayList<>();
        for (Story story : StoryDemoData.stories()) {
            if (selectedAgeGroup.equals(story.getAgeGroup())) {
                ageFilteredStories.add(story);
            }
        }

        if (currentSearchQuery == null) {
            return ageFilteredStories;
        }

        String normalizedQuery = currentSearchQuery.toLowerCase();
        List<Story> filteredStories = new ArrayList<>();
        for (Story story : ageFilteredStories) {
            String title = story.getTitle() != null ? story.getTitle().toLowerCase() : "";
            String summary = story.getSummary() != null ? story.getSummary().toLowerCase() : "";
            if (title.contains(normalizedQuery) || summary.contains(normalizedQuery)) {
                filteredStories.add(story);
            }
        }
        return filteredStories.isEmpty() ? ageFilteredStories : filteredStories;
    }

    private void openStory(Story story) {
        Intent intent = new Intent(this, StoryDetailActivity.class);
        intent.putExtra("story_id", story.getId());
        startActivity(intent);
    }
}

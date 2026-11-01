package com.talentbaby.app.activities;

import android.content.res.ColorStateList;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.DecelerateInterpolator;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.talentbaby.app.R;
import com.talentbaby.app.adapters.NutritionBenefitAdapter;
import com.talentbaby.app.adapters.NutritionMealAdapter;
import com.talentbaby.app.adapters.NutritionRecipeDisplayAdapter;
import com.talentbaby.app.data.NutritionDemoData;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.NutritionBenefitSection;
import com.talentbaby.app.models.NutritionMealSection;
import com.talentbaby.app.models.NutritionRecipeDisplay;
import com.talentbaby.app.models.Recipe;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NutritionRecipesActivity extends AppCompatActivity {
    private static final int MODE_PRIMARY = 0;
    private static final int MODE_SECONDARY = 1;

    private final String[] ageTargets = {"mom_0_6", "baby_7_11", "baby_12_17", "baby_18_24", "baby_25_30", "baby_31_36"};
    private final String[] mealTypes = {"Breakfast", "Lunch", "Dinner", "Snacks"};
    private final String[] dateLabels = {"Mon\n23", "Tue\n24", "Wed\n25", "Thu\n26", "Fri\n27", "Sat\n28", "Sun\n29"};

    private final List<NutritionMealSection> mealSections = new ArrayList<>();
    private final List<NutritionRecipeDisplay> babyRecipeItems = new ArrayList<>();
    private final List<NutritionBenefitSection> benefitSections = new ArrayList<>();

    private NutritionMealAdapter mealAdapter;
    private NutritionRecipeDisplayAdapter babyRecipeAdapter;
    private NutritionBenefitAdapter benefitAdapter;
    private ApiService apiService;

    private HorizontalScrollView ageScroll;
    private LinearLayout datePlanRow;
    private LinearLayout mealTypeRow;
    private View guideContent;
    private RecyclerView recyclerMeals;
    private RecyclerView recyclerBabyRecipes;
    private RecyclerView recyclerBenefitSections;
    private FrameLayout refreshButton;
    private ImageView iconRefresh;
    private TextView tabPrimary;
    private TextView tabSecondary;
    private TextView tabVeg;
    private TextView[] ageTabs;
    private TextView[] dateTabs;
    private TextView[] mealTabs;

    private int selectedAgeIndex = 5;
    private int selectedDateIndex = 2;
    private int selectedMealIndex = 2;
    private int selectedMode = MODE_PRIMARY;
    private boolean vegOnly = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nutrition_recipes);

        apiService = ApiClient.getClient().create(ApiService.class);
        ImageButton back = findViewById(R.id.btnBackNutrition);
        back.setOnClickListener(v -> finish());

        bindViews();
        setupLists();
        setupAgeTabs();
        setupModeTabs();
        setupDateTabs();
        setupMealTabs();
        renderForCurrentState(false);
    }

    private void bindViews() {
        ageScroll = findViewById(R.id.ageScrollNutrition);
        tabPrimary = findViewById(R.id.tabLactationGuide);
        tabSecondary = findViewById(R.id.tabMomPlan);
        tabVeg = findViewById(R.id.tabVeg);
        datePlanRow = findViewById(R.id.datePlanRow);
        mealTypeRow = findViewById(R.id.mealTypeRow);
        guideContent = findViewById(R.id.guideContent);
        recyclerMeals = findViewById(R.id.recyclerNutritionMeals);
        recyclerBabyRecipes = findViewById(R.id.recyclerBabyRecipes);
        recyclerBenefitSections = findViewById(R.id.recyclerBenefitSections);
        refreshButton = findViewById(R.id.btnRefreshNutrition);
        iconRefresh = findViewById(R.id.iconRefreshNutrition);

        ageTabs = new TextView[] {
                findViewById(R.id.tabNutritionMonth0To6),
                findViewById(R.id.tabNutritionMonth7To11),
                findViewById(R.id.tabNutritionMonth12To17),
                findViewById(R.id.tabNutritionMonth18To24),
                findViewById(R.id.tabNutritionMonth25To30),
                findViewById(R.id.tabNutritionMonth31To36)
        };

        mealTabs = new TextView[] {
                findViewById(R.id.tabMealBreakfast),
                findViewById(R.id.tabMealLunch),
                findViewById(R.id.tabMealDinner),
                findViewById(R.id.tabMealSnacks)
        };
    }

    private void setupLists() {
        mealAdapter = new NutritionMealAdapter(mealSections);
        recyclerMeals.setLayoutManager(new LinearLayoutManager(this));
        recyclerMeals.setAdapter(mealAdapter);
        recyclerMeals.setNestedScrollingEnabled(false);

        babyRecipeAdapter = new NutritionRecipeDisplayAdapter(babyRecipeItems, recipe -> {
            Intent intent = new Intent(this, RecipeDetailActivity.class);
            intent.putExtra("recipe_id", recipe.getRecipeId());
            startActivity(intent);
        });
        recyclerBabyRecipes.setLayoutManager(new LinearLayoutManager(this));
        recyclerBabyRecipes.setAdapter(babyRecipeAdapter);
        recyclerBabyRecipes.setNestedScrollingEnabled(false);

        benefitAdapter = new NutritionBenefitAdapter(benefitSections);
        recyclerBenefitSections.setLayoutManager(new LinearLayoutManager(this));
        recyclerBenefitSections.setAdapter(benefitAdapter);
        recyclerBenefitSections.setNestedScrollingEnabled(false);
    }

    private void setupAgeTabs() {
        for (int i = 0; i < ageTabs.length; i++) {
            final int index = i;
            ageTabs[i].setOnClickListener(v -> {
                if (selectedAgeIndex == index) return;
                selectedAgeIndex = index;
                selectedMode = MODE_PRIMARY;
                animateTabPress(ageTabs[index]);
                renderForCurrentState(true);
            });
        }
        ageScroll.post(() -> scrollAgeToSelected(false));
    }

    private void setupModeTabs() {
        tabPrimary.setOnClickListener(v -> {
            selectedMode = MODE_PRIMARY;
            animateTabPress(tabPrimary);
            renderForCurrentState(true);
        });
        tabSecondary.setOnClickListener(v -> {
            selectedMode = MODE_SECONDARY;
            animateTabPress(tabSecondary);
            renderForCurrentState(true);
        });
        tabVeg.setOnClickListener(v -> {
            vegOnly = !vegOnly;
            animateTabPress(tabVeg);
            if (isBabyAge() && selectedMode == MODE_PRIMARY) {
                showBabyRecipes();
                loadBabyRecipesFromApi();
            }
        });
        refreshButton.setOnClickListener(v -> {
            iconRefresh.animate()
                    .rotationBy(180f)
                    .setDuration(260)
                    .setInterpolator(new AccelerateDecelerateInterpolator())
                    .start();
            if (!isBabyAge() && selectedMode == MODE_SECONDARY) {
                showDemoMealPlan();
                loadMomPlanFromApi();
            }
        });
    }

    private void setupDateTabs() {
        dateTabs = new TextView[dateLabels.length];
        datePlanRow.removeAllViews();
        for (int i = 0; i < dateLabels.length; i++) {
            final int index = i;
            TextView tab = new TextView(this);
            tab.setText(dateLabels[i]);
            tab.setGravity(Gravity.CENTER);
            tab.setTextSize(18);
            tab.setLineSpacing(dp(2), 1f);
            tab.setClickable(true);
            tab.setFocusable(true);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, dp(86), 1f);
            params.setMargins(dp(3), 0, dp(3), 0);
            datePlanRow.addView(tab, params);
            tab.setOnClickListener(v -> selectDate(index));
            dateTabs[i] = tab;
        }
        updateDateTabs(false);
    }

    private void setupMealTabs() {
        for (int i = 0; i < mealTabs.length; i++) {
            final int index = i;
            mealTabs[i].setOnClickListener(v -> {
                if (selectedMealIndex == index) return;
                selectedMealIndex = index;
                animateTabPress(mealTabs[index]);
                updateMealTabs();
                showBabyRecipes();
                loadBabyRecipesFromApi();
            });
        }
    }

    private void selectDate(int index) {
        selectedDateIndex = index;
        updateDateTabs(true);
        recyclerMeals.animate()
                .alpha(0f)
                .translationX(dp(18))
                .setDuration(110)
                .withEndAction(() -> {
                    showDemoMealPlan();
                    recyclerMeals.setTranslationX(-dp(12));
                    recyclerMeals.animate()
                            .alpha(1f)
                            .translationX(0f)
                            .setDuration(180)
                            .setInterpolator(new DecelerateInterpolator())
                            .start();
                    loadMomPlanFromApi();
                })
                .start();
    }

    private void renderForCurrentState(boolean animateContent) {
        updateAgeTabs();
        scrollAgeToSelected(true);
        updateModeLabels();
        updateModeTabs();

        boolean babyAge = isBabyAge();
        if (!babyAge && selectedMode == MODE_PRIMARY) {
            showGuideMode();
        } else if (!babyAge) {
            showMomPlan();
        } else if (selectedMode == MODE_PRIMARY) {
            showBabyRecipesMode();
        } else {
            showBenefitsMode();
        }

        if (animateContent) {
            animateVisibleContent();
        }
    }

    private void updateAgeTabs() {
        int teal = ContextCompat.getColor(this, R.color.home_teal);
        int muted = ContextCompat.getColor(this, R.color.home_text_muted);
        for (int i = 0; i < ageTabs.length; i++) {
            boolean selected = i == selectedAgeIndex;
            ageTabs[i].setBackgroundResource(selected ? R.drawable.bg_date_selected : 0);
            ageTabs[i].setTextColor(selected ? Color.WHITE : muted);
            ageTabs[i].setTextSize(selected ? 24 : 21);
            ageTabs[i].setAlpha(selected || Math.abs(i - selectedAgeIndex) <= 1 ? 1f : 0.35f);
            if (!selected) {
                ageTabs[i].setTextColor(i < selectedAgeIndex ? muted : teal);
            }
        }
    }

    private void scrollAgeToSelected(boolean smooth) {
        ageScroll.post(() -> {
            TextView tab = ageTabs[selectedAgeIndex];
            int target = Math.max(0, tab.getLeft() - (ageScroll.getWidth() - tab.getWidth()) / 2);
            if (smooth) {
                ageScroll.smoothScrollTo(target, 0);
            } else {
                ageScroll.scrollTo(target, 0);
            }
        });
    }

    private void updateModeLabels() {
        if (isBabyAge()) {
            tabPrimary.setText(R.string.recipes_for_baby);
            tabSecondary.setText(R.string.nutrition_and_benefits);
        } else {
            tabPrimary.setText(R.string.lactation_guide);
            tabSecondary.setText(R.string.moms_nutrition_plan);
        }
    }

    private void updateModeTabs() {
        boolean primary = selectedMode == MODE_PRIMARY;
        tabPrimary.setBackgroundResource(primary ? R.drawable.bg_nutrition_selected_left : 0);
        tabSecondary.setBackgroundResource(primary ? 0 : R.drawable.bg_nutrition_selected_right);
        tabPrimary.setTextColor(primary ? ContextCompat.getColor(this, R.color.home_teal) : Color.WHITE);
        tabSecondary.setTextColor(primary ? Color.WHITE : ContextCompat.getColor(this, R.color.home_teal));
        tabVeg.setAlpha(vegOnly ? 1f : 0.9f);
        tabVeg.setTextColor(ContextCompat.getColor(this, R.color.home_teal));
    }

    private void updateDateTabs(boolean animate) {
        for (int i = 0; i < dateTabs.length; i++) {
            boolean selected = i == selectedDateIndex;
            dateTabs[i].setBackgroundResource(selected ? R.drawable.bg_nutrition_selected_teal : R.drawable.bg_nutrition_date_outline);
            dateTabs[i].setTextColor(selected ? Color.WHITE : ContextCompat.getColor(this, R.color.home_teal));
            dateTabs[i].setTextSize(selected ? 19 : 18);
            dateTabs[i].setTypeface(null, selected ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL);
            if (animate && selected) {
                animateTabPress(dateTabs[i]);
            }
        }
    }

    private void updateMealTabs() {
        for (int i = 0; i < mealTabs.length; i++) {
            boolean selected = i == selectedMealIndex;
            mealTabs[i].setBackgroundResource(selected ? R.drawable.bg_nutrition_selected_teal : R.drawable.bg_teal_outline_pill);
            mealTabs[i].setTextColor(selected ? Color.WHITE : ContextCompat.getColor(this, R.color.home_teal));
        }
    }

    private void showGuideMode() {
        datePlanRow.setVisibility(View.GONE);
        mealTypeRow.setVisibility(View.GONE);
        guideContent.setVisibility(View.VISIBLE);
        recyclerMeals.setVisibility(View.GONE);
        recyclerBabyRecipes.setVisibility(View.GONE);
        recyclerBenefitSections.setVisibility(View.GONE);
        refreshButton.setVisibility(View.GONE);
    }

    private void showMomPlan() {
        datePlanRow.setVisibility(View.VISIBLE);
        mealTypeRow.setVisibility(View.GONE);
        guideContent.setVisibility(View.GONE);
        recyclerMeals.setVisibility(View.VISIBLE);
        recyclerBabyRecipes.setVisibility(View.GONE);
        recyclerBenefitSections.setVisibility(View.GONE);
        refreshButton.setVisibility(View.VISIBLE);
        showDemoMealPlan();
        loadMomPlanFromApi();
    }

    private void showBabyRecipesMode() {
        datePlanRow.setVisibility(View.GONE);
        mealTypeRow.setVisibility(View.VISIBLE);
        guideContent.setVisibility(View.GONE);
        recyclerMeals.setVisibility(View.GONE);
        recyclerBabyRecipes.setVisibility(View.VISIBLE);
        recyclerBenefitSections.setVisibility(View.GONE);
        refreshButton.setVisibility(View.GONE);
        updateMealTabs();
        showBabyRecipes();
        loadBabyRecipesFromApi();
    }

    private void showBenefitsMode() {
        datePlanRow.setVisibility(View.GONE);
        mealTypeRow.setVisibility(View.GONE);
        guideContent.setVisibility(View.GONE);
        recyclerMeals.setVisibility(View.GONE);
        recyclerBabyRecipes.setVisibility(View.GONE);
        recyclerBenefitSections.setVisibility(View.VISIBLE);
        refreshButton.setVisibility(View.GONE);
        benefitSections.clear();
        benefitSections.addAll(NutritionDemoData.nutritionBenefits());
        benefitAdapter.notifyDataSetChanged();
    }

    private void showDemoMealPlan() {
        mealSections.clear();
        mealSections.addAll(NutritionDemoData.mealPlanSections());
        mealAdapter.notifyDataSetChanged();
    }

    private void showBabyRecipes() {
        babyRecipeItems.clear();
        babyRecipeItems.addAll(NutritionDemoData.babyRecipes(mealTypes[selectedMealIndex]));
        babyRecipeAdapter.notifyDataSetChanged();
    }

    private void loadMomPlanFromApi() {
        apiService.getRecipes(vegOnly ? "Veg" : null, ageTargets[selectedAgeIndex])
                .enqueue(new Callback<ApiResponse<List<Recipe>>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<List<Recipe>>> call,
                                           Response<ApiResponse<List<Recipe>>> response) {
                        if (isBabyAge() || selectedMode != MODE_SECONDARY) return;
                        if (response.isSuccessful() && response.body() != null
                                && response.body().getData() != null
                                && !response.body().getData().isEmpty()) {
                            mealSections.clear();
                            mealSections.addAll(NutritionDemoData.fromRecipes(response.body().getData()));
                            mealAdapter.notifyDataSetChanged();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<List<Recipe>>> call, Throwable t) {
                        // Demo meal plan remains visible until backend data is available.
                    }
                });
    }

    private void loadBabyRecipesFromApi() {
        apiService.getBabyRecipesByAgeGroup(selectedAgeGroup(), selectedMealSlot())
                .enqueue(new Callback<ApiResponse<List<Recipe>>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<List<Recipe>>> call,
                                           Response<ApiResponse<List<Recipe>>> response) {
                        if (!isBabyAge() || selectedMode != MODE_PRIMARY) return;
                        if (response.isSuccessful() && response.body() != null
                                && response.body().getData() != null
                                && !response.body().getData().isEmpty()) {
                            babyRecipeItems.clear();
                            int count = response.body().getData().size();
                            for (int i = 0; i < count; i++) {
                                Recipe recipe = response.body().getData().get(i);
                                babyRecipeItems.add(new NutritionRecipeDisplay(
                                        recipe.getId(),
                                        recipe.getTitle() != null ? recipe.getTitle() : "",
                                        recipe.getLocalImageResId(),
                                        recipe.getImageUrl(),
                                        false));
                            }
                            babyRecipeAdapter.notifyDataSetChanged();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<List<Recipe>>> call, Throwable t) {
                        // Demo recipes remain visible until backend data is available.
                    }
                });
    }

    private boolean isBabyAge() {
        return selectedAgeIndex > 0;
    }

    private String selectedAgeGroup() {
        switch (selectedAgeIndex) {
            case 1: return "7-11";
            case 2: return "12-17";
            case 3: return "18-24";
            case 4: return "25-30";
            case 5: return "31-36";
            case 0:
            default: return "0-6";
        }
    }

    private String selectedMealSlot() {
        switch (selectedMealIndex) {
            case 0: return "breakfast";
            case 1: return "lunch";
            case 2: return "dinner";
            case 3:
            default: return "snack";
        }
    }

    private void animateVisibleContent() {
        View visible;
        if (guideContent.getVisibility() == View.VISIBLE) {
            visible = guideContent;
        } else if (recyclerMeals.getVisibility() == View.VISIBLE) {
            visible = recyclerMeals;
        } else if (recyclerBabyRecipes.getVisibility() == View.VISIBLE) {
            visible = recyclerBabyRecipes;
        } else {
            visible = recyclerBenefitSections;
        }
        visible.setAlpha(0f);
        visible.setTranslationY(dp(18));
        visible.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(220)
                .setInterpolator(new DecelerateInterpolator())
                .start();
    }

    private void animateTabPress(View view) {
        view.animate().cancel();
        view.setScaleX(0.94f);
        view.setScaleY(0.94f);
        view.animate()
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(180)
                .setInterpolator(new DecelerateInterpolator())
                .start();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}

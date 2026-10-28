package com.talentbaby.app.activities;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.google.android.material.appbar.MaterialToolbar;
import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Recipe;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RecipeDetailActivity extends AppCompatActivity {

    private ImageView imageRecipe;
    private TextView textTitle;
    private TextView textCategory;
    private TextView textPrepTime;
    private TextView textCookTime;
    private TextView textServings;
    private TextView textCalories;
    private TextView textDescription;
    private TextView labelIngredients;
    private HorizontalScrollView scrollIngredientImages;
    private LinearLayout rowIngredientImages;
    private TextView textIngredients;
    private TextView labelNutrients;
    private TextView textNutrients;
    private TextView labelSteps;
    private TextView textSteps;
    private TextView labelInstructions;
    private TextView textInstructions;
    private TextView labelGeneralNotes;
    private TextView textGeneralNotes;
    private TextView textDoctorVerified;
    private ProgressBar progressBar;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_recipe_detail);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setNavigationOnClickListener(v -> onBackPressed());

        apiService = ApiClient.getClient().create(ApiService.class);

        imageRecipe = findViewById(R.id.imageRecipe);
        textTitle = findViewById(R.id.textTitle);
        textCategory = findViewById(R.id.textCategory);
        textPrepTime = findViewById(R.id.textPrepTime);
        textCookTime = findViewById(R.id.textCookTime);
        textServings = findViewById(R.id.textServings);
        textCalories = findViewById(R.id.textCalories);
        textDescription = findViewById(R.id.textDescription);
        labelIngredients = findViewById(R.id.labelIngredients);
        scrollIngredientImages = findViewById(R.id.scrollIngredientImages);
        rowIngredientImages = findViewById(R.id.rowIngredientImages);
        textIngredients = findViewById(R.id.textIngredients);
        labelNutrients = findViewById(R.id.labelNutrients);
        textNutrients = findViewById(R.id.textNutrients);
        labelSteps = findViewById(R.id.labelSteps);
        textSteps = findViewById(R.id.textSteps);
        labelInstructions = findViewById(R.id.labelInstructions);
        textInstructions = findViewById(R.id.textInstructions);
        labelGeneralNotes = findViewById(R.id.labelGeneralNotes);
        textGeneralNotes = findViewById(R.id.textGeneralNotes);
        textDoctorVerified = findViewById(R.id.textDoctorVerified);
        progressBar = findViewById(R.id.progressBar);

        int recipeId = getIntent().getIntExtra("recipe_id", -1);
        if (recipeId != -1) {
            loadRecipe(recipeId);
        } else {
            finish();
        }
    }

    private void loadRecipe(int id) {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getRecipe(id).enqueue(new Callback<ApiResponse<Recipe>>() {
            @Override
            public void onResponse(Call<ApiResponse<Recipe>> call, Response<ApiResponse<Recipe>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    bindRecipe(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Recipe>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(RecipeDetailActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void bindRecipe(Recipe recipe) {
        textTitle.setText(recipe.getTitle() != null ? recipe.getTitle() : "");

        if (recipe.getCategory() != null) {
            textCategory.setText(recipe.getCategory());
        }

        if (recipe.getPrepTimeMinutes() > 0) {
            textPrepTime.setText(getString(R.string.prep_time, recipe.getPrepTimeMinutes()));
        }
        if (recipe.getCookTimeMinutes() > 0) {
            textCookTime.setText(getString(R.string.cook_time, recipe.getCookTimeMinutes()));
        }
        if (recipe.getServings() > 0) {
            textServings.setText(getString(R.string.servings, recipe.getServings()));
        }
        if (recipe.getCalories() > 0) {
            textCalories.setText(getString(R.string.calories, recipe.getCalories()));
        }

        if (recipe.getDescription() != null && !recipe.getDescription().isEmpty()) {
            textDescription.setText(recipe.getDescription());
            textDescription.setVisibility(View.VISIBLE);
        } else {
            textDescription.setVisibility(View.GONE);
        }

        bindSection(labelIngredients, textIngredients, bulletList(recipe.getIngredientItems()));
        bindIngredientImages(recipe.getIngredientDetails());
        bindSection(labelNutrients, textNutrients, bulletList(recipe.getNutrients()));
        bindSection(labelSteps, textSteps, numberedList(resolveSteps(recipe)));
        bindSection(labelInstructions, textInstructions, bulletList(resolveInstructions(recipe)));
        bindSection(labelGeneralNotes, textGeneralNotes, bulletList(recipe.getGeneralNotes()));

        textDoctorVerified.setText(recipe.isDoctorVerified()
                ? getString(R.string.doctor_verified)
                : getString(R.string.doctor_pending_review));
        textDoctorVerified.setVisibility(View.VISIBLE);

        if (recipe.getImageUrl() != null && !recipe.getImageUrl().isEmpty()) {
            String url = recipe.getImageUrl().startsWith("/")
                    ? ApiClient.getBaseUrl() + recipe.getImageUrl().substring(1)
                    : recipe.getImageUrl();
            Glide.with(this).load(url).centerCrop().into(imageRecipe);
        }
    }

    private void bindSection(TextView label, TextView body, String text) {
        boolean visible = text != null && !text.trim().isEmpty();
        label.setVisibility(visible ? View.VISIBLE : View.GONE);
        body.setVisibility(visible ? View.VISIBLE : View.GONE);
        if (visible) {
            body.setText(text);
        }
    }

    private void bindIngredientImages(List<Recipe.IngredientDetail> ingredients) {
        rowIngredientImages.removeAllViews();
        if (ingredients == null || ingredients.isEmpty()) {
            scrollIngredientImages.setVisibility(View.GONE);
            return;
        }

        for (Recipe.IngredientDetail ingredient : ingredients) {
            rowIngredientImages.addView(createIngredientView(ingredient));
        }
        scrollIngredientImages.setVisibility(View.VISIBLE);
    }

    private View createIngredientView(Recipe.IngredientDetail ingredient) {
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setGravity(Gravity.CENTER_HORIZONTAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(96), LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, dp(14), 0);
        container.setLayoutParams(params);

        ImageView image = new ImageView(this);
        LinearLayout.LayoutParams imageParams = new LinearLayout.LayoutParams(dp(78), dp(78));
        image.setLayoutParams(imageParams);
        image.setBackgroundResource(R.drawable.bg_nutrition_image_soft);
        image.setScaleType(ImageView.ScaleType.CENTER_CROP);
        image.setContentDescription(ingredient.getName());
        container.addView(image);

        TextView label = new TextView(this);
        LinearLayout.LayoutParams labelParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        labelParams.setMargins(0, dp(8), 0, 0);
        label.setLayoutParams(labelParams);
        label.setGravity(Gravity.CENTER);
        label.setTextColor(getResources().getColor(R.color.text_primary));
        label.setTextSize(12);
        label.setMaxLines(3);
        label.setText(ingredient.getName());
        container.addView(label);

        String imageUrl = ingredient.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            String url = imageUrl.startsWith("/")
                    ? ApiClient.getBaseUrl() + imageUrl.substring(1)
                    : imageUrl;
            Glide.with(this).load(url).centerCrop().into(image);
        }

        return container;
    }

    private List<String> resolveSteps(Recipe recipe) {
        List<String> steps = recipe.getSteps();
        return steps.isEmpty() ? recipe.getInstructionItems() : steps;
    }

    private List<String> resolveInstructions(Recipe recipe) {
        List<String> instructions = recipe.getInstructionNotes();
        if (!instructions.isEmpty()) return instructions;
        List<String> fallback = new ArrayList<>();
        fallback.add("Serve at a safe temperature and use an age-appropriate texture.");
        fallback.add("Supervise the baby while eating.");
        return fallback;
    }

    private String bulletList(List<String> items) {
        if (items == null || items.isEmpty()) return "";
        StringBuilder builder = new StringBuilder();
        for (String item : items) {
            if (item == null || item.trim().isEmpty()) continue;
            if (builder.length() > 0) builder.append("\n");
            builder.append("- ").append(item.trim());
        }
        return builder.toString();
    }

    private String numberedList(List<String> items) {
        if (items == null || items.isEmpty()) return "";
        StringBuilder builder = new StringBuilder();
        int index = 1;
        for (String item : items) {
            if (item == null || item.trim().isEmpty()) continue;
            if (builder.length() > 0) builder.append("\n");
            builder.append(index++).append(". ").append(item.trim());
        }
        return builder.toString();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}

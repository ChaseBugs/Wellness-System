package com.talentbaby.app.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import com.talentbaby.app.R;
import com.talentbaby.app.activities.RecipeDetailActivity;
import com.talentbaby.app.adapters.RecipeAdapter;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Recipe;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class RecipesFragment extends Fragment {
    private RecyclerView recyclerRecipes;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;
    private ChipGroup chipGroupCategories;
    private RecipeAdapter recipeAdapter;
    private List<Recipe> allRecipes = new ArrayList<>();
    private List<Recipe> filteredRecipes = new ArrayList<>();
    private ApiService apiService;
    private String selectedCategory = null;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_recipes, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        apiService = ApiClient.getClient().create(ApiService.class);
        initViews(view);
        setupRecyclerView();
        loadRecipes();
    }

    private void initViews(View view) {
        recyclerRecipes = view.findViewById(R.id.recyclerRecipes);
        progressBar = view.findViewById(R.id.progressBar);
        layoutEmpty = view.findViewById(R.id.layoutEmpty);
        chipGroupCategories = view.findViewById(R.id.chipGroupCategories);

        view.findViewById(R.id.btnMenuRecipes).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });

        chipGroupCategories.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) {
                selectedCategory = null;
            } else {
                Chip chip = group.findViewById(checkedIds.get(0));
                if (chip != null && chip.getId() == R.id.chipAll) {
                    selectedCategory = null;
                } else if (chip != null) {
                    selectedCategory = chip.getText().toString();
                }
            }
            filterRecipes();
        });
    }

    private void setupRecyclerView() {
        recipeAdapter = new RecipeAdapter(filteredRecipes, recipe -> {
            Intent intent = new Intent(getActivity(), RecipeDetailActivity.class);
            intent.putExtra("recipe_id", recipe.getId());
            startActivity(intent);
        });
        recyclerRecipes.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerRecipes.setAdapter(recipeAdapter);
    }

    private void loadRecipes() {
        progressBar.setVisibility(View.VISIBLE);
        layoutEmpty.setVisibility(View.GONE);

        apiService.getRecipes(null, null).enqueue(new Callback<ApiResponse<List<Recipe>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Recipe>>> call, Response<ApiResponse<List<Recipe>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    allRecipes.clear();
                    allRecipes.addAll(response.body().getData());
                    setupCategoryChips();
                    filterRecipes();
                } else {
                    layoutEmpty.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Recipe>>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                layoutEmpty.setVisibility(View.VISIBLE);
                if (getContext() != null) {
                    Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void setupCategoryChips() {
        Set<String> categories = new HashSet<>();
        for (Recipe recipe : allRecipes) {
            if (recipe.getCategory() != null && !recipe.getCategory().isEmpty()) {
                categories.add(recipe.getCategory());
            }
        }

        for (int i = chipGroupCategories.getChildCount() - 1; i > 0; i--) {
            chipGroupCategories.removeViewAt(i);
        }

        for (String category : categories) {
            Chip chip = new Chip(requireContext());
            chip.setText(category);
            chip.setCheckable(true);
            chip.setClickable(true);
            chipGroupCategories.addView(chip);
        }
    }

    private void filterRecipes() {
        filteredRecipes.clear();
        if (selectedCategory == null) {
            filteredRecipes.addAll(allRecipes);
        } else {
            for (Recipe recipe : allRecipes) {
                if (selectedCategory.equals(recipe.getCategory())) {
                    filteredRecipes.add(recipe);
                }
            }
        }
        recipeAdapter.notifyDataSetChanged();
        layoutEmpty.setVisibility(filteredRecipes.isEmpty() ? View.VISIBLE : View.GONE);
        recyclerRecipes.setVisibility(filteredRecipes.isEmpty() ? View.GONE : View.VISIBLE);
    }
}

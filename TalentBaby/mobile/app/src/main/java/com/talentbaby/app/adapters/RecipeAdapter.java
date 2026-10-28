package com.talentbaby.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.talentbaby.app.R;
import com.talentbaby.app.models.Recipe;
import com.talentbaby.app.utils.ApiClient;
import java.util.List;

public class RecipeAdapter extends RecyclerView.Adapter<RecipeAdapter.ViewHolder> {
    private final List<Recipe> recipes;
    private final OnRecipeClickListener listener;

    public interface OnRecipeClickListener {
        void onRecipeClick(Recipe recipe);
    }

    public RecipeAdapter(List<Recipe> recipes, OnRecipeClickListener listener) {
        this.recipes = recipes;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_recipe, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(recipes.get(position));
    }

    @Override
    public int getItemCount() {
        return recipes.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        private final ImageView imageRecipe;
        private final TextView textTitle;
        private final TextView textCategory;
        private final TextView textPrepTime;
        private final TextView textCalories;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            imageRecipe = itemView.findViewById(R.id.imageRecipe);
            textTitle = itemView.findViewById(R.id.textRecipeTitle);
            textCategory = itemView.findViewById(R.id.textRecipeCategory);
            textPrepTime = itemView.findViewById(R.id.textRecipePrepTime);
            textCalories = itemView.findViewById(R.id.textRecipeCalories);
        }

        void bind(Recipe recipe) {
            textTitle.setText(recipe.getTitle());
            textCategory.setText(recipe.getCategory() != null ? recipe.getCategory() : "");

            if (recipe.getPrepTimeMinutes() > 0) {
                textPrepTime.setText(itemView.getContext().getString(R.string.prep_time, recipe.getPrepTimeMinutes()));
            } else {
                textPrepTime.setText("");
            }

            if (recipe.getCalories() > 0) {
                textCalories.setText(itemView.getContext().getString(R.string.calories, recipe.getCalories()));
            } else {
                textCalories.setText("");
            }

            if (recipe.getImageUrl() != null && !recipe.getImageUrl().isEmpty()) {
                String imageUrl = recipe.getImageUrl();
                if (imageUrl.startsWith("/")) {
                    imageUrl = ApiClient.getBaseUrl() + imageUrl.substring(1);
                }
                Glide.with(itemView.getContext())
                        .load(imageUrl)
                        .placeholder(R.drawable.rounded_image_background)
                        .centerCrop()
                        .into(imageRecipe);
            } else {
                Glide.with(itemView.getContext()).clear(imageRecipe);
                imageRecipe.setImageResource(R.drawable.rounded_image_background);
            }

            itemView.setOnClickListener(v -> listener.onRecipeClick(recipe));
        }
    }
}

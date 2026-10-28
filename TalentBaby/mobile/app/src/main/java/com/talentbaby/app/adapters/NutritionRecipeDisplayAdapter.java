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
import com.talentbaby.app.models.NutritionRecipeDisplay;
import com.talentbaby.app.utils.ApiClient;

import java.util.List;

public class NutritionRecipeDisplayAdapter extends RecyclerView.Adapter<NutritionRecipeDisplayAdapter.ViewHolder> {
    private final List<NutritionRecipeDisplay> recipes;
    private final OnRecipeClickListener listener;

    public interface OnRecipeClickListener {
        void onRecipeClick(NutritionRecipeDisplay recipe);
    }

    public NutritionRecipeDisplayAdapter(List<NutritionRecipeDisplay> recipes, OnRecipeClickListener listener) {
        this.recipes = recipes;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_nutrition_baby_recipe, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(recipes.get(position), listener);
    }

    @Override
    public int getItemCount() {
        return recipes.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        private final ImageView image;
        private final TextView title;
        private final View actions;
        private final View lock;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            image = itemView.findViewById(R.id.imageRecipeDisplay);
            title = itemView.findViewById(R.id.textRecipeDisplayTitle);
            actions = itemView.findViewById(R.id.actionsRecipeDisplay);
            lock = itemView.findViewById(R.id.lockRecipeDisplay);
        }

        void bind(NutritionRecipeDisplay recipe, OnRecipeClickListener listener) {
            title.setText(recipe.getTitle());
            if (recipe.getImageUrl() != null && !recipe.getImageUrl().isEmpty()) {
                String imageUrl = recipe.getImageUrl();
                if (imageUrl.startsWith("/")) {
                    imageUrl = ApiClient.getBaseUrl() + imageUrl.substring(1);
                }
                image.setVisibility(View.VISIBLE);
                Glide.with(itemView.getContext())
                        .load(imageUrl)
                        .placeholder(R.drawable.rounded_image_background)
                        .centerCrop()
                        .into(image);
            } else if (recipe.getImageResId() != 0) {
                image.setVisibility(View.VISIBLE);
                Glide.with(itemView.getContext()).clear(image);
                image.setImageResource(recipe.getImageResId());
            } else {
                Glide.with(itemView.getContext()).clear(image);
                image.setVisibility(View.INVISIBLE);
            }
            actions.setVisibility(recipe.isLocked() ? View.GONE : View.VISIBLE);
            lock.setVisibility(recipe.isLocked() ? View.VISIBLE : View.GONE);
            itemView.setEnabled(!recipe.isLocked() && recipe.getRecipeId() > 0);
            itemView.setAlpha(recipe.isLocked() ? 0.78f : 1f);
            itemView.setOnClickListener(v -> {
                if (!recipe.isLocked() && recipe.getRecipeId() > 0 && listener != null) {
                    listener.onRecipeClick(recipe);
                }
            });
        }
    }
}

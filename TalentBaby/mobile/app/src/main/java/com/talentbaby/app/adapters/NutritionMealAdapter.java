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
import com.talentbaby.app.models.NutritionMealSection;
import com.talentbaby.app.models.Recipe;
import com.talentbaby.app.utils.ApiClient;

import java.util.List;

public class NutritionMealAdapter extends RecyclerView.Adapter<NutritionMealAdapter.ViewHolder> {
    private final List<NutritionMealSection> sections;

    public NutritionMealAdapter(List<NutritionMealSection> sections) {
        this.sections = sections;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_nutrition_meal_section, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(sections.get(position));
    }

    @Override
    public int getItemCount() {
        return sections.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView textTitle;
        private final ImageView iconChevron;
        private final View contentRecipe;
        private final ImageView imageRecipe;
        private final TextView textRecipeName;
        private final TextView textRecipeServing;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textTitle = itemView.findViewById(R.id.textMealTitle);
            iconChevron = itemView.findViewById(R.id.iconMealChevron);
            contentRecipe = itemView.findViewById(R.id.contentMealRecipe);
            imageRecipe = itemView.findViewById(R.id.imageMealRecipe);
            textRecipeName = itemView.findViewById(R.id.textMealRecipeName);
            textRecipeServing = itemView.findViewById(R.id.textMealRecipeServing);
        }

        void bind(NutritionMealSection section) {
            textTitle.setText(section.getTitle());
            boolean hasRecipe = section.getRecipe() != null;
            contentRecipe.setVisibility(section.isExpanded() && hasRecipe ? View.VISIBLE : View.GONE);
            iconChevron.setRotation(section.isExpanded() ? 180f : 0f);

            if (hasRecipe) {
                bindRecipe(section.getRecipe());
            }

            itemView.setOnClickListener(v -> {
                if (!hasRecipe) return;
                section.setExpanded(!section.isExpanded());
                int position = getBindingAdapterPosition();
                if (position != RecyclerView.NO_POSITION) {
                    notifyItemChanged(position);
                }
            });
        }

        private void bindRecipe(Recipe recipe) {
            textRecipeName.setText(recipe.getTitle() != null ? recipe.getTitle() : "");
            String serving = "";
            if (recipe.getLocalImageResId() != 0 && recipe.getDescription() != null) {
                serving = recipe.getDescription();
            } else if (recipe.getServings() > 0) {
                serving = itemView.getContext().getResources()
                        .getQuantityString(R.plurals.recipe_serving_count, recipe.getServings(), recipe.getServings());
            } else if (recipe.getCategory() != null) {
                serving = recipe.getCategory();
            }
            textRecipeServing.setText(serving.isEmpty() ? "" : "(" + serving + ")");

            if (recipe.getImageUrl() != null && !recipe.getImageUrl().isEmpty()) {
                String url = recipe.getImageUrl().startsWith("/")
                        ? ApiClient.getBaseUrl() + recipe.getImageUrl().substring(1)
                        : recipe.getImageUrl();
                Glide.with(itemView).load(url).centerCrop().into(imageRecipe);
            } else if (recipe.getLocalImageResId() != 0) {
                imageRecipe.setImageResource(recipe.getLocalImageResId());
            } else {
                imageRecipe.setImageResource(R.drawable.library_nutrition);
            }
        }
    }
}

package com.talentbaby.app.adapters;

import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.talentbaby.app.R;
import com.talentbaby.app.models.NutritionBenefitSection;
import com.talentbaby.app.models.NutritionFoodItem;

import java.util.List;

public class NutritionBenefitAdapter extends RecyclerView.Adapter<NutritionBenefitAdapter.ViewHolder> {
    private final List<NutritionBenefitSection> sections;

    public NutritionBenefitAdapter(List<NutritionBenefitSection> sections) {
        this.sections = sections;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_nutrition_benefit_section, parent, false);
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
        private final TextView title;
        private final ImageView chevron;
        private final LinearLayout foodsRow;
        private final View benefitTextContent;
        private final TextView benefitBody;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.textBenefitTitle);
            chevron = itemView.findViewById(R.id.iconBenefitChevron);
            foodsRow = itemView.findViewById(R.id.rowBenefitFoods);
            benefitTextContent = itemView.findViewById(R.id.contentBenefitText);
            benefitBody = itemView.findViewById(R.id.textBenefitBody);
        }

        void bind(NutritionBenefitSection section) {
            title.setText(section.getTitle());
            chevron.setRotation(section.isExpanded() ? 180f : 0f);
            benefitTextContent.setVisibility(section.isExpanded() ? View.VISIBLE : View.GONE);
            benefitBody.setText(section.getBenefits());

            foodsRow.removeAllViews();
            for (NutritionFoodItem food : section.getFoods()) {
                foodsRow.addView(foodView(food));
            }

            itemView.setOnClickListener(v -> {
                section.setExpanded(!section.isExpanded());
                int position = getBindingAdapterPosition();
                if (position != RecyclerView.NO_POSITION) {
                    notifyItemChanged(position);
                }
            });
        }

        private View foodView(NutritionFoodItem food) {
            LinearLayout container = new LinearLayout(itemView.getContext());
            container.setOrientation(LinearLayout.VERTICAL);
            container.setGravity(Gravity.CENTER_HORIZONTAL);
            container.setPadding(0, 0, dp(18), 0);
            container.setLayoutParams(new LinearLayout.LayoutParams(dp(108), ViewGroup.LayoutParams.MATCH_PARENT));

            ImageView image = new ImageView(itemView.getContext());
            image.setScaleType(ImageView.ScaleType.CENTER_CROP);
            image.setImageResource(food.getImageResId());
            LinearLayout.LayoutParams imageParams = new LinearLayout.LayoutParams(dp(92), dp(78));
            imageParams.topMargin = dp(4);
            container.addView(image, imageParams);

            TextView name = new TextView(itemView.getContext());
            name.setText(food.getName());
            name.setGravity(Gravity.CENTER);
            name.setTextColor(itemView.getContext().getColor(R.color.home_text_muted));
            name.setTextSize(17);
            name.setLineSpacing(1f, 1f);
            LinearLayout.LayoutParams nameParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            nameParams.topMargin = dp(14);
            container.addView(name, nameParams);
            return container;
        }

        private int dp(int value) {
            return Math.round(value * itemView.getResources().getDisplayMetrics().density);
        }
    }
}

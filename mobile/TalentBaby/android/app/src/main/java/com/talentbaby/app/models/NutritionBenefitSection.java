package com.talentbaby.app.models;

import java.util.List;

public class NutritionBenefitSection {
    private final String title;
    private final List<NutritionFoodItem> foods;
    private final String benefits;
    private boolean expanded;

    public NutritionBenefitSection(String title, List<NutritionFoodItem> foods, String benefits, boolean expanded) {
        this.title = title;
        this.foods = foods;
        this.benefits = benefits;
        this.expanded = expanded;
    }

    public String getTitle() {
        return title;
    }

    public List<NutritionFoodItem> getFoods() {
        return foods;
    }

    public String getBenefits() {
        return benefits;
    }

    public boolean isExpanded() {
        return expanded;
    }

    public void setExpanded(boolean expanded) {
        this.expanded = expanded;
    }
}

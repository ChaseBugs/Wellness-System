package com.talentbaby.app.models;

public class NutritionMealSection {
    private final String title;
    private final Recipe recipe;
    private boolean expanded;

    public NutritionMealSection(String title, Recipe recipe, boolean expanded) {
        this.title = title;
        this.recipe = recipe;
        this.expanded = expanded;
    }

    public String getTitle() {
        return title;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public boolean isExpanded() {
        return expanded;
    }

    public void setExpanded(boolean expanded) {
        this.expanded = expanded;
    }
}

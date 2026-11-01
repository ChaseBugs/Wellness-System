package com.talentbaby.app.models;

public class NutritionRecipeDisplay {
    private final String recipeId;
    private final String title;
    private final int imageResId;
    private final String imageUrl;
    private final boolean locked;

    public NutritionRecipeDisplay(String title, int imageResId, boolean locked) {
        this(null, title, imageResId, null, locked);
    }

    public NutritionRecipeDisplay(String recipeId, String title, int imageResId, String imageUrl, boolean locked) {
        this.recipeId = recipeId;
        this.title = title;
        this.imageResId = imageResId;
        this.imageUrl = imageUrl;
        this.locked = locked;
    }

    public String getRecipeId() {
        return recipeId;
    }

    public String getTitle() {
        return title;
    }

    public int getImageResId() {
        return imageResId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isLocked() {
        return locked;
    }
}

package com.talentbaby.app.models;

public class NutritionRecipeDisplay {
    private final int recipeId;
    private final String title;
    private final int imageResId;
    private final String imageUrl;
    private final boolean locked;

    public NutritionRecipeDisplay(String title, int imageResId, boolean locked) {
        this(0, title, imageResId, null, locked);
    }

    public NutritionRecipeDisplay(int recipeId, String title, int imageResId, String imageUrl, boolean locked) {
        this.recipeId = recipeId;
        this.title = title;
        this.imageResId = imageResId;
        this.imageUrl = imageUrl;
        this.locked = locked;
    }

    public int getRecipeId() {
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

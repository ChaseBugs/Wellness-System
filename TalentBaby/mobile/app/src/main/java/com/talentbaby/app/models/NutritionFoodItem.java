package com.talentbaby.app.models;

public class NutritionFoodItem {
    private final String name;
    private final int imageResId;

    public NutritionFoodItem(String name, int imageResId) {
        this.name = name;
        this.imageResId = imageResId;
    }

    public String getName() {
        return name;
    }

    public int getImageResId() {
        return imageResId;
    }
}

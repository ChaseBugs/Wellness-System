package com.talentbaby.app.models;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

public class Recipe {
    @SerializedName("id")
    private int id;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("category")
    private String category;

    @SerializedName(value = "min_age_months", alternate = {"age_range_min_months"})
    private int minAgeMonths;

    @SerializedName(value = "max_age_months", alternate = {"age_range_max_months"})
    private int maxAgeMonths;

    @SerializedName("prep_time_minutes")
    private int prepTimeMinutes;

    @SerializedName(value = "cook_time_minutes", alternate = {"cooking_time_minutes"})
    private int cookTimeMinutes;

    @SerializedName("servings")
    private int servings;

    @SerializedName("ingredients")
    private JsonElement ingredients;

    @SerializedName("instructions")
    private JsonElement instructions;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("calories")
    private int calories;

    @SerializedName("nutrition_info")
    private JsonObject nutritionInfo;

    @SerializedName("recipe_type")
    private String recipeType;

    @SerializedName("meal_slot")
    private String mealSlot;

    @SerializedName("doctor_verified")
    private Boolean doctorVerified;

    private transient int localImageResId;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() {
        if (category != null && !category.isEmpty()) return category;
        if (mealSlot != null && !mealSlot.isEmpty()) return formatLabel(mealSlot);
        if (recipeType != null && !recipeType.isEmpty()) return formatLabel(recipeType);
        return null;
    }
    public void setCategory(String category) { this.category = category; }
    public int getMinAgeMonths() { return minAgeMonths; }
    public void setMinAgeMonths(int minAgeMonths) { this.minAgeMonths = minAgeMonths; }
    public int getMaxAgeMonths() { return maxAgeMonths; }
    public void setMaxAgeMonths(int maxAgeMonths) { this.maxAgeMonths = maxAgeMonths; }
    public int getPrepTimeMinutes() { return prepTimeMinutes; }
    public void setPrepTimeMinutes(int prepTimeMinutes) { this.prepTimeMinutes = prepTimeMinutes; }
    public int getCookTimeMinutes() { return cookTimeMinutes; }
    public void setCookTimeMinutes(int cookTimeMinutes) { this.cookTimeMinutes = cookTimeMinutes; }
    public int getServings() { return servings; }
    public void setServings(int servings) { this.servings = servings; }
    public String getIngredients() { return joinItems(getIngredientItems()); }
    public void setIngredients(String ingredients) { this.ingredients = primitive(ingredients); }
    public List<String> getIngredientItems() { return readStringList(ingredients); }
    public String getInstructions() { return joinItems(getInstructionItems()); }
    public void setInstructions(String instructions) { this.instructions = primitive(instructions); }
    public List<String> getInstructionItems() { return readStringList(instructions); }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }
    public JsonObject getNutritionInfo() { return nutritionInfo; }
    public void setNutritionInfo(JsonObject nutritionInfo) { this.nutritionInfo = nutritionInfo; }
    public String getRecipeType() { return recipeType; }
    public void setRecipeType(String recipeType) { this.recipeType = recipeType; }
    public String getMealSlot() { return mealSlot; }
    public void setMealSlot(String mealSlot) { this.mealSlot = mealSlot; }
    public boolean isDoctorVerified() {
        if (doctorVerified != null) return doctorVerified;
        return getBooleanFromNutritionInfo("doctor_verified");
    }
    public List<String> getNutrients() { return getStringListFromNutritionInfo("nutrients"); }
    public List<String> getSteps() { return getStringListFromNutritionInfo("steps"); }
    public List<String> getInstructionNotes() { return getStringListFromNutritionInfo("instructions"); }
    public List<IngredientDetail> getIngredientDetails() {
        if (nutritionInfo == null || !nutritionInfo.has("ingredient_details")) {
            return Collections.emptyList();
        }
        JsonElement value = nutritionInfo.get("ingredient_details");
        if (value == null || !value.isJsonArray()) return Collections.emptyList();

        List<IngredientDetail> details = new ArrayList<>();
        for (JsonElement element : value.getAsJsonArray()) {
            if (element == null || !element.isJsonObject()) continue;
            JsonObject object = element.getAsJsonObject();
            String name = object.has("name") && !object.get("name").isJsonNull()
                    ? object.get("name").getAsString()
                    : "";
            String imageUrl = object.has("image_url") && !object.get("image_url").isJsonNull()
                    ? object.get("image_url").getAsString()
                    : "";
            if (!name.trim().isEmpty() || !imageUrl.trim().isEmpty()) {
                details.add(new IngredientDetail(name.trim(), imageUrl.trim()));
            }
        }
        return details;
    }
    public List<String> getGeneralNotes() {
        List<String> notes = getStringListFromNutritionInfo("general_notes");
        if (!notes.isEmpty()) return notes;
        return getStringListFromNutritionInfo("safety_notes");
    }
    public int getLocalImageResId() { return localImageResId; }
    public void setLocalImageResId(int localImageResId) { this.localImageResId = localImageResId; }

    private List<String> getStringListFromNutritionInfo(String key) {
        if (nutritionInfo == null || !nutritionInfo.has(key)) return Collections.emptyList();
        return readStringList(nutritionInfo.get(key));
    }

    private boolean getBooleanFromNutritionInfo(String key) {
        if (nutritionInfo == null || !nutritionInfo.has(key)) return false;
        JsonElement value = nutritionInfo.get(key);
        return value != null && value.isJsonPrimitive() && value.getAsBoolean();
    }

    private static JsonElement primitive(String value) {
        return value == null ? null : new com.google.gson.JsonPrimitive(value);
    }

    private static List<String> readStringList(JsonElement value) {
        if (value == null || value.isJsonNull()) return Collections.emptyList();
        List<String> items = new ArrayList<>();
        if (value.isJsonArray()) {
            JsonArray array = value.getAsJsonArray();
            for (JsonElement element : array) {
                addValue(items, element);
            }
        } else {
            addValue(items, value);
        }
        return items;
    }

    private static void addValue(List<String> items, JsonElement element) {
        if (element == null || element.isJsonNull()) return;
        String text = element.isJsonPrimitive() ? element.getAsString() : element.toString();
        if (text != null && !text.trim().isEmpty()) {
            items.add(text.trim());
        }
    }

    private static String joinItems(List<String> items) {
        if (items == null || items.isEmpty()) return "";
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) builder.append("\n");
            builder.append(items.get(i));
        }
        return builder.toString();
    }

    private static String formatLabel(String value) {
        if (value == null) return null;
        String[] words = value.replace('_', ' ').split(" ");
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) continue;
            if (builder.length() > 0) builder.append(' ');
            builder.append(word.substring(0, 1).toUpperCase(Locale.US));
            if (word.length() > 1) {
                builder.append(word.substring(1).toLowerCase(Locale.US));
            }
        }
        return builder.toString();
    }

    public static class IngredientDetail {
        private final String name;
        private final String imageUrl;

        public IngredientDetail(String name, String imageUrl) {
            this.name = name;
            this.imageUrl = imageUrl;
        }

        public String getName() {
            return name;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }
}

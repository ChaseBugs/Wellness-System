package com.talentbaby.app.data;

import com.talentbaby.app.R;
import com.talentbaby.app.models.NutritionBenefitSection;
import com.talentbaby.app.models.NutritionFoodItem;
import com.talentbaby.app.models.NutritionMealSection;
import com.talentbaby.app.models.NutritionRecipeDisplay;
import com.talentbaby.app.models.Recipe;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class NutritionDemoData {
    public static List<NutritionMealSection> mealPlanSections() {
        List<NutritionMealSection> sections = new ArrayList<>();
        sections.add(new NutritionMealSection("Early Morning",
                recipe(201, "Warm\nwater\nwith\nlemon", "1 Cup", "Drinks",
                        R.drawable.nutrition_lemon_water), true));
        sections.add(new NutritionMealSection("Breakfast", null, false));
        sections.add(new NutritionMealSection("Mid Morning",
                recipe(202, "Greek\nyogurt\nwith\nbanana\nand chia\nseeds", "1 Bowl", "Snack",
                        R.drawable.nutrition_yogurt_banana), true));
        sections.add(new NutritionMealSection("Lunch", null, false));
        sections.add(new NutritionMealSection("Dinner", null, false));
        return sections;
    }

    public static List<NutritionMealSection> fromRecipes(List<Recipe> recipes) {
        String[] sectionTitles = {"Early Morning", "Breakfast", "Mid Morning", "Lunch", "Dinner"};
        List<NutritionMealSection> sections = new ArrayList<>();
        int count = Math.min(recipes.size(), sectionTitles.length);
        for (int i = 0; i < count; i++) {
            sections.add(new NutritionMealSection(sectionTitles[i], recipes.get(i), i == 0 || i == 2));
        }
        for (int i = count; i < sectionTitles.length; i++) {
            sections.add(new NutritionMealSection(sectionTitles[i], null, false));
        }
        return sections;
    }

    public static List<NutritionRecipeDisplay> babyRecipes(String mealType) {
        List<NutritionRecipeDisplay> items = new ArrayList<>();
        if ("Snacks".equals(mealType)) {
            items.add(new NutritionRecipeDisplay("Crackers with\nAvocado", R.drawable.nutrition_recipe_crackers, false));
        } else if ("Dinner".equals(mealType)) {
            items.add(new NutritionRecipeDisplay("Honey Ginger\nTofu Stir", 0, false));
        } else if ("Lunch".equals(mealType)) {
            items.add(new NutritionRecipeDisplay("Lentil Veggie\nBowl", R.drawable.nutrition_pulses_legumes, false));
        } else {
            items.add(new NutritionRecipeDisplay("Banana Yogurt\nBites", R.drawable.nutrition_yogurt_banana, false));
        }

        for (int i = 0; i < 5; i++) {
            items.add(new NutritionRecipeDisplay("Unlock with\nPremium", R.drawable.nutrition_premium_blur, true));
        }
        return items;
    }

    public static List<NutritionBenefitSection> nutritionBenefits() {
        List<NutritionBenefitSection> sections = new ArrayList<>();
        sections.add(new NutritionBenefitSection("Carbohydrates", Arrays.asList(
                food("Cereals &\nGrains", R.drawable.nutrition_cereals_grains),
                food("Fruits &\nVegetables", R.drawable.nutrition_fruits_vegetables),
                food("Dairy\nProducts", R.drawable.nutrition_dairy_products)
        ), "- Supply food energy for growth, body functions,\nand activity\n- Allow protein and fats in the diet to be used\nefficiently by the body", true));
        sections.add(new NutritionBenefitSection("Proteins", Arrays.asList(
                food("Pulses &\nLegumes", R.drawable.nutrition_pulses_legumes),
                food("Beans", R.drawable.nutrition_beans),
                food("Dairy\nProducts", R.drawable.nutrition_dairy_products)
        ), "- Supports tissue growth and repair\n- Helps build muscles and immune function", false));
        sections.add(new NutritionBenefitSection("Vitamin A", Arrays.asList(
                food("Spinach", R.drawable.nutrition_spinach),
                food("Pumpkin", R.drawable.nutrition_pumpkin),
                food("Papaya", R.drawable.nutrition_papaya)
        ), "- Supports vision and skin health\n- Helps immune development", false));
        sections.add(new NutritionBenefitSection("Vitamin B", Arrays.asList(
                food("Whole\nGrains", R.drawable.nutrition_whole_grains),
                food("Milk", R.drawable.nutrition_dairy_products),
                food("Cheese", R.drawable.nutrition_cheese),
                food("Leafy\nGreens", R.drawable.nutrition_green_leafy)
        ), "- Helps release energy from food\n- Supports healthy nerves", false));
        sections.add(new NutritionBenefitSection("Vitamin C", Arrays.asList(
                food("Amla", R.drawable.nutrition_fruits_vegetables),
                food("Orange", R.drawable.nutrition_orange),
                food("Sweet\nLime", R.drawable.nutrition_orange),
                food("Kiwi", R.drawable.nutrition_fruits_vegetables)
        ), "- Helps iron absorption\n- Supports gums, skin, and immunity", false));
        sections.add(new NutritionBenefitSection("Vitamin D", Arrays.asList(
                food("Vitamin D\nFortified\nFood", R.drawable.nutrition_dairy_products),
                food("Sunlight\nExposure", R.drawable.nutrition_orange),
                food("Mushroom", R.drawable.nutrition_mushroom)
        ), "- Helps calcium absorption\n- Supports bone development", false));
        sections.add(new NutritionBenefitSection("Zinc", Arrays.asList(
                food("Curd", R.drawable.nutrition_curd),
                food("Cheese", R.drawable.nutrition_cheese),
                food("Whole\nGrains", R.drawable.nutrition_whole_grains),
                food("Legume", R.drawable.nutrition_legume_mix)
        ), "- Supports growth and appetite\n- Helps immunity and healing", false));
        sections.add(new NutritionBenefitSection("Potassium", Arrays.asList(
                food("Potato", R.drawable.nutrition_potato),
                food("Green\nLeafy\nVegetables", R.drawable.nutrition_green_leafy),
                food("Tomatoes", R.drawable.nutrition_tomatoes)
        ), "- Regulates fluid balance in the body\n- Maintains healthy blood pressure", false));
        return sections;
    }

    private static NutritionFoodItem food(String name, int imageResId) {
        return new NutritionFoodItem(name, imageResId);
    }

    private static Recipe recipe(int id, String title, String serving, String category, int imageResId) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setTitle(title);
        recipe.setCategory(category);
        recipe.setDescription(serving);
        recipe.setLocalImageResId(imageResId);
        return recipe;
    }
}

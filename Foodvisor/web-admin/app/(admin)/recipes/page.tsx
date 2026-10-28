import { ResourceManager } from "@/components/ResourceManager";

export default function RecipesPage() {
  return (
    <ResourceManager
      title="Recipes"
      description="Curate meal-plan recipes shown in personalized nutrition programs."
      endpoint="/recipes"
      searchPlaceholder="Search recipes"
      columns={[
        { key: "imageUrl", label: "Image", kind: "image" },
        { key: "title", label: "Title" },
        { key: "mealType", label: "Meal" },
        { key: "cookingMethods", label: "Methods" },
        { key: "difficulty", label: "Difficulty" },
        { key: "calories", label: "Calories" },
        { key: "dataSource", label: "Source" },
        { key: "prepTimeMinutes", label: "Prep" },
        { key: "cookTimeMinutes", label: "Cook" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "mealType", label: "Meal Type", type: "select", options: ["breakfast", "lunch", "dinner", "snack"], required: true },
        { name: "calories", label: "Calories", type: "number", required: true },
        { name: "prepTimeMinutes", label: "Prep Time Minutes", type: "number" },
        { name: "cookTimeMinutes", label: "Cook Time Minutes", type: "number" },
        { name: "totalTimeMinutes", label: "Total Time Minutes", type: "number" },
        { name: "difficulty", label: "Difficulty", type: "select", options: ["easy", "medium", "hard"] },
        { name: "cuisine", label: "Cuisine", type: "text" },
        { name: "cookingMethods", label: "Cooking Methods", type: "tags" },
        { name: "equipment", label: "Equipment", type: "tags" },
        { name: "ingredients", label: "Ingredients", type: "tags" },
        { name: "ingredientRefs", label: "Ingredient Record IDs", type: "tags" },
        { name: "steps", label: "Steps", type: "tags" },
        { name: "cookingSteps", label: "Cooking Steps JSON", type: "textarea" },
        { name: "nutrition.servings", label: "Servings", type: "number" },
        { name: "nutrition.servingSize", label: "Serving Size", type: "text" },
        { name: "nutrition.caloriesPerServing", label: "Calories Per Serving", type: "number" },
        { name: "nutrition.macrosPerServing.protein", label: "Protein Per Serving", type: "number" },
        { name: "nutrition.macrosPerServing.fat", label: "Fat Per Serving", type: "number" },
        { name: "nutrition.macrosPerServing.carbs", label: "Carbs Per Serving", type: "number" },
        { name: "nutrition.macrosPerServing.fiber", label: "Fiber Per Serving", type: "number" },
        { name: "nutrition.sourceNote", label: "Nutrition Source Note", type: "textarea" },
        { name: "macros.protein", label: "Protein", type: "number" },
        { name: "macros.fat", label: "Fat", type: "number" },
        { name: "macros.carbs", label: "Carbs", type: "number" },
        { name: "macros.fiber", label: "Fiber", type: "number" },
        { name: "allergens", label: "Allergens", type: "tags" },
        { name: "dietUseCases", label: "Diet Use Cases", type: "tags" },
        { name: "cautionGroups", label: "Caution Groups", type: "tags" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "imageUrl", label: "Image URL", type: "text" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

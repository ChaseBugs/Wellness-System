import { ResourceManager } from "@/components/ResourceManager";

// Recipes now live in the Wellness Platform Content Factory (shared with Healthy Recipes).
// Editing a reviewed recipe sends it back to expert review; publishing happens in the review workflow.
export default function RecipesPage() {
  return (
    <ResourceManager
      title="Recipes"
      description="Recipes shared with Healthy Recipes. New and edited recipes need expert review before they are published."
      endpoint="/recipes"
      searchPlaceholder="Search recipes"
      columns={[
        { key: "media.imageUrl", label: "Image", kind: "image" },
        { key: "title", label: "Title" },
        { key: "category", label: "Meal" },
        { key: "difficulty", label: "Difficulty" },
        { key: "attributes.nutritionPerServing.calories", label: "kcal / serving" },
        { key: "durationMinutes", label: "Minutes" },
        { key: "reviewStatus", label: "Review status" },
        { key: "expertReviewed", label: "Expert reviewed", kind: "boolean" }
      ]}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "summary", label: "Description", type: "textarea" },
        { name: "category", label: "Meal Type", type: "select", options: ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"] },
        { name: "durationMinutes", label: "Total Time Minutes", type: "number" },
        { name: "difficulty", label: "Difficulty", type: "select", options: ["beginner", "intermediate", "advanced"] },
        { name: "attributes.servings", label: "Servings", type: "number", required: true },
        { name: "attributes.ingredients", label: "Ingredients", type: "tags", required: true },
        { name: "steps", label: "Steps", type: "tags" },
        { name: "attributes.nutritionPerServing.calories", label: "Calories Per Serving", type: "number" },
        { name: "attributes.nutritionPerServing.proteinG", label: "Protein Per Serving (g)", type: "number" },
        { name: "attributes.nutritionPerServing.carbsG", label: "Carbs Per Serving (g)", type: "number" },
        { name: "attributes.nutritionPerServing.fatG", label: "Fat Per Serving (g)", type: "number" },
        { name: "attributes.allergens", label: "Allergens", type: "tags" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "media.imageUrl", label: "Image URL", type: "text" },
        { name: "isPremium", label: "Premium", type: "boolean" }
      ]}
    />
  );
}

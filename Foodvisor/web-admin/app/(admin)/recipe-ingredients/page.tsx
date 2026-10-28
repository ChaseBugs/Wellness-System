import { ResourceManager } from "@/components/ResourceManager";

export default function RecipeIngredientsPage() {
  return (
    <ResourceManager
      title="Recipe Ingredients"
      description="Ingredients required by recipes, linked back to food dictionary records when available."
      endpoint="/recipe-ingredients"
      searchPlaceholder="Search ingredients, foods, categories"
      columns={[
        { key: "name", label: "Ingredient" },
        { key: "koreanName", label: "Korean" },
        { key: "foodName", label: "Food Record" },
        { key: "fdcId", label: "FDC ID" },
        { key: "category", label: "Category" },
        { key: "amount", label: "Amount" },
        { key: "unit", label: "Unit" },
        { key: "preparation", label: "Preparation" },
        { key: "optional", label: "Optional", kind: "boolean" },
        { key: "dataSource", label: "Source" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "name", label: "Ingredient Name", type: "text", required: true },
        { name: "koreanName", label: "Korean Name", type: "text" },
        { name: "foodName", label: "Linked Food Name", type: "text" },
        { name: "fdcId", label: "Linked FDC ID", type: "number" },
        { name: "category", label: "Category", type: "text" },
        { name: "amount", label: "Amount", type: "number" },
        { name: "unit", label: "Unit", type: "text" },
        { name: "preparation", label: "Preparation", type: "text" },
        { name: "optional", label: "Optional", type: "boolean" },
        { name: "substitutes", label: "Substitutes", type: "tags" },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

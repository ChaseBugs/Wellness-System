import { ResourceManager } from "@/components/ResourceManager";

export default function NutritionConstraintsPage() {
  return (
    <ResourceManager
      title="Nutrition Constraints"
      description="Minimum and maximum nutrient bounds used by diet optimization profiles."
      endpoint="/nutrition-constraints"
      searchPlaceholder="Search profile, nutrient, source"
      columns={[
        { key: "profileKey", label: "Profile" },
        { key: "nutrientKey", label: "Nutrient Key" },
        { key: "nutrientLabel", label: "Label" },
        { key: "unit", label: "Unit" },
        { key: "lowerBound", label: "Lower" },
        { key: "upperBound", label: "Upper" },
        { key: "isPercentOfCalories", label: "% Calories", kind: "boolean" },
        { key: "caloriesPerGram", label: "kcal/g" },
        { key: "dataSource", label: "Source" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "profileKey", label: "Profile Key", type: "text", required: true },
        { name: "nutrientKey", label: "Nutrient Key", type: "text", required: true },
        { name: "nutrientLabel", label: "Nutrient Label", type: "text", required: true },
        { name: "unit", label: "Unit", type: "text" },
        { name: "lowerBound", label: "Lower Bound", type: "number" },
        { name: "upperBound", label: "Upper Bound", type: "number" },
        { name: "isPercentOfCalories", label: "Percent of Calories", type: "boolean" },
        { name: "caloriesPerGram", label: "Calories per Gram", type: "number" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

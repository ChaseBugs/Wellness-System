import { ResourceManager } from "@/components/ResourceManager";

export default function DailyValueProfilesPage() {
  const valueFields = [
    "calories", "protein", "carbs", "fat", "saturatedFat", "fiber", "sugar", "sodium", "cholesterol",
    "calcium", "iron", "magnesium", "potassium", "zinc", "vitaminA", "vitaminB1", "vitaminB2",
    "vitaminB3", "vitaminB6", "vitaminB12", "vitaminC", "vitaminD", "vitaminE", "vitaminK", "folate"
  ];

  return (
    <ResourceManager
      title="Daily Value Profiles"
      description="Age and purpose-specific daily nutrient targets used to calculate each food's %DV."
      endpoint="/daily-value-profiles"
      searchPlaceholder="Search profile key, label, purpose"
      columns={[
        { key: "profileKey", label: "Key" },
        { key: "label", label: "Label" },
        { key: "ageMin", label: "Age Min" },
        { key: "ageMax", label: "Age Max" },
        { key: "gender", label: "Gender" },
        { key: "purpose", label: "Purpose" },
        { key: "dataSource", label: "Source" },
        { key: "values.calories", label: "Calories" },
        { key: "values.protein", label: "Protein" },
        { key: "values.carbs", label: "Carbs" },
        { key: "values.sodium", label: "Sodium" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "profileKey", label: "Profile Key", type: "text", required: true },
        { name: "label", label: "Label", type: "text", required: true },
        { name: "ageMin", label: "Age Min", type: "number", required: true },
        { name: "ageMax", label: "Age Max", type: "number", required: true },
        { name: "gender", label: "Gender", type: "select", options: ["all", "male", "female"] },
        { name: "purpose", label: "Purpose", type: "text", required: true },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        ...valueFields.map((key) => ({
          name: `values.${key}`,
          label: `Daily Value ${key}`,
          type: "number" as const
        })),
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

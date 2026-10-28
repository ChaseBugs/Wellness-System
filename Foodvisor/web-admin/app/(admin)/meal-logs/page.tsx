import { ResourceManager } from "@/components/ResourceManager";

export default function MealLogsPage() {
  return (
    <ResourceManager
      title="Meal Logs"
      description="Review food diary entries from search, photo, barcode, voice, and favorites."
      endpoint="/meal-logs"
      searchPlaceholder="Search meal logs"
      columns={[
        { key: "date", label: "Date", kind: "date" },
        { key: "userName", label: "User" },
        { key: "mealType", label: "Meal" },
        { key: "foodName", label: "Food" },
        { key: "calories", label: "Calories" },
        { key: "source", label: "Source" },
        { key: "dataSource", label: "Data Source" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "userName", label: "User Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "mealType", label: "Meal Type", type: "select", options: ["breakfast", "lunch", "dinner", "snack"], required: true },
        { name: "foodName", label: "Food Name", type: "text", required: true },
        { name: "calories", label: "Calories", type: "number", required: true },
        { name: "macros.protein", label: "Protein", type: "number" },
        { name: "macros.fat", label: "Fat", type: "number" },
        { name: "macros.carbs", label: "Carbs", type: "number" },
        { name: "macros.fiber", label: "Fiber", type: "number" },
        { name: "source", label: "Source", type: "select", options: ["photo", "barcode", "search", "voice", "favorite"] },
        { name: "photoUrl", label: "Photo URL", type: "text" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

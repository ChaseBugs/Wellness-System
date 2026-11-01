import { ResourceManager } from "@/components/ResourceManager";

export default function MealLogsPage() {
  return (
    <ResourceManager
      title="Meal Logs"
      description="Read-only view of user food diaries (logged in the Foodvisor app). Entries can be inspected and deleted, not authored."
      endpoint="/meal-logs"
      searchPlaceholder="Search meal logs"
      columns={[
        { key: "date", label: "Date", kind: "date" },
        { key: "userName", label: "User" },
        { key: "mealType", label: "Meal" },
        { key: "foodName", label: "Food" },
        { key: "calories", label: "Calories" },
        { key: "proteinG", label: "Protein (g)" },
        { key: "userEmail", label: "Account" },
        { key: "source", label: "Source" }
      ]}
      fields={[
        { name: "userName", label: "User Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "mealType", label: "Meal Type", type: "select", options: ["breakfast", "lunch", "dinner", "snack"], required: true },
        { name: "foodName", label: "Food Name", type: "text", required: true },
        { name: "calories", label: "Calories", type: "number", required: true },
        { name: "proteinG", label: "Protein", type: "number" },
        { name: "fatG", label: "Fat", type: "number" },
        { name: "carbsG", label: "Carbs", type: "number" },
        { name: "source", label: "Source", type: "select", options: ["photo", "barcode", "search", "voice", "favorite"] },
        { name: "photoUrl", label: "Photo URL", type: "text" }
      ]}
    />
  );
}

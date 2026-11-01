import { ResourceManager } from "@/components/ResourceManager";

export default function UsersPage() {
  return (
    <ResourceManager
      title="Users"
      description="Foodvisor profiles of Wellness accounts. Accounts are created at sign-up; name and email are managed by the account."
      endpoint="/users"
      searchPlaceholder="Search users"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "goal", label: "Goal" },
        { key: "currentWeightKg", label: "Weight" },
        { key: "targetWeightKg", label: "Target" },
        { key: "calorieGoal", label: "Calories" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "text", required: true },
        { name: "goal", label: "Goal", type: "text" },
        { name: "gender", label: "Gender", type: "select", options: ["male", "female", "non_binary"] },
        { name: "age", label: "Age", type: "number" },
        { name: "heightCm", label: "Height Cm", type: "number" },
        { name: "currentWeightKg", label: "Current Weight Kg", type: "number" },
        { name: "activityLevel", label: "Activity Level", type: "select", options: ["sedentary", "low_active", "active", "very_active"] },
        { name: "targetWeightKg", label: "Target Weight Kg", type: "number" },
        { name: "dietaryRestrictions", label: "Dietary Restrictions", type: "tags" },
        { name: "medicalConditions", label: "Medical Conditions", type: "tags" },
        { name: "programStage", label: "Program Stage", type: "text" }
      ]}
    />
  );
}

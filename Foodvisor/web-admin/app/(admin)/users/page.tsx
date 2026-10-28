import { ResourceManager } from "@/components/ResourceManager";

export default function UsersPage() {
  return (
    <ResourceManager
      title="Users"
      description="Inspect app users, goals, health inputs, and generated calorie targets."
      endpoint="/users"
      searchPlaceholder="Search users"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "goal", label: "Goal" },
        { key: "currentWeightKg", label: "Weight" },
        { key: "targetWeightKg", label: "Target" },
        { key: "calorieGoal", label: "Calories" },
        { key: "dataSource", label: "Source" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "text", required: true },
        { name: "goal", label: "Goal", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", options: ["male", "female", "non_binary"], required: true },
        { name: "age", label: "Age", type: "number" },
        { name: "heightCm", label: "Height Cm", type: "number" },
        { name: "currentWeightKg", label: "Current Weight Kg", type: "number" },
        { name: "targetWeightKg", label: "Target Weight Kg", type: "number" },
        { name: "calorieGoal", label: "Calorie Goal", type: "number" },
        { name: "dietaryRestrictions", label: "Dietary Restrictions", type: "tags" },
        { name: "medicalConditions", label: "Medical Conditions", type: "tags" },
        { name: "programStage", label: "Program Stage", type: "text" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

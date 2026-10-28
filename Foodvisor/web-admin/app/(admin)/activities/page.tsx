import { ResourceManager } from "@/components/ResourceManager";

export default function ActivitiesPage() {
  return (
    <ResourceManager
      title="Activities"
      description="Manage workout and activity options used by the activity search screens."
      endpoint="/activities"
      searchPlaceholder="Search activities"
      columns={[
        { key: "icon", label: "Icon" },
        { key: "name", label: "Name" },
        { key: "category", label: "Category" },
        { key: "caloriesPerHour", label: "Cal/hour" },
        { key: "metValue", label: "MET" },
        { key: "dataSource", label: "Source" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "category", label: "Category", type: "text", required: true },
        { name: "caloriesPerHour", label: "Calories Per Hour", type: "number", required: true },
        { name: "metValue", label: "MET Value", type: "number", required: true },
        { name: "icon", label: "Icon", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceCode", label: "Source Code", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

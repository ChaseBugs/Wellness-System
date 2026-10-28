import { ResourceManager } from "@/components/ResourceManager";
import { resourceConfigs } from "@/lib/resourceConfigs";

const cfg = resourceConfigs["reference-sources"];

export default function ReferenceSourcesPage() {
  return (
    <ResourceManager
      title="Reference Sources"
      description="Official guideline and standard source files linked from imported nutrition rules."
      endpoint="/reference-sources"
      searchPlaceholder="Search references, standards, topics"
      filters={cfg.filters}
      bulkActions={cfg.bulkActions}
      sortable={cfg.sortable}
      columns={[
        { key: "sourceKey", label: "Key" },
        { key: "title", label: "Title" },
        { key: "standardCode", label: "Code" },
        { key: "year", label: "Year" },
        { key: "category", label: "Category" },
        { key: "topic", label: "Topic" },
        { key: "dataSource", label: "Source" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "sourceKey", label: "Source Key", type: "text", required: true },
        { name: "title", label: "Title", type: "textarea", required: true },
        { name: "standardCode", label: "Standard Code", type: "text" },
        { name: "year", label: "Year", type: "number" },
        { name: "category", label: "Category", type: "text", required: true },
        { name: "topic", label: "Topic", type: "text", required: true },
        { name: "conditionKey", label: "Condition Key", type: "text" },
        { name: "filePath", label: "File Path", type: "textarea", required: true },
        { name: "language", label: "Language", type: "text" },
        { name: "dataSource", label: "Data Source", type: "text", required: true },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "tags", label: "Tags", type: "tags" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

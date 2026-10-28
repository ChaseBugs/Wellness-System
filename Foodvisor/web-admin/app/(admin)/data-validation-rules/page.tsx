import { ResourceManager } from "@/components/ResourceManager";
import { resourceConfigs } from "@/lib/resourceConfigs";

const cfg = resourceConfigs["data-validation-rules"];

export default function DataValidationRulesPage() {
  return (
    <ResourceManager
      title="Data Validation Rules"
      description="Food composition field, unit, requiredness, and source-trace validation rules."
      endpoint="/data-validation-rules"
      searchPlaceholder="Search collection, field, rule, message"
      filters={cfg.filters}
      bulkActions={cfg.bulkActions}
      sortable={cfg.sortable}
      columns={[
        { key: "targetCollection", label: "Collection" },
        { key: "fieldPath", label: "Field" },
        { key: "ruleType", label: "Rule" },
        { key: "expectedUnit", label: "Unit" },
        { key: "required", label: "Required", kind: "boolean" },
        { key: "messageKo", label: "Message" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "ruleKey", label: "Rule Key", type: "text", required: true },
        { name: "targetCollection", label: "Target Collection", type: "text", required: true },
        { name: "fieldPath", label: "Field Path", type: "text", required: true },
        { name: "ruleType", label: "Rule Type", type: "text", required: true },
        { name: "expectedUnit", label: "Expected Unit", type: "text" },
        { name: "required", label: "Required", type: "boolean" },
        { name: "minValue", label: "Min Value", type: "number" },
        { name: "maxValue", label: "Max Value", type: "number" },
        { name: "messageKo", label: "Message KO", type: "textarea", required: true },
        { name: "dataSource", label: "Data Source", type: "text", required: true },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

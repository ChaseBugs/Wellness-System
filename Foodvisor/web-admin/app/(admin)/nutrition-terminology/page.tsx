import { ResourceManager } from "@/components/ResourceManager";
import { resourceConfigs } from "@/lib/resourceConfigs";

const cfg = resourceConfigs["nutrition-terminology"];

export default function NutritionTerminologyPage() {
  return (
    <ResourceManager
      title="Nutrition Terminology"
      description="Standard nutrition terms and abbreviations used by the guideline imports."
      endpoint="/nutrition-terminology"
      searchPlaceholder="Search terms, abbreviations, languages"
      filters={cfg.filters}
      bulkActions={cfg.bulkActions}
      sortable={cfg.sortable}
      columns={[
        { key: "termKey", label: "Key" },
        { key: "chineseTerm", label: "Chinese" },
        { key: "englishTerm", label: "English" },
        { key: "koreanTerm", label: "Korean" },
        { key: "abbreviation", label: "Abbrev" },
        { key: "category", label: "Category" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "termKey", label: "Term Key", type: "text", required: true },
        { name: "category", label: "Category", type: "text", required: true },
        { name: "chineseTerm", label: "Chinese Term", type: "text", required: true },
        { name: "englishTerm", label: "English Term", type: "text" },
        { name: "koreanTerm", label: "Korean Term", type: "text" },
        { name: "abbreviation", label: "Abbreviation", type: "text" },
        { name: "unit", label: "Unit", type: "text" },
        { name: "definitionKo", label: "Definition KO", type: "textarea", required: true },
        { name: "aliases", label: "Aliases", type: "tags" },
        { name: "dataSource", label: "Data Source", type: "text", required: true },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

export type FilterChip = { type: "chip"; key: string; label: string; value: string };
export type FilterSelect = { type: "select"; key: string; label: string; options: { value: string; label: string }[] };
export type FilterRange = { type: "range"; key: string; label: string };
export type FilterDef = FilterChip | FilterSelect | FilterRange;

export type BulkAction = "verify" | "unverify" | "delete";

export type ResourceConfig = {
  endpoint: string;
  filters: FilterDef[];
  bulkActions: BulkAction[];
  sortable: { value: string; label: string }[];
  recentLabelField: string;
};

const conditionOptions = [
  "hypertension","hyperlipidemia","diabetes","adult_obesity","child_obesity","gout_hyperuricemia",
  "ckd","stroke","cancer","elderly","gestational_diabetes","infant_complementary_feeding"
].map((v) => ({ value: v, label: v }));

const referenceTypeOptions = ["RNI","EAR","AI","UL","AMDR","EER","PI","SPL"].map((v) => ({ value: v, label: v }));
const genderOptions = [{ value: "all", label: "all" }, { value: "male", label: "male" }, { value: "female", label: "female" }];

export const resourceConfigs: Record<string, ResourceConfig> = {
  foods: {
    endpoint: "/foods",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "foodGroup", label: "Food group", options: [
        { value: "grain", label: "Grain" }, { value: "vegetable", label: "Vegetable" },
        { value: "fruit", label: "Fruit" }, { value: "meat", label: "Meat" },
        { value: "dairy", label: "Dairy" }, { value: "fat", label: "Fat" }, { value: "beverage", label: "Beverage" }
      ] }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "-createdAt", label: "Oldest" },
      { value: "koreanName", label: "Name (A→Z)" }, { value: "-koreanName", label: "Name (Z→A)" },
      { value: "category", label: "Category" }
    ],
    recentLabelField: "koreanName"
  },
  "reference-sources": {
    endpoint: "/reference-sources",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "category", label: "Category", options: [
        { value: "nutrient_intake", label: "Nutrient intake" },
        { value: "condition_diet", label: "Condition diet" },
        { value: "clinical_diet_guidance", label: "Clinical guidance" },
        { value: "assessment", label: "Assessment" },
        { value: "terminology", label: "Terminology" },
        { value: "data_validation", label: "Data validation" }
      ] },
      { type: "range", key: "year", label: "Year" }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "title", label: "Title (A→Z)" },
      { value: "year", label: "Year (asc)" }, { value: "-year", label: "Year (desc)" }, { value: "standardCode", label: "Code" }
    ],
    recentLabelField: "title"
  },
  "nutrient-intake-rules": {
    endpoint: "/nutrient-intake-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "referenceType", label: "Reference", options: referenceTypeOptions },
      { type: "select", key: "gender", label: "Gender", options: genderOptions },
      { type: "range", key: "ageMin", label: "Age min" }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "nutrientKey", label: "Nutrient" },
      { value: "ageMin", label: "Age (asc)" }, { value: "value", label: "Value (asc)" }
    ],
    recentLabelField: "ruleKey"
  },
  "condition-diet-rules": {
    endpoint: "/condition-diet-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "conditionKey", label: "Condition", options: conditionOptions },
      { type: "select", key: "comparator", label: "Comparator", options: ["eq","lt","lte","gt","gte","range","avoid","prefer"].map((v) => ({ value: v, label: v })) }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "conditionKey", label: "Condition" },
      { value: "priority", label: "Priority" }, { value: "ruleType", label: "Rule type" }
    ],
    recentLabelField: "ruleKey"
  },
  "risk-assessment-rules": {
    endpoint: "/risk-assessment-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "populationGroup", label: "Population", options: [
        { value: "adult", label: "Adult" }, { value: "child_adolescent", label: "Child/adolescent" }, { value: "pregnant", label: "Pregnant" }
      ] },
      { type: "select", key: "gender", label: "Gender", options: genderOptions }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "standardCode", label: "Code" }, { value: "metricKey", label: "Metric" }
    ],
    recentLabelField: "metricLabel"
  },
  "nutrition-terminology": {
    endpoint: "/nutrition-terminology",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "category", label: "Category", options: [
        { value: "nutrition_reference", label: "Reference value" }
      ] }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "termKey", label: "Term key" }, { value: "chineseTerm", label: "Chinese" }
    ],
    recentLabelField: "chineseTerm"
  },
  "data-validation-rules": {
    endpoint: "/data-validation-rules",
    filters: [
      { type: "chip", key: "doctor_verified", label: "Unverified only", value: "false" },
      { type: "select", key: "targetCollection", label: "Target", options: [{ value: "foods", label: "foods" }] },
      { type: "select", key: "ruleType", label: "Rule type", options: [
        { value: "serving_basis", label: "serving_basis" }, { value: "non_negative_number", label: "non_negative_number" },
        { value: "source_required", label: "source_required" }, { value: "source_trace", label: "source_trace" }
      ] }
    ],
    bulkActions: ["verify", "unverify", "delete"],
    sortable: [
      { value: "createdAt", label: "Newest" }, { value: "fieldPath", label: "Field path" }
    ],
    recentLabelField: "fieldPath"
  }
};

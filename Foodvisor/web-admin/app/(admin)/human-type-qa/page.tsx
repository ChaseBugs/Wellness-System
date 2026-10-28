import { ResourceManager } from "@/components/ResourceManager";

export default function HumanTypeQAPage() {
  return (
    <ResourceManager
      title="Human Type QA"
      description="Manage curated Sasang-style constitution questions, answer options, scoring rules, and recommendation tags."
      endpoint="/human-type-qa"
      searchPlaceholder="Search questions, categories, notes"
      columns={[
        { key: "order", label: "Order" },
        { key: "questionId", label: "Question ID" },
        { key: "categoryNameKo", label: "Category" },
        { key: "promptKo", label: "Question" },
        { key: "answerListKo", label: "Answers" },
        { key: "weight", label: "Weight" },
        { key: "dataSource", label: "Source" },
        { key: "isCore", label: "Core", kind: "boolean" },
        { key: "useForRecommendation", label: "Recommend", kind: "boolean" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "questionId", label: "Question ID", type: "text", required: true },
        { name: "order", label: "Order", type: "number", required: true },
        { name: "categoryKey", label: "Category Key", type: "select", options: ["body_shape", "appearance_speech", "personality_talent", "symptoms_habits"], required: true },
        { name: "categoryNameKo", label: "Category Name KO", type: "text", required: true },
        { name: "categoryNameEn", label: "Category Name EN", type: "text" },
        { name: "promptKo", label: "Question KO", type: "textarea", required: true },
        { name: "inputType", label: "Input Type", type: "select", options: ["single", "scale", "multi", "text"], required: true },
        { name: "scaleMin", label: "Scale Min", type: "number" },
        { name: "scaleMax", label: "Scale Max", type: "number" },
        { name: "scaleMinLabelKo", label: "Scale Min Label", type: "text" },
        { name: "scaleMaxLabelKo", label: "Scale Max Label", type: "text" },
        { name: "answerListKo", label: "Answer List KO", type: "textarea" },
        { name: "answers", label: "Answers JSON", type: "textarea" },
        { name: "options", label: "Options JSON", type: "textarea" },
        { name: "weight", label: "Weight", type: "number" },
        { name: "isCore", label: "Core Question", type: "boolean" },
        { name: "useForClassification", label: "Use For Classification", type: "boolean" },
        { name: "useForRecommendation", label: "Use For Recommendation", type: "boolean" },
        { name: "scoringNoteKo", label: "Scoring Note KO", type: "textarea" },
        { name: "analysisNoteKo", label: "Analysis Note KO", type: "textarea" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "sourceRefs", label: "Source Refs", type: "tags" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

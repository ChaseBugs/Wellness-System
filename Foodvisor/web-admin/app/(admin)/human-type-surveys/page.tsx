import { ResourceManager } from "@/components/ResourceManager";

export default function HumanTypeSurveysPage() {
  return (
    <ResourceManager
      title="Human Type Surveys"
      description="Review user answers, calculated constitution scores, confidence, and admin notes."
      endpoint="/human-type-surveys"
      searchPlaceholder="Search users, results, notes"
      columns={[
        { key: "createdAt", label: "Date", kind: "date" },
        { key: "userName", label: "User" },
        { key: "status", label: "Status" },
        { key: "resultType", label: "Result" },
        { key: "resultLabelKo", label: "Label" },
        { key: "confidence", label: "Confidence" },
        { key: "dataSource", label: "Source" },
        { key: "recommendationTags", label: "Recommend Tags" },
        { key: "cautionTags", label: "Caution Tags" },
        { key: "doctor_verified", label: "Doctor Verified", kind: "boolean" }
      ]}
      fields={[
        { name: "userName", label: "User Name", type: "text" },
        { name: "status", label: "Status", type: "select", options: ["draft", "completed", "reviewed", "archived"] },
        { name: "classifierVersion", label: "Classifier Version", type: "text" },
        { name: "answers", label: "Answers JSON", type: "textarea" },
        { name: "scores.TE", label: "TE Score", type: "number" },
        { name: "scores.SE", label: "SE Score", type: "number" },
        { name: "scores.SY", label: "SY Score", type: "number" },
        { name: "scores.TY", label: "TY Score", type: "number" },
        { name: "resultType", label: "Result Type", type: "select", options: ["TE", "SE", "SY", "TY", "MIXED", "REVIEW"] },
        { name: "resultLabelKo", label: "Result Label KO", type: "text" },
        { name: "secondType", label: "Second Type", type: "text" },
        { name: "confidence", label: "Confidence", type: "number" },
        { name: "totalPossible", label: "Total Possible", type: "number" },
        { name: "recommendationTags", label: "Recommendation Tags", type: "tags" },
        { name: "cautionTags", label: "Caution Tags", type: "tags" },
        { name: "summaryKo", label: "Summary KO", type: "textarea" },
        { name: "notes", label: "Admin Notes", type: "textarea" },
        { name: "dataSource", label: "Data Source", type: "text" },
        { name: "sourceNote", label: "Source Note", type: "textarea" },
        { name: "doctor_verified", label: "Doctor Verified", type: "boolean" }
      ]}
    />
  );
}

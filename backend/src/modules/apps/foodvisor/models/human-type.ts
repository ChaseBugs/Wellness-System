import type { Classification, HumanTypeAnswerInput, QuestionOption } from "../calculators/human-type-classifier.js";

export interface HumanTypeQuestion {
  id: string;
  questionId: string;
  order: number;
  categoryKey: string;
  categoryNameKo: string;
  categoryNameEn: string | null;
  promptKo: string;
  inputType: "single" | "scale" | "multi" | "text";
  scaleMin: number;
  scaleMax: number;
  scaleMinLabelKo: string | null;
  scaleMaxLabelKo: string | null;
  options: QuestionOption[];
  answers: QuestionOption[];
  weight: number;
  isCore: boolean;
  useForClassification: boolean;
  useForRecommendation: boolean;
}

/** App-facing question: option scores stay server-side so answers can't be gamed. */
export interface HumanTypeQuestionResponse {
  questionId: string;
  order: number;
  categoryKey: string;
  categoryNameKo: string;
  categoryNameEn: string | null;
  promptKo: string;
  inputType: HumanTypeQuestion["inputType"];
  scaleMin: number;
  scaleMax: number;
  scaleMinLabelKo: string | null;
  scaleMaxLabelKo: string | null;
  options: Array<{ value: string; labelKo: string }>;
}

export interface HumanTypeSurvey extends Classification {
  id: string;
  userId: string | null;
  status: "draft" | "completed" | "reviewed" | "archived";
  notes: string | null;
  doctorVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassifySurveyInput {
  answers: HumanTypeAnswerInput[];
  notes?: string;
}

export type HumanTypeSurveyResponse = Omit<HumanTypeSurvey, "userId" | "updatedAt">;

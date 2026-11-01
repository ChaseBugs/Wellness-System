import type { Classification } from "../calculators/human-type-classifier.js";
import type { HumanTypeQuestion, HumanTypeSurvey } from "../models/human-type.js";

export interface IHumanTypeRepository {
  listQuestions(): Promise<HumanTypeQuestion[]>;
  findQuestions(questionIds: string[]): Promise<HumanTypeQuestion[]>;
  createSurvey(userId: string, result: Classification, notes: string | null): Promise<HumanTypeSurvey>;
  listSurveysForUser(userId: string): Promise<HumanTypeSurvey[]>;
  findSurvey(id: string): Promise<HumanTypeSurvey | null>;
  /** Replaces the scoring result after the questionnaire changed (admin reclassify). */
  applyClassification(id: string, result: Classification, status: HumanTypeSurvey["status"]): Promise<HumanTypeSurvey>;
}

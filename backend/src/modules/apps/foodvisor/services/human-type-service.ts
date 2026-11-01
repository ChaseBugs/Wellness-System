import { NotFoundError, ValidationError } from "../../../../utils/errors.js";
import { classifyAnswers, type ScoringQuestion } from "../calculators/human-type-classifier.js";
import type { IHumanTypeRepository } from "../domain/IHumanTypeRepository.js";
import type {
  ClassifySurveyInput,
  HumanTypeQuestion,
  HumanTypeQuestionResponse,
  HumanTypeSurvey,
  HumanTypeSurveyResponse
} from "../models/human-type.js";

function toScoring(question: HumanTypeQuestion): ScoringQuestion {
  return {
    questionId: question.questionId,
    weight: Number(question.weight),
    isCore: question.isCore,
    useForClassification: question.useForClassification,
    useForRecommendation: question.useForRecommendation,
    answers: question.answers,
    options: question.options
  };
}

/** Sasang constitution tendency questionnaire (wellness tendency, not a medical diagnosis). */
export class HumanTypeService {
  constructor(private humanTypeRepository: IHumanTypeRepository) {}

  async questions(): Promise<HumanTypeQuestionResponse[]> {
    const questions = await this.humanTypeRepository.listQuestions();
    return questions.map((question) => ({
      questionId: question.questionId,
      order: question.order,
      categoryKey: question.categoryKey,
      categoryNameKo: question.categoryNameKo,
      categoryNameEn: question.categoryNameEn,
      promptKo: question.promptKo,
      inputType: question.inputType,
      scaleMin: question.scaleMin,
      scaleMax: question.scaleMax,
      scaleMinLabelKo: question.scaleMinLabelKo,
      scaleMaxLabelKo: question.scaleMaxLabelKo,
      options: (question.answers.length ? question.answers : question.options).map((option) => ({
        value: String(option.value ?? ""),
        labelKo: String(option.labelKo ?? option.value ?? "")
      }))
    }));
  }

  async classify(userId: string, input: ClassifySurveyInput): Promise<HumanTypeSurveyResponse> {
    const questions = await this.humanTypeRepository.findQuestions([...new Set(input.answers.map((answer) => answer.questionId))]);
    if (questions.length === 0) throw new ValidationError("None of the answers match a known question");
    const result = classifyAnswers(input.answers, questions.map(toScoring));
    return this.toResponse(await this.humanTypeRepository.createSurvey(userId, result, input.notes ?? null));
  }

  async mySurveys(userId: string): Promise<HumanTypeSurveyResponse[]> {
    return (await this.humanTypeRepository.listSurveysForUser(userId)).map((survey) => this.toResponse(survey));
  }

  /** Re-scores stored answers with the current questionnaire (after question or weight edits). */
  async reclassify(surveyId: string): Promise<HumanTypeSurveyResponse> {
    const survey = await this.humanTypeRepository.findSurvey(surveyId);
    if (!survey) throw new NotFoundError("Survey");
    const answers = survey.answers.map((answer) => ({ questionId: answer.questionId, value: answer.value }));
    const questions = await this.humanTypeRepository.findQuestions(answers.map((answer) => answer.questionId));
    const result = classifyAnswers(answers, questions.map(toScoring));
    const status = survey.status === "draft" ? "completed" : survey.status;
    return this.toResponse(await this.humanTypeRepository.applyClassification(surveyId, result, status));
  }

  private toResponse(survey: HumanTypeSurvey): HumanTypeSurveyResponse {
    const { userId: _userId, updatedAt: _updatedAt, ...response } = survey;
    return { ...response, confidence: Number(survey.confidence), totalPossible: Number(survey.totalPossible) };
  }
}

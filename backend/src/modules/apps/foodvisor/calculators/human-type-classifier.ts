/**
 * Sasang constitution tendency scoring, moved from the legacy Foodvisor backend
 * (services/humanTypeClassifier.ts). Pure: the service loads the questions. The result is a wellness
 * tendency for food suggestions, not a medical diagnosis.
 */
export type HumanType = "TE" | "SE" | "SY" | "TY";
export type HumanTypeResult = HumanType | "MIXED" | "REVIEW";
export type TypeScores = Record<HumanType, number>;

export type HumanTypeAnswerInput = { questionId: string; value: unknown; labelKo?: string };

export type QuestionOption = {
  value?: string;
  labelKo?: string;
  score?: Partial<TypeScores>;
  recommendationTags?: string[];
  cautionTags?: string[];
};

export type ScoringQuestion = {
  questionId: string;
  weight?: number;
  isCore?: boolean;
  useForClassification?: boolean;
  useForRecommendation?: boolean;
  answers?: QuestionOption[];
  options?: QuestionOption[];
};

export type Classification = {
  classifierVersion: string;
  answers: Array<{ questionId: string; value: unknown; labelKo: string; scoreSnapshot: TypeScores }>;
  scores: TypeScores;
  resultType: HumanTypeResult;
  resultLabelKo: string;
  secondType: HumanType;
  confidence: number;
  totalPossible: number;
  recommendationTags: string[];
  cautionTags: string[];
  summaryKo: string;
};

export const CLASSIFIER_VERSION = "sasang-v1-curated";

// Labels and summaries are kept exactly as the legacy backend returned them.
const typeLabels: Record<HumanType, string> = {
  TE: "luni tendency",
  SE: "noise tendency",
  SY: "Literacy tendency",
  TY: "solar trend"
};

const summaries: Record<HumanTypeResult, string> = {
  TE: "The tendency is to have a strong physique and stored energy.. weight, abdominal circumference, sodium, Focus on managing saturated fat.",
  SE: "Digestion and body temperature maintenance are weak and noise prone.. Warm, easy-to-digest food, I tend to eat well on a regular basis..",
  SY: "It is a tendency to have a strong sense of activity and heat.. overheating, sleep, spicy food, It is better to control your sugar load..",
  TY: "It is a solar tendency with strong upper body energy and initiative.. neck/chest tightness, hypertension, I think we should be careful about excessively stimulating foods..",
  MIXED: "There is a tendency to mix two or more constitutions with similar constitution scores.. Your response needs supplementation or expert review.",
  REVIEW: "There is a solar trend or unusual pattern but lacks core evidence. We keep the results as they require expert confirmation.."
};

const emptyScore = (): TypeScores => ({ TE: 0, SE: 0, SY: 0, TY: 0 });

function addScore(target: TypeScores, source: Partial<TypeScores> | undefined, weight: number): void {
  target.TE += (source?.TE || 0) * weight;
  target.SE += (source?.SE || 0) * weight;
  target.SY += (source?.SY || 0) * weight;
  target.TY += (source?.TY || 0) * weight;
}

function roundScore(score: TypeScores): TypeScores {
  return {
    TE: Number(score.TE.toFixed(2)),
    SE: Number(score.SE.toFixed(2)),
    SY: Number(score.SY.toFixed(2)),
    TY: Number(score.TY.toFixed(2))
  };
}

function valuesFromAnswer(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value && typeof value === "object" && "value" in value) return [String((value as { value: unknown }).value)];
  return [String(value ?? "")].filter(Boolean);
}

const optionPool = (question: ScoringQuestion): QuestionOption[] =>
  question.answers?.length ? question.answers : question.options || [];

function optionMaxScore(question: ScoringQuestion): number {
  const max = optionPool(question).reduce((best, option) => {
    const score = option.score || {};
    return Math.max(best, score.TE || 0, score.SE || 0, score.SY || 0, score.TY || 0);
  }, 0);
  return max * (question.weight ?? 1);
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

export function classifyAnswers(rawAnswers: HumanTypeAnswerInput[], questions: ScoringQuestion[]): Classification {
  const byId = new Map(questions.map((question) => [question.questionId, question]));
  const scores = emptyScore();
  const answers: Classification["answers"] = [];
  const recommendationTags: string[] = [];
  const cautionTags: string[] = [];
  let totalPossible = 0;
  let tyEvidenceCount = 0;

  for (const answer of rawAnswers) {
    const question = byId.get(answer.questionId);
    if (!question) continue;

    const weight = question.useForClassification === false ? 0 : question.weight ?? 1;
    if (question.useForClassification !== false) totalPossible += optionMaxScore(question);

    const answerScore = emptyScore();
    const selectedLabels: string[] = [];
    for (const selectedValue of valuesFromAnswer(answer.value)) {
      const matched = optionPool(question).find((option) => String(option.value) === selectedValue);
      if (!matched) continue;
      selectedLabels.push(matched.labelKo || selectedValue);
      addScore(answerScore, matched.score, weight);
      if (question.useForRecommendation) {
        recommendationTags.push(...(matched.recommendationTags || []));
        cautionTags.push(...(matched.cautionTags || []));
      }
      // Taeyang (TY) is rare, so it needs core or strong evidence before it can be the result.
      if ((question.isCore || (matched.score?.TY || 0) >= 2) && (matched.score?.TY || 0) > 0) tyEvidenceCount += 1;
    }

    addScore(scores, answerScore, 1);
    answers.push({
      questionId: answer.questionId,
      value: answer.value,
      labelKo: answer.labelKo || selectedLabels.join(", "),
      scoreSnapshot: roundScore(answerScore)
    });
  }

  const rounded = roundScore(scores);
  const ranked = (Object.entries(rounded) as Array<[HumanType, number]>).sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = ranked[0];
  const [secondType, secondScore] = ranked[1];
  const confidence = totalPossible > 0 ? Number(Math.max(0, Math.min(1, (topScore - secondScore) / totalPossible)).toFixed(4)) : 0;

  let resultType: HumanTypeResult = topType;
  if (confidence < 0.08) resultType = "MIXED";
  if (topType === "TY" && tyEvidenceCount < 2) resultType = "REVIEW";

  return {
    classifierVersion: CLASSIFIER_VERSION,
    answers,
    scores: rounded,
    resultType,
    resultLabelKo: resultType in typeLabels ? typeLabels[resultType as HumanType] : resultType === "MIXED" ? "mixed tendency" : "Needs review",
    secondType,
    confidence,
    totalPossible: Number(totalPossible.toFixed(2)),
    recommendationTags: unique(recommendationTags),
    cautionTags: unique(cautionTags),
    summaryKo: summaries[resultType]
  };
}

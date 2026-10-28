import { HumanTypeQA } from "../models/human-type-qa.js";

type HumanType = "TE" | "SE" | "SY" | "TY";
type ResultType = HumanType | "MIXED" | "REVIEW";

type Score = Record<HumanType, number>;

export type HumanTypeAnswerInput = {
  questionId: string;
  value: unknown;
  labelKo?: string;
};

type QAOption = {
  value?: string;
  labelKo?: string;
  score?: Partial<Score>;
  recommendationTags?: string[];
  cautionTags?: string[];
};

type QADoc = {
  questionId: string;
  promptKo?: string;
  weight?: number;
  isCore?: boolean;
  useForClassification?: boolean;
  useForRecommendation?: boolean;
  answers?: QAOption[];
  options?: QAOption[];
};

const typeLabels: Record<HumanType, string> = {
  TE: "luni tendency",
  SE: "noise tendency",
  SY: "Literacy tendency",
  TY: "solar trend"
};

const summaries: Record<ResultType, string> = {
  TE: "The tendency is to have a strong physique and stored energy.. weight, abdominal circumference, sodium, Focus on managing saturated fat.",
  SE: "Digestion and body temperature maintenance are weak and noise prone.. Warm, easy-to-digest food, I tend to eat well on a regular basis..",
  SY: "It is a tendency to have a strong sense of activity and heat.. overheating, sleep, spicy food, It is better to control your sugar load..",
  TY: "It is a solar tendency with strong upper body energy and initiative.. neck/chest tightness, hypertension, I think we should be careful about excessively stimulating foods..",
  MIXED: "There is a tendency to mix two or more constitutions with similar constitution scores.. Your response needs supplementation or expert review.",
  REVIEW: "There is a solar trend or unusual pattern but lacks core evidence. We keep the results as they require expert confirmation.."
};

function emptyScore(): Score {
  return { TE: 0, SE: 0, SY: 0, TY: 0 };
}

function addScore(target: Score, source: Partial<Score> | undefined, weight: number) {
  target.TE += (source?.TE || 0) * weight;
  target.SE += (source?.SE || 0) * weight;
  target.SY += (source?.SY || 0) * weight;
  target.TY += (source?.TY || 0) * weight;
}

function roundScore(score: Score) {
  return {
    TE: Number(score.TE.toFixed(2)),
    SE: Number(score.SE.toFixed(2)),
    SY: Number(score.SY.toFixed(2)),
    TY: Number(score.TY.toFixed(2))
  };
}

function valuesFromAnswer(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value && typeof value === "object" && "value" in value) return [String((value as { value: unknown }).value)];
  return [String(value ?? "")].filter(Boolean);
}

function optionPool(qa: QADoc) {
  return qa.answers?.length ? qa.answers : qa.options || [];
}

function optionMaxScore(qa: QADoc) {
  const weight = qa.weight ?? 1;
  const options = optionPool(qa);
  const max = options.reduce((best, option) => {
    const score = option.score || {};
    return Math.max(best, score.TE || 0, score.SE || 0, score.SY || 0, score.TY || 0);
  }, 0);
  return max * weight;
}

function sortedTypes(scores: Score) {
  return (Object.entries(scores) as Array<[HumanType, number]>).sort((a, b) => b[1] - a[1]);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export async function classifyHumanTypeAnswers(rawAnswers: HumanTypeAnswerInput[]) {
  const questionIds = unique(rawAnswers.map((answer) => answer.questionId));
  const qaDocs = (await HumanTypeQA.find({ questionId: { $in: questionIds } }).lean()) as unknown as QADoc[];
  const qaById = new Map(qaDocs.map((qa) => [qa.questionId, qa]));
  const scores = emptyScore();
  const normalizedAnswers: Array<{ questionId: string; value: unknown; labelKo: string; scoreSnapshot: Score }> = [];
  const recommendationTags: string[] = [];
  const cautionTags: string[] = [];
  let totalPossible = 0;
  let tyEvidenceCount = 0;

  for (const answer of rawAnswers) {
    const qa = qaById.get(answer.questionId);
    if (!qa) continue;

    const weight = qa.useForClassification === false ? 0 : qa.weight ?? 1;
    if (qa.useForClassification !== false) totalPossible += optionMaxScore(qa);

    const answerScore = emptyScore();
    const selectedLabels: string[] = [];
    const selectedValues = valuesFromAnswer(answer.value);

    for (const selectedValue of selectedValues) {
      const matched = optionPool(qa).find((option) => String(option.value) === selectedValue);
      if (!matched) continue;

      selectedLabels.push(matched.labelKo || selectedValue);
      addScore(answerScore, matched.score, weight);

      if (qa.useForRecommendation) {
        recommendationTags.push(...(matched.recommendationTags || []));
        cautionTags.push(...(matched.cautionTags || []));
      }

      if ((qa.isCore || (matched.score?.TY || 0) >= 2) && (matched.score?.TY || 0) > 0) {
        tyEvidenceCount += 1;
      }
    }

    addScore(scores, answerScore, 1);
    normalizedAnswers.push({
      questionId: answer.questionId,
      value: answer.value,
      labelKo: answer.labelKo || selectedLabels.join(", "),
      scoreSnapshot: roundScore(answerScore)
    });
  }

  const roundedScores = roundScore(scores);
  const ranked = sortedTypes(roundedScores);
  const [topType, topScore] = ranked[0] || ["TE", 0];
  const [secondType, secondScore] = ranked[1] || ["SE", 0];
  const confidence = totalPossible > 0 ? Number(Math.max(0, Math.min(1, (topScore - secondScore) / totalPossible)).toFixed(4)) : 0;

  let resultType: ResultType = topType;
  if (confidence < 0.08) resultType = "MIXED";
  if (topType === "TY" && tyEvidenceCount < 2) resultType = "REVIEW";

  return {
    classifierVersion: "sasang-v1-curated",
    answers: normalizedAnswers,
    scores: roundedScores,
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

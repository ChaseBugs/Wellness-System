import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { HumanTypeQA } from "../models/human-type-qa.js";

type TypeScore = { TE?: number; SE?: number; SY?: number; TY?: number };

type Question = {
  questionId: string;
  order: number;
  categoryKey: string;
  categoryNameKo: string;
  categoryNameEn: string;
  promptKo: string;
  inputType: "single" | "scale" | "multi" | "text";
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabelKo?: string;
  scaleMaxLabelKo?: string;
  options: Array<{ value: string; labelKo: string; score: TypeScore; recommendationTags?: string[]; cautionTags?: string[] }>;
  answers?: Array<{ value: string; labelKo: string; score: TypeScore; recommendationTags?: string[]; cautionTags?: string[] }>;
  answerListKo?: string;
  weight?: number;
  isCore?: boolean;
  useForClassification?: boolean;
  useForRecommendation?: boolean;
  scoringNoteKo?: string;
  analysisNoteKo?: string;
  dataSource?: string;
  sourceNote?: string;
  sourceRefs?: string[];
  doctor_verified: boolean;
};

const dataSource = "Foodvisor curated Sasang questionnaire v1";
const sourceNote =
  "Curated constitution tendency questionnaire for app classification. This is not a medical diagnosis and must be clinically reviewed before treatment use.";

const refs = [
  "Sasang integrated diagnosis model: https://link.springer.com/article/10.1186/1472-6882-12-85",
  "KS-15 development and validation: https://koreascience.or.kr/article/JAKO201521839155753.page",
  "Sasang constitution and metabolic risk overview: https://pmc.ncbi.nlm.nih.gov/articles/PMC5581468/"
];

const categories = {
  body: ["body_shape", "body type·weather", "Body Shape & Temperament"],
  appearance: ["appearance_speech", "appearance·fraud", "Appearance & Speech"],
  personality: ["personality_talent", "temper·ingenuity", "Personality & Talent"],
  symptoms: ["symptoms_habits", "disease·small symptom·eating habits", "Disease, Fundamental Symptoms & Food Habits"]
} as const;

function option(value: string, labelKo: string, score: TypeScore, recommendationTags: string[] = [], cautionTags: string[] = []) {
  return { value, labelKo, score, recommendationTags, cautionTags };
}

function q(
  category: keyof typeof categories,
  questionId: string,
  order: number,
  promptKo: string,
  options: Question["options"],
  extra: Partial<Question> = {}
): Question {
  const [categoryKey, categoryNameKo, categoryNameEn] = categories[category];
  const answerListKo = options.map((item) => item.labelKo).join(", ");

  return {
    questionId,
    order,
    categoryKey,
    categoryNameKo,
    categoryNameEn,
    promptKo,
    inputType: "single",
    options,
    answers: options,
    answerListKo,
    weight: 1,
    isCore: false,
    useForClassification: true,
    useForRecommendation: false,
    dataSource,
    sourceNote,
    sourceRefs: refs,
    doctor_verified: false,
    ...extra
  };
}

function scaleOptions(labels: [string, string, string, string, string], scores: [TypeScore, TypeScore, TypeScore, TypeScore, TypeScore]) {
  return labels.map((label, index) => option(String(index + 1), label, scores[index]));
}

const questions: Question[] = [
  q("body", "body_shape_type", 1, "Which one is closest to your body type??", [
    option("lower_body", "lower body obesity type", { TE: 2 }),
    option("upper_body", "Upper body obesity type", { SY: 2, TY: 1 }),
    option("abdominal", "abdominal obesity type", { TE: 3 }),
    option("balanced", "Equal type", {})
  ], { analysisNoteKo: "Since body type questions have self-perception bias,·weight gain·sweat·It is judged along with digestion questions.." }),

  q("body", "body_frame_size", 2, "Compared to others, which side is your overall physique closer to??", scaleOptions(
    ["very small", "On the small side", "Normal", "On the big side", "very large"],
    [{ SE: 3 }, { SE: 2 }, {}, { TE: 2 }, { TE: 3 }]
  )),

  q("body", "natural_muscle_mass", 3, "How much muscle do you think you have naturally??", scaleOptions(
    ["very little", "less", "Normal", "A lot", "very much"],
    [{ SE: 2 }, { SE: 1 }, {}, { SY: 1, TE: 1 }, { SY: 2, TE: 1 }]
  )),

  q("body", "bone_thickness", 4, "wrist·ankle·Which is closer to the thickness of the skeleton, including joints??", scaleOptions(
    ["very thin", "On the way", "Normal", "On the thick side", "very thick"],
    [{ SE: 3 }, { SE: 2 }, {}, { TE: 2 }, { TE: 3 }]
  )),

  q("body", "weight_gain_after_overeating", 5, "Do you tend to gain weight after overeating??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ SE: 1, SY: 1 }, { SY: 1 }, {}, { TE: 2 }, { TE: 3 }]
  ), { useForRecommendation: true }),

  q("body", "upper_lower_balance", 6, "chest·shoulder and pelvis·Which part of your lower body do you feel is more developed??", scaleOptions(
    ["Lower body much developed", "Lower body slightly developed", "Similar", "Slightly developed upper body", "Upper body much developed"],
    [{ TE: 2 }, { TE: 1 }, {}, { SY: 1 }, { SY: 2, TY: 1 }]
  )),

  q("body", "shoulder_width", 7, "How is your shoulder width compared to your overall physique??", scaleOptions(
    ["very narrow", "narrow", "Normal", "wide", "very wide"],
    [{ SE: 2 }, { SE: 1 }, {}, { SY: 1, TY: 1 }, { SY: 2, TY: 1 }]
  )),

  q("body", "appetite_strength", 8, "What is your usual appetite??", scaleOptions(
    ["very weak", "weak", "Normal", "good side", "very hearty"],
    [{ SE: 2 }, { SE: 1 }, {}, { TE: 1, SY: 1 }, { TE: 2 }]
  ), { useForRecommendation: true }),

  q("appearance", "face_shape", 9, "Which one is closest to your face shape??", [
    option("round", "round", { TE: 2 }),
    option("angular", "angular", { SY: 1, TE: 1 }),
    option("oval", "egg shape", { SE: 1 }),
    option("triangular", "triangle", { TY: 2, SY: 1 })
  ], { analysisNoteKo: "Face shape is only used as an auxiliary question when there is no photo analysis.." }),

  q("appearance", "facial_skin_oiliness", 10, "What properties is facial skin close to??", scaleOptions(
    ["very dry", "dry", "Normal", "intelligence", "very intelligent"],
    [{ SE: 2 }, { SE: 1 }, {}, { TE: 1, SY: 1 }, { TE: 2 }]
  )),

  q("appearance", "voice_volume", 11, "How loud your voice is judged by others?", scaleOptions(
    ["very small", "On the small side", "Normal", "On the big side", "very large"],
    [{ SE: 2 }, { SE: 1 }, {}, { SY: 1, TY: 1 }, { TY: 2, SY: 1 }]
  )),

  q("appearance", "speech_speed", 12, "Which speed is your speaking speed closer to??", scaleOptions(
    ["very slow", "On the slow side", "Normal", "It's fast", "very fast"],
    [{ TE: 1 }, { TE: 1, SE: 1 }, {}, { SY: 2 }, { SY: 2, TY: 1 }]
  )),

  q("appearance", "voice_pitch", 13, "Which is the pitch of your voice closer to??", scaleOptions(
    ["very low", "low", "Normal", "high", "very high"],
    [{ TE: 1 }, { TE: 1 }, { SE: 1 }, { SY: 1 }, { SY: 2 }]
  ), { analysisNoteKo: "Since voice is used only as a self-response without actual voice analysis, it is given low weight..", weight: 0.7 }),

  q("appearance", "facial_expression", 14, "The evaluations you often hear about your impressions from those around you are:?", [
    option("gentle", "gentle", { TE: 1, SE: 1 }),
    option("sharp", "sharp", { SY: 1, TY: 2 }),
    option("flat", "expressionless", { SE: 1, TE: 1 }),
    option("bright", "bright and lively", { SY: 2 })
  ]),

  q("appearance", "facial_flush", 15, "Does your face blush easily??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ TE: 1 }, { TE: 1 }, { SE: 1 }, { SY: 1 }, { SY: 2 }]
  )),

  q("personality", "detail_orientation", 16, "Do you have a bold personality?, Are you delicate??", scaleOptions(
    ["very bold", "On the bold side", "Normal", "On the delicate side", "very delicate"],
    [{ TE: 2, SY: 1 }, { TE: 1 }, {}, { SE: 2 }, { SE: 3 }]
  ), { isCore: true, weight: 2, scoringNoteKo: "KS-15 Corresponds to the personality axis and therefore applies core weighting." }),

  q("personality", "activity_speed", 17, "Are you quick to act?, Are you slow??", scaleOptions(
    ["very slow", "On the slow side", "Normal", "It's fast", "very fast"],
    [{ TE: 1, SE: 1 }, { SE: 1 }, {}, { SY: 2, TY: 1 }, { SY: 3, TY: 1 }]
  ), { isCore: true, weight: 2, scoringNoteKo: "KS-15 Since it corresponds to the activity axis, key weights are applied." }),

  q("personality", "initiative", 18, "Are you active in everything?, Are you passive??", scaleOptions(
    ["very passive", "passive", "Normal", "active", "very active"],
    [{ SE: 3 }, { SE: 2 }, { TE: 1 }, { SY: 2, TY: 1 }, { SY: 2, TY: 2 }]
  ), { isCore: true, weight: 2, scoringNoteKo: "KS-15 Since it corresponds to the initiative axis, we apply key weights." }),

  q("personality", "extraversion", 19, "Do you have an extroverted personality?, Are you an introvert??", scaleOptions(
    ["very introverted", "introvert", "Normal", "extroverted", "very extroverted"],
    [{ SE: 3 }, { SE: 2 }, { TE: 1 }, { SY: 1, TY: 1 }, { SY: 3 }]
  ), { isCore: true, weight: 2, scoringNoteKo: "KS-15 Core weighting is applied as it corresponds to the extroversion axis.." }),

  q("personality", "emotional_reaction", 20, "What is your main reaction when things don't go your way??", [
    option("very_hurt", "very damaged", { SE: 2 }),
    option("slightly_hurt", "a little damaged", { SE: 1, TE: 1 }),
    option("neutral", "Normal", {}),
    option("slightly_angry", "A little angry", { SY: 1 }),
    option("very_angry", "very angry", { SY: 2, TY: 1 })
  ]),

  q("personality", "patience", 21, "How much patience do you feel you have??", scaleOptions(
    ["very lacking", "tribe", "Normal", "On the strong side", "very strong"],
    [{ SY: 2 }, { SY: 1 }, { SE: 1 }, { TE: 1 }, { TE: 2 }]
  )),

  q("personality", "novelty_seeking", 22, "The degree to which new experiences are sought?", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{ TE: 1 }, { SE: 1 }, {}, { TY: 1 }, { SY: 2 }]
  )),

  q("personality", "planning_style", 23, "Are you closer to planning or improvisation??", scaleOptions(
    ["very spontaneous", "impromptu", "Normal", "planned", "very planned"],
    [{ SY: 2 }, { SY: 1 }, {}, { SE: 1 }, { TE: 2, SE: 1 }]
  )),

  q("personality", "competition_drive", 24, "How competitive are you??", scaleOptions(
    ["None at all", "weak", "Normal", "strong", "very strong"],
    [{ SE: 1 }, { TE: 1 }, {}, { SY: 1, TY: 1 }, { SY: 2, TY: 2 }]
  )),

  q("personality", "preferred_activity", 25, "What activities do you enjoy most in your free time??", [
    option("social", "socializing/meeting", { SY: 2, TE: 1 }, ["social_eating"]),
    option("reading_art", "reading/appreciation of art", { SE: 1, TY: 1 }, ["quiet_routine"]),
    option("physical", "exercise/physical activity", { SY: 2 }, ["active_lifestyle"]),
    option("online_game", "game/online activity", { SE: 1 }, ["sedentary_risk"])
  ], { useForRecommendation: true }),

  q("symptoms", "digestion", 26, "How is your usual digestive condition??", scaleOptions(
    ["very bad", "bad", "Normal", "Good", "very good"],
    [{ SE: 3 }, { SE: 2 }, { TE: 1 }, { TE: 1, SY: 1 }, { SY: 2 }]
  ), { isCore: true, weight: 2, useForRecommendation: true, scoringNoteKo: "KS-15 Since it corresponds to the small-scale axis, key weights are applied." }),

  q("symptoms", "hand_foot_temperature", 27, "Do your hands and feet tend to be cold?, Are you warm??", scaleOptions(
    ["very cold", "coldness", "Normal", "warmth", "very warm"],
    [{ SE: 3 }, { SE: 2 }, { TE: 1 }, { SY: 1, TE: 1 }, { SY: 2, TY: 1 }]
  ), { useForRecommendation: true }),

  q("symptoms", "sweating", 28, "Do you usually sweat a lot??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ SE: 1 }, { SE: 1 }, {}, { TE: 2 }, { TE: 3 }]
  ), { useForRecommendation: true }),

  q("symptoms", "stool_type", 29, "Which side is your usual stool condition closer to??", [
    option("constipation", "Constipation type", { SY: 1, TE: 1 }, ["fiber_priority"]),
    option("normal", "Normal", {}),
    option("diarrhea", "diarrhea type", { SE: 2 }, ["digestive_gentle"])
  ], { useForRecommendation: true }),

  q("symptoms", "sleep_latency", 30, "Does it take you a long time to fall asleep??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ TE: 1 }, {}, {}, { SY: 1 }, { SY: 1, TY: 1 }]
  )),

  q("symptoms", "sleep_refresh", 31, "Do you feel refreshed after waking up??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ TE: 1, SE: 1 }, { TE: 1 }, {}, {}, { SY: 1 }]
  )),

  q("symptoms", "throat_chest_stuck", 32, "Do you often feel stuffy, as if something is stuck in your throat or chest??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{}, {}, { SE: 1 }, { TY: 1, SY: 1 }, { TY: 2, SY: 1 }]
  )),

  q("symptoms", "cold_food_avoidance", 33, "Do you tend to avoid cold foods??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ SY: 1 }, {}, { TE: 1 }, { SE: 2 }, { SE: 3 }]
  ), { useForRecommendation: true, cautionTags: ["cold_food_sensitivity"] } as Partial<Question>),

  q("symptoms", "greasy_food_discomfort", 34, "Do you feel uncomfortable after eating fatty foods??", scaleOptions(
    ["None at all", "almost none", "Normal", "Yes", "very severe"],
    [{ SY: 1 }, {}, { TE: 1 }, { SE: 1 }, { SE: 2 }]
  ), { useForRecommendation: true }),

  q("symptoms", "meat_preference", 35, "meat(beef·pork)How much do you like?", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{ SE: 1 }, {}, {}, { TE: 1 }, { TE: 1, SY: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5, analysisNoteKo: "Food preferences are better suited to personalizing recommendations than determining body type, so we lower the classification weight.." }),

  q("symptoms", "fish_seafood_preference", 36, "fish·How much do you like seafood??", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{ SE: 1 }, {}, {}, { SY: 1, TY: 1 }, { SY: 1, TY: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 }),

  q("symptoms", "chicken_preference", 37, "How much do you like chicken?", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{}, {}, { SE: 1 }, { SE: 1 }, { SE: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 }),

  q("symptoms", "spicy_preference", 38, "How much do you like spicy food??", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{ SE: 1 }, {}, {}, { SY: 1 }, { SY: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 }),

  q("symptoms", "salty_preference", 39, "How salty do you like it??", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{ SY: 1 }, {}, {}, { TE: 1 }, { TE: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 }),

  q("symptoms", "sweet_preference", 40, "How sweet do you like it??", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{}, {}, {}, { SE: 1, TE: 1 }, { SE: 1, TE: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 }),

  q("symptoms", "sour_preference", 41, "How much do you like sour food??", scaleOptions(
    ["very dislike", "Dislike", "Normal", "like", "Like it very much"],
    [{}, {}, {}, { SE: 1, TY: 1 }, { SE: 1, TY: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 }),

  q("symptoms", "fishy_food_avoidance", 42, "Do you tend to avoid fishy fish or seafood??", scaleOptions(
    ["Not at all", "no", "Normal", "Yes", "Very much so"],
    [{ SY: 1 }, {}, {}, { SE: 1 }, { SE: 1 }]
  ), { useForClassification: false, useForRecommendation: true, weight: 0.5 })
];

await connectDatabase();

const keepIds = questions.map((question) => question.questionId);
const deleteResult = await HumanTypeQA.deleteMany({ questionId: { $nin: keepIds } });

for (const question of questions) {
  await HumanTypeQA.updateOne({ questionId: question.questionId }, { $set: question }, { upsert: true, runValidators: true });
}

console.log(`Human type QA import complete. Upserted ${questions.length} curated questions. Removed ${deleteResult.deletedCount} obsolete questions.`);
console.log("Excluded from the original draft: seated height ratio, navel position, seated waist curve, eyelid form, exact nose/lip/eye-vessel/jaw measurements, occupation preference, memory type, and other low-reliability self-assessment items.");

await mongoose.disconnect();

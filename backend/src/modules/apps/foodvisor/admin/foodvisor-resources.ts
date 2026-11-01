import {
  defineResource,
  doctorVerifiedField,
  sourceTraceFields,
  type ResourceDefinition
} from "../../../../shared/resource-kit/resource-definition.js";

/**
 * Admin resources migrated from the legacy Foodvisor MongoDB backend. API field names keep the legacy
 * document names (koreanName, macros, doctorVerified...) so the Foodvisor web-admin maps 1:1.
 */
const GENDERS = ["all", "male", "female"] as const;

export const foodsResource = defineResource({
  name: "foods",
  table: "foodvisor.foods",
  fields: {
    koreanName: { column: "korean_name", type: "text", required: true },
    chineseName: { column: "chinese_name", type: "text" },
    fdcId: { column: "fdc_id", type: "integer" },
    sourceFoodId: { column: "source_food_id", type: "text" },
    dataType: { column: "data_type", type: "text" },
    brand: { column: "brand", type: "text" },
    category: { column: "category", type: "text", required: true },
    foodGroup: { column: "food_group", type: "text" },
    foodSubgroup: { column: "food_subgroup", type: "text" },
    servingSize: { column: "serving_size", type: "text", required: true },
    servingSizeG: { column: "serving_size_g", type: "number" },
    calories: { column: "calories", type: "number", required: true },
    macros: { column: "macros", type: "json" },
    saturatedFat: { column: "saturated_fat", type: "number" },
    transFat: { column: "trans_fat", type: "number" },
    unsaturatedFat: { column: "unsaturated_fat", type: "number" },
    omega3: { column: "omega3", type: "number" },
    omega6: { column: "omega6", type: "number" },
    cholesterolMg: { column: "cholesterol_mg", type: "number" },
    sugar: { column: "sugar", type: "number" },
    glycemicIndex: { column: "glycemic_index", type: "number" },
    oiliness: { column: "oiliness", type: "text" },
    oilinessScore: { column: "oiliness_score", type: "number" },
    vitamins: { column: "vitamins", type: "json" },
    minerals: { column: "minerals", type: "json" },
    bestTimeToEat: { column: "best_time_to_eat", type: "textArray" },
    goodPairings: { column: "good_pairings", type: "textArray" },
    avoidPairings: { column: "avoid_pairings", type: "textArray" },
    cautionGroups: { column: "caution_groups", type: "textArray" },
    cautions: { column: "cautions", type: "text" },
    koreanCautions: { column: "korean_cautions", type: "text" },
    benefits: { column: "benefits", type: "text" },
    allergens: { column: "allergens", type: "textArray" },
    ingredients: { column: "ingredients", type: "textArray" },
    additives: { column: "additives", type: "textArray" },
    dailyValuePercent: { column: "daily_value_percent", type: "json" },
    dailyValuePercentByProfile: { column: "daily_value_percent_by_profile", type: "json" },
    dietUseCases: { column: "diet_use_cases", type: "textArray" },
    dietUseNote: { column: "diet_use_note", type: "text" },
    sourceNutrition: { column: "source_nutrition", type: "json" },
    tags: { column: "tags", type: "textArray" },
    barcode: { column: "barcode", type: "text" },
    imageUrl: { column: "image_url", type: "text" },
    imageSource: { column: "image_source", type: "text" },
    imageSourceUrl: { column: "image_source_url", type: "text" },
    imagePageUrl: { column: "image_page_url", type: "text" },
    imageLicense: { column: "image_license", type: "text" },
    imageStatus: { column: "image_status", type: "text" },
    icon: { column: "icon", type: "text" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["koreanName", "chineseName", "brand", "category", "foodGroup", "foodSubgroup", "tags"],
  filterFields: ["category", "foodGroup", "foodSubgroup", "doctorVerified", "dataSource", "imageStatus", "calories"],
  sortFields: ["koreanName", "chineseName", "category", "calories"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "koreanName",
  maxLimit: 500
});

export const activitiesResource = defineResource({
  name: "activities",
  table: "foodvisor.activities",
  fields: {
    name: { column: "name", type: "text", required: true },
    category: { column: "category", type: "text", required: true },
    caloriesPerHour: { column: "calories_per_hour", type: "number" },
    metValue: { column: "met_value", type: "number", required: true },
    icon: { column: "icon", type: "text" },
    description: { column: "description", type: "text" },
    sourceCode: { column: "source_code", type: "text" },
    tags: { column: "tags", type: "textArray" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["name", "category", "description", "dataSource"],
  filterFields: ["category", "doctorVerified", "dataSource"],
  sortFields: ["name", "category", "metValue"],
  defaultSort: "name",
  reviewField: "doctorVerified",
  labelField: "name"
});

export const programsResource = defineResource({
  name: "programs",
  table: "foodvisor.programs",
  fields: {
    title: { column: "title", type: "text", required: true },
    stage: { column: "stage", type: "text", required: true },
    focus: { column: "focus", type: "text", required: true },
    description: { column: "description", type: "text", required: true },
    cta: { column: "cta", type: "text" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["title", "stage", "focus", "description"],
  filterFields: ["stage", "doctorVerified"],
  sortFields: ["title", "stage"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "title"
});

export const referenceSourcesResource = defineResource({
  name: "reference-sources",
  table: "foodvisor.reference_sources",
  fields: {
    sourceKey: { column: "source_key", type: "text", required: true },
    title: { column: "title", type: "text", required: true },
    standardCode: { column: "standard_code", type: "text" },
    year: { column: "year", type: "integer" },
    category: { column: "category", type: "text", required: true },
    topic: { column: "topic", type: "text", required: true },
    conditionKey: { column: "condition_key", type: "text" },
    filePath: { column: "file_path", type: "text", required: true },
    language: { column: "language", type: "text" },
    tags: { column: "tags", type: "textArray" },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["sourceKey", "title", "standardCode", "category", "topic", "conditionKey", "dataSource"],
  filterFields: ["category", "topic", "conditionKey", "year", "dataSource", "doctorVerified"],
  sortFields: ["title", "standardCode", "year", "category"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "title"
});

export const nutrientIntakeRulesResource = defineResource({
  name: "nutrient-intake-rules",
  table: "foodvisor.nutrient_intake_rules",
  fields: {
    ruleKey: { column: "rule_key", type: "text", required: true },
    standardCode: { column: "standard_code", type: "text", required: true },
    nutrientKey: { column: "nutrient_key", type: "text", required: true },
    nutrientLabel: { column: "nutrient_label", type: "text", required: true },
    referenceType: { column: "reference_type", type: "text", required: true },
    unit: { column: "unit", type: "text", required: true },
    rawValue: { column: "raw_value", type: "text", required: true },
    comparator: { column: "comparator", type: "text", enum: ["eq", "lt", "lte", "gt", "gte", "range"] },
    value: { column: "value", type: "number" },
    valueMin: { column: "value_min", type: "number" },
    valueMax: { column: "value_max", type: "number" },
    ageGroup: { column: "age_group", type: "text", required: true },
    ageMin: { column: "age_min", type: "number" },
    ageMax: { column: "age_max", type: "number" },
    gender: { column: "gender", type: "text", enum: GENDERS },
    lifeStage: { column: "life_stage", type: "text" },
    populationGroup: { column: "population_group", type: "text" },
    physicalActivityLevel: { column: "physical_activity_level", type: "text" },
    tags: { column: "tags", type: "textArray" },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["ruleKey", "standardCode", "nutrientKey", "nutrientLabel", "referenceType", "ageGroup", "gender", "lifeStage", "dataSource"],
  filterFields: ["standardCode", "nutrientKey", "referenceType", "ageGroup", "ageMin", "ageMax", "gender", "lifeStage", "populationGroup", "dataSource", "doctorVerified"],
  sortFields: ["nutrientKey", "ageMin", "value"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "ruleKey",
  maxLimit: 500
});

export const conditionDietConditionsResource = defineResource({
  name: "condition-diet-conditions",
  table: "foodvisor.condition_diet_conditions",
  fields: {
    conditionKey: { column: "condition_key", type: "text", required: true },
    conditionLabel: { column: "condition_label", type: "text", required: true },
    category: { column: "category", type: "text" },
    descriptionKo: { column: "description_ko", type: "text" },
    sortOrder: { column: "sort_order", type: "integer" },
    tags: { column: "tags", type: "textArray" },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["conditionKey", "conditionLabel", "category", "descriptionKo", "dataSource", "tags"],
  filterFields: ["conditionKey", "category", "doctorVerified", "dataSource"],
  sortFields: ["sortOrder", "conditionLabel", "conditionKey"],
  defaultSort: "sortOrder",
  reviewField: "doctorVerified",
  labelField: "conditionLabel"
});

export const conditionDietRulesResource = defineResource({
  name: "condition-diet-rules",
  table: "foodvisor.condition_diet_rules",
  fields: {
    ruleKey: { column: "rule_key", type: "text", required: true },
    conditionKey: { column: "condition_key", type: "text", required: true },
    conditionLabel: { column: "condition_label", type: "text", required: true },
    ruleType: { column: "rule_type", type: "text", required: true },
    priority: { column: "priority", type: "integer" },
    nutrientKey: { column: "nutrient_key", type: "text" },
    comparator: { column: "comparator", type: "text", enum: ["eq", "lt", "lte", "gt", "gte", "range", "avoid", "prefer"] },
    targetValue: { column: "target_value", type: "number" },
    targetMin: { column: "target_min", type: "number" },
    targetMax: { column: "target_max", type: "number" },
    unit: { column: "unit", type: "text" },
    recommendationKo: { column: "recommendation_ko", type: "text", required: true },
    recommendationZh: { column: "recommendation_zh", type: "text" },
    foodTagsPrefer: { column: "food_tags_prefer", type: "textArray" },
    foodTagsAvoid: { column: "food_tags_avoid", type: "textArray" },
    cautionTags: { column: "caution_tags", type: "textArray" },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["ruleKey", "conditionKey", "conditionLabel", "ruleType", "nutrientKey", "recommendationKo", "dataSource"],
  filterFields: ["conditionKey", "ruleType", "comparator", "nutrientKey", "dataSource", "doctorVerified"],
  sortFields: ["conditionKey", "ruleType", "priority"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "ruleKey"
});

export const riskAssessmentRulesResource = defineResource({
  name: "risk-assessment-rules",
  table: "foodvisor.risk_assessment_rules",
  fields: {
    ruleKey: { column: "rule_key", type: "text", required: true },
    standardCode: { column: "standard_code", type: "text", required: true },
    metricKey: { column: "metric_key", type: "text", required: true },
    metricLabel: { column: "metric_label", type: "text", required: true },
    populationGroup: { column: "population_group", type: "text", required: true },
    ageMin: { column: "age_min", type: "number" },
    ageMax: { column: "age_max", type: "number" },
    gender: { column: "gender", type: "text", enum: GENDERS },
    thresholds: { column: "thresholds", type: "json" },
    interpretationKo: { column: "interpretation_ko", type: "text", required: true },
    tags: { column: "tags", type: "textArray" },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["ruleKey", "standardCode", "metricKey", "metricLabel", "populationGroup", "interpretationKo", "dataSource"],
  filterFields: ["standardCode", "metricKey", "populationGroup", "ageMin", "ageMax", "gender", "dataSource", "doctorVerified"],
  sortFields: ["standardCode", "metricKey", "populationGroup"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "metricLabel"
});

export const nutritionTerminologyResource = defineResource({
  name: "nutrition-terminology",
  table: "foodvisor.nutrition_terminology",
  fields: {
    termKey: { column: "term_key", type: "text", required: true },
    category: { column: "category", type: "text", required: true },
    chineseTerm: { column: "chinese_term", type: "text", required: true },
    englishTerm: { column: "english_term", type: "text" },
    koreanTerm: { column: "korean_term", type: "text" },
    abbreviation: { column: "abbreviation", type: "text" },
    unit: { column: "unit", type: "text" },
    definitionKo: { column: "definition_ko", type: "text", required: true },
    aliases: { column: "aliases", type: "textArray" },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["termKey", "category", "chineseTerm", "englishTerm", "koreanTerm", "abbreviation", "dataSource"],
  filterFields: ["category", "dataSource", "doctorVerified"],
  sortFields: ["termKey", "category", "chineseTerm"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "chineseTerm"
});

export const dataValidationRulesResource = defineResource({
  name: "data-validation-rules",
  table: "foodvisor.data_validation_rules",
  fields: {
    ruleKey: { column: "rule_key", type: "text", required: true },
    targetCollection: { column: "target_collection", type: "text", required: true },
    fieldPath: { column: "field_path", type: "text", required: true },
    ruleType: { column: "rule_type", type: "text", required: true },
    expectedUnit: { column: "expected_unit", type: "text" },
    required: { column: "required", type: "boolean" },
    minValue: { column: "min_value", type: "number" },
    maxValue: { column: "max_value", type: "number" },
    messageKo: { column: "message_ko", type: "text", required: true },
    ...sourceTraceFields,
    dataSource: { column: "data_source", type: "text", required: true },
    ...doctorVerifiedField
  },
  searchFields: ["ruleKey", "targetCollection", "fieldPath", "ruleType", "messageKo", "dataSource"],
  filterFields: ["targetCollection", "ruleType", "required", "dataSource", "doctorVerified"],
  sortFields: ["targetCollection", "fieldPath", "ruleType"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "fieldPath"
});

export const dailyValueProfilesResource = defineResource({
  name: "daily-value-profiles",
  table: "foodvisor.daily_value_profiles",
  fields: {
    profileKey: { column: "profile_key", type: "text", required: true },
    label: { column: "label", type: "text", required: true },
    ageMin: { column: "age_min", type: "number", required: true },
    ageMax: { column: "age_max", type: "number", required: true },
    gender: { column: "gender", type: "text", enum: GENDERS },
    purpose: { column: "purpose", type: "text", required: true },
    notes: { column: "notes", type: "text" },
    values: { column: `"values"`, type: "json" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["profileKey", "label", "purpose", "notes", "dataSource", "sourceNote"],
  filterFields: ["purpose", "gender", "doctorVerified"],
  sortFields: ["profileKey", "label", "ageMin"],
  defaultSort: "profileKey",
  reviewField: "doctorVerified",
  labelField: "label"
});

export const nutritionConstraintsResource = defineResource({
  name: "nutrition-constraints",
  table: "foodvisor.nutrition_constraints",
  fields: {
    profileKey: { column: "profile_key", type: "text", required: true },
    nutrientKey: { column: "nutrient_key", type: "text", required: true },
    nutrientLabel: { column: "nutrient_label", type: "text", required: true },
    unit: { column: "unit", type: "text" },
    lowerBound: { column: "lower_bound", type: "number" },
    upperBound: { column: "upper_bound", type: "number" },
    isPercentOfCalories: { column: "is_percent_of_calories", type: "boolean" },
    caloriesPerGram: { column: "calories_per_gram", type: "number" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["profileKey", "nutrientKey", "nutrientLabel", "dataSource", "sourceNote"],
  filterFields: ["profileKey", "nutrientKey", "doctorVerified"],
  sortFields: ["profileKey", "nutrientKey"],
  defaultSort: "nutrientKey",
  reviewField: "doctorVerified",
  labelField: "nutrientLabel"
});

export const recipeIngredientsResource = defineResource({
  name: "recipe-ingredients",
  table: "foodvisor.recipe_ingredients",
  fields: {
    name: { column: "name", type: "text", required: true },
    koreanName: { column: "korean_name", type: "text" },
    foodName: { column: "food_name", type: "text" },
    fdcId: { column: "fdc_id", type: "integer" },
    category: { column: "category", type: "text" },
    amount: { column: "amount", type: "number" },
    unit: { column: "unit", type: "text" },
    preparation: { column: "preparation", type: "text" },
    optional: { column: "optional", type: "boolean" },
    substitutes: { column: "substitutes", type: "textArray" },
    notes: { column: "notes", type: "text" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["name", "koreanName", "foodName", "category", "notes", "dataSource"],
  filterFields: ["category", "optional", "doctorVerified"],
  sortFields: ["name", "category"],
  defaultSort: "name",
  reviewField: "doctorVerified",
  labelField: "name"
});

export const humanTypeQuestionsResource = defineResource({
  name: "human-type-qa",
  table: "foodvisor.human_type_questions",
  fields: {
    questionId: { column: "question_id", type: "text", required: true },
    order: { column: "sort_order", type: "integer", required: true },
    categoryKey: { column: "category_key", type: "text", required: true },
    categoryNameKo: { column: "category_name_ko", type: "text", required: true },
    categoryNameEn: { column: "category_name_en", type: "text" },
    promptKo: { column: "prompt_ko", type: "text", required: true },
    inputType: { column: "input_type", type: "text", enum: ["single", "scale", "multi", "text"] },
    scaleMin: { column: "scale_min", type: "integer" },
    scaleMax: { column: "scale_max", type: "integer" },
    scaleMinLabelKo: { column: "scale_min_label_ko", type: "text" },
    scaleMaxLabelKo: { column: "scale_max_label_ko", type: "text" },
    options: { column: "options", type: "json" },
    answers: { column: "answers", type: "json" },
    answerListKo: { column: "answer_list_ko", type: "text" },
    weight: { column: "weight", type: "number" },
    isCore: { column: "is_core", type: "boolean" },
    useForClassification: { column: "use_for_classification", type: "boolean" },
    useForRecommendation: { column: "use_for_recommendation", type: "boolean" },
    scoringNoteKo: { column: "scoring_note_ko", type: "text" },
    analysisNoteKo: { column: "analysis_note_ko", type: "text" },
    ...sourceTraceFields,
    ...doctorVerifiedField
  },
  searchFields: ["questionId", "categoryKey", "categoryNameKo", "promptKo", "scoringNoteKo", "analysisNoteKo", "dataSource"],
  filterFields: ["categoryKey", "inputType", "isCore", "useForClassification", "useForRecommendation", "doctorVerified"],
  sortFields: ["order", "questionId", "categoryKey"],
  defaultSort: "order",
  reviewField: "doctorVerified",
  labelField: "promptKo"
});

export const humanTypeSurveysResource = defineResource({
  name: "human-type-surveys",
  table: "foodvisor.human_type_surveys",
  view: "foodvisor.human_type_survey_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", readOnly: true },
    userEmail: { column: "user_email", type: "text", readOnly: true },
    userName: { column: "user_name", type: "text", readOnly: true },
    status: { column: "status", type: "text", enum: ["draft", "completed", "reviewed", "archived"] },
    classifierVersion: { column: "classifier_version", type: "text", readOnly: true },
    answers: { column: "answers", type: "json", readOnly: true },
    scores: { column: "scores", type: "json", readOnly: true },
    resultType: { column: "result_type", type: "text", readOnly: true },
    resultLabelKo: { column: "result_label_ko", type: "text", readOnly: true },
    secondType: { column: "second_type", type: "text", readOnly: true },
    confidence: { column: "confidence", type: "number", readOnly: true },
    totalPossible: { column: "total_possible", type: "number", readOnly: true },
    recommendationTags: { column: "recommendation_tags", type: "textArray", readOnly: true },
    cautionTags: { column: "caution_tags", type: "textArray", readOnly: true },
    summaryKo: { column: "summary_ko", type: "text", readOnly: true },
    notes: { column: "notes", type: "text" },
    dataSource: { column: "data_source", type: "text", readOnly: true },
    sourceNote: { column: "source_note", type: "text" },
    ...doctorVerifiedField
  },
  searchFields: ["userEmail", "userName", "status", "resultType", "resultLabelKo", "summaryKo", "notes"],
  filterFields: ["status", "resultType", "doctorVerified"],
  sortFields: ["status", "resultType", "confidence"],
  defaultSort: "-createdAt",
  reviewField: "doctorVerified",
  labelField: "resultLabelKo",
  // Surveys are created by users answering in the app (POST /apps/foodvisor/human-type-surveys/classify).
  operations: { create: false }
});

export const usersResource = defineResource({
  name: "users",
  table: "foodvisor.profiles",
  view: "foodvisor.profile_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", readOnly: true },
    email: { column: "email", type: "text", readOnly: true },
    name: { column: "display_name", type: "text", readOnly: true },
    goal: { column: "goal", type: "text" },
    gender: { column: "gender", type: "text", enum: ["male", "female", "non_binary"] },
    age: { column: "age", type: "integer" },
    heightCm: { column: "height_cm", type: "number" },
    currentWeightKg: { column: "current_weight_kg", type: "number" },
    targetWeightKg: { column: "target_weight_kg", type: "number" },
    activityLevel: { column: "activity_level", type: "text", enum: ["sedentary", "low_active", "active", "very_active"] },
    calorieGoal: { column: "calorie_goal", type: "integer", readOnly: true },
    dietaryRestrictions: { column: "dietary_restrictions", type: "textArray" },
    medicalConditions: { column: "medical_conditions", type: "textArray" },
    programStage: { column: "program_stage", type: "text" }
  },
  searchFields: ["email", "name", "goal", "programStage"],
  filterFields: ["gender", "programStage", "activityLevel"],
  sortFields: ["email", "name", "age"],
  defaultSort: "-createdAt",
  labelField: "email",
  // Accounts are created through sign-up; the admin edits the Foodvisor profile only.
  operations: { create: false }
});

export const mealLogsResource = defineResource({
  name: "meal-logs",
  table: "foodvisor.meal_logs",
  view: "foodvisor.meal_log_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", readOnly: true },
    userEmail: { column: "user_email", type: "text", readOnly: true },
    userName: { column: "user_name", type: "text", readOnly: true },
    date: { column: "eaten_at", type: "timestamp", readOnly: true },
    mealType: { column: "meal_type", type: "text", readOnly: true },
    source: { column: "source", type: "text", readOnly: true },
    recipeContentId: { column: "recipe_content_id", type: "uuid", readOnly: true },
    photoUrl: { column: "photo_url", type: "text", readOnly: true },
    notes: { column: "notes", type: "text", readOnly: true },
    foodName: { column: "food_name", type: "text", readOnly: true },
    calories: { column: "calories", type: "number", readOnly: true },
    proteinG: { column: "protein_g", type: "number", readOnly: true },
    carbsG: { column: "carbs_g", type: "number", readOnly: true },
    fatG: { column: "fat_g", type: "number", readOnly: true }
  },
  searchFields: ["userEmail", "userName", "foodName", "mealType", "source"],
  filterFields: ["mealType", "source", "userId", "date"],
  sortFields: ["date", "calories", "mealType"],
  defaultSort: "-date",
  labelField: "foodName",
  // Meal logs belong to users; the admin can inspect and remove them, not author them.
  operations: { create: false, update: false }
});

export const weightEntriesResource = defineResource({
  name: "weight-entries",
  table: "foodvisor.weight_entries",
  view: "foodvisor.weight_entry_admin_view",
  fields: {
    userId: { column: "user_id", type: "uuid", readOnly: true },
    userEmail: { column: "user_email", type: "text", readOnly: true },
    userName: { column: "user_name", type: "text", readOnly: true },
    date: { column: "measured_on", type: "date", readOnly: true },
    weightKg: { column: "weight_kg", type: "number", readOnly: true },
    note: { column: "note", type: "text", readOnly: true }
  },
  searchFields: ["userEmail", "userName", "note"],
  filterFields: ["userId", "date"],
  sortFields: ["date", "weightKg"],
  defaultSort: "-date",
  labelField: "userEmail",
  operations: { create: false, update: false }
});

/**
 * Foodvisor recipes live in the shared Content Factory (content.items), scoped to recipes that list
 * Foodvisor. Publishing still goes through the expert-review workflow under /content/manage/items;
 * editing a reviewed recipe here sends it back to review, exactly like the Content Factory does.
 */
export const recipesResource = defineResource({
  name: "recipes",
  table: "content.items",
  scope: [
    { column: "content_type", equals: "recipe" },
    { column: "app_codes", contains: "foodvisor" }
  ],
  createDefaults: { content_type: "recipe", app_codes: ["foodvisor", "healthy-recipes"], review_status: "draft", expert_reviewed: false },
  updateSideEffects: [
    "review_status = CASE WHEN review_status IN ('draft', 'archived') THEN review_status ELSE 'in_review' END",
    "expert_reviewed = CASE WHEN review_status = 'draft' THEN expert_reviewed ELSE false END",
    "published_at = CASE WHEN review_status = 'draft' THEN published_at ELSE NULL END"
  ],
  fields: {
    title: { column: "title", type: "text", required: true },
    summary: { column: "summary", type: "text" },
    body: { column: "body", type: "text" },
    category: { column: "category", type: "text", enum: ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"] },
    durationMinutes: { column: "duration_minutes", type: "integer" },
    difficulty: { column: "difficulty", type: "text", enum: ["beginner", "intermediate", "advanced"] },
    tags: { column: "tags", type: "textArray" },
    steps: { column: "steps", type: "json" },
    media: { column: "media", type: "json" },
    /** { servings, ingredients[], nutritionPerServing { calories, proteinG, carbsG, fatG }, allergens[] } */
    attributes: { column: "attributes", type: "json" },
    locale: { column: "locale", type: "text" },
    isPremium: { column: "is_premium", type: "boolean" },
    appCodes: { column: "app_codes", type: "textArray", readOnly: true },
    reviewStatus: { column: "review_status", type: "text", readOnly: true },
    expertReviewed: { column: "expert_reviewed", type: "boolean", readOnly: true },
    publishedAt: { column: "published_at", type: "timestamp", readOnly: true }
  },
  searchFields: ["title", "summary", "category", "tags"],
  filterFields: ["category", "difficulty", "reviewStatus", "isPremium"],
  sortFields: ["title", "durationMinutes", "reviewStatus"],
  defaultSort: "-createdAt",
  labelField: "title"
});

/** Every Foodvisor admin resource, in sidebar order. */
export const FOODVISOR_ADMIN_RESOURCES: ResourceDefinition[] = [
  foodsResource,
  recipesResource,
  usersResource,
  mealLogsResource,
  weightEntriesResource,
  activitiesResource,
  programsResource,
  recipeIngredientsResource,
  referenceSourcesResource,
  nutrientIntakeRulesResource,
  conditionDietConditionsResource,
  conditionDietRulesResource,
  riskAssessmentRulesResource,
  nutritionTerminologyResource,
  dataValidationRulesResource,
  dailyValueProfilesResource,
  nutritionConstraintsResource,
  humanTypeQuestionsResource,
  humanTypeSurveysResource
];

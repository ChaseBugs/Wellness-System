const standardsRoot = "reference/1711103428637300/营养标准汇编20231205";
const dietGuideDataSource = "Chinese national food therapy and diet guidelines";
const assessmentDataSource = "Chinese WS/T health assessment standards";
const terminologyDataSource = "Chinese WS/T nutrition terminology and food composition standards";
const whoGrowthDataSource = "WHO Growth Reference 2007";

export const referenceSources = [
  {
    sourceKey: "wst578-1-2017-macronutrient",
    title: "中国居民膳食营养素参考摄入量 第1部分：宏量营养素",
    standardCode: "WST578.1-2017",
    year: 2017,
    category: "nutrient_intake",
    topic: "macronutrient",
    filePath: `${standardsRoot}/第一部分 营养素摄入量/1-WST578.1-2017 中国居民膳食营养素参考摄入量 第1部分：宏量营养素.pdf`,
    dataSource: "Chinese Dietary Reference Intakes WST578",
    sourceNote: "Official WS/T nutrient intake reference standard.",
    tags: ["WST578", "DRI", "macronutrient"]
  },
  {
    sourceKey: "wst578-2-2018-macroelement",
    title: "中国居民膳食营养素参考摄入量 第2部分：常量元素",
    standardCode: "WST578.2-2018",
    year: 2018,
    category: "nutrient_intake",
    topic: "macroelement",
    filePath: `${standardsRoot}/第一部分 营养素摄入量/2-WST578.2-2018 中国居民膳食营养素参考摄入量 第2部分：常量元素.pdf`,
    dataSource: "Chinese Dietary Reference Intakes WST578",
    sourceNote: "Official WS/T nutrient intake reference standard.",
    tags: ["WST578", "DRI", "minerals"]
  },
  {
    sourceKey: "wst578-3-2017-trace-element",
    title: "中国居民膳食营养素参考摄入量 第3部分：微量元素",
    standardCode: "WST578.3-2017",
    year: 2017,
    category: "nutrient_intake",
    topic: "trace_element",
    filePath: `${standardsRoot}/第一部分 营养素摄入量/3-WST578.3-2017 中国居民膳食营养素参考摄入量 第3部分：微量元素.pdf`,
    dataSource: "Chinese Dietary Reference Intakes WST578",
    sourceNote: "Official WS/T nutrient intake reference standard.",
    tags: ["WST578", "DRI", "trace_element"]
  },
  {
    sourceKey: "wst578-4-2018-fat-soluble-vitamin",
    title: "中国居民膳食营养素参考摄入量 第4部分：脂溶性维生素",
    standardCode: "WST578.4-2018",
    year: 2018,
    category: "nutrient_intake",
    topic: "fat_soluble_vitamin",
    filePath: `${standardsRoot}/第一部分 营养素摄入量/4-WST578.4-2018 中国居民膳食营养素参考摄入量 第4部分：脂溶性维生素.pdf`,
    dataSource: "Chinese Dietary Reference Intakes WST578",
    sourceNote: "Official WS/T nutrient intake reference standard.",
    tags: ["WST578", "DRI", "vitamin"]
  },
  {
    sourceKey: "wst578-5-2018-water-soluble-vitamin",
    title: "中国居民膳食营养素参考摄入量 第5部分：水溶性维生素",
    standardCode: "WST578.5-2018",
    year: 2018,
    category: "nutrient_intake",
    topic: "water_soluble_vitamin",
    filePath: `${standardsRoot}/第一部分 营养素摄入量/5-WST578.5-2018 中国居民膳食营养素参考摄入量 第5部分：水溶性维生素.pdf`,
    dataSource: "Chinese Dietary Reference Intakes WST578",
    sourceNote: "Official WS/T nutrient intake reference standard.",
    tags: ["WST578", "DRI", "vitamin"]
  },
  {
    sourceKey: "adult-hypertension-food-therapy-2023",
    title: "成人高血压食养指南（2023年版）",
    year: 2023,
    category: "condition_diet",
    topic: "hypertension",
    conditionKey: "hypertension",
    filePath: `${standardsRoot}/第五部分 其他标准和指南/成人高血压食养指南（2023年版）.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Official adult hypertension food therapy guide.",
    tags: ["hypertension", "low_sodium", "blood_pressure"]
  },
  {
    sourceKey: "adult-hyperlipidemia-food-therapy-2023",
    title: "成人高脂血症食养指南（2023年版）",
    year: 2023,
    category: "condition_diet",
    topic: "hyperlipidemia",
    conditionKey: "hyperlipidemia",
    filePath: `${standardsRoot}/第五部分 其他标准和指南/成人高脂血症食养指南（2023年版）.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Official adult hyperlipidemia food therapy guide.",
    tags: ["hyperlipidemia", "saturated_fat", "cholesterol"]
  },
  {
    sourceKey: "adult-diabetes-food-therapy-2023",
    title: "成人糖尿病食养指南（2023年版）",
    year: 2023,
    category: "condition_diet",
    topic: "diabetes",
    conditionKey: "diabetes",
    filePath: `${standardsRoot}/第五部分 其他标准和指南/成人糖尿病食养指南（2023年版）.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Official adult diabetes food therapy guide.",
    tags: ["diabetes", "glycemic_control", "carbohydrate"]
  },
  {
    sourceKey: "adult-obesity-food-therapy-2024",
    title: "成人肥胖食养指南（2024年版）",
    year: 2024,
    category: "condition_diet",
    topic: "adult_obesity",
    conditionKey: "adult_obesity",
    filePath: "reference/1711101969135717/5-成人肥胖食养指南（2024 年版）.pdf",
    dataSource: dietGuideDataSource,
    sourceNote: "Official adult obesity food therapy guide.",
    tags: ["obesity", "weight_management", "energy_control"]
  },
  {
    sourceKey: "child-obesity-food-therapy-2024",
    title: "儿童青少年肥胖食养指南（2024年版）",
    year: 2024,
    category: "condition_diet",
    topic: "child_obesity",
    conditionKey: "child_obesity",
    filePath: "reference/1711102001255436/6-儿童青少年肥胖食养指南（2024 年版）.pdf",
    dataSource: dietGuideDataSource,
    sourceNote: "Official child and adolescent obesity food therapy guide.",
    tags: ["child_obesity", "growth", "energy_control"]
  },
  {
    sourceKey: "adult-gout-food-therapy-2024",
    title: "成人高尿酸血症与痛风食养指南（2024年版）",
    year: 2024,
    category: "condition_diet",
    topic: "gout_hyperuricemia",
    conditionKey: "gout_hyperuricemia",
    filePath: "reference/1711102066871264/7-成人高尿酸血症与痛风食养指南（2024年版）.pdf",
    dataSource: dietGuideDataSource,
    sourceNote: "Official adult hyperuricemia and gout food therapy guide.",
    tags: ["gout", "hyperuricemia", "purine"]
  },
  {
    sourceKey: "wst428-2013-adult-weight",
    title: "成人体重判定",
    standardCode: "WST428-2013",
    year: 2013,
    category: "assessment",
    topic: "adult_bmi",
    filePath: `${standardsRoot}/第四部分 评估标准/WST428-2013 成人体重判定.pdf`,
    dataSource: assessmentDataSource,
    sourceNote: "Adult weight status and BMI classification standard.",
    tags: ["BMI", "adult_weight"]
  },
  {
    sourceKey: "wst586-2018-child-overweight-obesity",
    title: "学龄儿童青少年超重与肥胖筛查",
    standardCode: "WST586-2018",
    year: 2018,
    category: "assessment",
    topic: "child_obesity_screening",
    filePath: `${standardsRoot}/第二部分 筛查方法/14-WST586-2018  学龄儿童青少年超重与肥胖筛查.pdf`,
    dataSource: assessmentDataSource,
    sourceNote: "School-age child and adolescent overweight and obesity screening standard.",
    tags: ["child", "obesity", "BMI"]
  },
  {
    sourceKey: "wst611-2018-child-waist",
    title: "7～18岁儿童青少年高腰围筛查界值",
    standardCode: "WST611-2018",
    year: 2018,
    category: "assessment",
    topic: "child_waist_screening",
    filePath: `${standardsRoot}/第四部分 评估标准/WST611-2018 7～18岁儿童青少年高腰围筛查界值.pdf`,
    dataSource: assessmentDataSource,
    sourceNote: "Child and adolescent high-waist circumference screening threshold standard.",
    tags: ["child", "waist", "central_obesity"]
  },
  {
    sourceKey: "wst612-2018-child-height",
    title: "7～18岁儿童青少年身高发育等级评价",
    standardCode: "WST612-2018",
    year: 2018,
    category: "assessment",
    topic: "child_height_growth",
    filePath: `${standardsRoot}/第四部分 评估标准/WST612-2018 7～18岁儿童青少年身高发育等级评价.pdf`,
    dataSource: assessmentDataSource,
    sourceNote: "Child and adolescent height development grade assessment standard.",
    tags: ["child", "height", "growth"]
  },
  {
    sourceKey: "who-2007-child-weight-for-age-5-10",
    title: "WHO Growth Reference 2007 - Weight-for-age 5 to 10 years",
    standardCode: "WHO-2007-WFA-5-10",
    year: 2007,
    category: "assessment",
    topic: "child_weight_growth",
    filePath: "https://www.who.int/toolkits/growth-reference-data-for-5to19-years/indicators/weight-for-age-5to10-years",
    language: "en",
    dataSource: whoGrowthDataSource,
    sourceNote: "WHO 2007 weight-for-age reference for children 5-10 years.",
    tags: ["child", "weight", "growth", "WHO"]
  },
  {
    sourceKey: "wst801-2022-pregnancy-weight-gain",
    title: "妊娠期妇女体重增长推荐值标准",
    standardCode: "WST801-2022",
    year: 2022,
    category: "assessment",
    topic: "pregnancy_weight_gain",
    filePath: `${standardsRoot}/第四部分 评估标准/WST801-2022 妊娠期妇女体重增长推荐值标准.pdf`,
    dataSource: assessmentDataSource,
    sourceNote: "Pregnancy weight gain recommendation standard.",
    tags: ["pregnancy", "weight_gain"]
  },
  {
    sourceKey: "wst464-2015-food-composition-expression",
    title: "食物成分数据表达规范",
    standardCode: "WST464-2015",
    year: 2015,
    category: "data_validation",
    topic: "food_composition_expression",
    filePath: `${standardsRoot}/第四部分 评估标准/WST464-2015 食物成分数据表达规范.pdf`,
    dataSource: terminologyDataSource,
    sourceNote: "Food composition data expression and validation standard.",
    tags: ["food_composition", "validation", "units"]
  },
  {
    sourceKey: "wst476-2015-nutrition-terminology",
    title: "营养名词术语",
    standardCode: "WST476-2015",
    year: 2015,
    category: "terminology",
    topic: "nutrition_terms",
    filePath: `${standardsRoot}/第五部分 其他标准和指南/WST476-2015 营养名词术语.pdf`,
    dataSource: terminologyDataSource,
    sourceNote: "Nutrition terminology standard.",
    tags: ["terminology", "nutrition"]
  },
  {
    sourceKey: "wst429-2013-adult-diabetes-diet-guide",
    title: "成人糖尿病患者膳食指导",
    standardCode: "WST429-2013",
    year: 2013,
    category: "clinical_diet_guidance",
    topic: "diabetes",
    conditionKey: "diabetes",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST429-2013 成人糖尿病患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Adult diabetes patient dietary guidance.",
    tags: ["diabetes", "clinical_diet"]
  },
  {
    sourceKey: "wst430-2013-hypertension-diet-guide",
    title: "高血压患者膳食指导",
    standardCode: "WST430-2013",
    year: 2013,
    category: "clinical_diet_guidance",
    topic: "hypertension",
    conditionKey: "hypertension",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST430-2013 高血压患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Hypertension patient dietary guidance.",
    tags: ["hypertension", "clinical_diet"]
  },
  {
    sourceKey: "wst556-2017-elderly-diet-guide",
    title: "老年人膳食指导",
    standardCode: "WST556-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "elderly",
    conditionKey: "elderly",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST556-2017 老年人膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Elderly dietary guidance.",
    tags: ["elderly", "clinical_diet"]
  },
  {
    sourceKey: "wst557-2017-ckd-diet-guide",
    title: "慢性肾脏病患者膳食指导",
    standardCode: "WST557-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "ckd",
    conditionKey: "ckd",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST557-2017 慢性肾脏病患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Chronic kidney disease patient dietary guidance.",
    tags: ["ckd", "kidney", "clinical_diet"]
  },
  {
    sourceKey: "wst558-2017-stroke-diet-guide",
    title: "脑卒中患者膳食指导",
    standardCode: "WST558-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "stroke",
    conditionKey: "stroke",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST558-2017 脑卒中患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Stroke patient dietary guidance.",
    tags: ["stroke", "clinical_diet"]
  },
  {
    sourceKey: "wst559-2017-cancer-diet-guide",
    title: "恶性肿瘤患者膳食指导",
    standardCode: "WST559-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "cancer",
    conditionKey: "cancer",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST559-2017 恶性肿瘤患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Malignant tumor patient dietary guidance.",
    tags: ["cancer", "clinical_diet"]
  },
  {
    sourceKey: "wst560-2017-gout-diet-guide",
    title: "高尿酸血症与痛风患者膳食指导",
    standardCode: "WST560-2017",
    year: 2017,
    category: "clinical_diet_guidance",
    topic: "gout_hyperuricemia",
    conditionKey: "gout_hyperuricemia",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST560-2017 高尿酸血症与痛风患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Hyperuricemia and gout patient dietary guidance.",
    tags: ["gout", "hyperuricemia", "clinical_diet"]
  },
  {
    sourceKey: "wst601-2018-gestational-diabetes-diet-guide",
    title: "妊娠期糖尿病患者膳食指导",
    standardCode: "WST601-2018",
    year: 2018,
    category: "clinical_diet_guidance",
    topic: "gestational_diabetes",
    conditionKey: "gestational_diabetes",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST601-2018 妊娠期糖尿病患者膳食指导.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Gestational diabetes patient dietary guidance.",
    tags: ["pregnancy", "gestational_diabetes", "clinical_diet"]
  },
  {
    sourceKey: "wst678-2020-infant-complementary-feeding",
    title: "婴幼儿辅食添加营养指南",
    standardCode: "WST678-2020",
    year: 2020,
    category: "clinical_diet_guidance",
    topic: "infant_complementary_feeding",
    conditionKey: "infant_complementary_feeding",
    filePath: `${standardsRoot}/第三部分 膳食指导/WST678-2020 婴幼儿辅食添加营养指南.pdf`,
    dataSource: dietGuideDataSource,
    sourceNote: "Infant complementary feeding nutrition guide.",
    tags: ["infant", "complementary_feeding", "clinical_diet"]
  }
] as const;

export const conditionDietRules = [
  ["hypertension", "adult high blood pressure", "sodium_limit", "sodium", "lte", 2000, "mg/d", "Keep sodium low and pickle, processed food, Reduce your intake of salty broth.", "low_sodium", "high_sodium"],
  ["hypertension", "adult high blood pressure", "potassium_priority", "potassium", "prefer", undefined, "mg/d", "vegetables, fruit, Give priority to foods with potassium and dietary fiber, such as legumes..", "high_potassium,high_fiber", ""],
  ["hypertension", "adult high blood pressure", "alcohol_limit", "", "avoid", undefined, "", "Limit alcohol consumption and high-salt snacks as they are detrimental to blood pressure management..", "", "alcohol,high_sodium"],
  ["diabetes", "adult diabetes", "carb_quality", "carbs", "range", undefined, "%E", "Manage both the quantity and quality of carbohydrates and limit refined sugars and sugary drinks..", "whole_grain,low_gi,high_fiber", "sweet_drink,added_sugar"],
  ["diabetes", "adult diabetes", "added_sugar_limit", "addedSugar", "lt", 10, "%E", "Added sugars account for 10% of total energy% We manage it in a way that lowers it to below.", "", "added_sugar,sweet_snack"],
  ["diabetes", "adult diabetes", "meal_regular", "", "prefer", undefined, "", "Eat regular meals and avoid overeating and long fasting..", "regular_meal", "binge_eating"],
  ["hyperlipidemia", "adult hyperlipidemia", "saturated_fat_limit", "saturatedFat", "lt", 10, "%E", "Low in saturated fat and trans fat, fried, Reduce fatty meat.", "unsaturated_fat,fish,legume", "fried_food,high_saturated_fat"],
  ["hyperlipidemia", "adult hyperlipidemia", "cholesterol_limit", "cholesterol", "lte", 300, "mg/d", "Foods high in cholesterol should be limited based on individual risk..", "plant_food,high_fiber", "high_cholesterol"],
  ["hyperlipidemia", "adult hyperlipidemia", "fiber_priority", "fiber", "gte", 25, "g/d", "vegetables, wailing, Increase dietary fiber intake with legumes.", "high_fiber,whole_grain,legume", ""],
  ["adult_obesity", "adult obesity", "energy_deficit", "energyKcal", "prefer", undefined, "kcal/d", "Maintain calories below personal needs but avoid protein and micronutrient deficiencies.", "low_energy_density,high_protein,high_fiber", "high_energy_density"],
  ["adult_obesity", "adult obesity", "fried_sweet_limit", "", "avoid", undefined, "", "fried food, sweet drink, Cut down on high-calorie snacks.", "vegetable,lean_protein", "fried_food,sweet_drink"],
  ["child_obesity", "Obesity in children and adolescents", "growth_safe_energy", "energyKcal", "prefer", undefined, "kcal/d", "Reduce high-calorie, low-nutrition foods while ensuring nutrition needed for growth.", "balanced_meal,milk,vegetable", "sweet_drink,fast_food"],
  ["child_obesity", "Obesity in children and adolescents", "family_meal_pattern", "", "prefer", undefined, "", "home meal, regular meals, We manage the increase in activity together.", "regular_meal,activity", "late_night_snack"],
  ["gout_hyperuricemia", "adult and尿acidosis/gout", "purine_limit", "", "avoid", undefined, "", "Reduce high-purine foods and excessive drinking, and manage foods at risk for gout attacks..", "low_purine,vegetable,water", "organ_meat,alcohol,high_purine_seafood"],
  ["gout_hyperuricemia", "adult and尿acidosis/gout", "fructose_limit", "addedSugar", "lt", 10, "%E", "Limit high-fructose beverages and sugary foods.", "water,low_sugar", "sweet_drink,fructose"],
  ["ckd", "chronic kidney disease", "protein_quality", "protein", "range", undefined, "g/kg/d", "We manage the amount of protein and the proportion of high-quality protein tailored to kidney function..", "high_quality_protein,egg,milk", "processed_meat"],
  ["ckd", "chronic kidney disease", "sodium_limit", "sodium", "lte", 2000, "mg/d", "Limit sodium and avoid processed foods and salty seasonings.", "fresh_food", "high_sodium,processed_food"],
  ["ckd", "chronic kidney disease", "potassium_management", "potassium", "lte", undefined, "mg/d", "If you are at risk for hyperkalemia, limit fruits and vegetables that are high in potassium.", "low_potassium_vegetable", "banana,orange,potato"],
  ["ckd", "chronic kidney disease", "phosphorus_management", "phosphorus", "lte", undefined, "mg/d", "Reduce processed foods high in phosphorus and phosphorus additives.", "fresh_meat", "phosphate_additive,cola"],
  ["ckd", "chronic kidney disease", "fluid_balance", "", "prefer", undefined, "", "Water intake is adjusted according to kidney function and degree of edema..", "balanced_fluid", "excess_fluid"],
  ["stroke", "stroke", "sodium_limit", "sodium", "lte", 2000, "mg/d", "Reduce sodium intake to help manage blood pressure.", "low_sodium", "high_sodium,pickled_food"],
  ["stroke", "stroke", "saturated_fat_limit", "saturatedFat", "lt", 10, "%E", "Lower your intake of saturated fat and trans fat and increase the proportion of fish and vegetable fat..", "fish,plant_oil,nuts", "fried_food,high_saturated_fat"],
  ["stroke", "stroke", "fiber_priority", "fiber", "gte", 25, "g/d", "wailing, vegetables, fruit, Increase dietary fiber intake with legumes.", "whole_grain,vegetable,fruit,legume", ""],
  ["stroke", "stroke", "alcohol_limit", "", "avoid", undefined, "", "Limit drinking and eat regularly.", "regular_meal", "alcohol"],
  ["cancer", "malignant tumor", "energy_protein_priority", "protein", "prefer", undefined, "g/kg/d", "During the treatment period, we provide sufficient energy and high-quality protein first..", "high_quality_protein,egg,fish,milk", "low_energy_density"],
  ["cancer", "malignant tumor", "vegetable_fruit_priority", "", "prefer", undefined, "", "Secure micronutrients by eating a variety of colorful vegetables and fruits every day..", "vegetable,fruit,whole_grain", ""],
  ["cancer", "malignant tumor", "processed_meat_limit", "", "avoid", undefined, "", "Processed meats and smoked meats·Reduce your intake of salted foods.", "fresh_meat,fish", "processed_meat,smoked_food"],
  ["cancer", "malignant tumor", "alcohol_limit", "", "avoid", undefined, "", "Limit your drinking.", "", "alcohol"],
  ["elderly", "elderly people", "protein_priority", "protein", "gte", 1.0, "g/kg/d", "To prevent muscle loss, consume high-quality protein distributed throughout each meal..", "egg,fish,legume,milk,tofu", ""],
  ["elderly", "elderly people", "calcium_vitamin_d", "calcium", "prefer", undefined, "mg/d", "Calcium and vitamins to prevent osteoporosisD We recommend taking proper care of your diet and exposing yourself to sunlight..", "milk,dairy,small_fish,vegetable", ""],
  ["elderly", "elderly people", "fiber_fluid", "fiber", "gte", 25, "g/d", "Consume plenty of dietary fiber and water to prevent constipation..", "whole_grain,vegetable,fruit", ""],
  ["elderly", "elderly people", "easy_to_chew_swallow", "", "prefer", undefined, "", "Cook in a form that is easy to chew and swallow and distribute the number of meals appropriately..", "soft_food,small_meal", "hard_food"],
  ["gestational_diabetes", "gestational diabetes", "carb_distribution", "carbs", "range", undefined, "%E", "Reduces post-meal blood sugar fluctuations by distributing carbohydrates across meals and snacks.", "whole_grain,low_gi,vegetable", "added_sugar,sweet_drink"],
  ["gestational_diabetes", "gestational diabetes", "protein_priority", "protein", "gte", 1.0, "g/kg/d", "Consume plenty of high-quality protein and fish, legumes, Use eggs.", "fish,legume,egg,low_fat_meat", ""],
  ["gestational_diabetes", "gestational diabetes", "added_sugar_avoid", "addedSugar", "lt", 5, "%E", "Sugary drinks and snacks, Avoid foods with fructose syrup.", "water,low_sugar", "sweet_drink,fructose,added_sugar"],
  ["gestational_diabetes", "gestational diabetes", "regular_meals", "", "prefer", undefined, "", "Eat regular meals and avoid late-night snacks and long fasting..", "regular_meal,small_frequent", "late_night_snack"],
  ["gestational_diabetes", "gestational diabetes", "weight_gain_safe", "", "prefer", undefined, "", "before pregnancy BMIFollow a weight gain range tailored to your (WST801 standard).", "balanced_weight_gain", ""],
  ["infant_complementary_feeding", "Supplementary food for weaning", "iron_priority", "iron", "prefer", undefined, "mg/d", "6Gradually introduce iron-rich baby food starting from 1 month of age..", "iron_fortified,red_meat,liver", ""],
  ["infant_complementary_feeding", "Supplementary food for weaning", "salt_sugar_avoid", "", "avoid", undefined, "", "1Salt and sugar are not added to baby food for infants under the age of three..", "natural_food", "salt,added_sugar,honey"],
  ["infant_complementary_feeding", "Supplementary food for weaning", "texture_progression", "", "prefer", undefined, "", "Depending on the age of the month, porridge is made in Mieum., Jinbab, Proceed gradually in order of minced food..", "age_appropriate_texture", ""],
  ["infant_complementary_feeding", "Supplementary food for weaning", "allergen_introduction", "", "prefer", undefined, "", "egg, fish, Allergenic foods such as nuts are introduced step by step..", "single_introduction", "multiple_allergen_at_once"],
  ["infant_complementary_feeding", "Supplementary food for weaning", "honey_avoid", "", "avoid", undefined, "", "Due to the risk of botulism, honey is not given to children under 12 months of age..", "", "honey"]
].map(([conditionKey, conditionLabel, ruleType, nutrientKey, comparator, targetValue, unit, recommendationKo, prefer, avoid], index) => ({
  ruleKey: `${conditionKey}-${ruleType}`,
  conditionKey,
  conditionLabel,
  ruleType,
  priority: index + 1,
  nutrientKey,
  comparator,
  targetValue,
  unit,
  recommendationKo,
  foodTagsPrefer: String(prefer || "").split(",").filter(Boolean),
  foodTagsAvoid: String(avoid || "").split(",").filter(Boolean),
  cautionTags: String(avoid || "").split(",").filter(Boolean),
  dataSource: dietGuideDataSource,
  sourceNote: "Structured from Chinese national food therapy and WS/T diet guidance references for app recommendation rules.",
  sourceRefs: referenceSources.filter((source) => source.category === "condition_diet" || source.topic.includes(String(conditionKey))).map((source) => source.filePath),
  doctor_verified: true
}));

const conditionDietConditionMap = new Map<string, {
  conditionKey: string;
  conditionLabel: string;
  sortOrder: number;
  sourceRefs: string[];
}>();

conditionDietRules.forEach((rule, index) => {
  const conditionKey = String(rule.conditionKey);
  if (!conditionDietConditionMap.has(conditionKey)) {
    conditionDietConditionMap.set(conditionKey, {
      conditionKey,
      conditionLabel: String(rule.conditionLabel),
      sortOrder: index + 1,
      sourceRefs: rule.sourceRefs
    });
  }
});

export const conditionDietConditions = [...conditionDietConditionMap.values()].map((condition) => ({
  ...condition,
  category: "condition_diet",
  descriptionKo: `${condition.conditionLabel}dietary restrictions for, recommended food, This is disease name data that bundles nutrient standards..`,
  dataSource: dietGuideDataSource,
  sourceNote: "Condition catalog used by Foodvisor disease-specific diet rules.",
  tags: [condition.conditionKey, "condition_diet"],
  doctor_verified: true
}));

const childBmiScreeningThresholds = [
  [6.0, 16.4, 17.7, 16.2, 17.5], [6.5, 16.7, 18.1, 16.5, 18.0],
  [7.0, 17.0, 18.7, 16.8, 18.5], [7.5, 17.4, 19.2, 17.2, 19.0],
  [8.0, 17.8, 19.7, 17.6, 19.4], [8.5, 18.1, 20.3, 18.1, 19.9],
  [9.0, 18.5, 20.8, 18.5, 20.4], [9.5, 18.9, 21.4, 19.0, 21.0],
  [10.0, 19.2, 21.9, 19.5, 21.5], [10.5, 19.6, 22.5, 20.0, 22.1],
  [11.0, 19.9, 23.0, 20.5, 22.7], [11.5, 20.3, 23.6, 21.1, 23.3],
  [12.0, 20.7, 24.1, 21.5, 23.9], [12.5, 21.0, 24.7, 21.9, 24.5],
  [13.0, 21.4, 25.2, 22.2, 25.0], [13.5, 21.9, 25.7, 22.6, 25.6],
  [14.0, 22.3, 26.1, 22.8, 25.9], [14.5, 22.6, 26.4, 23.0, 26.3],
  [15.0, 22.9, 26.6, 23.2, 26.6], [15.5, 23.1, 26.9, 23.4, 26.9],
  [16.0, 23.3, 27.1, 23.6, 27.1], [16.5, 23.5, 27.4, 23.7, 27.4],
  [17.0, 23.7, 27.6, 23.8, 27.6], [17.5, 23.8, 27.8, 23.9, 27.8],
  [18.0, 24.0, 28.0, 24.0, 28.0]
].map(([age, maleOverweight, maleObesity, femaleOverweight, femaleObesity]) => ({
  age, maleOverweight, maleObesity, femaleOverweight, femaleObesity, unit: "kg/m2"
}));

const childWaistThresholds = [
  [7, 58.4, 63.6, 55.8, 60.2], [8, 60.8, 66.8, 57.6, 62.5],
  [9, 63.4, 70.0, 59.8, 65.1], [10, 65.9, 73.1, 62.2, 67.8],
  [11, 68.1, 75.6, 64.6, 70.4], [12, 69.8, 77.4, 66.8, 72.6],
  [13, 71.3, 78.6, 68.5, 74.0], [14, 72.6, 79.6, 69.6, 74.9],
  [15, 73.8, 80.5, 70.4, 75.5], [16, 74.8, 81.3, 70.9, 75.8],
  [17, 75.7, 82.1, 71.2, 76.0], [18, 76.8, 83.0, 71.3, 76.1]
].map(([age, maleP75, maleP90, femaleP75, femaleP90]) => ({
  age, maleP75, maleP90, femaleP75, femaleP90, unit: "cm"
}));

const childHeightGrowthThresholds = {
  male: [
    [7, 113.51, 119.49, 125.48, 131.47, 137.46], [8, 118.35, 124.53, 130.72, 136.90, 143.08],
    [9, 122.74, 129.27, 135.81, 142.35, 148.88], [10, 126.79, 133.77, 140.76, 147.75, 154.74],
    [11, 130.39, 138.20, 146.01, 153.82, 161.64], [12, 134.48, 143.33, 152.18, 161.03, 169.89],
    [13, 143.01, 151.60, 160.19, 168.78, 177.38], [14, 150.22, 157.93, 165.63, 173.34, 181.05],
    [15, 155.25, 162.14, 169.02, 175.91, 182.79], [16, 157.72, 164.15, 170.58, 177.01, 183.44],
    [17, 158.76, 165.07, 171.39, 177.70, 184.01], [18, 158.81, 165.12, 171.42, 177.73, 184.03]
  ],
  female: [
    [7, 112.29, 118.21, 124.13, 130.05, 135.97], [8, 116.83, 123.09, 129.34, 135.59, 141.84],
    [9, 121.31, 128.11, 134.91, 141.71, 148.51], [10, 126.38, 133.78, 141.18, 148.57, 155.97],
    [11, 132.09, 139.72, 147.36, 154.99, 162.63], [12, 138.11, 145.26, 152.41, 159.56, 166.71],
    [13, 143.75, 149.91, 156.07, 162.23, 168.39], [14, 146.18, 151.98, 157.78, 163.58, 169.38],
    [15, 147.02, 152.74, 158.47, 164.19, 169.91], [16, 147.59, 153.26, 158.93, 164.60, 170.27],
    [17, 147.82, 153.50, 159.18, 164.86, 170.54], [18, 148.54, 154.28, 160.01, 165.74, 171.48]
  ]
};

const childWeightForAgeThresholds = {
  male: [
    [5, 14.4, 16.3, 18.5, 21.1, 24.2], [6, 15.9, 18.0, 20.5, 23.5, 27.1],
    [7, 17.7, 20.0, 22.9, 26.4, 30.7], [8, 19.5, 22.1, 25.4, 29.5, 34.7],
    [9, 21.3, 24.3, 28.1, 33.0, 39.4], [10, 23.2, 26.7, 31.2, 37.0, 45.0]
  ],
  female: [
    [5, 14.0, 15.9, 18.3, 21.2, 24.8], [6, 15.3, 17.5, 20.2, 23.5, 27.8],
    [7, 16.8, 19.3, 22.4, 26.3, 31.4], [8, 18.6, 21.4, 25.0, 29.7, 35.8],
    [9, 20.8, 24.0, 28.2, 33.6, 41.0], [10, 23.3, 27.0, 31.9, 38.2, 46.9]
  ],
  unit: "kg",
  bands: ["-2 standard deviation", "-1 standard deviation", "median", "+1 standard deviation", "+2 standard deviation"],
  note: "WHO weight-for-age data are available for 5-10 years only; BMI-for-age is preferred after age 10."
};

const pregnancyWeightGainThresholds = [
  { bmiCategory: "underweight", bmiMax: 18.5, totalGainMinKg: 11.0, totalGainMaxKg: 16.0, firstTrimesterMinKg: 0, firstTrimesterMaxKg: 2.0, weeklyGainKg: 0.46, weeklyGainMinKg: 0.37, weeklyGainMaxKg: 0.56 },
  { bmiCategory: "normal", bmiMin: 18.5, bmiMax: 24.0, totalGainMinKg: 8.0, totalGainMaxKg: 14.0, firstTrimesterMinKg: 0, firstTrimesterMaxKg: 2.0, weeklyGainKg: 0.37, weeklyGainMinKg: 0.26, weeklyGainMaxKg: 0.48 },
  { bmiCategory: "overweight", bmiMin: 24.0, bmiMax: 28.0, totalGainMinKg: 7.0, totalGainMaxKg: 11.0, firstTrimesterMinKg: 0, firstTrimesterMaxKg: 2.0, weeklyGainKg: 0.30, weeklyGainMinKg: 0.22, weeklyGainMaxKg: 0.37 },
  { bmiCategory: "obesity", bmiMin: 28.0, totalGainMinKg: 5.0, totalGainMaxKg: 9.0, firstTrimesterMinKg: 0, firstTrimesterMaxKg: 2.0, weeklyGainKg: 0.22, weeklyGainMinKg: 0.15, weeklyGainMaxKg: 0.30 }
];

export const riskAssessmentRules = [
  {
    ruleKey: "wst428-adult-bmi",
    standardCode: "WST428-2013",
    metricKey: "bmi",
    metricLabel: "Adult BMI",
    populationGroup: "adult",
    ageMin: 18,
    gender: "all",
    thresholds: [
      { label: "underweight", comparator: "lt", valueMax: 18.5 },
      { label: "normal", comparator: "range", valueMin: 18.5, valueMax: 23.9 },
      { label: "overweight", comparator: "range", valueMin: 24.0, valueMax: 27.9 },
      { label: "obesity", comparator: "gte", valueMin: 28.0 }
    ],
    interpretationKo: "chinese adult BMI Judgment: underweight <18.5, normal 18.5-23.9, overweight 24.0-27.9, obesity >=28.0.",
    dataSource: assessmentDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst428-2013-adult-weight")?.filePath || ""],
    tags: ["BMI", "adult_weight"],
    doctor_verified: true
  },
  {
    ruleKey: "wst586-child-bmi-screening",
    standardCode: "WST586-2018",
    metricKey: "child_bmi",
    metricLabel: "Child and adolescent BMI screening",
    populationGroup: "child_adolescent",
    ageMin: 6,
    ageMax: 18,
    gender: "all",
    thresholds: childBmiScreeningThresholds,
    interpretationKo: "children and youth BMIby age and gender WST586 Overweight by baseline/Determine obesity.",
    dataSource: assessmentDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst586-2018-child-overweight-obesity")?.filePath || ""],
    tags: ["child", "BMI", "obesity"],
    doctor_verified: true
  },
  {
    ruleKey: "who-2007-child-weight-for-age",
    standardCode: "WHO-2007-WFA-5-10",
    metricKey: "weight_kg",
    metricLabel: "Child weight-for-age",
    populationGroup: "child_adolescent",
    ageMin: 5,
    ageMax: 10,
    gender: "all",
    thresholds: childWeightForAgeThresholds,
    interpretationKo: "WHO 2007 weight-for-age Based on 5-10By age of three children·Screening and evaluation of gender and weight. 10weight after age-for-ageBecause it is difficult to distinguish between height and body mass, BMI-for-ageUse first.",
    dataSource: whoGrowthDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "who-2007-child-weight-for-age-5-10")?.filePath || ""],
    tags: ["child", "weight", "growth", "WHO"],
    doctor_verified: true
  },
  {
    ruleKey: "wst611-child-waist-screening",
    standardCode: "WST611-2018",
    metricKey: "waist_cm",
    metricLabel: "Child and adolescent high waist circumference",
    populationGroup: "child_adolescent",
    ageMin: 7,
    ageMax: 18,
    gender: "all",
    thresholds: childWaistThresholds,
    interpretationKo: "7-18Three waist circumferences by age and gender WST611 P75/P90 Determine the risk of central obesity using reference values.",
    dataSource: assessmentDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst611-2018-child-waist")?.filePath || ""],
    tags: ["child", "waist", "central_obesity"],
    doctor_verified: true
  },
  {
    ruleKey: "wst612-child-height-growth",
    standardCode: "WST612-2018",
    metricKey: "height_cm",
    metricLabel: "Child and adolescent height development grade",
    populationGroup: "child_adolescent",
    ageMin: 7,
    ageMax: 18,
    gender: "all",
    thresholds: childHeightGrowthThresholds,
    interpretationKo: "7-18Height development varies by age and gender WST612 -2 standard deviation, -1 standard deviation, median, +1 standard deviation, +2 Evaluated based on standard deviation standard value.",
    dataSource: assessmentDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst612-2018-child-height")?.filePath || ""],
    tags: ["child", "height", "growth"],
    doctor_verified: true
  },
  {
    ruleKey: "wst428-height-weight-bmi-index",
    standardCode: "WST428-2013",
    metricKey: "height_weight_bmi",
    metricLabel: "Height-weight BMI index",
    populationGroup: "adult",
    ageMin: 18,
    gender: "all",
    thresholds: {
      formula: "BMI = weightKg / (heightCm / 100)^2",
      chineseWst428: [
        { label: "underweight", comparator: "lt", bmiMax: 18.5 },
        { label: "normal", comparator: "range", bmiMin: 18.5, bmiMax: 23.9 },
        { label: "overweight", comparator: "range", bmiMin: 24.0, bmiMax: 27.9 },
        { label: "obesity", comparator: "gte", bmiMin: 28.0 }
      ],
      healthyWeightKgFormula: {
        min: "18.5 * (heightCm / 100)^2",
        max: "23.9 * (heightCm / 100)^2"
      }
    },
    interpretationKo: "Nutritional screening for adult height and weight BMIView the appropriate weight range calculated from your height.. These values are screening indicators and not a medical diagnosis..",
    dataSource: assessmentDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst428-2013-adult-weight")?.filePath || ""],
    tags: ["BMI", "height", "weight", "adult_weight"],
    doctor_verified: true
  },
  {
    ruleKey: "wst801-pregnancy-weight-gain",
    standardCode: "WST801-2022",
    metricKey: "pregnancy_weight_gain_kg",
    metricLabel: "Pregnancy weight gain",
    populationGroup: "pregnant",
    gender: "female",
    thresholds: pregnancyWeightGainThresholds,
    interpretationKo: "Weight gain during pregnancy BMI By category WST801 total increase, initial increase, Evaluated based on mid- to late-per-week increase.",
    dataSource: assessmentDataSource,
    sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst801-2022-pregnancy-weight-gain")?.filePath || ""],
    tags: ["pregnancy", "weight_gain"],
    doctor_verified: true
  }
] as const;

export const nutritionTerminology = [
  ["dri", "膳食营养素参考摄入量", "Dietary Reference Intakes", "Standard dietary intake of nutrients", "DRIs", "This is a set of reference values used for nutrient intake evaluation and dietary guidance.."],
  ["ear", "平均需要量", "Estimated Average Requirement", "Average Requirement", "EAR", "It is an intake standard that corresponds to the average of individual requirements in a specific population.."],
  ["rni", "推荐摄入量", "Recommended Nutrient Intake", "Recommended intake amount", "RNI", "This is the intake standard set to meet the needs of most healthy people.."],
  ["ai", "适宜摄入量", "Adequate Intake", "Sufficient intake amount", "AI", "This is a sufficient intake standard established by observation or experimental data when evidence is limited.."],
  ["ul", "可耐受最高摄入量", "Tolerable Upper Intake Level", "upper intake limit", "UL", "This is the maximum daily intake level that is unlikely to cause harm even if consumed over a long period of time.."],
  ["amdr", "宏量营养素可接受范围", "Acceptable Macronutrient Distribution Range", "Allowable range of macronutrients", "AMDR", "carbohydrates, This is the recommended energy ratio range for energy nutrients such as fat.."],
  ["pal", "身体活动水平", "Physical Activity Level", "physical activity level", "PAL", "Activity level coefficient used to estimate daily energy requirements."],
  ["bmi", "体质指数", "Body Mass Index", "body mass index", "BMI", "weight(kg)key(m)This is the adult weight judgment index divided by the square of."],
  ["energy_kcal", "能量", "Energy", "energy", "kcal", "The chemical energy provided by food is usually kcal Displayed in units."],
  ["protein", "蛋白质", "Protein", "protein", "Pro", "A macronutrient composed of amino acids. g/d Evaluated by unit."],
  ["fat", "脂肪", "Fat", "fat", "", "A macronutrient composed of fatty acids and glycerol. g/d Evaluated by unit."],
  ["saturated_fat", "饱和脂肪酸", "Saturated Fat", "saturated fat", "SFA", "When consumed excessively, fatty acids without double bonds LDL Can Raise Cholesterol."],
  ["unsaturated_fat", "不饱和脂肪酸", "Unsaturated Fat", "unsaturated fat", "UFA", "A fatty acid with a double bond·Contains polyunsaturated fatty acids."],
  ["trans_fat", "反式脂肪酸", "Trans Fat", "trans fat", "TFA", "Fatty acids produced by hydrogenation keep intake as low as possible."],
  ["cholesterol", "胆固醇", "Cholesterol", "cholesterol", "", "As a lipid component of animal foods mg/d Evaluated by unit."],
  ["carbohydrate", "碳水化合物", "Carbohydrate", "carbohydrates", "CHO", "It is a major source of energy and contains simple and complex sugars."],
  ["dietary_fiber", "膳食纤维", "Dietary Fiber", "dietary fiber", "DF", "It is a vegetable polysaccharide that humans cannot digest and helps with bowel movements and blood sugar control.."],
  ["added_sugar", "添加糖", "Added Sugar", "Added sugar", "", "Sugars added during processing or cooking account for 10% of total energy.% Recommend less than."],
  ["water", "水", "Water", "water", "", "An essential nutrient for body fluid balance and metabolism. ml/d Evaluated by unit."],
  ["sodium", "钠", "Sodium", "sodium", "Na", "A mineral that affects blood pressure regulation mg/d Evaluated by unit."],
  ["potassium", "钾", "Potassium", "Calium", "K", "A mineral involved in blood pressure and muscle function. mg/d Evaluated by unit."],
  ["calcium", "钙", "Calcium", "Calcium", "Ca", "bone and tooth formation, It is a mineral involved in muscle contraction.."],
  ["magnesium", "镁", "Magnesium", "Magnesium", "Mg", "Enzyme reactions and nerves·It is a mineral involved in muscle function.."],
  ["phosphorus", "磷", "Phosphorus", "lean", "P", "bones and ATP Inorganic substances involved in the composition mg/d Evaluated by unit."],
  ["chloride", "氯", "Chloride", "goat", "Cl", "It is a mineral involved in body fluid electrolyte balance.."],
  ["iron", "铁", "Iron", "iron", "Fe", "It is a trace element essential for hemoglobin synthesis and oxygen transport.."],
  ["zinc", "锌", "Zinc", "zinc", "Zn", "It is a trace element involved in immunity and growth.."],
  ["copper", "铜", "Copper", "copper", "Cu", "It is a trace element involved in iron metabolism and antioxidant enzyme activity.."],
  ["selenium", "硒", "Selenium", "Seren", "Se", "It is a component of the antioxidant enzyme glutathione peroxidase.."],
  ["iodine", "碘", "Iodine", "Oxo", "I", "It is a trace element essential for thyroid hormone synthesis.."],
  ["manganese", "锰", "Manganese", "manganese", "Mn", "It is a trace element involved in enzyme reactions and skeleton formation.."],
  ["chromium", "铬", "Chromium", "chrome", "Cr", "It is a trace element that acts as a cofactor in sugar metabolism.."],
  ["molybdenum", "钼", "Molybdenum", "molybdenum", "Mo", "It is a trace element that acts as a cofactor for several enzymes.."],
  ["fluoride", "氟", "Fluoride", "fluorine", "F", "It is a trace element that affects tooth enamel and bone formation.."],
  ["vitamin_a", "维生素A", "Vitamin A", "vitaminsA", "VA", "time, epithelial cells, It is a fat-soluble vitamin involved in immunity.."],
  ["vitamin_d", "维生素D", "Vitamin D", "vitaminsD", "VD", "It is a fat-soluble vitamin involved in calcium absorption and bone health.."],
  ["vitamin_e", "维生素E", "Vitamin E", "vitaminsE", "VE", "It is a fat-soluble vitamin that acts as an antioxidant and protects cell membranes.."],
  ["vitamin_k", "维生素K", "Vitamin K", "vitaminsK", "VK", "It is a fat-soluble vitamin involved in blood coagulation and bone metabolism.."],
  ["vitamin_b1", "维生素B1", "Thiamine", "vitaminsB1", "VB1", "It is a water-soluble vitamin essential for carbohydrate metabolism.."],
  ["vitamin_b2", "维生素B2", "Riboflavin", "vitaminsB2", "VB2", "Acts as a cofactor for energy metabolism enzymes."],
  ["vitamin_b6", "维生素B6", "Pyridoxine", "vitaminsB6", "VB6", "Involved in amino acid metabolism and hemoglobin synthesis."],
  ["vitamin_b12", "维生素B12", "Cobalamin", "vitaminsB12", "VB12", "DNA Involved in synthesis and formation of red blood cells."],
  ["niacin", "烟酸", "Niacin", "Nicotinic acid", "NE", "energy metabolism and NAD/NADP Involved in coenzyme synthesis."],
  ["folate", "叶酸", "Folate", "folic acid", "DFE", "DNA Involved in synthesis and formation of red blood cells, before pregnancy·It is especially important during."],
  ["biotin", "生物素", "Biotin", "biotin", "VB7", "fat·carbohydrates·It is a water-soluble vitamin involved in amino acid metabolism.."],
  ["pantothenic_acid", "泛酸", "Pantothenic Acid", "pantothenic acid", "VB5", "coenzymeA Participates in energy metabolism as a component."],
  ["choline", "胆碱", "Choline", "Colin", "", "It is a precursor of cell membrane phospholipids and the neurotransmitter acetylcholine.."],
  ["vitamin_c", "维生素C", "Vitamin C", "vitaminsC", "VC", "It is a water-soluble vitamin that promotes collagen synthesis and has antioxidant properties.."],
  ["omega_3", "n-3多不饱和脂肪酸", "n-3 PUFA", "omega-3 fatty acids", "n-3", "EPA, DHA, ALAContains polyunsaturated fatty acids that are beneficial to cardiovascular health.."],
  ["omega_6", "n-6多不饱和脂肪酸", "n-6 PUFA", "omega-6 fatty acids", "n-6", "It is a polyunsaturated fatty acid containing linoleic acid.."],
  ["gi", "血糖生成指数", "Glycemic Index", "glycemic index", "GI", "standard food(normal glucose) This is an indicator that compares the blood sugar response after a meal.."],
  ["gl", "血糖生成负荷", "Glycemic Load", "Blood sugar load", "GL", "1 serving of food GI×This is an indicator that reflects the amount of carbohydrates.."],
  ["dv_percent", "营养素参考值百分比", "Daily Value Percent", "Baseline percentage", "%DV", "On the nutrition label, it indicates the content ratio compared to the daily nutrient standard.."],
  ["nrv", "营养素参考值", "Nutrient Reference Value", "nutrient standard", "NRV", "This is the recommended daily standard value used to calculate nutrition labeling.."]
].map(([termKey, chineseTerm, englishTerm, koreanTerm, abbreviation, definitionKo]) => ({
  termKey,
  category: "nutrition_reference",
  chineseTerm,
  englishTerm,
  koreanTerm,
  abbreviation,
  definitionKo,
  aliases: [chineseTerm, englishTerm, abbreviation].filter(Boolean),
  dataSource: terminologyDataSource,
  sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst476-2015-nutrition-terminology")?.filePath || ""],
  doctor_verified: true
}));

export const dataValidationRules = [
  ["foods", "servingSize", "serving_basis", "100 g", true, "Food nutritional content is 100% possibleg Standards must be specified."],
  ["foods", "calories", "non_negative_number", "kcal/100g", true, "Calories kcal/100g Store the unit as a number greater than or equal to 0.."],
  ["foods", "macros.protein", "non_negative_number", "g/100g", true, "Protein is g/100g Store the unit as a number greater than or equal to 0.."],
  ["foods", "macros.fat", "non_negative_number", "g/100g", true, "Fat is g/100g Store the unit as a number greater than or equal to 0.."],
  ["foods", "macros.carbs", "non_negative_number", "g/100g", true, "Carbohydrates g/100g Store the unit as a number greater than or equal to 0.."],
  ["foods", "minerals.sodium", "non_negative_number", "mg/100g", false, "Sodium is mg/100g Stored in units."],
  ["foods", "dataSource", "source_required", "", true, "All food records have their source data names. dataSourcemust have in."],
  ["foods", "sourceNote", "source_trace", "", false, "original file, row number, The conversion method is sourceNote or sourceRefsTrack it with."]
].map(([targetCollection, fieldPath, ruleType, expectedUnit, required, messageKo]) => ({
  ruleKey: `wst464-${targetCollection}-${String(fieldPath).replace(/[^a-zA-Z0-9]+/g, "-")}`,
  targetCollection,
  fieldPath,
  ruleType,
  expectedUnit,
  required,
  messageKo,
  dataSource: terminologyDataSource,
  sourceNote: "Structured from WST464 food composition data expression principles for Foodvisor validation.",
  sourceRefs: [referenceSources.find((source) => source.sourceKey === "wst464-2015-food-composition-expression")?.filePath || ""],
  doctor_verified: true
}));

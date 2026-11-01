# Reference Folder Database Setup Analysis

This file summarizes how the local `reference/` folder should be used for Foodvisor database verification and future collection design.

## Current Source Coverage

The existing non-empty MongoDB collections now have `dataSource` on every document:

| Collection | Source status |
| --- | --- |
| `foods` | Imported source names are complete: China composition, Food Material, U2, FoodYou Swiss, USDA SR28. |
| `activities` | Complete: `OpenNutriTracker-main physical activities`. |
| `nutritionconstraints` | Complete: `USDA SR28 via lp-diet-main`. |
| `dailyvalueprofiles` | Complete: `Foodvisor curated daily value profiles`. |
| `humanTypeQA` | Complete: `Foodvisor curated Sasang questionnaire v1`. |

Empty user/admin collections use schema defaults such as `user_input` or `web_admin` for new records.

## Most Useful Reference Groups

### 1. Nutrition Intake Standards

Folder:
`reference/1711103428637300/营养标准汇编20231205/第一部分 营养素摄入量`

Useful for:
- `dailyValueProfiles`
- `nutritionConstraints`
- age, gender, pregnancy, child, senior nutrient targets
- local China/Korea-facing nutrient reference profiles

Recommended future `dataSource`:
`Chinese Nutrition Standard Compilation 20231205 - WST578`

### 2. Disease Diet Guidelines

Files include:
- 成人高血压食养指南
- 成人高脂血症食养指南
- 成人糖尿病食养指南
- 成人肥胖食养指南
- 儿童青少年肥胖食养指南
- 成人高尿酸血症与痛风食养指南

Useful for:
- `conditionDietRules`
- `dailyValueProfiles`
- `nutritionConstraints`
- food scoring by medical condition
- caution tags such as low sodium, low sugar, low purine, weight control

Recommended future collections:
- `conditionDietRules`
- `conditionFoodGuidelines`
- `medicalNutritionProfiles`

### 3. Clinical Diet Guidance

Folder:
`reference/1711103428637300/营养标准汇编20231205/第三部分 膳食指导`

High-value files:
- `WST429-2013 成人糖尿病患者膳食指导.pdf`
- `WST430-2013 高血压患者膳食指导.pdf`
- `WST556-2017 老年人膳食指导.pdf`
- `WST557-2017 慢性肾脏病患者膳食指导.pdf`
- `WST558-2017 脑卒中患者膳食指导.pdf`
- `WST559-2017 恶性肿瘤患者膳食指导.pdf`
- `WST560-2017 高尿酸血症与痛风患者膳食指导.pdf`
- `WST601-2018 妊娠期糖尿病患者膳食指导.pdf`
- `WST678-2020 婴幼儿辅食添加营养指南.pdf`

Useful for:
- disease-specific recommendation logic
- forbidden/caution foods
- meal planning constraints
- nutrition education text

### 4. Screening and Assessment Standards

Folder:
`reference/1711103428637300/营养标准汇编20231205/第二部分 筛查方法`

Useful files:
- `WST424-2013 人群健康监测人体测量方法.pdf`
- `WST427-2013 临床营养风险筛查.pdf`
- `WST441-2013 人群贫血筛查方法.pdf`
- `WST465-2015 人群铁缺乏筛查方法.pdf`
- `WST553-2017 人群维生素A缺乏筛查方法.pdf`
- `WST586-2018 学龄儿童青少年超重与肥胖筛查.pdf`
- `WST600-2018 人群叶酸缺乏筛查方法.pdf`
- `WST652-2019 食物血糖生成指数测定方法.pdf`
- `WST677-2020 人群维生素D缺乏筛查方法.pdf`

Useful for:
- `healthMetrics`
- `riskAssessments`
- child obesity classification
- anemia, iron, folate, vitamin A/D deficiency risk flags
- GI data validation rules

### 5. Evaluation Standards

Folder:
`reference/1711103428637300/营养标准汇编20231205/第四部分 评估标准`

Useful files:
- `WST428-2013 成人体重判定.pdf`
- `WST423-2022 7岁以下儿童生长标准.pdf`
- `WST611-2018 7～18岁儿童青少年高腰围筛查界值.pdf`
- `WST612-2018 7～18岁儿童青少年身高发育等级评价.pdf`
- `WST801-2022 妊娠期妇女体重增长推荐值标准.pdf`
- `WST464-2015 食物成分数据表达规范.pdf`

Useful for:
- BMI and body-shape classification
- child growth references
- pregnancy weight gain targets
- food nutrient schema validation

### 6. Terminology and Labeling

Folder:
`reference/1711103428637300/营养标准汇编20231205/第五部分 其他标准和指南`

Useful files:
- `WST476-2015 营养名词术语.pdf`
- `餐饮食品营养标识指南.pdf`
- `营养健康餐厅建设指南.pdf`
- `营养健康食堂建设指南.pdf`
- `营养与健康学校建设指南.pdf`

Useful for:
- food/nutrient naming normalization
- admin validation labels
- restaurant/canteen/school meal quality rules

## Recommended Data Model Additions

Use the current `dataSource`, `sourceNote`, and `sourceRefs` fields everywhere. For richer verification later, add:

| Collection | Purpose |
| --- | --- |
| `referenceSources` | One record per PDF/source file with title, year, file path, condition, life stage, and verification status. |
| `conditionDietRules` | Structured rules for hypertension, diabetes, obesity, gout, CKD, pregnancy diabetes, child obesity. |
| `riskAssessmentRules` | BMI, waist, child growth, anemia, vitamin deficiency, nutrition risk screening rules. |
| `nutritionTerminology` | Standardized nutrient/food terms, aliases, units, and translations. |

## Practical Priority

1. Import `referenceSources` metadata first.
2. Extract disease guideline tables into `conditionDietRules`.
3. Extract WST578 nutrient targets into China-local `dailyValueProfiles`.
4. Extract WST428/WST586/WST611/WST612/WST801 into `riskAssessmentRules`.
5. Use `WST464` and `WST476` to validate food composition fields and nutrient naming.

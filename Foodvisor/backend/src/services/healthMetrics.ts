export type HealthFormulaGender = "male" | "female" | "non_binary";
export type ActivityLevel = "sedentary" | "low_active" | "active" | "very_active";
export type WeightGoal = "lose_weight" | "maintain_weight" | "gain_weight";
type GrowthReferenceGender = "male" | "female";

export type MacroRatios = {
  carbs?: number;
  fat?: number;
  protein?: number;
};

export type ActivityBurnInput = {
  name?: string;
  metValue: number;
  durationMinutes: number;
};

export type HealthMetricsInput = {
  gender: HealthFormulaGender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel?: ActivityLevel;
  goal?: WeightGoal;
  dailyActivityCalories?: number;
  calorieAdjustment?: number;
  macroRatios?: MacroRatios;
  activities?: ActivityBurnInput[];
};

const defaultMacroRatios = {
  carbs: 0.6,
  fat: 0.25,
  protein: 0.15
};

const activityLevelToPal: Record<ActivityLevel, number> = {
  sedentary: 1.25,
  low_active: 1.5,
  active: 1.75,
  very_active: 2.2
};

const goalAdjustment: Record<WeightGoal, number> = {
  lose_weight: -500,
  maintain_weight: 0,
  gain_weight: 500
};

const adultBmiThresholds = {
  who: { underweightMax: 18.5, normalMax: 24.9, overweightMax: 29.9 },
  chineseWst428: { underweightMax: 18.5, normalMax: 23.9, overweightMax: 27.9 }
} as const;

const childHeightForAgeReference: Record<GrowthReferenceGender, Array<[number, number, number, number, number, number]>> = {
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

const childWeightForAgeReference: Record<GrowthReferenceGender, Array<[number, number, number, number, number, number]>> = {
  male: [
    [5, 14.4, 16.3, 18.5, 21.1, 24.2], [6, 15.9, 18.0, 20.5, 23.5, 27.1],
    [7, 17.7, 20.0, 22.9, 26.4, 30.7], [8, 19.5, 22.1, 25.4, 29.5, 34.7],
    [9, 21.3, 24.3, 28.1, 33.0, 39.4], [10, 23.2, 26.7, 31.2, 37.0, 45.0]
  ],
  female: [
    [5, 14.0, 15.9, 18.3, 21.2, 24.8], [6, 15.3, 17.5, 20.2, 23.5, 27.8],
    [7, 16.8, 19.3, 22.4, 26.3, 31.4], [8, 18.6, 21.4, 25.0, 29.7, 35.8],
    [9, 20.8, 24.0, 28.2, 33.6, 41.0], [10, 23.3, 27.0, 31.9, 38.2, 46.9]
  ]
};

const childBmiScreeningReference = [
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
] as const;

function round(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function assertPositive(name: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
}

function gendered(gender: HealthFormulaGender, male: number, female: number) {
  if (gender === "male") return male;
  if (gender === "female") return female;

  // Joseon language: In cases where it is difficult to determine a single gender formula,/Write the average value of the female formula.
  // English: When a binary formula cannot be selected, use the average of male and female estimates.
  return (male + female) / 2;
}

function growthGender(gender: HealthFormulaGender): GrowthReferenceGender | null {
  if (gender === "male" || gender === "female") return gender;
  return null;
}

function nearestByAge<T extends readonly [number, ...number[]]>(rows: readonly T[], age: number) {
  return rows.reduce((best, row) => Math.abs(row[0] - age) < Math.abs(best[0] - age) ? row : best, rows[0]);
}

function classifySdBand(value: number, minus2Sd: number, minus1Sd: number, median: number, plus1Sd: number, plus2Sd: number) {
  if (value < minus2Sd) return "below_minus_2sd";
  if (value < minus1Sd) return "minus_2_to_minus_1sd";
  if (value <= plus1Sd) return value < median ? "minus_1sd_to_median" : "median_to_plus_1sd";
  if (value <= plus2Sd) return "plus_1_to_plus_2sd";
  return "above_plus_2sd";
}

export function calculateBmi(weightKg: number, heightCm: number) {
  assertPositive("weightKg", weightKg);
  assertPositive("heightCm", heightCm);

  // Joseon language: BMIis the weight(kg)key(m)It is divided by the square of.
  // English: BMI is body weight in kilograms divided by height in meters squared.
  const bmi = weightKg / (heightCm / 100) ** 2;
  let category = "normal_weight";

  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal_weight";
  else if (bmi < 30) category = "pre_obesity";
  else if (bmi < 35) category = "obesity_class_i";
  else if (bmi < 40) category = "obesity_class_ii";
  else category = "obesity_class_iii";

  return {
    value: round(bmi),
    category
  };
}

export function calculateHeightWeightIndex(weightKg: number, heightCm: number, age?: number) {
  const bmi = calculateBmi(weightKg, heightCm);
  const heightM2 = (heightCm / 100) ** 2;
  const adultReferenceApplicable = age === undefined || age >= 18;

  return {
    bmi,
    adultReferenceApplicable,
    healthyWeightRangeKg: adultReferenceApplicable ? {
      whoAdult: {
        min: round(adultBmiThresholds.who.underweightMax * heightM2),
        max: round(adultBmiThresholds.who.normalMax * heightM2)
      },
      chineseWst428Adult: {
        min: round(adultBmiThresholds.chineseWst428.underweightMax * heightM2),
        max: round(adultBmiThresholds.chineseWst428.normalMax * heightM2)
      }
    } : null,
    formulas: {
      bmi: "weightKg / (heightCm / 100)^2",
      healthyWeightRange: "bmiMin * heightM^2 to bmiMax * heightM^2"
    },
    interpretation: adultReferenceApplicable
      ? "Adult height-weight screening uses BMI and a height-derived healthy weight range."
      : "For children and adolescents, use age- and sex-specific growth references instead of adult BMI ranges."
  };
}

export function calculateChildGrowthIndicators(input: Pick<HealthMetricsInput, "gender" | "age" | "heightCm" | "weightKg">) {
  const referenceGender = growthGender(input.gender);
  if (!referenceGender) {
    return {
      applicable: false,
      reason: "Sex-specific child growth references require male or female."
    };
  }

  const result: Record<string, unknown> = {
    applicable: input.age >= 5 && input.age <= 18,
    referenceGender,
    age: input.age,
    notes: [
      "Weight-for-age is available for ages 5-10 only; after age 10, BMI-for-age is preferred because weight-for-age does not distinguish height from body mass.",
      "These are screening references, not a medical diagnosis."
    ]
  };

  if (input.age >= 7 && input.age <= 18) {
    const [age, minus2Sd, minus1Sd, median, plus1Sd, plus2Sd] = nearestByAge(childHeightForAgeReference[referenceGender], input.age);
    result.heightForAge = {
      standardCode: "WST612-2018",
      nearestAge: age,
      valueCm: round(input.heightCm),
      referenceCm: { minus2Sd, minus1Sd, median, plus1Sd, plus2Sd },
      category: classifySdBand(input.heightCm, minus2Sd, minus1Sd, median, plus1Sd, plus2Sd)
    };
  }

  if (input.age >= 5 && input.age <= 10) {
    const [age, minus2Sd, minus1Sd, median, plus1Sd, plus2Sd] = nearestByAge(childWeightForAgeReference[referenceGender], input.age);
    result.weightForAge = {
      standardCode: "WHO-2007-WFA-5-10",
      nearestAge: age,
      valueKg: round(input.weightKg),
      referenceKg: { minus2Sd, minus1Sd, median, plus1Sd, plus2Sd },
      category: classifySdBand(input.weightKg, minus2Sd, minus1Sd, median, plus1Sd, plus2Sd)
    };
  }

  if (input.age >= 6 && input.age <= 18) {
    const [age, maleOverweight, maleObesity, femaleOverweight, femaleObesity] = nearestByAge(childBmiScreeningReference, input.age);
    const overweight = referenceGender === "male" ? maleOverweight : femaleOverweight;
    const obesity = referenceGender === "male" ? maleObesity : femaleObesity;
    const bmi = calculateBmi(input.weightKg, input.heightCm).value;
    result.bmiForAge = {
      standardCode: "WST586-2018",
      nearestAge: age,
      value: bmi,
      overweight,
      obesity,
      category: bmi >= obesity ? "obesity" : bmi >= overweight ? "overweight" : "below_overweight_cutoff"
    };
  }

  return result;
}

export function calculateBmr(gender: HealthFormulaGender, age: number, heightCm: number, weightKg: number) {
  assertPositive("age", age);
  assertPositive("heightCm", heightCm);
  assertPositive("weightKg", weightKg);

  // Joseon language: BMRis an estimate of the basic calories needed per day in a steady state..
  // English: BMR estimates baseline daily calories needed at rest.
  const harrisBenedict1918 = gendered(
    gender,
    66.473 + 13.7516 * weightKg + 5.0033 * heightCm - 6.755 * age,
    655.0955 + 9.5634 * weightKg + 1.8496 * heightCm - 4.6756 * age
  );

  const revisedHarrisBenedict1984 = gendered(
    gender,
    88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age,
    447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age
  );

  const mifflinStJeor1990 = gendered(
    gender,
    10 * weightKg + 6.25 * heightCm - 5 * age + 5,
    10 * weightKg + 6.25 * heightCm - 5 * age - 161
  );

  const schofield1985Male = (() => {
    if (age < 3) return 59.512 * weightKg - 30.4;
    if (age < 10) return 22.706 * weightKg + 504.3;
    if (age < 18) return 17.686 * weightKg + 658.2;
    if (age < 30) return 15.057 * weightKg + 692.2;
    if (age < 60) return 11.472 * weightKg + 873.1;
    return 11.711 * weightKg + 587.7;
  })();

  const schofield1985Female = (() => {
    if (age < 3) return 58.317 * weightKg - 31.1;
    if (age < 10) return 20.315 * weightKg + 485.9;
    if (age < 18) return 13.384 * weightKg + 692.6;
    if (age < 30) return 14.818 * weightKg + 486.6;
    if (age < 60) return 8.126 * weightKg + 845.6;
    return 9.082 * weightKg + 658.5;
  })();

  const schofield1985 = gendered(gender, schofield1985Male, schofield1985Female);

  return {
    harrisBenedict1918: round(harrisBenedict1918),
    revisedHarrisBenedict1984: round(revisedHarrisBenedict1984),
    mifflinStJeor1990: round(mifflinStJeor1990),
    schofield1985: round(schofield1985),
    recommended: round(mifflinStJeor1990)
  };
}

export function getPalValue(activityLevel: ActivityLevel = "low_active") {
  return activityLevelToPal[activityLevel] ?? activityLevelToPal.low_active;
}

function getPaCoefficient(gender: HealthFormulaGender, palValue: number) {
  if (palValue < 1.4) return 1;
  if (palValue < 1.6) return gendered(gender, 1.12, 1.14);
  if (palValue < 1.9) return 1.27;
  return gendered(gender, 1.54, 1.45);
}

export function calculateTdee(input: Pick<HealthMetricsInput, "gender" | "age" | "heightCm" | "weightKg" | "activityLevel">) {
  const activityLevel = input.activityLevel ?? "low_active";
  const palValue = getPalValue(activityLevel);
  const bmr = calculateBmr(input.gender, input.age, input.heightCm, input.weightKg);
  const paCoefficient = getPaCoefficient(input.gender, palValue);

  // Joseon language: TDEEis the total energy consumption per day., Activity level is reflected in basal metabolic rate.
  // English: TDEE estimates total daily energy expenditure after applying activity level.
  const who2001 = bmr.schofield1985 * palValue;
  const iom2005 = gendered(
    input.gender,
    864 - 9.72 * input.age + paCoefficient * 14.2 * input.weightKg + 503 * (input.heightCm / 100),
    387 - 7.31 * input.age + paCoefficient * 10.9 * input.weightKg + 660.7 * (input.heightCm / 100)
  );

  return {
    activityLevel,
    palValue,
    paCoefficient: round(paCoefficient, 2),
    who2001: round(who2001),
    iom2005: round(iom2005),
    recommended: round(iom2005)
  };
}

export function calculateActivityBurn(weightKg: number, activities: ActivityBurnInput[] = []) {
  assertPositive("weightKg", weightKg);

  // Joseon language: Calories burned during exercise MET * weight(kg) * time(h) Calculate with the formula.
  // English: Activity calories use MET * body weight in kg * duration in hours.
  const items = activities.map((activity) => {
    assertPositive("metValue", activity.metValue);
    assertPositive("durationMinutes", activity.durationMinutes);
    const calories = activity.metValue * weightKg * activity.durationMinutes / 60;
    return {
      name: activity.name,
      metValue: activity.metValue,
      durationMinutes: activity.durationMinutes,
      calories: round(calories)
    };
  });

  return {
    items,
    totalCalories: round(items.reduce((sum, item) => sum + item.calories, 0))
  };
}

export function calculateCalorieGoal(input: {
  tdeeCalories: number;
  goal?: WeightGoal;
  dailyActivityCalories?: number;
  calorieAdjustment?: number;
}) {
  assertPositive("tdeeCalories", input.tdeeCalories);
  const goal = input.goal ?? "maintain_weight";
  const adjustment = input.calorieAdjustment ?? goalAdjustment[goal] ?? 0;
  const dailyActivityCalories = input.dailyActivityCalories ?? 0;

  // Joseon language: Daily calorie goal TDEEIt is determined by adding the weight target correction value and exercise calories burned..
  // English: Daily calorie goal adds goal adjustment and activity calories to TDEE.
  return {
    goal,
    tdeeCalories: round(input.tdeeCalories),
    goalAdjustmentCalories: round(adjustment),
    dailyActivityCalories: round(dailyActivityCalories),
    totalCalories: Math.max(0, round(input.tdeeCalories + adjustment + dailyActivityCalories))
  };
}

export function calculateMacroGoal(totalCalories: number, ratios: MacroRatios = {}) {
  assertPositive("totalCalories", totalCalories);

  const carbsRatio = ratios.carbs ?? defaultMacroRatios.carbs;
  const fatRatio = ratios.fat ?? defaultMacroRatios.fat;
  const proteinRatio = ratios.protein ?? defaultMacroRatios.protein;
  const ratioTotal = carbsRatio + fatRatio + proteinRatio;

  if (!Number.isFinite(ratioTotal) || ratioTotal <= 0) {
    throw new Error("macroRatios must have a positive total.");
  }

  const normalized = {
    carbs: carbsRatio / ratioTotal,
    fat: fatRatio / ratioTotal,
    protein: proteinRatio / ratioTotal
  };

  // Joseon language: Macro goal is calories from carbohydrates/fat/Divide by protein ratio g Convert to units.
  // English: Macro goals split calories by carb/fat/protein ratios and convert calories to grams.
  return {
    ratios: {
      carbs: round(normalized.carbs, 3),
      fat: round(normalized.fat, 3),
      protein: round(normalized.protein, 3)
    },
    grams: {
      carbs: round((totalCalories * normalized.carbs) / 4),
      fat: round((totalCalories * normalized.fat) / 9),
      protein: round((totalCalories * normalized.protein) / 4)
    },
    calories: {
      carbs: round(totalCalories * normalized.carbs),
      fat: round(totalCalories * normalized.fat),
      protein: round(totalCalories * normalized.protein)
    }
  };
}

export function calculateHealthMetrics(input: HealthMetricsInput) {
  const activityBurn = calculateActivityBurn(input.weightKg, input.activities ?? []);
  const tdee = calculateTdee(input);
  const calorieGoal = calculateCalorieGoal({
    tdeeCalories: tdee.recommended,
    goal: input.goal,
    dailyActivityCalories: (input.dailyActivityCalories ?? 0) + activityBurn.totalCalories,
    calorieAdjustment: input.calorieAdjustment
  });

  return {
    bmi: calculateBmi(input.weightKg, input.heightCm),
    heightWeightIndex: calculateHeightWeightIndex(input.weightKg, input.heightCm, input.age),
    childGrowth: calculateChildGrowthIndicators(input),
    bmr: calculateBmr(input.gender, input.age, input.heightCm, input.weightKg),
    tdee,
    calorieGoal,
    macroGoal: calculateMacroGoal(calorieGoal.totalCalories, input.macroRatios),
    activityBurn,
    notes: [
      "Joseon language: These results are health care estimates and are not intended as a medical diagnosis or prescription..",
      "English: These values are wellness estimates, not medical diagnosis or treatment."
    ]
  };
}

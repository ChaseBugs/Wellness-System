const dataSource = "Foodvisor curated daily value profiles";
const sourceNote =
  "Curated app targets derived from FDA Daily Values-style nutrient limits and Foodvisor goal adjustments. Review against local clinical guidelines before medical use.";
const sourceRefs = [
  "reference/1711103428637300/营养标准汇编20231205/第一部分 营养素摄入量",
  "reference/1711103428637300/营养标准汇编20231205/第四部分 评估标准/WST428-2013 成人体重判定.pdf"
];

export const dailyValueProfiles = [
  {
    profileKey: "adult_general_19_64",
    label: "Adult General (19-64)",
    ageMin: 19,
    ageMax: 64,
    gender: "all",
    purpose: "general_health",
    notes: "Baseline adult nutrition profile for general food scoring.",
    dataSource,
    sourceNote,
    sourceRefs,
    values: {
      calories: 2000, protein: 50, carbs: 275, fat: 78, saturatedFat: 20, fiber: 28, sugar: 50,
      sodium: 2300, cholesterol: 300, calcium: 1300, iron: 18, magnesium: 420, potassium: 4700, zinc: 11,
      vitaminA: 900, vitaminB1: 1.2, vitaminB2: 1.3, vitaminB3: 16, vitaminB6: 1.7, vitaminB12: 2.4,
      vitaminC: 90, vitaminD: 20, vitaminE: 15, vitaminK: 120, folate: 400
    },
    doctor_verified: false
  },
  {
    profileKey: "adult_weight_loss_19_64",
    label: "Adult Weight Loss (19-64)",
    ageMin: 19,
    ageMax: 64,
    gender: "all",
    purpose: "weight_loss",
    notes: "Lower-calorie profile with higher protein and fiber emphasis.",
    dataSource,
    sourceNote,
    sourceRefs,
    values: {
      calories: 1600, protein: 80, carbs: 160, fat: 55, saturatedFat: 16, fiber: 32, sugar: 35,
      sodium: 2000, cholesterol: 300, calcium: 1300, iron: 18, magnesium: 420, potassium: 4700, zinc: 11,
      vitaminA: 900, vitaminB1: 1.2, vitaminB2: 1.3, vitaminB3: 16, vitaminB6: 1.7, vitaminB12: 2.4,
      vitaminC: 90, vitaminD: 20, vitaminE: 15, vitaminK: 120, folate: 400
    },
    doctor_verified: false
  },
  {
    profileKey: "adult_diabetes_19_64",
    label: "Adult Diabetes Management (19-64)",
    ageMin: 19,
    ageMax: 64,
    gender: "all",
    purpose: "diabetes_management",
    notes: "Carbohydrate, sugar, fiber, sodium, and GI-aware program profile.",
    dataSource,
    sourceNote,
    sourceRefs,
    values: {
      calories: 1800, protein: 75, carbs: 180, fat: 65, saturatedFat: 16, fiber: 35, sugar: 25,
      sodium: 2000, cholesterol: 200, calcium: 1300, iron: 18, magnesium: 420, potassium: 4700, zinc: 11,
      vitaminA: 900, vitaminB1: 1.2, vitaminB2: 1.3, vitaminB3: 16, vitaminB6: 1.7, vitaminB12: 2.4,
      vitaminC: 90, vitaminD: 20, vitaminE: 15, vitaminK: 120, folate: 400
    },
    doctor_verified: false
  },
  {
    profileKey: "adult_athlete_19_40",
    label: "Adult Athlete (19-40)",
    ageMin: 19,
    ageMax: 40,
    gender: "all",
    purpose: "athlete_performance",
    notes: "Higher energy, protein, carbohydrate, and electrolyte target profile.",
    dataSource,
    sourceNote,
    sourceRefs,
    values: {
      calories: 2800, protein: 120, carbs: 400, fat: 95, saturatedFat: 25, fiber: 35, sugar: 65,
      sodium: 2500, cholesterol: 300, calcium: 1300, iron: 18, magnesium: 450, potassium: 5000, zinc: 13,
      vitaminA: 900, vitaminB1: 1.4, vitaminB2: 1.6, vitaminB3: 18, vitaminB6: 2, vitaminB12: 2.4,
      vitaminC: 120, vitaminD: 20, vitaminE: 15, vitaminK: 120, folate: 400
    },
    doctor_verified: false
  },
  {
    profileKey: "senior_general_65_plus",
    label: "Senior General (65+)",
    ageMin: 65,
    ageMax: 120,
    gender: "all",
    purpose: "senior_health",
    notes: "Senior profile with protein, calcium, vitamin D, potassium, and sodium control emphasis.",
    dataSource,
    sourceNote,
    sourceRefs,
    values: {
      calories: 1800, protein: 70, carbs: 230, fat: 65, saturatedFat: 18, fiber: 30, sugar: 40,
      sodium: 1800, cholesterol: 250, calcium: 1200, iron: 8, magnesium: 420, potassium: 4700, zinc: 11,
      vitaminA: 900, vitaminB1: 1.2, vitaminB2: 1.3, vitaminB3: 16, vitaminB6: 1.7, vitaminB12: 2.4,
      vitaminC: 90, vitaminD: 20, vitaminE: 15, vitaminK: 120, folate: 400
    },
    doctor_verified: false
  }
] as const;

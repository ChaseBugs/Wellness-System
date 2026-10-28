import { Activity, Apple, BookOpen, ClipboardList, FileQuestion, LayoutDashboard, LibraryBig, MonitorSmartphone, Ruler, Salad, ShieldCheck, Target, Users } from "lucide-react";

export const navItems = [
  { group: null, href: "/", label: "Dashboard", icon: LayoutDashboard, statKey: undefined as string | undefined },
  { group: null, href: "/ui-workflows", label: "UI Workflows", icon: MonitorSmartphone, statKey: undefined as string | undefined },
  { group: "Nutrition", href: "/foods", label: "Foods", icon: Apple, statKey: "foods" as string | undefined },
  { group: "Nutrition", href: "/daily-nutrition", label: "Daily Nutrition", icon: Target, statKey: "nutrientIntakeRules" as string | undefined },
  { group: "Nutrition", href: "/condition-diet-rules", label: "Meal rules for each disease", icon: ShieldCheck, statKey: "conditionDietRules" as string | undefined },
  { group: "Nutrition", href: "/nutrition-terminology", label: "Nutrition Terms", icon: BookOpen, statKey: "nutritionTerminology" as string | undefined },
  { group: "Nutrition", href: "/data-validation-rules", label: "Data Validation", icon: Ruler, statKey: "dataValidationRules" as string | undefined },
  { group: "Nutrition", href: "/reference-sources", label: "Reference Sources", icon: LibraryBig, statKey: "referenceSources" as string | undefined },
  { group: "Nutrition", href: "/recipes", label: "Recipes", icon: Salad, statKey: "recipes" as string | undefined },
  { group: "Nutrition", href: "/recipe-ingredients", label: "Recipe Ingredients", icon: Apple, statKey: undefined as string | undefined },
  { group: "Activity", href: "/activities", label: "Activities", icon: Activity, statKey: "activities" as string | undefined },
  { group: "People", href: "/users", label: "Users", icon: Users, statKey: "users" as string | undefined },
  { group: "People", href: "/human-type-qa", label: "Human Type QA", icon: FileQuestion, statKey: undefined as string | undefined },
  { group: "People", href: "/human-type-surveys", label: "Human Type Surveys", icon: ClipboardList, statKey: undefined as string | undefined },
  { group: "People", href: "/risk-assessment-rules", label: "Risk Rules", icon: ShieldCheck, statKey: "riskAssessmentRules" as string | undefined },
  { group: "People", href: "/meal-logs", label: "Meal Logs", icon: BookOpen, statKey: "mealLogs" as string | undefined }
] as const;

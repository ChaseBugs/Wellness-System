import {
  Activity, Apple, Baby, BookOpen, BookText, ClipboardCheck, ClipboardList, CreditCard, Dumbbell, FileQuestion, Flag, Gauge,
  HeartPulse, LayoutDashboard, LibraryBig, Megaphone, MonitorSmartphone, Moon, Repeat, Ruler, Salad, ScrollText, Settings,
  ShieldCheck, Sparkles, Target, TrendingUp, Trophy, Users, type LucideIcon
} from "lucide-react";

export type NavItem = {
  group: string | null;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Key in the Foodvisor dashboard's `unverified` counts, shown as a badge. */
  statKey?: string;
};

export type Section = {
  key: "platform" | "foodvisor" | "babygrow" | "height";
  label: string;
  href: string;
  icon: LucideIcon;
  /** Platform pages manage accounts and billing, so only admins see them. */
  adminOnly?: boolean;
  items: NavItem[];
};

export const sections: Section[] = [
  {
    key: "platform",
    label: "Platform",
    href: "/platform",
    icon: Gauge,
    adminOnly: true,
    items: [
      { group: null, href: "/platform", label: "Overview", icon: LayoutDashboard },
      { group: "Operations", href: "/platform/review", label: "Review queue", icon: ClipboardCheck },
      { group: "Operations", href: "/platform/accounts", label: "Accounts & roles", icon: Users },
      { group: "Operations", href: "/platform/subscriptions", label: "Subscriptions", icon: CreditCard },
      { group: "Growth", href: "/platform/recommendations", label: "Recommendations", icon: Sparkles },
      { group: "Growth", href: "/platform/analytics", label: "Analytics", icon: TrendingUp },
      { group: "Audit", href: "/platform/audit-log", label: "Audit log", icon: ScrollText }
    ]
  },
  {
    key: "foodvisor",
    label: "Foodvisor",
    href: "/foodvisor",
    icon: Apple,
    items: [
      { group: null, href: "/foodvisor", label: "Dashboard", icon: LayoutDashboard },
      { group: null, href: "/foodvisor/ui-workflows", label: "UI Workflows", icon: MonitorSmartphone },
      { group: "Nutrition", href: "/foodvisor/foods", label: "Foods", icon: Apple, statKey: "foods" },
      { group: "Nutrition", href: "/foodvisor/daily-nutrition", label: "Daily Nutrition", icon: Target, statKey: "nutrientIntakeRules" },
      { group: "Nutrition", href: "/foodvisor/condition-diet-rules", label: "Meal rules for each disease", icon: ShieldCheck, statKey: "conditionDietRules" },
      { group: "Nutrition", href: "/foodvisor/nutrition-terminology", label: "Nutrition Terms", icon: BookOpen, statKey: "nutritionTerminology" },
      { group: "Nutrition", href: "/foodvisor/data-validation-rules", label: "Data Validation", icon: Ruler, statKey: "dataValidationRules" },
      { group: "Nutrition", href: "/foodvisor/reference-sources", label: "Reference Sources", icon: LibraryBig, statKey: "referenceSources" },
      { group: "Nutrition", href: "/foodvisor/recipes", label: "Recipes", icon: Salad, statKey: "recipes" },
      { group: "Nutrition", href: "/foodvisor/recipe-ingredients", label: "Recipe Ingredients", icon: Apple },
      { group: "Activity", href: "/foodvisor/activities", label: "Activities", icon: Activity, statKey: "activities" },
      { group: "People", href: "/foodvisor/users", label: "Users", icon: Users, statKey: "users" },
      { group: "People", href: "/foodvisor/human-type-qa", label: "Human Type QA", icon: FileQuestion },
      { group: "People", href: "/foodvisor/human-type-surveys", label: "Human Type Surveys", icon: ClipboardList },
      { group: "People", href: "/foodvisor/risk-assessment-rules", label: "Risk Rules", icon: ShieldCheck, statKey: "riskAssessmentRules" },
      { group: "People", href: "/foodvisor/meal-logs", label: "Meal Logs", icon: BookOpen, statKey: "mealLogs" }
    ]
  },
  {
    key: "babygrow",
    label: "BabyGrow",
    href: "/babygrow",
    icon: Baby,
    items: [
      { group: null, href: "/babygrow", label: "Dashboard", icon: LayoutDashboard },
      { group: "Families", href: "/babygrow/users", label: "Caregivers", icon: Users },
      { group: "Families", href: "/babygrow/babies", label: "Babies", icon: Baby },
      { group: "Content", href: "/babygrow/activities", label: "Activities", icon: Target },
      { group: "Content", href: "/babygrow/milestones", label: "Milestones", icon: Trophy },
      { group: "Content", href: "/babygrow/recipes", label: "Recipes", icon: Salad },
      { group: "Content", href: "/babygrow/stories", label: "Stories", icon: BookText },
      { group: "Content", href: "/babygrow/guides", label: "Guides", icon: Moon }
    ]
  },
  {
    key: "height",
    label: "HeightIncrease",
    href: "/height",
    icon: Ruler,
    items: [
      { group: null, href: "/height", label: "Dashboard", icon: LayoutDashboard },
      { group: "People", href: "/height/users", label: "Users", icon: Users },
      { group: "Training", href: "/height/exercises", label: "Exercises", icon: Dumbbell },
      { group: "Training", href: "/height/training-plans", label: "Training Plans", icon: Repeat },
      { group: "Content", href: "/height/articles", label: "Articles", icon: BookOpen },
      { group: "Content", href: "/height/banners", label: "Banners", icon: Flag },
      { group: "Content", href: "/height/notifications", label: "Push campaigns", icon: Megaphone },
      { group: "Reports", href: "/height/goals", label: "Goals", icon: Target },
      { group: "Reports", href: "/height/logs", label: "Daily logs", icon: HeartPulse },
      { group: "Settings", href: "/height/settings", label: "App settings", icon: Settings }
    ]
  }
];

export function sectionFor(pathname: string): Section {
  return sections.find((section) => pathname === section.href || pathname.startsWith(`${section.href}/`)) ?? sections[0];
}

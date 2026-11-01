import type { DailyTargetResolution } from "../calculators/daily-targets.js";

/** Response shape kept identical to the legacy `/daily-targets/resolve` so the Foodvisor app parses it unchanged. */
export interface DailyTargetsResponse extends DailyTargetResolution {
  count: number;
  goals: Record<string, number | null>;
  calculation: {
    goalPriority: string[];
    unitRule: string;
    normalization: string;
  };
}

export interface DailyTargetsRequest {
  age: number;
  gender?: string;
  lifeStage?: string;
  populationGroup?: string;
  physicalActivityLevel?: string;
}

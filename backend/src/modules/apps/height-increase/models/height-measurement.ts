export interface HeightMeasurement {
  id: string;
  userId: string;
  measuredOn: string;
  heightCm: number;
  weightKg: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertHeightMeasurementInput {
  measuredOn: string;
  heightCm: number;
  weightKg?: number | null;
  notes?: string | null;
}

export interface HeightMeasurementResponse {
  id: string;
  measuredOn: string;
  heightCm: number;
  weightKg: number | null;
  notes: string | null;
}

/**
 * Observed history only. The strategy forbids promising that exercise or diet increases height,
 * so no projection or "potential height" is computed here.
 */
export interface HeightTrendResponse {
  measurements: HeightMeasurementResponse[];
  firstMeasuredOn: string | null;
  latestMeasuredOn: string | null;
  totalChangeCm: number | null;
  averageCmPerMonth: number | null;
}

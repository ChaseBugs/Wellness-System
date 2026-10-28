/**
 * Centralized message strings for API responses and errors.
 * All user-facing text lives here to keep the rest of the codebase clean.
 */
export const MSG = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  UNAUTHORIZED:       'Authentication required.',
  FORBIDDEN:          'Access denied.',

  // ─── Generic ───────────────────────────────────────────────────────────────
  NOT_FOUND:          'Resource not found.',
  INTERNAL:           'Internal server error.',
  INVALID_PARAM:      (name: string) => `Invalid parameter: ${name}`,

  // ─── Articles ──────────────────────────────────────────────────────────────
  ARTICLE_NOT_FOUND:          'Article not found.',
  ARTICLE_NOT_FOUND_OR_DENIED: 'Article not found or access denied.',
  ARTICLE_DELETED:            'Article deleted.',

  // ─── Comments ──────────────────────────────────────────────────────────────
  COMMENT_NOT_FOUND_OR_DENIED: 'Comment not found or access denied.',
  COMMENT_DELETED:            'Comment deleted.',

  // ─── Points ────────────────────────────────────────────────────────────────
  POINT_ARTICLE_SUBMIT:  'Article submission points',
  POINT_ARTICLE_LIKED:   'Article liked',
  POINT_COMMENT_SUBMIT:  'Comment submission points',
  POINT_COMMENT_LIKED:   'Comment liked',
  POINT_DOCTOR_COMMENT:  'Doctor comment points',

  // ─── Doctors ───────────────────────────────────────────────────────────────
  DOCTOR_NOT_FOUND:    'Doctor profile not found.',

  // ─── Food / Calorie ────────────────────────────────────────────────────────
  FOOD_NOT_FOUND:      'Food not found.',
  LOG_NOT_FOUND:       'Log not found or access denied.',
  LOG_DELETED:         'Intake log deleted.',
  BABY_NOT_FOUND:      'Baby not found.',

  // ─── Calorie Alerts ────────────────────────────────────────────────────────
  ALERT_LOW_CALORIES:  (pct: number) => `Low calorie intake (${pct}% of recommended)`,
  ALERT_HIGH_CALORIES: (pct: number) => `Excessive calorie intake (${pct}% of recommended)`,
  ALERT_LOW_PROTEIN:   (pct: number) => `Low protein intake (${pct}% of recommended)`,
  ALERT_LOW_IRON:      'Low iron intake — add iron-rich foods (beef, spinach, lentils).',
  ALERT_LOW_CALCIUM:   'Low calcium intake — add dairy, tofu, or broccoli.',

  // ─── Meal Labels ───────────────────────────────────────────────────────────
  MEAL_LABELS: {
    breakfast:  'Breakfast',
    lunch:      'Lunch',
    dinner:     'Dinner',
    snack:      'Snack',
    breastmilk: 'Breast Milk',
    formula:    'Formula',
  } as Record<string, string>,
} as const;

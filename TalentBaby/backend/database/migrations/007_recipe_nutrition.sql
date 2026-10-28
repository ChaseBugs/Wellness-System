-- Migration 007: Extend recipes for baby/mum meal slots and age groups

-- Extend recipes table
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS target        VARCHAR(10)  NOT NULL DEFAULT 'baby',
  ADD COLUMN IF NOT EXISTS meal_slot     VARCHAR(30),
  ADD COLUMN IF NOT EXISTS baby_age_group VARCHAR(10);

-- Daily meal plans
CREATE TABLE IF NOT EXISTS daily_meal_plans (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  baby_id     INTEGER REFERENCES babies(id) ON DELETE CASCADE,
  plan_type   VARCHAR(10) NOT NULL DEFAULT 'baby',   -- 'baby' | 'mum'
  plan_date   DATE NOT NULL,
  meal_slot   VARCHAR(30) NOT NULL,
  recipe_id   INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, baby_id, plan_type, plan_date, meal_slot)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_target        ON recipes(target);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_slot     ON recipes(meal_slot);
CREATE INDEX IF NOT EXISTS idx_recipes_age_group     ON recipes(baby_age_group);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_meal_plans(user_id, plan_date);

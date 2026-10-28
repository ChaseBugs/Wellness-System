-- Migration: Add missing tables referenced by guide, story, content topic, and recipe features
-- Run with: psql -U postgres -d talent_baby_db -f database/migrations/001_add_missing_tables.sql

-- Sleep Guides Table
CREATE TABLE IF NOT EXISTS sleep_guides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    age_min_months INTEGER NOT NULL,
    age_max_months INTEGER,
    description TEXT,
    overview TEXT,
    tips TEXT[],
    schedule_recommendations JSONB,   -- { naps: number, total_sleep_hours: string, night_sleep: string }
    common_challenges TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sleep_guides_age ON sleep_guides(age_min_months, age_max_months);

-- Feeding Guides Table
CREATE TABLE IF NOT EXISTS feeding_guides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    age_min_months INTEGER NOT NULL,
    age_max_months INTEGER,
    description TEXT,
    overview TEXT,
    tips TEXT[],
    schedule_recommendations JSONB,            -- { feedings_per_day: number, amount_per_feeding: string }
    food_introduction_timeline JSONB,          -- array of { food: string, age_months: number, notes: string }
    adequacy_assessment_questions JSONB,       -- array of { question: string, good_sign: string }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feeding_guides_age ON feeding_guides(age_min_months, age_max_months);

-- Story Categories Table
CREATE TABLE IF NOT EXISTS story_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bedtime Stories Table
CREATE TABLE IF NOT EXISTS bedtime_stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    category VARCHAR(100),
    age_min_months INTEGER,
    age_max_months INTEGER,
    audio_url TEXT,
    image_url TEXT,
    duration_minutes INTEGER,
    author VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bedtime_stories_category ON bedtime_stories(category);
CREATE INDEX IF NOT EXISTS idx_bedtime_stories_age ON bedtime_stories(age_min_months, age_max_months);

-- Story Favorites Table
CREATE TABLE IF NOT EXISTS story_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id INTEGER NOT NULL REFERENCES bedtime_stories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_story_favorites_user_id ON story_favorites(user_id);

-- Content Topics Table
CREATE TABLE IF NOT EXISTS content_topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Topic Associations Table
CREATE TABLE IF NOT EXISTS content_topic_associations (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,   -- 'article', 'story', 'activity', 'recipe'
    content_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_topic_assoc_topic ON content_topic_associations(topic_id);
CREATE INDEX IF NOT EXISTS idx_content_topic_assoc_content ON content_topic_associations(content_type, content_id);

-- Recipe Favorites Table
CREATE TABLE IF NOT EXISTS recipe_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user_id ON recipe_favorites(user_id);

-- Seed default story categories
INSERT INTO story_categories (name, description) VALUES
    ('Adventure', 'Exciting stories about exploration and discovery'),
    ('Animals', 'Stories featuring lovable animal characters'),
    ('Bedtime', 'Calming stories to help babies wind down'),
    ('Fantasy', 'Magical tales with imaginative worlds'),
    ('Family', 'Heartwarming stories about family bonds'),
    ('Nature', 'Stories that explore the natural world')
ON CONFLICT (name) DO NOTHING;

-- Seed default content topics
INSERT INTO content_topics (name, description, slug) VALUES
    ('Nutrition', 'Baby and toddler nutrition tips and recipes', 'nutrition'),
    ('Sleep', 'Sleep training, schedules, and tips', 'sleep'),
    ('Development', 'Developmental milestones and activities', 'development'),
    ('Health & Safety', 'Baby health, safety, and first aid', 'health-safety'),
    ('Feeding', 'Breastfeeding, formula, and solid foods', 'feeding'),
    ('Activities', 'Play ideas and developmental activities', 'activities'),
    ('Parenting', 'Parenting tips and advice', 'parenting'),
    ('Pregnancy', 'Pregnancy health and preparation', 'pregnancy')
ON CONFLICT (name) DO NOTHING;

-- Seed sleep guides
INSERT INTO sleep_guides (title, age_min_months, age_max_months, description, overview, tips, schedule_recommendations, common_challenges) VALUES
(
    'Newborn Sleep Guide (0-3 months)',
    0, 3,
    'Understanding newborn sleep patterns and establishing healthy habits.',
    'Newborns sleep 14-17 hours per day in 2-4 hour stretches. They cannot distinguish day from night yet.',
    ARRAY[
        'Sleep when baby sleeps to avoid exhaustion',
        'Create a safe sleep environment — firm mattress, no loose bedding',
        'Swaddling can help soothe newborns',
        'Expose baby to natural light during daytime feeds',
        'Keep nighttime interactions calm and quiet'
    ],
    '{"naps": 4, "total_sleep_hours": "14-17", "night_sleep": "Wakes every 2-3 hours", "nap_duration": "30 min - 2 hours"}'::jsonb,
    ARRAY['Night/day confusion', 'Short sleep cycles', 'Frequent night wakings']
),
(
    'Infant Sleep Guide (4-6 months)',
    4, 6,
    'Introducing sleep schedules and beginning sleep training if desired.',
    'Babies at this age can begin to sleep for longer stretches and may be ready for gentle sleep training.',
    ARRAY[
        'Establish a consistent bedtime routine',
        'Watch for sleep cues — yawning, rubbing eyes, fussiness',
        'Try putting baby down drowsy but awake',
        'Aim for an earlier bedtime (6:30-7:30 PM)',
        'Begin consolidating naps into 3 per day'
    ],
    '{"naps": 3, "total_sleep_hours": "12-16", "night_sleep": "6-8 hour stretches possible", "nap_duration": "45 min - 2 hours"}'::jsonb,
    ARRAY['4-month sleep regression', 'Nap transitions', 'Early morning waking']
),
(
    'Older Baby Sleep Guide (7-12 months)',
    7, 12,
    'Transitioning to 2 naps and maintaining healthy sleep habits.',
    'Most babies transition from 3 to 2 naps between 6-8 months and may sleep 10-12 hours overnight.',
    ARRAY[
        'Maintain a consistent sleep schedule on weekends too',
        'Create a calming bedtime routine lasting 20-30 minutes',
        'Ensure adequate daytime sleep to avoid overtiredness',
        'Transition to 2 naps when baby consistently resists the third nap',
        'Keep the sleep environment dark and cool'
    ],
    '{"naps": 2, "total_sleep_hours": "12-15", "night_sleep": "10-12 hours", "nap_duration": "1-2 hours each"}'::jsonb,
    ARRAY['8-10 month sleep regression', '2-nap transition', 'Separation anxiety']
),
(
    'Toddler Sleep Guide (12-24 months)',
    12, 24,
    'Managing the transition to one nap and toddler sleep challenges.',
    'Toddlers need 11-14 hours of sleep. Most transition to one nap between 15-18 months.',
    ARRAY[
        'Keep bedtime routine consistent and predictable',
        'Limit screen time for at least 1 hour before bed',
        'Use a white noise machine to block household sounds',
        'Offer a comfort object like a stuffed animal',
        'Watch for signs of nap readiness to drop'
    ],
    '{"naps": 1, "total_sleep_hours": "11-14", "night_sleep": "10-12 hours", "nap_duration": "1-3 hours"}'::jsonb,
    ARRAY['1-nap transition', 'Bedtime resistance', 'Night terrors', '18-month regression']
)
ON CONFLICT DO NOTHING;

-- Seed feeding guides
INSERT INTO feeding_guides (title, age_min_months, age_max_months, description, overview, tips, schedule_recommendations, food_introduction_timeline, adequacy_assessment_questions) VALUES
(
    'Newborn Feeding Guide (0-4 months)',
    0, 4,
    'Establishing breastfeeding or formula feeding with a newborn.',
    'Newborns have small stomachs and need to feed frequently. Breast milk or formula provides complete nutrition.',
    ARRAY[
        'Feed on demand — typically every 2-3 hours',
        'Look for hunger cues: rooting, sucking on hands, crying is a late cue',
        'Ensure a good latch for breastfeeding',
        'Burp baby during and after each feeding',
        'Track wet diapers as a sign of adequate intake (6+ per day)'
    ],
    '{"feedings_per_day": 8, "amount_per_feeding": "60-90 ml formula or feed until satisfied at breast", "total_daily": "480-720 ml formula"}'::jsonb,
    '[]'::jsonb,
    '[{"question": "Does baby have 6+ wet diapers per day?", "good_sign": "Yes — indicates good hydration"}, {"question": "Is baby gaining weight steadily?", "good_sign": "Yes — indicates adequate nutrition"}, {"question": "Does baby seem satisfied after feeding?", "good_sign": "Yes — not constantly crying from hunger"}]'::jsonb
),
(
    'Starting Solids Guide (4-6 months)',
    4, 6,
    'Introducing first foods alongside breast milk or formula.',
    'Around 4-6 months, babies may show signs of readiness for solids. Breast milk or formula remains the primary nutrition source.',
    ARRAY[
        'Watch for readiness signs: head control, interest in food, doubled birth weight',
        'Start with single-ingredient purees',
        'Introduce one new food at a time, waiting 3-5 days before next',
        'Never add salt, sugar, or honey to baby food',
        'Continue breast milk or formula as primary nutrition'
    ],
    '{"feedings_per_day": 5, "solid_meals_per_day": 1, "amount_per_feeding": "150-180 ml formula + 1-2 tbsp solids", "solid_portion": "1-2 teaspoons, gradually increasing"}'::jsonb,
    '[{"food": "Iron-fortified rice cereal", "age_months": 4, "notes": "Mix with breast milk or formula"}, {"food": "Pureed vegetables (sweet potato, pea)", "age_months": 5, "notes": "Start with 1-2 tsp"}, {"food": "Pureed fruits (apple, banana)", "age_months": 5, "notes": "After vegetables are established"}]'::jsonb,
    '[{"question": "Is baby still getting breast milk or formula?", "good_sign": "Yes — solids supplement, not replace"}, {"question": "Is baby accepting a variety of foods?", "good_sign": "Yes — indicates good food acceptance"}]'::jsonb
),
(
    'Growing Appetite Guide (6-9 months)',
    6, 9,
    'Expanding texture and variety as baby develops eating skills.',
    'Babies at this stage can handle lumpier textures and a wider variety of flavors. Two solid meals per day are typical.',
    ARRAY[
        'Offer a variety of vegetables, fruits, and proteins',
        'Gradually increase texture from smooth to mashed',
        'Let baby explore self-feeding with soft finger foods',
        'Offer water in a sippy cup with meals',
        'Allow baby to set the pace — never force feeding'
    ],
    '{"feedings_per_day": 4, "solid_meals_per_day": 2, "amount_per_feeding": "120-150 ml formula + 2-3 tbsp solids per meal"}'::jsonb,
    '[{"food": "Mashed legumes (lentils, beans)", "age_months": 6, "notes": "Great protein and iron source"}, {"food": "Soft meat purees (chicken, turkey)", "age_months": 7, "notes": "Well-pureed initially"}, {"food": "Egg yolk", "age_months": 8, "notes": "Well-cooked only"}]'::jsonb,
    '[{"question": "Is baby eating 2 solid meals per day?", "good_sign": "Yes — good for this age range"}, {"question": "Is baby accepting different textures?", "good_sign": "Yes — important for development"}]'::jsonb
),
(
    'Finger Foods and Family Meals (9-12 months)',
    9, 12,
    'Transitioning to three meals and joining family mealtimes.',
    'Babies are ready for small soft finger foods and can begin to join family mealtimes with modified portions.',
    ARRAY[
        'Offer soft finger foods like banana slices, cooked pasta, soft cheese',
        'Transition to 3 meals per day with 1-2 snacks',
        'Let baby try to self-feed with a spoon',
        'Offer a wide variety to prevent picky eating',
        'Avoid choking hazards: whole grapes, raw carrots, nuts'
    ],
    '{"feedings_per_day": 3, "solid_meals_per_day": 3, "amount_per_feeding": "120 ml formula + varied solids", "snacks": 2}'::jsonb,
    '[{"food": "Soft finger foods", "age_months": 9, "notes": "Small pieces, well-cooked"}, {"food": "Full egg", "age_months": 10, "notes": "Well-cooked scrambled eggs"}, {"food": "Family foods (adapted)", "age_months": 12, "notes": "No salt/sugar added"}]'::jsonb,
    '[{"question": "Is baby eating a variety of foods from all food groups?", "good_sign": "Yes — ensures balanced nutrition"}, {"question": "Is baby able to self-feed some foods?", "good_sign": "Yes — good fine motor development"}, {"question": "Is baby drinking water with meals?", "good_sign": "Yes — good hydration habit"}]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Migration: Add Guides and Bedtime Stories Tables
-- Date: 2024

-- Sleep Guides Table
CREATE TABLE IF NOT EXISTS sleep_guides (
    id SERIAL PRIMARY KEY,
    age_min_months INTEGER NOT NULL,
    age_max_months INTEGER,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tips TEXT[],
    schedule_recommendations JSONB,
    troubleshooting TEXT[],
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feeding Guides Table
CREATE TABLE IF NOT EXISTS feeding_guides (
    id SERIAL PRIMARY KEY,
    age_min_months INTEGER NOT NULL,
    age_max_months INTEGER,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tips TEXT[],
    nutrition_info JSONB,
    schedule_recommendations JSONB,
    food_introduction_timeline JSONB,
    adequacy_assessment_questions JSONB,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bedtime Stories Table
CREATE TABLE IF NOT EXISTS bedtime_stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    audio_url TEXT,
    category VARCHAR(100),
    age_min_months INTEGER,
    age_max_months INTEGER,
    duration_minutes INTEGER,
    image_url TEXT,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Categories Table
CREATE TABLE IF NOT EXISTS story_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story Favorites Table
CREATE TABLE IF NOT EXISTS story_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id INTEGER NOT NULL REFERENCES bedtime_stories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, story_id)
);

-- Content Topics Table
CREATE TABLE IF NOT EXISTS content_topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    parent_topic_id INTEGER REFERENCES content_topics(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Topic Associations (for articles, stories, activities)
CREATE TABLE IF NOT EXISTS content_topic_associations (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'article', 'story', 'activity', 'recipe'
    content_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic_id, content_type, content_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sleep_guides_age ON sleep_guides(age_min_months, age_max_months);
CREATE INDEX IF NOT EXISTS idx_feeding_guides_age ON feeding_guides(age_min_months, age_max_months);
CREATE INDEX IF NOT EXISTS idx_bedtime_stories_category ON bedtime_stories(category);
CREATE INDEX IF NOT EXISTS idx_bedtime_stories_age ON bedtime_stories(age_min_months, age_max_months);
CREATE INDEX IF NOT EXISTS idx_story_favorites_user ON story_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_content_topic_associations_topic ON content_topic_associations(topic_id);
CREATE INDEX IF NOT EXISTS idx_content_topic_associations_content ON content_topic_associations(content_type, content_id);

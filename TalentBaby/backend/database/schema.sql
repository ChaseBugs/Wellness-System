-- Talent Baby Database Schema
-- PostgreSQL Database Schema for Baby Growth Tracking and Talent Development

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    gender VARCHAR(20),
    birthdate DATE,
    profile_picture_url TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    growth_milestone_alerts BOOLEAN DEFAULT true,
    vaccination_reminders BOOLEAN DEFAULT true,
    development_milestone_alerts BOOLEAN DEFAULT true,
    health_check_reminders BOOLEAN DEFAULT true,
    photo_memories BOOLEAN DEFAULT true,
    app_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Babies table
CREATE TABLE IF NOT EXISTS babies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20),
    birth_weight_kg DECIMAL(5, 2),
    birth_height_cm DECIMAL(5, 2),
    profile_picture_url TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth records table
CREATE TABLE IF NOT EXISTS growth_records (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    age_in_days INTEGER NOT NULL,
    weight_kg DECIMAL(5, 2),
    height_cm DECIMAL(5, 2),
    head_circumference_cm DECIMAL(5, 2),
    bmi DECIMAL(4, 2),
    percentile_weight INTEGER,
    percentile_height INTEGER,
    percentile_head_circumference INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vaccination records
CREATE TABLE IF NOT EXISTS vaccinations (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    administered_date DATE,
    dose_number INTEGER,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Development milestones
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL, -- 'cognitive', 'motor', 'social', 'language'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    expected_age_range_months INTEGER,
    achieved_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Talent categories
CREATE TABLE IF NOT EXISTS talent_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Talent assessments
CREATE TABLE IF NOT EXISTS talent_assessments (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    talent_category_id INTEGER NOT NULL REFERENCES talent_categories(id),
    assessment_date DATE NOT NULL,
    age_in_months INTEGER NOT NULL,
    score INTEGER, -- 0-100
    observations TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Talent progress tracking
CREATE TABLE IF NOT EXISTS talent_progress (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    talent_category_id INTEGER NOT NULL REFERENCES talent_categories(id),
    current_level VARCHAR(50),
    progress_percentage INTEGER DEFAULT 0,
    last_activity_date DATE,
    badges_earned TEXT[], -- Array of badge names
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(baby_id, talent_category_id)
);

-- Activity library
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'stem', 'art', 'music', 'language', 'physical', 'social'
    age_range_min_months INTEGER,
    age_range_max_months INTEGER,
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20), -- 'easy', 'medium', 'hard'
    materials_needed TEXT[],
    instructions TEXT,
    learning_outcomes TEXT[],
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Baby activity assignments
CREATE TABLE IF NOT EXISTS baby_activities (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    completed_date DATE,
    completion_notes TEXT,
    rating INTEGER, -- 1-5 stars
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personalized talent missions
CREATE TABLE IF NOT EXISTS talent_missions (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    talent_category_id INTEGER NOT NULL REFERENCES talent_categories(id),
    mission_title VARCHAR(255) NOT NULL,
    mission_description TEXT,
    suggested_activities INTEGER[], -- Array of activity IDs
    start_date DATE NOT NULL,
    target_completion_date DATE,
    completed_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials library (books, toys, games, etc.)
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'book', 'toy', 'game', 'video', 'audio', 'guide'
    description TEXT,
    category VARCHAR(50),
    age_range_min_months INTEGER,
    age_range_max_months INTEGER,
    talent_categories INTEGER[], -- Array of talent_category_ids
    image_url TEXT,
    external_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Baby material recommendations
CREATE TABLE IF NOT EXISTS baby_material_recommendations (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    recommended_date DATE NOT NULL,
    reason TEXT,
    viewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memory timeline (photos, videos, notes)
CREATE TABLE IF NOT EXISTS memories (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'note', 'milestone'
    title VARCHAR(255),
    description TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    memory_date DATE NOT NULL,
    tags TEXT[], -- Array of tags like 'first_smile', 'first_steps', etc.
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth story auto-generated content
CREATE TABLE IF NOT EXISTS growth_stories (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    story_period VARCHAR(50), -- 'monthly', 'quarterly', 'yearly'
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    story_content TEXT,
    highlights TEXT[],
    milestones_achieved INTEGER[], -- Array of milestone IDs
    photos_included INTEGER[], -- Array of memory IDs
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    insight_type VARCHAR(50), -- 'talent', 'development', 'recommendation'
    title VARCHAR(255),
    content TEXT,
    related_talent_category_id INTEGER REFERENCES talent_categories(id),
    related_activity_ids INTEGER[],
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_babies_user_id ON babies(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_baby_id ON growth_records(baby_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_record_date ON growth_records(record_date);
CREATE INDEX IF NOT EXISTS idx_milestones_baby_id ON milestones(baby_id);
CREATE INDEX IF NOT EXISTS idx_talent_assessments_baby_id ON talent_assessments(baby_id);
CREATE INDEX IF NOT EXISTS idx_talent_progress_baby_id ON talent_progress(baby_id);
CREATE INDEX IF NOT EXISTS idx_memories_baby_id ON memories(baby_id);
CREATE INDEX IF NOT EXISTS idx_memories_memory_date ON memories(memory_date);
CREATE INDEX IF NOT EXISTS idx_baby_activities_baby_id ON baby_activities(baby_id);
CREATE INDEX IF NOT EXISTS idx_activities_age_range ON activities(age_range_min_months, age_range_max_months);

-- Daily Tracker Tables (Feeding, Sleep, Diaper)
-- Feeding records
CREATE TABLE IF NOT EXISTS feedings (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    feeding_type VARCHAR(50) NOT NULL, -- 'breastfeeding', 'formula', 'solid', 'mixed'
    feeding_date TIMESTAMP NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    amount_ml DECIMAL(6, 2), -- For formula/solids
    amount_oz DECIMAL(6, 2), -- Alternative unit
    side VARCHAR(20), -- 'left', 'right', 'both' for breastfeeding
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sleep sessions
CREATE TABLE IF NOT EXISTS sleep_sessions (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    sleep_type VARCHAR(50) NOT NULL, -- 'nap', 'night', 'bedtime'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    quality_rating INTEGER, -- 1-5
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diaper changes
CREATE TABLE IF NOT EXISTS diaper_changes (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    change_time TIMESTAMP NOT NULL,
    diaper_type VARCHAR(20) NOT NULL, -- 'wet', 'dirty', 'both'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Associations
-- Milestone videos (many-to-many)
CREATE TABLE IF NOT EXISTS milestone_videos (
    id SERIAL PRIMARY KEY,
    milestone_id INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(milestone_id, memory_id)
);

-- Activity videos (many-to-many)
CREATE TABLE IF NOT EXISTS activity_videos (
    id SERIAL PRIMARY KEY,
    baby_activity_id INTEGER NOT NULL REFERENCES baby_activities(id) ON DELETE CASCADE,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(baby_activity_id, memory_id)
);

-- Activities video_url for video guides
ALTER TABLE activities ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Pregnancy Tracking Tables
-- Pregnancy profiles
CREATE TABLE IF NOT EXISTS pregnancies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    lmp_date DATE, -- Last Menstrual Period
    conception_date DATE,
    ultrasound_date DATE,
    current_week INTEGER,
    current_day INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pregnancy weeks content (week-by-week information)
CREATE TABLE IF NOT EXISTS pregnancy_weeks (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    fetal_development TEXT,
    baby_size VARCHAR(100),
    baby_weight VARCHAR(100),
    body_changes TEXT,
    symptoms TEXT[],
    tips TEXT[],
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bump photos (belly photo diary)
CREATE TABLE IF NOT EXISTS bump_photos (
    id SERIAL PRIMARY KEY,
    pregnancy_id INTEGER NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    week_number INTEGER NOT NULL,
    photo_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pregnancy symptoms
CREATE TABLE IF NOT EXISTS pregnancy_symptoms (
    id SERIAL PRIMARY KEY,
    pregnancy_id INTEGER NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    symptom_date DATE NOT NULL,
    symptom_type VARCHAR(50) NOT NULL, -- 'nausea', 'fatigue', 'mood', 'pain', 'cravings', etc.
    severity INTEGER, -- 1-5
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kick counting sessions
CREATE TABLE IF NOT EXISTS kick_sessions (
    id SERIAL PRIMARY KEY,
    pregnancy_id INTEGER NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    session_date TIMESTAMP NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    kick_count INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractions
CREATE TABLE IF NOT EXISTS contractions (
    id SERIAL PRIMARY KEY,
    pregnancy_id INTEGER NOT NULL REFERENCES pregnancies(id) ON DELETE CASCADE,
    contraction_time TIMESTAMP NOT NULL,
    duration_seconds INTEGER,
    intensity INTEGER, -- 1-10
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments (Pregnancy Calendar)
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    baby_id INTEGER REFERENCES babies(id) ON DELETE CASCADE,
    pregnancy_id INTEGER REFERENCES pregnancies(id) ON DELETE CASCADE,
    appointment_type VARCHAR(50), -- 'doctor', 'ultrasound', 'test', 'other'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Plans & Updates
-- Daily activity plans
CREATE TABLE IF NOT EXISTS daily_plans (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    activities INTEGER[], -- Array of activity IDs
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(baby_id, plan_date)
);

-- Daily updates content
CREATE TABLE IF NOT EXISTS daily_updates_content (
    id SERIAL PRIMARY KEY,
    age_in_months INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'tip', 'development', 'activity', 'safety'
    title VARCHAR(255),
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
    id SERIAL PRIMARY KEY,
    talent_category_id INTEGER NOT NULL REFERENCES talent_categories(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- 'multiple_choice', 'scale', 'yes_no', 'text'
    options JSONB, -- For multiple choice questions
    age_range_min_months INTEGER,
    age_range_max_months INTEGER,
    weight INTEGER DEFAULT 1, -- Question weight for scoring
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES talent_assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES assessment_questions(id),
    answer_value TEXT, -- Can be text, number, or JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    baby_id INTEGER REFERENCES babies(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL, -- 'feeding', 'sleep', 'diaper', 'appointment', 'vaccination', 'activity', 'custom'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_time TIME NOT NULL,
    reminder_date DATE,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'custom'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Library
-- Articles
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50), -- 'pregnancy', 'baby_care', 'development', 'health', 'nutrition', etc.
    author VARCHAR(255),
    image_url TEXT,
    video_url TEXT,
    reading_time_minutes INTEGER,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article bookmarks
CREATE TABLE IF NOT EXISTS article_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- Article reading history
CREATE TABLE IF NOT EXISTS article_reading_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pregnancy Workouts
CREATE TABLE IF NOT EXISTS pregnancy_workouts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trimester INTEGER NOT NULL, -- 1, 2, or 3
    duration_minutes INTEGER,
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    video_url TEXT,
    thumbnail_url TEXT,
    instructions TEXT,
    benefits TEXT[],
    precautions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition Guides
CREATE TABLE IF NOT EXISTS nutrition_guides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trimester INTEGER NOT NULL, -- 1, 2, or 3
    content TEXT NOT NULL,
    meal_suggestions TEXT[],
    recipes TEXT[],
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Baby Food Recipes (Daily Food Recipe Tips)
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    age_range_min_months INTEGER NOT NULL,
    age_range_max_months INTEGER NOT NULL,
    recipe_type VARCHAR(50) NOT NULL, -- 'puree', 'finger_food', 'snack', 'meal'
    ingredients TEXT[] NOT NULL,
    instructions TEXT[] NOT NULL,
    nutrition_info JSONB,
    prep_time_minutes INTEGER,
    cooking_time_minutes INTEGER,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expert Classes
CREATE TABLE IF NOT EXISTS expert_classes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_name VARCHAR(255),
    class_type VARCHAR(50) NOT NULL, -- 'live', 'on_demand'
    scheduled_time TIMESTAMP, -- For live classes
    video_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    category VARCHAR(50), -- 'sleep', 'feeding', 'development', 'safety', etc.
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES expert_classes(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, class_id)
);

-- Baby Registry
CREATE TABLE IF NOT EXISTS registries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    baby_id INTEGER REFERENCES babies(id) ON DELETE CASCADE,
    registry_name VARCHAR(255) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    share_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registry items
CREATE TABLE IF NOT EXISTS registry_items (
    id SERIAL PRIMARY KEY,
    registry_id INTEGER NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materials(id),
    custom_item_name VARCHAR(255),
    custom_item_description TEXT,
    quantity INTEGER DEFAULT 1,
    purchased BOOLEAN DEFAULT false,
    purchased_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklists
CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checklist_type VARCHAR(50) NOT NULL, -- 'hospital_bag', 'birth_plan', 'custom'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist items
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    item_text VARCHAR(255) NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    item_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Birth Plans
CREATE TABLE IF NOT EXISTS birth_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pregnancy_id INTEGER REFERENCES pregnancies(id) ON DELETE CASCADE,
    plan_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Features
-- Birth clubs
CREATE TABLE IF NOT EXISTS birth_clubs (
    id SERIAL PRIMARY KEY,
    birth_month INTEGER NOT NULL, -- 1-12
    birth_year INTEGER NOT NULL,
    club_name VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Birth club memberships
CREATE TABLE IF NOT EXISTS birth_club_memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    birth_club_id INTEGER NOT NULL REFERENCES birth_clubs(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, birth_club_id)
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    birth_club_id INTEGER REFERENCES birth_clubs(id) ON DELETE CASCADE,
    post_type VARCHAR(50) DEFAULT 'discussion', -- 'discussion', 'question', 'experience', 'advice'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Private messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family Sharing
-- Family members
CREATE TABLE IF NOT EXISTS family_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    member_email VARCHAR(255) NOT NULL,
    member_name VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
    invitation_token VARCHAR(255) UNIQUE,
    is_accepted BOOLEAN DEFAULT false,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP
);

-- Video sharing
CREATE TABLE IF NOT EXISTS video_shares (
    id SERIAL PRIMARY KEY,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    shared_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    share_type VARCHAR(50) DEFAULT 'link', -- 'link', 'family', 'public'
    expires_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video tags
CREATE TABLE IF NOT EXISTS video_tags (
    id SERIAL PRIMARY KEY,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(memory_id, tag_name)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- 'free', 'premium', 'family'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    start_date DATE NOT NULL,
    end_date DATE,
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', etc.
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Insights (enhance existing)
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3, 2);
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS source VARCHAR(50); -- 'assessment', 'video_analysis', 'pattern_recognition'

-- Video metadata
ALTER TABLE memories ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS video_file_size_bytes BIGINT;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS video_format VARCHAR(20);
ALTER TABLE memories ADD COLUMN IF NOT EXISTS video_resolution VARCHAR(20);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_feedings_baby_id ON feedings(baby_id);
CREATE INDEX IF NOT EXISTS idx_feedings_feeding_date ON feedings(feeding_date);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_baby_id ON sleep_sessions(baby_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_start_time ON sleep_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_diaper_changes_baby_id ON diaper_changes(baby_id);
CREATE INDEX IF NOT EXISTS idx_diaper_changes_change_time ON diaper_changes(change_time);
CREATE INDEX IF NOT EXISTS idx_pregnancies_user_id ON pregnancies(user_id);
CREATE INDEX IF NOT EXISTS idx_bump_photos_pregnancy_id ON bump_photos(pregnancy_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_baby_id ON daily_plans(baby_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_plan_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_birth_club_id ON community_posts(birth_club_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- User action logs table
CREATE TABLE IF NOT EXISTS user_action_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create_baby', 'update_profile', 'delete_record', etc.
    action_description TEXT,
    resource_type VARCHAR(50), -- 'baby', 'feeding', 'milestone', 'activity', etc.
    resource_id INTEGER,
    ip_address VARCHAR(45), -- IPv6 compatible
    user_agent TEXT,
    request_method VARCHAR(10), -- 'GET', 'POST', 'PUT', 'DELETE'
    request_path VARCHAR(255),
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB, -- Additional data in JSON format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user action logs
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user_id ON user_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_action_type ON user_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_created_at ON user_action_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_resource ON user_action_logs(resource_type, resource_id);

-- Insert default talent categories
INSERT INTO talent_categories (name, description) VALUES
    ('Creativity', 'Artistic expression, imagination, and creative thinking'),
    ('Music Sensitivity', 'Musical awareness, rhythm, and sound recognition'),
    ('Logical Thinking', 'Problem-solving, pattern recognition, and analytical skills'),
    ('Language Ability', 'Communication, vocabulary, and linguistic skills'),
    ('Physical Coordination', 'Motor skills, balance, and physical dexterity'),
    ('Social Leadership', 'Social interaction, empathy, and leadership qualities'),
    ('Curiosity & Problem-Solving', 'Inquisitiveness, exploration, and critical thinking')
ON CONFLICT (name) DO NOTHING;

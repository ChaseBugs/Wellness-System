-- Migration 002: User Articles, Points, Doctor Profiles
-- Submit user articles / point / doctor water system

-- 1. Add role column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
-- roles: 'user', 'doctor', 'admin'

-- 2. User submitted articles (Submit user articles)
CREATE TABLE IF NOT EXISTS user_articles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general', -- 'general', 'parenting', 'nutrition', 'health', 'development', 'experience'
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    status VARCHAR(20) DEFAULT 'published', -- 'draft', 'published', 'hidden'
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Article comments & replies (Article Reply Table — parent_idReply support with)
CREATE TABLE IF NOT EXISTS user_article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES user_articles(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES user_article_comments(id) ON DELETE CASCADE, -- NULL = top-level comment
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_doctor_comment BOOLEAN DEFAULT false, -- Indicate if completed by a physician
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Article likes
CREATE TABLE IF NOT EXISTS user_article_likes (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES user_articles(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id)
);

-- 5. Comment likes
CREATE TABLE IF NOT EXISTS user_article_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES user_article_comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- 6. User points balance (points balance)
CREATE TABLE IF NOT EXISTS user_points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Point transaction history (Points Details)
CREATE TABLE IF NOT EXISTS user_point_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,            -- positive = earn, negative = spend
    reason VARCHAR(100) NOT NULL,       -- 'article_submit', 'article_liked', 'comment_submit', 'comment_liked'
    reference_id INTEGER,               -- article or comment id
    reference_type VARCHAR(50),         -- 'article', 'comment'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Doctor profiles (doctor level)
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    specialty VARCHAR(100) NOT NULL,    -- 'pediatrics', 'obstetrics and gynecology', 'neonatology', 'Department of Pediatrics and Adolescents' etc.
    license_number VARCHAR(100),
    hospital VARCHAR(255),
    grade VARCHAR(50) NOT NULL DEFAULT 'intern',
    -- grade levels: 'intern'(1), 'resident'(2), 'specialist'(3), 'professor'(4), 'honorary doctor'(5)
    grade_level INTEGER DEFAULT 1 CHECK (grade_level BETWEEN 1 AND 5),
    bio TEXT,
    verified BOOLEAN DEFAULT false,     -- admin Verification?
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_articles_user_id ON user_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_articles_status ON user_articles(status);
CREATE INDEX IF NOT EXISTS idx_user_articles_category ON user_articles(category);
CREATE INDEX IF NOT EXISTS idx_user_articles_created_at ON user_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_article_comments_article_id ON user_article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_user_article_comments_parent_id ON user_article_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_point_history_user_id ON user_point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_grade_level ON doctor_profiles(grade_level);

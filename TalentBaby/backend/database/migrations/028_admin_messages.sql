-- Migration 028: Admin Messages (replaces Admin Articles concept)
-- Admin Messages are push-style announcements from admin to users.

CREATE TABLE IF NOT EXISTS admin_messages (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255)  NOT NULL,
    body          TEXT          NOT NULL,
    type          VARCHAR(50)   NOT NULL DEFAULT 'announcement', -- announcement | alert | tip | update
    priority      VARCHAR(20)   NOT NULL DEFAULT 'normal',       -- low | normal | high | urgent
    target_role   VARCHAR(20)   NOT NULL DEFAULT 'all',          -- all | user | doctor | agent
    is_published  BOOLEAN       NOT NULL DEFAULT false,
    published_at  TIMESTAMP,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_messages_published   ON admin_messages (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_target_role ON admin_messages (target_role);

-- Seed a few example messages
INSERT INTO admin_messages (title, body, type, priority, target_role, is_published, published_at) VALUES
  ('Welcome to Talent Baby!',
   'Thank you for joining Talent Baby. Track your baby''s milestones, discover daily activities, and connect with expert advice — all in one place.',
   'announcement', 'high', 'all', true, CURRENT_TIMESTAMP),

  ('New Milestone Tracking Feature',
   'You can now track your baby''s developmental milestones month by month. Head to the Milestones tab to get started!',
   'update', 'normal', 'user', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),

  ('Tips for Better Sleep',
   'Establishing a consistent bedtime routine can improve your baby''s sleep quality. Try our curated sleep tips in the Tips section.',
   'tip', 'normal', 'all', true, CURRENT_TIMESTAMP - INTERVAL '5 days'),

  ('App Maintenance Notice',
   'Scheduled maintenance on Saturday 2:00 AM – 4:00 AM KST. The app may be briefly unavailable. We apologize for any inconvenience.',
   'alert', 'urgent', 'all', false, NULL),

  ('Doctor-Verified Content Now Available',
   'All activities and articles marked with a ✓ badge have been reviewed and verified by licensed pediatric specialists.',
   'announcement', 'normal', 'all', true, CURRENT_TIMESTAMP - INTERVAL '7 days');

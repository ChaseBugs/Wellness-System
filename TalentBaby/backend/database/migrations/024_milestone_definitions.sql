-- Migration 024: Milestone Definitions library + Baby Milestone tracking
-- Replaces the old baby-specific milestones table with a proper two-table design:
--   milestone_definitions  → content library (per month, per type)
--   baby_milestones        → per-baby progress records (yes/no/almost)

-- ─── Milestone Definitions (content library) ────────────────────────────────

CREATE TABLE IF NOT EXISTS milestone_definitions (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 72),
    milestone_type VARCHAR(50) NOT NULL
        CHECK (milestone_type IN ('physical', 'cognitive', 'communication', 'social_emotional')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    question TEXT,                        -- parent-facing yes/no/almost question
    related_activity VARCHAR(255),        -- activity name linked to this milestone
    display_order INTEGER NOT NULL DEFAULT 0,
    doctor_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milestone_definitions_month ON milestone_definitions(month);
CREATE INDEX IF NOT EXISTS idx_milestone_definitions_type  ON milestone_definitions(milestone_type);

-- ─── Baby Milestones (tracking table) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS baby_milestones (
    id SERIAL PRIMARY KEY,
    baby_id INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    milestone_definition_id INTEGER NOT NULL REFERENCES milestone_definitions(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('yes', 'no', 'almost')),
    achieved_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(baby_id, milestone_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_baby_milestones_baby_id ON baby_milestones(baby_id);
CREATE INDEX IF NOT EXISTS idx_baby_milestones_def_id  ON baby_milestones(milestone_definition_id);

-- ─── Seed: Month 2 Milestones (4 per type = 16 rows) ────────────────────────

INSERT INTO milestone_definitions (month, milestone_type, title, description, question, related_activity, display_order) VALUES

-- PHYSICAL
(2, 'physical',
 'Random hand and feet movement',
 'Moves hands and feet up and down but mostly in a random manner.',
 'Does your baby move their hands and feet up and down in a random manner?',
 'Hand And Arms', 1),

(2, 'physical',
 'Brief head control attempt',
 'Tries to maintain head upright for a few seconds but head control is still weak.',
 'Does your baby try to hold their head upright for a few seconds?',
 'Tummy Time L1', 2),

(2, 'physical',
 'Face gazing with interest',
 'Stares and observes faces close to them with interest.',
 'Does your baby stare and observe faces held close to them?',
 'Eye Focus', 3),

(2, 'physical',
 'Horizontal eye tracking',
 'Starts to develop eye control by tracking the horizontal movement of a toy in front.',
 'Does your baby track a toy moving horizontally in front of them?',
 'Eye Focus', 4),

-- COGNITIVE
(2, 'cognitive',
 'Air sensation response',
 'Responds to the sensation of air on body parts.',
 'Does your baby react when air is blown on their body?',
 'Tactile Sense', 1),

(2, 'cognitive',
 'Plantar reflex',
 'Demonstrates Plantar Reflex by extending their toe when you slide a finger down the baby''s foot from the toe to the heel. On doing a heel to toe slide, baby curls their toes.',
 'Does your baby curl their toes when you slide a finger along the sole of their foot?',
 'Plantar Reflex', 2),

(2, 'cognitive',
 'High-contrast pattern preference',
 'Prefers black-and-white or high-contrast patterns when placed close enough to see.',
 'Does your baby show interest in black-and-white or high-contrast patterns?',
 'Checkerboard', 3),

(2, 'cognitive',
 'Moro reflex',
 'Demonstrates the Moro Reflex by extending hands and legs when you place them from the lap to a soft surface - a nervous system response.',
 'Does your baby extend hands and legs suddenly when lowered onto a soft surface?',
 'Moro Reflex', 4),

-- COMMUNICATION
(2, 'communication',
 'Voice pitch differentiation',
 'Able to differentiate voice pitch, tone, rhythm, and shows excitement by moving hands and legs.',
 'Does your baby show excitement (moving hands/legs) in response to different voice tones?',
 'Recognizing Voices', 1),

(2, 'communication',
 'Sound localization with eyes',
 'Follows the sound of a sound-making toy by moving eyes towards it, when held on the slight left or right side of the face.',
 'Does your baby move their eyes toward a sound-making toy held to the side of their face?',
 'Responding To Sound', 2),

(2, 'communication',
 'Cooing vowel sounds',
 'Makes cooing sounds that are similar to vowel sounds.',
 'Does your baby make cooing or vowel-like sounds?',
 NULL, 3),

(2, 'communication',
 'Sound and music preference',
 'Starts to show a preference for particular sounds, rhymes, songs, etc. by showing excitement or by calming down to pay attention when they are played.',
 'Does your baby calm down or show excitement when a favourite song or sound is played?',
 'Music', 4),

-- SOCIAL & EMOTIONAL
(2, 'social_emotional',
 'Face-touch excitement and grip',
 'Shows excitement while touching your face when you take it close to their hands and tries to grip on occasions.',
 'Does your baby show excitement and try to grip when your face is brought close to their hands?',
 NULL, 1),

(2, 'social_emotional',
 'Response to soft speech and touch',
 'Responds positively to soft speech and enjoys physical touch and body movements.',
 'Does your baby respond positively to a soft voice and gentle physical touch?',
 'Love Her/Him', 2),

(2, 'social_emotional',
 'Recognizing familiar faces',
 'Starts to recognize parents and other people that are frequently present.',
 'Does your baby start to recognize parents or people they see regularly?',
 'Introducing New People', 3),

(2, 'social_emotional',
 'Preference for primary caregiver',
 'Starts to show a preference for parents for comfort while crying, especially someone who spends more time communicating and engaging with the baby.',
 'Does your baby prefer their primary caregiver when seeking comfort while crying?',
 'Introducing New People', 4);

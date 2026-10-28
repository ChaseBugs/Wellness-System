-- Migration 025: Seed 20 additional milestone definitions
-- Covers months 3, 4, 6, 9 — 5 milestones per month across all 4 types
-- doctor_verified = false for all rows (set true only when a verified doctor user reviews)

-- ─── Month 3 (5 milestones) ──────────────────────────────────────────────────

INSERT INTO milestone_definitions
  (month, milestone_type, title, description, question, related_activity, display_order, doctor_verified)
VALUES

-- PHYSICAL
(3, 'physical',
 'Pushes up on arms during tummy time',
 'When placed on tummy, baby begins to push chest up off the floor using both arms.',
 'Does your baby push up on their arms during tummy time?',
 'Tummy Time L2', 1, false),

(3, 'physical',
 'Kicks legs vigorously',
 'Kicks legs alternately and forcefully when lying on back, showing growing leg muscle strength.',
 'Does your baby kick their legs vigorously when lying on their back?',
 'Leg Stretch', 2, false),

-- COGNITIVE
(3, 'cognitive',
 'Smooth eye tracking',
 'Follows a moving object or face in a full arc from one side to the other with smooth, coordinated eye movement.',
 'Can your baby follow a slowly moving object smoothly from side to side with their eyes?',
 'Eye Focus', 1, false),

-- COMMUNICATION
(3, 'communication',
 'Social smile',
 'Smiles spontaneously in response to a familiar face or voice, not just due to gas or reflex.',
 'Does your baby smile back when you smile or talk to them?',
 'Recognizing Voices', 1, false),

-- SOCIAL & EMOTIONAL
(3, 'social_emotional',
 'Shows excitement at familiar caregiver',
 'Reacts with visible excitement — waving arms, kicking legs, or vocalising — when a familiar caregiver approaches.',
 'Does your baby show whole-body excitement when they see you approaching?',
 'Love Her/Him', 1, false),

-- ─── Month 4 (5 milestones) ──────────────────────────────────────────────────

-- PHYSICAL
(4, 'physical',
 'Steady head control',
 'Holds head upright and steady without bobbing when held in a sitting or upright position.',
 'Can your baby hold their head steady without support when held upright?',
 'Tummy Time L2', 1, false),

-- COGNITIVE
(4, 'cognitive',
 'Explores objects with hands and mouth',
 'Brings objects or hands to mouth intentionally and mouths them to explore texture and shape.',
 'Does your baby bring objects or their hands to their mouth to explore them?',
 'Grasping Objects', 1, false),

(4, 'cognitive',
 'Responds to colourful objects',
 'Shows a noticeable preference for brightly coloured objects over plain ones, tracking them with eyes.',
 'Does your baby seem more interested in brightly coloured objects than plain ones?',
 'Colour Recognition', 2, false),

-- COMMUNICATION
(4, 'communication',
 'Laughs out loud',
 'Produces a clear, audible laugh in response to tickling, a funny face, or playful interaction.',
 'Does your baby laugh out loud in response to play or funny faces?',
 NULL, 1, false),

-- SOCIAL & EMOTIONAL
(4, 'social_emotional',
 'Enjoys social play',
 'Actively enjoys interaction — makes eye contact, smiles, and vocalises to maintain a social exchange.',
 'Does your baby seem to enjoy playing and interacting with you, maintaining eye contact and smiling?',
 'Introducing New People', 1, false),

-- ─── Month 6 (5 milestones) ──────────────────────────────────────────────────

-- PHYSICAL
(6, 'physical',
 'Rolls from back to tummy',
 'Rolls over from back to tummy independently using core and arm muscles.',
 'Can your baby roll from their back onto their tummy on their own?',
 'Rolling Over', 1, false),

(6, 'physical',
 'Sits with minimal support',
 'Sits upright for several seconds when placed, using hands for balance or with only light support at hips.',
 'Can your baby sit upright for a few seconds with minimal support?',
 'Sitting Up', 2, false),

-- COGNITIVE
(6, 'cognitive',
 'Passes objects between hands',
 'Deliberately transfers an object from one hand to the other, showing improved hand-eye coordination.',
 'Does your baby pass a toy or object from one hand to the other?',
 'Grasping Objects', 1, false),

-- COMMUNICATION
(6, 'communication',
 'Responds to own name',
 'Turns head or looks up when their name is called from across the room.',
 'Does your baby turn or look toward you when you call their name?',
 'Recognizing Voices', 1, false),

-- SOCIAL & EMOTIONAL
(6, 'social_emotional',
 'Stranger awareness begins',
 'Shows awareness of unfamiliar faces — may stare, become quiet, or show mild wariness with strangers.',
 'Does your baby react differently to unfamiliar people compared to family members?',
 'Introducing New People', 1, false),

-- ─── Month 9 (5 milestones) ──────────────────────────────────────────────────

-- PHYSICAL
(9, 'physical',
 'Pulls to stand with support',
 'Grabs onto furniture or a caregiver''s hands and pulls themselves up to a standing position.',
 'Does your baby pull themselves up to standing using furniture or your hands?',
 'Standing Up', 1, false),

-- COGNITIVE
(9, 'cognitive',
 'Object permanence',
 'Understands that a hidden object still exists — looks for a toy that has been covered or moved out of sight.',
 'Does your baby look for a toy that you have hidden or covered up?',
 'Hide And Seek', 1, false),

-- COMMUNICATION
(9, 'communication',
 'Uses "mama" or "dada" without meaning',
 'Babbles strings of syllables like "mamama" or "dadada" without specifically directing them at a parent.',
 'Does your baby babble strings of sounds like "mamama" or "dadada"?',
 NULL, 1, false),

(9, 'communication',
 'Waves bye-bye',
 'Waves hand in response to "bye-bye" or imitates waving when prompted.',
 'Does your baby wave their hand when you say "bye-bye"?',
 'Gesture Recognition', 2, false),

-- SOCIAL & EMOTIONAL
(9, 'social_emotional',
 'Separation anxiety appears',
 'Shows distress or cries when a primary caregiver leaves the room, reflecting attachment development.',
 'Does your baby cry or seem upset when you leave the room?',
 'Love Her/Him', 1, false);

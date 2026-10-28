-- Migration 019: Extend month 6 activities extracted from UI screenshots (babyG)
-- These activities were previously seeded at month_min=7; screenshots confirm they
-- also appear at month 6, so we lower month_min to 6.

UPDATE activities SET month_min = 6
WHERE title IN (
  'Book Trick',
  'Tongue Movements',
  'Walking On Legs',
  'Shoulder And Arms Lift',
  'Babble Talks',
  'Object Permanence 2',
  'Roll Over',
  'Sounds Of Nature',
  'Face Down To Face Up',
  'Tilt Balance',
  'Building Vocabulary L1',
  'Sitting Up',
  'Rhyme & Dance',
  'Object Permanence 1',
  'Fixing Eyesight',
  'Controlling Sound',
  'Back Muscle Stretch',
  'Sitting Practice',
  'Rolling 360',
  'Mirror 2',
  'Recognising Name',
  'Hand Eye Coordination',
  'Roly Poly Toy',
  'Grasping Small Objects',
  'Say Goodbye'
)
AND month_min = 7;

-- 'Explore Surroundings' has two rows; update only the month-7 one
UPDATE activities SET month_min = 6
WHERE title = 'Explore Surroundings'
  AND month_min = 7
  AND sub_category = 'Social Skills & Awareness';

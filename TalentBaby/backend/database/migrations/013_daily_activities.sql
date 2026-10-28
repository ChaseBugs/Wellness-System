-- Migration 013: Daily activity selection + seed activities from UI screenshots

-- ─── Table: baby_daily_activities ─────────────────────────────────────────────
-- Stores the 4 activities selected for a baby on a specific date.
-- Regenerated if the baby's age moves to a new month group.

CREATE TABLE IF NOT EXISTS baby_daily_activities (
  id            SERIAL PRIMARY KEY,
  baby_id       INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  plan_date     DATE    NOT NULL,
  activity_id   INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  slot          SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 4),  -- 1..4
  is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (baby_id, plan_date, slot)
);

CREATE INDEX IF NOT EXISTS idx_bda_baby_date ON baby_daily_activities(baby_id, plan_date);

-- ─── Seed: activities extracted from UI screenshots (months 1-3) ──────────────
-- Sub-categories seen in screenshots that may not match existing seeded ones

INSERT INTO activities
  (title, description, category, sub_category,
   month_min, month_max, duration_minutes, difficulty_level,
   benefits, frequency, materials_needed, instructions,
   done_count, is_premium)
VALUES
-- Source Of Sound  (Memory and Attention, 5 min, 10328 done)
('Source Of Sound',
 'Shake a rattle or squeeze a toy just out of baby''s line of sight. Watch as baby turns their head to locate the sound source. This builds auditory tracking and early cause-and-effect understanding.',
 'cognitive', 'Memory and Attention',
 1, 3, 5, 'easy',
 ARRAY['Improves auditory tracking','Builds cause-and-effect awareness','Strengthens neck muscles','Enhances sound discrimination'],
 'Daily, 2-3 times',
 ARRAY['Rattle or squeaky toy'],
 'Lay baby on their back. Hold a rattle to one side and shake it gently. Wait for baby to turn toward the sound. Repeat on the other side. Praise every response with a smile and a gentle voice.',
 10328, false),

-- The Touch  (Sensory Play, 5 min, 5458 done)
('The Touch',
 'Gently stroke baby''s skin with a soft feather or smooth fabric. Introduce different textures to stimulate the sense of touch and build early sensory awareness.',
 'physical', 'Sensory Play',
 1, 3, 5, 'easy',
 ARRAY['Stimulates tactile nerve development','Promotes relaxation','Builds sensory awareness','Strengthens parent-baby bond'],
 'Daily',
 ARRAY['Soft feather','Smooth fabric swatch','Soft brush'],
 'Lay baby comfortably. Slowly stroke the feather or fabric along baby''s arm, leg, or cheek. Watch baby''s reactions — smiles mean they love it! Introduce a new texture each session.',
 5458, false),

-- Tactile Sense 2  (Sensory Play, 5 min, 5340 done)
('Tactile Sense 2',
 'Introduce a crinkly toy or textured cloth for baby to feel with their hands. This multi-texture sensory session builds fine motor awareness and tactile discrimination.',
 'physical', 'Sensory Play',
 1, 3, 5, 'easy',
 ARRAY['Develops fine motor awareness','Improves tactile discrimination','Encourages hand exploration','Builds sensory processing skills'],
 'Daily',
 ARRAY['Crinkle toy','Textured cloth','Soft sponge'],
 'Place the crinkle toy in baby''s hand or near their fingers. Gently guide their hand to touch different textures. Describe each one with simple words like "soft", "bumpy", "crinkly".',
 5340, false),

-- Eye Movement  (Hand-Eye-Spatial, 5 min, 6245 done)
('Eye Movement',
 'Hold a brightly coloured toy about 20–30 cm from baby''s face and move it slowly left, right, up and down. This trains smooth eye tracking and builds early visual coordination.',
 'physical', 'Hand-Eye-Spatial',
 1, 3, 5, 'easy',
 ARRAY['Strengthens eye muscles','Improves visual tracking','Builds spatial awareness','Prepares foundation for reading'],
 'Daily, 2-3 times',
 ARRAY['Brightly coloured toy or ball'],
 'Hold the toy directly in front of baby at arm''s length. Wait until baby focuses. Move it slowly to the left — pause — then to the right. Then up and down. Keep movements slow and steady.',
 6245, false),

-- Speaking Differently  (Speech Development, 5 min, 4167 done)
('Speaking Differently',
 'Change the pitch, speed and tone of your voice while talking to baby. Use a whisper, a sing-song voice, and an excited voice in turns. This helps baby distinguish speech sounds.',
 'communication', 'Speech Development',
 1, 3, 5, 'easy',
 ARRAY['Builds phonological awareness','Stimulates language centres in the brain','Encourages cooing and babbling','Strengthens listening skills'],
 'As and when you can',
 ARRAY['Nothing — just your voice'],
 'Face baby and get their attention. Start with your normal voice, then switch to a whisper. Then try a high sing-song voice. Pause after each to give baby time to respond with coos or expressions.',
 4167, false),

-- Body Positioning  (Gross Motor, 4213 done)
('Body Positioning',
 'Gently guide baby through different body positions — on their back, side, and tummy — to build body awareness and strengthen core muscles.',
 'physical', 'Gross Motor',
 1, 3, 10, 'easy',
 ARRAY['Strengthens core muscles','Builds body awareness','Develops postural control','Prepares for rolling'],
 'Daily',
 ARRAY['Firm padded surface','Small rolled towel for support'],
 'Start with baby on their back. Slowly roll them onto their side with support, hold for 30 seconds. Bring them back, then gently guide them onto their tummy. Always support the head.',
 4213, true),

-- Tracking Sound  (Sound, 3623 done)
('Tracking Sound',
 'Use a bell or soft musical toy to teach baby to track sound as it moves around them. Builds directional hearing and auditory attention.',
 'communication', 'Sound',
 1, 3, 8, 'easy',
 ARRAY['Develops directional hearing','Improves auditory attention','Stimulates neural pathways','Encourages head control'],
 'Daily',
 ARRAY['Small bell or soft musical toy'],
 'Hold the bell above baby, then ring it softly. Slowly move it to the right — wait for baby to follow. Then move it left. Gradually increase the arc of movement as baby improves.',
 3623, true),

-- Head Lift L2  (Gross Motor, 3486 done)
('Head Lift L2',
 'During tummy time, hold a colourful toy just above baby''s eye level to encourage them to lift their head higher and for longer.',
 'physical', 'Gross Motor',
 1, 3, 5, 'medium',
 ARRAY['Strengthens neck and shoulder muscles','Improves head control','Builds foundation for crawling','Develops upper body strength'],
 'Daily, 2-3 times',
 ARRAY['Colourful toy or card'],
 'Place baby on their tummy on a firm surface. Hold a bright toy just above their forehead. Encourage them to lift their head to see it. Gradually raise the toy higher over sessions.',
 3486, true),

-- Recognizing Hands  (Self Awareness, 3820 done)
('Recognizing Hands',
 'Guide baby''s hands in front of their face so they can see and feel them. This sparks early self-recognition and body schema development.',
 'social', 'Self Esteem',
 1, 3, 5, 'easy',
 ARRAY['Builds body awareness','Develops self-recognition','Encourages hand-watching behaviour','Strengthens parent-baby interaction'],
 'Daily',
 ARRAY['Nothing required'],
 'Lay baby on their back. Gently take their hands and hold them in front of their face. Let baby look at and touch their own fingers. Say "These are your hands!" with a warm smile.',
 3820, true),

-- Lifting By Hands  (Gross Motor / Muscle development, 3597 done)
('Lifting By Hands',
 'Gently grasp baby''s hands and slowly lift them to a semi-sitting position, then lower them back. Builds upper body strength and prepares for sitting.',
 'physical', 'Gross Motor',
 1, 3, 5, 'medium',
 ARRAY['Strengthens arm and shoulder muscles','Builds core stability','Prepares for independent sitting','Improves head control'],
 'Daily',
 ARRAY['Nothing — just your hands'],
 'Lay baby on their back. Hold both of baby''s hands firmly. Slowly and gently pull them toward a semi-sit — stop when their shoulders leave the surface. Lower them back slowly. Never force.',
 3597, true),

-- Pushing Legs  (Gross Motor, 3741 done)
('Pushing Legs',
 'Place your hands against baby''s feet while they lie on their back. Let baby push against your hands to strengthen their leg muscles.',
 'physical', 'Gross Motor',
 1, 3, 8, 'easy',
 ARRAY['Strengthens leg muscles','Builds body coordination','Encourages active movement','Prepares for crawling and walking'],
 'Daily',
 ARRAY['Firm surface'],
 'Lay baby on their back. Place your palms gently against the soles of their feet. Wait for baby to push. Offer gentle resistance. Alternate bending and extending the legs slowly.',
 3741, true),

-- Language L1  (Language Comprehension, 2076 done)
('Language L1',
 'Narrate your daily routine to baby using simple sentences. "Now we are washing your hands. The water is warm!" This builds early vocabulary through real-life context.',
 'communication', 'Language Comprehension',
 1, 3, 10, 'easy',
 ARRAY['Builds early vocabulary','Strengthens listening skills','Establishes language patterns','Fosters communication bond'],
 'As and when you can — all day',
 ARRAY['Nothing required'],
 'Throughout the day, describe what you are doing in simple clear sentences. Use baby''s name often. Pause after speaking to give baby a chance to respond with sounds or expressions.',
 2076, true),

-- Object Feeling  (Hand Coordination, 1717 done)
('Object Feeling',
 'Place a soft object into baby''s open palm and let them feel it. Guide their fingers to close around it. Builds grasping reflex and tactile exploration.',
 'physical', 'Hand-Eye-Spatial',
 1, 3, 5, 'easy',
 ARRAY['Develops palmar grasp reflex','Builds hand-object coordination','Strengthens finger muscles','Encourages tactile exploration'],
 'Daily',
 ARRAY['Soft toy','Textured ball','Small cloth'],
 'Open baby''s palm gently. Place the soft object in it. Let baby feel the weight and texture. Slowly guide their fingers to wrap around it. Say "Can you hold it? Good job!" with encouragement.',
 1717, true),

-- Cycle Movement  (Gross Motor, 3428 done)
('Cycle Movement',
 'Gently move baby''s legs in a cycling motion while they lie on their back. This familiar motion strengthens hip flexors and aids digestion.',
 'physical', 'Gross Motor',
 1, 3, 5, 'easy',
 ARRAY['Strengthens hip flexors','Aids digestion and reduces gas','Builds leg coordination','Improves circulation'],
 'Daily, 2-3 times',
 ARRAY['Nothing required'],
 'Lay baby on their back. Hold their ankles gently. Slowly move their legs in a cycling motion — one forward while the other goes back. Do 10 cycles, then rest. Sing a song to make it fun.',
 3428, true),

-- Distinguish Sounds  (Early Exploration, 1469 done)
('Distinguish Sounds',
 'Play two very different sounds — a rattle and a soft bell — and watch baby''s reaction to each. This teaches sound discrimination and early categorisation.',
 'cognitive', 'Early Knowledge',
 1, 3, 8, 'easy',
 ARRAY['Builds auditory discrimination','Stimulates cognitive categorisation','Strengthens listening attention','Develops early learning foundation'],
 'Every few days',
 ARRAY['Rattle','Soft bell or chime'],
 'Lay baby on their back. First shake the rattle — observe baby''s reaction. Wait 10 seconds, then ring the soft bell. Alternate several times, watching for baby''s different responses to each sound.',
 1469, true),

-- Responding To Sounds  (Sound, 1172 done)
('Responding To Sounds',
 'Make various household sounds near baby — tap a spoon on a bowl, rustle paper, clap hands softly. Observe and reinforce each reaction baby shows.',
 'communication', 'Sound',
 1, 3, 8, 'easy',
 ARRAY['Builds auditory awareness','Develops sound-response connection','Strengthens listening skills','Encourages early communication'],
 'Daily',
 ARRAY['Spoon','Bowl','Paper'],
 'While baby is calm and alert, make a gentle sound nearby. Watch for startle, head turn, or eye widening. React warmly — "You heard that! Good listening!" Repeat with different sounds.',
 1172, true),

-- Fetch A Toy  (Gross Motor, 1381 done)
('Fetch A Toy',
 'Place a toy just slightly out of baby''s reach during tummy time to motivate them to reach forward, building early locomotion motivation.',
 'physical', 'Gross Motor',
 1, 3, 8, 'medium',
 ARRAY['Motivates movement toward objects','Strengthens arm and shoulder muscles','Builds spatial understanding','Encourages early reaching'],
 'Daily',
 ARRAY['Bright toy'],
 'Place baby on their tummy. Put a bright toy just beyond their fingertips. Encourage them: "Can you get the toy?" Allow baby to attempt to reach. Never leave frustrated — bring the toy to them as reward.',
 1381, true)

ON CONFLICT DO NOTHING;

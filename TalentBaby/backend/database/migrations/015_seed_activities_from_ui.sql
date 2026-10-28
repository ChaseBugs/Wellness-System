-- Migration 015: Seed activities from UI screenshots (months 1–9)
-- Folder name = month number. Sub-category / done_count extracted from images.

-- Prevent duplicate inserts on re-run
CREATE UNIQUE INDEX IF NOT EXISTS idx_activities_title_subcategory
  ON activities(title, sub_category);

-- ─── Helper: map sub_category → canonical category ────────────────────────
-- physical  : Gross Motor, Muscle development, Balancing, Fine Motor,
--             Finger Dexterity, Spatial Awareness, Spatial Movements
-- cognitive : Memory and Attention, Concept Learning, Thinking Expansion,
--             Vocabulary, Imagination, Articulation & Reasoning,
--             Hand-Eye-Spatial, Nurturing Creativity, Self Awareness,
--             Musical Skills
-- communication: Speech Development, Language Comprehension,
--             Conversation Skills, Sound, Gesture Communication, Imitating
-- social    : Social Skills & Awareness, Bonding, Expressing Emotions,
--             Etiquette, Emotional Balance, Fun Time Together, Self Esteem,
--             Acting and Expressions, Thought Expression
-- sensory   : Sensory Play, Sensory Development, Early Exploration,
--             Primitive Reflex

INSERT INTO activities
  (title, description, category, sub_category,
   month_min, month_max, duration_minutes, difficulty_level,
   done_count, is_premium, language)
VALUES

-- ══════════════════════════════════════════════════════════
-- MONTH 1
-- ══════════════════════════════════════════════════════════
('Checkerboard',
 'Show baby a high-contrast checkerboard pattern to stimulate early visual focus.',
 'cognitive', 'Memory and Attention', 1, 1, 5, 'easy', 12840, false, 'en'),

('Spa Time',
 'Give baby a gentle massage with soft strokes to relax and stimulate tactile senses.',
 'sensory', 'Sensory Play', 1, 1, 10, 'easy', 13037, false, 'en'),

('Music',
 'Play soft music near baby to develop sound recognition and calm the nervous system.',
 'communication', 'Sound', 1, 1, 10, 'easy', 11252, false, 'en'),

('Tummy Time L1',
 'Place baby on their tummy briefly to strengthen neck and shoulder muscles.',
 'physical', 'Gross Motor', 1, 1, 5, 'easy', 14594, false, 'en'),

('Palmar Reflex',
 'Touch baby''s palm to trigger the grasping reflex and observe early neurological development.',
 'sensory', 'Primitive Reflex', 1, 1, 5, 'easy', 5434, false, 'en'),

('My Face',
 'Hold baby close so they can study your facial features and begin to recognise you.',
 'sensory', 'Early Exploration', 1, 1, 5, 'easy', 8385, false, 'en'),

('Responding To Sound',
 'Make gentle sounds near baby and observe their reactions to build sound-response connections.',
 'sensory', 'Sensory Play', 1, 1, 5, 'easy', 9511, false, 'en'),

('Plantar Reflex',
 'Stroke the sole of baby''s foot to observe the plantar (toe-curl) reflex.',
 'sensory', 'Primitive Reflex', 1, 1, 5, 'easy', 5517, false, 'en'),

('Recognizing Voices',
 'Let different family members speak softly to baby to help them distinguish familiar voices.',
 'sensory', 'Early Exploration', 1, 1, 5, 'easy', 6248, false, 'en'),

('Familiar Songs',
 'Sing the same simple song repeatedly to help baby start recognising familiar melodies.',
 'communication', 'Sound', 1, 1, 10, 'easy', 5039, false, 'en'),

('Tactile Sense',
 'Introduce various gentle textures against baby''s skin to stimulate the sense of touch.',
 'sensory', 'Sensory Play', 1, 1, 5, 'easy', 6864, false, 'en'),

('Spatial Movements',
 'Gently move baby through space — lifting, tilting — to develop spatial body awareness.',
 'physical', 'Gross Motor', 1, 1, 5, 'easy', 6088, false, 'en'),

('Hand And Arms',
 'Gently stretch and move baby''s arms and hands to promote circulation and muscle awareness.',
 'physical', 'Gross Motor', 1, 8, 5, 'easy', 6710, false, 'en'),

('Here I Am',
 'Make eye contact and call baby''s name warmly to strengthen the bonding connection.',
 'social', 'Bonding', 1, 1, 5, 'easy', 5127, false, 'en'),

('Rooting Reflex',
 'Stroke baby''s cheek to observe the rooting reflex — baby turning toward touch.',
 'sensory', 'Primitive Reflex', 1, 1, 5, 'easy', 3580, false, 'en'),

('Moro Reflex',
 'Observe the Moro startle reflex to ensure healthy neurological development.',
 'sensory', 'Primitive Reflex', 1, 1, 5, 'easy', 3374, false, 'en'),

('Eye Focus',
 'Hold a high-contrast object 20–30 cm from baby''s eyes to help them practise focusing.',
 'physical', 'Gross Motor', 1, 1, 5, 'easy', 5029, false, 'en'),

('Body Exploration',
 'Gently touch and name different parts of baby''s body to build early body awareness.',
 'sensory', 'Early Exploration', 1, 1, 5, 'easy', 4189, false, 'en'),

('Sucking Reflex',
 'Allow baby to suck on a clean finger or dummy to exercise the sucking reflex.',
 'sensory', 'Primitive Reflex', 1, 1, 5, 'easy', 4062, false, 'en'),

('Black And White',
 'Show baby simple black and white images to stimulate early visual cortex development.',
 'sensory', 'Early Exploration', 1, 1, 5, 'easy', 3999, false, 'en'),

('Love Her/Him',
 'Hold baby skin-to-skin and express love through gentle words and warmth.',
 'social', 'Expressing Emotions', 1, 1, 10, 'easy', 5781, false, 'en'),

('Different Sounds And Intensity',
 'Make sounds at different volumes — soft and loud — to help baby learn sound intensity.',
 'communication', 'Sound', 1, 1, 5, 'easy', 712, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 2
-- ══════════════════════════════════════════════════════════
('Act Out A Rhyme',
 'Act out a nursery rhyme with movements so baby links words with actions.',
 'cognitive', 'Memory and Attention', 2, 2, 10, 'easy', 23300, false, 'en'),

('Sound Direction',
 'Make sounds from different directions and observe baby tracking the source.',
 'communication', 'Sound', 2, 2, 5, 'easy', 9052, false, 'en'),

('Explore Surroundings',
 'Carry baby around the room and describe objects they see to spark early curiosity.',
 'sensory', 'Early Exploration', 2, 2, 10, 'easy', 8448, false, 'en'),

('Cross Legs',
 'Gently cross and uncross baby''s legs to improve hip flexibility and coordination.',
 'physical', 'Gross Motor', 2, 2, 5, 'easy', 7489, false, 'en'),

('Cross Hands',
 'Gently cross and uncross baby''s hands across the chest to develop midline awareness.',
 'physical', 'Gross Motor', 2, 2, 5, 'easy', 5924, false, 'en'),

('Introducing New People',
 'Introduce baby to a new person at close range to begin building social awareness.',
 'social', 'Social Skills & Awareness', 2, 2, 10, 'easy', 4127, false, 'en'),

('Recognizing Hands And Feet',
 'Draw baby''s attention to their own hands and feet to build early self-recognition.',
 'sensory', 'Early Exploration', 2, 2, 5, 'easy', 6011, false, 'en'),

('Object Grip',
 'Place a soft object in baby''s palm to practise the grasping reflex.',
 'physical', 'Gross Motor', 2, 2, 5, 'easy', 4293, false, 'en'),

('Story Snuggle',
 'Read a simple picture book to baby while cuddling to combine bonding with early literacy.',
 'social', 'Expressing Emotions', 2, 2, 10, 'easy', 3431, false, 'en'),

('Leg Cycling',
 'Gently cycle baby''s legs to strengthen hip flexors and improve circulation.',
 'physical', 'Gross Motor', 2, 2, 5, 'easy', 1066, false, 'en'),

('Eye Gazing',
 'Hold baby at face level and maintain gentle eye contact to strengthen emotional bonds.',
 'social', 'Bonding', 2, 2, 5, 'easy', 1266, false, 'en'),

('Nerve Stimulation',
 'Lightly stroke along baby''s spine and limbs to stimulate nerve pathway development.',
 'physical', 'Gross Motor', 2, 2, 5, 'easy', 775, false, 'en'),

('Face To Face Time',
 'Position your face close to baby''s and mimic their expressions to encourage social smiling.',
 'social', 'Bonding', 2, 2, 5, 'easy', 630, false, 'en'),

('Encourage Sounds',
 'Respond enthusiastically to every coo or sound baby makes to encourage vocalisation.',
 'communication', 'Sound', 2, 2, 5, 'easy', 877, false, 'en'),

('Leg Fold',
 'Gently fold baby''s knees to the chest and release to stretch and strengthen legs.',
 'physical', 'Gross Motor', 2, 2, 5, 'easy', 1201, false, 'en'),

('Naked Time',
 'Allow baby some supervised naked time on a soft mat to promote free movement.',
 'sensory', 'Early Exploration', 2, 2, 10, 'easy', 1085, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 3
-- ══════════════════════════════════════════════════════════
('Tactile Sense 2',
 'Introduce a crinkly or textured cloth for baby to feel, building tactile discrimination.',
 'sensory', 'Sensory Play', 3, 3, 5, 'easy', 5340, false, 'en'),

('Eye Movement',
 'Move a bright toy slowly left, right, up and down to build smooth eye tracking.',
 'cognitive', 'Hand-Eye-Spatial', 3, 3, 5, 'easy', 6246, false, 'en'),

('Recognizing Hands',
 'Guide baby''s hands in front of their face to spark early self-recognition.',
 'cognitive', 'Self Awareness', 3, 3, 5, 'easy', 3820, false, 'en'),

('Bedtime Stories',
 'Read a short story at bedtime every night to establish a soothing routine.',
 'cognitive', 'Imagination', 3, 3, 10, 'easy', 5095, false, 'en'),

('Head Lift L1',
 'During tummy time encourage baby to lift their head briefly to strengthen neck muscles.',
 'physical', 'Gross Motor', 3, 3, 5, 'easy', 4676, false, 'en'),

('Making Sounds',
 'Mimic and encourage baby''s vocalisations to build the foundation for speech.',
 'communication', 'Sound', 3, 3, 5, 'easy', 6404, false, 'en'),

('Neck Movement',
 'Gently support baby''s head as they track objects to develop neck strength and mobility.',
 'physical', 'Gross Motor', 3, 7, 5, 'easy', 4220, false, 'en'),

('Bedtime Kisses',
 'Give baby gentle kisses at bedtime to reinforce security and the bonding ritual.',
 'sensory', 'Early Exploration', 3, 3, 5, 'easy', 3636, false, 'en'),

('Understanding Baby',
 'Pay close attention to baby''s cues and respond consistently to build trust.',
 'communication', 'Conversation Skills', 3, 3, 5, 'easy', 3976, false, 'en'),

('Body Positioning',
 'Gently guide baby through back, side, and tummy positions to build postural awareness.',
 'physical', 'Gross Motor', 3, 3, 10, 'easy', 4213, false, 'en'),

('Finger Grip',
 'Let baby grip your finger and gently apply light resistance to strengthen their grasp.',
 'physical', 'Gross Motor', 3, 3, 5, 'easy', 3718, false, 'en'),

('Side Moves',
 'Rock baby gently from side to side to build lateral balance and core awareness.',
 'physical', 'Gross Motor', 3, 3, 5, 'easy', 3141, false, 'en'),

('Cycle Movement',
 'Move baby''s legs in a slow cycling motion to strengthen hip flexors and aid digestion.',
 'physical', 'Muscle development', 3, 3, 5, 'easy', 3428, false, 'en'),

('Respond To Baby',
 'Mirror baby''s facial expressions and sounds to validate their attempts at communication.',
 'social', 'Expressing Emotions', 3, 3, 5, 'easy', 3401, false, 'en'),

('Language L1',
 'Narrate your daily activities to baby using simple clear sentences to build vocabulary.',
 'communication', 'Language Comprehension', 3, 3, 10, 'easy', 2076, false, 'en'),

('Slow Dance',
 'Hold baby close and sway gently to music for a calming bonding experience.',
 'social', 'Fun Time Together', 3, 3, 10, 'easy', 366, false, 'en'),

('Multiple Voice Same Sounds',
 'Have different people make the same sound so baby learns voices can share patterns.',
 'communication', 'Language Comprehension', 3, 3, 5, 'easy', 510, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 4
-- ══════════════════════════════════════════════════════════
('Source Of Sound',
 'Shake a rattle just out of sight so baby turns to locate the sound source.',
 'cognitive', 'Memory and Attention', 4, 4, 5, 'easy', 10329, false, 'en'),

('The Touch',
 'Stroke baby with different textures — feather, cloth, brush — to stimulate tactile senses.',
 'sensory', 'Sensory Play', 4, 4, 5, 'easy', 3458, false, 'en'),

('Creeping L1',
 'Support baby in a prone position and encourage them to push forward with their legs.',
 'physical', 'Gross Motor', 4, 4, 5, 'easy', 8274, false, 'en'),

('Bring The Toy Closer',
 'Move a toy gradually toward baby to help them understand distance and depth.',
 'cognitive', 'Concept Learning', 4, 4, 5, 'easy', 5683, false, 'en'),

('Bath Time Fun',
 'Make bath time playful with splashing and narration to build sensory joy.',
 'sensory', 'Early Exploration', 4, 4, 15, 'easy', 5034, false, 'en'),

('Different Aromas',
 'Introduce safe gentle scents — vanilla, lavender — for baby to smell and explore.',
 'sensory', 'Sensory Play', 4, 4, 5, 'easy', 4408, false, 'en'),

('Explore Surrounding With Sound',
 'Walk baby around making sounds at each object to link sounds with places.',
 'communication', 'Sound', 4, 4, 10, 'easy', 4971, false, 'en'),

('Photo Book',
 'Show baby a simple photo book of family members to build recognition and memory.',
 'cognitive', 'Self Awareness', 4, 4, 5, 'easy', 3536, false, 'en'),

('Reinforce Places And Toys',
 'Return to the same toys and spots repeatedly so baby builds memory associations.',
 'cognitive', 'Memory and Attention', 4, 4, 10, 'easy', 3792, false, 'en'),

('Describe Actions',
 'Describe what you and baby are doing in simple words as you do it.',
 'cognitive', 'Thinking Expansion', 4, 4, 10, 'easy', 3626, false, 'en'),

('Tracking Sound',
 'Move a bell slowly around baby''s field of hearing to develop directional listening.',
 'communication', 'Sound', 4, 4, 5, 'easy', 3623, false, 'en'),

('Stronger Grip',
 'Offer baby textured objects of different sizes to strengthen their grip.',
 'physical', 'Muscle development', 4, 4, 5, 'easy', 4086, false, 'en'),

('Leg Bending',
 'Gently bend and extend baby''s legs to improve flexibility and joint awareness.',
 'physical', 'Gross Motor', 4, 4, 5, 'easy', 3398, false, 'en'),

('Expressions',
 'Make exaggerated facial expressions and simple gestures to teach non-verbal communication.',
 'communication', 'Gesture Communication', 4, 4, 5, 'easy', 2820, false, 'en'),

('Speaking Differently',
 'Vary your pitch, speed and tone while talking to help baby distinguish speech sounds.',
 'communication', 'Speech Development', 4, 4, 5, 'easy', 4167, false, 'en'),

('Discovery With My Mouth',
 'Allow baby to safely explore appropriate objects with their mouth to build oral awareness.',
 'sensory', 'Early Exploration', 4, 4, 5, 'easy', 3674, false, 'en'),

('Recognizing Family',
 'Show baby photos of family members and name each one to build recognition memory.',
 'cognitive', 'Memory and Attention', 4, 4, 5, 'easy', 2425, false, 'en'),

('Follow My Hand',
 'Move your hand slowly across baby''s visual field for them to track with imagination.',
 'cognitive', 'Imagination', 4, 4, 5, 'easy', 2653, false, 'en'),

('Rolling',
 'Gently help baby roll from back to side to build core strength for independent rolling.',
 'physical', 'Gross Motor', 4, 4, 5, 'easy', 3214, false, 'en'),

('Head Lift L2',
 'During tummy time hold a toy above baby''s head to encourage higher and longer lifts.',
 'physical', 'Gross Motor', 4, 4, 5, 'medium', 3486, false, 'en'),

('Holding Objects',
 'Place lightweight objects in baby''s hands to practise voluntary grasp and release.',
 'physical', 'Gross Motor', 4, 4, 5, 'easy', 2781, false, 'en'),

('Mirror',
 'Hold baby in front of a mirror so they can see and interact with their own reflection.',
 'cognitive', 'Self Awareness', 4, 4, 5, 'easy', 2608, false, 'en'),

('Wind Chime',
 'Hang a wind chime near baby to introduce musical cause-and-effect with gentle sounds.',
 'cognitive', 'Musical Skills', 4, 4, 5, 'easy', 737, false, 'en'),

('My Name',
 'Call baby''s name repeatedly in a warm voice until they consistently respond.',
 'cognitive', 'Self Awareness', 4, 4, 5, 'easy', 391, false, 'en'),

('Lifting And Spinning',
 'Hold baby securely and gently lift or spin them to bring joy and vestibular stimulation.',
 'social', 'Fun Time Together', 4, 4, 5, 'easy', 199, false, 'en'),

('Sucking Sound',
 'Make exaggerated sucking sounds and wait for baby to imitate to build speech mimicry.',
 'communication', 'Speech Development', 4, 4, 5, 'easy', 788, false, 'en'),

('Laughing',
 'Use tickles and funny faces to spark baby''s laughter and reinforce positive emotions.',
 'social', 'Fun Time Together', 4, 4, 5, 'easy', 127, false, 'en'),

('Introducing New People II',
 'Introduce baby to a second unfamiliar person to further develop social awareness.',
 'social', 'Social Skills & Awareness', 4, 4, 10, 'easy', 289, false, 'en'),

('Explain Actions To Baby',
 'Describe every action you perform around baby to link language with real events.',
 'communication', 'Language Comprehension', 4, 8, 5, 'easy', 501, false, 'en'),

('Imitation Game',
 'Make sounds or mouth movements and encourage baby to copy to build speech foundation.',
 'communication', 'Speech Development', 4, 8, 5, 'easy', 554, false, 'en'),

('Signs Of Affection',
 'Show baby clear affectionate gestures — hugs, kisses, smiles — to model emotional expression.',
 'social', 'Expressing Emotions', 4, 8, 5, 'easy', 598, false, 'en'),

('Mirror Play',
 'Let baby explore their reflection by touching, smiling, and vocalising at the mirror.',
 'sensory', 'Early Exploration', 4, 9, 5, 'easy', 403, false, 'en'),

('Pet Friend',
 'Let baby observe and gently interact with a calm family pet to build empathy.',
 'social', 'Expressing Emotions', 4, 9, 5, 'easy', 439, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 5
-- ══════════════════════════════════════════════════════════
('Noise And Sound Together',
 'Combine a visible action with a sound so baby links cause to effect auditorily.',
 'communication', 'Speech Development', 5, 7, 5, 'easy', 9830, false, 'en'),

('Lip Sounds L1',
 'Make exaggerated lip sounds — "ba ba", "ma ma" — to introduce early consonants.',
 'communication', 'Speech Development', 5, 7, 5, 'easy', 6069, false, 'en'),

('Squats',
 'Support baby in a standing position and gently bounce them in mini squats.',
 'physical', 'Gross Motor', 5, 7, 5, 'easy', 7025, false, 'en'),

('Leg Exercise',
 'Hold baby''s ankles and guide resistance leg presses to build leg strength.',
 'physical', 'Gross Motor', 5, 5, 5, 'easy', 5055, false, 'en'),

('Light Show',
 'Shine a soft torch and move the light beam for baby to track and imagine.',
 'cognitive', 'Imagination', 5, 5, 5, 'easy', 2753, false, 'en'),

('Action & Sound',
 'Pair an action — clapping, tapping — with a distinct sound to link senses.',
 'sensory', 'Sensory Play', 5, 5, 5, 'easy', 4282, false, 'en'),

('Flying Bird',
 'Hold baby safely and swoop them gently like a bird to build spatial memory.',
 'cognitive', 'Memory and Attention', 5, 5, 5, 'easy', 2825, false, 'en'),

('Look Around',
 'Give baby supervised time on their tummy to look around independently.',
 'sensory', 'Early Exploration', 5, 5, 5, 'easy', 2960, false, 'en'),

('Combine Actions',
 'Chain two simple actions together — reach then shake — to build sequential memory.',
 'cognitive', 'Memory and Attention', 5, 7, 5, 'easy', 3701, false, 'en'),

('Hand Movements',
 'Guide baby''s hands through waving and reaching movements to build motor planning.',
 'physical', 'Gross Motor', 5, 8, 5, 'easy', 3291, false, 'en'),

('Talk And Move',
 'Narrate movements as baby exercises to link language with physical actions.',
 'communication', 'Speech Development', 5, 8, 5, 'easy', 3808, false, 'en'),

('Stand-Up On Legs',
 'Hold baby upright so they bear weight on their legs to build leg strength.',
 'physical', 'Gross Motor', 5, 5, 5, 'easy', 2991, false, 'en'),

('Read A Book',
 'Read a simple board book pointing to pictures and naming them.',
 'communication', 'Language Comprehension', 5, 5, 10, 'easy', 2028, false, 'en'),

('What Is On My Feet',
 'Put socks with patterns on baby''s feet for them to discover and remember.',
 'cognitive', 'Memory and Attention', 5, 5, 5, 'easy', 2985, false, 'en'),

('Creeping L2',
 'Place baby on tummy with a toy ahead to encourage forward creeping motion.',
 'physical', 'Gross Motor', 5, 5, 5, 'easy', 2242, false, 'en'),

('Sitting Experience',
 'Support baby in a brief sitting position to give them the feel of upright posture.',
 'physical', 'Gross Motor', 5, 5, 5, 'easy', 3001, false, 'en'),

('Sitting Posture',
 'Practice supported sitting with correct alignment to build core and back muscles.',
 'physical', 'Balancing', 5, 8, 5, 'easy', 3622, false, 'en'),

('Side Stretch',
 'Gently stretch baby sideways while holding them to improve lateral flexibility.',
 'physical', 'Gross Motor', 5, 9, 5, 'easy', 2446, false, 'en'),

('Back Exercise',
 'Place baby on their back and lift their hips slightly to strengthen back muscles.',
 'physical', 'Gross Motor', 5, 9, 5, 'easy', 3027, false, 'en'),

('Hand Games',
 'Play pat-a-cake or similar hand games to build fine motor skills through bonding.',
 'social', 'Bonding', 5, 5, 5, 'easy', 2567, false, 'en'),

('Help To Express Joy',
 'Celebrate baby''s happy moments enthusiastically to teach them to express positive emotion.',
 'social', 'Thought Expression', 5, 5, 5, 'easy', 1319, false, 'en'),

('Definition Of No',
 'Use a calm, firm "no" consistently so baby begins to understand the concept.',
 'cognitive', 'Concept Learning', 5, 9, 5, 'easy', 520, false, 'en'),

('Sound And Events',
 'Point out environmental sounds and name their source to build auditory associations.',
 'communication', 'Sound', 5, 8, 5, 'easy', 375, false, 'en'),

('Temperature Sense',
 'Let baby safely feel warm and cool objects to develop temperature discrimination.',
 'sensory', 'Sensory Development', 5, 8, 5, 'easy', 479, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 7  (activities not introduced in earlier months)
-- ══════════════════════════════════════════════════════════
('Book Trick',
 'Ask baby to point to a named picture in a book to build reasoning and memory.',
 'cognitive', 'Articulation & Reasoning', 7, 7, 5, 'easy', 10607, false, 'en'),

('Tongue Movements',
 'Make exaggerated tongue movements for baby to watch and imitate.',
 'social', 'Acting and Expressions', 7, 7, 5, 'easy', 6340, false, 'en'),

('Walking On Legs',
 'Support baby upright and guide them in a stepping motion to build spatial awareness.',
 'physical', 'Spatial Awareness', 7, 7, 5, 'easy', 5119, false, 'en'),

('Shoulder And Arms Lift',
 'With baby on their tummy, support their shoulders as they lift arms forward.',
 'physical', 'Muscle development', 7, 7, 5, 'easy', 4770, false, 'en'),

('Babble Talks',
 'Engage baby in babble conversations, responding to every sound they make.',
 'sensory', 'Early Exploration', 7, 7, 5, 'easy', 3526, false, 'en'),

('Object Permanence 2',
 'Partially hide an object and encourage baby to retrieve it to build object permanence.',
 'cognitive', 'Memory and Attention', 7, 7, 5, 'easy', 3344, false, 'en'),

('Roll Over',
 'Encourage baby to roll from back to tummy independently using a toy as motivation.',
 'physical', 'Gross Motor', 7, 7, 5, 'easy', 4164, false, 'en'),

('Sounds Of Nature',
 'Play recordings of nature sounds — birds, rain, waves — for emotional calming.',
 'social', 'Emotional Balance', 7, 7, 10, 'easy', 2819, false, 'en'),

('Face Down To Face Up',
 'From a face-down position, help baby flip to face up to build core rotation strength.',
 'physical', 'Gross Motor', 7, 7, 5, 'easy', 4164, false, 'en'),

('Tilt Balance',
 'Gently tilt baby side to side on a surface to develop early balance responses.',
 'physical', 'Balancing', 7, 7, 5, 'easy', 4131, false, 'en'),

('Building Vocabulary L1',
 'Name every object baby touches or looks at to rapidly expand their vocabulary.',
 'communication', 'Vocabulary', 7, 7, 10, 'easy', 3088, false, 'en'),

('Sitting Up',
 'Practice full sitting from lying with support to strengthen core and back muscles.',
 'physical', 'Muscle development', 7, 7, 5, 'easy', 2512, false, 'en'),

('Rhyme & Dance',
 'Dance and sing rhymes together for joyful physical and linguistic play.',
 'social', 'Fun Time Together', 7, 7, 10, 'easy', 2437, false, 'en'),

('Explore Surroundings',
 'Walk baby to new areas of the home and let them observe social environments.',
 'social', 'Social Skills & Awareness', 7, 7, 10, 'easy', 1801, false, 'en'),

('Object Permanence 1',
 'Fully hide an object under a cloth and encourage baby to uncover it.',
 'cognitive', 'Memory and Attention', 7, 7, 5, 'easy', 2416, false, 'en'),

('Fixing Eyesight',
 'Move a small target slowly across baby''s vision field to develop precise eye tracking.',
 'physical', 'Gross Motor', 7, 7, 5, 'easy', 2746, false, 'en'),

('Controlling Sound',
 'Encourage baby to vary the volume and pitch of their vocalisations.',
 'communication', 'Sound', 7, 7, 5, 'easy', 2128, false, 'en'),

('Back Muscle Stretch',
 'Gently arch baby''s back while supporting them to stretch and strengthen back muscles.',
 'physical', 'Muscle development', 7, 7, 5, 'easy', 2328, false, 'en'),

('Sitting Practice',
 'Let baby sit independently for short periods with padding nearby for safety.',
 'physical', 'Balancing', 7, 7, 5, 'easy', 2870, false, 'en'),

('Rolling 360',
 'Encourage baby to roll a full 360 degrees on a padded surface.',
 'physical', 'Gross Motor', 7, 7, 5, 'easy', 2317, false, 'en'),

('Mirror 2',
 'Tap the mirror together with baby and name the reflection to deepen self-awareness.',
 'cognitive', 'Self Awareness', 7, 7, 5, 'easy', 1954, false, 'en'),

('Recognising Name',
 'Call baby''s name from across the room and reward them when they look toward you.',
 'communication', 'Language Comprehension', 7, 7, 5, 'easy', 1350, false, 'en'),

('Hand Eye Coordination',
 'Present objects at varying distances for baby to reach and grab to build hand-eye coordination.',
 'cognitive', 'Hand-Eye-Spatial', 7, 7, 5, 'easy', 1376, false, 'en'),

('Roly Poly Toy',
 'Give baby a roly-poly toy to push and watch pop back to build delight and anticipation.',
 'social', 'Fun Time Together', 7, 7, 5, 'easy', 1285, false, 'en'),

('Grasping Small Objects',
 'Offer safe small objects for baby to pick up with a pincer grasp.',
 'physical', 'Finger Dexterity', 7, 8, 5, 'easy', 395, false, 'en'),

('Say Goodbye',
 'Wave and say "bye-bye" consistently so baby begins to copy the gesture.',
 'social', 'Etiquette', 7, 8, 5, 'easy', 299, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 8  (activities not introduced in earlier months)
-- ══════════════════════════════════════════════════════════
('Talking Through Sound',
 'Use sound effects and onomatopoeia while describing objects to enrich auditory vocabulary.',
 'sensory', 'Sensory Play', 8, 8, 5, 'easy', 3886, false, 'en'),

('Another World',
 'Create a small pretend environment with blankets and props for baby to explore.',
 'cognitive', 'Memory and Attention', 8, 8, 10, 'easy', 3829, false, 'en'),

('Switch On & Off',
 'Show baby how a light switch or toy button works, then guide their hand to try.',
 'cognitive', 'Articulation & Reasoning', 8, 8, 5, 'easy', 3169, false, 'en'),

('Paper Shredding',
 'Give baby safe newspaper to tear and crumple to nurture creative physical play.',
 'cognitive', 'Nurturing Creativity', 8, 9, 5, 'easy', 4926, false, 'en'),

('Single Syllables',
 'Clearly repeat single-syllable words — "dog", "cup", "ball" — during daily routines.',
 'communication', 'Speech Development', 8, 9, 5, 'easy', 4448, false, 'en'),

('Playing With Balloons',
 'Bat an inflated balloon back and forth to develop hand-eye coordination and anticipation.',
 'cognitive', 'Hand-Eye-Spatial', 8, 9, 5, 'easy', 2836, false, 'en'),

('Sound & Light',
 'Pair flashing light toys with sounds for baby to reason about cause and effect.',
 'cognitive', 'Articulation & Reasoning', 8, 8, 5, 'easy', 2420, false, 'en'),

('Explore Nature',
 'Take baby outside and let them touch leaves, grass, and safe natural objects.',
 'cognitive', 'Nurturing Creativity', 8, 8, 10, 'easy', 2749, false, 'en'),

('Cause & Effect',
 'Demonstrate that actions cause reactions — push the ball, it rolls — and let baby try.',
 'cognitive', 'Thinking Expansion', 8, 9, 5, 'easy', 2826, false, 'en'),

('Squeezing A Sponge',
 'Let baby squeeze a wet sponge over a bowl to explore water play and cause-effect thinking.',
 'cognitive', 'Thinking Expansion', 8, 8, 5, 'easy', 1935, false, 'en'),

('Object Permanence 5',
 'Hide an object in one of two places and let baby search to strengthen memory.',
 'cognitive', 'Memory and Attention', 8, 8, 5, 'easy', 2810, false, 'en'),

('Object Tracking',
 'Move an object along a track or path for baby to follow with eyes and hands.',
 'cognitive', 'Memory and Attention', 8, 9, 5, 'easy', 2960, false, 'en'),

('Exploring Round Objects',
 'Give baby safe round objects of different sizes to roll, feel, and investigate.',
 'sensory', 'Sensory Play', 8, 9, 5, 'easy', 1173, false, 'en'),

('Peek A Boo',
 'Play peek-a-boo to reinforce object permanence and delight baby with surprise.',
 'cognitive', 'Memory and Attention', 8, 8, 5, 'easy', 2080, false, 'en'),

('Rotating On Stomach',
 'Encourage baby to rotate 360 degrees on their stomach to build core strength.',
 'physical', 'Gross Motor', 8, 8, 5, 'easy', 3185, false, 'en'),

('Bouncing Ball',
 'Bounce a ball in front of baby for them to track and anticipate its path.',
 'cognitive', 'Memory and Attention', 8, 9, 5, 'easy', 1139, false, 'en'),

('Object Permanence 4',
 'Hide an object under one of three cups and encourage baby to find it.',
 'cognitive', 'Memory and Attention', 8, 9, 5, 'easy', 1901, false, 'en'),

('Read And Act',
 'Read a book and act out the story with gestures for baby to mimic and understand.',
 'communication', 'Language Comprehension', 8, 9, 10, 'easy', 2195, false, 'en'),

('Standing Foundation',
 'Support baby at a low table to bear weight on legs and begin pulling to stand.',
 'physical', 'Muscle development', 8, 9, 5, 'easy', 2882, false, 'en'),

('Standing Up Foundation L2',
 'Assist baby from sitting to standing using your hands to build leg strength.',
 'physical', 'Gross Motor', 8, 9, 5, 'easy', 1972, false, 'en'),

('Observe The Toy',
 'Place a new toy in front of baby and let them study it carefully before intervening.',
 'cognitive', 'Memory and Attention', 8, 8, 5, 'easy', 1558, false, 'en'),

('Where Did It Go',
 'Move an object out of sight and ask "where did it go?" to build reasoning.',
 'cognitive', 'Articulation & Reasoning', 8, 9, 5, 'easy', 1458, false, 'en'),

('Regaining Sitting Posture',
 'Let baby topple slightly then help them regain an upright sitting position.',
 'physical', 'Balancing', 8, 8, 5, 'easy', 1807, false, 'en'),

('Standing Up Foundation L1',
 'With your support, guide baby from lying to standing in stages to build strength.',
 'physical', 'Gross Motor', 8, 8, 5, 'easy', 1828, false, 'en'),

('Yes & No L1',
 'Use a clear nod and head-shake with "yes" and "no" so baby learns the concepts.',
 'communication', 'Language Comprehension', 8, 8, 5, 'easy', 1707, false, 'en'),

('Balancing',
 'Have baby balance on your lap or a cushion while you provide light support.',
 'physical', 'Gross Motor', 8, 8, 5, 'easy', 1847, false, 'en'),

('Parachute Reflex',
 'Tilt baby forward gently so their arms extend to catch themselves (parachute reflex).',
 'physical', 'Gross Motor', 8, 8, 5, 'easy', 1142, false, 'en'),

('Crawling Foundation L3',
 'Support baby on all fours and rock them forward and back to prepare for crawling.',
 'physical', 'Muscle development', 8, 8, 5, 'easy', 1747, false, 'en'),

('Starting To Crawl',
 'Place a toy just ahead during tummy time to motivate baby to crawl forward.',
 'physical', 'Gross Motor', 8, 8, 5, 'easy', 2169, false, 'en'),

('Moving Forward',
 'Encourage baby to crawl or shuffle forward toward a desired toy or person.',
 'physical', 'Gross Motor', 8, 9, 5, 'easy', 1619, false, 'en'),

('Laughing 2',
 'Create funny scenarios — silly sounds, hats — to encourage sustained laughter.',
 'social', 'Fun Time Together', 8, 8, 5, 'easy', 1627, false, 'en'),

('Clapping',
 'Clap in rhythm to music and guide baby''s hands to clap along.',
 'social', 'Fun Time Together', 8, 8, 5, 'easy', 1669, false, 'en'),

('Animal Sounds',
 'Show pictures of animals and make the matching sound for baby to remember.',
 'communication', 'Sound', 8, 9, 5, 'easy', 1215, false, 'en'),

('Lip Lesson',
 'Exaggerate lip shapes while making vowel sounds for baby to observe and copy.',
 'communication', 'Speech Development', 8, 8, 5, 'easy', 405, false, 'en'),

('Mirror 3',
 'Tap the mirror, make faces, and name emotions in the reflection together.',
 'cognitive', 'Self Awareness', 8, 9, 5, 'easy', 401, false, 'en'),

('Putting Things In Box',
 'Show baby how to put objects into a container and let them practise.',
 'physical', 'Fine Motor', 8, 9, 5, 'easy', 438, false, 'en'),

('Clapping Hands',
 'Guide baby to clap their own hands together to improve bilateral coordination.',
 'physical', 'Fine Motor', 8, 9, 5, 'easy', 403, false, 'en'),

('Social Exposure',
 'Take baby to a small gathering or playgroup to experience social interaction.',
 'social', 'Social Skills & Awareness', 8, 9, 15, 'easy', 333, false, 'en'),

('Phone Conversation',
 'Pretend to talk on the phone with baby to model conversational turn-taking.',
 'communication', 'Speech Development', 8, 9, 5, 'easy', 279, false, 'en'),

('Crawling With Obstacles',
 'Place soft cushions in baby''s crawling path for them to navigate around.',
 'physical', 'Gross Motor', 8, 9, 5, 'easy', 296, false, 'en'),

('Daily Moments',
 'Create a consistent daily ritual — a special song or game — to build secure bonding.',
 'social', 'Bonding', 8, 9, 5, 'easy', 419, false, 'en'),

-- ══════════════════════════════════════════════════════════
-- MONTH 9  (activities not introduced in earlier months)
-- ══════════════════════════════════════════════════════════
('Clap With Me',
 'Encourage baby to clap in imitation of your rhythm to build imitative social skills.',
 'communication', 'Imitating', 9, 9, 5, 'easy', 4733, false, 'en'),

('Differentiating Tone & Volumes',
 'Speak to baby in whispers, normal voice, and loud voice to build tonal awareness.',
 'communication', 'Speech Development', 9, 9, 5, 'easy', 2447, false, 'en'),

('Holding 3 Objects',
 'Challenge baby to hold three small objects at once to develop fine motor planning.',
 'physical', 'Fine Motor', 9, 9, 5, 'easy', 1764, false, 'en'),

('Play Date',
 'Arrange a playdate with another baby to develop early social interaction skills.',
 'social', 'Social Skills & Awareness', 9, 9, 30, 'easy', 1269, false, 'en'),

('Greeting',
 'Practice greeting routines — hello wave, hi-five — to build social etiquette.',
 'social', 'Etiquette', 9, 9, 5, 'easy', 2534, false, 'en'),

('Toy In The Box',
 'Place a toy inside a box and let baby figure out how to get it out.',
 'cognitive', 'Nurturing Creativity', 9, 9, 5, 'easy', 2286, false, 'en'),

('Pull Action',
 'Attach a ribbon to a toy and show baby how to pull it to retrieve the toy.',
 'cognitive', 'Articulation & Reasoning', 9, 9, 5, 'easy', 2605, false, 'en'),

('Object Finding Game',
 'Hide a favourite toy under one of several cloths for baby to search and find.',
 'cognitive', 'Memory and Attention', 9, 9, 5, 'easy', 2116, false, 'en'),

('Object Revealing',
 'Partially uncover different objects for baby to identify using context clues.',
 'cognitive', 'Concept Learning', 9, 9, 5, 'easy', 1387, false, 'en'),

('Shake The Bottle',
 'Give baby a sealed bottle with beads inside to shake and hear, sparking curiosity.',
 'sensory', 'Sensory Play', 9, 9, 5, 'easy', 1277, false, 'en'),

('Playing Drums',
 'Let baby bang pots, drums, or surfaces with a soft stick to develop rhythm.',
 'physical', 'Gross Motor', 9, 9, 5, 'easy', 1344, false, 'en'),

('Building Vocabulary L2',
 'Introduce two-word phrases alongside single words to grow baby''s vocabulary.',
 'communication', 'Vocabulary', 9, 9, 10, 'easy', 1742, false, 'en'),

('Shaping Things With Hands',
 'Give baby play dough or soft clay to squeeze, press, and shape.',
 'physical', 'Fine Motor', 9, 9, 10, 'easy', 1312, false, 'en'),

('Creating Sounds',
 'Encourage baby to bang, shake, or blow objects to produce sounds creatively.',
 'communication', 'Sound', 9, 9, 5, 'easy', 1009, false, 'en'),

('Verbal Directions',
 'Give simple one-step instructions — "give me the ball" — and celebrate compliance.',
 'communication', 'Language Comprehension', 9, 9, 5, 'easy', 1453, false, 'en'),

('Fast & Slow Clapping',
 'Clap hands fast then slow to teach baby tempo and build listening skills.',
 'communication', 'Sound', 9, 9, 5, 'easy', 883, false, 'en'),

('Finger Pick And Drop',
 'Practice picking up and deliberately dropping small safe objects into a container.',
 'physical', 'Finger Dexterity', 9, 9, 5, 'easy', 1020, false, 'en'),

('Removing Rings',
 'Stack rings on a peg and let baby remove them to build fine motor skills.',
 'physical', 'Fine Motor', 9, 9, 5, 'easy', 1866, false, 'en'),

('Getting The Toy',
 'Place a desired toy behind a barrier so baby must reason and reach around it.',
 'cognitive', 'Articulation & Reasoning', 9, 9, 5, 'easy', 1632, false, 'en'),

('Counting Toes',
 'Count baby''s toes aloud while touching each one to introduce number concepts.',
 'cognitive', 'Memory and Attention', 9, 9, 5, 'easy', 1164, false, 'en'),

('Goof Off',
 'Be silly together — funny faces, silly sounds — to build baby''s sense of self and humour.',
 'social', 'Self Esteem', 9, 9, 5, 'easy', 1512, false, 'en'),

('Finding Sound Source',
 'Hide a sound-making toy and encourage baby to crawl toward and find it.',
 'communication', 'Sound', 9, 9, 10, 'easy', 1232, false, 'en'),

('Rotating Objects',
 'Show baby how to rotate and turn objects to see all sides, building spatial cognition.',
 'cognitive', 'Memory and Attention', 9, 9, 5, 'easy', 978, false, 'en'),

('Crawling Long Distance',
 'Encourage baby to crawl across a larger open space to build endurance and confidence.',
 'physical', 'Gross Motor', 9, 9, 10, 'easy', 1323, false, 'en'),

('Standing Up',
 'Practice pulling to standing from sitting using furniture for support.',
 'physical', 'Gross Motor', 9, 9, 5, 'easy', 1381, false, 'en'),

('Walk With Help',
 'Hold baby''s hands and walk forward together to prepare for independent steps.',
 'physical', 'Gross Motor', 9, 9, 10, 'easy', 1052, false, 'en'),

('One Hand To Other',
 'Encourage baby to pass a small object from one hand to the other.',
 'physical', 'Fine Motor', 9, 9, 5, 'easy', 1157, false, 'en'),

('Taking Out Things',
 'Fill a small box with safe objects for baby to take out one by one.',
 'physical', 'Fine Motor', 9, 9, 5, 'easy', 701, false, 'en'),

('Standing Foundation L3',
 'With minimal support, let baby stand briefly against furniture to build confidence.',
 'physical', 'Gross Motor', 9, 9, 5, 'easy', 1188, false, 'en'),

('Join The Fun',
 'Let baby join a small group activity to experience cooperative social play.',
 'social', 'Social Skills & Awareness', 9, 9, 15, 'easy', 426, false, 'en')

ON CONFLICT (title, sub_category) DO NOTHING;

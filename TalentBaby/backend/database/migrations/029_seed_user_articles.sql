-- Migration 029: Add keywords to user_articles + seed 8 articles with nested comments

-- ─── Add keywords column ─────────────────────────────────────────────────────
ALTER TABLE user_articles
  ADD COLUMN IF NOT EXISTS keywords TEXT[] NOT NULL DEFAULT '{}';

-- Update search index to include keywords
CREATE INDEX IF NOT EXISTS idx_user_articles_keywords ON user_articles USING GIN (keywords);

-- ─── Seed ─────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  u1 INT; u2 INT; u3 INT; u4 INT; u5 INT;
  a1 INT; a2 INT; a3 INT; a4 INT; a5 INT; a6 INT; a7 INT; a8 INT;
  c1 INT; c2 INT; c3 INT; c4 INT; c5 INT; c6 INT; c7 INT; c8 INT;
BEGIN

  -- ── Seed users (skip if email already exists) ──────────────────────────────
  INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('seed.alice@talentbaby.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
            'Alice Kim', 'user')
    ON CONFLICT (email) DO NOTHING;

  INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('seed.bob@talentbaby.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
            'Bob Park', 'user')
    ON CONFLICT (email) DO NOTHING;

  INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('seed.carol@talentbaby.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
            'Carol Lee', 'user')
    ON CONFLICT (email) DO NOTHING;

  INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('seed.drchoi@talentbaby.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
            'Dr. Choi Su-min', 'doctor')
    ON CONFLICT (email) DO NOTHING;

  INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('seed.emma@talentbaby.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y',
            'Emma Yoon', 'user')
    ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u1 FROM users WHERE email = 'seed.alice@talentbaby.com';
  SELECT id INTO u2 FROM users WHERE email = 'seed.bob@talentbaby.com';
  SELECT id INTO u3 FROM users WHERE email = 'seed.carol@talentbaby.com';
  SELECT id INTO u4 FROM users WHERE email = 'seed.drchoi@talentbaby.com';
  SELECT id INTO u5 FROM users WHERE email = 'seed.emma@talentbaby.com';

  -- Doctor profile for Dr. Choi
  INSERT INTO doctor_profiles (user_id, specialty, grade, grade_level, hospital, bio)
    VALUES (u4, 'Pediatrics', 'specialist', 3, 'Seoul Children''s Hospital',
            'Pediatric specialist with 12 years of experience in infant development.')
    ON CONFLICT (user_id) DO NOTHING;

  -- ── 8 User Articles ─────────────────────────────────────────────────────────

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u1,
      'My Baby Slept Through the Night at 4 Months — Here''s What Worked',
      'After weeks of exhausting nights, we finally found a routine that helped our daughter sleep a full 7-hour stretch. I''ll share the exact steps we took, from adjusting nap times to the white noise machine that changed everything.',
      'parenting',
      ARRAY['sleep', 'newborn', 'routine'],
      ARRAY['sleep training', 'baby sleep', '4 months', 'newborn sleep', 'sleep routine', 'white noise', 'night waking'],
      'published', 142, 38, 0)
    RETURNING id INTO a1;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u2,
      'First Foods: Our 6-Month Journey from Purees to Finger Foods',
      'We started solids at exactly 6 months and made every mistake in the book. Here''s what I learned about BLW vs. purees, which foods caused reactions, and how to tell when your baby is actually ready.',
      'nutrition',
      ARRAY['solid food', 'BLW', 'weaning'],
      ARRAY['baby led weaning', 'first foods', '6 months', 'purees', 'solid foods', 'feeding', 'food allergy', 'weaning'],
      'published', 289, 71, 0)
    RETURNING id INTO a2;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u4,
      'Tummy Time: Why It Matters More Than You Think (A Pediatrician''s Perspective)',
      'As a pediatrician, I see many parents skip tummy time because their baby cries. But consistent tummy time is critical for neck strength, motor development, and preventing flat head syndrome. Here''s a safe, step-by-step approach.',
      'health',
      ARRAY['tummy time', 'motor development', 'pediatrician'],
      ARRAY['tummy time', 'neck strength', 'motor skills', 'flat head', 'plagiocephaly', 'infant development', 'pediatrician advice'],
      'published', 512, 124, 0)
    RETURNING id INTO a3;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u3,
      'Postpartum Anxiety Is Real — My Story and What Finally Helped',
      'Nobody warned me about the intrusive thoughts, the constant checking, the inability to sleep even when the baby slept. Postpartum anxiety is different from PPD, and it took me 8 months to get diagnosed. I''m sharing this so someone else doesn''t wait as long as I did.',
      'health',
      ARRAY['postpartum', 'mental health', 'anxiety'],
      ARRAY['postpartum anxiety', 'PPA', 'postpartum depression', 'mental health', 'new mom', 'intrusive thoughts', 'therapy'],
      'published', 381, 95, 0)
    RETURNING id INTO a4;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u5,
      'How We Turned Screen-Free Evenings Into Our Favorite Family Ritual',
      'When our son turned 14 months, we noticed he was getting fussier and sleeping worse. We cut all screens after 6 PM and replaced it with a simple wind-down routine. The change in his behavior was dramatic within a week.',
      'parenting',
      ARRAY['screen time', 'toddler', 'routine'],
      ARRAY['screen time', 'screen free', 'toddler routine', 'bedtime routine', '14 months', 'sleep hygiene', 'wind down'],
      'published', 198, 52, 0)
    RETURNING id INTO a5;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u2,
      'Baby Sign Language Changed Our Communication Completely',
      'We started teaching signs at 7 months and by 10 months our daughter could sign "milk", "more", "all done", and "sleep". It dramatically reduced frustration for both of us before she could speak.',
      'development',
      ARRAY['sign language', 'communication', 'baby development'],
      ARRAY['baby sign language', 'baby signs', '7 months', '10 months', 'communication', 'pre-verbal', 'ASL', 'baby talk'],
      'published', 334, 89, 0)
    RETURNING id INTO a6;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u1,
      'What I Wish I Knew Before Using a Baby Monitor with AI Detection',
      'We bought a top-rated smart monitor but nobody told us about the false alarms, privacy concerns, or the anxiety spiral that comes with watching every breath. Here''s an honest review after 3 months of use.',
      'general',
      ARRAY['baby monitor', 'tech', 'safety'],
      ARRAY['baby monitor', 'smart monitor', 'AI monitor', 'baby safety', 'breathing detection', 'privacy', 'sleep monitor'],
      'published', 167, 43, 0)
    RETURNING id INTO a7;

  INSERT INTO user_articles (user_id, title, content, category, tags, keywords, status, view_count, like_count, comment_count)
    VALUES (u3,
      'Reading to a Newborn: Does It Actually Help? We Tried It for 3 Months',
      'Our pediatrician recommended reading aloud from day one. I was skeptical — the baby can''t understand anything, right? After 3 months of daily reading sessions, here''s what we observed about her attention, calmness, and language exposure.',
      'development',
      ARRAY['reading', 'newborn', 'language development'],
      ARRAY['reading to baby', 'newborn reading', 'language development', 'early literacy', 'brain development', 'bonding', 'storytime'],
      'published', 256, 67, 0)
    RETURNING id INTO a8;

  -- ── Comments with tree structure ──────────────────────────────────────────────
  -- Article 1: Sleep article
  -- Root comment 1
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a1, u2, NULL, 'This is exactly what we needed! We''ve been struggling with our 3-month-old waking every 2 hours. Did you use any specific white noise frequency?', 12)
    RETURNING id INTO c1;
    -- Reply to c1
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a1, u1, c1, 'We used brown noise rather than white noise — it''s lower frequency and felt more calming. The app we used was "Baby Sleep Sounds" on iOS.', 8)
      RETURNING id INTO c2;
      -- Reply to c2 (depth 3)
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a1, u3, c2, 'Brown noise is a game changer! We switched from white noise and saw improvement in the first night. Thanks for the tip!', 5)
        RETURNING id INTO c3;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a1, u5, c2, 'Same here — pink noise also works well for some babies. Worth experimenting with a few before committing.', 3)
        RETURNING id INTO c4;
  -- Root comment 2
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a1, u4, NULL, 'As a pediatrician, I want to add that a consistent pre-sleep routine (bath, feed, song) is just as important as sound. Great article!', 24)
    RETURNING id INTO c5;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a1, u1, c5, 'Thank you Dr. Choi! We do a warm bath followed by a feed — do you recommend separating the feed from sleep to avoid sleep associations?', 7)
      RETURNING id INTO c6;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a1, u4, c6, 'Yes — ideally there''s a short gap between the last feed and placing them in the crib awake. "Drowsy but awake" is the goal. It takes patience but is very effective.', 15)
        RETURNING id INTO c7;

  -- Article 2: Solid foods
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a2, u3, NULL, 'We''re at 5.5 months and thinking about starting soon. How did you handle the gagging reflex with BLW? It scared me the first time I saw it.', 9)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a2, u2, c1, 'Gagging is completely normal and different from choking! The gag reflex in babies is very forward in the mouth. Trust the process. I panicked the first week too, but they learn so fast.', 14)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a2, u4, c2, 'This is correct. Gagging is a safety mechanism. The key difference: gagging = noisy and the baby stays calm; choking = silent and the baby can''t breathe. First aid training for parents is always recommended.', 31)
        RETURNING id INTO c3;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a2, u3, c2, 'That distinction really helps, thank you! Going to watch some videos before we start.', 6)
        RETURNING id INTO c4;
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a2, u5, NULL, 'The iron point is so important. Rice cereal gets a bad rap but it''s actually iron-fortified for a reason at 6 months.', 11)
    RETURNING id INTO c5;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a2, u2, c5, 'Absolutely. We mixed iron-fortified oatmeal with breast milk for the first few weeks alongside BLW. It''s not either/or!', 8)
      RETURNING id INTO c6;

  -- Article 3: Tummy Time (doctor article — deeper engagement)
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a3, u1, NULL, 'My baby absolutely hates tummy time and screams from the start. Any tips from Dr. Choi for a baby who refuses?', 18)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a3, u4, c1, 'Start with very short sessions — even 30 seconds — and build up. Place a small rolled towel under their chest to reduce the effort needed. Also try tummy time on your chest (skin to skin) rather than on the floor first.', 29)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a3, u1, c2, 'We tried the rolled towel yesterday and she lasted 3 minutes without crying! That''s a record. Thank you Doctor!', 16)
        RETURNING id INTO c3;
        INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
          VALUES (a3, u4, c3, 'That''s wonderful progress! Try to increase by 30 seconds every 2-3 days. You''ll reach 15 minutes total per day before you know it.', 12)
          RETURNING id INTO c4;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a3, u3, c2, 'The chest trick is also great for bonding. We did this every morning and it helped so much. Highly recommend!', 9)
        RETURNING id INTO c5;
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a3, u5, NULL, 'Is there a minimum age to start? Our baby is only 2 weeks old.', 7)
    RETURNING id INTO c6;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a3, u4, c6, 'You can start from birth! As long as the umbilical cord stump has healed, brief supervised tummy time is safe and beneficial. Start with just 1-2 minutes a few times per day.', 21)
      RETURNING id INTO c7;

  -- Article 4: Postpartum anxiety
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a4, u5, NULL, 'Thank you so much for writing this. I thought I was the only one. The intrusive thoughts were the worst part and I was too ashamed to tell anyone.', 47)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a4, u3, c1, 'You are absolutely not alone. I wish I had found this article 6 months earlier. How are you doing now?', 23)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a4, u5, c2, 'Much better after CBT therapy and low-dose medication. It took 3 months to feel like myself again. Reach out if you need to talk.', 38)
        RETURNING id INTO c3;
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a4, u4, NULL, 'As a pediatrician I see postpartum anxiety frequently in the mothers I work with. Please always tell your OB or midwife — there is no shame and there is effective treatment. Brave article.', 52)
    RETURNING id INTO c4;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a4, u3, c4, 'Thank you Doctor. I waited because I thought it would go away on its own. I wish a doctor had asked me directly. Maybe a screening tool at the 2-week visit?', 19)
      RETURNING id INTO c5;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a4, u4, c5, 'The Edinburgh Postnatal Depression Scale covers anxiety symptoms too. I ask every mother at the 2-week and 6-week visits. If your doctor doesn''t, please bring it up yourself.', 28)
        RETURNING id INTO c6;

  -- Article 5: Screen free evenings
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a5, u1, NULL, 'How do you handle it when your toddler sees the TV on and wants to watch? Our 16-month-old has total meltdowns when we say no.', 13)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a5, u5, c1, 'We found that consistency is everything. The first week was brutal — there were definitely meltdowns. But by week 2 he stopped asking. The key was having a compelling alternative ready (in our case, bath toys and sensory bins).', 17)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a5, u1, c2, 'Sensory bins — that''s a great idea. Do you make your own or buy pre-made?', 5)
        RETURNING id INTO c3;
        INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
          VALUES (a5, u5, c3, 'Mostly DIY — dried rice with scoops and cups, water beads in a tray, kinetic sand. Pinterest has tons of ideas for 12-18 month sensory play!', 9)
          RETURNING id INTO c4;

  -- Article 6: Baby sign language
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a6, u1, NULL, 'Does sign language delay speech? I''ve heard conflicting things.', 22)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a6, u4, c1, 'No — this is a myth. Research consistently shows that sign language supports verbal speech development rather than delaying it. It reduces frustration and actually motivates babies to communicate more.', 35)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a6, u2, c2, 'Confirmed from our experience. Our daughter started saying the words out loud around the same time she signed them, not after. The signs seemed to reinforce the sounds.', 18)
        RETURNING id INTO c3;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a6, u1, c2, 'That''s reassuring! We''ll start this weekend. Which sign did you teach first?', 4)
        RETURNING id INTO c4;
        INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
          VALUES (a6, u2, c4, '"More" is usually the easiest and most motivating because you can reinforce it during every meal. Then "all done" and "milk". Good luck!', 11)
          RETURNING id INTO c5;

  -- Article 7: Baby monitor
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a7, u3, NULL, 'The anxiety spiral is SO real. We ended up watching the monitor more than sleeping. Had to delete the app on my phone just to get some rest.', 28)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a7, u1, c1, 'Exactly this. We set a rule — no checking unless the alarm goes off. It took 3 nights of willpower but now I actually sleep.', 19)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a7, u5, c2, 'Or get an audio-only monitor. Less data = less anxiety. We switched back from video and sleep quality improved for both me and the baby.', 14)
        RETURNING id INTO c3;

  -- Article 8: Reading to newborn
  INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
    VALUES (a8, u2, NULL, 'We read every night but I always wondered if it actually helps or if we''re just doing it because it feels nice. What specific changes did you notice?', 15)
    RETURNING id INTO c1;
    INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
      VALUES (a8, u3, c1, 'Attention span was the biggest thing. By month 2 she would stay focused on the pages for 5-6 minutes. She also started responding to my voice differently — turning her head toward the book when I read in my "story voice".', 21)
      RETURNING id INTO c2;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a8, u4, c2, 'The research supports this. Reading aloud builds vocabulary, phonological awareness, and emotional bonding — all before the child can understand the meaning of words. The rhythm and intonation of language is being absorbed.', 33)
        RETURNING id INTO c3;
        INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
          VALUES (a8, u2, c3, 'That''s fascinating. What kind of books are best for newborns — high contrast picture books or regular stories?', 6)
          RETURNING id INTO c4;
          INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
            VALUES (a8, u4, c4, 'High-contrast black and white images for 0-3 months (vision is limited). After 3 months, colorful pictures and simple rhyming text. By 6 months, board books they can touch and chew!', 24)
            RETURNING id INTO c5;
      INSERT INTO user_article_comments (article_id, user_id, parent_id, content, like_count)
        VALUES (a8, u5, c2, 'Reading in different voices for different characters also helps. My husband does all the silly voices and our son literally giggles at 2 months old at the same spots every time.', 16)
        RETURNING id INTO c6;

  -- Update comment_count for all seeded articles
  UPDATE user_articles SET comment_count = (
    SELECT COUNT(*) FROM user_article_comments c WHERE c.article_id = user_articles.id
  ) WHERE user_id IN (u1, u2, u3, u4, u5);

END $$;

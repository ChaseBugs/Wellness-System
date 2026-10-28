import { Pool } from 'pg';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  const dbPassword = process.env.DB_PASSWORD;
  const dbConfig: any = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'talent_baby_db',
    user: process.env.DB_USER || 'postgres',
  };

  if (dbPassword && dbPassword.trim() !== '') {
    dbConfig.password = dbPassword;
  }

  const pool = new Pool(dbConfig);

  try {
    console.log('Seeding database with initial data...');

    // 1. Talent Categories (already inserted in schema, but ensure they exist)
    console.log('Checking talent categories...');
    const talentCategories = [
      { name: 'Creativity', description: 'Artistic expression, imagination, and creative thinking' },
      { name: 'Music Sensitivity', description: 'Musical awareness, rhythm, and sound recognition' },
      { name: 'Logical Thinking', description: 'Problem-solving, pattern recognition, and analytical skills' },
      { name: 'Language Ability', description: 'Communication, vocabulary, and linguistic skills' },
      { name: 'Physical Coordination', description: 'Motor skills, balance, and physical dexterity' },
      { name: 'Social Leadership', description: 'Social interaction, empathy, and leadership qualities' },
      { name: 'Curiosity & Problem-Solving', description: 'Inquisitiveness, exploration, and critical thinking' },
    ];

    for (const category of talentCategories) {
      await pool.query(
        `INSERT INTO talent_categories (name, description) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO NOTHING`,
        [category.name, category.description]
      );
    }
    console.log('✓ Talent categories seeded');

    // 2. Sample Activities (age-appropriate activities)
    console.log('Seeding sample activities...');
    const activities = [
      // 0-3 months
      {
        title: 'Tummy Time',
        description: 'Place baby on tummy for short periods to strengthen neck and back muscles',
        category: 'physical',
        age_range_min_months: 0,
        age_range_max_months: 6,
        duration_minutes: 5,
        difficulty_level: 'easy',
        materials_needed: ['soft mat', 'toy'],
        instructions: 'Place baby on tummy for 2-5 minutes, 2-3 times daily. Use colorful toys to encourage head lifting.',
        learning_outcomes: ['neck strength', 'head control', 'motor development'],
      },
      {
        title: 'High Contrast Cards',
        description: 'Show black and white cards to stimulate visual development',
        category: 'cognitive',
        age_range_min_months: 0,
        age_range_max_months: 3,
        duration_minutes: 5,
        difficulty_level: 'easy',
        materials_needed: ['high contrast cards'],
        instructions: 'Hold cards 8-12 inches from baby\'s face. Move slowly to track eye movement.',
        learning_outcomes: ['visual tracking', 'focus', 'cognitive development'],
      },
      {
        title: 'Singing & Rhymes',
        description: 'Sing songs and recite nursery rhymes to develop language skills',
        category: 'language',
        age_range_min_months: 0,
        age_range_max_months: 12,
        duration_minutes: 10,
        difficulty_level: 'easy',
        materials_needed: [],
        instructions: 'Sing simple songs, recite nursery rhymes. Use gestures and facial expressions.',
        learning_outcomes: ['language development', 'rhythm', 'bonding'],
      },
      // 3-6 months
      {
        title: 'Reach & Grab',
        description: 'Encourage baby to reach for and grasp objects',
        category: 'physical',
        age_range_min_months: 3,
        age_range_max_months: 6,
        duration_minutes: 10,
        difficulty_level: 'easy',
        materials_needed: ['rattles', 'soft toys'],
        instructions: 'Place toys just out of reach. Encourage baby to reach and grab.',
        learning_outcomes: ['hand-eye coordination', 'grasping', 'motor skills'],
      },
      {
        title: 'Peek-a-Boo',
        description: 'Classic game to develop object permanence',
        category: 'cognitive',
        age_range_min_months: 3,
        age_range_max_months: 12,
        duration_minutes: 5,
        difficulty_level: 'easy',
        materials_needed: ['blanket or hands'],
        instructions: 'Hide your face behind hands or blanket, then reveal with "peek-a-boo!"',
        learning_outcomes: ['object permanence', 'social interaction', 'anticipation'],
      },
      // 6-12 months
      {
        title: 'Stacking Blocks',
        description: 'Stack and knock down blocks to develop fine motor skills',
        category: 'physical',
        age_range_min_months: 6,
        age_range_max_months: 18,
        duration_minutes: 15,
        difficulty_level: 'medium',
        materials_needed: ['soft blocks'],
        instructions: 'Show baby how to stack blocks. Let them explore and knock down.',
        learning_outcomes: ['fine motor skills', 'hand-eye coordination', 'cause and effect'],
      },
      {
        title: 'Reading Books',
        description: 'Read picture books to develop language and attention',
        category: 'language',
        age_range_min_months: 6,
        age_range_max_months: 24,
        duration_minutes: 10,
        difficulty_level: 'easy',
        materials_needed: ['picture books'],
        instructions: 'Read colorful picture books. Point to pictures and name objects.',
        learning_outcomes: ['vocabulary', 'attention span', 'love of reading'],
      },
      {
        title: 'Music & Movement',
        description: 'Play music and encourage movement and dancing',
        category: 'music',
        age_range_min_months: 6,
        age_range_max_months: 24,
        duration_minutes: 15,
        difficulty_level: 'easy',
        materials_needed: ['music player', 'instruments'],
        instructions: 'Play upbeat music. Dance with baby, clap hands, move to rhythm.',
        learning_outcomes: ['rhythm', 'coordination', 'musical awareness'],
      },
      // 12-24 months
      {
        title: 'Shape Sorter',
        description: 'Match shapes to develop problem-solving skills',
        category: 'cognitive',
        age_range_min_months: 12,
        age_range_max_months: 24,
        duration_minutes: 15,
        difficulty_level: 'medium',
        materials_needed: ['shape sorter toy'],
        instructions: 'Show baby how to match shapes. Encourage independent play.',
        learning_outcomes: ['problem-solving', 'shape recognition', 'patience'],
      },
      {
        title: 'Pretend Play',
        description: 'Encourage imaginative play with toys',
        category: 'social',
        age_range_min_months: 12,
        age_range_max_months: 36,
        duration_minutes: 20,
        difficulty_level: 'medium',
        materials_needed: ['dolls', 'toy kitchen', 'vehicles'],
        instructions: 'Engage in pretend play. Model actions like feeding dolls or driving cars.',
        learning_outcomes: ['imagination', 'social skills', 'language'],
      },
    ];

    for (const activity of activities) {
      await pool.query(
        `INSERT INTO activities 
         (title, description, category, age_range_min_months, age_range_max_months, 
          duration_minutes, difficulty_level, materials_needed, instructions, learning_outcomes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [
          activity.title,
          activity.description,
          activity.category,
          activity.age_range_min_months,
          activity.age_range_max_months,
          activity.duration_minutes,
          activity.difficulty_level,
          activity.materials_needed,
          activity.instructions,
          activity.learning_outcomes,
        ]
      );
    }
    console.log(`✓ ${activities.length} activities seeded`);

    // 3. Daily Updates Content
    console.log('Seeding daily updates content...');
    const dailyUpdates = [
      // 0-1 month
      {
        age_in_months: 0,
        content_type: 'tip',
        title: 'Newborn Care Tips',
        content: 'Newborns sleep 14-17 hours per day. Ensure safe sleep practices: place baby on back, firm mattress, no loose bedding.',
      },
      {
        age_in_months: 0,
        content_type: 'development',
        title: 'Newborn Development',
        content: 'Your newborn can see 8-12 inches away. They respond to voices and prefer high-contrast patterns.',
      },
      {
        age_in_months: 0,
        content_type: 'safety',
        title: 'Safety Reminder',
        content: 'Always support baby\'s head and neck. Never shake a baby. Keep small objects out of reach.',
      },
      // 1-2 months
      {
        age_in_months: 1,
        content_type: 'tip',
        title: 'Feeding Schedule',
        content: 'Most 1-month-olds feed every 2-3 hours. Watch for hunger cues like rooting or sucking motions.',
      },
      {
        age_in_months: 1,
        content_type: 'development',
        title: 'Motor Development',
        content: 'Baby may start to lift head briefly during tummy time. This strengthens neck muscles.',
      },
      // 2-3 months
      {
        age_in_months: 2,
        content_type: 'tip',
        title: 'Sleep Patterns',
        content: 'Babies this age may start sleeping longer at night. Establish a bedtime routine.',
      },
      {
        age_in_months: 2,
        content_type: 'development',
        title: 'Social Development',
        content: 'Your baby may start smiling in response to your face. This is a major social milestone!',
      },
      // 3-6 months
      {
        age_in_months: 3,
        content_type: 'activity',
        title: 'Activity Suggestion',
        content: 'Try reading board books with high-contrast images. Point to pictures and name objects.',
      },
      {
        age_in_months: 4,
        content_type: 'development',
        title: 'Physical Milestones',
        content: 'Many babies can roll over by 4-6 months. Always supervise during tummy time.',
      },
      {
        age_in_months: 5,
        content_type: 'tip',
        title: 'Solid Food Introduction',
        content: 'Around 6 months, you can start introducing solid foods. Begin with single-ingredient purees.',
      },
      // 6-12 months
      {
        age_in_months: 6,
        content_type: 'development',
        title: 'Sitting Up',
        content: 'Most babies can sit without support by 8 months. Provide safe spaces for practice.',
      },
      {
        age_in_months: 8,
        content_type: 'activity',
        title: 'Crawling Activities',
        content: 'Encourage crawling with toys just out of reach. This builds strength and coordination.',
      },
      {
        age_in_months: 10,
        content_type: 'development',
        title: 'Language Development',
        content: 'Babies may say first words around 10-12 months. Talk to your baby frequently.',
      },
      // 12-24 months
      {
        age_in_months: 12,
        content_type: 'tip',
        title: 'Toddler Nutrition',
        content: 'Offer a variety of healthy foods. Let your toddler explore textures and flavors.',
      },
      {
        age_in_months: 15,
        content_type: 'development',
        title: 'Walking Milestone',
        content: 'Most toddlers walk independently by 15-18 months. Provide safe spaces for practice.',
      },
      {
        age_in_months: 18,
        content_type: 'activity',
        title: 'Pretend Play',
        content: 'Encourage imaginative play with dolls, toy kitchen, or vehicles. This develops creativity.',
      },
    ];

    for (const update of dailyUpdates) {
      await pool.query(
        `INSERT INTO daily_updates_content 
         (age_in_months, content_type, title, content)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [update.age_in_months, update.content_type, update.title, update.content]
      );
    }
    console.log(`✓ ${dailyUpdates.length} daily updates seeded`);

    // 4. Assessment Questions (sample questions for each talent category)
    console.log('Seeding assessment questions...');
    const talentCategoryResult = await pool.query('SELECT id, name FROM talent_categories');
    const talentCategoriesMap = new Map(
      talentCategoryResult.rows.map((row: any) => [row.name, row.id])
    );

    const assessmentQuestions = [
      // Creativity questions
      {
        talent_category_name: 'Creativity',
        question_text: 'Does your baby show interest in colorful objects and patterns?',
        question_type: 'yes_no',
        age_range_min_months: 0,
        age_range_max_months: 6,
        weight: 1,
      },
      {
        talent_category_name: 'Creativity',
        question_text: 'Does your baby enjoy exploring different textures and materials?',
        question_type: 'yes_no',
        age_range_min_months: 6,
        age_range_max_months: 12,
        weight: 1,
      },
      {
        talent_category_name: 'Creativity',
        question_text: 'Does your baby engage in pretend play or imaginative activities?',
        question_type: 'yes_no',
        age_range_min_months: 12,
        age_range_max_months: 24,
        weight: 2,
      },
      // Music Sensitivity questions
      {
        talent_category_name: 'Music Sensitivity',
        question_text: 'Does your baby respond to music by moving, smiling, or cooing?',
        question_type: 'yes_no',
        age_range_min_months: 0,
        age_range_max_months: 6,
        weight: 1,
      },
      {
        talent_category_name: 'Music Sensitivity',
        question_text: 'Does your baby try to make sounds or "sing" along to music?',
        question_type: 'yes_no',
        age_range_min_months: 6,
        age_range_max_months: 12,
        weight: 2,
      },
      {
        talent_category_name: 'Music Sensitivity',
        question_text: 'Does your baby show rhythm by clapping, dancing, or moving to music?',
        question_type: 'scale',
        options: { min: 1, max: 5, labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
        age_range_min_months: 12,
        age_range_max_months: 24,
        weight: 2,
      },
      // Logical Thinking questions
      {
        talent_category_name: 'Logical Thinking',
        question_text: 'Does your baby show interest in cause-and-effect toys?',
        question_type: 'yes_no',
        age_range_min_months: 6,
        age_range_max_months: 12,
        weight: 1,
      },
      {
        talent_category_name: 'Logical Thinking',
        question_text: 'Does your baby try to solve simple problems (e.g., reaching for objects)?',
        question_type: 'scale',
        options: { min: 1, max: 5 },
        age_range_min_months: 12,
        age_range_max_months: 24,
        weight: 2,
      },
      {
        talent_category_name: 'Logical Thinking',
        question_text: 'Does your baby recognize patterns or sequences?',
        question_type: 'yes_no',
        age_range_min_months: 18,
        age_range_max_months: 36,
        weight: 2,
      },
      // Language Ability questions
      {
        talent_category_name: 'Language Ability',
        question_text: 'Does your baby respond to your voice by turning head or making sounds?',
        question_type: 'yes_no',
        age_range_min_months: 0,
        age_range_max_months: 6,
        weight: 1,
      },
      {
        talent_category_name: 'Language Ability',
        question_text: 'Does your baby babble or make different sounds?',
        question_type: 'yes_no',
        age_range_min_months: 6,
        age_range_max_months: 12,
        weight: 1,
      },
      {
        talent_category_name: 'Language Ability',
        question_text: 'How many words can your baby say?',
        question_type: 'multiple_choice',
        options: {
          '0-5 words': { score: 1 },
          '6-10 words': { score: 3 },
          '11-20 words': { score: 4 },
          '20+ words': { score: 5 },
        },
        age_range_min_months: 12,
        age_range_max_months: 24,
        weight: 3,
      },
      // Physical Coordination questions
      {
        talent_category_name: 'Physical Coordination',
        question_text: 'Does your baby lift head during tummy time?',
        question_type: 'yes_no',
        age_range_min_months: 0,
        age_range_max_months: 3,
        weight: 1,
      },
      {
        talent_category_name: 'Physical Coordination',
        question_text: 'Can your baby sit without support?',
        question_type: 'yes_no',
        age_range_min_months: 6,
        age_range_max_months: 9,
        weight: 2,
      },
      {
        talent_category_name: 'Physical Coordination',
        question_text: 'Can your baby walk independently?',
        question_type: 'yes_no',
        age_range_min_months: 12,
        age_range_max_months: 18,
        weight: 3,
      },
      // Social Leadership questions
      {
        talent_category_name: 'Social Leadership',
        question_text: 'Does your baby smile in response to faces?',
        question_type: 'yes_no',
        age_range_min_months: 2,
        age_range_max_months: 4,
        weight: 1,
      },
      {
        talent_category_name: 'Social Leadership',
        question_text: 'Does your baby show interest in other children?',
        question_type: 'yes_no',
        age_range_min_months: 12,
        age_range_max_months: 24,
        weight: 2,
      },
      {
        talent_category_name: 'Social Leadership',
        question_text: 'Does your baby share toys or take turns?',
        question_type: 'scale',
        options: { min: 1, max: 5 },
        age_range_min_months: 18,
        age_range_max_months: 36,
        weight: 2,
      },
      // Curiosity & Problem-Solving questions
      {
        talent_category_name: 'Curiosity & Problem-Solving',
        question_text: 'Does your baby explore objects by touching, mouthing, or shaking?',
        question_type: 'yes_no',
        age_range_min_months: 3,
        age_range_max_months: 9,
        weight: 1,
      },
      {
        talent_category_name: 'Curiosity & Problem-Solving',
        question_text: 'Does your baby try to figure out how toys work?',
        question_type: 'yes_no',
        age_range_min_months: 9,
        age_range_max_months: 18,
        weight: 2,
      },
      {
        talent_category_name: 'Curiosity & Problem-Solving',
        question_text: 'Does your baby ask questions or show curiosity about surroundings?',
        question_type: 'scale',
        options: { min: 1, max: 5 },
        age_range_min_months: 18,
        age_range_max_months: 36,
        weight: 3,
      },
    ];

    for (const question of assessmentQuestions) {
      const categoryId = talentCategoriesMap.get(question.talent_category_name);
      if (categoryId) {
        await pool.query(
          `INSERT INTO assessment_questions 
           (talent_category_id, question_text, question_type, options, age_range_min_months, age_range_max_months, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            categoryId,
            question.question_text,
            question.question_type,
            question.options ? JSON.stringify(question.options) : null,
            question.age_range_min_months,
            question.age_range_max_months,
            question.weight,
          ]
        );
      }
    }
    console.log(`✓ ${assessmentQuestions.length} assessment questions seeded`);

    // 5. Sample Materials
    console.log('Seeding sample materials...');
    const materials = [
      {
        title: 'High Contrast Baby Cards',
        type: 'toy',
        description: 'Black and white cards for visual stimulation (0-3 months)',
        category: 'visual',
        age_range_min_months: 0,
        age_range_max_months: 3,
        talent_categories: [talentCategoriesMap.get('Creativity')],
      },
      {
        title: 'Soft Building Blocks',
        type: 'toy',
        description: 'Soft, colorful blocks for stacking and building (6-18 months)',
        category: 'motor',
        age_range_min_months: 6,
        age_range_max_months: 18,
        talent_categories: [talentCategoriesMap.get('Physical Coordination'), talentCategoriesMap.get('Logical Thinking')],
      },
      {
        title: 'Board Books Collection',
        type: 'book',
        description: 'Durable picture books for early reading (6-24 months)',
        category: 'language',
        age_range_min_months: 6,
        age_range_max_months: 24,
        talent_categories: [talentCategoriesMap.get('Language Ability')],
      },
      {
        title: 'Musical Instruments Set',
        type: 'toy',
        description: 'Child-safe musical instruments (6-24 months)',
        category: 'music',
        age_range_min_months: 6,
        age_range_max_months: 24,
        talent_categories: [talentCategoriesMap.get('Music Sensitivity')],
      },
      {
        title: 'Shape Sorter Toy',
        type: 'toy',
        description: 'Educational shape sorting toy (12-24 months)',
        category: 'cognitive',
        age_range_min_months: 12,
        age_range_max_months: 24,
        talent_categories: [talentCategoriesMap.get('Logical Thinking'), talentCategoriesMap.get('Curiosity & Problem-Solving')],
      },
    ];

    for (const material of materials) {
      await pool.query(
        `INSERT INTO materials 
         (title, type, description, category, age_range_min_months, age_range_max_months, talent_categories)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [
          material.title,
          material.type,
          material.description,
          material.category,
          material.age_range_min_months,
          material.age_range_max_months,
          material.talent_categories.filter((id) => id !== undefined),
        ]
      );
    }
    console.log(`✓ ${materials.length} materials seeded`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSeeded data:');
    console.log(`  - ${talentCategories.length} talent categories`);
    console.log(`  - ${activities.length} activities`);
    console.log(`  - ${dailyUpdates.length} daily updates`);
    console.log(`  - ${assessmentQuestions.length} assessment questions`);
    console.log(`  - ${materials.length} materials`);

    await pool.end();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

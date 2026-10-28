import { Pool } from 'pg';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function seedGuidesAndStories() {
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
    console.log('Seeding guides and stories...');

    // 1. Sleep Guides
    console.log('Seeding sleep guides...');
    const sleepGuides = [
      {
        age_min_months: 0,
        age_max_months: 3,
        title: 'Newborn Sleep Guide (0-3 months)',
        content: 'Newborns sleep 14-17 hours per day in short bursts. They don\'t yet have a circadian rhythm, so sleep is distributed throughout day and night.',
        tips: [
          'Place baby on back to sleep',
          'Use firm mattress with fitted sheet',
          'Keep crib free of blankets, pillows, and toys',
          'Room-share but not bed-share',
          'Establish a bedtime routine early',
        ],
        schedule_recommendations: {
          total_sleep: '14-17 hours',
          naps: '3-5 naps per day',
          night_sleep: '8-9 hours (interrupted)',
          wake_windows: '45-90 minutes',
        },
        troubleshooting: [
          'If baby won\'t sleep, check for hunger, wet diaper, or overstimulation',
          'Swaddling can help newborns feel secure',
          'White noise may help soothe baby',
        ],
      },
      {
        age_min_months: 3,
        age_max_months: 6,
        title: 'Infant Sleep Guide (3-6 months)',
        content: 'Babies start developing a more regular sleep pattern. They may sleep longer at night and take 2-3 naps during the day.',
        tips: [
          'Establish consistent bedtime routine',
          'Put baby down drowsy but awake',
          'Create dark, quiet sleep environment',
          'Start sleep training if ready (4-6 months)',
          'Watch for sleep regression around 4 months',
        ],
        schedule_recommendations: {
          total_sleep: '12-15 hours',
          naps: '2-3 naps per day',
          night_sleep: '10-12 hours (may wake 1-2 times)',
          wake_windows: '1.5-2.5 hours',
        },
        troubleshooting: [
          '4-month sleep regression is normal - stick to routine',
          'If baby wakes frequently, check for teething or growth spurt',
          'Consider sleep training methods if baby is 4+ months',
        ],
      },
      {
        age_min_months: 6,
        age_max_months: 12,
        title: 'Baby Sleep Guide (6-12 months)',
        content: 'Most babies can sleep through the night by 6 months. They typically take 2 naps per day and sleep 12-14 hours total.',
        tips: [
          'Maintain consistent sleep schedule',
          'Transition to 2 naps around 6-9 months',
          'Continue bedtime routine',
          'Address separation anxiety at bedtime',
          'Ensure baby gets enough daytime activity',
        ],
        schedule_recommendations: {
          total_sleep: '12-14 hours',
          naps: '2 naps per day',
          night_sleep: '10-12 hours (may wake occasionally)',
          wake_windows: '2.5-3.5 hours',
        },
        troubleshooting: [
          'Separation anxiety can cause sleep issues - reassure baby',
          'Teething may disrupt sleep - offer comfort',
          'If baby stands in crib, teach them to sit back down',
        ],
      },
    ];

    for (const guide of sleepGuides) {
      await pool.query(
        `INSERT INTO sleep_guides 
         (age_min_months, age_max_months, title, content, tips, schedule_recommendations, troubleshooting)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [
          guide.age_min_months,
          guide.age_max_months,
          guide.title,
          guide.content,
          guide.tips,
          JSON.stringify(guide.schedule_recommendations),
          guide.troubleshooting,
        ]
      );
    }
    console.log(`✓ ${sleepGuides.length} sleep guides seeded`);

    // 2. Feeding Guides
    console.log('Seeding feeding guides...');
    const feedingGuides = [
      {
        age_min_months: 0,
        age_max_months: 6,
        title: 'Newborn & Infant Feeding Guide (0-6 months)',
        content: 'For the first 6 months, breast milk or formula provides all the nutrition your baby needs. Most babies feed 8-12 times per day.',
        tips: [
          'Feed on demand - watch for hunger cues',
          'Newborns typically feed every 2-3 hours',
          'Ensure proper latch for breastfeeding',
          'Burp baby after feeding',
          'Track wet diapers (6+ per day is normal)',
        ],
        nutrition_info: {
          primary_nutrition: 'Breast milk or formula',
          daily_amount: '600-900ml (20-30oz)',
          feeding_frequency: '8-12 times per day',
        },
        schedule_recommendations: {
          newborn: 'Every 2-3 hours',
          '1-3_months': 'Every 3-4 hours',
          '4-6_months': 'Every 4-5 hours',
        },
        food_introduction_timeline: null,
        adequacy_assessment_questions: [
          {
            question: 'How many wet diapers per day?',
            options: ['Less than 6', '6-8', '8-10', '10+'],
          },
          {
            question: 'Is baby gaining weight appropriately?',
            options: ['Yes', 'No', 'Unsure'],
          },
        ],
      },
      {
        age_min_months: 6,
        age_max_months: 12,
        title: 'Baby Feeding Guide (6-12 months)',
        content: 'Around 6 months, you can start introducing solid foods. Continue breast milk or formula as primary nutrition.',
        tips: [
          'Start with single-ingredient purees',
          'Introduce one new food every 3-5 days',
          'Watch for allergic reactions',
          'Continue breast milk/formula (24-32oz daily)',
          'Offer finger foods around 8-9 months',
        ],
        nutrition_info: {
          primary_nutrition: 'Breast milk/formula + solid foods',
          daily_milk: '600-800ml (20-27oz)',
          solid_foods: '2-3 meals per day',
        },
        schedule_recommendations: {
          '6_months': 'Milk: 4-5 times, Solids: 1-2 meals',
          '7-9_months': 'Milk: 3-4 times, Solids: 2-3 meals',
          '10-12_months': 'Milk: 3 times, Solids: 3 meals + snacks',
        },
        food_introduction_timeline: {
          '6_months': ['Rice cereal', 'Single-vegetable purees', 'Single-fruit purees'],
          '7-8_months': ['Meat purees', 'Yogurt', 'Eggs', 'More textures'],
          '9-12_months': ['Finger foods', 'Soft table foods', 'Variety of textures'],
        },
        adequacy_assessment_questions: [
          {
            question: 'Is baby eating a variety of foods?',
            options: ['Yes', 'No', 'Limited variety'],
          },
          {
            question: 'Is baby showing interest in food?',
            options: ['Very interested', 'Somewhat interested', 'Not interested'],
          },
        ],
      },
    ];

    for (const guide of feedingGuides) {
      await pool.query(
        `INSERT INTO feeding_guides 
         (age_min_months, age_max_months, title, content, tips, nutrition_info, 
          schedule_recommendations, food_introduction_timeline, adequacy_assessment_questions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [
          guide.age_min_months,
          guide.age_max_months,
          guide.title,
          guide.content,
          guide.tips,
          JSON.stringify(guide.nutrition_info),
          JSON.stringify(guide.schedule_recommendations),
          guide.food_introduction_timeline ? JSON.stringify(guide.food_introduction_timeline) : null,
          JSON.stringify(guide.adequacy_assessment_questions),
        ]
      );
    }
    console.log(`✓ ${feedingGuides.length} feeding guides seeded`);

    // 3. Story Categories
    console.log('Seeding story categories...');
    const storyCategories = [
      { name: 'Adventure', description: 'Exciting adventure stories', icon_url: null },
      { name: 'Animals', description: 'Stories about animals', icon_url: null },
      { name: 'Bedtime', description: 'Calming bedtime stories', icon_url: null },
      { name: 'Educational', description: 'Educational and learning stories', icon_url: null },
      { name: 'Fairy Tales', description: 'Classic fairy tales', icon_url: null },
      { name: 'Nature', description: 'Stories about nature', icon_url: null },
    ];

    for (const category of storyCategories) {
      await pool.query(
        `INSERT INTO story_categories (name, description, icon_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [category.name, category.description, category.icon_url]
      );
    }
    console.log(`✓ ${storyCategories.length} story categories seeded`);

    // 4. Bedtime Stories
    console.log('Seeding bedtime stories...');
    const categoryResult = await pool.query('SELECT id, name FROM story_categories');
    const categoriesMap = new Map(categoryResult.rows.map((row: any) => [row.name, row.id]));

    const stories = [
      {
        title: 'The Sleepy Little Star',
        description: 'A calming story about a little star who learns to sleep peacefully',
        content: 'Once upon a time, there was a little star who couldn\'t sleep. The moon taught the star how to close its eyes and dream beautiful dreams...',
        category: 'Bedtime',
        age_min_months: 0,
        age_max_months: 24,
        duration_minutes: 5,
        author: 'Talent Baby Team',
      },
      {
        title: 'The Curious Kitten',
        description: 'A story about a curious kitten exploring the world',
        content: 'There was a little kitten named Whiskers who loved to explore. Every day, Whiskers discovered something new and exciting...',
        category: 'Animals',
        age_min_months: 6,
        age_max_months: 36,
        duration_minutes: 8,
        author: 'Talent Baby Team',
      },
      {
        title: 'The Magic Garden',
        description: 'An educational story about plants and nature',
        content: 'In a magical garden, flowers could talk and trees could sing. A little girl learned about how plants grow and why they need water and sunlight...',
        category: 'Nature',
        age_min_months: 12,
        age_max_months: 48,
        duration_minutes: 10,
        author: 'Talent Baby Team',
      },
    ];

    for (const story of stories) {
      const categoryId = categoriesMap.get(story.category);
      await pool.query(
        `INSERT INTO bedtime_stories 
         (title, description, content, category, age_min_months, age_max_months, duration_minutes, author)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          story.title,
          story.description,
          story.content,
          story.category,
          story.age_min_months,
          story.age_max_months,
          story.duration_minutes,
          story.author,
        ]
      );
    }
    console.log(`✓ ${stories.length} bedtime stories seeded`);

    // 5. Content Topics
    console.log('Seeding content topics...');
    const topics = [
      { name: 'Feeding', description: 'All about feeding your baby', parent_topic_id: null },
      { name: 'Sleep', description: 'Sleep tips and guides', parent_topic_id: null },
      { name: 'Development', description: 'Baby development milestones', parent_topic_id: null },
      { name: 'Activities', description: 'Fun activities for babies', parent_topic_id: null },
      { name: 'Health', description: 'Baby health and wellness', parent_topic_id: null },
      { name: 'Nutrition', description: 'Nutrition and recipes', parent_topic_id: null },
      { name: 'Breastfeeding', description: 'Breastfeeding tips and support', parent_topic_id: 1 },
      { name: 'Solid Foods', description: 'Introducing solid foods', parent_topic_id: 1 },
      { name: 'Sleep Training', description: 'Sleep training methods', parent_topic_id: 2 },
    ];

    const topicIds: { [key: string]: number } = {};

    for (const topic of topics) {
      const result = await pool.query(
        `INSERT INTO content_topics (name, description, parent_topic_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING
         RETURNING id`,
        [topic.name, topic.description, topic.parent_topic_id || null]
      );
      if (result.rows.length > 0) {
        topicIds[topic.name] = result.rows[0].id;
      }
    }
    console.log(`✓ ${topics.length} content topics seeded`);

    console.log('\n✅ Guides and stories seeding completed successfully!');

    await pool.end();
  } catch (error) {
    console.error('Error seeding guides and stories:', error);
    process.exit(1);
  }
}

seedGuidesAndStories();

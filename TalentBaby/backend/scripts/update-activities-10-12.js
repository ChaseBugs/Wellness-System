/**
 * Update activities for months 10-12:
 * 1. Fix duplicate "Walking with Support" entry
 * 2. Correct month_max for activities seen in later months
 * 3. Add description, instructions, benefits for all missing activities
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost', port: 5432, database: 'talent_baby_db',
  user: 'postgres', password: '213515',
});

// Each entry: [title, sub_category, description, instructions, materials_needed[], benefits[]]
const ACTIVITIES = [
  // ── MONTH 10 ──────────────────────────────────────────────────────────────

  ['Stand Without Support', 'Balancing',
    'Practice standing independently without holding onto anything, building core strength and balance.',
    '1. Place baby on a soft mat in a clear space.\n2. Help baby stand upright, then gently let go while staying close.\n3. Cheer and encourage as baby holds the position.\n4. Catch or support if baby starts to fall.\n5. Repeat for short bursts of 5–10 seconds.',
    ['Soft play mat', 'Cushions nearby for safety'],
    ['Strengthens leg and core muscles', 'Develops balance and coordination', 'Builds confidence for independent walking', 'Improves postural control']
  ],

  ['Peekaboo Bath', 'Early Exploration',
    'A fun water-based peekaboo game that turns bath time into an exciting exploration experience.',
    '1. Fill the bathtub with a comfortable water level.\n2. Hold a small towel or washcloth over your face.\n3. Say "Where is Mommy?" then pull it away saying "Peekaboo!"\n4. Let baby grab the towel and try the same game.\n5. Repeat with different objects floating in the water.',
    ['Soft washcloth', 'Bath toys', 'Small towel'],
    ['Introduces object permanence concept', 'Makes bath time enjoyable', 'Stimulates visual tracking', 'Encourages cause-and-effect thinking']
  ],

  ['Learning Through Books', 'Early Knowledge',
    'Share simple picture books with your baby to introduce words, images, and the joy of reading together.',
    '1. Choose a simple board book with bright pictures.\n2. Sit comfortably with baby on your lap.\n3. Point to each picture and name it clearly.\n4. Use different voices and sounds to bring characters to life.\n5. Let baby touch and turn pages with your guidance.',
    ['Board books with bright pictures', 'Cloth books'],
    ['Builds vocabulary and language skills', 'Introduces concepts like animals, colors, and shapes', 'Creates a love for reading', 'Strengthens parent-child bond']
  ],

  ['Hugs And Kisses', 'Etiquette',
    'Teach baby the warmth of giving and receiving affection through gentle hugs and kisses with family.',
    '1. Hold baby and give a warm hug while saying "Hug!".\n2. Give a gentle kiss and say "Kiss!".\n3. Encourage baby to lean in for a hug or pucker up.\n4. Clap and praise when baby initiates affection.\n5. Practice with different family members.',
    ['None required'],
    ['Develops social bonding skills', 'Teaches appropriate expression of affection', 'Strengthens emotional connections', 'Builds trust and security']
  ],

  ['Do Messy Painting', 'Fine Motor',
    'Let baby explore paint with their hands and fingers, developing creativity and fine motor skills through sensory art.',
    '1. Lay a large sheet of paper on a protected surface.\n2. Put baby-safe, washable paint in small amounts on the paper.\n3. Guide baby\'s hands into the paint and let them explore.\n4. Encourage spreading, pressing, and patting motions.\n5. Display the artwork and clean up together.',
    ['Baby-safe washable paint', 'Large paper', 'Protective mat', 'Old clothes or bib'],
    ['Develops fine motor skills', 'Encourages creative expression', 'Provides rich sensory input', 'Builds hand-eye coordination']
  ],

  ['Granularity', 'Fine Motor',
    'Explore materials of different textures and grain sizes to develop tactile sensitivity and fine motor pinching skills.',
    '1. Fill small containers with rice, sand, or oats.\n2. Let baby touch, scoop, and pour between containers.\n3. Show baby how to pinch and pick up small amounts.\n4. Describe the textures: "rough", "smooth", "grainy".\n5. Supervise closely to prevent mouthing.',
    ['Rice or oats', 'Small containers', 'Tray or bin', 'Spoon'],
    ['Develops pincer grip', 'Stimulates tactile sensory system', 'Introduces texture vocabulary', 'Builds hand muscle strength']
  ],

  ['Stacking Rings', 'Fine Motor',
    'Stack colorful rings onto a central peg to develop hand-eye coordination and understanding of size sequences.',
    '1. Place the stacking ring toy on the floor in front of baby.\n2. Show how to slide a ring onto the peg.\n3. Hand baby a ring and guide their hand if needed.\n4. Cheer when a ring is placed successfully.\n5. Count rings together as you stack from largest to smallest.',
    ['Stacking ring toy'],
    ['Develops hand-eye coordination', 'Introduces size and sequence concepts', 'Builds wrist rotation skills', 'Encourages problem-solving']
  ],

  ['Tactical Grip', 'Fine Motor',
    'Practice grasping objects of different shapes and weights to develop a purposeful, coordinated grip.',
    '1. Offer baby objects of varying shapes: round ball, flat block, cylinder.\n2. Encourage baby to pick up and hold each one.\n3. Show how to transfer objects from one hand to the other.\n4. Offer slightly heavier objects as skills improve.\n5. Cheer each successful grip and transfer.',
    ['Soft balls', 'Wooden blocks', 'Cylinder toys'],
    ['Strengthens hand and finger muscles', 'Develops bilateral hand coordination', 'Improves grasp precision', 'Builds dexterity for future tool use']
  ],

  ['Finger Grasp', 'Finger Dexterity',
    'Practice picking up small objects using a pincer or tripod grasp to develop fine motor precision.',
    '1. Place small, safe objects (puffed cereal, soft cubes) on a tray.\n2. Demonstrate picking one up with two fingers.\n3. Encourage baby to try picking them up independently.\n4. Praise each attempt, successful or not.\n5. Gradually reduce object size as skill improves.',
    ['Puffed cereal or soft small cubes', 'Flat tray'],
    ['Develops pincer grip essential for writing', 'Strengthens finger muscles', 'Improves hand-eye coordination', 'Prepares for self-feeding']
  ],

  ['Finger Pinching And Poking', 'Finger Dexterity',
    'Practice pinching and poking soft materials to develop isolated finger movement and strength.',
    '1. Prepare soft play dough or a foam mat.\n2. Show baby how to poke with one finger.\n3. Encourage baby to make holes by pushing fingers in.\n4. Show pinching — squeezing between thumb and index finger.\n5. Make it playful: pop bubbles, press buttons on toys.',
    ['Play dough', 'Foam mat', 'Pop-it toy or bubble wrap'],
    ['Develops individual finger control', 'Builds pincer strength', 'Stimulates tactile feedback', 'Prepares fine motor skills for future tasks']
  ],

  ['Turning The Pages', 'Finger Dexterity',
    'Practice turning book pages to develop finger dexterity, bilateral coordination, and a love of books.',
    '1. Sit with baby and open a board book.\n2. Show how to grip and turn one page at a time.\n3. Help baby\'s fingers grasp a page edge and turn it.\n4. Celebrate each page turn with excitement.\n5. Progress to thinner paper pages as skill develops.',
    ['Board books', 'Cloth books', 'Picture books'],
    ['Develops fine motor precision', 'Builds bilateral hand coordination', 'Encourages early literacy habits', 'Strengthens finger pinch strength']
  ],

  ['Head To Head', 'Fun Time Together',
    'A gentle bonding game where baby and caregiver gently touch foreheads, sharing closeness and warmth.',
    '1. Sit facing baby at eye level.\n2. Slowly lean in and gently touch foreheads together.\n3. Say "Head to head!" in a warm, playful voice.\n4. Hold for a moment, then lean back smiling.\n5. Repeat and let baby lean in to initiate.',
    ['None required'],
    ['Deepens parent-child emotional bond', 'Encourages nonverbal communication', 'Creates a sense of security', 'Develops social reciprocity']
  ],

  ['Gesture Communication', 'Gesture Communication',
    'Teach baby to use simple gestures like waving, pointing, and reaching to communicate needs and ideas.',
    '1. Wave hello and goodbye every time you greet or part.\n2. Point to objects and say their names clearly.\n3. Reach out your arms asking for a hug and encourage baby to mimic.\n4. Use "more" gesture (fingertips together) at mealtimes.\n5. Respond enthusiastically whenever baby uses any gesture.',
    ['None required'],
    ['Establishes pre-verbal communication', 'Reduces frustration by giving baby a voice', 'Builds foundation for language development', 'Enhances joint attention skills']
  ],

  ['Walking With Assistance L1', 'Gross Motor',
    'Support baby\'s first walking steps by holding both hands and guiding their movement forward.',
    '1. Stand or kneel behind baby on a clear, safe floor.\n2. Hold both of baby\'s hands at shoulder height.\n3. Gently encourage baby to step forward one foot at a time.\n4. Move slowly, matching baby\'s pace.\n5. Practice for a few minutes and gradually loosen support.',
    ['Clear safe floor space', 'Non-slip socks or bare feet'],
    ['Develops leg strength and coordination', 'Builds walking confidence', 'Improves balance and posture', 'Prepares for independent walking']
  ],

  ['Yes & No L2', 'Language Comprehension',
    'Build understanding of yes/no responses through simple questions and clear positive or negative reactions.',
    '1. Ask simple yes/no questions: "Do you want water?" "Is this a ball?".\n2. Nod your head for yes and shake for no with each answer.\n3. Wait for baby to respond with head movement or sound.\n4. Praise correct responses enthusiastically.\n5. Use real situations — snack time, toy choices — for practice.',
    ['Familiar objects', 'Snacks'],
    ['Develops receptive language', 'Teaches head gesture for communication', 'Builds comprehension of simple questions', 'Encourages intentional communication']
  ],

  ['Find The Object', 'Memory and Attention',
    'Hide a toy partially or fully and encourage baby to search and find it, developing object permanence.',
    '1. Show baby an interesting toy and let them hold it.\n2. Slowly cover it with a small blanket while baby watches.\n3. Say "Where did it go?" with a curious expression.\n4. Wait for baby to reach and pull the blanket off.\n5. Celebrate the discovery! Gradually hide the toy more completely.',
    ['Small toy', 'Small blanket or cloth'],
    ['Develops object permanence', 'Builds memory and attention', 'Encourages intentional reaching', 'Stimulates problem-solving']
  ],

  ['Climbing Down A Step', 'Muscle development',
    'Practice safely descending a small step or ledge feet-first to build lower body strength and spatial awareness.',
    '1. Find a single low step or use a foam block.\n2. Show baby how to turn around and lower feet first.\n3. Guide baby\'s body to turn, then support as feet touch down.\n4. Say "feet first, down we go!" as you practice.\n5. Praise each attempt and repeat until confident.',
    ['Low step or foam block', 'Soft mat below'],
    ['Builds leg and core muscle strength', 'Develops spatial body awareness', 'Teaches safe descending technique', 'Builds problem-solving for physical challenges']
  ],

  ['Climbing Up A Step', 'Muscle development',
    'Practice stepping up onto a low platform or step to develop leg strength, balance, and body confidence.',
    '1. Place a single low step or foam block in a clear area.\n2. Hold baby\'s hands and encourage stepping up one foot at a time.\n3. Cheer with each successful step.\n4. Practice stepping down the same way.\n5. Allow independent attempts with close supervision.',
    ['Low step or foam block', 'Soft mat'],
    ['Builds quadricep and hip strength', 'Develops balance and coordination', 'Teaches bilateral foot movement', 'Boosts physical confidence']
  ],

  ['Learn To Sit Down', 'Muscle development',
    'Practice controlled sitting down from a standing position, building core strength and body control.',
    '1. Stand baby upright holding their hands.\n2. Slowly bend knees, guiding baby into a squat and then to seated.\n3. Say "Down we go, sit!" as you lower them.\n4. Let baby try independently near a soft surface.\n5. Repeat from different starting positions.',
    ['Soft mat', 'Cushions'],
    ['Develops controlled eccentric muscle strength', 'Builds core and hip stability', 'Teaches body awareness', 'Prevents falls by practicing safe descent']
  ],

  ['Stand Up', 'Muscle development',
    'Practice pushing up from seated or crawling position to standing, strengthening legs and building independence.',
    '1. Sit baby on the floor next to a low stable surface.\n2. Place a toy on the surface to motivate reaching up.\n3. Support baby\'s hips as they push to stand.\n4. Reduce support gradually as strength improves.\n5. Cheer every time baby reaches a full standing position.',
    ['Low coffee table or couch edge', 'Motivating toy'],
    ['Strengthens leg and core muscles', 'Develops push-up motor pattern', 'Builds independence and confidence', 'Prepares for independent walking']
  ],

  ['Three Objects', 'Problem Solving',
    'Present three objects to baby, then hide one and ask baby to identify the missing item, building memory and reasoning.',
    '1. Place three familiar objects in front of baby.\n2. Name each one and let baby touch them.\n3. Hide one under a cloth while baby watches.\n4. Ask "Which one is missing?"\n5. Lift the cloth to reveal it, then repeat with a different object.',
    ['Three small familiar toys or household objects', 'Small cloth'],
    ['Builds working memory', 'Develops basic problem-solving skills', 'Introduces counting and object recognition', 'Improves attention and focus']
  ],

  ['Repeat Actions', 'Self Esteem',
    'Imitate baby\'s sounds and actions to show that their expressions are valued, building self-worth and communication.',
    '1. Observe baby making a sound, gesture, or facial expression.\n2. Immediately mimic the same action back.\n3. Pause and wait — baby may repeat it again.\n4. Add a small variation and see if baby follows.\n5. Keep it playful and celebrate the back-and-forth.',
    ['None required'],
    ['Validates baby\'s self-expression', 'Builds turn-taking communication', 'Develops imitation skills', 'Boosts confidence and self-awareness']
  ],

  ['Messy Activity', 'Sensory Play',
    'Provide a safe, supervised messy play experience using different textures to stimulate all the senses.',
    '1. Set up a protected area with a mat or tray.\n2. Offer materials like cooked pasta, oats, or shaving foam.\n3. Encourage baby to touch, squeeze, and explore freely.\n4. Name textures: "slippery", "soft", "bumpy".\n5. Allow free exploration for 10–15 minutes then clean up together.',
    ['Cooked pasta or oats', 'Shaving foam or mud', 'Waterproof mat', 'Old clothes'],
    ['Develops sensory processing', 'Builds tolerance for different textures', 'Encourages curiosity and exploration', 'Stimulates tactile receptors']
  ],

  ['Playing With Siblings', 'Social Skills & Awareness',
    'Encourage interaction between baby and older siblings through supervised play to build social awareness.',
    '1. Create a safe shared play space.\n2. Give each child an age-appropriate toy to explore together.\n3. Model taking turns and sharing between siblings.\n4. Narrate the interaction: "Look, your brother is rolling the ball to you!"\n5. Praise gentle, kind behavior from both children.',
    ['Shared toys', 'Play mat'],
    ['Develops early social interaction skills', 'Builds awareness of others\' feelings', 'Introduces turn-taking', 'Strengthens sibling bond']
  ],

  ['Dada And Mama', 'Speech Development',
    'Encourage baby to say "dada" and "mama" by modeling these words in meaningful, positive contexts.',
    '1. Point to yourself and say "Mama!" or "Dada!" with a big smile.\n2. Point to the other parent and say their name.\n3. Repeat the names frequently throughout the day.\n4. Respond with excitement when baby makes similar sounds.\n5. Use the words in context: "Where is Dada? Here is Dada!"',
    ['None required'],
    ['Encourages first intentional words', 'Builds understanding of people and names', 'Strengthens parent-child bond through language', 'Stimulates speech development']
  ],

  ['Anticipating Events 2', 'Thinking Expansion',
    'Build anticipation by doing familiar routines with a pause before the exciting moment, developing prediction skills.',
    '1. Start a familiar playful routine, like "Round and Round the Garden".\n2. Slow down before the exciting climax and wait.\n3. Watch as baby shows anticipation — lean forward, giggle, hold breath.\n4. Complete the action and celebrate together.\n5. Repeat with other familiar games and songs.',
    ['None required'],
    ['Develops cause-and-effect understanding', 'Builds cognitive anticipation', 'Stimulates listening and attention', 'Encourages emotional regulation through excitement']
  ],

  ['Image Vs Live Objects', 'Thinking Expansion',
    'Compare pictures in books or photos with real objects to help baby connect images to the real world.',
    '1. Hold up a real object, such as a ball or cup.\n2. Find a picture of the same object in a book or on a card.\n3. Place them side by side and say the name of each.\n4. Encourage baby to touch both and look back and forth.\n5. Repeat with different objects and their pictures.',
    ['Real household objects', 'Picture books or photo cards'],
    ['Develops symbolic thinking', 'Builds vocabulary by connecting words to images', 'Encourages comparative observation', 'Prepares for language and literacy']
  ],

  ['Reading Book By Themselves', 'Vocabulary',
    'Allow baby to independently explore a book, encouraging autonomy and a personal relationship with reading.',
    '1. Give baby a durable board book they enjoy.\n2. Sit nearby but let baby explore independently.\n3. Observe which pages baby pauses on and engage about those.\n4. Name pictures if baby looks to you for input.\n5. Let baby turn pages at their own pace.',
    ['Board books', 'Cloth books'],
    ['Builds independent reading habits early', 'Develops vocabulary through self-directed exploration', 'Encourages concentration and focus', 'Fosters a love for books']
  ],

  // ── MONTH 11 ──────────────────────────────────────────────────────────────

  ['Stand And Lift', 'Balancing',
    'Stand and lift one foot or a toy off the ground to develop single-leg balance and core stability.',
    '1. Help baby stand near a stable support surface.\n2. Hold a toy slightly to the side to encourage weight shifting.\n3. Gently lift baby\'s foot slightly off the ground.\n4. Hold for 2–3 seconds then place foot down.\n5. Switch sides and repeat several times.',
    ['Stable surface for support', 'Motivating toy'],
    ['Develops single-leg balance', 'Strengthens core and hip stabilizers', 'Improves weight-shifting ability', 'Prepares for stair climbing and running']
  ],

  ['Stand And Play', 'Balancing',
    'Play with toys while standing to challenge balance and develop the ability to use hands while standing upright.',
    '1. Position toys on a table or surface at baby\'s standing height.\n2. Help baby stand holding the surface.\n3. Encourage reaching for and manipulating the toys.\n4. Gradually step back as baby gains confidence.\n5. Celebrate each moment of independent standing play.',
    ['Low table or activity surface', 'Toys at standing height'],
    ['Builds standing endurance', 'Develops dual-task ability (balance + fine motor)', 'Strengthens leg and core muscles', 'Builds confidence for independent standing']
  ],

  ['Standing On Soft Surface', 'Balancing',
    'Practice standing on an unstable soft surface like a foam mat to challenge and develop balance reactions.',
    '1. Place a soft foam mat or folded blanket on the floor.\n2. Help baby stand on the soft surface.\n3. Stay close and hold hands lightly.\n4. Let baby feel the slight wobble and self-correct.\n5. Increase duration as balance improves.',
    ['Foam mat', 'Folded blanket', 'Pillow'],
    ['Challenges and develops balance reactions', 'Strengthens ankle and core stabilizers', 'Builds proprioceptive awareness', 'Prepares for walking on varied surfaces']
  ],

  ['Body Part', 'Early Knowledge',
    'Identify and name major body parts through a fun interactive game, building vocabulary and body awareness.',
    '1. Sit with baby facing you or use a mirror.\n2. Touch your own nose and say "Nose!"\n3. Then touch baby\'s nose saying "Your nose!"\n4. Ask "Where is your nose?" and guide baby\'s hand.\n5. Work through eyes, ears, mouth, hands, and tummy.',
    ['Mirror (optional)'],
    ['Builds body vocabulary', 'Develops self-awareness and body schema', 'Encourages receptive and expressive language', 'Strengthens parent-child interaction']
  ],

  ['Visiting People', 'Etiquette',
    'Practice greeting and interacting politely with familiar people outside the home to build social confidence.',
    '1. Plan a visit to familiar relatives or friends.\n2. Model polite greetings: wave, say "Hello!"\n3. Encourage baby to greet others the same way.\n4. Narrate social situations: "We are saying hello to Grandma."\n5. Keep visits short and positive.',
    ['None required'],
    ['Builds social confidence in new environments', 'Teaches greeting etiquette', 'Develops adaptability to new settings', 'Strengthens comfort with familiar adults']
  ],

  ['Empty A Container', 'Fine Motor',
    'Practice removing objects from a container one by one to develop reach, grasp, and release skills.',
    '1. Fill a small basket or box with soft toys or blocks.\n2. Show baby how to reach in and take one item out.\n3. Encourage baby to empty the container completely.\n4. Name each object as it comes out.\n5. Put them all back in and repeat.',
    ['Small basket or box', 'Soft toys or blocks'],
    ['Develops intentional grasp and release', 'Builds hand-eye coordination', 'Introduces cause and effect', 'Encourages one-to-one correspondence']
  ],

  ['Fishing In A Bathtub', 'Fine Motor',
    'Scoop and catch floating toys from the bathtub using a small net or cup, building fine motor and coordination skills.',
    '1. Float several bath toys in the tub.\n2. Give baby a small cup or mesh scooper.\n3. Show how to scoop toys out of the water.\n4. Name each toy as it is caught.\n5. Encourage baby to try independently and celebrate successes.',
    ['Bath toys', 'Small cup or mesh scooper'],
    ['Develops scooping and hand-eye coordination', 'Builds bilateral hand use', 'Makes bath time engaging', 'Introduces tool use for fine motor tasks']
  ],

  ['Fluid Difference', 'Fine Motor',
    'Pour and transfer water or other fluids between containers to experience cause-and-effect and build pouring skills.',
    '1. Set up two containers of different sizes at the water table or bathtub.\n2. Show baby how to pour water from one to the other.\n3. Let baby try — embrace the spills!\n4. Use language: "full", "empty", "pouring".\n5. Try with slightly thicker fluids like watery oats.',
    ['Containers of different sizes', 'Water', 'Tray to contain spills'],
    ['Develops pouring and wrist control', 'Introduces volume and capacity concepts', 'Provides rich sensory experience', 'Builds patience and focus']
  ],

  ['Throwing Ball L1', 'Fine Motor',
    'Practice underhand tossing of a soft ball to develop arm coordination, grip, and release skills.',
    '1. Sit facing baby about one meter apart.\n2. Hold a soft ball and show an underarm toss toward baby.\n3. Encourage baby to throw the ball back to you.\n4. Gradually increase distance as skill improves.\n5. Count throws and celebrate each successful toss.',
    ['Soft ball'],
    ['Develops arm and shoulder coordination', 'Builds grip and release timing', 'Introduces spatial awareness', 'Encourages turn-taking in play']
  ],

  ['Hold And Walk', 'Gross Motor',
    'Walk while holding a stable object or furniture to build confidence and leg strength for independent walking.',
    '1. Position baby next to a low sofa, table, or push toy.\n2. Encourage baby to hold on and take steps sideways.\n3. Slowly move your hands away, guiding less each time.\n4. Place a motivating toy a few steps away.\n5. Celebrate each step taken.',
    ['Furniture or push toy', 'Clear floor space'],
    ['Builds walking confidence', 'Strengthens leg and core muscles', 'Develops coordinated stepping pattern', 'Transitions toward independent walking']
  ],

  ['Learn To Walk', 'Gross Motor',
    'Take first independent steps toward a caregiver or between two adults, building walking confidence.',
    '1. Sit a short distance from baby (1–2 steps).\n2. Hold out your hands and call baby to come to you.\n3. As baby takes a step, lean forward encouragingly.\n4. Catch baby in a big celebratory hug.\n5. Gradually increase distance as confidence grows.',
    ['Clear safe floor space'],
    ['Develops independent walking pattern', 'Builds leg strength and balance', 'Boosts confidence and motivation', 'Develops spatial navigation skills']
  ],

  ['Sitting To Standing Position', 'Gross Motor',
    'Practice transitioning from sitting on the floor to a standing position to build leg strength and coordination.',
    '1. Have baby sit on the floor near a low stable surface.\n2. Place a motivating toy on the surface.\n3. Encourage baby to push up to standing to reach it.\n4. Support baby\'s hips lightly if needed.\n5. Practice 5–8 repetitions each session.',
    ['Low stable surface', 'Motivating toy'],
    ['Strengthens leg and hip muscles', 'Develops transitional movement control', 'Builds independence', 'Prepares for walking and stair climbing']
  ],

  ['Stretch The Feet', 'Gross Motor',
    'Do gentle foot and ankle stretches to improve flexibility, circulation, and body awareness in baby\'s lower limbs.',
    '1. Lay baby on their back on a soft mat.\n2. Hold one foot gently and flex it forward and back.\n3. Make gentle circles with the ankle.\n4. Point and flex the toes playfully.\n5. Repeat on the other foot and use a sing-song voice throughout.',
    ['Soft mat'],
    ['Improves ankle and foot flexibility', 'Stimulates circulation', 'Develops body awareness', 'Builds a positive relationship with physical touch']
  ],

  ['Walking With Assistance L2', 'Gross Motor',
    'Walk with only one-hand support from a caregiver, preparing for fully independent walking.',
    '1. Hold one of baby\'s hands at a comfortable height.\n2. Walk together slowly across the room.\n3. Gradually loosen your grip to minimal fingertip contact.\n4. Place motivating toys at the destination.\n5. Celebrate each stretch of independent steps.',
    ['Clear floor space'],
    ['Develops balance for independent walking', 'Builds walking endurance', 'Transitions away from two-hand support', 'Strengthens leg coordination']
  ],

  ['Walking With Support', 'Gross Motor',
    'Use a push toy or walker for supported independent walking, building leg strength and walking rhythm.',
    '1. Place a stable push toy on a clear, flat floor.\n2. Position baby behind it and encourage pushing forward.\n3. Walk alongside for safety, offering minimal support.\n4. Guide direction gently when needed.\n5. Increase distance gradually as confidence grows.',
    ['Push toy or baby walker'],
    ['Builds walking confidence', 'Develops pushing and steering coordination', 'Strengthens leg muscles', 'Develops navigation skills']
  ],

  ['Crawl Through Tunnel', 'Imagination',
    'Crawl through a fabric tunnel, stimulating imagination, spatial awareness, and whole-body coordination.',
    '1. Set up a collapsible fabric tunnel on the floor.\n2. Show baby the opening and crawl through yourself first.\n3. Place a toy inside or at the other end for motivation.\n4. Cheer as baby enters and crawls through.\n5. Make sounds and stories: "Going through the cave!"',
    ['Fabric play tunnel'],
    ['Develops spatial awareness', 'Builds whole-body coordination', 'Stimulates imaginative play', 'Encourages problem-solving in physical space']
  ],

  ['Tickling Spider', 'Imagination',
    'Use your fingers to "walk like a spider" across baby\'s tummy and arms, sparking imagination and delight.',
    '1. Start with fingers on baby\'s leg saying "Here comes the spider!"\n2. Walk your fingers slowly up toward baby\'s tummy.\n3. At the tummy, do a fun tickle or wiggle.\n4. Add dramatic suspense with pauses.\n5. Let baby try to "stop" the spider with their hands.',
    ['None required'],
    ['Develops anticipatory imagination', 'Builds sensory awareness', 'Strengthens parent-child play bond', 'Encourages laughter and joy']
  ],

  ['Sing To Baby', 'Language Comprehension',
    'Sing simple songs and nursery rhymes to baby to develop language comprehension, rhythm, and emotional bonding.',
    '1. Choose 2–3 short familiar songs or rhymes.\n2. Sing face-to-face with baby at a slow, clear pace.\n3. Use hand gestures and facial expressions.\n4. Repeat the same songs often so baby recognizes them.\n5. Pause in familiar spots and wait for baby to fill in.',
    ['None required'],
    ['Develops rhythm and phonological awareness', 'Builds receptive language skills', 'Strengthens parent-child bonding', 'Introduces vocabulary in context']
  ],

  ['Play With Dough', 'Nurturing Creativity',
    'Manipulate soft play dough by squeezing, rolling, and poking to develop creativity and fine motor skills.',
    '1. Give baby a small ball of soft, safe play dough.\n2. Show how to press, roll, and squeeze it.\n3. Make simple shapes together — ball, snake, flat pancake.\n4. Press objects into the dough to make impressions.\n5. Narrate the play: "You made a worm!"',
    ['Baby-safe play dough or homemade salt dough', 'Simple shape cutters (optional)'],
    ['Develops fine motor strength and dexterity', 'Encourages creative expression', 'Builds hand muscle endurance', 'Introduces imaginative open-ended play']
  ],

  ['Curious In Park', 'Sensory Play',
    'Explore a park environment using all senses — touch leaves, smell flowers, hear birds — for rich sensory learning.',
    '1. Take baby to a park or garden.\n2. Let baby touch grass, leaves, tree bark, and soil.\n3. Smell flowers and point out different scents.\n4. Listen to birds and wind, naming the sounds.\n5. Describe everything using rich sensory language.',
    ['Access to a park or garden', 'Carrier or stroller'],
    ['Stimulates all five senses', 'Builds nature vocabulary', 'Develops sensory processing', 'Encourages curiosity and exploration']
  ],

  ['Tasting Time', 'Sensory Play',
    'Introduce a variety of safe food flavors and textures to expand palate and develop oral sensory processing.',
    '1. Prepare small portions of different safe foods: sweet, sour, salty.\n2. Offer each taste one at a time.\n3. Watch baby\'s reaction and name the flavor.\n4. Celebrate all reactions — even funny ones!\n5. Never force — let baby lead the pace.',
    ['Variety of age-appropriate foods', 'Small spoon', 'Bib'],
    ['Develops taste discrimination', 'Expands dietary preferences', 'Reduces food neophobia', 'Builds oral sensory processing']
  ],

  ['Sound Vibrations', 'Sound',
    'Explore how sound vibrations can be felt as well as heard by touching musical instruments and vibrating surfaces.',
    '1. Play a drum or tap a surface and let baby feel the vibrations.\n2. Hold baby\'s hand on the drum as you tap.\n3. Turn on music and place baby\'s hand on the speaker (safe distance).\n4. Hum and let baby feel your throat vibrate.\n5. Try different pitches and ask "Can you feel it?"',
    ['Drum or container', 'Music player'],
    ['Develops multisensory understanding of sound', 'Builds auditory-tactile integration', 'Stimulates curiosity about the physical world', 'Prepares for musical appreciation']
  ],

  ['Similar And Different', 'Thinking Expansion',
    'Compare pairs of objects that are similar or different to develop early categorization and reasoning skills.',
    '1. Choose pairs of objects — one same (two balls) and one different (ball and block).\n2. Hold up a same pair and say "Same!"\n3. Hold up a different pair and say "Different!"\n4. Let baby handle both and observe their exploration.\n5. Ask "Are these the same?" and respond to baby\'s cues.',
    ['Pairs of matching and non-matching toys', 'Shape sorter (optional)'],
    ['Develops categorical thinking', 'Builds visual discrimination skills', 'Introduces concepts of same and different', 'Encourages early logical reasoning']
  ],

  ['Weather Talk', 'Vocabulary',
    'Discuss daily weather during outdoor time to build vocabulary related to the natural environment.',
    '1. Step outside or look out a window each day.\n2. Describe the weather simply: "It\'s sunny and warm today."\n3. Point to clouds, sun, rain, or wind in action.\n4. Use expressive language: "The wind is blowing our hair!"\n5. Connect clothing choices to weather: "We wear coats when it\'s cold."',
    ['None required — use real weather'],
    ['Builds weather and nature vocabulary', 'Develops observational skills', 'Connects language to real-world experience', 'Introduces seasonal concepts']
  ],

  // ── MONTH 12 ──────────────────────────────────────────────────────────────

  ['Familiarize With Family', 'Bonding',
    'Look at family photos and meet relatives to strengthen baby\'s sense of belonging and family identity.',
    '1. Gather photos of family members.\n2. Point to each photo and name the person warmly.\n3. Visit or video call relatives when possible.\n4. Create a simple family photo book for baby.\n5. Revisit the photos regularly, letting baby point to familiar faces.',
    ['Family photos or photo book', 'Video call device (optional)'],
    ['Builds family identity and belonging', 'Develops face recognition', 'Strengthens emotional security', 'Builds vocabulary of family member names']
  ],

  ['Stacking And Falling', 'Concept Learning',
    'Stack blocks together then knock them down to explore cause-and-effect, gravity, and basic physics.',
    '1. Build a simple tower of 3–5 soft blocks.\n2. Hand baby a block and guide them to place it on top.\n3. Build the tower as tall as possible.\n4. Knock it down with a big "Boom!" together.\n5. Laugh and rebuild — let baby knock it down alone.',
    ['Soft blocks or foam blocks'],
    ['Introduces cause and effect', 'Builds early physics understanding (gravity)', 'Develops fine motor placement skills', 'Teaches that destruction is part of learning and play']
  ],

  ['Hide And Seek', 'Fun Time Together',
    'Play a gentle hide-and-seek game to develop object permanence, spatial thinking, and shared joy.',
    '1. Hide your face behind your hands or a cloth.\n2. Say "Where is Mommy?" then reveal yourself: "Here I am!"\n3. Progress to hiding behind furniture — peek out so baby can find you.\n4. Cheer when baby finds you.\n5. Let baby "hide" and pretend to search dramatically.',
    ['None required (or cloth for peekaboo variation)'],
    ['Solidifies object permanence understanding', 'Develops spatial reasoning', 'Builds social anticipation and delight', 'Encourages active movement']
  ],

  ['Moving Large Objects', 'Gross Motor',
    'Push, pull, or carry slightly large objects to develop whole-body strength and spatial planning.',
    '1. Place a large soft toy, box, or cushion on the floor.\n2. Show baby how to push it across the room.\n3. Encourage pulling it with both hands.\n4. Make it a game: "Move it to the other side!"\n5. Use language: "Push! Pull! Heavy! Light!"',
    ['Large soft toy', 'Lightweight box', 'Cushion'],
    ['Develops whole-body strength', 'Builds spatial planning', 'Introduces concepts of heavy and light', 'Encourages problem-solving for physical tasks']
  ],

  ['Taking Objects', 'Gross Motor',
    'Practice reaching, grasping, and transporting objects from one location to another to build functional movement.',
    '1. Place objects in one container across the room from an empty one.\n2. Encourage baby to carry objects from full to empty container.\n3. Show how to carry one item at a time, walking across.\n4. Narrate: "Bring it here!" and celebrate arrivals.\n5. Vary the weight and size of objects.',
    ['Two containers', 'Small toys or blocks'],
    ['Develops walking with an object', 'Builds carrying and transporting skills', 'Improves coordination and balance', 'Introduces purposeful movement']
  ],

  ['Walking With Objects', 'Gross Motor',
    'Walk around while holding or carrying an object, developing balance and coordination during functional movement.',
    '1. Give baby a toy to carry in one or both hands.\n2. Set a destination — a basket or another room.\n3. Encourage baby to walk to the destination without dropping the toy.\n4. Celebrate successful delivery.\n5. Vary objects: light, slightly heavier, different shapes.',
    ['Toys of varying shapes', 'Basket or box for delivery'],
    ['Develops walking balance with added challenge', 'Builds bilateral hand and arm control', 'Improves coordination and dual-tasking', 'Encourages purposeful movement']
  ],

  ['Fun With Paper', 'Imagination',
    'Explore paper by tearing, crumpling, and folding to discover textures, sounds, and creative possibilities.',
    '1. Provide large sheets of safe, non-toxic paper.\n2. Let baby crumple it and listen to the crinkling sound.\n3. Tear pieces together — guide baby\'s hands.\n4. Fold simple shapes and name them.\n5. Wrap a toy in paper and let baby "unwrap" it.',
    ['Large sheets of paper', 'Old newspapers or tissue paper'],
    ['Develops creative exploration', 'Stimulates auditory and tactile senses', 'Builds fine motor strength through tearing', 'Encourages imaginative open-ended play']
  ],

  ['Give And Take', 'Language Comprehension',
    'Practice giving and taking objects back and forth to develop understanding of instructions and turn-taking.',
    '1. Hold out your hand and say "Give me the ball."\n2. Offer the ball back saying "Here you go, your turn."\n3. Praise each exchange enthusiastically.\n4. Use different objects to generalize the skill.\n5. Introduce "please" and "thank you" modeling.',
    ['Small toys or objects'],
    ['Develops receptive language for simple commands', 'Builds turn-taking and sharing skills', 'Teaches "give" and "take" concepts', 'Establishes early social etiquette']
  ],

  ['Memory Training', 'Memory and Attention',
    'Use simple matching or hiding games to exercise working memory and sustained attention.',
    '1. Show two matching cards or objects, then shuffle them face down.\n2. Let baby turn one over and find its match.\n3. Keep the game to 2–3 pairs for this age.\n4. Narrate: "You found the duck! Can you find the other one?"\n5. Celebrate each match found.',
    ['Simple matching cards (2–3 pairs)', 'Familiar object pairs'],
    ['Develops working memory', 'Builds sustained attention', 'Introduces simple matching skills', 'Encourages persistence and problem-solving']
  ],

  ['Who Is In The Mirror', 'Memory and Attention',
    'Explore the mirror to discover self-recognition, building self-awareness and visual attention skills.',
    '1. Sit with baby in front of a mirror at a comfortable height.\n2. Point to baby\'s reflection: "Who is that?"\n3. Point to your own reflection: "That\'s Mama!"\n4. Play with making funny faces together.\n5. Place a sticker on baby\'s nose and see if they touch it or the reflection.',
    ['Unbreakable mirror or reflective surface'],
    ['Develops self-recognition and awareness', 'Builds visual attention and tracking', 'Encourages face exploration', 'Stimulates cognitive self-concept development']
  ],

  ['Give The Lead', 'Self Esteem',
    'Let baby take the lead during playtime, following their choices and actions to build confidence and autonomy.',
    '1. Set out a selection of toys and materials.\n2. Step back and let baby choose what to play with.\n3. Follow baby\'s lead — join in whatever they select.\n4. Narrate their choices: "You chose the blocks! Great choice!"\n5. Avoid redirecting — let the play be theirs.',
    ['Variety of toys', 'Open play space'],
    ['Builds confidence and autonomy', 'Develops decision-making skills', 'Validates baby\'s preferences', 'Strengthens intrinsic motivation']
  ],

  ['Different Aromas 2', 'Sensory Play',
    'Explore a variety of distinct scents to develop the olfactory sense and expand sensory vocabulary.',
    '1. Prepare 3–4 safe scents: citrus peel, lavender, vanilla, mint.\n2. Present one scent at a time in a small container.\n3. Waft it gently under baby\'s nose.\n4. Name the smell: "That\'s lemon! It smells fresh."\n5. Watch for and describe baby\'s reactions.',
    ['Citrus peel', 'Lavender sachet', 'Vanilla extract', 'Fresh herbs'],
    ['Develops olfactory discrimination', 'Builds sensory vocabulary', 'Stimulates brain through smell pathways', 'Encourages curiosity about the senses']
  ],

  ['Motion And Direction', 'Thinking Expansion',
    'Explore objects moving in different directions — toward, away, up, down — to build spatial and directional understanding.',
    '1. Roll a ball toward baby and away from them.\n2. Lift toys up high and bring them down low.\n3. Swing a toy left and right.\n4. Narrate each movement: "Up! Down! Coming toward you!"\n5. Let baby try moving toys in different directions.',
    ['Ball', 'Small toys', 'String or ribbon (supervised)'],
    ['Develops spatial vocabulary (up, down, toward)', 'Builds directional understanding', 'Strengthens tracking and visual attention', 'Introduces early physics concepts']
  ],

  ['Open & Close', 'Thinking Expansion',
    'Practice opening and closing containers, books, and boxes to develop hand control, problem-solving, and cause-and-effect.',
    '1. Gather containers with simple lids, boxes, and books.\n2. Show opening and closing each one slowly.\n3. Let baby try to open and close independently.\n4. Narrate: "Open! Now close it."\n5. Hide a surprise inside for extra motivation.',
    ['Containers with lids', 'Boxes', 'Books'],
    ['Develops wrist rotation and hand control', 'Builds problem-solving for mechanical tasks', 'Introduces cause-and-effect understanding', 'Strengthens finger and hand strength']
  ],

  ['Sponge Play', 'Thinking Expansion',
    'Squeeze and release a sponge in water to explore absorption, cause-and-effect, and basic science concepts.',
    '1. Fill a shallow tray with water.\n2. Give baby a sponge and demonstrate squeezing.\n3. Show how the sponge absorbs water and releases it.\n4. Let baby squeeze and explore freely.\n5. Narrate: "It\'s full of water! Squeeze it out!"',
    ['Sponges of different sizes', 'Shallow tray or bin', 'Water'],
    ['Introduces water absorption concepts', 'Develops hand grip strength', 'Builds cause-and-effect understanding', 'Provides rich sensory feedback']
  ],

  ['Web Basket', 'Thinking Expansion',
    'Thread, weave, or push objects through the holes of a basket or net to develop problem-solving and fine motor skills.',
    '1. Provide a wicker basket or mesh bag and small balls or toys.\n2. Show how to push a ball through a hole and retrieve it.\n3. Encourage baby to try pushing objects through the weave.\n4. Try pulling string or ribbon through holes.\n5. Narrate: "Push it through! Where did it go?"',
    ['Wicker basket or mesh bag', 'Small balls', 'Ribbon or string (supervised)'],
    ['Develops problem-solving with spatial constraints', 'Builds fine motor precision', 'Encourages persistence', 'Introduces concepts of through and inside']
  ],

  ['Object Identification', 'Vocabulary',
    'Point to and name everyday objects to rapidly expand baby\'s receptive and expressive vocabulary.',
    '1. Walk through different rooms together.\n2. Point to objects and name them clearly: "Chair! Window! Cup!"\n3. Ask "Where is the cup?" and guide baby to point.\n4. Celebrate correct pointing enthusiastically.\n5. Revisit the same objects daily to reinforce learning.',
    ['Household objects', 'Picture cards (optional)'],
    ['Rapidly builds receptive vocabulary', 'Develops pointing and joint attention', 'Connects words to real-world objects', 'Strengthens language comprehension']
  ],

  ['Posture Words', 'Vocabulary',
    'Demonstrate and label body postures like sitting, standing, lying, and crouching to build vocabulary and body awareness.',
    '1. Demonstrate a posture: sit on the floor.\n2. Say clearly: "Sitting!" then move to standing: "Standing!"\n3. Lie down: "Lying down!" Crouch: "Crouching!"\n4. Ask baby to do each: "Can you sit?"\n5. Use these words throughout the day in context.',
    ['Open floor space'],
    ['Builds body awareness vocabulary', 'Develops receptive language for positional words', 'Encourages imitation and movement', 'Connects language to physical experience']
  ],
];

// Month_max corrections based on screenshot evidence
const MONTH_MAX_CORRECTIONS = [
  // Activities seen in month 11 but only recorded as month 10
  { title: 'Three Objects', sub_category: 'Problem Solving', new_month_max: 11 },
  { title: 'Learning Through Books', sub_category: 'Early Knowledge', new_month_max: 11 },
  { title: 'Do Messy Painting', sub_category: 'Fine Motor', new_month_max: 11 },
  { title: 'Granularity', sub_category: 'Fine Motor', new_month_max: 11 },
  { title: 'Stacking Rings', sub_category: 'Fine Motor', new_month_max: 11 },
  // Activities seen in month 12 but recorded as month 11
  { title: 'Similar And Different', sub_category: 'Thinking Expansion', new_month_max: 12 },
  { title: 'Sound Vibrations', sub_category: 'Sound', new_month_max: 12 },
  { title: 'Curious In Park', sub_category: 'Sensory Play', new_month_max: 12 },
  { title: 'Walking With Assistance L2', sub_category: 'Gross Motor', new_month_max: 12 },
  { title: 'Sing To Baby', sub_category: 'Language Comprehension', new_month_max: 12 },
  { title: 'Fishing In A Bathtub', sub_category: 'Fine Motor', new_month_max: 12 },
  { title: 'Visiting People', sub_category: 'Etiquette', new_month_max: 12 },
  { title: 'Fluid Difference', sub_category: 'Fine Motor', new_month_max: 12 },
  { title: 'Tasting Time', sub_category: 'Sensory Play', new_month_max: 12 },
  { title: 'Stretch The Feet', sub_category: 'Gross Motor', new_month_max: 12 },
  { title: 'Sitting To Standing Position', sub_category: 'Gross Motor', new_month_max: 12 },
  { title: 'Body Part', sub_category: 'Early Knowledge', new_month_max: 12 },
  { title: 'Play With Dough', sub_category: 'Nurturing Creativity', new_month_max: 12 },
  { title: 'Empty A Container', sub_category: 'Fine Motor', new_month_max: 12 },
  { title: 'Learn To Walk', sub_category: 'Gross Motor', new_month_max: 12 },
];

async function run() {
  await client.connect();
  let updated = 0, skipped = 0;

  // 1. Remove duplicate "Walking with Support" (generic seed with round done_count)
  console.log('Fixing duplicate Walking with Support...');
  const dupRes = await client.query(
    `DELETE FROM activities WHERE title = 'Walking with Support' AND sub_category = 'Gross Motor' AND done_count = 14000`
  );
  console.log(`  Removed ${dupRes.rowCount} duplicate(s)`);

  // 2. Fix month_max corrections
  console.log('\nUpdating month_max ranges...');
  for (const c of MONTH_MAX_CORRECTIONS) {
    const r = await client.query(
      `UPDATE activities SET month_max = GREATEST(month_max, $1) WHERE title = $2 AND sub_category = $3`,
      [c.new_month_max, c.title, c.sub_category]
    );
    if (r.rowCount > 0) console.log(`  Updated month_max for: ${c.title}`);
  }

  // 3. Add descriptions, instructions, benefits
  console.log('\nAdding descriptions, instructions, benefits...');
  for (const [title, sub_category, description, instructions, materials, benefits] of ACTIVITIES) {
    const r = await client.query(
      `UPDATE activities
       SET description = $1,
           instructions = $2,
           materials_needed = $3,
           benefits = $4
       WHERE title = $5 AND sub_category = $6
         AND (description IS NULL OR description = '')`,
      [description, instructions, materials, benefits, title, sub_category]
    );
    if (r.rowCount > 0) {
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (already had description)`);
  await client.end();
}

run().catch(console.error);

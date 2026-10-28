-- Migration 026: Seed 15 bedtime stories (doctor_verified = false, pending review)

INSERT INTO bedtime_stories
  (title, description, content, category, age_min_months, age_max_months, duration_minutes, author, is_featured, doctor_verified)
VALUES

('The Brave Little Bunny',
 'A tiny bunny learns that courage means trying even when you are scared.',
 'Once upon a time, in a meadow full of clover, lived a tiny bunny named Biscuit. Biscuit had the softest white fur and the longest ears, but he was afraid of almost everything — the rustling leaves, the buzzing bees, even his own shadow. One afternoon his friend Daisy the duckling got stuck in the middle of the pond. Biscuit took a deep breath. "I am scared," he admitted, "but Daisy needs me." He hopped to the edge, found a long stick, and stretched it out until Daisy grabbed on. When she waddled safely to shore, she hugged him tight. "You were so brave!" she said. Biscuit smiled. "I was scared AND brave at the same time." And from that day on, he knew that those two things could live in his heart together.',
 'Adventure', 0, 12, 4, 'BabyG Editorial Team', false, false),

('The Friendly Farm Animals',
 'Every animal on the farm has a special job and a special sound.',
 'Good morning! The sun is rising over Sunny Hill Farm, and all the animals are waking up. Moo! says the big brown cow as she stretches her legs. Oink oink! says the little pink pig rolling in the cool mud. Baa baa! say the fluffy white sheep nibbling the green grass. Cluck cluck! say the busy hens finding their breakfast seeds. And right at the top of the barn, the rooster crows cock-a-doodle-doo! to tell everyone the day has begun. Each animal has a job: the cow gives warm milk, the hens give fresh eggs, the sheep give soft wool, and the pig digs the garden with his snout. At the end of the day they all snuggle up together and whisper their sounds softly until they fall asleep. Moo… oink… baa… cluck… goodnight, farm.',
 'Animals', 6, 18, 5, 'BabyG Editorial Team', false, false),

('Goodnight Garden',
 'A soothing journey through a sleepy garden as everything settles down for the night.',
 'The sky is turning pink and purple and the garden is getting ready for sleep. The big sunflower slowly closes her golden petals and bows her head. The butterflies tuck their wings together and rest on the leaves. The little ladybirds find a cosy rosebud and crawl inside. The bees fly back to their hive and hum a quiet goodnight song. The crickets begin their gentle chirp chirp chirp. Even the stream slows down, its water barely whispering over the pebbles. A firefly blinks hello to the first star. The moon floats up and spreads a silver blanket over everything. Close your eyes, little one. The garden is sleeping, and it is time for you to sleep too.',
 'Bedtime', 0, 24, 4, 'BabyG Editorial Team', false, false),

('The Magic Paintbrush',
 'A child discovers a paintbrush that brings every picture to life.',
 'Lily found an old wooden paintbrush in her grandmother''s attic. It had a golden tip and felt warm in her hand. She dipped it in blue paint and drew a puddle — and real water appeared on the floor! She drew a butterfly — and it fluttered right off the paper! Lily painted a sad cloud and gave it a rainbow, and the cloud started to smile. She painted a lonely tree and added a bird''s nest, and a small bird flew in and began to sing. When evening came, she painted a soft pillow and a starry sky. "Is the magic in the brush?" she asked her grandmother. Grandma winked. "The magic was always in your imagination, little one. The brush just helped it out."',
 'Fantasy', 12, 36, 5, 'BabyG Editorial Team', false, false),

('Grandma''s Big Hugs',
 'A visit to grandma''s house is full of love, cookies, and stories.',
 'Every Saturday morning, little Sam woke up to the smell of something wonderful. "Grandma day!" he shouted and jumped out of bed. Grandma lived just down the lane in a yellow house with a red door. When Sam knocked, the door swung open and two big arms scooped him right up. Grandma smelled like warm cookies and lavender. She always had the softest cardigan and the best stories. They baked oat biscuits together, and Sam got to stir the dough three times and make a wish each time. Then they sat by the window and Grandma told him about when his mum was a little girl, just like him. On the way home Sam held Grandma''s hand and thought that the world was a very good place when you had someone who gave such big hugs.',
 'Family', 0, 24, 5, 'BabyG Editorial Team', false, false),

('The Little Seed''s Journey',
 'Follow a tiny seed from the soil all the way to a blooming flower.',
 'Deep inside the dark, warm soil, a tiny seed was sleeping. Rain came drip drip drip and the seed began to wake up. It pushed a small white root down and a green shoot up, up, up toward the light. The shoot peeked out of the ground and felt the sunshine for the very first time. "Hello, world!" it whispered. Days passed. The shoot grew taller and grew leaves that spread wide to catch the sun. A worm helped loosen the soil around its roots. A bee visited and dusted it with golden pollen. Then one bright morning, a bud appeared, tight and round. Slowly, slowly it opened — petal by petal — into a beautiful yellow flower. The seed had become something wonderful. And inside the flower, new seeds were already forming, ready to begin their own great journey.',
 'Nature', 6, 24, 5, 'BabyG Editorial Team', false, false),

('The Sharing Starfish',
 'A starfish with five arms learns that giving to others fills your heart.',
 'On a warm coral reef lived a starfish named Stella who had five bright orange arms. One day she found a pile of beautiful shells on the sea floor. She counted them — five shells, one for each arm! She was about to take them all when she saw her friend the crab looking sadly at the pile. "I was looking for a shell too," said the crab. Stella thought for a moment, then gave one shell away. Then a small fish swam by with a worried face — it needed a shell for its home. Stella gave another. Soon a sea snail, a little lobster, and a tiny shrimp had each received a shell. Stella looked at her one remaining shell and smiled. Her reef was now full of happy friends waving thank-you to her, and her heart felt five times bigger than before.',
 'Nice', 12, 36, 4, 'BabyG Editorial Team', false, false),

('Why Is the Sky Blue?',
 'A curious toddler asks big questions and discovers that wondering is wonderful.',
 'Every morning, Zoe would press her nose against the window and ask a question. "Why is the sky blue?" she asked one Tuesday. Papa scratched his head and said the sunlight dances with tiny bits of air and blue bounces the most. Zoe thought about that. On Wednesday she asked, "Why do birds sing?" Mama smiled and said birds talk to each other in song, saying good morning and I am here and I love this tree. Zoe liked that. On Thursday she asked, "Why do I yawn?" Big sister said because your body is telling your brain it is time to rest. Zoe yawned right then and there. On Friday she asked, "Why is asking questions so fun?" No one answered for a long moment. Then they all said together: "Because questions are how we find out wonderful things."',
 'Smart', 18, 48, 5, 'BabyG Editorial Team', false, false),

('Young Albert and the Compass',
 'Inspired by Albert Einstein''s childhood, a boy is amazed by a magnetic compass.',
 'When Albert was five years old and sick in bed, his father brought him a small gift — a compass. Albert turned it this way and that way, but no matter which direction he pointed it, the needle always swung back to face north. He could not see anything touching the needle. He could not hear anything pulling it. Yet it always, always pointed north. "There is something invisible making it move," he whispered. He could not sleep that night for thinking about it. What hidden force reached through empty space and touched that little needle? He did not know the answer yet. But that tiny compass planted a seed of wonder in young Albert''s mind — a wonder that would one day change everything we knew about the universe.',
 'Famous', 24, 60, 6, 'BabyG Editorial Team', false, false),

('Tidying Up With Teddy',
 'A child and their teddy bear make a game out of putting toys away.',
 'When the sun went down and dinnertime was over, Mia''s room was a wonderful disaster. Blocks here, books there, puzzle pieces everywhere. "Time to tidy," said Mum. Mia looked at the mess. It felt very big. Then she had an idea. She picked up her teddy bear Tom and gave him a job. "Tom, you are in charge of the blocks," she said in her most serious voice. She walked Tom''s little paws over each block and dropped them one by one into the basket. Clunk, clunk, clunk! Ten points! Then she raced the puzzle pieces back to their box. Then she lined the books up like a tiny colourful parade. When everything was done, Mia looked around at her tidy room. "We did it, Tom," she said. Tom''s button eyes seemed to sparkle with pride.',
 'Tidy', 12, 36, 4, 'BabyG Editorial Team', false, false),

('Luna''s Bedtime Routine',
 'A little girl follows her cosy bedtime steps and feels safe and sleepy.',
 'Every evening when the stars began to appear, Luna started her bedtime routine. First she had a warm bath with her yellow duck who splashed and squeaked. Then she put on her softest pyjamas — the ones with the little moons on them. She brushed her teeth up and down, round and round, until they were sparkly clean. Then she chose one book from her shelf — tonight it was the one about the bear who found honey. After the story she had a big glass of water and gave everyone a goodnight hug: Mum, Dad, and her toy rabbit Pip. She climbed into bed, and Mum tucked the blanket snug around her feet. The nightlight glowed a soft golden colour. Luna closed her eyes. The routine was like a path of little stepping stones leading her gently all the way to sleep.',
 'Discipline', 6, 24, 4, 'BabyG Editorial Team', false, false),

('The Curious Caterpillar',
 'A caterpillar questions everything and discovers the wonder of change.',
 'A tiny green caterpillar named Cleo munched her way along a leaf and asked questions with every bite. "Why are leaves green?" Munch. "What is that yellow thing up in the sky?" Munch. "Where does the wind come from?" Munch munch. One day she felt very sleepy and wrapped herself in a soft silky blanket she made herself. She slept and slept and dreamed and wondered. When she woke up and pushed her way out into the sunlight, she stretched — and found she had wings! Brilliant, jewelled, trembling wings that caught the light like tiny stained-glass windows. She flew up for the very first time and looked down at the leaf where she used to munch. Everything looked different from up here. "New questions!" she laughed, and flew off to find the answers.',
 'Animals', 3, 18, 4, 'BabyG Editorial Team', false, false),

('Dragon''s First Day',
 'A young dragon is nervous about starting dragon school and makes a surprising friend.',
 'Drake the dragon woke up on the first day of Dragon School with butterflies in his tummy — tiny flaming butterflies. He could barely finish his toast. What if no one liked him? What if he accidentally sneezed fire on someone? What if he was the worst dragon there? His mum smoothed down his scales. "Just be yourself," she said. At school, Drake accidentally sneezed and scorched the edge of a bench. He turned bright red with embarrassment. But the little dragon sitting next to him — a purple one named Pepper — just laughed kindly. "Mine went blue last week," Pepper said, "and melted a snow cone." They both giggled. By lunchtime they were sharing their sandwiches. By home time they were best friends. Drake flew home with no butterflies left, just a warm glow in his chest.',
 'Fantasy', 18, 48, 5, 'BabyG Editorial Team', false, false),

('The Kindness Tree',
 'Every act of kindness makes a magical tree grow a new golden leaf.',
 'In the centre of Willowbrook village stood a tree unlike any other. Its leaves were bright gold, but only when someone was kind. One morning little Rosa gave her sandwich to a boy who had forgotten his lunch — and a single golden leaf appeared on the tree. That afternoon old Mr Park helped a lost cat find its way home — two more leaves unfurled. A girl held an umbrella over a stranger in the rain. A boy helped his sister reach the high shelf. A grandmother left flowers on a neighbour''s doorstep. With every kind act, another golden leaf shimmered into being. By evening the tree blazed like a lantern. People came from nearby streets to see it glow. "What makes it do that?" a small child asked. An old woman smiled. "The same thing that makes you feel warm inside when you are kind," she said.',
 'Nice', 24, 60, 6, 'BabyG Editorial Team', false, false),

('The Little Explorer',
 'A toddler turns the backyard into a world of big discoveries.',
 'Every morning after breakfast, Nico put on his explorer hat — the one with the stripe — and went to explore the backyard. To Nico, the backyard was not small. It was enormous. Under the big pot near the fence lived a city of ants carrying crumbs bigger than their heads. Nico watched them for a long time. Behind the rosebush was a spiderweb that sparkled with dew drops, each one like a tiny planet. He found a feather that was striped brown and cream and wondered what bird it belonged to. He found a snail moving so slowly he had to wait a whole minute to see it move. At the end of the morning he sat on the back step and told his mum everything he had found. She listened to every single word. The backyard was exactly the right size for one small explorer with a big curious heart.',
 'Adventure', 12, 36, 5, 'BabyG Editorial Team', false, false);

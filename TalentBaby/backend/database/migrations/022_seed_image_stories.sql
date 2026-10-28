-- Migration: Seed bedtime stories extracted from BabyG story screenshots
-- These stories come from the app's image content (doctor_verified = true)
-- Age groups follow folder naming: 1-12, 13-24, 25-36 months

INSERT INTO bedtime_stories (title, description, content, category, age_min_months, age_max_months, duration_minutes, author, is_featured, doctor_verified) VALUES

-- ── 1-12 months ──────────────────────────────────────────────────────────────

(
  'The Hungry Sparrow',
  'A little sparrow is hungry and finds a big red apple. She cannot carry it, so she comes up with a clever idea to eat it bite by bite.',
  'On a warm sunny day, a little sparrow was flying high in the sky. "Chi chi chi!" she chirped happily. She was hungry and started searching for food. After a long flight, she finally found something! It was a big, red apple!

"Yum yum yum!" The sparrow said and flew for the apple. But when she reached closer, she found that the apple was too big for her. The little sparrow tried to pick the apple up but she couldn''t.

The little sparrow became sad. Then, she got an idea! She started pecking at the apple. "Peck peck peck," she went and began to eat small bites of the tasty red apple. "Nom nom nom," she pecked on. Soon, her tummy was full and the sparrow was happy. She said "Yay yay yay" and flew away.',
  'Animals', 1, 12, 3, 'Fatema Arsiwala', true, true
),

(
  'Ira''s Hat',
  'A strong wind blows Ira''s favourite hat away. A kind parrot comes to the rescue and returns the hat safely.',
  'One fine morning, a little girl named Ira was walking down the road. She wore a blue dress and a beautiful white hat with red flowers. Suddenly, a strong wind blew and took Ira''s hat away with it.

Ira ran after the hat, trying to catch it as it went on and on. But the wind was too fast and Ira couldn''t reach her hat. So she called for help and said, "Help! Help!"

A parrot heard Ira and looked below to find the little girl running after her hat. He quickly flew to the hat and caught it in his strong beak. He gave the hat back to Ira. "Thank you, dear parrot!" said Ira happily. "Welcome!" said the parrot and flew away in the sky.',
  'Adventure', 1, 12, 3, 'Fatema Arsiwala', false, true
),

(
  'Baby''s Night Adventure',
  'Baby Coco cannot sleep and wishes to play. The moon and stars come to take her on a magical night adventure.',
  'It was night time and mama had put baby Coco to bed. She kissed her on the cheek and then left the room.

Oh but baby Coco wasn''t sleepy. She wanted to play. But mama was gone. So how would she play now?

Baby Coco giggled and looked outside the window. She saw the moon and so many stars, smiling down at her. "I want to play!" she told them.

A big star came flying down to baby Coco''s room. Baby Coco sat on it and up she went into the sky with the twinkling star. "Whoosh!" went the star in the sky and baby Coco laughed.

Up in the sky, baby Coco jumped from one star to another saying "Weee!" Then she went to the tiny stars and started dancing with them. All night baby Coco played with the moon and the stars. Together, they had a lot of fun.

When finally she was tired, she wanted to sleep. "Come baby Coco. Sleep on me." The moon invited her. Baby Coco happily agreed. The moon rocked her lightly and sang her a gentle lullaby. When she fell asleep, it gently took her down and put baby Coco back into her bed.

Baby Coco smiled as she slept sweetly.',
  'Bedtime', 1, 12, 5, 'Fatema Arsiwala', true, true
),

(
  'The Red Shiny Ball',
  'Bobo the red ball plays with animal friends all day long, but gets dirty. Bobo finds a clever way to clean up.',
  'Bobo was a big, red, shiny ball. It was a fun ball and loved to play. All-day it went around the garden to play with its friends. The dogs would toss Bobo high into the sky and then run after it when it fell down. The cats would cradle Bobo and say "meow meow" as they played with it. All the birds in the sky would peck at it playfully and Bobo would laugh.

But as the day ended, Bobo became dirty because of all the playing. Bobo was sad and wanted to clean itself. But how would it do that? Bobo thought on and on when it finally had an idea. It quickly rolled over to the lake nearby.

"Plash plash plash!" Went Bobo as it jumped into the lake. It started jumping happily in the water, cleaning all the mud from itself. When Bobo was done, it was shiny and clean again. Bobo was pleased and came out of the water. "I''ll be back tomorrow!" it said to all animals and birds and then went home.',
  'Animals', 1, 12, 3, 'Fatema Arsiwala', false, true
),

(
  'Debbie''s Ball',
  'Debbie the baby elephant loses her favourite red ball in the forest. Mama elephant shows her love by finding it.',
  'On a nice summer day in the forest, Debbie the baby elephant was playing with her red ball. The ball was big and shiny and Debbie loved playing with it. With her long trunk, she threw the ball high in the sky and then caught it when it came down. But once, she threw the ball too high and too far. Far and far went the ball and then it was gone!

"Oh no!" cried Debbie. She searched for the ball everywhere but couldn''t find it. Crying, she went back home and told Mama what had happened. "It''s okay, little Debbie." cooed mama elephant but Debbie was still sad. All-day, she sat on her bed, sobbing for her dear red ball.

When night came, someone knocked on Debbie''s door. Debbie opened the door to see her red ball flying there! "Yayy!" she said and picked up the ball. Mama elephant had gone to the forest and found her ball.

"Thank you so much, mama!" said Debbie happily. "Welcome, sweet Debbie." replied mama elephant and together they started playing with the shiny red ball.',
  'Family', 1, 12, 4, 'Fatema Arsiwala', false, true
),

(
  'Baby Hana''s Pet',
  'Baby Hana and her spotty dog Puff love to play together. One day Puff goes missing and Hana searches everywhere.',
  'Baby Hana had a pet. It was a dog named Puff. He was white in color with small black spots on his body. It had two big blue eyes and a tiny black nose. His tongue was long and pink in color.

Puff loved running and playing all day long. Baby Hana enjoyed it too. They would play with their red shiny ball and the yellow choo-choo train.

But one day, baby Hana could not find Puff. She looked for him everywhere.

She looked over the bed and then under it. She searched for him inside the cupboards and all the rooms. She even asked mama but Puff was nowhere to be found.

"Where is little Puff?" wondered baby Hana.

"Puff! Puff!" called baby Hana loudly. And soon she heard Puff call back saying, "Woof! Woof!"',
  'Family', 1, 12, 3, 'Fatema Arsiwala', true, true
),

(
  'The Blue Car and the Puddle',
  'Bub the blue car drives through a muddy puddle and needs help to get clean. Her friend Piffy the pink car saves the day.',
  'On a bright sunny day, Bub the blue car was driving on the road. It was warm and Bub was enjoying the drive. "Vroom vroom vroom," drove Bub happily as she passed trees, animals, and birds.

All was well until Bub''s wheels drove over a big puddle. The puddle splashed loudly and the dirty water got all over Bub''s blue body. Oh no! Bub the blue car was so muddy. Now how would she clean herself?

Bub started to think and had an idea. She could go to her friend Piffy the pink car''s house. She would help her. Bub rushed to Piffy''s house and honked her horn loudly. Piffy the pink car heard and came out. She saw that Bub needed help and happily agreed. Piffy brought a big water pipe and sprayed it on Bub. "Splash Splash!" went the water and the dirty mud water washed away.

Bub thanked Piffy for her help and asked her if she would like to drive with her. "Yes!" said Piffy and together they drove away.',
  'Adventure', 1, 12, 3, 'Fatema Arsiwala', false, true
),

-- ── 13-24 months ─────────────────────────────────────────────────────────────

(
  'The Sly Lion',
  'An aging lion uses a clever trick to catch deer. But the deer learn a valuable lesson about being careful.',
  'In a big forest in South Africa lived many animals. In this forest, lived a big, strong lion. Every day, the lion would go out of his den and hunt and kill many deers. The deers were very scared of the lion.

But as the years passed, the lion grew older and weaker. And so he was not able to catch a lot of deers anymore. One day, he wasn''t able to catch a single deer and was very hungry. So he decided to play a trick. He lay on his back and did not move at all.

A deer saw him and thought that the lion was dead. She happily ran to her friends and said, "The lion is dead! The lion is dead! Let us dance and play!"

The herd of deer was very happy to hear that the lion was dead. All of them started to dance and play around the lion. The lion continued to act dead and did not move at all.

After a while, one of the deers jumped onto the lion thinking it was safe. As soon as the deer came close enough, the lion grabbed it quickly. The other deer ran away in fear.

The lion smiled. His trick had worked! But the wise old owl watching from a tree called out to the other deer: "Always check twice before you trust, little ones. Safety must be earned, not assumed."',
  'Animals', 13, 24, 5, 'Aesha Jhaveri', true, true
)

ON CONFLICT DO NOTHING;

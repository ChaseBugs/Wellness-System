-- Migration 016: Set image_url for activities from cropped thumbnails

UPDATE activities SET image_url = CASE title
  WHEN 'Checkerboard' THEN '/images/activities/Checkerboard.png'
  WHEN 'Spa Time' THEN '/images/activities/Spa_Time.png'
  WHEN 'Music' THEN '/images/activities/Music.png'
  WHEN 'Tummy Time L1' THEN '/images/activities/Tummy_Time_L1.png'
  WHEN 'Palmar Reflex' THEN '/images/activities/Palmar_Reflex.png'
  WHEN 'My Face' THEN '/images/activities/My_Face.png'
  WHEN 'Responding To Sound' THEN '/images/activities/Responding_To_Sound.png'
  WHEN 'Plantar Reflex' THEN '/images/activities/Plantar_Reflex.png'
  WHEN 'Recognizing Voices' THEN '/images/activities/Recognizing_Voices.png'
  WHEN 'Familiar Songs' THEN '/images/activities/Familiar_Songs.png'
  WHEN 'Tactile Sense' THEN '/images/activities/Tactile_Sense.png'
  WHEN 'Spatial Movements' THEN '/images/activities/Spatial_Movements.png'
  WHEN 'Hand And Arms' THEN '/images/activities/Hand_And_Arms.png'
  WHEN 'Here I Am' THEN '/images/activities/Here_I_Am.png'
  WHEN 'Rooting Reflex' THEN '/images/activities/Rooting_Reflex.png'
  WHEN 'Moro Reflex' THEN '/images/activities/Moro_Reflex.png'
  WHEN 'Eye Focus' THEN '/images/activities/Eye_Focus.png'
  WHEN 'Body Exploration' THEN '/images/activities/Body_Exploration.png'
  WHEN 'Sucking Reflex' THEN '/images/activities/Sucking_Reflex.png'
  WHEN 'Black And White' THEN '/images/activities/Black_And_White.png'
  WHEN 'Love Her/Him' THEN '/images/activities/Love_HerHim.png'
  WHEN 'Different Sounds And Intensity' THEN '/images/activities/Different_Sounds_And_Intensity.png'
  WHEN 'Act Out A Rhyme' THEN '/images/activities/Act_Out_A_Rhyme.png'
  WHEN 'Sound Direction' THEN '/images/activities/Sound_Direction.png'
  WHEN 'Explore Surroundings' THEN '/images/activities/Explore_Surroundings.png'
  WHEN 'Cross Legs' THEN '/images/activities/Cross_Legs.png'
  WHEN 'Cross Hands' THEN '/images/activities/Cross_Hands.png'
  WHEN 'Introducing New People' THEN '/images/activities/Introducing_New_People.png'
  WHEN 'Recognizing Hands And Feet' THEN '/images/activities/Recognizing_Hands_And_Feet.png'
  WHEN 'Object Grip' THEN '/images/activities/Object_Grip.png'
  WHEN 'Story Snuggle' THEN '/images/activities/Story_Snuggle.png'
  WHEN 'Leg Cycling' THEN '/images/activities/Leg_Cycling.png'
  WHEN 'Eye Gazing' THEN '/images/activities/Eye_Gazing.png'
  WHEN 'Nerve Stimulation' THEN '/images/activities/Nerve_Stimulation.png'
  WHEN 'Face To Face Time' THEN '/images/activities/Face_To_Face_Time.png'
  WHEN 'Encourage Sounds' THEN '/images/activities/Encourage_Sounds.png'
  WHEN 'Leg Fold' THEN '/images/activities/Leg_Fold.png'
  WHEN 'Naked Time' THEN '/images/activities/Naked_Time.png'
  WHEN 'Tactile Sense 2' THEN '/images/activities/Tactile_Sense_2.png'
  WHEN 'Eye Movement' THEN '/images/activities/Eye_Movement.png'
  WHEN 'Recognizing Hands' THEN '/images/activities/Recognizing_Hands.png'
  WHEN 'Bedtime Stories' THEN '/images/activities/Bedtime_Stories.png'
  WHEN 'Head Lift L1' THEN '/images/activities/Head_Lift_L1.png'
  WHEN 'Making Sounds' THEN '/images/activities/Making_Sounds.png'
  WHEN 'Neck Movement' THEN '/images/activities/Neck_Movement.png'
  WHEN 'Bedtime Kisses' THEN '/images/activities/Bedtime_Kisses.png'
  WHEN 'Understanding Baby' THEN '/images/activities/Understanding_Baby.png'
  WHEN 'Body Positioning' THEN '/images/activities/Body_Positioning.png'
  WHEN 'Finger Grip' THEN '/images/activities/Finger_Grip.png'
  WHEN 'Pushing Legs' THEN '/images/activities/Pushing_Legs.png'
  WHEN 'Lifting By Hands' THEN '/images/activities/Lifting_By_Hands.png'
  WHEN 'Side Moves' THEN '/images/activities/Side_Moves.png'
  WHEN 'Cycle Movement' THEN '/images/activities/Cycle_Movement.png'
  WHEN 'Respond To Baby' THEN '/images/activities/Respond_To_Baby.png'
  WHEN 'Distinguish Sounds' THEN '/images/activities/Distinguish_Sounds.png'
  WHEN 'Language L1' THEN '/images/activities/Language_L1.png'
  WHEN 'Responding To Sounds' THEN '/images/activities/Responding_To_Sounds.png'
  WHEN 'Fetch A Toy' THEN '/images/activities/Fetch_A_Toy.png'
  WHEN 'Slow Dance' THEN '/images/activities/Slow_Dance.png'
  WHEN 'Multiple Voice Same Sounds' THEN '/images/activities/Multiple_Voice_Same_Sounds.png'
  WHEN 'Source Of Sound' THEN '/images/activities/Source_Of_Sound.png'
  WHEN 'The Touch' THEN '/images/activities/The_Touch.png'
  WHEN 'Creeping L1' THEN '/images/activities/Creeping_L1.png'
  WHEN 'Bring The Toy Closer' THEN '/images/activities/Bring_The_Toy_Closer.png'
  WHEN 'Bath Time Fun' THEN '/images/activities/Bath_Time_Fun.png'
  WHEN 'Different Aromas' THEN '/images/activities/Different_Aromas.png'
  WHEN 'Explore Surrounding With Sound' THEN '/images/activities/Explore_Surrounding_With_Sound.png'
  WHEN 'Photo Book' THEN '/images/activities/Photo_Book.png'
  WHEN 'Reinforce Places And Toys' THEN '/images/activities/Reinforce_Places_And_Toys.png'
  WHEN 'Describe Actions' THEN '/images/activities/Describe_Actions.png'
  WHEN 'Tracking Sound' THEN '/images/activities/Tracking_Sound.png'
  WHEN 'Stronger Grip' THEN '/images/activities/Stronger_Grip.png'
  WHEN 'Leg Bending' THEN '/images/activities/Leg_Bending.png'
  WHEN 'Expressions' THEN '/images/activities/Expressions.png'
  WHEN 'Speaking Differently' THEN '/images/activities/Speaking_Differently.png'
  WHEN 'Discovery With My Mouth' THEN '/images/activities/Discovery_With_My_Mouth.png'
  WHEN 'Recognizing Family' THEN '/images/activities/Recognizing_Family.png'
  WHEN 'Follow My Hand' THEN '/images/activities/Follow_My_Hand.png'
  WHEN 'Rolling' THEN '/images/activities/Rolling.png'
  WHEN 'Head Lift L2' THEN '/images/activities/Head_Lift_L2.png'
  WHEN 'Holding Objects' THEN '/images/activities/Holding_Objects.png'
  WHEN 'Mirror' THEN '/images/activities/Mirror.png'
  WHEN 'Wind Chime' THEN '/images/activities/Wind_Chime.png'
  WHEN 'Object Feeling' THEN '/images/activities/Object_Feeling.png'
  WHEN 'My Name' THEN '/images/activities/My_Name.png'
  WHEN 'Lifting And Spinning' THEN '/images/activities/Lifting_And_Spinning.png'
  WHEN 'Sucking Sound' THEN '/images/activities/Sucking_Sound.png'
  WHEN 'Laughing' THEN '/images/activities/Laughing.png'
  WHEN 'Introducing New People II' THEN '/images/activities/Introducing_New_People_II.png'
  WHEN 'Explain Actions To Baby' THEN '/images/activities/Explain_Actions_To_Baby.png'
  WHEN 'Imitation Game' THEN '/images/activities/Imitation_Game.png'
  WHEN 'Signs Of Affection' THEN '/images/activities/Signs_Of_Affection.png'
  WHEN 'Mirror Play' THEN '/images/activities/Mirror_Play.png'
  WHEN 'Pet Friend' THEN '/images/activities/Pet_Friend.png'
  WHEN 'Noise And Sound Together' THEN '/images/activities/Noise_And_Sound_Together.png'
  WHEN 'Lip Sounds L1' THEN '/images/activities/Lip_Sounds_L1.png'
  WHEN 'Squats' THEN '/images/activities/Squats.png'
  WHEN 'Leg Exercise' THEN '/images/activities/Leg_Exercise.png'
  WHEN 'Light Show' THEN '/images/activities/Light_Show.png'
  WHEN 'Action & Sound' THEN '/images/activities/Action__Sound.png'
  WHEN 'Flying Bird' THEN '/images/activities/Flying_Bird.png'
  WHEN 'Look Around' THEN '/images/activities/Look_Around.png'
  WHEN 'Combine Actions' THEN '/images/activities/Combine_Actions.png'
  WHEN 'Hand Movements' THEN '/images/activities/Hand_Movements.png'
  WHEN 'Talk And Move' THEN '/images/activities/Talk_And_Move.png'
  WHEN 'Stand-Up On Legs' THEN '/images/activities/Stand-Up_On_Legs.png'
  WHEN 'Read A Book' THEN '/images/activities/Read_A_Book.png'
  WHEN 'What Is On My Feet' THEN '/images/activities/What_Is_On_My_Feet.png'
  WHEN 'Creeping L2' THEN '/images/activities/Creeping_L2.png'
  WHEN 'Sitting Experience' THEN '/images/activities/Sitting_Experience.png'
  WHEN 'Sitting Posture' THEN '/images/activities/Sitting_Posture.png'
  WHEN 'Side Stretch' THEN '/images/activities/Side_Stretch.png'
  WHEN 'Back Exercise' THEN '/images/activities/Back_Exercise.png'
  WHEN 'Hand Games' THEN '/images/activities/Hand_Games.png'
  WHEN 'Help To Express Joy' THEN '/images/activities/Help_To_Express_Joy.png'
  WHEN 'Definition Of No' THEN '/images/activities/Definition_Of_No.png'
  WHEN 'Sound And Events' THEN '/images/activities/Sound_And_Events.png'
  WHEN 'Temperature Sense' THEN '/images/activities/Temperature_Sense.png'
  WHEN 'Book Trick' THEN '/images/activities/Book_Trick.png'
  WHEN 'Tongue Movements' THEN '/images/activities/Tongue_Movements.png'
  WHEN 'Walking On Legs' THEN '/images/activities/Walking_On_Legs.png'
  WHEN 'Shoulder And Arms Lift' THEN '/images/activities/Shoulder_And_Arms_Lift.png'
  WHEN 'Babble Talks' THEN '/images/activities/Babble_Talks.png'
  WHEN 'Object Permanence 2' THEN '/images/activities/Object_Permanence_2.png'
  WHEN 'Roll Over' THEN '/images/activities/Roll_Over.png'
  WHEN 'Sounds Of Nature' THEN '/images/activities/Sounds_Of_Nature.png'
  WHEN 'Face Down To Face Up' THEN '/images/activities/Face_Down_To_Face_Up.png'
  WHEN 'Tilt Balance' THEN '/images/activities/Tilt_Balance.png'
  WHEN 'Building Vocabulary L1' THEN '/images/activities/Building_Vocabulary_L1.png'
  WHEN 'Sitting Up' THEN '/images/activities/Sitting_Up.png'
  WHEN 'Rhyme & Dance' THEN '/images/activities/Rhyme__Dance.png'
  WHEN 'Object Permanence 1' THEN '/images/activities/Object_Permanence_1.png'
  WHEN 'Fixing Eyesight' THEN '/images/activities/Fixing_Eyesight.png'
  WHEN 'Controlling Sound' THEN '/images/activities/Controlling_Sound.png'
  WHEN 'Back Muscle Stretch' THEN '/images/activities/Back_Muscle_Stretch.png'
  WHEN 'Sitting Practice' THEN '/images/activities/Sitting_Practice.png'
  WHEN 'Rolling 360' THEN '/images/activities/Rolling_360.png'
  WHEN 'Mirror 2' THEN '/images/activities/Mirror_2.png'
  WHEN 'Recognising Name' THEN '/images/activities/Recognising_Name.png'
  WHEN 'Hand Eye Coordination' THEN '/images/activities/Hand_Eye_Coordination.png'
  WHEN 'Roly Poly Toy' THEN '/images/activities/Roly_Poly_Toy.png'
  WHEN 'Grasping Small Objects' THEN '/images/activities/Grasping_Small_Objects.png'
  WHEN 'Say Goodbye' THEN '/images/activities/Say_Goodbye.png'
  WHEN 'Talking Through Sound' THEN '/images/activities/Talking_Through_Sound.png'
  WHEN 'Another World' THEN '/images/activities/Another_World.png'
  WHEN 'Switch On & Off' THEN '/images/activities/Switch_On__Off.png'
  WHEN 'Paper Shredding' THEN '/images/activities/Paper_Shredding.png'
  WHEN 'Single Syllables' THEN '/images/activities/Single_Syllables.png'
  WHEN 'Playing With Balloons' THEN '/images/activities/Playing_With_Balloons.png'
  WHEN 'Sound & Light' THEN '/images/activities/Sound__Light.png'
  WHEN 'Explore Nature' THEN '/images/activities/Explore_Nature.png'
  WHEN 'Cause & Effect' THEN '/images/activities/Cause__Effect.png'
  WHEN 'Squeezing A Sponge' THEN '/images/activities/Squeezing_A_Sponge.png'
  WHEN 'Object Permanence 5' THEN '/images/activities/Object_Permanence_5.png'
  WHEN 'Object Tracking' THEN '/images/activities/Object_Tracking.png'
  WHEN 'Exploring Round Objects' THEN '/images/activities/Exploring_Round_Objects.png'
  WHEN 'Peek A Boo' THEN '/images/activities/Peek_A_Boo.png'
  WHEN 'Rotating On Stomach' THEN '/images/activities/Rotating_On_Stomach.png'
  WHEN 'Bouncing Ball' THEN '/images/activities/Bouncing_Ball.png'
  WHEN 'Object Permanence 4' THEN '/images/activities/Object_Permanence_4.png'
  WHEN 'Read And Act' THEN '/images/activities/Read_And_Act.png'
  WHEN 'Standing Foundation' THEN '/images/activities/Standing_Foundation.png'
  WHEN 'Standing Up Foundation L2' THEN '/images/activities/Standing_Up_Foundation_L2.png'
  WHEN 'Observe The Toy' THEN '/images/activities/Observe_The_Toy.png'
  WHEN 'Where Did It Go' THEN '/images/activities/Where_Did_It_Go.png'
  WHEN 'Regaining Sitting Posture' THEN '/images/activities/Regaining_Sitting_Posture.png'
  WHEN 'Standing Up Foundation L1' THEN '/images/activities/Standing_Up_Foundation_L1.png'
  WHEN 'Yes & No L1' THEN '/images/activities/Yes__No_L1.png'
  WHEN 'Balancing' THEN '/images/activities/Balancing.png'
  WHEN 'Parachute Reflex' THEN '/images/activities/Parachute_Reflex.png'
  WHEN 'Crawling Foundation L3' THEN '/images/activities/Crawling_Foundation_L3.png'
  WHEN 'Starting To Crawl' THEN '/images/activities/Starting_To_Crawl.png'
  WHEN 'Moving Forward' THEN '/images/activities/Moving_Forward.png'
  WHEN 'Laughing 2' THEN '/images/activities/Laughing_2.png'
  WHEN 'Clapping' THEN '/images/activities/Clapping.png'
  WHEN 'Animal Sounds' THEN '/images/activities/Animal_Sounds.png'
  WHEN 'Lip Lesson' THEN '/images/activities/Lip_Lesson.png'
  WHEN 'Mirror 3' THEN '/images/activities/Mirror_3.png'
  WHEN 'Putting Things In Box' THEN '/images/activities/Putting_Things_In_Box.png'
  WHEN 'Clapping Hands' THEN '/images/activities/Clapping_Hands.png'
  WHEN 'Social Exposure' THEN '/images/activities/Social_Exposure.png'
  WHEN 'Phone Conversation' THEN '/images/activities/Phone_Conversation.png'
  WHEN 'Crawling With Obstacles' THEN '/images/activities/Crawling_With_Obstacles.png'
  WHEN 'Daily Moments' THEN '/images/activities/Daily_Moments.png'
  WHEN 'Clap With Me' THEN '/images/activities/Clap_With_Me.png'
  WHEN 'Differentiating Tone & Volumes' THEN '/images/activities/Differentiating_Tone__Volumes.png'
  WHEN 'Holding 3 Objects' THEN '/images/activities/Holding_3_Objects.png'
  WHEN 'Play Date' THEN '/images/activities/Play_Date.png'
  WHEN 'Greeting' THEN '/images/activities/Greeting.png'
  WHEN 'Toy In The Box' THEN '/images/activities/Toy_In_The_Box.png'
  WHEN 'Pull Action' THEN '/images/activities/Pull_Action.png'
  WHEN 'Object Finding Game' THEN '/images/activities/Object_Finding_Game.png'
  WHEN 'Object Revealing' THEN '/images/activities/Object_Revealing.png'
  WHEN 'Shake The Bottle' THEN '/images/activities/Shake_The_Bottle.png'
  WHEN 'Playing Drums' THEN '/images/activities/Playing_Drums.png'
  WHEN 'Building Vocabulary L2' THEN '/images/activities/Building_Vocabulary_L2.png'
  WHEN 'Shaping Things With Hands' THEN '/images/activities/Shaping_Things_With_Hands.png'
  WHEN 'Creating Sounds' THEN '/images/activities/Creating_Sounds.png'
  WHEN 'Verbal Directions' THEN '/images/activities/Verbal_Directions.png'
  WHEN 'Fast & Slow Clapping' THEN '/images/activities/Fast__Slow_Clapping.png'
  WHEN 'Finger Pick And Drop' THEN '/images/activities/Finger_Pick_And_Drop.png'
  WHEN 'Removing Rings' THEN '/images/activities/Removing_Rings.png'
  WHEN 'Getting The Toy' THEN '/images/activities/Getting_The_Toy.png'
  WHEN 'Counting Toes' THEN '/images/activities/Counting_Toes.png'
  WHEN 'Goof Off' THEN '/images/activities/Goof_Off.png'
  WHEN 'Finding Sound Source' THEN '/images/activities/Finding_Sound_Source.png'
  WHEN 'Rotating Objects' THEN '/images/activities/Rotating_Objects.png'
  WHEN 'Crawling Long Distance' THEN '/images/activities/Crawling_Long_Distance.png'
  WHEN 'Standing Up' THEN '/images/activities/Standing_Up.png'
  WHEN 'Walk With Help' THEN '/images/activities/Walk_With_Help.png'
  WHEN 'One Hand To Other' THEN '/images/activities/One_Hand_To_Other.png'
  WHEN 'Taking Out Things' THEN '/images/activities/Taking_Out_Things.png'
  WHEN 'Standing Foundation L3' THEN '/images/activities/Standing_Foundation_L3.png'
  WHEN 'Join The Fun' THEN '/images/activities/Join_The_Fun.png'
  ELSE image_url
END
WHERE title IN (
  'Checkerboard',
  'Spa Time',
  'Music',
  'Tummy Time L1',
  'Palmar Reflex',
  'My Face',
  'Responding To Sound',
  'Plantar Reflex',
  'Recognizing Voices',
  'Familiar Songs',
  'Tactile Sense',
  'Spatial Movements',
  'Hand And Arms',
  'Here I Am',
  'Rooting Reflex',
  'Moro Reflex',
  'Eye Focus',
  'Body Exploration',
  'Sucking Reflex',
  'Black And White',
  'Love Her/Him',
  'Different Sounds And Intensity',
  'Act Out A Rhyme',
  'Sound Direction',
  'Explore Surroundings',
  'Cross Legs',
  'Cross Hands',
  'Introducing New People',
  'Recognizing Hands And Feet',
  'Object Grip',
  'Story Snuggle',
  'Leg Cycling',
  'Eye Gazing',
  'Nerve Stimulation',
  'Face To Face Time',
  'Encourage Sounds',
  'Leg Fold',
  'Naked Time',
  'Tactile Sense 2',
  'Eye Movement',
  'Recognizing Hands',
  'Bedtime Stories',
  'Head Lift L1',
  'Making Sounds',
  'Neck Movement',
  'Bedtime Kisses',
  'Understanding Baby',
  'Body Positioning',
  'Finger Grip',
  'Pushing Legs',
  'Lifting By Hands',
  'Side Moves',
  'Cycle Movement',
  'Respond To Baby',
  'Distinguish Sounds',
  'Language L1',
  'Responding To Sounds',
  'Fetch A Toy',
  'Slow Dance',
  'Multiple Voice Same Sounds',
  'Source Of Sound',
  'The Touch',
  'Creeping L1',
  'Bring The Toy Closer',
  'Bath Time Fun',
  'Different Aromas',
  'Explore Surrounding With Sound',
  'Photo Book',
  'Reinforce Places And Toys',
  'Describe Actions',
  'Tracking Sound',
  'Stronger Grip',
  'Leg Bending',
  'Expressions',
  'Speaking Differently',
  'Discovery With My Mouth',
  'Recognizing Family',
  'Follow My Hand',
  'Rolling',
  'Head Lift L2',
  'Holding Objects',
  'Mirror',
  'Wind Chime',
  'Object Feeling',
  'My Name',
  'Lifting And Spinning',
  'Sucking Sound',
  'Laughing',
  'Introducing New People II',
  'Explain Actions To Baby',
  'Imitation Game',
  'Signs Of Affection',
  'Mirror Play',
  'Pet Friend',
  'Noise And Sound Together',
  'Lip Sounds L1',
  'Squats',
  'Leg Exercise',
  'Light Show',
  'Action & Sound',
  'Flying Bird',
  'Look Around',
  'Combine Actions',
  'Hand Movements',
  'Talk And Move',
  'Stand-Up On Legs',
  'Read A Book',
  'What Is On My Feet',
  'Creeping L2',
  'Sitting Experience',
  'Sitting Posture',
  'Side Stretch',
  'Back Exercise',
  'Hand Games',
  'Help To Express Joy',
  'Definition Of No',
  'Sound And Events',
  'Temperature Sense',
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
  'Say Goodbye',
  'Talking Through Sound',
  'Another World',
  'Switch On & Off',
  'Paper Shredding',
  'Single Syllables',
  'Playing With Balloons',
  'Sound & Light',
  'Explore Nature',
  'Cause & Effect',
  'Squeezing A Sponge',
  'Object Permanence 5',
  'Object Tracking',
  'Exploring Round Objects',
  'Peek A Boo',
  'Rotating On Stomach',
  'Bouncing Ball',
  'Object Permanence 4',
  'Read And Act',
  'Standing Foundation',
  'Standing Up Foundation L2',
  'Observe The Toy',
  'Where Did It Go',
  'Regaining Sitting Posture',
  'Standing Up Foundation L1',
  'Yes & No L1',
  'Balancing',
  'Parachute Reflex',
  'Crawling Foundation L3',
  'Starting To Crawl',
  'Moving Forward',
  'Laughing 2',
  'Clapping',
  'Animal Sounds',
  'Lip Lesson',
  'Mirror 3',
  'Putting Things In Box',
  'Clapping Hands',
  'Social Exposure',
  'Phone Conversation',
  'Crawling With Obstacles',
  'Daily Moments',
  'Clap With Me',
  'Differentiating Tone & Volumes',
  'Holding 3 Objects',
  'Play Date',
  'Greeting',
  'Toy In The Box',
  'Pull Action',
  'Object Finding Game',
  'Object Revealing',
  'Shake The Bottle',
  'Playing Drums',
  'Building Vocabulary L2',
  'Shaping Things With Hands',
  'Creating Sounds',
  'Verbal Directions',
  'Fast & Slow Clapping',
  'Finger Pick And Drop',
  'Removing Rings',
  'Getting The Toy',
  'Counting Toes',
  'Goof Off',
  'Finding Sound Source',
  'Rotating Objects',
  'Crawling Long Distance',
  'Standing Up',
  'Walk With Help',
  'One Hand To Other',
  'Taking Out Things',
  'Standing Foundation L3',
  'Join The Fun'
);

-- Verify
SELECT COUNT(*) AS updated_count FROM activities WHERE image_url IS NOT NULL;
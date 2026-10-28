-- Migration 020: Set image_url for activities from months 10-12 cropped thumbnails

UPDATE activities SET image_url = CASE title
  -- Month 10 new activities
  WHEN 'Learning Through Books' THEN '/images/activities/Learning_Through_Books.png'
  WHEN 'Three Objects' THEN '/images/activities/Three_Objects.png'
  WHEN 'Do Messy Painting' THEN '/images/activities/Do_Messy_Painting.png'
  WHEN 'Granularity' THEN '/images/activities/Granularity.png'
  WHEN 'Stacking Rings' THEN '/images/activities/Stacking_Rings.png'
  WHEN 'Messy Activity' THEN '/images/activities/Messy_Activity.png'
  WHEN 'Finger Pinching And Poking' THEN '/images/activities/Finger_Pinching_And_Poking.png'
  WHEN 'Find The Object' THEN '/images/activities/Find_The_Object.png'
  WHEN 'Finger Grasp' THEN '/images/activities/Finger_Grasp.png'
  WHEN 'Stand Without Support' THEN '/images/activities/Stand_Without_Support.png'
  WHEN 'Stand Up' THEN '/images/activities/Stand_Up.png'
  WHEN 'Yes & No L2' THEN '/images/activities/Yes__No_L2.png'
  WHEN 'Tactical Grip' THEN '/images/activities/Tactical_Grip.png'
  WHEN 'Anticipating Events 2' THEN '/images/activities/Anticipating_Events_2.png'
  WHEN 'Image Vs Live Objects' THEN '/images/activities/Image_Vs_Live_Objects.png'
  WHEN 'Peekaboo Bath' THEN '/images/activities/Peekaboo_Bath.png'
  WHEN 'Dada And Mama' THEN '/images/activities/Dada_And_Mama.png'
  WHEN 'Gesture Communication' THEN '/images/activities/Gesture_Communication.png'
  WHEN 'Walking With Assistance L1' THEN '/images/activities/Walking_With_Assistance_L1.png'
  WHEN 'Hugs And Kisses' THEN '/images/activities/Hugs_And_Kisses.png'
  WHEN 'Climbing Down A Step' THEN '/images/activities/Climbing_Down_A_Step.png'
  WHEN 'Turning The Pages' THEN '/images/activities/Turning_The_Pages.png'
  WHEN 'Playing With Siblings' THEN '/images/activities/Playing_With_Siblings.png'
  WHEN 'Climbing Up A Step' THEN '/images/activities/Climbing_Up_A_Step.png'
  WHEN 'Learn To Sit Down' THEN '/images/activities/Learn_To_Sit_Down.png'
  WHEN 'Head To Head' THEN '/images/activities/Head_To_Head.png'
  WHEN 'Repeat Actions' THEN '/images/activities/Repeat_Actions.png'
  WHEN 'Reading Book By Themselves' THEN '/images/activities/Reading_Book_By_Themselves.png'
  -- Month 11 new activities
  WHEN 'Play With Dough' THEN '/images/activities/Play_With_Dough.png'
  WHEN 'Tasting Time' THEN '/images/activities/Tasting_Time.png'
  WHEN 'Stretch The Feet' THEN '/images/activities/Stretch_The_Feet.png'
  WHEN 'Fluid Difference' THEN '/images/activities/Fluid_Difference.png'
  WHEN 'Sitting To Standing Position' THEN '/images/activities/Sitting_To_Standing_Position.png'
  WHEN 'Hold And Walk' THEN '/images/activities/Hold_And_Walk.png'
  WHEN 'Similar And Different' THEN '/images/activities/Similar_And_Different.png'
  WHEN 'Sound Vibrations' THEN '/images/activities/Sound_Vibrations.png'
  WHEN 'Stand And Play' THEN '/images/activities/Stand_And_Play.png'
  WHEN 'Weather Talk' THEN '/images/activities/Weather_Talk.png'
  WHEN 'Crawl Through Tunnel' THEN '/images/activities/Crawl_Through_Tunnel.png'
  WHEN 'Stand And Lift' THEN '/images/activities/Stand_And_Lift.png'
  WHEN 'Walking With Support' THEN '/images/activities/Walking_With_Support.png'
  WHEN 'Learn To Walk' THEN '/images/activities/Learn_To_Walk.png'
  WHEN 'Walking With Assistance L2' THEN '/images/activities/Walking_With_Assistance_L2.png'
  WHEN 'Curious In Park' THEN '/images/activities/Curious_In_Park.png'
  WHEN 'Sing To Baby' THEN '/images/activities/Sing_To_Baby.png'
  WHEN 'Tickling Spider' THEN '/images/activities/Tickling_Spider.png'
  WHEN 'Fishing In A Bathtub' THEN '/images/activities/Fishing_In_A_Bathtub.png'
  WHEN 'Visiting People' THEN '/images/activities/Visiting_People.png'
  WHEN 'Body Part' THEN '/images/activities/Body_Part.png'
  WHEN 'Throwing Ball L1' THEN '/images/activities/Throwing_Ball_L1.png'
  WHEN 'Standing On Soft Surface' THEN '/images/activities/Standing_On_Soft_Surface.png'
  WHEN 'Empty A Container' THEN '/images/activities/Empty_A_Container.png'
  -- Month 12 new activities
  WHEN 'Open & Close' THEN '/images/activities/Open__Close.png'
  WHEN 'Different Aromas 2' THEN '/images/activities/Different_Aromas_2.png'
  WHEN 'Sponge Play' THEN '/images/activities/Sponge_Play.png'
  WHEN 'Memory Training' THEN '/images/activities/Memory_Training.png'
  WHEN 'Who Is In The Mirror' THEN '/images/activities/Who_Is_In_The_Mirror.png'
  WHEN 'Fun With Paper' THEN '/images/activities/Fun_With_Paper.png'
  WHEN 'Walking With Objects' THEN '/images/activities/Walking_With_Objects.png'
  WHEN 'Finger Painting' THEN '/images/activities/Finger_Painting.png'
  WHEN 'Taking Objects' THEN '/images/activities/Taking_Objects.png'
  WHEN 'Moving Large Objects' THEN '/images/activities/Moving_Large_Objects.png'
  WHEN 'Familiarize With Family' THEN '/images/activities/Familiarize_With_Family.png'
  WHEN 'Motion And Direction' THEN '/images/activities/Motion_And_Direction.png'
  WHEN 'Give And Take' THEN '/images/activities/Give_And_Take.png'
  WHEN 'Object Identification' THEN '/images/activities/Object_Identification.png'
  WHEN 'Posture Words' THEN '/images/activities/Posture_Words.png'
  WHEN 'Hide And Seek' THEN '/images/activities/Hide_And_Seek.png'
  WHEN 'Web Basket' THEN '/images/activities/Web_Basket.png'
  WHEN 'Stacking And Falling' THEN '/images/activities/Stacking_And_Falling.png'
  WHEN 'Give The Lead' THEN '/images/activities/Give_The_Lead.png'
  ELSE image_url
END
WHERE title IN (
  'Learning Through Books',
  'Three Objects',
  'Do Messy Painting',
  'Granularity',
  'Stacking Rings',
  'Messy Activity',
  'Finger Pinching And Poking',
  'Find The Object',
  'Finger Grasp',
  'Stand Without Support',
  'Stand Up',
  'Yes & No L2',
  'Tactical Grip',
  'Anticipating Events 2',
  'Image Vs Live Objects',
  'Peekaboo Bath',
  'Dada And Mama',
  'Gesture Communication',
  'Walking With Assistance L1',
  'Hugs And Kisses',
  'Climbing Down A Step',
  'Turning The Pages',
  'Playing With Siblings',
  'Climbing Up A Step',
  'Learn To Sit Down',
  'Head To Head',
  'Repeat Actions',
  'Reading Book By Themselves',
  'Play With Dough',
  'Tasting Time',
  'Stretch The Feet',
  'Fluid Difference',
  'Sitting To Standing Position',
  'Hold And Walk',
  'Similar And Different',
  'Sound Vibrations',
  'Stand And Play',
  'Weather Talk',
  'Crawl Through Tunnel',
  'Stand And Lift',
  'Walking With Support',
  'Learn To Walk',
  'Walking With Assistance L2',
  'Curious In Park',
  'Sing To Baby',
  'Tickling Spider',
  'Fishing In A Bathtub',
  'Visiting People',
  'Body Part',
  'Throwing Ball L1',
  'Standing On Soft Surface',
  'Empty A Container',
  'Open & Close',
  'Different Aromas 2',
  'Sponge Play',
  'Memory Training',
  'Who Is In The Mirror',
  'Fun With Paper',
  'Walking With Objects',
  'Finger Painting',
  'Taking Objects',
  'Moving Large Objects',
  'Familiarize With Family',
  'Motion And Direction',
  'Give And Take',
  'Object Identification',
  'Posture Words',
  'Hide And Seek',
  'Web Basket',
  'Stacking And Falling',
  'Give The Lead'
);

-- Verify
SELECT title, image_url FROM activities
WHERE title IN (
  'Learning Through Books', 'Play With Dough', 'Hide And Seek',
  'Walking With Objects', 'Stacking And Falling', 'Give The Lead'
)
ORDER BY title;

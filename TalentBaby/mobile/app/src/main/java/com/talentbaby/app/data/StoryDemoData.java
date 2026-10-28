package com.talentbaby.app.data;

import com.talentbaby.app.R;
import com.talentbaby.app.models.Story;

import java.util.ArrayList;
import java.util.List;

public final class StoryDemoData {
    private StoryDemoData() {}

    public static List<Story> stories() {
        List<Story> stories = new ArrayList<>();
        stories.add(story(1, "The Hungry Sparrow", R.drawable.story_hungry_sparrow, 32079,
                "flying high in the sky. \"Chi chi chi!\" she chirped happily. Soon she was hungry and started searching for food. After a long flight, she finally found something! It was a big, red apple!\n\n\"Yum yum yum!\" The sparrow said and flew for the apple. But when she reached closer, she found that the apple was too big for her. The little sparrow tried to pick the apple up but she couldn't.\n\nThe little sparrow became sad. Then, she got an idea! She started pecking at the apple. \"Peck peck peck,\" she went and began to eat small bites of the tasty red apple. \"Nom nom nom,\" she pecked on. Soon, her tummy was full and the sparrow was happy. She said \"Yay yay yay\" and flew away."));
        stories.add(story(2, "Ira's Hat", R.drawable.story_iras_hat, 18420,
                "Ira found a bright little hat and wondered who it belonged to. She asked everyone she met until a cheerful bird came looking for it."));
        stories.add(story(3, "Baby Hana's Pet", R.drawable.story_hanas_pet, 15284,
                "Baby Hana met a soft, playful puppy. Together they learned gentle touches, happy sounds, and the joy of making a new friend."));
        stories.add(story(4, "The Curious Bird", R.drawable.story_hungry_sparrow, 21870, "12-24",
                "A curious little bird saw bright fruit in a tall tree and learned to wait, watch, and try again."));
        stories.add(story(5, "Ira's Big Hat", R.drawable.story_iras_hat, 17620, "12-24",
                "Ira wore a big hat on a windy day. She laughed as it danced through the garden and found its way home."));
        stories.add(story(6, "Hana Shares", R.drawable.story_hanas_pet, 14310, "12-24",
                "Hana and her puppy practiced sharing toys, gentle hands, and happy sounds together."));
        return stories;
    }

    public static Story storyById(int id) {
        for (Story story : stories()) {
            if (story.getId() == id) return story;
        }
        return stories().get(0);
    }

    private static Story story(int id, String title, int imageResId, int views, String content) {
        return story(id, title, imageResId, views, "0-11", content);
    }

    private static Story story(int id, String title, int imageResId, int views, String ageGroup, String content) {
        Story story = new Story();
        story.setId(id);
        story.setTitle(title);
        story.setAuthor("Fatema Arsiwala");
        story.setNarrator("Jewlz Villegas");
        story.setAgeGroup(ageGroup);
        story.setViewCount(views);
        story.setContent(content);
        story.setLocalImageResId(imageResId);
        return story;
    }
}

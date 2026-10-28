package com.talentbaby.app.activities;

import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.talentbaby.app.R;
import com.talentbaby.app.adapters.StoryAdapter;
import com.talentbaby.app.data.StoryDemoData;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Story;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StoryDetailActivity extends AppCompatActivity {
    private ImageView imageHero;
    private TextView textTitle;
    private TextView textAuthor;
    private TextView textViews;
    private TextView textContent;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_story_detail);

        apiService = ApiClient.getClient().create(ApiService.class);

        ImageButton back = findViewById(R.id.btnBackStoryDetail);
        back.setOnClickListener(v -> finish());

        imageHero = findViewById(R.id.imageStoryHero);
        textTitle = findViewById(R.id.textStoryTitle);
        textAuthor = findViewById(R.id.textStoryAuthor);
        textViews = findViewById(R.id.textStoryViews);
        textContent = findViewById(R.id.textStoryContent);

        int storyId = getIntent().getIntExtra("story_id", 1);
        bindStory(StoryDemoData.storyById(storyId));
        setupOtherStories(storyId);
        loadStoryFromApi(storyId);
    }

    private void loadStoryFromApi(int storyId) {
        apiService.getStory(storyId).enqueue(new Callback<ApiResponse<Story>>() {
            @Override
            public void onResponse(Call<ApiResponse<Story>> call, Response<ApiResponse<Story>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    bindStory(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Story>> call, Throwable t) {
                // Demo story remains visible until the backend endpoint is available.
            }
        });
    }

    private void bindStory(Story story) {
        textTitle.setText(story.getTitle() != null ? story.getTitle() : "");
        String author = story.getAuthor() != null ? story.getAuthor() : "";
        String narrator = story.getNarrator() != null ? story.getNarrator() : "";
        textAuthor.setText(getString(R.string.story_author_format, author, narrator));
        textViews.setText(String.valueOf(story.getViewCount()));
        textContent.setText(story.getContent() != null ? story.getContent() : "");

        if (story.getImageUrl() != null && !story.getImageUrl().isEmpty()) {
            String imageUrl = story.getImageUrl().startsWith("/")
                    ? ApiClient.getBaseUrl() + story.getImageUrl().substring(1)
                    : story.getImageUrl();
            Glide.with(this).load(imageUrl).centerCrop().into(imageHero);
        } else if (story.getLocalImageResId() != 0) {
            imageHero.setImageResource(story.getLocalImageResId());
        }
    }

    private void setupOtherStories(int currentStoryId) {
        List<Story> otherStories = new ArrayList<>();
        for (Story story : StoryDemoData.stories()) {
            if (story.getId() != currentStoryId) otherStories.add(story);
        }

        RecyclerView recyclerOtherStories = findViewById(R.id.recyclerOtherStories);
        recyclerOtherStories.setLayoutManager(
                new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        recyclerOtherStories.setAdapter(new StoryAdapter(otherStories, true, story -> {
            getIntent().putExtra("story_id", story.getId());
            bindStory(story);
            setupOtherStories(story.getId());
            loadStoryFromApi(story.getId());
        }));
    }
}

package com.talentbaby.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.talentbaby.app.R;
import com.talentbaby.app.models.Story;
import com.talentbaby.app.utils.ApiClient;

import java.util.List;

public class StoryAdapter extends RecyclerView.Adapter<StoryAdapter.ViewHolder> {
    private final List<Story> stories;
    private final OnStoryClickListener listener;
    private final boolean compact;

    public interface OnStoryClickListener {
        void onStoryClick(Story story);
    }

    public StoryAdapter(List<Story> stories, boolean compact, OnStoryClickListener listener) {
        this.stories = stories;
        this.compact = compact;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        int layout = compact ? R.layout.item_story_compact : R.layout.item_story_card;
        View view = LayoutInflater.from(parent.getContext()).inflate(layout, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Story story = stories.get(position);
        holder.title.setText(story.getTitle() != null ? story.getTitle() : "");

        if (story.getImageUrl() != null && !story.getImageUrl().isEmpty()) {
            String imageUrl = story.getImageUrl().startsWith("/")
                    ? ApiClient.getBaseUrl() + story.getImageUrl().substring(1)
                    : story.getImageUrl();
            Glide.with(holder.itemView.getContext())
                    .load(imageUrl)
                    .placeholder(R.drawable.rounded_image_background)
                    .centerCrop()
                    .into(holder.image);
        } else if (story.getLocalImageResId() != 0) {
            holder.image.setImageResource(story.getLocalImageResId());
        } else {
            holder.image.setImageResource(R.drawable.rounded_image_background);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onStoryClick(story);
        });
    }

    @Override
    public int getItemCount() {
        return stories != null ? stories.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ImageView image;
        final TextView title;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            image = itemView.findViewById(R.id.imageStory);
            title = itemView.findViewById(R.id.textStoryTitle);
        }
    }
}

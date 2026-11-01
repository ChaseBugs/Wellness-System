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
import com.talentbaby.app.models.Activity;
import com.talentbaby.app.models.DailyActivity;
import com.talentbaby.app.utils.ApiClient;

import java.util.List;

public class TodayActivityAdapter extends RecyclerView.Adapter<TodayActivityAdapter.ViewHolder> {

    private List<DailyActivity> dailyActivities;
    private OnActivityClickListener listener;

    public interface OnActivityClickListener {
        void onActivityClick(Activity activity);
    }

    private static final String[] CATEGORY_MARKERS = {"o", "o", "o", "o"};

    public TodayActivityAdapter(List<DailyActivity> dailyActivities) {
        this.dailyActivities = dailyActivities;
    }

    public TodayActivityAdapter(List<DailyActivity> dailyActivities, OnActivityClickListener listener) {
        this.dailyActivities = dailyActivities;
        this.listener = listener;
    }

    public void updateActivities(List<DailyActivity> newList) {
        this.dailyActivities = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_today_activity, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DailyActivity daily = dailyActivities.get(position);
        Activity activity = daily.getActivity();
        if (activity == null) return;

        holder.textName.setText(activity.getTitle() != null ? activity.getTitle() : "");

        String subCat = activity.getSubCategory();
        if (subCat != null && !subCat.isEmpty()) {
            holder.textCategory.setText(subCat);
            String marker = position < CATEGORY_MARKERS.length ? CATEGORY_MARKERS[position] : "o";
            holder.textSubCategoryIcon.setText(marker);
        } else if (activity.getCategory() != null) {
            holder.textCategory.setText(activity.getCategory());
            holder.textSubCategoryIcon.setText("o");
        }

        if (activity.getDoneCount() > 0) {
            holder.textDoneByBabies.setText(
                    holder.itemView.getContext().getString(R.string.done_by_babies, activity.getDoneCount()));
            holder.textDoneByBabies.setVisibility(View.VISIBLE);
        } else {
            holder.textDoneByBabies.setVisibility(View.GONE);
        }

        if (activity.getDurationMinutes() > 0) {
            holder.textDuration.setText(
                    holder.itemView.getContext().getString(R.string.minutes, activity.getDurationMinutes()));
            holder.textDuration.setVisibility(View.VISIBLE);
        } else {
            holder.textDuration.setVisibility(View.GONE);
        }

        if (daily.isCompleted()) {
            holder.iconBookmark.setVisibility(View.VISIBLE);
            holder.iconStatus.setImageResource(R.drawable.ic_activity_check);
        } else {
            holder.iconBookmark.setVisibility(View.GONE);
            holder.iconStatus.setImageResource(R.drawable.ic_activity_lock);
        }

        if (activity.getImageUrl() != null && !activity.getImageUrl().isEmpty()) {
            String url = activity.getImageUrl().startsWith("/")
                    ? ApiClient.getBaseUrl() + activity.getImageUrl().substring(1)
                    : activity.getImageUrl();
            Glide.with(holder.itemView.getContext())
                    .load(url)
                    .placeholder(R.drawable.rounded_image_background)
                    .centerCrop()
                    .into(holder.imageActivity);
        } else {
            int fallbackImage = fallbackImageForTitle(activity.getTitle(), position);
            if (fallbackImage != 0) {
                holder.imageActivity.setImageResource(fallbackImage);
            } else {
                holder.imageActivity.setImageResource(R.drawable.rounded_image_background);
            }
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onActivityClick(activity);
        });
    }

    @Override
    public int getItemCount() {
        return dailyActivities != null ? dailyActivities.size() : 0;
    }

    private int fallbackImageForTitle(String title, int position) {
        if (title == null) return fallbackImageForPosition(position);
        switch (title) {
            case "Balancing":
                return R.drawable.activity_balancing;
            case "Bath Time Fun":
                return R.drawable.activity_bath_time_fun;
            case "Bedtime Kisses":
                return R.drawable.activity_bedtime_kisses;
            case "Bedtime Stories":
                return R.drawable.activity_bedtime_stories;
            case "Eye Movement":
                return R.drawable.activity_eye_movement;
            case "Recognizing Hands":
                return R.drawable.activity_recognizing_hands;
            case "Cycle Movement":
                return R.drawable.activity_cycle_movement;
            case "Stand-Up On Legs":
                return R.drawable.activity_stand_up_on_legs;
            case "Hand Games":
                return R.drawable.activity_hand_games;
            default:
                return fallbackImageForPosition(position);
        }
    }

    private int fallbackImageForPosition(int position) {
        switch (position % 4) {
            case 0:
                return R.drawable.activity_balancing;
            case 1:
                return R.drawable.activity_bath_time_fun;
            case 2:
                return R.drawable.activity_bedtime_kisses;
            default:
                return R.drawable.activity_bedtime_stories;
        }
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imageActivity;
        ImageView iconBookmark;
        TextView textName;
        TextView textSubCategoryIcon;
        TextView textCategory;
        TextView textDoneByBabies;
        TextView textDuration;
        ImageView iconStatus;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            imageActivity = itemView.findViewById(R.id.imageActivity);
            iconBookmark = itemView.findViewById(R.id.iconBookmark);
            textName = itemView.findViewById(R.id.textActivityName);
            textSubCategoryIcon = itemView.findViewById(R.id.textSubCategoryIcon);
            textCategory = itemView.findViewById(R.id.textActivityCategory);
            textDoneByBabies = itemView.findViewById(R.id.textDoneByBabies);
            textDuration = itemView.findViewById(R.id.textDuration);
            iconStatus = itemView.findViewById(R.id.iconStatus);
        }
    }
}

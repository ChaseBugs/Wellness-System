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
import com.talentbaby.app.models.Article;
import com.talentbaby.app.utils.ApiClient;
import java.util.List;

public class ArticleAdapter extends RecyclerView.Adapter<ArticleAdapter.ViewHolder> {
    private final List<Article> articles;
    private final OnArticleClickListener listener;

    public interface OnArticleClickListener {
        void onArticleClick(Article article);
    }

    public ArticleAdapter(List<Article> articles, OnArticleClickListener listener) {
        this.articles = articles;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_article, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(articles.get(position));
    }

    @Override
    public int getItemCount() {
        return articles.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        private final ImageView imageArticle;
        private final TextView textCategory;
        private final TextView textTitle;
        private final TextView textReadTime;
        private final TextView textViewCount;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            imageArticle = itemView.findViewById(R.id.imageArticle);
            textCategory = itemView.findViewById(R.id.textArticleCategory);
            textTitle = itemView.findViewById(R.id.textArticleTitle);
            textReadTime = itemView.findViewById(R.id.textArticleReadTime);
            textViewCount = itemView.findViewById(R.id.textArticleViewCount);
        }

        void bind(Article article) {
            textTitle.setText(article.getTitle() != null ? article.getTitle() : "");
            textCategory.setText(formatCategory(article.getCategory()));
            textViewCount.setText(article.getViewCount() > 0 ? String.valueOf(article.getViewCount()) : "");

            if (article.getReadTimeMinutes() > 0) {
                textReadTime.setText(itemView.getContext().getString(R.string.min_read, article.getReadTimeMinutes()));
            } else {
                textReadTime.setText("");
            }

            if (article.getImageUrl() != null && !article.getImageUrl().isEmpty()) {
                String imageUrl = article.getImageUrl();
                if (imageUrl.startsWith("/")) {
                    imageUrl = ApiClient.getBaseUrl() + imageUrl.substring(1);
                }
                Glide.with(itemView.getContext())
                        .load(imageUrl)
                        .placeholder(R.drawable.rounded_image_background)
                        .centerCrop()
                        .into(imageArticle);
            } else {
                imageArticle.setImageResource(R.drawable.home_article_today);
            }

            itemView.setOnClickListener(v -> listener.onArticleClick(article));
        }

        private String formatCategory(String category) {
            if (category == null || category.trim().isEmpty()) return "";
            String trimmed = category.trim().replace('_', ' ');
            String[] parts = trimmed.split("\\s+");
            StringBuilder builder = new StringBuilder();
            for (String part : parts) {
                if (part.isEmpty()) continue;
                if (builder.length() > 0) builder.append(' ');
                builder.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1) builder.append(part.substring(1).toLowerCase());
            }
            return builder.toString();
        }
    }
}

package com.talentbaby.app.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Article;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ArticleDetailActivity extends AppCompatActivity {

    private ImageView imageArticle;
    private TextView textCategory;
    private TextView textTitle;
    private TextView textAuthor;
    private TextView textReadTime;
    private TextView textViewCount;
    private TextView textContent;
    private ProgressBar progressBar;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_article_detail);

        findViewById(R.id.btnBackArticle).setOnClickListener(v -> finish());

        apiService = ApiClient.getClient().create(ApiService.class);

        imageArticle = findViewById(R.id.imageArticle);
        textCategory = findViewById(R.id.textCategory);
        textTitle = findViewById(R.id.textTitle);
        textAuthor = findViewById(R.id.textAuthor);
        textReadTime = findViewById(R.id.textReadTime);
        textViewCount = findViewById(R.id.textViewCount);
        textContent = findViewById(R.id.textContent);
        progressBar = findViewById(R.id.progressBar);

        int articleId = getIntent().getIntExtra("article_id", -1);
        if (articleId != -1) {
            loadArticle(articleId);
        } else {
            finish();
        }
    }

    private void loadArticle(int id) {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getArticle(id).enqueue(new Callback<ApiResponse<Article>>() {
            @Override
            public void onResponse(Call<ApiResponse<Article>> call, Response<ApiResponse<Article>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    bindArticle(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Article>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ArticleDetailActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void bindArticle(Article article) {
        textTitle.setText(article.getTitle() != null ? article.getTitle() : "");
        textCategory.setText(formatCategory(article.getCategory()));
        textViewCount.setText(article.getViewCount() > 0 ? String.valueOf(article.getViewCount()) : "");

        String doctor = article.getDoctorName();
        String credentials = article.getDoctorCredentials();
        if (doctor != null && !doctor.isEmpty()) {
            String suffix = credentials != null && !credentials.isEmpty() ? ", " + credentials : "";
            textAuthor.setText(getString(R.string.article_vetted_by, doctor, suffix));
        } else if (article.getAuthor() != null && !article.getAuthor().isEmpty()) {
            textAuthor.setText(article.getAuthor());
        } else {
            textAuthor.setText("");
        }

        if (article.getReadTimeMinutes() > 0) {
            textReadTime.setText(getString(R.string.min_read, article.getReadTimeMinutes()));
        } else {
            textReadTime.setText("");
        }

        String body = article.getContent() != null ? article.getContent()
                : (article.getSummary() != null ? article.getSummary() : "");
        textContent.setText(body);

        if (article.getImageUrl() != null && !article.getImageUrl().isEmpty()) {
            String url = article.getImageUrl().startsWith("/")
                    ? ApiClient.getBaseUrl() + article.getImageUrl().substring(1)
                    : article.getImageUrl();
            Glide.with(this)
                    .load(url)
                    .placeholder(R.drawable.home_article_today)
                    .centerCrop()
                    .into(imageArticle);
        } else {
            imageArticle.setImageResource(R.drawable.home_article_today);
        }
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

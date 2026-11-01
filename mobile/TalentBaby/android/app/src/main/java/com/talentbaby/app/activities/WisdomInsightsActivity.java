package com.talentbaby.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.talentbaby.app.R;
import com.talentbaby.app.adapters.ArticleAdapter;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Article;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class WisdomInsightsActivity extends AppCompatActivity {
    private final List<Article> articles = new ArrayList<>();
    private final Handler searchHandler = new Handler(Looper.getMainLooper());

    private ApiService apiService;
    private ArticleAdapter adapter;
    private RecyclerView recyclerArticles;
    private ProgressBar progressBar;
    private TextView emptyView;
    private EditText searchEdit;
    private TextView tabMonth0To5;
    private TextView tabMonth6To11;
    private TextView[] categoryChips;

    private int selectedMonth = 0;
    private String selectedCategory;
    private Call<ApiResponse<List<Article>>> activeCall;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_wisdom_insights);

        apiService = ApiClient.getClient().create(ApiService.class);
        bindViews();
        setupRecycler();
        setupFilters();
        loadArticles();
    }

    private void bindViews() {
        findViewById(R.id.btnBackWisdom).setOnClickListener(v -> finish());
        recyclerArticles = findViewById(R.id.recyclerWisdomArticles);
        progressBar = findViewById(R.id.progressWisdom);
        emptyView = findViewById(R.id.textWisdomEmpty);
        searchEdit = findViewById(R.id.editWisdomSearch);
        tabMonth0To5 = findViewById(R.id.tabWisdomMonth0To5);
        tabMonth6To11 = findViewById(R.id.tabWisdomMonth6To11);
        categoryChips = new TextView[] {
                findViewById(R.id.chipAll),
                findViewById(R.id.chipBabyHealth),
                findViewById(R.id.chipFunMemories),
                findViewById(R.id.chipGrowth)
        };
    }

    private void setupRecycler() {
        adapter = new ArticleAdapter(articles, article -> {
            Intent intent = new Intent(this, ArticleDetailActivity.class);
            intent.putExtra("article_id", article.getId());
            startActivity(intent);
        });
        recyclerArticles.setLayoutManager(new LinearLayoutManager(this));
        recyclerArticles.setAdapter(adapter);
    }

    private void setupFilters() {
        tabMonth0To5.setOnClickListener(v -> selectMonth(0));
        tabMonth6To11.setOnClickListener(v -> selectMonth(6));

        String[] categories = {null, "baby_health", "fun_memories", "growth"};
        for (int i = 0; i < categoryChips.length; i++) {
            final int index = i;
            categoryChips[i].setOnClickListener(v -> {
                selectedCategory = categories[index];
                updateCategoryChips();
                loadArticles();
            });
        }

        searchEdit.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                loadArticles();
                return true;
            }
            return false;
        });
        searchEdit.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchHandler.removeCallbacksAndMessages(null);
                searchHandler.postDelayed(WisdomInsightsActivity.this::loadArticles, 350);
            }
            @Override public void afterTextChanged(Editable s) {}
        });
    }

    private void selectMonth(int month) {
        if (selectedMonth == month) return;
        selectedMonth = month;
        updateMonthTabs();
        recyclerArticles.animate().alpha(0f).translationY(12f).setDuration(120).withEndAction(() -> {
            loadArticles();
            recyclerArticles.setTranslationY(-10f);
            recyclerArticles.animate().alpha(1f).translationY(0f).setDuration(180).start();
        }).start();
    }

    private void updateMonthTabs() {
        int selectedColor = ContextCompat.getColor(this, android.R.color.white);
        int mutedColor = ContextCompat.getColor(this, R.color.home_text_muted);
        tabMonth0To5.setBackgroundResource(selectedMonth == 0 ? R.drawable.bg_date_selected : android.R.color.transparent);
        tabMonth6To11.setBackgroundResource(selectedMonth == 6 ? R.drawable.bg_date_selected : android.R.color.transparent);
        tabMonth0To5.setTextColor(selectedMonth == 0 ? selectedColor : mutedColor);
        tabMonth6To11.setTextColor(selectedMonth == 6 ? selectedColor : mutedColor);
    }

    private void updateCategoryChips() {
        for (int i = 0; i < categoryChips.length; i++) {
            boolean selected = (selectedCategory == null && i == 0)
                    || (selectedCategory != null && i > 0);
            if (selected && i > 0) {
                String chipText = categoryChips[i].getText().toString().toLowerCase().replace(" & ", "_").replace(' ', '_');
                selected = selectedCategory.equals(chipText)
                        || (selectedCategory.equals("growth") && i == 3);
            }
            categoryChips[i].setBackgroundResource(selected ? R.drawable.bg_white_pill : R.drawable.bg_teal_outline_pill);
            categoryChips[i].setTextColor(ContextCompat.getColor(this,
                    selected ? R.color.article_header : android.R.color.white));
        }
    }

    private void loadArticles() {
        String query = searchEdit.getText() != null ? searchEdit.getText().toString().trim() : "";
        if (activeCall != null) activeCall.cancel();

        progressBar.setVisibility(android.view.View.VISIBLE);
        emptyView.setVisibility(android.view.View.GONE);

        activeCall = query.isEmpty()
                ? apiService.getArticles(selectedCategory, selectedMonth)
                : apiService.searchArticles(query);

        activeCall.enqueue(new Callback<ApiResponse<List<Article>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Article>>> call, Response<ApiResponse<List<Article>>> response) {
                if (call.isCanceled()) return;
                progressBar.setVisibility(android.view.View.GONE);
                articles.clear();
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    articles.addAll(response.body().getData());
                }
                adapter.notifyDataSetChanged();
                recyclerArticles.setVisibility(articles.isEmpty() ? android.view.View.GONE : android.view.View.VISIBLE);
                emptyView.setVisibility(articles.isEmpty() ? android.view.View.VISIBLE : android.view.View.GONE);
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Article>>> call, Throwable t) {
                if (call.isCanceled()) return;
                progressBar.setVisibility(android.view.View.GONE);
                recyclerArticles.setVisibility(android.view.View.GONE);
                emptyView.setVisibility(android.view.View.VISIBLE);
            }
        });
    }
}

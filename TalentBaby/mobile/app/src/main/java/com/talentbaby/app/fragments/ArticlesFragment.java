package com.talentbaby.app.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.talentbaby.app.R;
import com.talentbaby.app.activities.ArticleDetailActivity;
import com.talentbaby.app.adapters.ArticleAdapter;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Article;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;

public class ArticlesFragment extends Fragment {
    private RecyclerView recyclerArticles;
    private ProgressBar progressBar;
    private LinearLayout layoutEmpty;
    private ArticleAdapter articleAdapter;
    private List<Article> articles = new ArrayList<>();
    private ApiService apiService;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_articles, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        apiService = ApiClient.getClient().create(ApiService.class);
        initViews(view);
        setupRecyclerView();
        loadArticles();
    }

    private void initViews(View view) {
        recyclerArticles = view.findViewById(R.id.recyclerArticles);
        progressBar = view.findViewById(R.id.progressBar);
        layoutEmpty = view.findViewById(R.id.layoutEmpty);

        view.findViewById(R.id.btnMenuArticles).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });
    }

    private void setupRecyclerView() {
        articleAdapter = new ArticleAdapter(articles, article -> {
            Intent intent = new Intent(getActivity(), ArticleDetailActivity.class);
            intent.putExtra("article_id", article.getId());
            startActivity(intent);
        });
        recyclerArticles.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerArticles.setAdapter(articleAdapter);
    }

    private void loadArticles() {
        progressBar.setVisibility(View.VISIBLE);
        layoutEmpty.setVisibility(View.GONE);

        apiService.getArticles(null, null).enqueue(new Callback<ApiResponse<List<Article>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Article>>> call, Response<ApiResponse<List<Article>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    articles.clear();
                    articles.addAll(response.body().getData());
                    articleAdapter.notifyDataSetChanged();
                    layoutEmpty.setVisibility(articles.isEmpty() ? View.VISIBLE : View.GONE);
                    recyclerArticles.setVisibility(articles.isEmpty() ? View.GONE : View.VISIBLE);
                } else {
                    layoutEmpty.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Article>>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                layoutEmpty.setVisibility(View.VISIBLE);
                if (getContext() != null) {
                    Toast.makeText(getContext(), getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
}

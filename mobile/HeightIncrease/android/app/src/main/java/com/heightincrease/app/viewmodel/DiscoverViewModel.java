package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.Article;
import com.heightincrease.app.repository.RemoteRepository;

import java.util.Collections;
import java.util.List;

public class DiscoverViewModel extends BaseViewModel<List<Article>> {
    private final RemoteRepository remote;

    public DiscoverViewModel(RemoteRepository remote) {
        this.remote = remote;
        state = Collections.emptyList();
    }

    public void load(Runnable onChange) {
        remote.articles(track(articles -> state = articles, onChange));
    }

    /** The featured article if there is one, otherwise the first. */
    public Article lead() {
        for (Article article : state) {
            if (article.featured) {
                return article;
            }
        }
        return state.isEmpty() ? null : state.get(0);
    }
}

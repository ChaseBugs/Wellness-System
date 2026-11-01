package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.Article;
import com.heightincrease.app.repository.AppRepository;

import java.util.List;

public class DiscoverViewModel extends BaseViewModel<List<Article>> {
    public DiscoverViewModel(AppRepository repository) {
        state = repository.discoverArticles();
    }
}

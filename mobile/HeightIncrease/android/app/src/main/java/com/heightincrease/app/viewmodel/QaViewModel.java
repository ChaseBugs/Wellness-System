package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.QaItem;
import com.heightincrease.app.repository.AppRepository;

import java.util.List;

public class QaViewModel extends BaseViewModel<List<QaItem>> {
    public QaViewModel(AppRepository repository) {
        state = repository.qaItems();
    }
}

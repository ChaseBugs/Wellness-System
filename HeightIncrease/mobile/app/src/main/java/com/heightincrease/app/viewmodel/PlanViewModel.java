package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.PlanCard;
import com.heightincrease.app.repository.AppRepository;

import java.util.List;

public class PlanViewModel extends BaseViewModel<List<PlanCard>> {
    public PlanViewModel(AppRepository repository) {
        state = repository.planCards();
    }
}

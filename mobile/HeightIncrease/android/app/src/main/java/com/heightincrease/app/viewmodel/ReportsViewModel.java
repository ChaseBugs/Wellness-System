package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.ReportMetric;
import com.heightincrease.app.repository.AppRepository;

import java.util.List;

public class ReportsViewModel extends BaseViewModel<List<ReportMetric>> {
    public ReportsViewModel(AppRepository repository) {
        state = repository.reportMetrics();
    }
}

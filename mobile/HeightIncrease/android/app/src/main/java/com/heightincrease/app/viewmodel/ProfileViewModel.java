package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.ProfileOption;
import com.heightincrease.app.repository.AppRepository;

import java.util.List;

public class ProfileViewModel extends BaseViewModel<ProfileViewModel.State> {
    public ProfileViewModel(AppRepository repository) {
        state = new State(repository.settingsOptions(), repository.supportOptions());
    }

    public static class State {
        public final List<ProfileOption> settings;
        public final List<ProfileOption> support;

        public State(List<ProfileOption> settings, List<ProfileOption> support) {
            this.settings = settings;
            this.support = support;
        }
    }
}
